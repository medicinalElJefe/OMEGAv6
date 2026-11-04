import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reconstructCanonFullRowR772,R772_ORIGINAL_SOURCE_PROOF} from '../src/proof/canonFullSourceR772.js';
import {queryCanonSourceR773,verifyCanonSourceQueryR773,parseCanonSourceQueryR773,R773_QUERY_SCHEMA,exportCanonSourceCsvR783} from '../src/proof/canonSourceQueryR773.js';

const sourceHash=R772_ORIGINAL_SOURCE_PROOF.workbookSha256;
const matter={coordinates:[1,null,null,null,null],decision:'ANY',offset:0,limit:12};
const all=queryCanonSourceR773(matter);
assert.equal(all.schema,R773_QUERY_SCHEMA);
assert.equal(all.examined,20736);
assert.equal(all.total,20736);
assert.equal(all.rows.length,12);
assert.equal(all.rows[0].Atlas_Index,1);
assert.equal(all.rows[11].Atlas_Index,12);
assert.equal(all.hasMore,true);
assert.equal(all.sourceWorkbookSha256,sourceHash);
assert.equal(all.canonicalMutation,false);
assert.equal(all.empiricalAuthority,false);
assert.equal(all.deviceAction,false);
assert.deepEqual(all.rows[0],reconstructCanonFullRowR772(1));
assert.equal(queryCanonSourceR773({...matter,offset:12}).rows[0].Atlas_Index,13);
assert.equal(queryCanonSourceR773({...matter,offset:20724}).rows.at(-1).Atlas_Index,20736);
assert.equal(queryCanonSourceR773({...matter,offset:20736}).rows.length,0);
assert.equal(queryCanonSourceR773({coordinates:[1,1,null,null,null],decision:'ANY',offset:0,limit:12}).total,1728);
const exact=queryCanonSourceR773({coordinates:[1,1,1,1,1],decision:'ANY',offset:0,limit:12});
assert.equal(exact.total,1);assert.equal(exact.rows[0].Atlas_Index,1);
const last=queryCanonSourceR773({coordinates:[12,12,12,12,12],decision:'STAY',offset:0,limit:12});
assert.equal(last.total,1);assert.equal(last.rows[0].Atlas_Index,248832);
const expectedEscalate=Array.from({length:20736},(_,i)=>reconstructCanonFullRowR772(i+1))
 .filter(row=>row.Decision==='ESCALATE');
const escalate=queryCanonSourceR773({...matter,decision:'ESCALATE'});
assert.equal(escalate.total,expectedEscalate.length);
assert.deepEqual(escalate.rows,expectedEscalate.slice(0,12));
const portable=JSON.stringify(escalate);
assert.deepEqual(verifyCanonSourceQueryR773(portable),escalate);
const changed=JSON.parse(portable);changed.rows[0].Decision='STAY';
assert.throws(()=>verifyCanonSourceQueryR773(JSON.stringify(changed)),/differs/);
const forged=JSON.parse(portable);forged.total++;
assert.throws(()=>verifyCanonSourceQueryR773(JSON.stringify(forged)),/differs/);
const proof=JSON.parse(portable);proof.sourceWorkbookSha256='forged';
assert.throws(()=>verifyCanonSourceQueryR773(JSON.stringify(proof)),/differs/);
assert.throws(()=>verifyCanonSourceQueryR773('{'),/invalid/);
assert.throws(()=>verifyCanonSourceQueryR773('{}'),/unsupported/);
assert.throws(()=>verifyCanonSourceQueryR773(' '.repeat(128001)),/bounded/);
assert.deepEqual(parseCanonSourceQueryR773(JSON.stringify(matter)),matter);
assert.throws(()=>queryCanonSourceR773({coordinates:[null,null,null,null,null]}),/fix at least one/);
assert.throws(()=>queryCanonSourceR773({coordinates:[1,null,null,null,'1']}),/integer/);
assert.throws(()=>queryCanonSourceR773({coordinates:[1,null,null,null,13]}),/integer/);
assert.throws(()=>queryCanonSourceR773({...matter,limit:25}),/integer/);
assert.throws(()=>queryCanonSourceR773({...matter,offset:1.2}),/integer/);
assert.throws(()=>queryCanonSourceR773({...matter,decision:'PROVEN'}),/decision/);
assert.throws(()=>queryCanonSourceR773({...matter,authority:'CANON'}),/unknown/);
assert.throws(()=>parseCanonSourceQueryR773(' '.repeat(2049)),/bounded/);

const csvAll=exportCanonSourceCsvR783(matter);
assert.equal(csvAll.schema,'OMEGA_R783_CANON_SOURCE_CSV_V1');
assert.equal(csvAll.rows,20736);
assert.equal(csvAll.examined,20736);
assert.equal(csvAll.columns,24);
assert.equal(csvAll.sourceWorkbookSha256,sourceHash);
assert.equal(csvAll.canonicalMutation,false);
assert.equal(csvAll.deviceAction,false);
assert.ok(csvAll.csv.startsWith('\ufeff"Atlas_Index","Atlas_Key","Domain"'));
assert.equal(csvAll.csv.split('\r\n').length,20738,'header + all matching rows + terminal separator');
assert.ok(csvAll.csv.includes('\r\n"1",'));
assert.ok(csvAll.csv.includes('\r\n"20736",'));
assert.deepEqual(exportCanonSourceCsvR783({...matter,offset:100,limit:1}).csv,csvAll.csv,
 'CSV export must include the complete selected source slice, not a paginated UI subset');
// R783 round-trip: parse RFC 4180 quoted fields rather than splitting on commas.
// Exercise all 20,736 source records, preserving embedded quotes, commas and newlines.
function parseQuotedCsv(text){
 assert.equal(text.charCodeAt(0),0xfeff,'UTF-8 BOM');
 const records=[];let record=[],cell='',inside=false;
 for(let i=1;i<text.length;i++){
  const ch=text[i];
  if(inside){
   if(ch==='"'&&text[i+1]==='"'){cell+='"';i++;}
   else if(ch==='"')inside=false;
   else cell+=ch;
  }else if(ch==='"'){assert.equal(cell.length,0,'quote must start a cell');inside=true;}
  else if(ch===','){record.push(cell);cell='';}
  else if(ch==='\r'){assert.equal(text[i+1],'\n','CRLF required');record.push(cell);records.push(record);record=[];cell='';i++;}
  else throw new Error('unexpected unquoted CSV character '+ch);
 }
 assert.equal(inside,false,'unterminated CSV field');
 assert.deepEqual(record,[],'unterminated CSV record');
 assert.equal(cell,'','unterminated CSV cell');
 return records;
}
const csvParsed=parseQuotedCsv(csvAll.csv);
assert.equal(csvParsed.length,20737,'header plus all 20,736 original-source rows');
assert.equal(csvParsed[0].length,24);
for(const [i,row] of csvParsed.entries()){
 assert.equal(row.length,24,'all CSV records must have exactly 24 fields at '+i);
 if(i===0)continue;
 const source=reconstructCanonFullRowR772(i);
 for(let j=0;j<24;j++)assert.equal(row[j],String(source[csvParsed[0][j]]??''),'source field mismatch at '+i+':'+j);
}
const csvOnly=exportCanonSourceCsvR783({coordinates:[1,1,1,1,1],decision:'ANY',offset:0,limit:12});
assert.equal(csvOnly.rows,1);
assert.equal(csvOnly.csv.split('\r\n').length,3);
const actualFirstDecision=reconstructCanonFullRowR772(1).Decision;
const distinctDecision=actualFirstDecision==='STAY'?'ESCALATE':'STAY';
const csvEmpty=exportCanonSourceCsvR783({coordinates:[1,1,1,1,1],decision:distinctDecision});
assert.equal(csvEmpty.rows,0);
assert.equal(csvEmpty.csv.split('\r\n').length,2);
assert.throws(()=>exportCanonSourceCsvR783({coordinates:[null,null,null,null,null]}),/fix at least one/);
assert.throws(()=>exportCanonSourceCsvR783({coordinates:[1,null,null,null,'2']}),/integer/);
assert.throws(()=>exportCanonSourceCsvR783({...matter,decision:'FAKE'}),/decision/);
const csvUi=readFileSync('src/CanonSourceQueryR773.tsx','utf8');
assert.ok(csvUi.includes('data-r783-export-csv')&&csvUi.includes('exportCanonSourceCsvR783(query(0))'));

const ui=readFileSync('src/CanonSourceQueryR773.tsx','utf8');
const parent=readFileSync('src/CanonTopologyWorkbenchR763.tsx','utf8');
for(const marker of ['data-r773-canon-query','data-r773-execute','data-r773-total','data-r773-next','data-r773-open','data-r773-save','data-r773-load','data-r773-export','data-r773-verify'])
 assert(ui.includes(marker),'missing executable UI '+marker);
assert(parent.includes('<CanonSourceQueryR773 onSelect='));
console.log('R773 CANON SOURCE QUERY PASS · bounded 20736-row source slices, exact paging, 24-column rows, decision filters, independently recomputed portable recovery and refusal');
