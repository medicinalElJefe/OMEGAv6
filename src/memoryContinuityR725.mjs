// R725: actual chronological comparison of two independently verified R28 local snapshots.
// This is a source-bound comparison, not a causal model, empirical time measurement or Canon admission.
import {verifyMemoryRowsR722,digestMemoryR722} from './portableMemoryRecoveryR722.mjs';

export const MEMORY_CONTINUITY_SCHEMA_R725='OMEGA_VERIFIED_MEMORY_CONTINUITY_R725_V1';
const MAX_METRICS=32;
const numeric=metrics=>Object.entries(metrics).filter(([,value])=>typeof value==='number'&&Number.isFinite(value));
const source=row=>({id:row.id,at:row.at,sha256:row.sha256,address:row.address,stateId:row.stateId,
 decision:row.decision,note:row.note,authority:row.authority});

export async function compareVerifiedMemoryContinuityR725(rows,earlierId,laterId){
 // Validate every persisted source, including rows not selected for this comparison.
 await verifyMemoryRowsR722(rows);
 if(typeof earlierId!=='string'||typeof laterId!=='string'||earlierId===laterId)
  throw Error('R725 two distinct source identities required');
 const first=rows.find(row=>row.id===earlierId),second=rows.find(row=>row.id===laterId);
 if(!first||!second)throw Error('R725 source identity unavailable');
 if(first.at>=second.at)throw Error('R725 sources must have strictly increasing recorded timestamps');
 const a=new Map(numeric(first.metrics)),b=new Map(numeric(second.metrics));
 const common=[...a.keys()].filter(key=>b.has(key)).sort((x,y)=>x.localeCompare(y));
 const metricDeltas=common.slice(0,MAX_METRICS).map(key=>({
  key,earlier:a.get(key),later:b.get(key),delta:b.get(key)-a.get(key)
 }));
 const packet={
  schema:MEMORY_CONTINUITY_SCHEMA_R725,
  earlier:source(first),later:source(second),
  elapsedRecordedMs:second.at-first.at,
  transition:{addressDelta:second.address-first.address,stateIdDelta:second.stateId-first.stateId,
   decisionChanged:first.decision!==second.decision,noteChanged:first.note!==second.note},
  metricCoverage:{earlierNumeric:a.size,laterNumeric:b.size,sharedNumeric:common.length,
   compared:metricDeltas.length,truncated:common.length>MAX_METRICS},
  metricDeltas,
  truthClass:'TWO_VERIFIED_BROWSER_LOCAL_SNAPSHOTS_ONLY',
  causalInference:false,physicalTimeMeasurement:false,authenticatedSource:false,canonicalMutation:false
 };
 return {...packet,packetSha256:await digestMemoryR722(JSON.stringify(packet))};
}

export async function revalidateMemoryContinuityR725(rows,packet){
 if(!packet||packet.schema!==MEMORY_CONTINUITY_SCHEMA_R725||
    typeof packet.packetSha256!=='string'||typeof packet.earlier?.id!=='string'||
    typeof packet.later?.id!=='string')
  throw Error('R725 continuity packet schema refused');
 const {packetSha256,...unsigned}=packet;
 if(await digestMemoryR722(JSON.stringify(unsigned))!==packetSha256)
  throw Error('R725 continuity packet digest mismatch');
 const fresh=await compareVerifiedMemoryContinuityR725(rows,packet.earlier.id,packet.later.id);
 if(fresh.packetSha256!==packetSha256)throw Error('R725 local source changed; recompute comparison');
 return fresh;
}
