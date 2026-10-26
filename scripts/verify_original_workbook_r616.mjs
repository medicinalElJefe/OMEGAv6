#!/usr/bin/env node
// R616 private-source import proof. Reads original workbook only from caller path.
// Emits evidence JSON to stdout; no source bytes, rows or private metadata uploaded.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {verifyOriginalWorkbookR613,HISTORICAL_WORKBOOK_PROOF_R613} from '../src/continuity/originalWorkbookParityR613.js';
import {parseHistoricalWorkbookR612} from '../src/continuity/ooxmlCorpusParserR612.js';
const path=process.argv[2];
if(!path||process.argv.length!==3){console.error('Usage: node scripts/verify_original_workbook_r616.mjs /path/to/original.xlsx');process.exit(2)}
try{
 const bytes=readFileSync(resolve(path));
 const p=HISTORICAL_WORKBOOK_PROOF_R613;
 const parity=verifyOriginalWorkbookR613(bytes);
 const extracted=parseHistoricalWorkbookR612({sourceBytes:bytes,claimedSha256:p.sha256,sheet:p.sheet,familyId:'atlas-state'});
 if(extracted.engineeringRecords.length!==p.expectedRows)throw Error('engineering record count mismatch');
 for(const record of extracted.engineeringRecords){
  if(record.metadata.Address==null||record.metadata['Decoded Check']==null||record.metadata.Module==null||record.metadata.Gate==null)throw Error('required original engineering column empty');
  if(String(record.metadata.Address)!==String(record.address))throw Error('original address mismatch');
 }
 const modules=[...new Set(extracted.engineeringRecords.map(x=>String(x.metadata.Module)))].sort();
 const gates=[...new Set(extracted.engineeringRecords.map(x=>String(x.metadata.Gate)))].sort();
 const receipt={schema:'OMEGA_PRIVATE_SOURCE_IMPORT_PROOF_R616',sourceSha256:p.sha256,sourceBytes:bytes.length,sourceSheet:p.sheet,rows:parity.coordinateRows,coordinateListSha256:parity.coordinateListSha256,retainedEngineeringRecords:extracted.engineeringRecords.length,moduleLabels:modules,sourceGateLabels:gates,truthClass:'SOURCE_BYTES_VERIFIED_READ_ONLY_LOCAL_IMPORT',admission:'NO_EXECUTION_NO_CANON_MUTATION',limitations:['SOURCE_GATE_LABELS_ARE_HISTORICAL_NOT_RUNTIME_PROOF','NO_PRIVATE_ROWS_OR_SOURCE_BYTES_EMITTED']};
 console.log(JSON.stringify(receipt,null,2));
}catch(e){console.error('R616 SOURCE IMPORT REJECTED:',e instanceof Error?e.message:String(e));process.exit(1)}
