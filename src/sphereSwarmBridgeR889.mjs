// R889 governed SPHERE→R121 cloud swarm adapter.
// Explicit operator invocation only: returned cloud receipts never mutate SPHERE or CanonState.
import {agentAddress,agentSnapshot,axes4,SIZE} from './sphereAgentFabricR887.mjs';
export const R889_SCHEMA='OMEGA_SPHERE_SWARM_BRIDGE_R889';
const MAX_OBJECTIVE=1400;
export function sphereSwarmIntentR889(fabric,agent,inner,objective){
 const {shell,outer}=agentAddress(agent);
 if(!Number.isSafeInteger(inner)||inner<0||inner>=SIZE)throw new RangeError('Inner state address out of range');
 if(typeof objective!=='string'||!objective.trim()||objective.trim().length>MAX_OBJECTIVE||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(objective))throw new RangeError('Objective is required (1–1400 printable characters)');
 const snap=agentSnapshot(fabric,agent,inner,1);
 const state=snap.values[0];
 const packet={schema:R889_SCHEMA,agent,shell,outer,outerAxes:axes4(outer),inner,innerAxes:axes4(inner),stateValue:Number(state.toFixed(10)),epoch:snap.epoch,authority:'OPERATOR_SUPPLIED_SYNTHETIC_LOGICAL_STATE_NOT_INDEPENDENT_EVIDENCE'};
 return {packet,objective:objective.trim(),intent:[
  'R889 SPHERE selected logical agent task. Operator objective: '+objective.trim(),
  'Agent address: shell '+(shell+1)+'/12, outer '+outer+'/20736 ('+packet.outerAxes.join('.')+'), inner '+inner+'/20736 ('+packet.innerAxes.join('.')+').',
  'Local deterministic state value: '+packet.stateValue+'; local epoch '+snap.epoch+'.',
  'Operator-provided computation context only; NOT external measurement. Distinguish inference from proof. Return bounded results and source/evidence limits. No CanonState admission or native host action.'
 ].join('\n')};
}
export function sphereSwarmRequestR889(fabric,agent,inner,objective,providerBudget=0){
 if(providerBudget!==0&&providerBudget!==1)throw new RangeError('Allowed model synthesis budget is 0 or 1 only');
 const {packet,intent}=sphereSwarmIntentR889(fabric,agent,inner,objective);
 return {packet,request:{intent,mode:'SOLO',requestedCells:1,providerBudget}};
}
export function validateSwarmReturnR889(data,packet){
 if(!data||typeof data!=='object'||!data.mission||typeof data.mission!=='object'||typeof data.mission.id!=='string'||!/^[A-Za-z0-9_.:-]{1,128}$/.test(data.mission.id))throw new Error('Swarm returned no valid mission receipt');
 const m=data.mission;
 return Object.freeze({schema:R889_SCHEMA,originAgent:packet.agent,originShell:packet.shell,originOuter:packet.outer,originInner:packet.inner,missionId:m.id,status:typeof m.status==='string'?m.status:'NOT_REPORTED',truthClass:'CLOUD_RECEIPT_RETURNED_NOT_CANON_ADMITTED',externalProof:'NOT_ESTABLISHED_BY_MISSION_ACCEPTANCE',localStateMutated:false});
}
export function validateSwarmStatusR889(data,original){
 if(!original||original.schema!==R889_SCHEMA)throw new Error('Missing original swarm receipt');
 if(!data||typeof data!=='object'||!data.mission||data.mission.id!==original.missionId)throw new Error('Swarm mission identifier mismatch; refusing unrelated receipt');
 const m=data.mission;
 const allowed=['QUEUED','RUNNING','COMPLETE','FAILED','CANCELLED','TIMED_OUT','PAUSED'];
 const status=allowed.includes(m.status)?m.status:'NOT_REPORTED';
 const complete=Number.isSafeInteger(m.completed)&&m.completed>=0?m.completed:0;
 const failed=Number.isSafeInteger(m.failed)&&m.failed>=0?m.failed:0;
 return Object.freeze({...original,status,completed:complete,failed,proofState:typeof m.proofState==='string'?m.proofState:'NOT_REPORTED',hasSynthesis:typeof m.finalSynthesis?.text==='string'&&m.finalSynthesis.text.length>0,reportedSynthesis:typeof m.finalSynthesis?.text==='string'?m.finalSynthesis.text.slice(0,1200):'',truthClass:'CLOUD_RECEIPT_RETURNED_NOT_CANON_ADMITTED',externalProof:'MODEL_OUTPUT_NOT_SCIENTIFIC_EVIDENCE',localStateMutated:false});
}
