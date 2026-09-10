import {compileSystemGenomeR268,type CompiledSystemPlan,type FoundryContext,type SystemGenome} from './systemFoundryR268';
import type {ResourceEnvelopeR239} from './hybridResourceGovernorR239';

export type FoundryRuntimeTruthR269={
 authenticatedDeviceHeartbeat:boolean;
 externalBindings:boolean;
 resourceEnvelopeR239?:ResourceEnvelopeR239|null;
 preferredExecutor?:FoundryContext['preferredExecutor'];
};

export type CompiledSystemRuntimePlanR269=CompiledSystemPlan&{
 runtimeTruth:{
  deviceAuthority:'CURRENT_AUTHENTICATED_HEARTBEAT'|'DEVICE_PROOF_REQUIRED';
  resourceAuthority:'R239_CURRENT_ENVELOPE'|'R239_RESOURCE_PROOF_REQUIRED';
  resourceTier:ResourceEnvelopeR239['tier']|'UNAVAILABLE';
  resourceReasons:string[];
  deviceAssistAdmitted:boolean;
  externalAuthority:'BOUND'|'EXTERNAL_DEGRADED';
 };
};

const DEVICE_CAPABILITY='device.compute';
const RESOURCE_REQUIRED='R239_RESOURCE_PROOF_REQUIRED';

export function compileSystemRuntimeR269(genome:SystemGenome,truth:FoundryRuntimeTruthR269):CompiledSystemRuntimePlanR269{
 const envelope=truth.resourceEnvelopeR239||null;
 const base=compileSystemGenomeR268(genome,{
  authenticatedDeviceHeartbeat:truth.authenticatedDeviceHeartbeat,
  externalBindings:truth.externalBindings,
  preferredExecutor:truth.preferredExecutor
 });
 const resourceCurrent=Boolean(envelope&&envelope.snapshotCurrent&&envelope.profileProved&&envelope.profileFresh);
 const deviceAssistAdmitted=Boolean(
  truth.authenticatedDeviceHeartbeat&&resourceCurrent&&envelope&&
  envelope.tier!=='HOLD'&&envelope.tier!=='UNPROVED'&&envelope.admission.VERIFY_PROJECT
 );
 const activeFrontier=base.activeFrontier.map(capability=>{
  if(capability.id!==DEVICE_CAPABILITY||capability.status==='BLOCKED')return capability;
  if(deviceAssistAdmitted)return capability;
  const resourceBlockers=envelope
   ?[`R239_${envelope.tier}`,...envelope.reasons.map(reason=>`R239_${reason}`)]
   :[RESOURCE_REQUIRED];
  return {...capability,status:'BLOCKED' as const,executor:null,blockers:resourceBlockers};
 });
 const blockers=activeFrontier.flatMap(capability=>capability.blockers.map(blocker=>`${capability.id}:${blocker}`));
 const active=activeFrontier.filter(capability=>capability.status==='ACTIVE');
 return {
  ...base,
  activeFrontier,
  blockers,
  estimatedCost:active.reduce((sum,capability)=>sum+capability.cost,0),
  estimatedLatency:active.reduce((sum,capability)=>sum+capability.latency,0),
  proofObligations:[...base.proofObligations,'R269 device assist requires both current device authority and R239 resource admission'],
  runtimeTruth:{
   deviceAuthority:truth.authenticatedDeviceHeartbeat?'CURRENT_AUTHENTICATED_HEARTBEAT':'DEVICE_PROOF_REQUIRED',
   resourceAuthority:resourceCurrent?'R239_CURRENT_ENVELOPE':'R239_RESOURCE_PROOF_REQUIRED',
   resourceTier:envelope?.tier||'UNAVAILABLE',
   resourceReasons:envelope?.reasons||[],
   deviceAssistAdmitted,
   externalAuthority:truth.externalBindings?'BOUND':'EXTERNAL_DEGRADED'
  }
 };
}

export const FOUNDRY_RUNTIME_BOUNDARY_R269={
 revision:'R269',
 planningOnly:true,
 deviceTruth:'current authenticated R238-selected-device heartbeat only',
 resourceTruth:'R239 deterministic envelope over returned R238 host profile + current shared snapshot',
 cloudIndependence:'cloud/browser capabilities remain independently placeable while device assist is detached or resource-held',
 preserved:['R125','R141','R146','R147','R205','R239','R240','R243','.github/workflows/ci.yml']
} as const;
