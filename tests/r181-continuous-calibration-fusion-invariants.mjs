import fs from 'node:fs';
import assert from 'node:assert/strict';
import {ingestCalibrationR181,readCalibrationStateR181,manifestR181} from '../src/calibration/continuousCalibrationFusionR181.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const core=read('src/calibration/continuousCalibrationFusionR181.js');
const gateway=read('src/calibration/calibrationGatewayR181.js');
const autonomic=read('src/swarm/swarmAutonomicR125.js');
const worker=read('src/workerR8.js');
const sar=read('src/earthSarR181.js');
const earth=read('src/EarthObservatoryR8.tsx');
const panel=read('src/EarthSarPanelR181.tsx');
const wrangler=read('wrangler.jsonc');

for(const token of [
 'OMEGA_CONTINUOUS_CALIBRATION_FUSION_R181','OMEGA_CALIBRATION_EVIDENCE_PACKET_R181','MEASURED:1','DOCUMENT_BACKED:.9','MODEL_INFERRED:.2',
 'S188=CΩ/(Λ+q+0.35Λq+0.05)','Ω=E/(1+Λ+|q|)','REPEATED_SAME_SOURCE_EVIDENCE_GAINS_WEIGHT_SUBLINEARLY',
 'SAME_SOURCE_WEIGHT_DIVIDED_BY_SQRT_PACKET_COUNT','independentSourceCount','evidenceWeakness','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
])must(core.includes(token),`R181 calibration core missing ${token}`);
for(const id of ['1z2MF57R1ObBdxFOcbKVVQ40uqUFC8xjO','13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W','14bSQA2C24rXXgtE9hLrvYWiMO-s_46cT','1QD_PtlygX94eRWsASOgd53y9WVDtqT0J','13mBVKN6Vl7rSFnCRQ7h0c4ZRobtaHgep','1qJSfvB0DXfsjThAc01pDdMp3c1GW-QaTUH5AOeO6lK0'])must(core.includes(id),`R181 reference provenance missing ${id}`);
for(const token of ['/api/calibration/r181','R181_AUTHENTICATED_BRIDGE_REQUIRED','confirmCalibrationIngest','confirmCalibrationRecompute','omega-runtime.internal/continuity','explicitOperatorMetricsOverride:true','automaticFullEscalation:false','R181_EVIDENCE_WEIGHTED_ESTIMATE_NOT_CANON'])must(gateway.includes(token),`R181 gateway missing ${token}`);
must(worker.includes("import {calibrationGatewayR181} from './calibration/calibrationGatewayR181.js'"),'R181 calibration gateway not mounted');
must(worker.includes('const calibration=await calibrationGatewayR181(request,env,url);if(calibration)return calibration;'),'R181 calibration must route additively before inherited R8 fallback');
for(const token of ['/calibration/r181/manifest','/calibration/r181/state','/calibration/r181/ingest','/calibration/r181/recompute','calibrationRevision:R181_REVISION'])must(autonomic.includes(token),`R125 autonomic calibration mount missing ${token}`);
must(autonomic.includes("export const AUTONOMIC_REVISION='R125'"),'R181 must not rename or replace R125 autonomic authority');
must(wrangler.includes('"main": "src/workerR116.js"'),'R181 must preserve the proven R116 Worker spine');
for(const token of ['OMEGA_EARTH_SAR_R181','OBSERVED_METADATA','DERIVED_RELATIVE_FRAME_SCORE_ONLY','UNOBSERVED_RETURNED_SEARCH','Pixel-level radiometry and InSAR require the underlying calibrated products'])must(sar.includes(token),`R181 SAR truth missing ${token}`);
must(earth.includes("import EarthSarPanelR181 from './EarthSarPanelR181'" )&&earth.includes('<EarthSarPanelR181 lat={lat} lon={lon}/>'),'R181 SAR surface not mounted in current Earth workspace');
for(const token of ['RADAR STRUCTURAL EARTH','Returned scene footprints','Provider evidence plane','This is not interferometric coherence or a physical deformation measurement.'])must(panel.includes(token),`R181 SAR UI missing ${token}`);

class MemoryStorage{constructor(){this.map=new Map()}async get(k){return this.map.get(k)}async put(k,v){this.map.set(k,v)}}
const runtime={storage:new MemoryStorage()};
const measured=await ingestCalibrationR181(runtime,{packetId:'measured-a',source:{id:'lab-a',title:'Independent measurement A',authority:'TEST_MEASUREMENT'},evidenceClass:'MEASURED',observedAt:1,domain:'TEST',metrics:{continuity:.82,burden:.20,contradiction:.10},confidence:.95,uncertainty:.05,quality:1,proofRefs:['proof:lab-a']});
assert.equal(measured.ok,true);assert.match(measured.receipt.packetSha256,/^[a-f0-9]{64}$/);assert.equal(measured.packet.derived.mode188.applicable,true);
await ingestCalibrationR181(runtime,{packetId:'repeat-a-1',source:{id:'lab-a',title:'Same source repeated',authority:'TEST_MEASUREMENT'},evidenceClass:'MEASURED',observedAt:2,domain:'TEST',metrics:{continuity:.80,burden:.21,contradiction:.11},confidence:.95,uncertainty:.05,quality:1,proofRefs:['proof:lab-a-2']});
await ingestCalibrationR181(runtime,{packetId:'repeat-a-2',source:{id:'lab-a',title:'Same source repeated again',authority:'TEST_MEASUREMENT'},evidenceClass:'MEASURED',observedAt:3,domain:'TEST',metrics:{continuity:.79,burden:.22,contradiction:.12},confidence:.95,uncertainty:.05,quality:1,proofRefs:['proof:lab-a-3']});
await ingestCalibrationR181(runtime,{packetId:'independent-b',source:{id:'lab-b',title:'Independent replication B',authority:'TEST_REPLICATION'},evidenceClass:'INDEPENDENT_REPLICATION',observedAt:4,domain:'TEST',metrics:{continuity:.68,burden:.30,contradiction:.20},confidence:.90,uncertainty:.10,quality:.95,proofRefs:['proof:lab-b']});
await ingestCalibrationR181(runtime,{packetId:'model-c',source:{id:'model-c',title:'Model estimate',authority:'MODEL'},evidenceClass:'MODEL_INFERRED',observedAt:5,domain:'TEST',metrics:{continuity:.10,burden:.80,contradiction:.70},confidence:.8,uncertainty:.4,quality:.8});
const state=await readCalibrationStateR181(runtime),continuity=state.fusedMetrics.continuity;
assert.equal(state.packetCount,5);assert.equal(state.sourceCount,3);assert.equal(continuity.independentSourceCount,3);assert.equal(continuity.correlationAdjustment,'SAME_SOURCE_WEIGHT_DIVIDED_BY_SQRT_PACKET_COUNT');
assert.ok(continuity.effectiveWeight<continuity.rawEffectiveWeight,'correlation adjustment must reduce repeated-source raw weight');
assert.ok(continuity.value>.50,'strong measured/replicated evidence should dominate low-authority model outlier');
assert.ok(state.residual.weakestFirst.every(x=>Number.isFinite(x.evidenceWeakness)));assert.equal(state.executionBoundary.dispatchAuthorized,false);assert.equal(state.executionBoundary.canonicalAdmissionAuthority,'R125');assert.match(state.fingerprint,/^[a-f0-9]{64}$/);
const duplicate=await ingestCalibrationR181(runtime,{packetId:'measured-a',source:{id:'lab-z'},evidenceClass:'MEASURED',metrics:{continuity:1},proofRefs:['proof:z']});assert.equal(duplicate.ok,false);assert.equal(duplicate.code,'R181_CALIBRATION_PACKET_EXISTS');
const manifest=manifestR181();assert.equal(manifest.correlationAwareFusion,true);assert.equal(manifest.dispatchAuthorized,false);assert.equal(manifest.canonicalMutation,false);assert.equal(manifest.canonicalAdmissionAuthority,'R125');

console.log('OMEGA R181 CONTINUOUS CALIBRATION PASS · durable evidence packets + source-aware weighted fusion + residual/weakest-link planning + Mode188/Ω source boundaries + authenticated persistence + SAR observation preserved · R116/R125/R147 authorities unchanged');
