// R730: self-contained, read-only portable trajectory capsule. Digest != authorship.
import {digestMemoryR722,exportMemoryBundleR722,verifyMemoryBundleR722} from './portableMemoryRecoveryR722.mjs';
import {traceVerifiedMemoryTrajectoryR726,revalidateMemoryTrajectoryR726} from './memoryTrajectoryR726.mjs';
import {saveTrajectoryCheckpointR729,restoreTrajectoryCheckpointR729} from './trajectoryCheckpointR729.mjs';
export const TRAJECTORY_CAPSULE_SCHEMA_R730='OMEGA_PORTABLE_TRAJECTORY_CAPSULE_R730_V1';
const MAX_BYTES=524288;
const HEX=/^[a-f0-9]{64}$/;
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join('|')===keys.slice().sort().join('|');
const bytes=x=>new TextEncoder().encode(x).length;
export async function exportTrajectoryCapsuleR730(rows,packet,cursorId,metricKey='address'){
 const fresh=await revalidateMemoryTrajectoryR726(rows,packet);
 const byId=new Map(rows.map(row=>[row.id,row]));
 const selected=fresh.sources.map(source=>byId.get(source.id));
 if(selected.some((row,i)=>!row||row.sha256!==fresh.sources[i].sha256))
  throw Error('R730 source identity changed; export refused');
 const memory=await exportMemoryBundleR722(selected);
 const replay=await traceVerifiedMemoryTrajectoryR726(selected,fresh.sources[0].id,fresh.sources.at(-1).id);
 if(replay.packetSha256!==fresh.packetSha256)throw Error('R730 selected chronology differs from verified source');
 const checkpoint=await saveTrajectoryCheckpointR729(selected,replay,cursorId,metricKey);
 const payload={schema:TRAJECTORY_CAPSULE_SCHEMA_R730,memory,checkpoint};
 const serialized=JSON.stringify({...payload,sha256:await digestMemoryR722(JSON.stringify(payload))});
 if(bytes(serialized)>MAX_BYTES)throw Error('R730 portable capsule exceeds byte limit');
 return serialized;
}
export async function importTrajectoryCapsuleR730(serialized){
 if(typeof serialized!=='string'||bytes(serialized)>MAX_BYTES)
  throw Error('R730 portable capsule size refused');
 let record;
 try{record=JSON.parse(serialized)}catch{throw Error('R730 portable capsule JSON refused')}
 if(!exact(record,['schema','memory','checkpoint','sha256'])||
    record.schema!==TRAJECTORY_CAPSULE_SCHEMA_R730||
    typeof record.checkpoint!=='string'||typeof record.sha256!=='string'||!HEX.test(record.sha256))
  throw Error('R730 portable capsule schema refused');
 const {sha256,...payload}=record;
 if(await digestMemoryR722(JSON.stringify(payload))!==sha256)
  throw Error('R730 portable capsule digest mismatch');
 const memory=await verifyMemoryBundleR722(JSON.stringify(record.memory));
 const restored=await restoreTrajectoryCheckpointR729(memory.rows,record.checkpoint);
 if(memory.rows.length!==restored.packet.sourceCount)
  throw Error('R730 capsule contains untraced source rows');
 return {rows:memory.rows,...restored,truthClass:'REVERIFIED_PORTABLE_UNAUTHENTICATED_CAPSULE_ONLY',
  persisted:false,canonicalMutation:false,authenticatedSource:false};
}
