export const R124_SELF_BUILD='OMEGA_R124_SELF_CONTAINED_CONTINUOUS_BUILD' as const;
export const R170_GEOMETRIC_MOTION_BUILD='OMEGA_R170_GEOMETRIC_MOTION_AUTONOMOUS_BUILD' as const;

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
export type GeometricMotionFrameR170={
 phase:number;
 phaseBand:number;
 orientation:-1|0|1;
 continuity:number;
 residual:number;
 invariantCarry:number;
 scarCarry:number;
 angularVelocity:number;
 radialPosition:number;
 repartitionDemand:number;
 effectiveResolution:12|144|1728|20736|248832;
 boundary:string;
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
 'BACKLOG_EXHAUSTION_ENTERS_OBSERVE_MODE_RATHER_THAN_INVENTING_UNPROVEN_CAPABILITY',
 'R170_GEOMETRIC_MOTION_RELATIVITY_PRIORITIZES_WITHIN_PROVEN_BACKLOG_ONLY',
 'R170_PARTITION_EXCHANGE_INVARIANT_SCAR_REPARTITION_DRIVES_BUILD_ORDER_NOT_TRUTH',
 'R170_AUTONOMOUS_PULSE_NEVER_BYPASSES_SANDBOX_TEST_FRESHNESS_ADMISSION',
 'R170_SCHEDULED_OBSERVATION_MAY_WAKE_BUILD_BUT_MAY_NOT_INVENT_CAPABILITY',
 'R170_RELATIVE_FRAME_MOTION_MAY_CHANGE_PRIORITY_BUT_NEVER_CANONSTATE'
] as const;

const TAU=Math.PI*2;
const clamp01=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const RESOLUTION=[12,144,1728,20736,248832] as const;

export function capsulePriority(c:SelfBuildCapsule,dependencyReady=true){
 if(!dependencyReady)return-1;
 const gain=Math.max(0,c.expectedGain);
 const cost=Math.max(.01,c.complexity+c.contradictionRisk);
 const risk=c.risk==='LOW'?1:c.risk==='MEDIUM'?.72:.42;
 return gain/cost*risk;
}

export function deriveGeometricMotionFrameR170(state:SelfBuildState,capsules:SelfBuildCapsule[]):GeometricMotionFrameR170{
 const total=Math.max(1,capsules.length),complete=new Set([...state.admitted,...state.rejected,...state.blocked]).size;
 const continuity=clamp01(state.admitted.length/total),residual=clamp01((total-complete)/total),scarCarry=clamp01((state.rejected.length+state.blocked.length)/total);
 const phaseBand=((Math.max(0,state.generation)%12)+12)%12,phase=phaseBand/12*TAU,s=Math.sin(phase),orientation:(-1|0|1)=Math.abs(s)<1e-9?0:s>0?1:-1;
 const invariantCarry=clamp01(.58*continuity+.26*(1-residual)+.16*(1-scarCarry));
 const angularVelocity=.08+.42*residual+.18*scarCarry,radialPosition=clamp01(.18+.68*continuity+.14*invariantCarry),repartitionDemand=clamp01(.52*residual+.28*scarCarry+.20*(1-invariantCarry));
 const demand=clamp01(.38*continuity+.34*repartitionDemand+.18*invariantCarry+.10*angularVelocity),index=demand<.22?0:demand<.4?1:demand<.58?2:demand<.78?3:4;
 return{phase,phaseBand,orientation,continuity,residual,invariantCarry,scarCarry,angularVelocity,radialPosition,repartitionDemand,effectiveResolution:RESOLUTION[index],boundary:'R170 geometric motion is a software scheduling frame derived from self-build state. It changes relative priority and representational resolution only; it is not physical motion, empirical measurement, execution proof, or CanonState.'};
}

export function geometricMotionPriorityR170(c:SelfBuildCapsule,state:SelfBuildState,capsules:SelfBuildCapsule[]){
 const base=capsulePriority(c,true);if(base<0)return base;
 const frame=deriveGeometricMotionFrameR170(state,capsules),index=Math.max(0,capsules.findIndex(x=>x.id===c.id)),targetPhase=index/Math.max(1,capsules.length)*TAU;
 const phaseAlignment=.5+.5*Math.cos(targetPhase-frame.phase),invariantCarry=clamp01(c.expectedGain*(1-c.contradictionRisk)),scar=clamp01(c.complexity*c.contradictionRisk),exchange=clamp01(.5*phaseAlignment+.3*frame.repartitionDemand+.2*(1-scar));
 const relativeMotion=clamp01(.34*exchange+.31*invariantCarry+.20*(1-scar)+.15*(1-Math.abs(frame.radialPosition-(index+1)/Math.max(1,capsules.length))));
 return base*(.72+.56*relativeMotion);
}

export function selectNextCapsule(capsules:SelfBuildCapsule[],state:SelfBuildState,available:Set<string>){
 const complete=new Set([...state.admitted,...state.rejected,...state.blocked]);
 return capsules
  .filter(c=>!complete.has(c.id)&&c.prerequisites.every(p=>available.has(p)||state.admitted.includes(p)))
  .map(c=>({c,score:geometricMotionPriorityR170(c,state,capsules)}))
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
