export type OmegaOperationTypeR86=
 |'SURFACE_OPENED'|'ANALYSIS_COMPLETED'|'REALITY_STATE_COMMITTED'
 |'CANONICAL_TRANSITION_COMMITTED'|'GOVERNANCE_HOLD_RECORDED'
 |'ASSET_HASHED'|'ARTIFACT_EXPORTED'|'PROJECT_CREATED'
 |'CHECKPOINT_CAPTURED'|'MEMORY_SNAPSHOT_CAPTURED'
 |'PROOF_REFRESHED'|'PROOF_RECEIPT_EXPORTED'
 |'COCKPIT_PROOF_REFRESHED'|'HOST_JOB_PROOF_SELECTED';

export type OmegaOperationR86={
 schema:'OMEGA_OPERATION_EVENT_R86';
 id:string;
 at:number;
 type:OmegaOperationTypeR86;
 surface:string;
 stateId?:number;
 address?:number;
 nextAddress?:number;
 workflowId?:string|null;
 status:'PASS'|'HOLD'|'INFO';
 detail:string;
 payload?:Record<string,unknown>;
 sha256:string;
 truthBoundary:string;
};

const KEY='omega.r86.operation.ledger';
const MAX=188;
const enc=new TextEncoder();
const uid=()=>typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
async function hash(v:any){const d=await crypto.subtle.digest('SHA-256',enc.encode(JSON.stringify(v)));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}

export function readOperationLedgerR86():OmegaOperationR86[]{
 try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.filter(v=>v?.schema==='OMEGA_OPERATION_EVENT_R86').slice(-MAX):[]}catch{return[]}
}

export async function emitOperationR86(input:Omit<OmegaOperationR86,'schema'|'id'|'at'|'sha256'|'truthBoundary'>):Promise<OmegaOperationR86>{
 const at=Date.now(),id=uid();
 let workflowId:string|null=null;
 try{workflowId=JSON.parse(localStorage.getItem('omega.r85.workflow.active')||'null')?.id||null}catch{}
 const core={schema:'OMEGA_OPERATION_EVENT_R86' as const,id,at,...input,workflowId:input.workflowId===undefined?workflowId:input.workflowId};
 const sha256=await hash(core);
 const event:OmegaOperationR86={...core,sha256,truthBoundary:'Operation events prove only the browser/runtime action represented by their payload. They do not manufacture native-device, provider, Drive, release, or external empirical authority.'};
 try{
  const rows=readOperationLedgerR86();
  localStorage.setItem(KEY,JSON.stringify([...rows,event].slice(-MAX)));
  window.dispatchEvent(new CustomEvent('omega-r86-operation',{detail:event}));
 }catch{}
 return event;
}

export function operationMatchesR86(expected:readonly OmegaOperationTypeR86[]|undefined,event:OmegaOperationR86){
 return Boolean(expected?.includes(event.type)&&event.status!=='HOLD');
}

export function visualLensForIntentR86(intent:string){
 const map:Record<string,string>={EXPLORE:'SYNTHESIS',ANALYZE:'FIELD',FORECAST:'FORECAST',BUILD:'MODE',REPAIR:'MOTION',PROVE:'MODE',CREATE:'CINEMATIC',CONNECT:'RELATIVITY'};
 return map[String(intent||'').toUpperCase()]||'SYNTHESIS';
}

export function applyWorkflowVisualIntentR86(intent:string){
 try{localStorage.setItem('omega.r65.visual.lens',visualLensForIntentR86(intent))}catch{}
}

export function operationSummaryR86(rows=readOperationLedgerR86()){
 const pass=rows.filter(x=>x.status==='PASS').length,hold=rows.filter(x=>x.status==='HOLD').length;
 return{count:rows.length,pass,hold,last:rows.at(-1)||null,boundary:'Browser/runtime operation ledger only; external/native truth remains separately gated.'};
}
