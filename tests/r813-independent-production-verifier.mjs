import assert from 'node:assert/strict';
import {verifyIndependentProductionR813} from '../scripts/r813-independent-production-verifier.mjs';
const sha='a'.repeat(40),repository='medicinalElJefe/OMEGAv6',productionUrl='https://omegav6.example.workers.dev/';
const run={id:123,head_sha:sha,head_branch:'main',status:'completed',conclusion:'success',event:'push'};
const json=data=>({ok:true,json:async()=>data});
const fetchImpl=async url=>String(url).startsWith('https://api.github.com/')?json({workflow_runs:[run]}):json({gitSha:sha,production:true,browserVerified:true});
const verifyBrowser=async()=>({verified:true,observedSha:sha,origin:'https://omegav6.example.workers.dev'});
const base={expectedSha:sha,repository,productionUrl,token:'test-only',fetchImpl,verifyBrowser};
assert.equal((await verifyIndependentProductionR813(base)).verified,true);
for(const change of [
 {token:''},{expectedSha:'bad'},{repository:'wrong'},{productionUrl:'http://omegav6.example.workers.dev/'},
 {productionUrl:'https://evil.example.com/'},{productionUrl:'https://omegav6.example.workers.dev/redirect'},
 {verifyBrowser:undefined},{verifyBrowser:async()=>({verified:true,observedSha:'b'.repeat(40),origin:'https://omegav6.example.workers.dev'})},
 {fetchImpl:async url=>String(url).includes('api.github.com')?json({workflow_runs:[{...run,head_branch:'feature'}]}):json({gitSha:sha,production:true})},
 {fetchImpl:async url=>String(url).includes('api.github.com')?json({workflow_runs:[run]}):json({gitSha:'b'.repeat(40),production:true})},
 {fetchImpl:async()=>{throw Error('offline')}}
]){
 const result=await verifyIndependentProductionR813({...base,...change});
 assert.equal(result.verified,false,JSON.stringify(change));
}
console.log('R813 PASS: exact GitHub main, live SHA, independent browser, host confinement and fail-closed errors');
