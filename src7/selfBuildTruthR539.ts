import state from '../public/omega-r170-selfbuild-state.json';
export const R539_SCHEMA='OMEGA_SELFBUILD_OPERATIONAL_TRUTH_R539' as const;
export function selfBuildTruthR539(input:{active:boolean;generation:number;maxAutonomousGenerations:number;admittedSourceCapsules:string[];currentCapsuleId:string|null;receipts?:{capsuleId:string;status:string;canonicalAdmission?:boolean}[]}){
 const admitted=input.admittedSourceCapsules.length;
 const exhausted=admitted>=input.maxAutonomousGenerations;
 const phase=!input.active?'INACTIVE':input.currentCapsuleId?'WAITING_FOR_GOVERNED_MERGE':exhausted?'ROADMAP_EXHAUSTED':'ELIGIBLE_FOR_GATED_SELECTION';
 return{schema:R539_SCHEMA,phase,generation:input.generation,limit:input.maxAutonomousGenerations,admitted,active:input.active,autonomousSourceMutationNow:false,productionDeploymentProvenByThisState:false,requiresSuccessorAdmission:exhausted,receipts:(input.receipts||[]).slice(-5).map(x=>({capsuleId:x.capsuleId,status:x.status,canonicalAdmission:x.canonicalAdmission===true}))};
}
export const currentSelfBuildTruthR539=selfBuildTruthR539(state);
