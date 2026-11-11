import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditRHGraphRowsR823,loadOriginalRHWorkbookR823,R823_ORIGINAL_WORKBOOK_SHA256,R823_ORIGINAL_WORKBOOK_BYTES} from '../src7/workspaces/historicalRHSourceR823.ts';

const NHEAD=['NodeID','NodeName','ObjectType','Tag','Cluster','D','P','R','L','RowID_20736','Anti_RowID'];
const EHEAD=['EdgeID','FromNodeID','ToNodeID','EdgeType','Weight','Note','FromRowID','ToRowID'];
const coords=(row:number)=>{
 const i=row-1;return[Math.floor(i/1728)%12+1,Math.floor(i/144)%12+1,Math.floor(i/12)%12+1,i%12+1];
};
// Explicit SYNTHETIC regression fixture: 320 conceptual IDs are many-to-one
// across 25 addresses, including a group of 45, never called original source.
const nodes:any[][]=[NHEAD],edges:any[][]=[EHEAD];
for(let i=0;i<320;i++){
 const group=i<45?0:1+Math.floor((i-45)*24/275);
 const row=group+1; const id='RH'+String(i+1).padStart(4,'0');
 nodes.push([id,'SYNTHETIC '+i,'TEST','TEST','TEST',...coords(row),row,20737-row]);
 edges.push(['E'+String(i+1).padStart(5,'0'),id,id,'antipode_state',0.2,'SYNTHETIC',row,20737-row]);
}
for(let i=0;i<96;i++){
 const src=nodes[i+1],dst=nodes[i+2];
 edges.push(['E'+String(i+321).padStart(5,'0'),src[0],dst[0],'prereq',1,'SYNTHETIC',src[9],dst[9]]);
}
const valid=auditRHGraphRowsR823(nodes,edges);
assert.equal(valid.concepts.length,320);
assert.equal(valid.edges.length,416);
assert.equal(valid.uniqueSourceAddresses,25);
assert.equal(valid.maxConceptsAtAddress,45);
assert.ok(valid.concepts.filter(n=>n.row===1).length===45,'shared source row must retain 45 conceptual identities');
const reject=(mutate:(n:any[][],e:any[][])=>void,pattern:RegExp)=>{
 const n=structuredClone(nodes),e=structuredClone(edges);mutate(n,e);
 assert.throws(()=>auditRHGraphRowsR823(n,e),pattern);
};
reject((n)=>{n[2][0]=n[1][0]},/conceptual RH identity/);
reject((n)=>{n[1][9]=18},/radix-12|address mismatch/);
reject((n)=>{n[1][10]=20737},/address mismatch/);
reject((n,e)=>{e[1][7]=1},/antipode relationship mismatch/);
reject((n,e)=>{e[322][7]=20736},/prerequisite relationship mismatch/);
reject((n,e)=>{e[1][4]=1},/antipode relationship mismatch/);
reject((n,e)=>{e[1][1]='RH9999'},/unknown typed endpoint/);
reject((n,e)=>{e[2][0]=e[1][0]},/historical edge identity/);
reject((n,e)=>{e[1][3]='coupling'},/unknown typed endpoint/);
reject((n,e)=>{e.pop()},/source graph row count mismatch/);
await assert.rejects(()=>loadOriginalRHWorkbookR823(new ArrayBuffer(R823_ORIGINAL_WORKBOOK_BYTES)),/fingerprint mismatch|secure SHA-256 origin/,'a synthetic same-sized workbook must never gain original donor identity');
assert.equal(R823_ORIGINAL_WORKBOOK_SHA256,'1daa73b90ab07453141056e74db1a5488232ef871eef83033f1aa0f5d45631a5');
assert.ok(readFileSync('docs/R614_GRAPH_RUNTIME_JOIN_INTEGRITY.md','utf8').includes(R823_ORIGINAL_WORKBOOK_SHA256),'original workbook SHA must agree with previously witnessed archive-member bytes');
const app=readFileSync('src7/workspaces/HistoricalRHGraphR621.tsx','utf8');
for(const token of ["admittedHistoricalEdgesR621","E00001","E00002","data-r621-historical-rh-graph","data-r823-original-workbook-input","VERIFIED_FULL_LOCAL","loadOriginalRHWorkbookR823","Clear imported graph","No source-recorded edge","sourceRow-1===address"])assert.ok(app.includes(token),'retained Visual source or R823 interaction missing '+token);
// R824: a late completion from an earlier import must never replace the latest
// selected workbook, nor resurrect data after explicit clear or unmount.
for(const token of ["useRef(0)","const generation=++importGeneration.current","generation!==importGeneration.current","importGeneration.current+=1","useEffect(()=>()=>{importGeneration.current+=1},[])"])assert.ok(app.includes(token),'R824 latest-request-wins lifecycle guard missing '+token);
assert.ok(app.indexOf('if(generation!==importGeneration.current)return;')<app.indexOf("setFull(admitted);setStatus('VERIFIED_FULL_LOCAL')"),'success must check generation before publishing');
assert.ok(app.includes("if(generation!==importGeneration.current)return;\\n   setFull(null);setStatus('REFUSED')"),'rejection must check generation before publishing');
assert.ok(!app.includes("fetch(")&&!app.includes("localStorage.setItem("),'original donor must never be uploaded or persisted');
const lite=readFileSync('src/xlsxLiteR153.ts','utf8');
assert.ok(lite.includes('maxCols=128,sheetName?:string')&&lite.includes("sheets.find(x=>x.getAttribute('name')===sheetName)"),'reuse existing R153 parser with explicit named-sheet selection');
console.log('R823 SOURCE-GATED FULL RH GRAPH PASS · 320 conceptual identities on 25 addresses · 416 typed edge constraints · original 2150619-byte fingerprint refusal · existing route authority conserved');
