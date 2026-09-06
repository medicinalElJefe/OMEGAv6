export const R124_SELF_BUILD='OMEGA_R124_SELF_CONTAINED_CONTINUOUS_BUILD' as const;

export type SelfBuildStatus='IDLE'|'OBSERVE'|'PROPOSE'|'SANDBOX'|'TEST'|'COMPARE'|'ADMIT'|'REJECT'|'BLOCKED'|'COMPLETE';
export type SelfBuildRisk='LOW'|'MEDIUM'|'HIGH';
export type SelfBuildCapsule={
 id:string;
 title:string;
 objective:string;
 target:string;
 risk:SelfBuildRisk;
 prerequisites:string[];
 preserves:string[];
 tests:string[];
 expectedGain:number;
 complexity:number;
 contradictionRisk:number;
 operation:'GENERATE_MODULE'|'GENERATE_MANIFEST'|'INTEGRATE_RUNTIME';
};
export type SelfBuildReceipt={
 generation:number;
 capsuleId:string;
 startedAt:string;
 completedAt?:string;
 status:SelfBuildStatus;
 branch?:string;
 commitSha?:string;
 prNumber?:number;
 mergeSha?:string;
 tests:Record<string,boolean>;
 preserved:string[];
 residualBefore:number;
 residualAfter?:number;
 rollbackRef:string;
 notes:string[];
};
export type SelfBuildState={
 schema:'omega.selfbuild.r124.v1';
 authority:'OMEGAV6';
 generation:number;
 maxAutonomousGenerations:number;
 active:boolean;
 currentCapsuleId:string|null;
 admitted:string[];
 rejected:string[];
 blocked:string[];
 receipts:SelfBuildReceipt[];
 laws:readonly string[];
};

export const R124_SELF_BUILD_LAWS=[
 'SELF_BUILD_IS_EVENT_DRIVEN_NOT_CHAT_SCHEDULE_DEPENDENT',
 'ONE_CAPSULE_ONE_BRANCH_ONE_PROOF_RECEIPT',
 'NO_SILENT_MAIN_MUTATION',
 'NO_WHOLESALE_ARCHIVE_DONOR_REPLACEMENT',
 'STRONG_CURRENT_AUTHORITY_ALWAYS_WINS_UNLESS_NEW_EVIDENCE_PROVES_SUPERIOR',
 'EVERY_CANDIDATE_RUNS_FOCUSED_AND_INHERITED_GATES',
 'FAILED_CANDIDATES_ARE_REJECTED_NOT_PATCHED_INTO_MAIN',
 'EVERY_ADMISSION_HAS_ROLLBACK_REF_AND_LINEAGE',
 'SELF_BUILD_MAY_ADVANCE_IMPLEMENTATION_BUT_MAY_NOT_RELAX_TRUTH_BOUNDARIES',
 'NO_GENERATED_SCENE_FALLBACK_FOR_COMPUTED_REALITY',
 'NO_FALSE_PC_ONLINE_OR_SOLVER_VALIDITY_CLAIMS',
 'BACKLOG_EXHAUSTION_ENTERS_OBSERVE_MODE_RATHER_THAN_INVENTING_UNPROVEN_CAPABILITY'
] as const;

export function capsulePriority(c:SelfBuildCapsule,dependencyReady=true){
 if(!dependencyReady)return-1;
 const gain=Math.max(0,c.expectedGain);
 const cost=Math.max(.01,c.complexity+c.contradictionRisk);
 const risk=c.risk==='LOW'?1:c.risk==='MEDIUM'?.72:.42;
 return gain/cost*risk;
}

export function selectNextCapsule(capsules:SelfBuildCapsule[],state:SelfBuildState,available:Set<string>){
 const complete=new Set([...state.admitted,...state.rejected,...state.blocked]);
 return capsules
  .filter(c=>!complete.has(c.id)&&c.prerequisites.every(p=>available.has(p)||state.admitted.includes(p)))
  .map(c=>({c,score:capsulePriority(c,true)}))
  .sort((a,b)=>b.score-a.score||a.c.id.localeCompare(b.c.id))[0]?.c??null;
}

export function admissionAllowed(c:SelfBuildCapsule,results:Record<string,boolean>){
 return c.tests.every(t=>results[t]===true)&&c.preserves.every(t=>results[t]===true);
}

export function nextState(state:SelfBuildState,receipt:SelfBuildReceipt):SelfBuildState{
 const admitted=receipt.status==='ADMIT'?[...new Set([...state.admitted,receipt.capsuleId])]:state.admitted;
 const rejected=receipt.status==='REJECT'?[...new Set([...state.rejected,receipt.capsuleId])]:state.rejected;
 const blocked=receipt.status==='BLOCKED'?[...new Set([...state.blocked,receipt.capsuleId])]:state.blocked;
 return{...state,generation:Math.max(state.generation,receipt.generation),currentCapsuleId:null,admitted,rejected,blocked,receipts:[...state.receipts,receipt].slice(-96)};
}
