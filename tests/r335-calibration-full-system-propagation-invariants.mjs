import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  R334_RELEASE_ID,
  R334_SOURCE_MANIFEST,
  calibrationManifestR334
} from '../src/system/calibrationR334.js';
import {
  R335_REVISION,
  R335_CALIBRATION_CONSUMERS,
  R335_PROPAGATION_RECEIPT,
  calibrationPropagationManifestR335
} from '../src/system/calibrationPropagationR335.js';

const expected={
 MASTER_V3:{rows:4260,columns:68,sha256:'c2a5966b0a4aa3aa2de2acd18491e2333653290eaa312058fd1dfe0f1446a18d'},
 BRIDGE_V2:{rows:4237,columns:68,sha256:'2cfab8182563c598e86c30a18de418331c2319839f1900a03f6687c2fe01a3d2'},
 CLOSURE_V3:{rows:23,columns:14,sha256:'98a0ac1c820e10aef307364e1efc996e3e3167d9192bca96352cda75f57b02fb'},
 ADV02_ADV04:{rows:36,columns:18,sha256:'6eb08be1ba49e1dd234c1ea621ce86ddf976add16fba1fb4dbfa58b0bc317f34'},
};
assert.equal(R334_RELEASE_ID,'DEWEY_OMEGA_CERN_RELATIVITY_CLOSURE_2026-09-19');
assert.equal(R334_SOURCE_MANIFEST.length,4);
for(const row of R334_SOURCE_MANIFEST){
 const e=expected[row.id];
 assert.ok(e,'unexpected R334 dataset '+row.id);
 assert.equal(row.rows,e.rows,row.id+' row census drift');
 assert.equal(row.columns,e.columns,row.id+' column census drift');
 assert.equal(row.sha256,e.sha256,row.id+' uploaded-source SHA drift');
}
const r334=calibrationManifestR334();
assert.equal(r334.canonicalMutation,false);
assert.equal(r334.canonicalAdmissionAuthority,'R125');

const r335=calibrationPropagationManifestR335();
assert.equal(R335_REVISION,'R335');
assert.equal(r335.calibrationRelease,R334_RELEASE_ID);
assert.equal(r335.sourceCount,4);
assert.equal(r335.propagationState,'FULL_RELEVANT_SYSTEM_BINDING');
assert.equal(r335.sourceExactPreserved,true);
assert.equal(r335.rawExperimentalOverwrite,false);
assert.equal(r335.canonicalMutation,false);
assert.equal(r335.canonicalAdmissionAuthority,'R125');
assert.equal(R335_PROPAGATION_RECEIPT.state,'PROPAGATION_CLOSED');
assert.equal(R335_PROPAGATION_RECEIPT.canonicalAdmission,false);

const requiredConsumers=[
 'CAPABILITY_DATASET_REGISTRY','MODE_REALIZATION_REGISTRY','ALL_MODES_TRUTH_FUSION','UNIVERSAL_TRUTH_ENVELOPE','RELATIVITY_RUNTIME',
 'RELATIVITY_SURFACE','RELATIONAL_RUNTIME','WORKER_MANIFEST','CONVERGENCE_MASTER',
 'CONVERGENCE_AUDIT','R170_AUTONOMY'
];
assert.deepEqual(R335_CALIBRATION_CONSUMERS.map(x=>x.id),requiredConsumers);

const read=p=>fs.readFileSync(p,'utf8');
const atlas=read('src/capabilityAtlasR43.ts');
for(const token of ['CERN_MASTER_R334','CERN_BRIDGE_R334','CERN_CLOSURE_R334','CERN_ADV_R334'])assert.ok(atlas.includes(token),'capability atlas missing '+token);

const modes=read('src/modeRealizationRegistryR280.ts');
for(const token of ["calibrationManifestR334","calibrationContext:{...calibrationManifestR334(),propagationRevision:'R335'","'OVERALL CANON MODE'","'Dewey Calculus Mode'","src/system/calibrationR334.js"])assert.ok(modes.includes(token),'mode propagation missing '+token);

const fusion=read('src/allModesTruthFusionR151.ts');
for(const token of ["calibrationPropagationManifestR335","calibrationContext:calibrationPropagationManifestR335()","ZERO independent empirical voting weight"])assert.ok(fusion.includes(token),'all-mode calibration propagation missing '+token);

const truthEnvelope=read('src/universalTruthEnvelopeR152.ts');
for(const token of ["calibrationPropagationManifestR335","calibrationContext:calibrationPropagationManifestR335()","cannot promote reconstructed or derived quantities into empirical evidence"])assert.ok(truthEnvelope.includes(token),'truth-envelope calibration propagation missing '+token);

const physics=read('src/physicsRelativityRuntimeR132.ts');
assert.ok(physics.includes("import {calibratedRelativityR334}"));
assert.ok(physics.includes('calibration:calibratedRelativityR334()'));

const surface=read('src/RelativityLab.tsx');
assert.ok(surface.includes("import RelativityCalibrationR334"));
assert.ok(surface.includes('<RelativityCalibrationR334/>'));

const relational=read('src/system/proofGovernedRelationalRuntimeR334.js');
assert.ok(relational.includes('calibration:calibratedRelativityR334()'));
assert.ok(relational.includes("canonicalAdmission:false"));

const worker=read('src/workerR116.js');
assert.ok(worker.includes("calibrationPropagationManifestR335"));
assert.ok(worker.includes('calibrationPropagation:calibrationPropagationManifestR335()'));

const master=read('src/convergenceMasterR314.ts');
assert.ok(master.includes('R335_PROPAGATION_RECEIPT'));
assert.ok(master.includes('promotionReceipts:[R335_PROPAGATION_RECEIPT,R334_B06_PROGRESS_RECEIPT'));

const audit=read('scripts/r314-convergence-audit.mjs');
for(const token of ['Dewey_OMEGA_CERN_Dewey_Relativity_Closure_v3_2026-09-19.csv','Dewey_OMEGA_CERN_ADV02_ADV04_Quantitative_Bridge_2026-09-19.csv','R334 calibrated dataset SHA mismatch','R334 calibrated dataset records'])assert.ok(audit.includes(token),'convergence audit missing '+token);

const workflow=read('.github/workflows/r170-governed-selfbuild.yml');
assert.ok(workflow.includes('tee /tmp/r170-engine-output.log'),'R170 must preserve raw selector stdout for diagnosis');
assert.ok(workflow.includes("fs.writeFileSync('/tmp/r170-proposal.json',JSON.stringify(parsed,null,2)+'\\n')"),'R170 must materialize a clean parsed proposal');
assert.ok(workflow.includes("R170 selector emitted no parseable final top-level JSON proposal"),'R170 must fail closed if no proposal JSON exists');
assert.ok(!workflow.includes('tee /tmp/r170-proposal.json'),'raw mixed stdout must never again be treated directly as proposal JSON');

function extractFinalTopLevelJson(raw){
 const starts=[];
 if(raw.startsWith('{'))starts.push(0);
 for(let i=0;i<raw.length-1;i++)if(raw[i]==='\n'&&raw[i+1]==='{')starts.push(i+1);
 const end=raw.lastIndexOf('}');
 let parsed=null;
 for(let i=starts.length-1;i>=0&&!parsed;i--){
  if(end<starts[i])continue;
  try{parsed=JSON.parse(raw.slice(starts[i],end+1))}catch{}
 }
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('no proposal');
 return parsed;
}
const contaminated='diagnostic line\n'+JSON.stringify({state:'RESIDUALS_PRESENT'})+'\nextra diagnostic\n'+JSON.stringify({status:'PROPOSE',capsuleId:'SG005',generation:9},null,2)+'\n';
assert.deepEqual(extractFinalTopLevelJson(contaminated),{status:'PROPOSE',capsuleId:'SG005',generation:9});
assert.throws(()=>extractFinalTopLevelJson('diagnostic only\n'));

const moduleSource=read('src/system/calibrationPropagationR335.js');
for(const forbidden of ['canonicalMutation:true','canonicalAdmission:true','executionAuthority:true','authorizationAuthority:true'])assert.ok(!moduleSource.includes(forbidden),'R335 propagation gained forbidden authority '+forbidden);

console.log('R335 FULL-SYSTEM CALIBRATION PROPAGATION PASS · exact four-source hash/census identity · runtime/all-mode/truth-envelope/mode/UI/worker/convergence/autonomy consumers bound · R170 mixed-stdout proposal boundary repaired · R125 admission preserved · no raw experimental overwrite or new scientific claim');
