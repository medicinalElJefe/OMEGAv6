import {applyNodeReceiptR143,compileWholeOperationWeaveR143,dependencyStateR143,joinWholeOperationWeaveR143,manifestR143} from './wholeOperationWeaveR143.js';
import {sha256R134} from './world/canonicalWorldContinuityR134.js';

export const R143_RUN_SCHEMA='OMEGA_WHOLE_OPERATION_RUN_R143';
const safeId=v=>{const s=String(v??'').trim().slice(0,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};
const key=id=>`r143Run:${safeId(id)}`;
const clone=x=>JSON.parse(JSON.stringify(x));

export async function createWholeOperationRunR143(runtime,input={}){
 const graph=input.graph?.schema==='OMEGA_WHOLE_OPERATION_WEAVE_R143'?clone(input.graph):compileWholeOperationWeaveR143(input),id=safeId(input.runId)||`weave_${graph.intentId}`;
 const departureFrame={schema:'OMEGA_CAUSAL_DEPARTURE_FRAME_R143',runId:id,intentId:graph.intentId,at:graph.joinEventTime,stateGeneration:String(input.stateGeneration||'UNBOUND'),stateHash:String(input.stateHash||''),observerId:String(input.observerId||'omega-v6'),canonicalMutation:false};
 const frameDigest=await sha256R134(departureFrame),framed=applyNodeReceiptR143(graph,'N00_FRAME',{state:'VERIFIED',verified:true,proofRef:frameDigest,responseHash:frameDigest,source:'R143_FRAME_FREEZE',sourceIds:['omega-v6'],proofIds:[frameDigest]},{departureFrame,returnFrame:departureFrame});
 const run={schema:R143_RUN_SCHEMA,revision:'R143',id,intentId:graph.intentId,status:'ACTIVE',createdAt:graph.createdAt,updatedAt:graph.createdAt,graph:framed,departureFrame,hostPlan:input.confirmedHostPlan===true&&input.hostPlan?{...clone(input.hostPlan),confirmed:true}:null,joinReceipt:null,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'Durable R143 run state records graph execution and evidence inside the existing OmegaRuntime authority. Creation does not invoke external executors or authorize native host work.'};
 await runtime.put(key(id),run);const ids=await runtime.get('r143RunIndex',[]);await runtime.put('r143RunIndex',[id,...ids.filter(x=>x!==id)].slice(0,80));await runtime.event('R143_RUN_CREATED',`Whole-operation weave ${id} created without automatic external execution.`,{runId:id,intentId:graph.intentId,logicalScale:graph.scale.logicalScale});return run;
}

export async function readWholeOperationRunR143(runtime,id){return runtime.get(key(id),null)}
export async function listWholeOperationRunsR143(runtime){const ids=await runtime.get('r143RunIndex',[]),runs=[];for(const id of ids.slice(0,30)){const run=await readWholeOperationRunR143(runtime,id);if(run)runs.push(run)}return runs}

export async function applyWholeOperationReceiptR143(runtime,id,nodeId,receipt={},frames={}){
 const run=await readWholeOperationRunR143(runtime,id);if(!run)return null;
 const before=run.graph.nodes.find(x=>x.id===nodeId),dep=dependencyStateR143(run.graph,nodeId);if(!before)return{error:'NODE_NOT_FOUND'};
 if(before.id!=='N00_FRAME'&&!dep.ready&&!['RETURNED','INVOKED','RUNNING'].includes(before.state))return{error:'DEPENDENCY_NOT_READY',dependency:dep};
 const graph=applyNodeReceiptR143(run.graph,nodeId,receipt,frames),updated={...run,graph,updatedAt:new Date().toISOString()};await runtime.put(key(id),updated);await runtime.event('R143_NODE_RECEIPT',`Whole-operation node ${nodeId} recorded ${graph.nodes.find(x=>x.id===nodeId)?.state}.`,{runId:id,nodeId,state:graph.nodes.find(x=>x.id===nodeId)?.state,verified:receipt.verified===true});return updated;
}

export async function setWholeOperationInvocationR143(runtime,id,nodeId,invocation={}){
 const run=await readWholeOperationRunR143(runtime,id);if(!run)return null;const dep=dependencyStateR143(run.graph,nodeId),nodes=run.graph.nodes.map(x=>({...x})),node=nodes.find(x=>x.id===nodeId);if(!node)return{error:'NODE_NOT_FOUND'};if(!dep.ready)return{error:'DEPENDENCY_NOT_READY',dependency:dep};if(node.state==='UNAVAILABLE')return{error:'EXECUTOR_UNAVAILABLE'};
 node.state='INVOKED';node.invocation={...clone(invocation),canonicalMutation:false};node.departureFrame=invocation.departureFrame||run.departureFrame;const updated={...run,graph:{...run.graph,nodes,updatedAt:new Date().toISOString()},updatedAt:new Date().toISOString()};await runtime.put(key(id),updated);await runtime.event('R143_NODE_INVOKED',`Whole-operation node ${nodeId} invoked through ${node.executor}.`,{runId:id,nodeId,executor:node.executor});return updated;
}

export async function joinWholeOperationRunR143(runtime,id){
 const run=await readWholeOperationRunR143(runtime,id);if(!run)return null;const dep=dependencyStateR143(run.graph,'N80_JOIN');if(!dep.ready)return{error:'JOIN_DEPENDENCIES_NOT_READY',dependency:dep,run};
 const previousHead=await runtime.get('r143WorldHead',null),joinReceipt=await joinWholeOperationWeaveR143(run.graph,previousHead),graph=applyNodeReceiptR143(run.graph,'N80_JOIN',{state:joinReceipt.state==='VERIFIED_EVIDENCE_SET'?'VERIFIED':'RETURNED',verified:joinReceipt.state==='VERIFIED_EVIDENCE_SET',proofRef:joinReceipt.finalHeadSha256,responseHash:joinReceipt.joinDigest,source:'R143_DETERMINISTIC_JOIN',sourceIds:joinReceipt.sourceIds,proofIds:joinReceipt.proofIds,scarIds:joinReceipt.scarIds},{departureFrame:run.departureFrame,returnFrame:{schema:'OMEGA_CAUSAL_RETURN_FRAME_R143',at:run.graph.joinEventTime+run.graph.nodes.length,stateGeneration:'EVIDENCE_JOIN_ONLY',canonicalMutation:false}}),status=joinReceipt.state==='VERIFIED_EVIDENCE_SET'?'JOINED_VERIFIED_EVIDENCE':'JOINED_WITH_RESIDUALS',updated={...run,status,graph,joinReceipt,updatedAt:new Date().toISOString()};
 await runtime.put('r143WorldHead',{schema:'OMEGA_CANONICAL_WORLD_CONTINUITY_R134',headSha256:joinReceipt.finalHeadSha256,count:joinReceipt.continuity?.count||0,scarCount:joinReceipt.continuity?.scarCount||0,proofCount:joinReceipt.continuity?.proofCount||0});await runtime.put(key(id),updated);await runtime.event('R143_RUN_JOINED',`Whole-operation weave ${id} joined as ${status}.`,{runId:id,status,finalHeadSha256:joinReceipt.finalHeadSha256,heldNodeCount:joinReceipt.heldNodeCount});return updated;
}

export function wholeOperationStoreManifestR143(){return{...manifestR143(),runSchema:R143_RUN_SCHEMA,durability:'EXISTING_OMEGA_RUNTIME_DURABLE_OBJECT',newDurableAuthorityIntroduced:false,mutations:['create run','record invocation','record executor receipt','deterministic join'],nativeExecution:'REQUIRES_EXISTING_HYBRID_EXPLICIT_CONFIRMATION',canonicalMutation:false,canonicalAdmissionAuthority:'R125'}}
