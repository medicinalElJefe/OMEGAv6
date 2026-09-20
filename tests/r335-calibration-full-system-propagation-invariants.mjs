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
for(const token of ["calibrationPropagationManifestR335","calibrationContext:calibrationPropagationManifestR335()","zero independent empirical voting weight"])assert.ok(fusion.includes(token),'all-mode calibration propagation missing '+token);

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
assert.ok(master.indexOf('R335_PROPAGATION_RECEIPT')>=0&&master.indexOf('R334_B06_PROGRESS_RECEIPT')>master.indexOf('R335_PROPAGATION_RECEIPT'),'R335 propagation receipt must remain ahead of inherited R334 receipt even when newer successor receipts are prepended');

const audit=read('scripts/r314-convergence-audit.mjs');
for(const token of ['Dewey_OMEGA_CERN_Dewey_Relativity_Closure_v3_2026-09-19.csv','Dewey_OMEGA_CERN_ADV02_ADV04_Quantitative_Bridge_2026-09-19.csv','R334 calibrated dataset SHA mismatch','R334 calibrated dataset records'])assert.ok(audit.includes(token),'convergence audit missing '+token);

const workflow=read('.github/workflows/r170-governed-selfbuild.yml');
const engine=read('scripts/r170-selfbuild-engine.mjs');
assert.ok(workflow.includes('tee /tmp/r170-engine-output.log'),'R170 must preserve raw selector stdout for diagnosis');
assert.ok(workflow.includes('OMEGA_R170_PROPOSAL_PATH=/tmp/r170-proposal.json'),'R338 must bind an out-of-band clean proposal artifact');
assert.ok(workflow.includes("R338 selector emitted no clean proposal artifact"),'R338 must fail closed if the clean proposal artifact is absent');
assert.ok(workflow.includes("R338 selector proposal artifact is not a valid status object"),'R338 must validate the clean proposal object before workflow outputs are bound');
assert.ok(engine.includes("const PROPOSAL_PATH=String(process.env.OMEGA_R170_PROPOSAL_PATH||'').trim()"),'R338 engine must own the clean proposal channel');
assert.ok(engine.includes("fs.writeFileSync(PROPOSAL_PATH,body,'utf8')"),'R338 engine must atomically materialize the emitted status object');
assert.ok(!workflow.includes('tee /tmp/r170-proposal.json'),'raw mixed stdout must never again be treated directly as proposal JSON');

function extractFinalTopLevelJson(raw){
 let parsed=null,start=-1,depth=0,inString=false,escaped=false;
 for(let i=0;i<raw.length;i++){
  const ch=raw[i];
  if(start<0){
   if(ch==='{'&&(i===0||raw[i-1]==='\n')){start=i;depth=1;inString=false;escaped=false}
   continue;
  }
  if(inString){
   if(escaped)escaped=false;
   else if(ch==='\\\\')escaped=true;
   else if(ch==='"')inString=false;
   continue;
  }
  if(ch==='"'){inString=true;continue}
  if(ch==='{'){depth++;continue}
  if(ch!=='}')continue;
  depth--;
  if(depth!==0)continue;
  try{
   const candidate=JSON.parse(raw.slice(start,i+1));
   if(candidate&&typeof candidate==='object'&&!Array.isArray(candidate)&&typeof candidate.status==='string')parsed=candidate;
  }catch{}
  start=-1;
 }
 if(!parsed)throw new Error('no proposal');
 return parsed;
}
const contaminated='diagnostic line\n'+JSON.stringify({state:'RESIDUALS_PRESENT'})+'\nextra diagnostic\n'+JSON.stringify({status:'PROPOSE',capsuleId:'SG005',generation:9,nested:{text:'brace } in string'}},null,2)+'\n'+JSON.stringify({diagnostic:true})+'\n';
assert.deepEqual(extractFinalTopLevelJson(contaminated),{status:'PROPOSE',capsuleId:'SG005',generation:9,nested:{text:'brace } in string'}});
assert.throws(()=>extractFinalTopLevelJson('diagnostic only\n'+JSON.stringify({diagnostic:true})+'\n'));

const moduleSource=read('src/system/calibrationPropagationR335.js');
for(const forbidden of ['canonicalMutation:true','canonicalAdmission:true','executionAuthority:true','authorizationAuthority:true'])assert.ok(!moduleSource.includes(forbidden),'R335 propagation gained forbidden authority '+forbidden);

console.log('R335 FULL-SYSTEM CALIBRATION PROPAGATION PASS · exact four-source hash/census identity · runtime/all-mode/truth-envelope/mode/UI/worker/convergence/autonomy consumers bound · R170 mixed-stdout proposal boundary repaired · R125 admission preserved · no raw experimental overwrite or new scientific claim');
