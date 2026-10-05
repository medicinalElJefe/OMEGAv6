import assert from 'node:assert/strict';
import {
  appendCanonicalDevelopmentR467,
  type R467DevelopmentalState
} from '../src7/canonicalDevelopmentalLedgerR467.ts';
import {R457_AUTHORITATIVE_PROOF_FAMILIES} from '../src7/heightenedModeR457.ts';
import {
  R468_AUTHORITY,
  clearDevelopmentalHistoryR468,
  developmentalStateBusSnapshotR468,
  publishDevelopmentalRecordR468,
  replaceDevelopmentalHistoryR468
} from '../src7/developmentalStateBusR468.ts';

const proofs=[...R457_AUTHORITATIVE_PROOF_FAMILIES];
const refs={continuity:'m:c',futurePlasticity:'m:p',contradiction:'m:q',burden:'m:l',recoverability:'m:r',proofCoverage:'m:pc',capabilityCoverage:'m:cc',humanComprehension:'m:h',futureTopologyRetention:'m:f',scarPressure:'m:s'};
function state(ref:string,head:string,patch:Partial<R467DevelopmentalState['metrics']>={}):R467DevelopmentalState{
 const metrics={continuity:.8,futurePlasticity:.8,contradiction:.1,burden:.15,recoverability:.85,proofCoverage:1,capabilityCoverage:1,humanComprehension:.75,futureTopologyRetention:.95,scarPressure:.12,...patch};
 return{stateRef:ref,sourceHead:head,metrics,evidence:{parentStateRef:'external',candidateStateRef:ref,sourceHead:head,metricRefs:refs,proofRefs:proofs},branchRefs:['main'],proofRefs:proofs,scars:[],contradictions:[],recoverable:true,canonicalMutation:false};
}
await clearDevelopmentalHistoryR468();
let snap=await developmentalStateBusSnapshotR468();
assert.equal(snap.status,'EMPTY');
assert.equal(snap.recordCount,0);

const a=state('A','a'.repeat(40));
const b=state('B','b'.repeat(40),{continuity:.84,humanComprehension:.82,scarPressure:.09});
const r0=await appendCanonicalDevelopmentR467({parent:a,candidate:b,authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,timestamp:'2026-10-05T01:00:00.000Z'});
snap=await publishDevelopmentalRecordR468(r0);
assert.equal(snap.status,'VALID');
assert.equal(snap.recordCount,1);
assert.equal(snap.headState,'B');
assert.equal(snap.headHash,r0.recordHash);
assert.equal(snap.headDecision,'TURN');
assert.equal(snap.canonicalAdmissionAuthority,'R125');

const c=state('C','c'.repeat(40),{continuity:.86,humanComprehension:.84,scarPressure:.08});
const r1=await appendCanonicalDevelopmentR467({parent:b,candidate:c,previousGrowth:r0.state.growth,previousAcceleration:r0.state.acceleration,authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,prior:r0,timestamp:'2026-10-05T01:01:00.000Z'});
snap=await publishDevelopmentalRecordR468(r1);
assert.equal(snap.recordCount,2);
assert.equal(snap.headState,'C');

const bad=structuredClone(r1);
bad.previousHash='f'.repeat(64);
await assert.rejects(()=>publishDevelopmentalRecordR468(bad),/invalid developmental lineage/);
snap=await developmentalStateBusSnapshotR468();
assert.equal(snap.recordCount,2,'invalid append must not mutate retained history');

snap=await replaceDevelopmentalHistoryR468([r0,r1]);
assert.equal(snap.status,'VALID');
assert.equal(snap.recordCount,2);
assert.equal(R468_AUTHORITY.canonicalAdmission,'R125');
assert.equal(R468_AUTHORITY.executionAuthority,'NONE');
assert.equal(R468_AUTHORITY.canonicalMutation,false);

console.log('R468 DEVELOPMENTAL STATE BUS PASS · verified R467-only persistence · invalid lineage rejected · runtime snapshot exposed · R125 preserved');
