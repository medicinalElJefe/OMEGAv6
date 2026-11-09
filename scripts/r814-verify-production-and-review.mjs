import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {verifyIndependentProductionR813} from './r813-independent-production-verifier.mjs';
import {verifyAndPrepareSuccessorCycleR812} from './r812-selfbuild-successor-cycle.mjs';
import {compileLemmaAtlasR815} from './r815-lemma-chain-atlas.mjs';
const exec=promisify(execFile);
const [manifestPath,outputPath]=process.argv.slice(2);
if(!manifestPath||!outputPath)throw Error('Usage: node scripts/r814-verify-production-and-review.mjs manifest.json output.json');
const root=process.cwd();
if(!/^manifests\/selfbuild\/[A-Za-z0-9_-]+\.json$/.test(manifestPath))throw Error('Untrusted manifest path');
const manifestFile=path.resolve(root,manifestPath);
if(fs.lstatSync(manifestFile).isSymbolicLink()||!fs.statSync(manifestFile).isFile())throw Error('Manifest must be regular');
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
const priorState=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const target=path.resolve(outputPath);
if(!target.startsWith(root+path.sep)||fs.existsSync(target))throw Error('Output must be a new file inside checkout');
const productionUrl=process.env.OMEGA_PUBLIC_URL||'';
const expectedSha=manifest.deploymentProof?.exactPromotedSha;
const repository=process.env.GITHUB_REPOSITORY||'';
const token=process.env.GITHUB_TOKEN||'';
const verifyBrowser=async({url,expectedSha})=>{
 const base=url.replace(/\/$/,'');
 const {OMEGA_WORKER_VERSION_ID:ignoredVersion,OMEGA_WORKER_NAME:ignoredWorker,...cleanEnv}=process.env;
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
const verified=result.status==='VERIFIED_FOR_SEPARATE_GOVERNED_REVIEW';
const proofSha=verified?result.cycle?.predecessor?.productionSha:null;
const {createHash}=await import('node:crypto');
const proofDigest=proofSha?createHash('sha256').update(JSON.stringify(result.independentProductionProof)).digest('hex'):null;
const atlas=compileLemmaAtlasR815({evidence:verified?{
 SOURCE:{status:'PASS',proofSha256:proofDigest},IDENTITY:{status:'PASS',proofSha256:proofDigest},
 BROWSER:{status:'PASS',proofSha256:proofDigest},RELEASE:{status:'PASS',proofSha256:proofDigest}
}: {}});
if(!verified){
 console.error(JSON.stringify({status:result.status,reasons:result.reasons}));
 process.exitCode=2;
}else{
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify({schema:'OMEGA_R814_VERIFIED_SUCCESSOR_REVIEW',cycle:result.cycle,proof:result.independentProductionProof,lemmaAtlasR815:atlas},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:result.status,output:target,active:result.cycle.active,sourceMutationAuthorized:result.cycle.sourceMutationAuthorized}));
}
