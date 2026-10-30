// R726: bounded, executable multi-snapshot chronology over independently verified R28 memory.
// Recorded timestamps are local metadata. This is not a causal model or physical time measurement.
import {verifyMemoryRowsR722,digestMemoryR722} from './portableMemoryRecoveryR722.mjs';
import {compareVerifiedMemoryContinuityR725} from './memoryContinuityR725.mjs';

export const MEMORY_TRAJECTORY_SCHEMA_R726='OMEGA_VERIFIED_MEMORY_TRAJECTORY_R726_V1';
export const MEMORY_TRAJECTORY_LIMIT_R726=12;
const source=row=>({id:row.id,at:row.at,sha256:row.sha256,address:row.address,
 stateId:row.stateId,decision:row.decision,note:row.note});

export async function traceVerifiedMemoryTrajectoryR726(rows,startId,endId){
 // Verify the complete local store, including sources outside the requested interval.
 await verifyMemoryRowsR722(rows);
 if(typeof startId!=='string'||typeof endId!=='string'||startId===endId)
  throw Error('R726 two distinct endpoint identities required');
 const ordered=[...rows].sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
 const start=ordered.findIndex(row=>row.id===startId),end=ordered.findIndex(row=>row.id===endId);
 if(start<0||end<0)throw Error('R726 endpoint identity unavailable');
 if(start>=end)throw Error('R726 endpoints must be in increasing recorded order');
 const selected=ordered.slice(start,end+1);
 if(selected.length<3)throw Error('R726 trajectory requires at least three verified snapshots');
 if(selected.length>MEMORY_TRAJECTORY_LIMIT_R726)
  throw Error('R726 trajectory exceeds 12-snapshot bound; narrow the endpoints');
 for(let i=1;i<selected.length;i++)
  if(selected[i].at<=selected[i-1].at)
   throw Error('R726 ambiguous duplicate recorded timestamp refused');
 const edges=[];
 for(let i=1;i<selected.length;i++){
  const comparison=await compareVerifiedMemoryContinuityR725(rows,selected[i-1].id,selected[i].id);
  edges.push({earlierId:selected[i-1].id,laterId:selected[i].id,
   elapsedRecordedMs:comparison.elapsedRecordedMs,transition:comparison.transition,
   metricCoverage:comparison.metricCoverage,metricDeltas:comparison.metricDeltas,
   comparisonSha256:comparison.packetSha256});
 }
 const packet={schema:MEMORY_TRAJECTORY_SCHEMA_R726,
  sources:selected.map(source),edges,sourceCount:selected.length,
  elapsedRecordedMs:selected.at(-1).at-selected[0].at,
  addressPath:selected.map(row=>row.address),
  decisionChanges:edges.filter(edge=>edge.transition.decisionChanged).length,
  truthClass:'BOUNDED_VERIFIED_BROWSER_LOCAL_CHRONOLOGY_ONLY',
  causalInference:false,physicalTimeMeasurement:false,authenticatedSource:false,canonicalMutation:false};
 return {...packet,packetSha256:await digestMemoryR722(JSON.stringify(packet))};
}

export async function revalidateMemoryTrajectoryR726(rows,packet){
 if(!packet||packet.schema!==MEMORY_TRAJECTORY_SCHEMA_R726||
    typeof packet.packetSha256!=='string'||!Array.isArray(packet.sources)||
    packet.sources.length<3||packet.sources.length>MEMORY_TRAJECTORY_LIMIT_R726)
  throw Error('R726 trajectory packet schema refused');
 const {packetSha256,...unsigned}=packet;
 if(await digestMemoryR722(JSON.stringify(unsigned))!==packetSha256)
  throw Error('R726 trajectory packet digest mismatch');
 const fresh=await traceVerifiedMemoryTrajectoryR726(rows,packet.sources[0]?.id,packet.sources.at(-1)?.id);
 if(fresh.packetSha256!==packetSha256)
  throw Error('R726 local chronology changed; recompute trajectory');
 return fresh;
}
