// R729: browser-local trajectory checkpoint. A checkpoint is a replay request, not a trusted memory source.
import {digestMemoryR722} from './portableMemoryRecoveryR722.mjs';
import {traceVerifiedMemoryTrajectoryR726,revalidateMemoryTrajectoryR726} from './memoryTrajectoryR726.mjs';
import {buildVerifiedTrajectoryExplorerR727} from './verifiedTrajectoryExplorerR727.mjs';
export const TRAJECTORY_CHECKPOINT_KEY_R729='omega.v6.memory.trajectory.r729';
export const TRAJECTORY_CHECKPOINT_SCHEMA_R729='OMEGA_LOCAL_TRAJECTORY_CHECKPOINT_R729_V1';
const KEYS=['cursorId','endId','metricKey','packetSha256','savedAt','schema','sha256','startId'];
const HEX=/^[0-9a-f]{64}$/;
const MAX=4096;
const encode=x=>JSON.stringify(x);
const bytes=x=>new TextEncoder().encode(x).length;
const fields=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join('|')===KEYS.join('|');
export async function saveTrajectoryCheckpointR729(rows,packet,cursorId,metricKey='address'){
 const fresh=await revalidateMemoryTrajectoryR726(rows,packet);
 if(!fresh.sources.some(x=>x.id===cursorId))throw Error('R729 cursor source identity refused');
 buildVerifiedTrajectoryExplorerR727(fresh,metricKey);
 const payload={schema:TRAJECTORY_CHECKPOINT_SCHEMA_R729,
  startId:fresh.sources[0].id,endId:fresh.sources.at(-1).id,
  cursorId,metricKey,packetSha256:fresh.packetSha256,savedAt:Date.now()};
 const result={...payload,sha256:await digestMemoryR722(encode(payload))};
 const serialized=encode(result);
 if(bytes(serialized)>MAX)throw Error('R729 checkpoint size refused');
 return serialized;
}
export async function restoreTrajectoryCheckpointR729(rows,serialized){
 if(typeof serialized!=='string'||bytes(serialized)>MAX)throw Error('R729 checkpoint size refused');
 let record;
 try{record=JSON.parse(serialized)}catch{throw Error('R729 checkpoint JSON refused')}
 if(!fields(record)||record.schema!==TRAJECTORY_CHECKPOINT_SCHEMA_R729||
    ![record.startId,record.endId,record.cursorId].every(x=>typeof x==='string'&&x.length>=8&&x.length<=100)||
    typeof record.metricKey!=='string'||record.metricKey.length>120||
    !HEX.test(record.packetSha256)||!HEX.test(record.sha256)||
    !Number.isSafeInteger(record.savedAt)||record.savedAt<0||record.savedAt>4102444800000)
  throw Error('R729 checkpoint schema refused');
 const {sha256,...payload}=record;
 if(await digestMemoryR722(encode(payload))!==sha256)throw Error('R729 checkpoint digest mismatch');
 // Verify the complete current local memory store and independently rebuild every edge.
 const packet=await traceVerifiedMemoryTrajectoryR726(rows,record.startId,record.endId);
 if(packet.packetSha256!==record.packetSha256)throw Error('R729 source chronology changed; checkpoint refused');
 const cursor=packet.sources.findIndex(x=>x.id===record.cursorId);
 if(cursor<0)throw Error('R729 selected observation unavailable');
 buildVerifiedTrajectoryExplorerR727(packet,record.metricKey);
 return {packet,cursor,metricKey:record.metricKey,savedAt:record.savedAt,
  truthClass:'REVERIFIED_BROWSER_LOCAL_CHECKPOINT_ONLY'};
}
