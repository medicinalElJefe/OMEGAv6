import {YEAR_CORPUS_EXECUTION_R473,compileCorpusExecutionPlanR473,type CorpusBindingR473,type CorpusExecutionStateR473} from './yearCorpusExecutionR473';

export type OmegaArchitecturePillarR474='CANONICAL_STATE'|'CALCULUS'|'DEVELOPMENTAL_CONTINUITY'|'KNOWLEDGE_ATLASES'|'EXECUTION'|'RENDERING'|'TRAVERSAL'|'MEMORY'|'INTELLIGENCE'|'APPLICATIONS'|'PROOF'|'RECOVERY';
export type CapabilityArtifactKindR474='ENGINE'|'MODEL'|'ATLAS'|'DATASET'|'EXECUTOR'|'RENDERER'|'WORKSPACE'|'APPLICATION'|'NATIVE_TARGET'|'PROOF'|'RECOVERY'|'DONOR'|'SCAR';
export type CapabilityTruthClassR474='CANONICAL_AUTHORITY'|'FORMAL_MODEL'|'DERIVED_REPRESENTATION'|'SOURCE_BOUND'|'PROVIDER_GATED'|'DEVICE_GATED'|'USER_ENTERED'|'OPERATIONAL'|'CREATIVE'|'RECOVERY_ONLY';
export type CapabilityRelationR474='IMPLEMENTS'|'DERIVES_FROM'|'SUPERSEDES'|'DEPENDS_ON'|'EXECUTES'|'PROJECTS'|'PROVES'|'CONTRADICTS'|'RECOVERS'|'PRESENTS';
export type CapabilityDispositionR474='PRESENT'|'SUPERSEDED'|'INTENTIONALLY_DEPRECATED'|'PLATFORM_SPECIFIC'|'QUARANTINED'|'REGRESSION';

export type CapabilityImplementationCandidateR474={id:string;revision:string;chronology:number;quality:number;truthValid:boolean;proofValid:boolean;dependencyCompatible:boolean;governanceValid:boolean};
export type CapabilityNodeR474={
 schema:'OMEGA_YEAR_CORPUS_CAPABILITY_NODE_R474';
 identity:{id:string;name:string;aliases:readonly string[]};
 lineage:{sourceBindingId:string;domain:string;predecessors:readonly string[];relations:readonly CapabilityRelationR474[]};
 function:string;pillar:OmegaArchitecturePillarR474;primaryKind:CapabilityArtifactKindR474;artifactKinds:readonly CapabilityArtifactKindR474[];
 strongestImplementation:{id:string;route:string;operation:string;state:CorpusExecutionStateR473;selectionRule:'STRONGEST_VALID_NOT_NEWEST'};
 evidence:{truthClass:CapabilityTruthClassR474;requirements:readonly string[];currentEvidence:string};
 dependencies:readonly string[];
 currentExecutor:{route:string;operation:string;capabilityId:string;executionDomain:string;reality:string;routable:boolean;receiptAuthority:'R142';admissionAuthority:'R125'};
 presentationSurface:{route:string;generatedFromCapability:true;definesCapability:false};
 remainingGap:string|null;
 supersession:{status:'CURRENT_RESOLUTION';predecessors:readonly string[];scarPolicy:'RETAIN_REJECTIONS_AND_CONTRADICTIONS'};
 canonicalMutation:false;
};

const SET=(...ids:string[])=>new Set(ids);
const RENDERERS=SET('COLOR','FIELD_RENDER','GPU','GPU_NATIVE_V12','CINEMA','SOMA');
const ATLASES=SET('ATLAS','QCD','MATERIALS','ASTRO','LINGUISTICS','WORKBOOK','MODE188');
const MODELS=SET('DEWEY','RSC','WOVEN','MODE188','OVERALL','TURN','FUTURE','SHELL','SPHERE','INFINITY','TEMPORAL','HEIGHTENED','REPLAY','WORLD_MODEL','QCD','MATERIALS','ASTRO','OPTICAL','SYMBOLIC_OPTICS','BIO','BIO_DONOR','WILL','FORECAST_LAE','DYNAMIC_EVOLUTION');
const NATIVE=SET('HYBRID','INSTALL','GPU_NATIVE_V12');
const PROOFS=SET('PROOF','BENCH','IMPLEMENTATION_CANON','B058_PROVENANCE','VALIDATION','R139_148','R169_188');
const RECOVERY=SET('ARCHIVE','RECONSTRUCTION');
const APPLICATIONS=SET('WORKSPACE','COLLECTIONS','DAY','CREATIVE','TEMPLE','HOROSCOPE','HYPERSTACK','WILL','SURFACE_FABRIC');
const DATASETS=SET('EARTH_EVIDENCE','EARTH_CHAIN','WORKBOOK','B058_PROVENANCE');
const INTELLIGENCE=SET('SAI','COGNITION','LOCAL_QA','SAI_PACKS','AGI_QTI','GENESIS','LANGUAGE');
const EXECUTORS=SET('RUNTIME','KERNEL','PACKET','CCR','FEDERATION','INSTALL','HYBRID','DYNAMIC_EVOLUTION','RECONSTRUCTION');

function pillarFor(x:CorpusBindingR473):OmegaArchitecturePillarR474{
 if(x.id==='RUNTIME'||x.id==='PACKET'||x.id==='R139_148')return 'CANONICAL_STATE';
 if(x.id==='HEIGHTENED'||x.id==='REPLAY'||x.id==='DYNAMIC_EVOLUTION')return 'DEVELOPMENTAL_CONTINUITY';
 if(['CALCULUS','GEOMETRY'].includes(x.domain))return 'CALCULUS';
 if(ATLASES.has(x.id)||['SCIENCE','BIOLOGY','LANGUAGE'].includes(x.domain))return 'KNOWLEDGE_ATLASES';
 if(RENDERERS.has(x.id)||x.domain==='RENDER')return 'RENDERING';
 if(['TRAVERSAL','EARTH','SAR','EARTH_CHAIN','EARTH_EVIDENCE','WORLD_MODEL'].includes(x.id))return 'TRAVERSAL';
 if(x.id==='TEMPORAL'||x.id==='FORECAST_LAE')return 'MEMORY';
 if(INTELLIGENCE.has(x.id)||x.domain==='AI')return 'INTELLIGENCE';
 if(APPLICATIONS.has(x.id)||x.domain==='APPLICATIONS')return 'APPLICATIONS';
 if(PROOFS.has(x.id)||x.domain==='PROOF')return 'PROOF';
 if(RECOVERY.has(x.id)||x.domain==='RECOVERY')return 'RECOVERY';
 return 'EXECUTION';
}
function kindsFor(x:CorpusBindingR473):readonly CapabilityArtifactKindR474[]{
 const kinds:CapabilityArtifactKindR474[]=[];
 if(RENDERERS.has(x.id))kinds.push('RENDERER'); if(ATLASES.has(x.id))kinds.push('ATLAS'); if(MODELS.has(x.id))kinds.push('MODEL');
 if(DATASETS.has(x.id))kinds.push('DATASET'); if(NATIVE.has(x.id))kinds.push('NATIVE_TARGET'); if(PROOFS.has(x.id))kinds.push('PROOF');
 if(RECOVERY.has(x.id))kinds.push('RECOVERY'); if(APPLICATIONS.has(x.id))kinds.push('APPLICATION','WORKSPACE');
 if(EXECUTORS.has(x.id)||kinds.length===0)kinds.push('ENGINE','EXECUTOR');
 return [...new Set(kinds)];
}
function truthClassFor(x:CorpusBindingR473):CapabilityTruthClassR474{
 if(x.id==='PROOF'||x.id==='RUNTIME'||x.id==='R139_148')return 'CANONICAL_AUTHORITY';
 if(x.state==='TRUTH_GATED')return /device|native|gpu|hybrid/i.test(x.name+' '+x.truth)?'DEVICE_GATED':'PROVIDER_GATED';
 if(['EARTH','EARTH_CHAIN','EARTH_EVIDENCE','SAR'].includes(x.id))return 'SOURCE_BOUND';
 if(['WILL','HOROSCOPE','HYPERSTACK','COLLECTIONS','DAY'].includes(x.id))return 'USER_ENTERED';
 if(RENDERERS.has(x.id)||x.id==='WORLD_MODEL')return 'DERIVED_REPRESENTATION';
 if(RECOVERY.has(x.id))return 'RECOVERY_ONLY'; if(x.id==='CREATIVE'||x.id==='TEMPLE')return 'CREATIVE';
 if(MODELS.has(x.id)||ATLASES.has(x.id))return 'FORMAL_MODEL'; return 'OPERATIONAL';
}
function requirementsFor(x:CorpusBindingR473,truthClass:CapabilityTruthClassR474){
 const r=['R125_SOLE_CANONSTATE_ADMISSION','R142_EXECUTION_RECEIPT','SCARS_RETAINED'];
 if(truthClass==='SOURCE_BOUND'||truthClass==='PROVIDER_GATED')r.push('SOURCE_PROVENANCE_REQUIRED');
 if(truthClass==='DEVICE_GATED')r.push('EXTERNAL_DEVICE_PROOF_REQUIRED');
 if(x.id==='CCR'||x.id==='FEDERATION')r.push('ONE_CURRENT_LINEAGE','CI_YML_SOLE_PRODUCTION_WRITER','NO_AUTONOMOUS_GOVERNANCE_TEST_SECRET_AUTHORITY_EDITS');
 return r;
}
function gapFor(x:CorpusBindingR473){
 if(x.state==='TRUTH_GATED')return 'CURRENT_EXTERNAL_PROVIDER_DEVICE_OR_NATIVE_PROOF_REQUIRED';
 if(x.state==='EXECUTES_AS_ADAPTER')return 'ADAPTER_ACTIVE_STRONGER_NATIVE_OR_DIRECT_EXECUTOR_MAY_SUPERSEDE_ONLY_WITH_PROOF';
 return null;
}
function toNode(x:CorpusBindingR473):CapabilityNodeR474{
 const plan=compileCorpusExecutionPlanR473(x),kinds=kindsFor(x),truthClass=truthClassFor(x);
 return{schema:'OMEGA_YEAR_CORPUS_CAPABILITY_NODE_R474',identity:{id:x.id,name:x.name,aliases:x.aliases},
  lineage:{sourceBindingId:x.id,domain:x.domain,predecessors:x.aliases,relations:['DERIVES_FROM','EXECUTES','PRESENTS','PROVES']},
  function:x.contribution,pillar:pillarFor(x),primaryKind:kinds[0],artifactKinds:kinds,
  strongestImplementation:{id:x.id+':'+plan.capabilityId,route:x.route,operation:x.operation,state:x.state,selectionRule:'STRONGEST_VALID_NOT_NEWEST'},
  evidence:{truthClass,requirements:requirementsFor(x,truthClass),currentEvidence:x.truth},
  dependencies:[plan.capabilityId,'R125','R142',...(x.state==='TRUTH_GATED'?['EXTERNAL_PROOF']:[])],
  currentExecutor:{route:x.route,operation:x.operation,capabilityId:plan.capabilityId,executionDomain:plan.executionDomain,reality:plan.capabilityReality,routable:plan.routable,receiptAuthority:'R142',admissionAuthority:'R125'},
  presentationSurface:{route:x.route,generatedFromCapability:true,definesCapability:false},remainingGap:gapFor(x),
  supersession:{status:'CURRENT_RESOLUTION',predecessors:x.aliases,scarPolicy:'RETAIN_REJECTIONS_AND_CONTRADICTIONS'},canonicalMutation:false};
}

export const YEAR_CORPUS_CAPABILITY_GRAPH_R474:readonly CapabilityNodeR474[]=YEAR_CORPUS_EXECUTION_R473.map(toNode);
export const OMEGA_ARCHITECTURE_R474=Object.freeze({
 schema:'OMEGA_CAPABILITY_ARCHITECTURE_R474',
 equation:'OMEGA = Canonical State + Calculus + Developmental Continuity + Knowledge/Atlases + Execution + Rendering + Traversal + Memory + Intelligence + Applications + Proof + Recovery',
 pillars:['CANONICAL_STATE','CALCULUS','DEVELOPMENTAL_CONTINUITY','KNOWLEDGE_ATLASES','EXECUTION','RENDERING','TRAVERSAL','MEMORY','INTELLIGENCE','APPLICATIONS','PROOF','RECOVERY'] as const,
 convergenceUnit:'CAPABILITY_LINEAGE_NOT_ROUTE',
 presentationRule:'VIEWS_AND_TOOLS_ARE_GENERATED_FROM_CAPABILITIES_AND_NEVER_DEFINE_CANONICAL_CAPABILITY',
 selectionRule:'STRONGEST_VALID_IMPLEMENTATION_NOT_NEWEST_IMPLEMENTATION',
 conservationRule:'NO_CAPABILITY_MAY_DISAPPEAR_ACROSS_PROMOTION_WITHOUT_EXPLICIT_DISPOSITION_AND_EVIDENCE',
 canonicalMutation:false
});
export function resolveStrongestImplementationR474(candidates:readonly CapabilityImplementationCandidateR474[]){
 const admissible=candidates.filter(x=>x.truthValid&&x.proofValid&&x.dependencyCompatible&&x.governanceValid);
 return [...admissible].sort((a,b)=>b.quality-a.quality||b.chronology-a.chronology)[0]||null;
}
export function auditCapabilityConservationR474(previous:readonly CapabilityNodeR474[],candidate:readonly CapabilityNodeR474[],dispositions:Readonly<Record<string,CapabilityDispositionR474>>={}){
 const next=new Set(candidate.map(x=>x.identity.id)),lost=previous.filter(x=>!next.has(x.identity.id)).map(x=>x.identity.id);
 const unresolvedLosses=lost.filter(id=>!dispositions[id]),regressions=lost.filter(id=>dispositions[id]==='REGRESSION');
 const acceptedResolutions=lost.filter(id=>['SUPERSEDED','INTENTIONALLY_DEPRECATED','PLATFORM_SPECIFIC','QUARANTINED'].includes(dispositions[id]||''));
 return{schema:'OMEGA_CAPABILITY_CONSERVATION_AUDIT_R474' as const,previous:previous.length,candidate:candidate.length,lost,unresolvedLosses,regressions,acceptedResolutions,pass:unresolvedLosses.length===0&&regressions.length===0,rule:OMEGA_ARCHITECTURE_R474.conservationRule};
}
export function auditYearCorpusCapabilityGraphR474(){
 const ids=YEAR_CORPUS_CAPABILITY_GRAPH_R474.map(x=>x.identity.id),duplicateIds=ids.filter((x,i)=>ids.indexOf(x)!==i);
 const unroutable=YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>!x.currentExecutor.routable).map(x=>x.identity.id);
 const shadowAdmission=YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>x.currentExecutor.admissionAuthority!=='R125'||x.canonicalMutation).map(x=>x.identity.id);
 const presentationAuthority=YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>!x.presentationSurface.generatedFromCapability||x.presentationSurface.definesCapability).map(x=>x.identity.id);
 const untyped=YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>!x.primaryKind||!x.pillar||x.artifactKinds.length===0).map(x=>x.identity.id);
 const conservation=auditCapabilityConservationR474(YEAR_CORPUS_CAPABILITY_GRAPH_R474,YEAR_CORPUS_CAPABILITY_GRAPH_R474);
 return{schema:'OMEGA_YEAR_CORPUS_CAPABILITY_GRAPH_AUDIT_R474' as const,capabilities:YEAR_CORPUS_CAPABILITY_GRAPH_R474.length,pillars:OMEGA_ARCHITECTURE_R474.pillars.length,
  executing:YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>x.strongestImplementation.state==='EXECUTES_NOW').length,
  adapters:YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>x.strongestImplementation.state==='EXECUTES_AS_ADAPTER').length,
  truthGated:YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>x.strongestImplementation.state==='TRUTH_GATED').length,
  gapped:YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>x.remainingGap!==null).length,
  duplicateIds:[...new Set(duplicateIds)],unroutable,shadowAdmission,presentationAuthority,untyped,conservation,
  pass:duplicateIds.length===0&&unroutable.length===0&&shadowAdmission.length===0&&presentationAuthority.length===0&&untyped.length===0&&conservation.pass,
  boundary:'R474 proves typed capability-lineage resolution and conservation structure for the recovered R473 corpus. It does not claim every external archive/Drive donor has already been exhaustively fingerprinted; newly recovered artifacts enter as DONOR/SCAR evidence until independently resolved.'};
}
