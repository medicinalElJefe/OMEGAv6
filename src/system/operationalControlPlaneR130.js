export const R130_REVISION='R130';
export const R130_SCHEMA='OMEGA_OPERATIONAL_CONTROL_PLANE_R130';
export const R130_HIERARCHY={seed:1,organs:12,branches:144,cells:1728,lanes:20736};
export const R130_LAWS=[
 'ONE_PUBLIC_RUNTIME_ENTRYPOINT',
 'CAPABILITY_REGISTRY_IS_MACHINE_READABLE',
 'REACHABILITY_IS_NOT_EXECUTION_PROOF',
 'EXECUTION_PROOF_IS_NOT_EMPIRICAL_VALIDATION',
 'EMPIRICAL_VALIDATION_IS_NOT_CANONSTATE',
 'MISSING_OR_STALE_STATUS_REMAINS_UNKNOWN',
 'PC_ONLINE_REQUIRES_AUTHENTICATED_HEARTBEAT',
 'SYNTHETIC_DATA_HAS_ZERO_EXTERNAL_VALIDATION_CREDIT',
 'EVERY_HIGH_AUTHORITY_RESULT_RETAINS_PROVENANCE_AND_REPLAY_IDENTITY',
 'R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'
];

const MODULES=[
 {revision:'R121',id:'SWARM',layer:'EXECUTION',state:'ADMITTED',authority:'EXECUTION_NOT_TRUTH',purpose:'1,728-cell / 20,736-lane logical swarm fabric'},
 {revision:'R123',id:'ORGANISM',layer:'EXECUTION',state:'ADMITTED',authority:'EXECUTION_NOT_TRUTH',purpose:'seed → organ → branch → cell hierarchy'},
 {revision:'R125',id:'AUTONOMIC',layer:'GOVERNANCE',state:'ADMITTED',authority:'CANONICAL_ADMISSION',purpose:'bounded routing, checkpoint/rejoin, accuracy-first admission'},
 {revision:'R126',id:'CAUSAL',layer:'REASONING',state:'ADMITTED',authority:'CAUSAL_CANDIDATE_NOT_CANON',purpose:'evidence-backed causal candidate compilation with uncertainty/scar carry'},
 {revision:'R126',id:'MAXIMUM_RUNTIME',layer:'ORCHESTRATION',state:'ADMITTED',authority:'EXECUTION_FABRIC_NOT_CANON',purpose:'bounded whole-body logical execution hierarchy'},
 {revision:'R127',id:'PROOF_FABRIC',layer:'PROOF',state:'ADMITTED',authority:'CANDIDATE_NOT_CANON',purpose:'source → causal → plan → receipt → independent verification'},
 {revision:'R128',id:'EMPIRICAL_VALIDATION',layer:'VALIDATION',state:'ADMITTED',authority:'VALIDATION_EVIDENCE_NOT_CANON',purpose:'external calibration/holdout/reproduction with deterministic replay identity'},
 {revision:'R129',id:'EXPERIMENT_RUNTIME',layer:'VALIDATION',state:'ADMITTED',authority:'EXPERIMENT_LEDGER_NOT_CANON',purpose:'reproducible experiment CLI, artifact hashes and replay manifests'},
 {revision:'R130',id:'CONTROL_PLANE',layer:'OPERATIONS',state:'CANDIDATE',authority:'OBSERVABILITY_NOT_CANON',purpose:'single operational registry and health matrix'}
];

export const R130_PROBES=[
 {id:'health',path:'/api/health'},
 {id:'status',path:'/api/status'},
 {id:'restoration',path:'/api/restoration'},
 {id:'hybrid',path:'/api/hybrid/status'},
 {id:'convergence',path:'/api/system/convergence'},
 {id:'federation',path:'/api/federation/run/status'},
 {id:'autonomic',path:'/api/swarm/autonomic/manifest'}
];

export function manifestR130(){return{
 ok:true,schema:R130_SCHEMA,revision:R130_REVISION,canonicalOrigin:'https://omegav6.jeffdeweyeljefe.workers.dev',hierarchy:R130_HIERARCHY,entrypoint:'src/workerR116.js',modules:MODULES,
 stageOrder:['SOURCE','PROVENANCE','CAUSAL','PLAN','EXECUTION','RECEIPT','VERIFY','EMPIRICAL_HOLDOUT','REPLAY_LEDGER','R125_ADMISSION'],laws:R130_LAWS,
 organization:{execution:['R121','R123','R125','R126 maximum runtime'],reasoning:['R126 causal'],proof:['R127'],validation:['R128','R129'],operations:['R130'],canonicalAdmission:'R125'},
 truthBoundary:'R130 organizes and observes inherited capabilities. Registry membership or endpoint reachability does not prove native machine execution, scientific correctness, external validation, or CanonState.'
};}

function normalize(probes){
 const byId=Object.fromEntries(probes.map(p=>[p.id,p])),hybrid=byId.hybrid?.body||{},convergence=byId.convergence?.body||{},autonomic=byId.autonomic?.body||{};
 const authenticatedPc=Boolean(hybrid?.nativeExecutionClaimed===true&&Array.isArray(hybrid?.devices)&&hybrid.devices.some(d=>d?.online===true&&d?.revoked!==true));
 const missing=probes.filter(p=>!p.reachable).map(p=>p.id),hierarchyOk=autonomic?.hierarchy?.cells===1728&&autonomic?.hierarchy?.lanes===20736;
 return{state:missing.length?'DEGRADED':'REACHABLE',reachableCount:probes.length-missing.length,requiredCount:probes.length,missing,canonicalRuntime:convergence?.canonical?.state||'UNKNOWN',sovereign:{authenticatedHeartbeat:authenticatedPc,nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true},swarm:{hierarchyVerifiedFromManifest:Boolean(hierarchyOk),cells:autonomic?.hierarchy?.cells??null,lanes:autonomic?.hierarchy?.lanes??null},authority:'OPERATIONAL_OBSERVATION_NOT_CANON'};
}

export async function operationalR130(request,env,inheritedFetch){
 const probes=await Promise.all(R130_PROBES.map(async probe=>{try{const target=new URL(probe.path,request.url),response=await inheritedFetch(new Request(target,{method:'GET',headers:request.headers}),env),body=await response.clone().json().catch(()=>null);return{id:probe.id,path:probe.path,httpStatus:response.status,reachable:response.ok,body};}catch(error){return{id:probe.id,path:probe.path,httpStatus:0,reachable:false,error:String(error instanceof Error?error.message:error)}}}));
 const summary=normalize(probes);
 return{ok:summary.missing.length===0,schema:'OMEGA_OPERATIONAL_HEALTH_MATRIX_R130',revision:R130_REVISION,observedAt:new Date().toISOString(),hierarchy:R130_HIERARCHY,summary,probes:probes.map(p=>({id:p.id,path:p.path,httpStatus:p.httpStatus,reachable:p.reachable,error:p.error||null})),proofBoundaries:{allRoutesReachable:summary.missing.length===0,pcOnlineProved:summary.sovereign.authenticatedHeartbeat,logicalSwarmHierarchyObserved:summary.swarm.hierarchyVerifiedFromManifest,live1728IndependentCloudDeploymentsProved:false,externalScientificValidationProved:false,canonicalMutation:false},nextAction:summary.missing.length?'Repair unreachable inherited routes before expanding capability.':summary.sovereign.authenticatedHeartbeat?'Operational spine reachable; continue proof-bounded external experiments and workload execution.':'Operational spine reachable; PC remains offline until a current authenticated heartbeat is observed.',truthBoundary:'HTTP reachability is service-health evidence only. It cannot be promoted into execution proof, empirical validation, scientific truth, or canonical admission.'};
}
