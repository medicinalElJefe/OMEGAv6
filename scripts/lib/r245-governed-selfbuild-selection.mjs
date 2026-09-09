import {attachEvidencePressureR240,candidateScoreR240,planParallelFrontierR240,rankDependencyReadyCapsulesR240} from './r240-recursive-selfbuild-fabric.mjs';
import {planWovenBuildFabricR243} from './r243-woven-selfbuild-fabric.mjs';
import {compileOperationalConvergenceR249} from '../../src/system/operationalConvergenceR249.js';

export const R245_SELECTION_CONTRACT='OMEGA_GOVERNED_SELFBUILD_SELECTION_R245';

export function planGovernedCandidateR245({state={},evidence={}}={}){
 const roadmap=Array.isArray(state?.roadmap)?state.roadmap:[];
 const admitted=new Set(Array.isArray(state?.admittedSourceCapsules)?state.admittedSourceCapsules:[]);
 const configuredMax=Math.max(1,Math.min(12,Math.floor(Number(state?.maxParallelPlanningCells||12))));
 const operational=compileOperationalConvergenceR249({evidence:evidence||{},previousScars:state?.selfBuildScars||[],configuredParallel:configuredMax,effectiveCpuWorkers:configuredMax,executionRequested:false});
 const maxParallel=operational.policy.frontierWidth;
 const pressuredRoadmap=attachEvidencePressureR240(roadmap,evidence||{});
 const frontier=planParallelFrontierR240({roadmap,admitted,maxParallel,evidence:evidence||{}});
 const woven=planWovenBuildFabricR243({roadmap,admitted,maxParallel,evidence:evidence||{},previousScars:state?.selfBuildScars||[]});
 const r249={schema:operational.schema,decision:operational.decision,configuredParallel:configuredMax,effectivePlanningWidth:maxParallel,invariantCarry:operational.invariantCarry,residualPressure:operational.residualPressure,futurePlasticity:operational.futurePlasticity,orientation:operational.orientation,authority:operational.authority,boundary:operational.boundary};
 if(String(woven?.state||'').startsWith('BLOCKED_'))return{schema:R245_SELECTION_CONTRACT,state:'BLOCKED_BY_R243_FABRIC',capsule:null,score:null,frontier,woven,operationalConvergenceR249:r249,canonicalAdmission:false};
 const candidates=rankDependencyReadyCapsulesR240(pressuredRoadmap,admitted,maxParallel);
 const capsule=candidates[0]||null;
 if(capsule&&woven.sourceMutationCandidateId!==capsule.id)return{schema:R245_SELECTION_CONTRACT,state:'BLOCKED_R243_R240_SELECTION_DIVERGENCE',capsule:null,score:null,r240CandidateId:capsule.id,r243CandidateId:woven.sourceMutationCandidateId,frontier,woven,operationalConvergenceR249:r249,canonicalAdmission:false};
 if(!capsule)return{schema:R245_SELECTION_CONTRACT,state:'OBSERVE',reason:'no dependency-ready predefined capsule',capsule:null,score:null,frontier,woven,operationalConvergenceR249:r249,canonicalAdmission:false};
 return{schema:R245_SELECTION_CONTRACT,state:'PROPOSE',capsule,score:candidateScoreR240(capsule),frontier,woven,operationalConvergenceR249:r249,selectionLaw:'R249 narrows the returned-evidence planning frontier; R243 and R240 evaluate the same bounded frontier and must agree on exactly one source-mutation candidate, which remains R240 authority.',canonicalAdmission:false};
}
