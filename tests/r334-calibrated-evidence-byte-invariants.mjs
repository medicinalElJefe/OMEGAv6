import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {
 R334_SOURCE_MANIFEST,R334_INFORMATION_FRAME,R334_COMMON_STATE,R334_CROSS_REPRESENTATION,
 R334_ADVANCEMENT,R334_TRANSPORT_NORMALIZATION,calibrationManifestR334
} from '../src/system/calibrationR334.js';

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
const sources=Object.fromEntries(R334_SOURCE_MANIFEST.map(x=>[x.id,x]));
assert.equal(sha(closurePath),sources.CLOSURE_V3.repositoryNormalizedSha256);
assert.equal(sha(bridgePath),sources.ADV02_ADV04.repositoryNormalizedSha256);
assert.equal(closure.length,23);assert.equal(bridge.length,36);
assert.equal(new Set(closure.map(x=>x.row_id)).size,23);
assert.equal(new Set(bridge.map(x=>x.row_id)).size,36);
assert.equal(sources.MASTER_V3.rows,4260);assert.equal(sources.BRIDGE_V2.rows,4237);
assert.equal(sources.MASTER_V3.rows-sources.BRIDGE_V2.rows,23);
assert.match(sources.MASTER_V3.composition,/4237-row prefix.*23-row suffix/i);
assert.equal(R334_TRANSPORT_NORMALIZATION,'UTF8_BOM_REMOVED_CRLF_TO_LF_FINAL_EOL_REMOVED_VALUES_UNCHANGED');

const byRel=Object.fromEntries(closure.map(x=>[x.row_id,x]));
const byQ=Object.fromEntries(bridge.map(x=>[x.row_id,x]));
assert.equal(byRel['REL-0001'].status,'CORRECTION ESTABLISHED');
assert.equal(byRel['REL-0003'].evidence_class,'RELATIVITY_EQUIVALENT_COORDINATE');
assert.match(byRel['REL-0003'].truth_boundary,/not an ATLAS-published observable or new physical primitive/i);
assert.equal(Number(byRel['REL-0011'].value),R334_COMMON_STATE.fL);
assert.equal(Number(byRel['REL-0012'].value),R334_COMMON_STATE.cParallel);
assert.equal(Number(byRel['REL-0017'].value),R334_COMMON_STATE.chi2);
assert.equal(Number(byRel['REL-0020'].value),R334_COMMON_STATE.physicalityResidual);
assert.equal(byRel['REL-0020'].status,'PASS');
assert.equal(byRel['REL-0030'].status,'CLOSED_AS_STRUCTURED_OBJECT');
assert.equal(byRel['REL-0034'].value,'DEWEY_RELATIVITY_CLOSURE_RESOLVED; NATIVE_ATLAS_REPLICATION_REMAINS_EXTERNAL_VALIDATION');

assert.equal(byQ['QBR-0001'].status,'OPEN_PROOF_GATE');
assert.equal(byQ['QBR-0001'].value,'BLOCKED_EXTERNAL_NUMERICAL_INPUTS');
assert.equal(byQ['QBR-0007'].value,'REQUIRED');
assert.equal(byQ['QBR-0030'].evidence_class,'PRIMARY_REPORTED');
assert.equal(byQ['QBR-0033'].evidence_class,'DERIVED_APPROXIMATION');
assert.equal(byQ['QBR-0042'].status,'FAILS_AT_CENTRAL_POINT');
assert.equal(byQ['QBR-0043'].status,'PASS');
assert.equal(Number(byQ['QBR-0037'].value),R334_CROSS_REPRESENTATION.atlasCmsObservedCompatibility.p);
assert.equal(byQ['QBR-0061'].status,'NEGATIVE_CONTROL_PASSED');

assert.equal(R334_INFORMATION_FRAME.distributionPreservingCorrection,'REQUIRED');
assert.equal(R334_ADVANCEMENT.nativeAtlasReplication,'BLOCKED_EXTERNAL_NUMERICAL_INPUTS');
assert.equal(R334_ADVANCEMENT.deweyRelativityClosure,'RESOLVED');
const manifest=calibrationManifestR334();
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.match(manifest.truthBoundary,/not an official experiment combination/i);
assert.match(manifest.truthBoundary,/cannot independently mutate CanonState/i);

const audit=fs.readFileSync('scripts/r314-convergence-audit.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');
assert.ok(audit.includes('R334-CLOSURE')&&audit.includes('R334-BRIDGE'));
assert.ok(workflow.includes('npm run test:r334')||workflow.includes('r334-calibrated-evidence-byte-invariants.mjs'));

console.log('R334 CALIBRATED EVIDENCE BYTE PASS · repository CSV SHA/census exact · 4260 = 4237 + 23 master composition · physicality + negative control retained · primary vs derived evidence separated · native ATLAS replication remains external validation');
