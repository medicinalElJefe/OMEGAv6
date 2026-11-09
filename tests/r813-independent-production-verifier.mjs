import assert from 'node:assert/strict';
import {verifyIndependentProductionR813} from '../scripts/r813-independent-production-verifier.mjs';
const sha='a'.repeat(40),repository='medicinalElJefe/OMEGAv6',productionUrl='https://omegav6.example.workers.dev/';
const run={id:123,head_sha:sha,head_branch:'main',status:'completed',conclusion:'success',event:'push',path:'.github/workflows/ci.yml'};
const json=data=>({ok:true,json:async()=>data});
const fetchImpl=async url=>String(url).startsWith('https://api.github.com/')?json({workflow_runs:[run]}):json({schema:'OMEGA_GOVERNED_BUILD_RECEIPT_V1',source:{sha},promotion:{promotedMergeSha:sha,authority:'GITHUB_MERGE_PARENTS'}});
const verifyBrowser=async()=>({verified:true,observedSha:sha,origin:'https://omegav6.example.workers.dev'});
const base={expectedSha:sha,repository,productionUrl,token:'test-only',fetchImpl,verifyBrowser};
assert.equal((await verifyIndependentProductionR813(base)).verified,true);
for(const change of [
 {token:''},{fetchImpl:async url=>String(url).includes('api.github.com')?json({workflow_runs:[{...run,path:'.github/workflows/other.yml'}]}):json({})},{expectedSha:'bad'},{repository:'wrong'},{productionUrl:'http://omegav6.example.workers.dev/'},
 {productionUrl:'https://evil.example.com/'},{productionUrl:'https://omegav6.example.workers.dev/redirect'},
 {verifyBrowser:undefined},{verifyBrowser:async()=>({verified:true,observedSha:'b'.repeat(40),origin:'https://omegav6.example.workers.dev'})},
 {fetchImpl:async url=>String(url).includes('api.github.com')?json({workflow_runs:[{...run,head_branch:'feature'}]}):json({schema:'OMEGA_GOVERNED_BUILD_RECEIPT_V1',source:{sha},promotion:{promotedMergeSha:sha,authority:'GITHUB_MERGE_PARENTS'}})},
 {fetchImpl:async url=>String(url).includes('api.github.com')?json({workflow_runs:[run]}):json({schema:'OMEGA_GOVERNED_BUILD_RECEIPT_V1',source:{sha:'b'.repeat(40)},promotion:{promotedMergeSha:sha,authority:'GITHUB_MERGE_PARENTS'}})},
 {fetchImpl:async()=>{throw Error('offline')}}
]){
 const result=await verifyIndependentProductionR813({...base,...change});
 assert.equal(result.verified,false,JSON.stringify(change));
}
console.log('R813 PASS: exact GitHub main, live SHA, independent browser, host confinement and fail-closed errors');
