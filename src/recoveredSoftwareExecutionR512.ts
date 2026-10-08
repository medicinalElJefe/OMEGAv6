import {MASTER_SYSTEMS_R83,routeForSystemR83,type MasterSystemR83} from './softwareMasterLedgerR83';
import {capabilityExecutionContract} from './operationalCapabilityRuntimeR45';

export const R512_RECOVERED_SYSTEM_SCHEMA='OMEGA_RECOVERED_SYSTEM_EXECUTION_R512' as const;
export type R512RecoveredSystemState='WORKING_SUCCESSOR'|'GATED_SUCCESSOR'|'ARCHIVE_ONLY'|'RESTORATION_REQUIRED';

export type R512RecoveredSystemResolution={
 schema:typeof R512_RECOVERED_SYSTEM_SCHEMA;
 systemId:string;
 artifact:string;
 family:string;
 role:string;
 capability:string;
 disposition:string;
 route:string;
 state:R512RecoveredSystemState;
 launchable:boolean;
 executorReality:string;
 executorProof:string;
 truth:string;
};

const ACTIVE=new Set(['RUNTIME_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE']);
const GATED=new Set(['EVIDENCE_GATED','DEVICE_GATED','PROVIDER_GATED']);

export function resolveRecoveredSystemR512(row:MasterSystemR83):R512RecoveredSystemResolution{
 if(String(row.disposition).toUpperCase()==='DONOR'){
  return Object.freeze({
   schema:R512_RECOVERED_SYSTEM_SCHEMA,
   systemId:row.id,artifact:row.artifact,family:row.family,role:row.role,capability:row.capability,disposition:row.disposition,
   route:'Archive Operators',state:'ARCHIVE_ONLY',launchable:false,executorReality:'DONOR_ONLY',
   executorProof:'Historical donor/lineage only; no current standalone executor is claimed.',
   truth:'The historical package remains recoverable lineage. Opening Archive Operators inspects that lineage; it does not claim the old package itself is executing.'
  });
 }
 const route=routeForSystemR83(row);
 let execution:any=null;
 try{execution=capabilityExecutionContract(route)}catch{}
 if(!execution||!execution.routable){
  return Object.freeze({
   schema:R512_RECOVERED_SYSTEM_SCHEMA,
   systemId:row.id,artifact:row.artifact,family:row.family,role:row.role,capability:row.capability,disposition:row.disposition,
   route:'System Atlas',state:'RESTORATION_REQUIRED',launchable:false,executorReality:execution?.reality||'UNRESOLVED',
   executorProof:execution?.proof||'No current routable successor contract.',
   truth:'Visibility in the recovered ledger is not execution. This system remains restoration debt until a current successor is proved.'
  });
 }
 const state:R512RecoveredSystemState=ACTIVE.has(execution.reality)?'WORKING_SUCCESSOR':GATED.has(execution.reality)?'GATED_SUCCESSOR':'RESTORATION_REQUIRED';
 return Object.freeze({
  schema:R512_RECOVERED_SYSTEM_SCHEMA,
  systemId:row.id,artifact:row.artifact,family:row.family,role:row.role,capability:row.capability,disposition:row.disposition,
  route:state==='RESTORATION_REQUIRED'?'System Atlas':route,state,launchable:state!=='RESTORATION_REQUIRED',
  executorReality:execution.reality,executorProof:execution.proof,
  truth:state==='WORKING_SUCCESSOR'
   ?'The current successor executes this recovered capability lineage. This does not claim the historical binary/package is running unchanged.'
   :state==='GATED_SUCCESSOR'
    ?'The current successor surface is executable, but device/provider/evidence results remain proof-gated and are never fabricated.'
    :'No execution claim is admitted.'
 });
}

export const RECOVERED_SYSTEM_EXECUTION_R512=Object.freeze(MASTER_SYSTEMS_R83.map(resolveRecoveredSystemR512));

export const RECOVERED_SYSTEM_SUMMARY_R512=Object.freeze({
 schema:R512_RECOVERED_SYSTEM_SCHEMA,
 total:RECOVERED_SYSTEM_EXECUTION_R512.length,
 keepMerge:RECOVERED_SYSTEM_EXECUTION_R512.filter(x=>x.disposition!=='DONOR').length,
 donor:RECOVERED_SYSTEM_EXECUTION_R512.filter(x=>x.disposition==='DONOR').length,
 working:RECOVERED_SYSTEM_EXECUTION_R512.filter(x=>x.state==='WORKING_SUCCESSOR').length,
 gated:RECOVERED_SYSTEM_EXECUTION_R512.filter(x=>x.state==='GATED_SUCCESSOR').length,
 archiveOnly:RECOVERED_SYSTEM_EXECUTION_R512.filter(x=>x.state==='ARCHIVE_ONLY').length,
 restorationRequired:RECOVERED_SYSTEM_EXECUTION_R512.filter(x=>x.state==='RESTORATION_REQUIRED').length,
 rule:'KEEP_OR_MERGE_REQUIRES_CURRENT_SUCCESSOR; DONOR_REMAINS_ARCHIVE_LINEAGE; HISTORICAL_PACKAGE_IDENTITY_NEVER_EQUALS_CURRENT_EXECUTION_BY_LISTING'
});
