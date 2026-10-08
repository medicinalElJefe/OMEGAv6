import {MASTER_SYSTEMS_R83,routeForSystemR83,type MasterSystemR83} from './softwareMasterLedgerR83';
import {capabilityExecutionContract,type ExecutionContract} from './operationalCapabilityRuntimeR45';

export const R512_SOFTWARE_EXECUTION_SCHEMA='OMEGA_RECOVERED_SOFTWARE_EXECUTION_R512' as const;
export type RecoveredSoftwareStateR512='WORKING_SUCCESSOR'|'GATED_SUCCESSOR'|'ARCHIVE_ONLY'|'RESTORATION_REQUIRED';
export type RecoveredSoftwareResolutionR512={
 schema:typeof R512_SOFTWARE_EXECUTION_SCHEMA;
 systemId:string;
 artifact:string;
 family:string;
 disposition:string;
 state:RecoveredSoftwareStateR512;
 launchable:boolean;
 route:string;
 executorReality:string;
 executorProof:string;
 currentMeaning:string;
 truthBoundary:string;
};

const ACTIVE=new Set(['RUNTIME_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE']);
const GATED=new Set(['EVIDENCE_GATED','DEVICE_GATED','PROVIDER_GATED']);

function executionFor(route:string):ExecutionContract|null{
 try{return capabilityExecutionContract(route)}catch{return null}
}

export function resolveRecoveredSoftwareR512(row:MasterSystemR83):RecoveredSoftwareResolutionR512{
 const mappedRoute=routeForSystemR83(row);
 const disposition=String(row.disposition||'').toUpperCase();
 if(disposition==='DONOR'){
  return Object.freeze({
   schema:R512_SOFTWARE_EXECUTION_SCHEMA,
   systemId:row.id,artifact:row.artifact,family:row.family,disposition:row.disposition,
   state:'ARCHIVE_ONLY',launchable:false,route:'Archive Operators',executorReality:'DONOR_ONLY',
   executorProof:'Historical donor/lineage only; no current executor is claimed.',
   currentMeaning:'Inspect lineage, compare implementation, or recover bounded pieces through Archive Operators.',
   truthBoundary:'This historical artifact remains valuable evidence/donor lineage but is not represented as a currently running standalone program.'
  });
 }
 const execution=executionFor(mappedRoute);
 if(!execution||!execution.routable){
  return Object.freeze({
   schema:R512_SOFTWARE_EXECUTION_SCHEMA,
   systemId:row.id,artifact:row.artifact,family:row.family,disposition:row.disposition,
   state:'RESTORATION_REQUIRED',launchable:false,route:'System Atlas',executorReality:execution?.reality||'UNRESOLVED',
   executorProof:execution?.proof||'No current routable execution contract.',
   currentMeaning:'The historical software capability has not yet been bound to a current executable successor.',
   truthBoundary:'Visibility in the recovered ledger is not execution. This row remains restoration debt until a current executor is proved.'
  });
 }
 const state:RecoveredSoftwareStateR512=ACTIVE.has(execution.reality)?'WORKING_SUCCESSOR':GATED.has(execution.reality)?'GATED_SUCCESSOR':'RESTORATION_REQUIRED';
 const launchable=state==='WORKING_SUCCESSOR'||state==='GATED_SUCCESSOR';
 return Object.freeze({
  schema:R512_SOFTWARE_EXECUTION_SCHEMA,
  systemId:row.id,artifact:row.artifact,family:row.family,disposition:row.disposition,
  state,launchable,route:launchable?mappedRoute:'System Atlas',executorReality:execution.reality,
  executorProof:execution.proof,
  currentMeaning:state==='WORKING_SUCCESSOR'
   ?`Runs through the current ${mappedRoute} successor while preserving ${row.artifact} lineage and capability intent.`
   :state==='GATED_SUCCESSOR'
    ?`Opens the current ${mappedRoute} successor; actual external/device/provider work remains proof-gated.`
    :'No proved executable successor.',
  truthBoundary:state==='WORKING_SUCCESSOR'
   ?'Current successor execution is real; this does not claim that the historical binary/package itself is running unchanged.'
   :state==='GATED_SUCCESSOR'
    ?'The current successor surface is executable, but external/device/provider results require returned evidence and are never fabricated.'
    :'No execution claim is admitted.'
 });
}

export const RECOVERED_SOFTWARE_EXECUTION_R512=Object.freeze(MASTER_SYSTEMS_R83.map(resolveRecoveredSoftwareR512));

export const RECOVERED_SOFTWARE_SUMMARY_R512=Object.freeze({
 schema:R512_SOFTWARE_EXECUTION_SCHEMA,
 total:RECOVERED_SOFTWARE_EXECUTION_R512.length,
 working:RECOVERED_SOFTWARE_EXECUTION_R512.filter(x=>x.state==='WORKING_SUCCESSOR').length,
 gated:RECOVERED_SOFTWARE_EXECUTION_R512.filter(x=>x.state==='GATED_SUCCESSOR').length,
 archiveOnly:RECOVERED_SOFTWARE_EXECUTION_R512.filter(x=>x.state==='ARCHIVE_ONLY').length,
 restorationRequired:RECOVERED_SOFTWARE_EXECUTION_R512.filter(x=>x.state==='RESTORATION_REQUIRED').length,
 launchable:RECOVERED_SOFTWARE_EXECUTION_R512.filter(x=>x.launchable).length,
 truth:'KEEP/MERGE rows must resolve to a current executable or explicitly gated successor. DONOR rows remain archive lineage. No historical row becomes executable merely because it is listed.'
});

export function recoveredSoftwareByIdR512(id:string){
 return RECOVERED_SOFTWARE_EXECUTION_R512.find(x=>x.systemId===id)||null;
}
