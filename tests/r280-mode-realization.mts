import assert from 'node:assert/strict';
import {initCorpusPack,corpusState} from '../src/corpusRuntime.ts';
import {compileModeRealizationRegistryR280,R280_MODE_REALIZATION_SCHEMA} from '../src/modeRealizationRegistryR280.ts';
import {compileHeavyBioStateR280,heavyBio20736AddressR280,heavyBioProjectedAddressR280,HEAVY_BIO_PROJECTED_STATE_COUNT_R280} from '../src/heavyBioRuntimeR280.ts';
import {phaseElasticityR280,ctdeR280,ledgeredPhaseMetrologyR280,turnAtlasR280,continuanceShellR280,nonFlatPredictionR280} from '../src/continuityModesR280.ts';

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
const mother=registry.rows.find(row=>row.name==='Deep Mother Mode');
assert.ok(mother&&mother.stage==='IMPLEMENTED','Deep Mother must execute once its exact Full Canon formal-atlas inputs are recoverable');
assert.ok(mother?.sourceRows.some(row=>row.id==='M015'&&row.state==='EXECUTED_EXACT'),'Deep Mother M015 must carry exact formal-atlas execution provenance');
assert.ok(!mother?.gaps.some(gap=>gap.includes('Care')),'obsolete Care proxy gate must not survive exact Full Canon input recovery');
const father=registry.rows.find(row=>row.name==='High Father Mode');
assert.ok(father&&father.stage==='IMPLEMENTED','High Father must execute once its exact Full Canon formal-atlas inputs are recoverable');
assert.ok(father?.sourceRows.some(row=>row.id==='M016'&&row.state==='EXECUTED_EXACT'),'High Father M016 must carry exact formal-atlas execution provenance');
assert.ok(!father?.gaps.some(gap=>gap.includes('Aim')||gap.includes('Proof')),'obsolete Aim/Proof proxy gate must not survive exact Full Canon input recovery');
assert.ok(registry.rows.some(row=>row.name==='Mode 188'&&row.stage==='PROMOTED'),'Mode 188 exact source runtime must remain promoted');
assert.ok(registry.rows.some(row=>row.name==='20736D Atlas Mode'&&row.executionClass==='DOMAIN_RUNTIME'));
for(const mode of ['Phase Elasticity Field','CTDE','Continuance Shell','Turn–Atlas Formalism','Ledgered Phase Metrology','Non-Flat Prediction Engine']){
  assert.ok(registry.rows.some(row=>row.name===mode&&row.stage==='TESTED'),`${mode} must be runtime-bound and tested`);
}

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

const evidence=[{id:'T1',source:'R280 invariant fixture',observedAt:'2026-09-10T12:00:00Z',verified:true}];
const stable={continuity:.82,plasticity:.74,contradiction:.12,burden:.18,scar:.10};
const stressed={continuity:.38,plasticity:.28,contradiction:.76,burden:.85,scar:.62};

const pefHold=phaseElasticityR280({phase:10,state:stressed,stiffness:1,priorElasticDebt:.7,loadHistory:[]});
assert.equal(pefHold.decision,'HOLD','PEF must not admit unaudited/missing-evidence state');
assert.equal(pefHold.gates.snap,false,'PEF snap must require load history');
const pef=phaseElasticityR280({phase:10,state:stressed,stiffness:1,priorElasticDebt:.8,loadHistory:[.7,.8],evidence});
assert.equal(pef.gates.hasLoadHistory,true);
assert.equal(pef.gates.auditable,true);
assert.ok(pef.primitives.elasticDebt>=0&&pef.primitives.elasticDebt<=1);

const ctdeLow=ctdeR280({state:stable});
const ctdeHigh=ctdeR280({state:stressed});
assert.equal(ctdeLow.resolution,144);
assert.equal(ctdeHigh.resolution,20736);
assert.match(ctdeHigh.truthBoundary,/not physical dimensions/i);

const lpmBad=ledgeredPhaseMetrologyR280({id:'',phase:4,instrument:'',metric:'x',value:1,unit:'',observedAt:'bad',source:'',verified:false},stable);
assert.equal(lpmBad.valid,false);
assert.equal(lpmBad.decision,'HOLD');
const lpm=ledgeredPhaseMetrologyR280({id:'M1',phase:4,instrument:'fixture',metric:'continuity',value:.82,unit:'ratio',observedAt:'2026-09-10T12:00:00Z',source:'R280 test',verified:true},stable);
assert.equal(lpm.valid,true);
assert.equal(lpm.contradictionPreserved,stable.contradiction);
assert.equal(lpm.recordHash.length,8);

const invariants={identity:'omega',authority:'R125'};
const turnBroken=turnAtlasR280({state:stable,phase:11,declaredInvariants:invariants,candidateInvariants:{identity:'other',authority:'R125'},evidence});
assert.equal(turnBroken.decision,'HOLD','broken invariant must never be promoted into a turn');
const turn=turnAtlasR280({state:stable,phase:11,declaredInvariants:invariants,candidateInvariants:invariants,evidence});
assert.notEqual(turn.decision,'HOLD');
assert.equal(turn.invariant.preserved,true);

const continuanceNoEvidence=continuanceShellR280({state:stable,phase:12});
assert.equal(continuanceNoEvidence.decision,'HOLD');
const continuance=continuanceShellR280({state:stable,phase:12,evidence});
assert.equal(continuance.admissible,true);
assert.equal(continuance.decision,'STAY');

const nonFlatNoEvidence=nonFlatPredictionR280({state:stable,memory:.5});
assert.equal(nonFlatNoEvidence.decision,'HOLD');
const nonFlat=nonFlatPredictionR280({state:stable,memory:.5,alpha:.8,beta:.2,evidence});
assert.notEqual(nonFlat.decision,'HOLD');
assert.ok(nonFlat.memory.next>=0&&nonFlat.memory.next<=1);
assert.notEqual(nonFlat.memory.next,0,'history must carry instead of being erased');

console.log('R308/R280 PASS · realization registry + recovered Full Canon Mother/Father formal operators + Heavy Bio + PEF/CTDE/LPM/Turn–Atlas/Continuance/Non-Flat runtime boundaries');