import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {verifyIndependentProductionR813} from './r813-independent-production-verifier.mjs';
import {verifyAndPrepareSuccessorCycleR812} from './r812-selfbuild-successor-cycle.mjs';
const exec=promisify(execFile);
const [manifestPath,outputPath]=process.argv.slice(2);
if(!manifestPath||!outputPath)throw Error('Usage: node scripts/r814-verify-production-and-review.mjs manifest.json output.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const priorState=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const root=process.cwd();
const target=path.resolve(outputPath);
if(!target.startsWith(root+path.sep)||fs.existsSync(target))throw Error('Output must be a new file inside checkout');
const productionUrl=process.env.OMEGA_PUBLIC_URL||'';
const expectedSha=manifest.deploymentProof?.exactPromotedSha;
const repository=process.env.GITHUB_REPOSITORY||'';
const token=process.env.GITHUB_TOKEN||'';
const verifyBrowser=async({url,expectedSha})=>{
 const base=url.replace(/\/$/,'');
 // Inherit the existing real desktop/mobile Playwright proof rather than inventing
 // a success flag or using browser test output supplied by the candidate.
 await exec(process.execPath,['tests/r200-current-browser-proof-e2e.mjs'],{
  cwd:root,timeout:240000,maxBuffer:4*1024*1024,
  env:{...cleanEnv,OMEGA_E2E_URL:base,OMEGA_EXPECTED_SHA:expectedSha}
 });
 return{verified:true,observedSha:expectedSha,origin:new URL(url).origin};
};
const result=await verifyAndPrepareSuccessorCycleR812({
 priorState,manifest,root,
 verifyProduction:({expectedSha:sha})=>verifyIndependentProductionR813({
  expectedSha:sha,repository,productionUrl,token,verifyBrowser
 })
});
if(result.status!=='VERIFIED_FOR_SEPARATE_GOVERNED_REVIEW'){
 console.error(JSON.stringify({status:result.status,reasons:result.reasons}));
 process.exitCode=2;
}else{
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify({schema:'OMEGA_R814_VERIFIED_SUCCESSOR_REVIEW',cycle:result.cycle,proof:result.independentProductionProof},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:result.status,output:target,active:result.cycle.active,sourceMutationAuthorized:result.cycle.sourceMutationAuthorized}));
}
