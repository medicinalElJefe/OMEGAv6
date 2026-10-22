export const R164_REVISION='R164';
export const R164_SCHEMA='OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164';
export const R164_CANONICAL_ADMISSION_AUTHORITY='R125';

export const R164_LAWS=Object.freeze([
 'OBSERVATION_IS_NOT_MUTATION',
 'RESIDUAL_CLASSIFICATION_IS_NOT_REPAIR_AUTHORIZATION',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'R163_FIRST_HAND_CORE_HEALTH_REMAINS_RUNTIME_LIVENESS_AUTHORITY',
 'R144_REMAINS_DEPLOYMENT_ATTESTATION_AUTHORITY',
 'R143_ROUTE_AUTHORITY_AND_R142_EXECUTION_LIFECYCLE_REMAIN_DISTINCT',
 'R141_RETURN_PROOF_REMAINS_STRONGER_THAN_ROUTE_OR_SELECTION_STATE',
 'R156_REFLEX_ROUTING_MAY_PROPOSE_BUT_NEVER_SELF_ADMIT',
 'R162_AUTHORIZATION_MAY_DISPATCH_BUT_DOES_NOT_PROVE_RETURN_OR_ADMISSION',
 'PC_OFFLINE_DOES_NOT_MEAN_CANONICAL_WORKER_OFFLINE',
 'WORKER_LIVE_DOES_NOT_MEAN_PC_ONLINE',
 'OPTIONAL_EXECUTION_PLANE_DEGRADATION_CANNOT_ERASE_REQUIRED_CORE_LIVENESS',
 'HIGH_OR_CRITICAL_TRUTH_GAPS_NEVER_AUTO_REPAIR',
 'EVERY_GRAPH_EDGE_PRESERVES_SOURCE_ROLE_AND_AUTHORITY_BOUNDARY'
]);

export const R164_AUTHORITY_NODES=Object.freeze([
 {id:'R163_CORE_HEALTH',revision:'R163',role:'CANONICAL_RUNTIME_LIVENESS',source:'src/workerR116.js'},
 {id:'R162_GOVERNED_EXECUTION',revision:'R162',role:'AUTHORIZED_REFLEX_DISPATCH',source:'src/execution/governedReflexExecutionR162.js'},
 {id:'R161_DURABLE_HANDOFF',revision:'R161',role:'DURABLE_EXECUTION_INTENT_HANDOFF',source:'src/execution/reflexMissionDurableHandoffR161.js'},
 {id:'R160_REFLEX_INGRESS',revision:'R160',role:'POST_RETURN_REFLEX_OPERATION_INGRESS',source:'src/world/reflexOperationIngressR160.ts'},
 {id:'R159_SOVEREIGN_CONVERGENCE',revision:'R159',role:'POST_RETURN_SOVEREIGN_CONVERGENCE',source:'src/execution/sovereignExecutionConvergenceR159.js'},
 {id:'R156_REFLEX_ROUTER',revision:'R156',role:'RESIDUAL_CLASSIFICATION_AND_FAMILY_ROUTING',source:'src/system/organismReflexR156.js'},
 {id:'R147_EXECUTOR_FABRIC',revision:'R147',role:'EXECUTOR_BINDING_AND_DISPATCH',source:'src/execution/unifiedExecutorFabricR147.js'},
 {id:'R146_DURABLE_EXECUTION',revision:'R146',role:'DURABLE_OPERATION_HISTORY',source:'src/execution/durableOperationExecutionR146.js'},
 {id:'R144_DEPLOYMENT_ATTESTATION',revision:'R144',role:'DEPLOYMENT_AND_RUNTIME_VERSION_ATTESTATION',source:'src/workerR27.js'},
 {id:'R143_OPERATION_CHAIN',revision:'R143',role:'ROUTE_TO_CAPABILITY_AUTHORITY',source:'src/authoritativeOperationChainR143.ts'},
 {id:'R142_CAPABILITY_LIFECYCLE',revision:'R142',role:'EXECUTION_LIFECYCLE_RECEIPT_AUTHORITY',source:'src/capabilityExecutionReceiptsR142.ts'},
 {id:'R141_HYBRID_PROOF',revision:'R141',role:'EXACT_HYBRID_RETURN_PROOF',source:'src/hybridProofClosureR141.js'},
 {id:'R125_ACCURACY_ADMISSION',revision:'R125',role:'BOUNDED_REPAIR_AND_CANONSTATE_ADMISSION',source:'src/accuracyResidualEngineR125.ts'},
 {id:'R124_SELF_BUILD',revision:'R124',role:'PROOF_GATED_SELF_BUILD_CAPSULE_AUTHORITY',source:'public/omega-r124-selfbuild-state.json'}
]);

export const R164_AUTHORITY_EDGES=Object.freeze([
 ['R143_OPERATION_CHAIN','R142_CAPABILITY_LIFECYCLE','ROUTE_REQUIRES_EXECUTION_LIFECYCLE'],
 ['R142_CAPABILITY_LIFECYCLE','R141_HYBRID_PROOF','RETURN_REQUIRES_EXACT_PROOF_WHEN_HYBRID'],
 ['R141_HYBRID_PROOF','R159_SOVEREIGN_CONVERGENCE','VERIFIED_RETURN_FEEDS_POST_RETURN_CONVERGENCE'],
 ['R159_SOVEREIGN_CONVERGENCE','R160_REFLEX_INGRESS','POST_RETURN_STATE_MAY_EMIT_REFLEX_INGRESS'],
 ['R160_REFLEX_INGRESS','R161_DURABLE_HANDOFF','REFLEX_MISSION_MAY_BECOME_DURABLE_INTENT'],
 ['R161_DURABLE_HANDOFF','R162_GOVERNED_EXECUTION','DURABLE_INTENT_REQUIRES_EXPLICIT_AUTHORIZATION'],
 ['R162_GOVERNED_EXECUTION','R147_EXECUTOR_FABRIC','AUTHORIZED_RUN_DELEGATES_TO_EXISTING_EXECUTOR_FABRIC'],
 ['R147_EXECUTOR_FABRIC','R146_DURABLE_EXECUTION','EXECUTOR_STATE_IS_RECORDED_IN_DURABLE_RUN_HISTORY'],
 ['R163_CORE_HEALTH','R144_DEPLOYMENT_ATTESTATION','LIVE_RUNTIME_MUST_REMAIN_DISTINCT_FROM_DEPLOYMENT_ATTESTATION'],
 ['R156_REFLEX_ROUTER','R125_ACCURACY_ADMISSION','REFLEX_PROPOSALS_REMAIN_REVIEW_OR_ADMISSION_GATED'],
 ['R124_SELF_BUILD','R125_ACCURACY_ADMISSION','SELF_BUILD_DELTAS_REQUIRE_ACCURACY_AND_ADMISSION_GATES']
]);

const text=v=>String(v??'').trim();
const severityRank={LOW:1,MEDIUM:2,HIGH:3,CRITICAL:4};
const modeRank={OBSERVE_ONLY:1,QUEUE_FOR_REVIEW:2,BLOCK:3};
const safeSeverity=v=>['LOW','MEDIUM','HIGH','CRITICAL'].includes(v)?v:'MEDIUM';
const safeMode=v=>['OBSERVE_ONLY','QUEUE_FOR_REVIEW','BLOCK'].includes(v)?v:'OBSERVE_ONLY';

function normalizedEvidence(e={}){
 return{kind:text(e.kind||'EVIDENCE'),source:text(e.source||'UNKNOWN'),claim:text(e.claim||''),verified:e.verified===true,value:e.value??null};
}

export function normalizeResidualR164(r={},index=0){
 const severity=safeSeverity(text(r.severity).toUpperCase());
 let mode=safeMode(text(r.mode).toUpperCase());
 if(severity==='CRITICAL')mode='BLOCK';
 if(severity==='HIGH'&&mode==='OBSERVE_ONLY')mode='QUEUE_FOR_REVIEW';
 return{
  id:text(r.id||`R164-${index+1}`).slice(0,180),
  kind:text(r.kind||'UNCLASSIFIED_RESIDUAL').slice(0,120),
  severity,
  mode,
  summary:text(r.summary||'Residual requires evidence review.').slice(0,800),
  affected:Array.isArray(r.affected)?r.affected.map(x=>text(x)).filter(Boolean).slice(0,32):[],
  evidence:Array.isArray(r.evidence)?r.evidence.map(normalizedEvidence).slice(0,32):[],
  sourceAuthority:text(r.sourceAuthority||'R125'),
  canonicalMutation:false,
  canonicalAdmissionAuthority:R164_CANONICAL_ADMISSION_AUTHORITY
 };
}

function addRuntimeResiduals(out,runtime={}){
 const core=runtime.coreHealth;
 if(core&&!(core.ok===true&&core.state==='LIVE'&&core.schema==='OMEGA_CANONICAL_CORE_HEALTH_R163'))out.push(normalizeResidualR164({id:'R164-CORE-HEALTH-GAP',kind:'CORE_RUNTIME_LIVENESS_GAP',severity:'CRITICAL',mode:'BLOCK',summary:'First-hand canonical core health is not LIVE.',affected:['/api/core-health'],sourceAuthority:'R163',evidence:[{kind:'RUNTIME',source:'/api/core-health',claim:'R163 core health is LIVE',verified:true,value:core?.state||'MISSING'}]}));
 const release=runtime.releaseEvidence,attestation=runtime.runtimeAttestation;
 if(release&&attestation&&text(release?.source?.sha)&&text(attestation?.source?.sha)&&release.source.sha!==attestation.source.sha)out.push(normalizeResidualR164({id:'R164-DEPLOYMENT-SOURCE-MISMATCH',kind:'DEPLOYMENT_LINEAGE_GAP',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'Release evidence and runtime attestation disagree on promoted source SHA.',affected:['/api/release-evidence','/api/runtime-attestation'],sourceAuthority:'R144',evidence:[{kind:'DEPLOYMENT',source:'/api/release-evidence',claim:'promoted source SHA',verified:true,value:release.source.sha},{kind:'DEPLOYMENT',source:'/api/runtime-attestation',claim:'attested source SHA',verified:true,value:attestation.source.sha}]}));
 const hybrid=runtime.hybrid;
 if(hybrid){
  const online=hybrid.nativeExecutionClaimed===true&&Array.isArray(hybrid.devices)&&hybrid.devices.some(d=>d?.online===true&&d?.revoked!==true);
  if(!online)out.push(normalizeResidualR164({id:'R164-HYBRID-DEVICE-PROOF-REQUIRED',kind:'HYBRID_DEVICE_PROOF_REQUIRED',severity:'MEDIUM',mode:'OBSERVE_ONLY',summary:'No current authenticated non-revoked Hybrid device heartbeat is present. Canonical Worker health remains independent.',affected:['/api/hybrid/status'],sourceAuthority:'R163/R141',evidence:[{kind:'RUNTIME',source:'/api/hybrid/status',claim:'current authenticated device heartbeat',verified:true,value:false}]}));
 }
}

function addWorkflowResiduals(out,workflowEvidence=[]){
 for(const [index,run] of workflowEvidence.entries()){
  if(run?.status!=='completed'||!run?.conclusion||['success','skipped'].includes(run.conclusion))continue;
  const high=/R163|R162|R161|R160|R159|R156|R147|R146|R144|R143|R142|R141|R125|R124/i.test(text(run.workflowName));
  out.push(normalizeResidualR164({id:`R164-WORKFLOW-${run.databaseId||index+1}`,kind:'WORKFLOW_EVIDENCE_FAILURE',severity:high?'HIGH':'MEDIUM',mode:high?'QUEUE_FOR_REVIEW':'OBSERVE_ONLY',summary:`Workflow ${text(run.workflowName||'unknown')} concluded ${text(run.conclusion)}.`,affected:[text(run.workflowName||'unknown')],sourceAuthority:'GITHUB_ACTIONS',evidence:[{kind:'TEST',source:text(run.url||'github-actions'),claim:'workflow conclusion',verified:true,value:text(run.conclusion)},{kind:'SOURCE',source:text(run.headSha||'UNKNOWN'),claim:'observed source SHA',verified:Boolean(run.headSha),value:text(run.headSha||'UNKNOWN')}]}));
 }
}

function dedupeResiduals(items){
 const map=new Map();
 for(const item of items){
  const current=map.get(item.id);
  if(!current||severityRank[item.severity]>severityRank[current.severity]||(severityRank[item.severity]===severityRank[current.severity]&&modeRank[item.mode]>modeRank[current.mode]))map.set(item.id,item);
 }
 return[...map.values()].sort((a,b)=>severityRank[b.severity]-severityRank[a.severity]||modeRank[b.mode]-modeRank[a.mode]||a.id.localeCompare(b.id));
}

export function buildDevelopmentResidualGraphR164({accuracyState={},runtimeEvidence={},workflowEvidence=[]}={}){
 const residuals=[];
 for(const [index,r] of (Array.isArray(accuracyState?.residuals)?accuracyState.residuals:[]).entries())residuals.push(normalizeResidualR164({...r,sourceAuthority:'R125'},index));
 addRuntimeResiduals(residuals,runtimeEvidence);
 addWorkflowResiduals(residuals,workflowEvidence);
 const ranked=dedupeResiduals(residuals),blocking=ranked.filter(r=>r.mode==='BLOCK'),review=ranked.filter(r=>r.mode==='QUEUE_FOR_REVIEW');
 return{
  ok:blocking.length===0,
  schema:R164_SCHEMA,
  revision:R164_REVISION,
  state:blocking.length?'BLOCKED':ranked.length?'RESIDUALS_PRESENT':'HEALTHY',
  authority:'OMEGAV6',
  authorityNodes:R164_AUTHORITY_NODES,
  authorityEdges:R164_AUTHORITY_EDGES,
  residuals:ranked,
  summary:{total:ranked.length,blocking:blocking.length,review:review.length,observe:ranked.length-blocking.length-review.length},
  policies:{canonicalMutation:false,autonomousMutationAuthority:false,canonicalAdmissionAuthority:R164_CANONICAL_ADMISSION_AUTHORITY,highOrCriticalAutoRepair:false,runtimeLivenessAuthority:'R163',deploymentAuthority:'R144',returnProofAuthority:'R141',reflexRoutingAuthority:'R156'},
  evidenceSources:{accuracy:'/omega-r125-accuracy-state.json',coreHealth:'/api/core-health',releaseEvidence:'/api/release-evidence',runtimeAttestation:'/api/runtime-attestation',hybrid:'/api/hybrid/status',federation:'/api/federation/run/status'},
  truthBoundary:'R164 is a read-only development/evidence graph. It may classify and rank explicit residual evidence, but it cannot mutate source, dispatch a machine, prove a PC online, validate an RCWA result, promote a returned execution, or admit CanonState. Those authorities remain with their existing proof layers, with R125 remaining the sole CanonState admission authority.'
 };
}

export function manifestR164(){
 return{schema:R164_SCHEMA,revision:R164_REVISION,laws:R164_LAWS,authorityNodes:R164_AUTHORITY_NODES,authorityEdges:R164_AUTHORITY_EDGES,canonicalMutation:false,autonomousMutationAuthority:false,canonicalAdmissionAuthority:R164_CANONICAL_ADMISSION_AUTHORITY,truthBoundary:'Development residual graph authority is observational only; evidence aggregation never becomes mutation or CanonState admission authority.'};
}
