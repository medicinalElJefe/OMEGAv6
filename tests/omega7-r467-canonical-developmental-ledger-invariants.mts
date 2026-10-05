import assert from 'node:assert/strict';
import {
  R467_SCHEMA,
  R467_GENESIS_HASH,
  appendCanonicalDevelopmentR467,
  verifyCanonicalDevelopmentR467,
  type R467DevelopmentalState
} from '../src7/canonicalDevelopmentalLedgerR467.ts';
import {R457_AUTHORITATIVE_PROOF_FAMILIES} from '../src7/heightenedModeR457.ts';

const proofs=[...R457_AUTHORITATIVE_PROOF_FAMILIES];
const refs={
 continuity:'r:continuity',futurePlasticity:'r:plasticity',contradiction:'r:contradiction',
 burden:'r:burden',recoverability:'r:recoverability',proofCoverage:'r:proof',
 capabilityCoverage:'r:capability',humanComprehension:'r:human',
 futureTopologyRetention:'r:future',scarPressure:'r:scar'
};

function state(stateRef:string,sourceHead:string,patch:Partial<R467DevelopmentalState['metrics']>={},scars:string[]=[]):R467DevelopmentalState{
 const metrics={
  continuity:.80,futurePlasticity:.78,contradiction:.12,burden:.18,recoverability:.84,
  proofCoverage:1,capabilityCoverage:1,humanComprehension:.72,futureTopologyRetention:.94,scarPressure:.14,
  ...patch
 };
 return{
  stateRef,sourceHead,metrics,
  evidence:{parentStateRef:'external-parent',candidateStateRef:stateRef,sourceHead,metricRefs:refs,proofRefs:proofs},
  branchRefs:['main','candidate:'+stateRef],proofRefs:proofs,scars,contradictions:[],recoverable:true,canonicalMutation:false
 };
}

const h1='a'.repeat(40),h2='b'.repeat(40),h3='c'.repeat(40);
const s0=state('S0',h1);
const s1=state('S1',h2,{continuity:.84,futurePlasticity:.82,recoverability:.88,humanComprehension:.80,scarPressure:.10},['R241:STALE_HEAD_PRUNED']);
const r0=await appendCanonicalDevelopmentR467({
 parent:s0,candidate:s1,authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,timestamp:'2026-10-05T00:00:00.000Z'
});
assert.equal(r0.schema,R467_SCHEMA);
assert.equal(r0.index,0);
assert.equal(r0.previousHash,R467_GENESIS_HASH);
assert.equal(r0.recordHash.length,64);
assert.equal(r0.state.S_t.stateRef,'S0');
assert.equal(r0.state.S_t1.stateRef,'S1');
assert.ok(r0.state.scar.carried.includes('R241:STALE_HEAD_PRUNED'));
assert.equal(r0.canonicalAdmissionAuthority,'R125');
assert.equal(r0.canonicalMutation,false);
assert.equal(r0.decision,'TURN');
assert.equal(r0.promotionAllowed,true);

const s2=state('S2',h3,{continuity:.85,futurePlasticity:.83,recoverability:.89,humanComprehension:.84,scarPressure:.09},['R388:NO_SAFE_PATCH']);
const r1=await appendCanonicalDevelopmentR467({
 parent:s1,candidate:s2,previousGrowth:r0.state.growth,previousAcceleration:r0.state.acceleration,
 authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,prior:r0,timestamp:'2026-10-05T00:01:00.000Z'
});
assert.equal(r1.index,1);
assert.equal(r1.previousHash,r0.recordHash);
assert.equal(r1.state.S_t.stateRef,'S1');
assert.equal(r1.state.S_t1.stateRef,'S2');
assert.ok(Number.isFinite(r1.state.curvature));
assert.ok(Number.isFinite(r1.viability));

const verified=await verifyCanonicalDevelopmentR467([r0,r1]);
assert.equal(verified.valid,true);
assert.equal(verified.records,2);
assert.equal(verified.headHash,r1.recordHash);
assert.equal(verified.headState,'S2');

const tampered=structuredClone(r1);
tampered.state.S_t1.metrics.continuity=.01;
const rejected=await verifyCanonicalDevelopmentR467([r0,tampered]);
assert.equal(rejected.valid,false);
assert.ok(rejected.failures.includes('HASH:1'));

const collapse=state('S3','d'.repeat(40),{futureTopologyRetention:.3,recoverability:.4});
const r2=await appendCanonicalDevelopmentR467({
 parent:s2,candidate:collapse,authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,prior:r1
});
assert.equal(r2.decision,'ESCALATE');
assert.equal(r2.promotionAllowed,false);
assert.ok(r2.hardVetoes.includes('FUTURE_TOPOLOGY_COLLAPSED'));
assert.ok(r2.state.scar.carried.some(x=>x==='VETO:FUTURE_TOPOLOGY_COLLAPSED'));

await assert.rejects(()=>appendCanonicalDevelopmentR467({
 parent:s0,candidate:s2,authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,prior:r1
}),/lineage discontinuity/);

console.log('R467 CANONICAL DEVELOPMENTAL LEDGER PASS · hash-linked lineage · R457 derivatives · scar/contradiction carry · continuity cone · R125 authority preserved');
