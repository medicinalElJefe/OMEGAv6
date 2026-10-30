// R723: deterministic, source-bound recall of verified R28 browser-local snapshots.
// This is not model-generated memory, a signature, or CanonState admission.
import {verifyMemoryRowsR722} from './portableMemoryRecoveryR722.mjs';

export const MEMORY_RECALL_SCHEMA_R723='OMEGA_VERIFIED_LOCAL_RECALL_R723_V1';
const normalize=value=>String(value).normalize('NFKC').toLocaleLowerCase('en-US');
const terms=value=>normalize(value).match(/[\p{L}\p{N}]+/gu)||[];
const FIELDS=['note','decision','stateId','address','sha256'];
const WEIGHTS={note:5,decision:3,stateId:4,address:4,sha256:1};

export async function queryVerifiedMemoryR723(rows,query,limit=12){
 // Verify the entire persisted collection before returning even one hit.
 await verifyMemoryRowsR722(rows);
 if(typeof query!=='string'||query.length>160)throw Error('R723 query length refused');
 if(!Number.isSafeInteger(limit)||limit<1||limit>25)throw Error('R723 result limit refused');
 const tokens=[...new Set(terms(query))];
 if(!tokens.length||tokens.length>12)throw Error('R723 query terms refused');
 const matches=[];
 for(const row of rows){
  const fields={note:normalize(row.note),decision:normalize(row.decision),
   stateId:String(row.stateId),address:String(row.address),sha256:row.sha256.toLowerCase()};
  const evidence=tokens.map(token=>FIELDS.filter(field=>fields[field].includes(token)));
  if(evidence.some(found=>found.length===0))continue; // All terms must match the same verified source.
  const matchedFields=[...new Set(evidence.flat())];
  const score=evidence.reduce((sum,found)=>sum+Math.max(...found.map(field=>WEIGHTS[field])),0);
  matches.push({id:row.id,at:row.at,address:row.address,stateId:row.stateId,
   note:row.note,decision:row.decision,sha256:row.sha256,matchedFields,score});
 }
 matches.sort((a,b)=>b.score-a.score||b.at-a.at||a.id.localeCompare(b.id));
 return {schema:MEMORY_RECALL_SCHEMA_R723,query:query.trim(),total:matches.length,
  results:matches.slice(0,limit),verifiedCount:rows.length,
  truthClass:'VERIFIED_BROWSER_LOCAL_SNAPSHOT_RETRIEVAL_ONLY'};
}

export async function inspectVerifiedMemoryR723(rows,id,expectedDigest,expectedAt){
 await verifyMemoryRowsR722(rows);
 if(typeof id!=='string'||typeof expectedDigest!=='string')throw Error('R723 source identity refused');
 const row=rows.find(item=>item.id===id);
 if(!row||row.sha256!==expectedDigest||(expectedAt!==undefined&&row.at!==expectedAt))
  throw Error('R723 source changed or unavailable; rerun recall');
 return {...row};
}
