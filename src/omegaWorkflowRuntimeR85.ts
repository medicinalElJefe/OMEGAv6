import {compileFullOverallModePlanR79,compactModePlanR79,type OmegaIntentR79} from './fullOverallModeOrchestratorR79';
import {operationMatchesR86,type OmegaOperationR86,type OmegaOperationTypeR86} from './omegaOperationBusR86';
import {compileUltimateCapabilityPlanR108} from './ultimateCapabilityRuntimeR108';

export type WorkflowIntentR85='EXPLORE'|'ANALYZE'|'FORECAST'|'BUILD'|'REPAIR'|'PROVE'|'CREATE'|'CONNECT';
export type WorkflowStepKindR85='OPEN'|'ADVANCE'|'CHECKPOINT'|'VERIFY';
export type WorkflowStepStateR85='PENDING'|'ACTIVE'|'DONE'|'SKIPPED';
export type WorkflowStepR85={
 id:string;
 kind:WorkflowStepKindR85;
 label:string;
 route?:string;
 reason:string;
 state:WorkflowStepStateR85;
 startedAt?:number;
 completedAt?:number;
 beforeAddress?:number;
 afterAddress?:number;
 receiptHash?:string;
 expects?:OmegaOperationTypeR86[];
};
export type WorkflowSessionR85={
 schema:'OMEGA_INTENT_WORKFLOW_R85';
 id:string;
 intent:WorkflowIntentR85;
 goal:string;
 createdAt:number;
 updatedAt:number;
 startAddress:number;
 startStateId:number;
 projectId?:string;
 status:'ACTIVE'|'COMPLETE'|'CANCELLED';
 currentStep:number;
 steps:WorkflowStepR85[];
 modePlan:any;
 capabilityPlan?:any;
 history:Array<{at:number;event:string;stepId?:string;address?:number;detail?:string}>;
 truthBoundary:string;
};

export const WORKFLOW_INTENTS_R85:readonly {id:WorkflowIntentR85;label:string;purpose:string;anchorPanel:string}[]=[
 {id:'EXPLORE',label:'Explore',purpose:'inspect the live field, matter and admitted motion without losing canonical state',anchorPanel:'Visual Instrument'},
 {id:'ANALYZE',label:'Analyze',purpose:'map observations, inspect atlas structure and test mode interpretation',anchorPanel:'Reality Lab'},
 {id:'FORECAST',label:'Forecast',purpose:'inspect future topology, relativity and uncertainty before commitment',anchorPanel:'Forecast'},
 {id:'BUILD',label:'Build',purpose:'develop, assemble, validate and prove a bounded software change',anchorPanel:'Development'},
 {id:'REPAIR',label:'Repair',purpose:'inspect system state, repair the existing build, validate and prove the result',anchorPanel:'System Atlas'},
 {id:'PROVE',label:'Prove',purpose:'collect evidence, validate, govern and preserve a proof receipt',anchorPanel:'Evidence & Proof'},
 {id:'CREATE',label:'Create',purpose:'create from the current packet, inspect the visual result and produce an artifact',anchorPanel:'Create'},
 {id:'CONNECT',label:'Connect',purpose:'inspect Hybrid Link, system state and device-proof boundaries coherently',anchorPanel:'Hybrid Link'}
] as const;

const TEMPLATES:Record<WorkflowIntentR85,Array<Omit<WorkflowStepR85,'id'|'state'>>> = {
 EXPLORE:[
  {kind:'OPEN',label:'Inspect the living visual field',route:'Visual Instrument',reason:'See the active packet through a state-bound visual instrument before changing it.'},
  {kind:'OPEN',label:'Inspect matter structure',route:'Matter Traversal',reason:'Compare the same state through matter/compression/scar structure.'},
  {kind:'ADVANCE',label:'Commit one admitted transition',route:'Traversal',reason:'Move only through the currently admitted AutoPing candidate.',expects:['CANONICAL_TRANSITION_COMMITTED']},
  {kind:'VERIFY',label:'Review proof after traversal',route:'Evidence & Proof',reason:'Check what changed and preserve the evidence boundary.',expects:['PROOF_REFRESHED','PROOF_RECEIPT_EXPORTED']},
  {kind:'CHECKPOINT',label:'Capture a replay checkpoint',route:'Workspace',reason:'Preserve the resulting canonical state and workflow receipt.',expects:['CHECKPOINT_CAPTURED']}
 ],
 ANALYZE:[
  {kind:'OPEN',label:'Analyze observations or current packet',route:'Reality Lab',reason:'Use measured-data mapping when available, otherwise inspect the active state honestly.',expects:['ANALYSIS_COMPLETED']},
  {kind:'OPEN',label:'Inspect canonical atlas position',route:'Atlas',reason:'Locate the result inside the 20,736-state execution lattice.'},
  {kind:'OPEN',label:'Inspect relevant mode interpretation',route:'Modes',reason:'See source-backed modes and canon lenses without promoting gated formulas.'},
  {kind:'VERIFY',label:'Review evidence and proof',route:'Evidence & Proof',reason:'Separate observations, derived structure and uncertainty.',expects:['PROOF_REFRESHED','PROOF_RECEIPT_EXPORTED']},
  {kind:'CHECKPOINT',label:'Save analysis checkpoint',route:'Workspace',reason:'Retain the analyzed state and workflow history.',expects:['CHECKPOINT_CAPTURED']}
 ],
 FORECAST:[
  {kind:'OPEN',label:'Inspect future topology',route:'Forecast',reason:'Start from the current packet and its future-plasticity channels.'},
  {kind:'OPEN',label:'Compare observer frames',route:'Relativity',reason:'Check whether the forecast changes under reference-frame interpretation.'},
  {kind:'ADVANCE',label:'Test one admitted future step',route:'Traversal',reason:'Commit only the current canonical candidate, not an invented branch.',expects:['CANONICAL_TRANSITION_COMMITTED']},
  {kind:'VERIFY',label:'Validate forecast transition',route:'Validation',reason:'Check the transition after enactment.'},
  {kind:'CHECKPOINT',label:'Save forecast checkpoint',route:'Workspace',reason:'Preserve the pre/post route history.',expects:['CHECKPOINT_CAPTURED']}
 ],
 BUILD:[
  {kind:'OPEN',label:'Open governed development',route:'Development',reason:'Work inside the existing application rather than a detached replacement.',expects:['HOST_JOB_QUEUED','BUILD_MISSION_STARTED']},
  {kind:'OPEN',label:'Assemble the build output',route:'Build Out',reason:'Bind build/restore operations to the current product and packet.',expects:['HOST_JOB_PROOF_SELECTED']},
  {kind:'VERIFY',label:'Run validation surface',route:'Validation',reason:'Do not promote a change that is only visually plausible.'},
  {kind:'VERIFY',label:'Review evidence and proof',route:'Evidence & Proof',reason:'Keep execution, source and release evidence explicit.',expects:['PROOF_REFRESHED','PROOF_RECEIPT_EXPORTED']},
  {kind:'CHECKPOINT',label:'Capture build checkpoint',route:'Workspace',reason:'Save a reproducible local continuity point.',expects:['CHECKPOINT_CAPTURED']}
 ],
 REPAIR:[
  {kind:'OPEN',label:'Inspect system and restoration state',route:'System Atlas',reason:'Find the actual broken boundary before changing code or state.'},
  {kind:'OPEN',label:'Repair the existing build',route:'Development',reason:'Preserve working descendants while repairing the scoped fault.',expects:['HOST_JOB_QUEUED','BUILD_MISSION_STARTED']},
  {kind:'VERIFY',label:'Validate repaired behavior',route:'Validation',reason:'Require the repaired route/surface to pass its bounded checks.'},
  {kind:'VERIFY',label:'Check governance boundary',route:'Governance',reason:'Do not convert missing authority or proof into a fake PASS.'},
  {kind:'CHECKPOINT',label:'Capture repair checkpoint',route:'Workspace',reason:'Retain the repaired state and workflow history.',expects:['CHECKPOINT_CAPTURED']}
 ],
 PROVE:[
  {kind:'OPEN',label:'Inspect evidence ledger',route:'Evidence & Proof',reason:'Start with the current source/runtime evidence.',expects:['PROOF_REFRESHED','PROOF_RECEIPT_EXPORTED']},
  {kind:'VERIFY',label:'Run validation',route:'Validation',reason:'Test the current state against explicit acceptance gates.'},
  {kind:'OPEN',label:'Inspect governance decision',route:'Governance',reason:'Separate admissibility from evidence and release authority.'},
  {kind:'OPEN',label:'Inspect quality compiler',route:'Quality Compiler',reason:'Check route and capability quality without relabeling donor presence as execution.'},
  {kind:'CHECKPOINT',label:'Capture proof checkpoint',route:'Workspace',reason:'Preserve the proof state and workflow receipt.'}
 ],
 CREATE:[
  {kind:'OPEN',label:'Open the creation workspace',route:'Create',reason:'Start from the active canonical state and selected intent.'},
  {kind:'OPEN',label:'Inspect the created visual expression',route:'Visual Instrument',reason:'Verify that the result changes the actual visual grammar, not only labels.'},
  {kind:'OPEN',label:'Bring in or inspect assets',route:'Assets',reason:'Use actual browser-local hashed asset intake when needed.',expects:['ASSET_HASHED']},
  {kind:'OPEN',label:'Generate an artifact',route:'Render Queue',reason:'Produce a real client-side SVG/PNG/packet artifact from the current state.',expects:['ARTIFACT_EXPORTED']},
  {kind:'VERIFY',label:'Review proof boundary',route:'Evidence & Proof',reason:'Keep created representation separate from external empirical proof.',expects:['PROOF_REFRESHED','PROOF_RECEIPT_EXPORTED']}
 ],
 CONNECT:[
  {kind:'OPEN',label:'Inspect Hybrid Link',route:'Hybrid Link',reason:'Check authenticated/device proof instead of assuming the PC is online.'},
  {kind:'OPEN',label:'Inspect hosted system state',route:'System',reason:'Compare hosted runtime truth with device/native claims.'},
  {kind:'VERIFY',label:'Review connection evidence',route:'Evidence & Proof',reason:'Keep browser credential readiness, heartbeat proof and native execution distinct.',expects:['PROOF_REFRESHED','PROOF_RECEIPT_EXPORTED']},
  {kind:'OPEN',label:'Inspect control surface',route:'Control Matrix',reason:'See what is actually routable versus gated.'},
  {kind:'CHECKPOINT',label:'Capture connection checkpoint',route:'Workspace',reason:'Preserve the observed connection/proof state.',expects:['CHECKPOINT_CAPTURED']}
 ]
};

const STORAGE='omega.r85.workflow.active';
const ARCHIVE='omega.r85.workflow.archive';

const uid=()=>typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`wf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const cloneSteps=(intent:WorkflowIntentR85):WorkflowStepR85[]=>TEMPLATES[intent].map((x,i)=>({...x,id:`${intent.toLowerCase()}-${i+1}`,state:'PENDING'}));

export function readWorkflowR85():WorkflowSessionR85|null{
 try{const raw=localStorage.getItem(STORAGE);if(!raw)return null;const x=JSON.parse(raw);return x?.schema==='OMEGA_INTENT_WORKFLOW_R85'?x:null}catch{return null}
}
export function writeWorkflowR85(session:WorkflowSessionR85|null){
 try{if(session)localStorage.setItem(STORAGE,JSON.stringify(session));else localStorage.removeItem(STORAGE);window.dispatchEvent(new CustomEvent('omega-r85-workflow-changed',{detail:session}))}catch{}
 return session;
}
export function archiveWorkflowR85(session:WorkflowSessionR85){
 try{const raw=localStorage.getItem(ARCHIVE),rows=raw?JSON.parse(raw):[];localStorage.setItem(ARCHIVE,JSON.stringify([...(Array.isArray(rows)?rows:[]),session].slice(-40)))}catch{}
}
export function startWorkflowR85(intent:WorkflowIntentR85,goal:string,record:any,projectId?:string):WorkflowSessionR85{
 const meta=WORKFLOW_INTENTS_R85.find(x=>x.id===intent)||WORKFLOW_INTENTS_R85[0];
 const plan=compactModePlanR79(compileFullOverallModePlanR79(record,meta.anchorPanel,`${intent} ${goal}`));
 const capabilityPlan=compileUltimateCapabilityPlanR108({intent,goal,surface:meta.anchorPanel,record});
 const now=Date.now();
 const session:WorkflowSessionR85={
  schema:'OMEGA_INTENT_WORKFLOW_R85',
  id:uid(),intent,goal:goal.trim()||meta.purpose,createdAt:now,updatedAt:now,
  startAddress:Number(record?.address)||0,startStateId:Number(record?.stateId)||1,projectId,status:'ACTIVE',currentStep:0,
  steps:cloneSteps(intent),modePlan:plan,capabilityPlan,history:[{at:now,event:'WORKFLOW_STARTED',address:Number(record?.address)||0,detail:`${intent} · ${plan.policy} · ${plan.sourceBackedApplied} source-backed applied · R108 ${capabilityPlan.capabilityCounts.required}/${capabilityPlan.capabilityCounts.total} capabilities required`}],
  truthBoundary:'Workflow execution coordinates existing OMEGA tools, R108 minimum-lawful capability correlation and explicit canonical transitions. Opening a surface or selecting a recovered capability is not proof that its external/native backend exists; catalog-only modes, gated inputs, device proof, empirical claims and release authority remain gated.'
 };
 session.steps[0].state='ACTIVE';session.steps[0].startedAt=now;
 return writeWorkflowR85(session)!;
}
export function cancelWorkflowR85(session:WorkflowSessionR85){
 const next={...session,status:'CANCELLED' as const,updatedAt:Date.now(),history:[...session.history,{at:Date.now(),event:'WORKFLOW_CANCELLED',address:session.steps[session.currentStep]?.afterAddress}]};
 archiveWorkflowR85(next);writeWorkflowR85(null);return next;
}
export function completeWorkflowStepR85(session:WorkflowSessionR85,detail?:{beforeAddress?:number;afterAddress?:number;receiptHash?:string;note?:string}){
 const now=Date.now(),steps=session.steps.map(x=>({...x})),idx=Math.max(0,Math.min(steps.length-1,session.currentStep)),step=steps[idx];
 step.state='DONE';step.completedAt=now;
 if(Number.isFinite(detail?.beforeAddress))step.beforeAddress=detail!.beforeAddress;
 if(Number.isFinite(detail?.afterAddress))step.afterAddress=detail!.afterAddress;
 if(detail?.receiptHash)step.receiptHash=detail.receiptHash;
 const nextIdx=idx+1,status=nextIdx>=steps.length?'COMPLETE' as const:'ACTIVE' as const;
 if(status==='ACTIVE'){steps[nextIdx].state='ACTIVE';steps[nextIdx].startedAt=now}
 const next:WorkflowSessionR85={...session,steps,currentStep:Math.min(nextIdx,steps.length-1),status,updatedAt:now,history:[...session.history,{at:now,event:'STEP_COMPLETED',stepId:step.id,address:detail?.afterAddress??detail?.beforeAddress,detail:detail?.note||step.label}]};
 if(status==='COMPLETE'){archiveWorkflowR85(next);writeWorkflowR85(null);return next}
 return writeWorkflowR85(next)!;
}
export function skipWorkflowStepR85(session:WorkflowSessionR85){
 const now=Date.now(),steps=session.steps.map(x=>({...x})),idx=session.currentStep;steps[idx].state='SKIPPED';steps[idx].completedAt=now;
 const nextIdx=idx+1,status=nextIdx>=steps.length?'COMPLETE' as const:'ACTIVE' as const;
 if(status==='ACTIVE'){steps[nextIdx].state='ACTIVE';steps[nextIdx].startedAt=now}
 const next={...session,steps,currentStep:Math.min(nextIdx,steps.length-1),status,updatedAt:now,history:[...session.history,{at:now,event:'STEP_SKIPPED',stepId:steps[idx].id}]};
 if(status==='COMPLETE'){archiveWorkflowR85(next as WorkflowSessionR85);writeWorkflowR85(null);return next as WorkflowSessionR85}
 return writeWorkflowR85(next as WorkflowSessionR85)!;
}
export function applyOperationToWorkflowR86(session:WorkflowSessionR85,event:OmegaOperationR86){
 if(session.status!=='ACTIVE'||event.workflowId&&event.workflowId!==session.id)return session;
 const step=activeWorkflowStepR85(session);
 if(!step||!operationMatchesR86(step.expects,event))return session;
 return completeWorkflowStepR85(session,{beforeAddress:event.address,afterAddress:event.nextAddress??event.address,receiptHash:event.sha256,note:`${event.type} · ${event.detail}`});
}
export function activeWorkflowStepR85(session:WorkflowSessionR85|null){return session?.status==='ACTIVE'?session.steps[session.currentStep]||null:null}
export function workflowProgressR85(session:WorkflowSessionR85|null){
 if(!session)return{done:0,total:0,pct:0};
 const done=session.steps.filter(x=>x.state==='DONE'||x.state==='SKIPPED').length,total=session.steps.length;
 return{done,total,pct:total?done/total:0};
}
export function admittedNextR85(record:any){
 const n=Number(record?.autoPing?.dataNext);
 return Number.isInteger(n)&&n>=0&&n<20736?n:null;
}
