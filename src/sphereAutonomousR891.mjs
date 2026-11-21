// R891 deterministic bounded autonomy: explicit local-only scheduling for independently addressable agents.
// No remote inference, network, durable persistence, or new CanonState writer.
import {AGENTS,SIZE,neighbors,stateValue,submitTask,stepFabric} from './sphereAgentFabricR887.mjs';
export const R891_SCHEMA='OMEGA_SPHERE_AUTONOMOUS_LOCAL_R891';
export function autonomousTickR891(fabric,members,inner,cursor=0,budget=1){
 if(!fabric||!Array.isArray(members)||members.length<1||members.length>12||new Set(members).size!==members.length||members.some(x=>!Number.isSafeInteger(x)||x<0||x>=AGENTS))throw new RangeError('Autonomous group must have 1–12 distinct valid agent IDs');
 if(!Number.isSafeInteger(inner)||inner<0||inner>=SIZE||!Number.isSafeInteger(cursor)||cursor<0||!Number.isSafeInteger(budget)||budget<1||budget>12)throw new RangeError('Invalid autonomous tick coordinate/budget');
 // Operator-authored queue has strict precedence: do not silently overwrite or reorder work.
 if(fabric.queue.length){const receipts=stepFabric(fabric,Math.min(budget,fabric.queue.length));return{schema:R891_SCHEMA,mode:'OPERATOR_QUEUE_FIRST',receipts,nextCursor:cursor,cloudCalls:0,canonicalWrites:0}}
 const receipts=[];let nextCursor=cursor;
 for(let iteration=0;iteration<Math.min(budget,members.length);iteration++){
  const id=members[nextCursor%members.length],peers=neighbors(id).filter(n=>members.includes(n));
  const own=stateValue(fabric,id,inner);
  let target=null,contrast=0;
  for(const p of peers){const d=Math.abs(own-stateValue(fabric,p,inner));if(d>contrast){contrast=d;target=p}}
  const kind=target!==null&&contrast>.15?'EXCHANGE':'RELAX';
  const participants=kind==='EXCHANGE'?[id,target]:[id];
  const missing=participants.filter(n=>!fabric.active.has(n)).length;
  if(fabric.active.size+missing>512)return{schema:R891_SCHEMA,mode:'HELD_CAPACITY',receipts,nextCursor,cloudCalls:0,canonicalWrites:0,refusal:'No agent state or queue was mutated for the refused task'};
  submitTask(fabric,{agent:id,kind,inner,target:kind==='EXCHANGE'?target:null,weight:.20});
  receipts.push(...stepFabric(fabric,1));nextCursor++;
 }
 return{schema:R891_SCHEMA,mode:'LOCAL_DETERMINISTIC_AUTONOMY',receipts,nextCursor,cloudCalls:0,canonicalWrites:0}
}
