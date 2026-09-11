import assert from 'node:assert/strict';
import {initCorpusPack,corpusState} from '../src/corpusRuntime.ts';
import {compileModeRealizationRegistryR280,R280_MODE_REALIZATION_SCHEMA} from '../src/modeRealizationRegistryR280.ts';
import {compileHeavyBioStateR280,heavyBio20736AddressR280,heavyBioProjectedAddressR280,HEAVY_BIO_PROJECTED_STATE_COUNT_R280} from '../src/heavyBioRuntimeR280.ts';

await initCorpusPack();
const record=corpusState(0);
const registry=compileModeRealizationRegistryR280(record);
assert.equal(registry.schema,R280_MODE_REALIZATION_SCHEMA);
assert.equal(registry.authorityCount,62);
assert.equal(registry.summary.lensExecutable,62);
assert.equal(registry.canonicalMutation,false);
assert.equal(registry.canonicalAdmissionAuthority,'R125');
assert.ok(registry.summary.domainExecutable>0,'at least one real domain/source executor must be bound');
assert.ok(registry.rows.every(row=>['CHARTED','IMPLEMENTED','TESTED','PROMOTED','GATED'].includes(row.stage)));
assert.ok(registry.rows.some(row=>row.name==='HEAVY BIO MODE REVIEW'&&row.stage==='TESTED'),'Heavy Bio must be implemented and test-bound');
assert.ok(registry.rows.some(row=>row.name==='Deep Mother Mode'&&row.stage==='GATED'),'Deep Mother must stay gated when Care is absent');
assert.ok(registry.rows.some(row=>row.name==='High Father Mode'&&row.stage==='GATED'),'High Father must stay gated when Aim/Proof are absent');
assert.ok(registry.rows.some(row=>row.name==='Mode 188'&&row.stage==='PROMOTED'),'Mode 188 exact source runtime must remain promoted');
assert.ok(registry.rows.some(row=>row.name==='20736D Atlas Mode'&&row.executionClass==='DOMAIN_RUNTIME'));

assert.equal(heavyBio20736AddressR280({domain:1,phase:1,regulation:1,layer:1}),0);
assert.equal(heavyBio20736AddressR280({domain:12,phase:12,regulation:12,layer:12}),20735);
assert.equal(heavyBioProjectedAddressR280({domain:1,phase:1,regulation:1,layer:1,hiddenAxis:1,observer:1,star:1,operator:1,timeScale:1,environment:1}),'1');
assert.equal(heavyBioProjectedAddressR280({domain:12,phase:12,regulation:12,layer:12,hiddenAxis:12,observer:12,star:12,operator:12,timeScale:12,environment:12}),HEAVY_BIO_PROJECTED_STATE_COUNT_R280.toString());

const noEvidence=compileHeavyBioStateR280({
  coordinates:{domain:5,phase:4,regulation:3,layer:12},
  state:{continuity:.8,plasticity:.6,contradiction:.2,burden:.35,scar:.15,conductance:.7,coherence:.75}
});
assert.equal(noEvidence.model.decision,'HOLD','missing evidence must not synthesize a biological decision');
assert.equal(noEvidence.evidence.valid,0);
assert.equal(noEvidence.canonicalMutation,false);
assert.match(noEvidence.truthBoundary,/does not infer disease/i);

const observed=compileHeavyBioStateR280({
  coordinates:{domain:5,phase:4,regulation:3,layer:12,hiddenAxis:2,observer:3,star:4,operator:5,timeScale:6,environment:7},
  state:{continuity:.8,plasticity:.7,contradiction:.12,burden:.2,scar:.1,conductance:.8,coherence:.82},
  evidence:[{id:'E1',source:'test measurement',observedAt:'2026-09-10T12:00:00Z',domain:5,variable:'example',value:1,unit:'arb',uncertainty:.05,evidenceClass:'MEASUREMENT',verified:true}],
  thresholds:{minimumEvidence:.2,turn:.25,stay:.5},
  event:{impact:.1,persistence:.5}
});
assert.equal(observed.evidence.valid,1);
assert.notEqual(observed.model.decision,'HOLD');
assert.ok(Number(observed.atlas.projectedAddress)>=1);
assert.ok(observed.continuity.scarCarry.next>=0&&observed.continuity.scarCarry.next<=1);
assert.equal(observed.model.authority,'MODEL_DERIVED_COORDINATION_SCORE_NOT_MEDICAL_MEASUREMENT');

console.log('R280 PASS · 62-authority realization registry + evidence-gated Heavy Bio runtime + 20,736/61,917,364,224 addressing boundaries');
