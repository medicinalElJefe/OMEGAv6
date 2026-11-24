import {RECOVERED_SYSTEM_EXECUTION_R512,RECOVERED_SYSTEM_SUMMARY_R512,type R512RecoveredSystemResolution} from '../src/recoveredSoftwareExecutionR512';
import type {RecoveredExecutionCapsuleR512} from './capabilityMenuR512';

const normalizeR512=(value:string)=>value.toLowerCase().replace(/ω/g,'omega').replace(/(\d),(?=\d)/g,'$1').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

export function searchRecoveredSystemsR512(query:string){
 const q=normalizeR512(query);
 if(!q)return Object.freeze([] as R512RecoveredSystemResolution[]);
 const terms=q.split(' ').filter(Boolean);
 return Object.freeze(RECOVERED_SYSTEM_EXECUTION_R512
  .map(row=>{
   const text=normalizeR512([row.systemId,row.artifact,row.family,row.role,row.capability,row.route,row.state].join(' '));
   const exactId=normalizeR512(row.systemId)===q;
   const exactArtifact=normalizeR512(row.artifact)===q;
   const score=terms.every(t=>text.includes(t))?(exactId?100:exactArtifact?80:terms.length*5):0;
   return{row,score};
  })
  .filter(x=>x.score>0)
  .sort((a,b)=>b.score-a.score||a.row.systemId.localeCompare(b.row.systemId))
  .map(x=>x.row));
}

export function recoveredSystemExecutionCapsuleR512(row:R512RecoveredSystemResolution,createdAt=new Date().toISOString()):RecoveredExecutionCapsuleR512{
 const canonical=RECOVERED_SYSTEM_EXECUTION_R512.find(candidate=>candidate.systemId===row.systemId);
 if(!canonical)throw new Error('R512_UNKNOWN_HISTORICAL_SYSTEM_HELD');
 // Resolve every execution field from the canonical registry, not the caller.
 row=canonical;
 const state:RecoveredExecutionCapsuleR512['state']=row.state==='WORKING_SUCCESSOR'?'EXECUTES_NOW':row.state==='GATED_SUCCESSOR'?'TRUTH_GATED':row.state;
 const launchKind:RecoveredExecutionCapsuleR512['launchKind']=row.state==='WORKING_SUCCESSOR'?'EXECUTE':row.state==='GATED_SUCCESSOR'?'EVIDENCE_GATE':row.state==='ARCHIVE_ONLY'?'ARCHIVE':'RESTORE';
 return Object.freeze({
  schema:'OMEGA_RECOVERED_EXECUTION_CAPSULE_R512',
  recoveredId:row.systemId,recoveredName:row.artifact,route:row.route,
  operation:row.state==='ARCHIVE_ONLY'?'INSPECT_ARCHIVE_LINEAGE':row.state==='RESTORATION_REQUIRED'?'INSPECT_RESTORATION_DEBT':`CONTINUE_${row.role}`,
  capabilityId:row.executorCapabilityId,executionDomain:row.executionDomain,state,
  capabilityReality:row.executorReality,receiptAuthority:'R142',admissionAuthority:'R125',
  truthBoundary:row.truth,sourceKind:'SYSTEM_LEDGER',launchKind,createdAt,canonicalMutation:false
 });
}

export const R512_RECOVERED_SYSTEM_SUMMARY=RECOVERED_SYSTEM_SUMMARY_R512;
