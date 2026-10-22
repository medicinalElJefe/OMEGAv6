import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 assertContributionFabricR248,
 compileContributionFabricR248,
 R248_AUTHORITY_LAWS,
 R248_CONTRIBUTORS,
 R248_DIMENSIONS,
 R248_SCHEMA
} from '../src/system/contributionFabricR248.js';

assert.equal(assertContributionFabricR248(),true);
assert.equal(R248_SCHEMA,'OMEGA_RELATIVE_CONTRIBUTION_FABRIC_R248');
assert.equal(R248_DIMENSIONS.length,12,'R248 must chart exactly twelve orthogonal contribution dimensions');
assert.deepEqual(R248_DIMENSIONS,['CAPABILITY','AUTHORITY','PROVENANCE','FRESHNESS','LATENCY','RELIABILITY','RESOURCE','CONTRADICTION','EXECUTION','CONTINUITY','OBSERVABILITY','ADMISSION']);
assert.equal(R248_CONTRIBUTORS.filter(x=>x.profile.ADMISSION===100).length,1,'exactly one contributor may carry full admission authority');
assert.equal(R248_CONTRIBUTORS.find(x=>x.profile.ADMISSION===100)?.id,'R125_ADMISSION','R125 must remain sole CanonState admission authority');
assert.equal(R248_CONTRIBUTORS.find(x=>x.id==='R147_DISPATCH')?.profile.EXECUTION,100,'R147 must remain exact dispatch/executor-selection authority');
assert.equal(R248_CONTRIBUTORS.find(x=>x.id==='R141_RETURN')?.profile.EXECUTION,0,'R141 exact return proof may not become execution authority');
assert.equal(R248_CONTRIBUTORS.find(x=>x.id==='R146_HISTORY')?.profile.EXECUTION,0,'R146 durable history may not become execution authority');
assert.ok(R248_AUTHORITY_LAWS.includes('R201_R203_TOMBSTONES_RETIRED'));
assert.ok(R248_AUTHORITY_LAWS.includes('CI_YML_SOLE_CANONICAL_PRODUCTION_WORKER_WRITER'));
assert.ok(R248_AUTHORITY_LAWS.includes('UNOBSERVED_NEVER_PROMOTED_TO_PROVED'));

const sha='1bc6ec0345ddbfd60db4e5c9cdc417596e880577';
const fabric=compileContributionFabricR248({
 canon:{
  runtime:{state:'LIVE',coreLive:true},
  production:{promotedSha:sha},
  hybrid:{state:'DEVICE_PROOF_REQUIRED',authenticatedCurrentDeviceProved:false},
  selfBuild:{active:true}
 },
 raw:{core:{ok:true},receipt:{promotion:{promotedMergeSha:sha}},hybrid:{state:'DEVICE_PROOF_REQUIRED'},selfbuild:{active:true}},
 errors:[]
});
assert.equal(fabric.admission.authority,'R125');
assert.equal(fabric.admission.admittedByR248,false,'R248 may not admit CanonState');
assert.equal(fabric.execution.dispatchAuthority,'R147');
assert.equal(fabric.execution.returnProof,'R141');
assert.equal(fabric.execution.history,'R146');
assert.equal(fabric.execution.r248Executes,false,'R248 is a contribution/proof context, not an executor');
assert.equal(fabric.production.writer,'.github/workflows/ci.yml');
assert.equal(fabric.production.r248Deploys,false,'R248 may not create a second production deployment authority');
assert.equal(fabric.contributors.find(x=>x.id==='CANONICAL_RUNTIME')?.state,'PROVED');
assert.equal(fabric.contributors.find(x=>x.id==='SOURCE_LINEAGE')?.state,'PROVED');
assert.equal(fabric.contributors.find(x=>x.id==='HYBRID_HOST')?.state,'AVAILABLE_UNPROVED','returned Hybrid availability must not fabricate current authenticated PC proof');
assert.equal(fabric.contributors.find(x=>x.id==='EARTH_EVIDENCE')?.state,'UNOBSERVED','absent empirical evidence must remain unobserved');
assert.equal(fabric.contributors.find(x=>x.id==='AI_PROVIDER')?.state,'UNOBSERVED','absent provider evidence must remain unobserved');
assert.ok(fabric.residuals.some(x=>x.id==='HYBRID_HOST'));
assert.ok(fabric.residuals.some(x=>x.id==='EARTH_EVIDENCE'));

const contradiction=compileContributionFabricR248({
 canon:{runtime:{state:'LIVE',coreLive:true},production:{promotedSha:sha},hybrid:{state:'VERIFIED_DEVICE_ONLINE',authenticatedCurrentDeviceProved:false},selfBuild:{active:false}},
 raw:{core:{ok:true},receipt:{},hybrid:{state:'VERIFIED_DEVICE_ONLINE',nativeExecutionClaimed:true}},errors:[]
});
assert.ok(contradiction.contradictions.some(x=>x.id==='HYBRID_STATE_WITHOUT_CURRENT_AUTH'),'positive Hybrid display state without exact current authentication must be held as contradiction');
assert.ok(contradiction.contradictions.some(x=>x.id==='NATIVE_EXECUTION_UNBOUND'),'native execution claim without exact current device proof must block');

const component=fs.readFileSync('src/ContributionFabricR248.tsx','utf8');
const r245=fs.readFileSync('src/FullOverallCanonR245.tsx','utf8');
const workflow=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');
assert.ok(component.includes("data-r248-contribution-fabric='true'"));
assert.ok(component.includes("data-r248-read-only='true'"));
assert.ok(component.includes('compileContributionFabricR248({canon,raw,errors,observedAt})'),'R248 must compile from the existing R245 observation epoch');
for(const forbidden of ['fetch(','api.get(','api.post(','api.put(','api.delete(','setInterval('])assert.ok(!component.includes(forbidden),`R248 must not create its own polling/mutation plane: ${forbidden}`);
assert.ok(r245.includes("import ContributionFabricR248 from './ContributionFabricR248'"));
assert.ok(r245.includes('<ContributionFabricR248 canon={canon} raw={raw} errors={errors} observedAt={observedAt} onNavigate={onNavigate}/>'));
assert.equal((r245.match(/Promise\.allSettled/g)||[]).length,1,'R248 must reuse R245 one-epoch observation rather than add another source fanout');
assert.ok(r245.indexOf('<ContributionFabricR248')>r245.indexOf("aria-label='R245 exact truth partitions'"),'R248 should refine the already partitioned R245 truth epoch');
assert.ok(workflow.includes('node tests/r248-relative-contribution-fabric-invariants.mjs'),'R248 proof must converge into existing R241 workflow rather than creating a 25th workflow authority');
assert.ok(!/^\s*push:/m.test(workflow),'R241/R248 proof plane must not gain a main-push deployment trigger');

console.log('R248 RELATIVE CONTRIBUTION FABRIC PASS · 12 contribution dimensions · 13 specialized contributors · live/unproved/unobserved factorization · contradiction + residual ledger · relation graph · R125/R141/R146/R147/ci.yml authority preserved · R201/R203 retired · no new polling/execution/deployment authority');
