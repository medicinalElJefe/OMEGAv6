import fs from 'node:fs';
import {planGovernedCandidateR245} from './lib/r245-governed-selfbuild-selection.mjs';
/** Connect recovery evidence to the *existing* governed selector. This is
 * a read-only handoff; the exhausted R170 bounded roadmap cannot be bypassed.
 * Candidate mutation requires separate R245/R503 and CI authority. */
export const R534_HANDOFF_SCHEMA='OMEGA_R534_GOVERNED_RECOVERY_HANDOFF';
export function compileGovernedRecoveryHandoffR534({state,recoveryTasks=[],evidence={}}={}){
 const tasks=Array.isArray(recoveryTasks)?recoveryTasks:[];
 const ids=new Set(),invalid=[];
 for(const t of tasks){
  if(!t||typeof t.capabilityId!=='string'||!t.capabilityId.trim()||ids.has(t.capabilityId)||t.status!=='PLANNED_UNPROVEN'||!Array.isArray(t.deploymentPreconditions)||!t.deploymentPreconditions.includes('PRODUCTION_DEPLOY_PATH_VERIFIED'))invalid.push(String(t?.capabilityId||'INVALID'));
  else ids.add(t.capabilityId);
 }
 const plan=planGovernedCandidateR245({state,evidence});
 const admitted=new Set(state?.admittedSourceCapsules||[]);
 const exhausted=admitted.size>=Number(state?.maxAutonomousGenerations||0);
 const held=invalid.length>0||tasks.length===0||exhausted||plan.state!=='PROPOSE';
 return Object.freeze({schema:R534_HANDOFF_SCHEMA,status:held?'HELD':'PLANNED_ONLY',reason:invalid.length?'INVALID_RECOVERY_TASKS':tasks.length===0?'NO_RECOVERY_TASKS':exhausted?'R170_BOUNDED_ROADMAP_EXHAUSTED':plan.state!=='PROPOSE'?'R245_NO_GOVERNED_CANDIDATE':'SOURCE_MUTATION_REQUIRES_INDEPENDENT_ADMISSION',recoveryTaskCount:tasks.length,invalid,selectedExistingCapsule:plan.state==='PROPOSE'?plan.capsule?.id||null:null,sourceMutationAuthorized:false,productionAdmissionAuthorized:false,canonicalMutation:false,truthBoundary:'Recovery task data informs observation only. No R170 generation-cap override, roadmap injection, unproved patch or admission bypass.'});
}
if(process.argv[1]&&process.argv[1].endsWith('r534-governed-recovery-handoff.mjs')){
 const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
 const tasksPath=process.env.OMEGA_R534_RECOVERY_TASKS_PATH;
 const tasks=tasksPath?JSON.parse(fs.readFileSync(tasksPath,'utf8')):[];
 const rows=Array.isArray(tasks)?tasks:tasks.tasks;
 process.stdout.write(JSON.stringify(compileGovernedRecoveryHandoffR534({state,recoveryTasks:rows}),null,2)+'\n');
}
