import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileImplementationCanonR314,R314_CANON_SUCCESSOR_MAP,R314_IMPLEMENTATION_CANON_EXPECTED_ROWS,type R314CanonSourceRow} from '../src/system/implementationCanonCompilerR314';

const receipt=JSON.parse(fs.readFileSync('public/omega-r314-implementation-canon-source.json','utf8'));
assert.equal(receipt.schema,'OMEGA_IMPLEMENTATION_CANON_SOURCE_R314');
assert.equal(receipt.rowCount,675);
assert.equal(receipt.sourceStatus.LOCKED,12);
assert.equal(receipt.sourceStatus.PLANNED,663);
assert.deepEqual(receipt.types,{HARD_INVARIANT:12,MODULE:94,SYMBOL:408,SHADER_BINDING:31,EVENT:22,API_ROUTE:22,DATABASE_TABLE:12,CONFIG_KEY:26,TEST:23,BUILD_GATE:25});
assert.equal(Object.values(receipt.types as Record<string,number>).reduce((a,b)=>a+b,0),675);
assert.match(receipt.source.sha256,/^[a-f0-9]{64}$/);

const rows:R314CanonSourceRow[]=Array.from({length:R314_IMPLEMENTATION_CANON_EXPECTED_ROWS},(_,index)=>{
 const n=index+1;
 const id=`CANON-${String(n).padStart(6,'0')}`;
 return{rowId:id,type:n<=12?'HARD_INVARIANT':'MODULE',phase:n<=12?'Governance':'Synthetic',component:`Component ${n}`,artifact:n===13?'src/schema/base.py':`planned/${n}.py`,symbol:n===13?'SchemaBase':`Symbol${n}`,purpose:`Purpose ${n}`,sourceStatus:n<=12?'LOCKED':'PLANNED',priority:'P0',sequence:n};
});
const evidence={repositoryPaths:new Set<string>(),successorByRowId:R314_CANON_SUCCESSOR_MAP};
const compiled=compileImplementationCanonR314(rows,evidence);
assert.equal(compiled.rowCount,675);
assert.equal(compiled.summary.locked,12);
assert.equal(compiled.summary.current,7,'only seven explicit R314 successor mappings are currently admitted by this focused fixture');
assert.equal(compiled.canonicalAdmission,false);
assert.equal(compiled.compiled.find(row=>row.rowId==='CANON-000013')?.compiledState,'CURRENT_SUCCESSOR');
assert.equal(compiled.compiled.find(row=>row.rowId==='CANON-000049')?.compiledState,'CURRENT_SUCCESSOR');
assert.equal(compiled.compiled.find(row=>row.rowId==='CANON-000050')?.compiledState,'PLANNED');
assert.ok(R314_CANON_SUCCESSOR_MAP.get('CANON-000024')?.boundary.includes('no telemetry claim'));

const exactRows=[...rows];
exactRows[99]={...exactRows[99],artifact:'src/exact.ts',symbol:'ExactKernel'};
const exact=compileImplementationCanonR314(exactRows,{repositoryPaths:new Set(['src/exact.ts']),symbolsByPath:new Map([['src/exact.ts',new Set(['ExactKernel'])]]),successorByRowId:R314_CANON_SUCCESSOR_MAP});
assert.equal(exact.compiled[99].compiledState,'CURRENT_EXACT');
assert.equal(exact.compiled[99].canonicalAdmission,false);

assert.throws(()=>compileImplementationCanonR314(rows.slice(0,-1),evidence),/row-count mismatch/);
const dup=[...rows];dup[674]={...dup[674],rowId:dup[673].rowId};
assert.throws(()=>compileImplementationCanonR314(dup,evidence),/duplicate Canon row/);

console.log('R314 IMPLEMENTATION CANON COMPILER PASS · exact 675-row census · 12 locked invariants · explicit successor evidence only · no admission leakage');
