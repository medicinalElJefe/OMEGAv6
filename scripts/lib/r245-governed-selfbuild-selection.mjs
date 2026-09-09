import {attachEvidencePressureR240,candidateScoreR240,planParallelFrontierR240,rankDependencyReadyCapsulesR240} from './r240-recursive-selfbuild-fabric.mjs';
import {planWovenBuildFabricR243} from './r243-woven-selfbuild-fabric.mjs';

export const R245_SELECTION_CONTRACT='OMEGA_GOVERNED_SELFBUILD_SELECTION_R245';

export function planGovernedCandidateR245({state={},evidence={}}={}){
 const roadmap=Array.isArray(state?.roadmap)?state.roadmap:[];
 const admitted=new Set(Array.isArray(state?.admittedSourceCapsules)?state.admittedSourceCapsules:[]);
 const maxParallel=Math.max(1,Math.min(12,Math.floor(Number(state?.maxParallelPlanningCells||12))));
 const pressuredRoadmap=attachEvidencePressureR240(roadmap,evidence||{});
 const frontier=planParallelFrontierR240({roadmap,admitted,maxParallel,evidence:evidence||{}});
 const woven=planWovenBuildFabricR243({roadmap,admitted,maxParallel,evidence:evidence||{},previousScars:state?.selfBuildScars||[]});
 if(String(woven?.state||'').startsWith('BLOCKED_'))return{schema:R245_SELECTION_CONTRACT,state:'BLOCKED_BY_R243_FABRIC',capsule:null,score:null,frontier,woven,canonicalAdmission:false};
 const candidates=rankDependencyReadyCapsulesR240(pressuredRoadmap,admitted,maxParallel);
 const capsule=candidates[0]||null;
 if(capsule&&woven.sourceMutationCandidateId!==capsule.id)return{schema:R245_SELECTION_CONTRACT,state:'BLOCKED_R243_R240_SELECTION_DIVERGENCE',capsule:null,score:null,r240CandidateId:capsule.id,r243CandidateId:woven.sourceMutationCandidateId,frontier,woven,canonicalAdmission:false};
 if(!capsule)return{schema:R245_SELECTION_CONTRACT,state:'OBSERVE',reason:'no dependency-ready predefined capsule',capsule:null,score:null,frontier,woven,canonicalAdmission:false};
 return{schema:R245_SELECTION_CONTRACT,state:'PROPOSE',capsule,score:candidateScoreR240(capsule),frontier,woven,selectionLaw:'R243 packetizes/evaluates the dependency-ready sparse frontier and must agree with R240, which retains exactly one source-mutation candidate.',canonicalAdmission:false};
}
