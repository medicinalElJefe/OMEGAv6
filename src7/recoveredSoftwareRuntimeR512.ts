import {YEAR_CORPUS_EXECUTION_R473,compileCorpusExecutionPlanR473,type CorpusExecutionStateR473} from '../src/yearCorpusExecutionR473';

export const R512_RECOVERED_RUNTIME_SCHEMA='OMEGA_RECOVERED_SOFTWARE_RUNTIME_R512' as const;
export const R512_EVENT='omega:r512-recovered-execution' as const;

export type RecoveredLaunchStateR512='CURRENT_EXECUTOR_BOUND'|'CURRENT_ADAPTER_BOUND'|'EVIDENCE_OR_DEVICE_REQUIRED';

export type RecoveredExecutionPacketR512={
 schema:'OMEGA_CORPUS_EXECUTION_INTENT_R473';
 launchSchema:typeof R512_RECOVERED_RUNTIME_SCHEMA;
 launchRevision:'R512';
 id:string;
 name:string;
 route:string;
 operation:string;
 domain:string;
 state:CorpusExecutionStateR473;
 launchState:RecoveredLaunchStateR512;
 capabilityId:string;
 executionDomain:string;
 capabilityReality:string;
 routable:boolean;
 receiptAuthority:'R142';
 admissionAuthority:'R125';
 aliases:readonly string[];
 truthBoundary:string;
 at:string;
 canonicalMutation:false;
};

const launchState=(state:CorpusExecutionStateR473):RecoveredLaunchStateR512=>
 state==='EXECUTES_NOW'?'CURRENT_EXECUTOR_BOUND':
 state==='EXECUTES_AS_ADAPTER'?'CURRENT_ADAPTER_BOUND':
 'EVIDENCE_OR_DEVICE_REQUIRED';

export function recoveredBindingR512(id:string){
 return YEAR_CORPUS_EXECUTION_R473.find(x=>x.id===id)||null;
}

export function actionLabelR512(state:CorpusExecutionStateR473){
 return state==='EXECUTES_NOW'?'Run current executor':
  state==='EXECUTES_AS_ADAPTER'?'Open working adapter':
  'Open required evidence gate';
}

export function launchRecoveredSoftwareR512(id:string):RecoveredExecutionPacketR512|null{
 const binding=recoveredBindingR512(id);
 if(!binding)return null;
 const plan=compileCorpusExecutionPlanR473(binding);
 const packet:RecoveredExecutionPacketR512={
  schema:'OMEGA_CORPUS_EXECUTION_INTENT_R473',
  launchSchema:R512_RECOVERED_RUNTIME_SCHEMA,
  launchRevision:'R512',
  id:binding.id,
  name:binding.name,
  route:binding.route,
  operation:binding.operation,
  domain:binding.domain,
  state:binding.state,
  launchState:launchState(binding.state),
  capabilityId:plan.capabilityId,
  executionDomain:plan.executionDomain,
  capabilityReality:plan.capabilityReality,
  routable:plan.routable,
  receiptAuthority:plan.receiptAuthority,
  admissionAuthority:plan.admissionAuthority,
  aliases:binding.aliases,
  truthBoundary:binding.truth,
  at:new Date().toISOString(),
  canonicalMutation:false,
 };
 try{
  localStorage.setItem('omega.r473.corpusExecutionIntent',JSON.stringify(packet));
  localStorage.setItem('omega.r512.recoveredExecution',JSON.stringify(packet));
  window.dispatchEvent(new CustomEvent('omega:r473-corpus-execution',{detail:packet}));
  window.dispatchEvent(new CustomEvent(R512_EVENT,{detail:packet}));
 }catch{}
 return packet;
}

export function readRecoveredExecutionR512():RecoveredExecutionPacketR512|null{
 try{
  const raw=localStorage.getItem('omega.r512.recoveredExecution');
  if(!raw)return null;
  const parsed=JSON.parse(raw);
  return parsed?.launchSchema===R512_RECOVERED_RUNTIME_SCHEMA&&parsed?.canonicalMutation===false?parsed:null;
 }catch{return null}
}

export const R512_RECOVERED_RUNTIME_LAWS=Object.freeze([
 'HISTORICAL_SOFTWARE_LAUNCHES_CURRENT_EXECUTOR_NOT_SHADOW_BINARY',
 'R473_TYPED_EXECUTION_INTENT_IS_EMITTED_BEFORE_ROUTE_HANDOFF',
 'EXECUTES_NOW_AND_ADAPTER_BIND_OPERATION_CONTEXT',
 'TRUTH_GATED_SOFTWARE_OPENS_THE_REAL_CURRENT_GATE_WITHOUT_FALSE_EXECUTION_CLAIM',
 'R142_REMAINS_EXECUTION_RECEIPT_AUTHORITY',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY',
]);
