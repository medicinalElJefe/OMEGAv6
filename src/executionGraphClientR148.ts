import {api} from './platformAdapter';
import {operationContractForRouteR143} from './authoritativeOperationChainR143';

export type R148Template='FULL_BUILD'|'SWARM_SYNTHESIS'|'FEDERATION_PROOF'|'LOCAL_INTEGRITY';
export type R148GraphNodeInput={id:string;label:string;intent:string;contract:any;dependsOn:string[];strategy?:string;executionInput?:Record<string,unknown>};
export type R148GraphInput={title:string;intent:string;nodes:R148GraphNodeInput[];maxConcurrency:number;failFast:boolean};
const node=(id:string,route:string,intent:string,dependsOn:string[]=[],strategy='AUTO',executionInput:Record<string,unknown>={}):R148GraphNodeInput=>({id,label:route,intent,contract:operationContractForRouteR143(route),dependsOn,strategy,executionInput});

export function graphTemplateR148(template:R148Template,intent:string,context:{projectPath?:string}={}):R148GraphInput{
 const objective=String(intent||'Advance the current OMEGA operation').trim().slice(0,4000),projectPath=context.projectPath||'.';
 if(template==='FULL_BUILD')return{title:'Full governed build',intent:objective,maxConcurrency:4,failFast:true,nodes:[
  node('intelligence','Kernel Intelligence',`Analyze the implementation objective, constraints, inherited contracts, failure risks and proof requirements. Objective: ${objective}`),
  node('swarm-plan','SAI Lab',`Partition the implementation objective across the OMEGA autonomic execution fabric and reconverge disagreements, missing proof and integration dependencies. Objective: ${objective}`,[],'SWARM',{projection:'BUILD',mode:'AUTO',providerBudget:4}),
  node('native-build','Build Out',`Execute the bounded build on the approved Sovereign project root after explicit operator confirmation. Objective: ${objective}`,['intelligence','swarm-plan'],'AUTO',{projectPath,instructions:objective,confirmed:false}),
  node('validation','Validation',`Validate the completed build operation as an execution/evidence task. Preserve the distinction between a verified execution receipt and factual/canonical truth. Objective: ${objective}`,['native-build'],'SWARM',{projection:'PROOF',mode:'AUTO',providerBudget:3}),
  node('evidence','Evidence & Proof',`Reconverge execution receipts, residual uncertainty, contradiction, burden and missing evidence for the completed build graph. Objective: ${objective}`,['validation'],'SWARM',{projection:'PROOF',mode:'AUTO',providerBudget:3})
 ]};
 if(template==='SWARM_SYNTHESIS')return{title:'Swarm synthesis',intent:objective,maxConcurrency:3,failFast:true,nodes:[
  node('source-intelligence','Kernel Intelligence',`Frame the source-bounded problem and enumerate unresolved assumptions. ${objective}`),
  node('swarm','SAI Lab',`Run distributed analysis over the autonomic hierarchy, preserving disagreement and evidence authority. ${objective}`,[],'SWARM',{mode:'AUTO',providerBudget:6}),
  node('convergence','Convergence',`Converge the independent source-intelligence and swarm execution results without promoting model consensus into truth. ${objective}`,['source-intelligence','swarm'],'FEDERATION',{prompt:objective}),
  node('proof','Evidence & Proof',`Audit the converged operation for missing evidence, uncertainty and contradictions. ${objective}`,['convergence'],'SWARM',{projection:'PROOF',providerBudget:3})
 ]};
 if(template==='FEDERATION_PROOF')return{title:'Federation proof chain',intent:objective,maxConcurrency:2,failFast:true,nodes:[
  node('proposal-frame','Kernel Intelligence',`Frame a candidate request for specialist federation. ${objective}`),
  node('federation','Convergence',`Run the bounded Genesis PROPOSE → Optical SCREEN specialist chain. ${objective}`,['proposal-frame'],'FEDERATION',{prompt:objective}),
  node('proof','Evidence & Proof',`Inspect the specialist return as evidence and identify what still requires solver, observation or canonical admission proof. ${objective}`,['federation'],'SWARM',{projection:'PROOF',providerBudget:2})
 ]};
 return{title:'Local integrity replay',intent:objective,maxConcurrency:1,failFast:true,nodes:[
  node('runtime','System',`Inspect bounded runtime state and execution manifest for the current objective. ${objective}`,[],'AUTO',{localOperation:'MANIFEST'}),
  node('proof','Validation',`Run deterministic execution-ledger replay integrity after the bounded runtime inspection. ${objective}`,['runtime'],'LOCAL',{})
 ]};
}

export async function createOperationGraphR148(input:R148GraphInput){const r=await api.post<any>('/api/execution/graphs',input);return r.data?.graph||r.data}
export async function listOperationGraphsR148(){const r=await api.get<any>('/api/execution/graphs');return r.data?.graphs||[]}
export async function readOperationGraphR148(id:string){const r=await api.get<any>(`/api/execution/graphs/${encodeURIComponent(id)}`);return r.data?.graph||r.data}
export async function authorizeOperationGraphR148(id:string,safeAutoDispatch=true){const r=await api.post<any>(`/api/execution/graphs/${encodeURIComponent(id)}/authorize`,{proofRef:'R148_AUTHENTICATED_OPERATOR_GRAPH_AUTHORIZATION',safeAutoDispatch});return r.data?.graph||r.data}
export async function tickOperationGraphR148(id:string,dispatchNodeIds?:string[]){const r=await api.post<any>(`/api/execution/graphs/${encodeURIComponent(id)}/tick`,dispatchNodeIds?{dispatchNodeIds}:{});return r.data?.graph||r.data}
export async function confirmOperationGraphNodeR148(graphId:string,nodeId:string,executionInput:Record<string,unknown>={}){const r=await api.post<any>(`/api/execution/graphs/${encodeURIComponent(graphId)}/nodes/${encodeURIComponent(nodeId)}/confirm`,{executionInput});return r.data?.graph||r.data}
export async function resumeOperationGraphNodeR148(graphId:string,nodeId:string,executionInput:Record<string,unknown>={}){const r=await api.post<any>(`/api/execution/graphs/${encodeURIComponent(graphId)}/nodes/${encodeURIComponent(nodeId)}/resume`,{executionInput});return r.data?.graph||r.data}
export async function replayOperationGraphR148(id:string){const r=await api.post<any>(`/api/execution/graphs/${encodeURIComponent(id)}/replay`,{});return r.data?.replay||r.data}
export async function cancelOperationGraphR148(id:string){const r=await api.post<any>(`/api/execution/graphs/${encodeURIComponent(id)}/cancel`,{});return r.data?.graph||r.data}
export const R148_GRAPH_BOUNDARY='A graph is a dependency-governed execution plan and receipt lineage. Creation is not authorization; authorization is not native PC confirmation; VERIFIED_EXECUTION_GRAPH means node execution receipts verified under their executor-specific boundaries, not factual truth or CanonState admission.';
