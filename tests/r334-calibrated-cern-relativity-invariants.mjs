import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {R334_DATASETS,R334_CALIBRATED_RELATIVITY_SNAPSHOT,R334_CALIBRATION_RECEIPT,R334_CALIBRATION_LAWS,calibratedCernRelativityManifestR334} from '../src/system/calibratedCernRelativityR334.ts';

const closurePath='public/canon/Dewey_OMEGA_CERN_Dewey_Relativity_Closure_v3_2026-09-19.csv';
const bridgePath='public/canon/Dewey_OMEGA_CERN_ADV02_ADV04_Quantitative_Bridge_2026-09-19.csv';
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');

function parseCsv(source){
 const matrix=[],row=[],field=[];let quoted=false;
 const fd=()=>{row.push(field.join(''));field.length=0},rd=()=>{fd();matrix.push([...row]);row.length=0};
 for(let i=0;i<source.length;i++){const ch=source[i];if(quoted){if(ch==='"'){if(source[i+1]==='"'){field.push('"');i++}else quoted=false}else field.push(ch);continue}if(ch==='"'){quoted=true;continue}if(ch===','){fd();continue}if(ch==='\n'){rd();continue}if(ch==='\r'){if(source[i+1]==='\n')continue;rd();continue}field.push(ch)}
 if(field.length||row.length)rd();if(quoted)throw new Error('unterminated CSV');
 const header=matrix.shift()||[];return matrix.filter(x=>x.length>1||x[0]).map(values=>Object.fromEntries(header.map((key,i)=>[key,values[i]??''])));
}
const closure=parseCsv(fs.readFileSync(closurePath,'utf8')),bridge=parseCsv(fs.readFileSync(bridgePath,'utf8'));
assert.equal(sha(closurePath),R334_DATASETS.relativityClosureV3.repositoryNormalizedSha256);
assert.equal(sha(bridgePath),R334_DATASETS.adv02Adv04Bridge.repositoryNormalizedSha256);
assert.equal(closure.length,23);assert.equal(bridge.length,36);
assert.equal(new Set(closure.map(x=>x.row_id)).size,23);assert.equal(new Set(bridge.map(x=>x.row_id)).size,36);
assert.equal(R334_CALIBRATION_RECEIPT.calibratedRows,59);
assert.equal(R334_CALIBRATION_RECEIPT.masterCompositionVerified,true);
assert.equal(R334_CALIBRATION_RECEIPT.sourceExactR328Separate,true);
assert.equal(R334_CALIBRATION_RECEIPT.canonicalAdmission,false);
assert.equal(R334_CALIBRATION_RECEIPT.externalReplicationGate,'OPEN');
assert.equal(R334_DATASETS.advancedMasterV3.records,4260);
assert.equal(R334_DATASETS.advancedQuantitativeBridgeV2.records,4237);
assert.equal(R334_DATASETS.advancedMasterV3.records-R334_DATASETS.advancedQuantitativeBridgeV2.records,23);
assert.ok(R334_DATASETS.advancedMasterV3.composition.includes('4,237-row prefix'));

const byRel=Object.fromEntries(closure.map(x=>[x.row_id,x])),byQ=Object.fromEntries(bridge.map(x=>[x.row_id,x]));
assert.equal(byRel['REL-0001'].status,'CORRECTION ESTABLISHED');
assert.equal(byRel['REL-0003'].evidence_class,'RELATIVITY_EQUIVALENT_COORDINATE');
assert.match(byRel['REL-0003'].truth_boundary,/not an ATLAS-published observable or new physical primitive/i);
assert.equal(Number(byRel['REL-0011'].value),R334_CALIBRATED_RELATIVITY_SNAPSHOT.commonState.fL);
assert.equal(Number(byRel['REL-0012'].value),R334_CALIBRATED_RELATIVITY_SNAPSHOT.commonState.cParallel);
assert.equal(Number(byRel['REL-0017'].value),R334_CALIBRATED_RELATIVITY_SNAPSHOT.commonState.contradictionChi2);
assert.equal(Number(byRel['REL-0020'].value),R334_CALIBRATED_RELATIVITY_SNAPSHOT.commonState.physicalityResidual);
assert.equal(byRel['REL-0020'].status,'PASS');
assert.equal(byRel['REL-0030'].status,'CLOSED_AS_STRUCTURED_OBJECT');
assert.equal(byRel['REL-0034'].value,'DEWEY_RELATIVITY_CLOSURE_RESOLVED; NATIVE_ATLAS_REPLICATION_REMAINS_EXTERNAL_VALIDATION');

assert.equal(byQ['QBR-0001'].status,'OPEN_PROOF_GATE');
assert.equal(byQ['QBR-0001'].value,'BLOCKED_EXTERNAL_NUMERICAL_INPUTS');
assert.equal(byQ['QBR-0007'].value,'REQUIRED');
assert.equal(byQ['QBR-0014'].evidence_class,'MATHEMATICAL_RESULT');
assert.equal(byQ['QBR-0030'].evidence_class,'PRIMARY_REPORTED');
assert.equal(byQ['QBR-0033'].evidence_class,'DERIVED_APPROXIMATION');
assert.equal(byQ['QBR-0042'].status,'FAILS_AT_CENTRAL_POINT');
assert.equal(byQ['QBR-0043'].status,'PASS');
assert.equal(Number(byQ['QBR-0037'].value),R334_CALIBRATED_RELATIVITY_SNAPSHOT.observedCrossRepresentation.atlasCmsCompatibilityP);
assert.equal(byQ['QBR-0061'].status,'NEGATIVE_CONTROL_PASSED');

for(const law of ['CALIBRATED_DERIVATION_NEQ_RAW_EXPERIMENTAL_OBSERVATION','PHYSICALITY_GATE_PRECEDES_STATE_CLAIM','NATIVE_ATLAS_LIKELIHOOD_REPLICATION_REMAINS_EXTERNAL_VALIDATION','R125_CANONSTATE_ADMISSION_UNCHANGED'])assert.ok(R334_CALIBRATION_LAWS.includes(law));
const manifest=calibratedCernRelativityManifestR334();
assert.equal(manifest.revision,'R334');assert.equal(manifest.snapshot.closureState,'DEWEY_RELATIVITY_CLOSURE_RESOLVED');

const physics=fs.readFileSync('src/physicsRelativityRuntimeR132.ts','utf8');
const convergence=fs.readFileSync('src/convergenceMasterR314.ts','utf8');
const worker=fs.readFileSync('src/workerR116.js','utf8');
const workflow=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');
assert.ok(physics.includes('R334_CALIBRATED_RELATIVITY_SNAPSHOT')&&physics.includes('calibratedRelativity:'));
assert.ok(convergence.includes('R334 CERN/DEWEY CALIBRATION')&&convergence.includes('calibratedCernRelativity'));
assert.ok(worker.includes('calibratedCernRelativityManifestR334')&&worker.includes('calibratedRelativity:'));
assert.ok(workflow.includes('tests/r334-calibrated-cern-relativity-invariants.mjs'));
assert.match(R334_CALIBRATION_RECEIPT.truthBoundary,/not an official ATLAS\+CMS combination/i);

console.log('R334 CALIBRATED CERN/DEWEY RELATIVITY PASS · 23 closure + 36 quantitative rows · exact normalized hashes · master 4260 = bridge 4237 + closure 23 · distribution-first correction · physicality gate · common-state covariance/contradiction carry · evidence classes preserved · native ATLAS likelihood replication remains external validation · R328/R125/R141/R147 authorities unchanged');
