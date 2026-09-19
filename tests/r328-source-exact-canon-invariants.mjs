import assert from'node:assert/strict';
import fs from'node:fs';
import{createHash}from'node:crypto';
import{R328_SOURCE_CANON_RECEIPT,R328_REPOSITORY_NORMALIZED_SHA256,parseSourceExactCanonCsvR328,compileSourceExactCanonR328,sha256HexR328}from'../src/system/sourceExactCanonR328.ts';

const csvPath='public/canon/OMEGA_CANON_ALL_CONCEPTS_SOURCE_EXACT_2026-09-18.csv';
const bytes=fs.readFileSync(csvPath),text=bytes.toString('utf8').replace(/^\uFEFF/,'');
const compiler=fs.readFileSync('src/system/sourceExactCanonR328.ts','utf8');
const ui=fs.readFileSync('src/SourceExactCanonR328.tsx','utf8');
const master=fs.readFileSync('src/convergenceMasterR314.ts','utf8');
const implementation=fs.readFileSync('src/system/implementationCanonCompilerR314.ts','utf8');
const audit=fs.readFileSync('scripts/r314-convergence-audit.mjs','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');

function parseCsv(source){
 const rows=[],row=[],field=[];let quoted=false;
 const fieldDone=()=>{row.push(field.join(''));field.length=0};
 const rowDone=()=>{fieldDone();rows.push([...row]);row.length=0};
 for(let i=0;i<source.length;i++){const ch=source[i];if(quoted){if(ch==='"'){if(source[i+1]==='"'){field.push('"');i++}else quoted=false}else field.push(ch);continue}if(ch==='"'){quoted=true;continue}if(ch===','){fieldDone();continue}if(ch==='\n'){rowDone();continue}if(ch==='\r'){if(source[i+1]==='\n')continue;rowDone();continue}field.push(ch)}
 if(field.length||row.length)rowDone();if(quoted)throw new Error('unterminated CSV quote');return rows;
}
const matrix=parseCsv(text),header=matrix.shift(),rows=matrix.filter(x=>x.length>1||x[0]);
const expected=['record_id','source_family','source_file','source_section','source_row_key','category','concept_name','property_name','canonical_value','computation_language','epistemic_status','units_or_frame','dependency_symbols','validation_rule','conflict_group','provenance_note'];
assert.deepEqual(header,expected);
assert.equal(bytes.length,1834293);
assert.equal(createHash('sha256').update(bytes).digest('hex'),'478922fb496a9402a82063908811dd9e264a0214e198dac4fb6ecfe2e95807bf');
assert.equal(await sha256HexR328(new Uint8Array(bytes)),R328_REPOSITORY_NORMALIZED_SHA256,'production browser hash verifier must prove the served repository bytes');
assert.equal(rows.length,3743);

const objects=rows.map((values,index)=>{assert.equal(values.length,16,`R328 column count row ${index+2}`);const r=Object.fromEntries(expected.map((k,i)=>[k,values[i]??'']));assert.equal(r.record_id,`R${String(index+1).padStart(6,'0')}`);return r});
const productionRows=parseSourceExactCanonCsvR328(text);
assert.equal(productionRows.length,3743,'production parser must load the exact repository canon');
assert.deepEqual(productionRows.filter(r=>!r.validation_rule).map(r=>r.record_id),['R000001','R000002','R003743'],'exact source intentionally preserves three undeclared validation rules');
assert.equal(R328_SOURCE_CANON_RECEIPT.blankValidationRows,3,'receipt must disclose validation missingness');
const productionCompiled=compileSourceExactCanonR328(productionRows);
assert.equal(productionCompiled.census.blankValidationRows,3,'compiler census must preserve validation missingness');
assert.equal(productionCompiled.census.blankEpistemicRows,2,'compiler census must preserve epistemic missingness');
const unique=k=>new Set(objects.map(r=>r[k]).filter(Boolean));
assert.equal(unique('source_family').size,13);
assert.equal(unique('source_file').size,10);
assert.equal(unique('category').size,47);
assert.equal(unique('concept_name').size,495);
assert.equal(unique('property_name').size,173);
assert.equal(unique('epistemic_status').size,62);
assert.equal(new Set(objects.map(r=>r.epistemic_status)).size,63);
assert.equal(objects.filter(r=>!r.epistemic_status).length,2);

const opHeads=new Set(objects.map(r=>(r.computation_language.match(/^([A-Za-z0-9_ΩσΛΦΔ]+)\s*(?::=|\[|\(|∈|$)/u)||[])[1]||r.computation_language.split(/\s+/)[0]||''));
assert.equal(opHeads.size,45);
const primary=new Set(['CONST','VALUE','META','DEFINE_EXPR','INPUT_SCHEMA','FRAME_SPEC','LEDGER_RULE','OUTPUT_SCHEMA','PIPELINE','GATE_RULE','EPISTEMIC_TAG','REGISTER_MODE','DECISION_STATE','ASSERT']);
assert.equal(objects.filter(r=>primary.has((r.computation_language.match(/^([A-Za-z0-9_ΩσΛΦΔ]+)\s*(?::=|\[|\(|∈|$)/u)||[])[1])).length,3702);
assert.equal(objects.length-3702,41);

const groups=new Map();
for(const r of objects)if(r.conflict_group){const a=groups.get(r.conflict_group)||[];a.push(r);groups.set(r.conflict_group,a)}
assert.equal(groups.size,463);
assert.equal([...groups.values()].filter(v=>new Set(v.map(r=>r.canonical_value)).size>1).length,405);

for(const token of ['R328_SOURCE_ORIGINAL_SHA256','R328_REPOSITORY_NORMALIZED_SHA256','R328_SOURCE_CANON_EXPECTED_RECORDS=3743','sha256HexR328','source canon SHA-256 mismatch','compileComputationLanguageR328','compileSourceExactCanonR328','crosswalkSourceExactRecordR328','DIRECT_SYMBOLIC_EXPR','autoExecute:false','PUBLIC_REFERENCE','CANON_MODEL','DEVICE_GATED','CONFLICT'])assert.ok(compiler.includes(token),`R328 compiler missing ${token}`);
assert.ok(!/\beval\s*\(/.test(compiler)&&!compiler.includes('new Function'),'R328 semantic compiler may not dynamically execute source formulas');
for(const sf of ['MASTER','SOURCE_MANIFEST','VALIDATION','RSC','ATOMIC_WOVEN','WOVEN_20736','JULY_ALL_MODES','MODE_INVENTORY','OMEGA_BUILD_CANON','LATER_CANON','DEWEY_TREE','UNIFIED_AUDIT','MASTER_EQUATION_LEDGER'])assert.ok(compiler.includes(sf),`R328 crosswalk missing source family ${sf}`);
assert.ok(compiler.includes("PUBLIC_REFERENCE")&&compiler.includes("src/physicsRelativityRuntimeR132.ts"),'public physics/math must remain reference-classed');
assert.ok(compiler.includes("webgpu|vulkan|metal")&&compiler.includes("'DEVICE_GATED'"),'native GPU requirements must remain device-gated');

assert.ok(ui.includes('3,743-record Canon Registry')&&ui.includes('Search record, concept, formula, source, conflict group')&&ui.includes('Open exact source CSV'),'R328 operator surface incomplete');
assert.ok(ui.includes('NO VALIDATION RULE DECLARED IN SOURCE'),'R328 UI must render exact missing validation as missing, not blank or fabricated');
assert.ok(master.includes('SOURCE_EXACT_SEMANTIC_CANON_REMAINS_SEPARATE_FROM_IMPLEMENTATION_CANON'),'convergence law must separate semantic and implementation canons');
assert.ok(master.includes("R328 SOURCE-EXACT CANON")&&master.includes("3,743-row semantic registry"),'R314 build stage must consume R328 source canon');
assert.ok(implementation.includes('R314_IMPLEMENTATION_CANON_EXPECTED_ROWS=675'),'R328 must not overwrite the distinct 675-row implementation canon');
assert.ok(audit.includes('R328-SOURCE-CANON-HASH')&&audit.includes('R328-SOURCE-CANON-CENSUS')&&audit.includes("sourceCanonRecords!==3743"),'convergence audit must fail closed on R328 source corruption');
assert.ok(suite.includes("if(panel==='Convergence')return wrap(<div>\n  <OmegaConvergenceMasterR314/>"),'Convergence route must expose the semantic/implementation master');

console.log('R328 SOURCE-EXACT CANON PASS · 3,743 exact records · 495 concepts · 173 properties · 45 computation heads · 463 conflict groups / 405 multivariant · original + normalized SHA/census gated · 675-row implementation canon remains separate · no symbolic auto-execution');
