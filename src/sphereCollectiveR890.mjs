// R890: bounded selected-agent collective to existing R121 FLOCK scheduler.
// Address membership is explicit; cloud receipts do not mutate local values or canonical authority.
import {agentAddress,agentSnapshot,axes4,neighbors,SIZE} from './sphereAgentFabricR887.mjs';
export const R890_SCHEMA='OMEGA_SPHERE_COLLECTIVE_R890';
export const MAX_R890_PEERS=12;
function validateMember(id){return agentAddress(id),id}
export function collectiveMembersR890(agent,count=9){
 validateMember(agent);
 if(!Number.isSafeInteger(count)||count<1||count>MAX_R890_PEERS)throw new RangeError('Collective count must be 1–12');
 // Deterministic, bounded breadth-first traversal; no incidental runtime activation.
 const seen=new Set([agent]),queue=[agent];
 for(let index=0;index<queue.length&&queue.length<count;index++){
  for(const n of neighbors(queue[index])){if(seen.has(n))continue;seen.add(n);queue.push(n);if(queue.length===count)break}
 }
 if(queue.length!==count)throw new Error('Insufficient reachable peers');
 return queue;
}
export function collectiveRequestR890(fabric,agent,inner,objective,count=9,providerBudget=0){
 if(!Number.isSafeInteger(inner)||inner<0||inner>=SIZE)throw new RangeError('Inner state invalid');
 if(typeof objective!=='string'||!objective.trim()||objective.trim().length>800||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(objective))throw new RangeError('Collective objective invalid');
 if(!Number.isSafeInteger(providerBudget)||providerBudget<0||providerBudget>1)throw new RangeError('Collective model budget 0 or 1');
 const memberIds=collectiveMembersR890(agent,count);
 const before=fabric.active.size;
 const members=memberIds.map(id=>{const {shell,outer}=agentAddress(id),snap=agentSnapshot(fabric,id,inner,1);return{id,shell,outer,inner,outerAxes:axes4(outer),innerAxes:axes4(inner),value:Number(snap.values[0].toFixed(9)),epoch:snap.epoch,authority:'SYNTHETIC_LOCAL_COMPUTATION'}});
 if(before!==fabric.active.size)throw new Error('Read-only group snapshot unexpectedly allocated agent');
 const packet={schema:R890_SCHEMA,rootAgent:agent,inner,memberCount:members.length,members,authority:'OPERATOR_SUPPLIED_SYNTHETIC_LOCAL_COMPUTATION_NOT_EXTERNAL_EVIDENCE',localMutation:false};
 const summary=members.map((m,i)=>'member '+(i+1)+' id='+m.id+' shell='+m.shell+' outer='+m.outer+' inner='+m.inner+' state='+m.value+' epoch='+m.epoch).join('\n');
 const intent='R890 bounded SPHERE collective: '+objective.trim()+'\n'+summary+'\nEach member is independently addressable; reconcile differences without collapsing identities. Treat all values as synthetic, not observations. Return only results/evidence limits, not CanonState admission.';
 return {packet,request:{intent,mode:count===1?'SOLO':'FLOCK',requestedCells:count,providerBudget}};
}
export function collectiveReceiptR890(data,packet){
 if(!packet||packet.schema!==R890_SCHEMA||!Array.isArray(packet.members)||packet.members.length<1||packet.members.length>12)throw new Error('Invalid collective packet');
 if(!data||typeof data!=='object'||!data.mission||typeof data.mission.id!=='string'||!/^[A-Za-z0-9_.:-]{1,128}$/.test(data.mission.id))throw new Error('Invalid cloud mission receipt');
 return Object.freeze({schema:R890_SCHEMA,rootAgent:packet.rootAgent,inner:packet.inner,members:packet.members.map(m=>m.id),missionId:data.mission.id,status:'RECEIVED',authority:'SWARM_RESULT_NOT_CANON_ADMITTED',localMutation:false,returnedProof:'NOT_ESTABLISHED'});
}
export function collectiveStatusR890(data,receipt){
 if(!receipt||receipt.schema!==R890_SCHEMA||!data||data.mission?.id!==receipt.missionId)throw new Error('Collective mission identity mismatch');
 const mission=data.mission,allowed=new Set(['QUEUED','RUNNING','COMPLETE','PAUSED','CANCELLED','FAILED','TIMED_OUT']);
 return Object.freeze({...receipt,status:allowed.has(mission.status)?mission.status:'NOT_REPORTED',completed:Number.isSafeInteger(mission.completed)&&mission.completed>=0?mission.completed:0,failed:Number.isSafeInteger(mission.failed)&&mission.failed>=0?mission.failed:0,summary:typeof mission.finalSynthesis?.text==='string'?mission.finalSynthesis.text.slice(0,1200):'',authority:'SWARM_RESULT_NOT_CANON_ADMITTED',localMutation:false});
}
