export const R155_REVISION='R155';
export const R155_SCHEMA='OMEGA_WHOLE_SYSTEM_CONVERGENCE_AUTHORITY_R155';

export const R155_LAWS=Object.freeze([
 'REVISION_NUMBER_ALONE_NEVER_DETERMINES_AUTHORITY',
 'CAPABILITY_FAMILY_PLUS_PROOF_PLUS_DEPENDENCY_DETERMINES_SUCCESSOR_AUTHORITY',
 'CURRENT_MAIN_WINS_FOR_ALREADY_ADMITTED_EXECUTION_PATHS',
 'MISSING_PROVEN_CAPABILITY_FAMILIES_IMPORT_ADDITIVELY',
 'OVERLAPPING_FILES_MUST_BE_RECONCILED_BY_OWNER_NOT_BLINDLY_COPIED',
 'ONE_CANONSTATE_AUTHORITY_R125',
 'ONE_PUBLIC_RUNTIME_ENTRYPOINT_WORKER_R116',
 'RETURNED_IS_NOT_VERIFIED',
 'ROUTE_IS_NOT_EXECUTION',
 'PROJECTION_IS_NOT_ADMISSION',
 'MODE_CONSENSUS_IS_NOT_EMPIRICAL_TRUTH',
 'CAPACITY_PLAN_IS_NOT_EXECUTION',
 'LOGICAL_FANOUT_IS_NOT_PHYSICAL_WORKER_PROOF',
 'ATLAS_RESOLUTION_IS_NOT_LITERAL_PHYSICAL_DIMENSION',
 'NUMERICAL_SOLVER_CONVERGENCE_IS_NOT_FABRICATION_VALIDATION',
 'RUNTIME_CLOCK_IS_NOT_INDEPENDENT_METROLOGY',
 'PRESERVE_STRONGER_CURRENT_IMPLEMENTATION_AND_HISTORY_BEFORE_MUTATION'
]);

export const R155_CAPABILITY_FAMILIES=Object.freeze({
 CANONICAL_RUNTIME:Object.freeze({
  family:'CANONICAL_RUNTIME',state:'ADMITTED_MAIN',authority:'R116 public Worker + current main',revisionLine:['R116','R127','R132','R141','R142','R143','R146','R147'],purpose:'one public runtime, route contracts, durable runs, executor lifecycle and exact Hybrid closure',dependencies:['R125'],boundary:'runtime/execution proof does not itself admit CanonState'
 }),
 SOVEREIGN_BUILD:Object.freeze({
  family:'SOVEREIGN_BUILD',state:'ADMITTED_MAIN',authority:'R151 build spine + R153 adaptive sovereign build mission',revisionLine:['R151-BUILD','R153-BUILD'],purpose:'current-heartbeat-gated inventory → hash → bounded proof-driven repair → build/test/package',dependencies:['CANONICAL_RUNTIME'],boundary:'browser intent is not native execution; host return still requires R141/R142 closure'
 }),
 OPTICAL_OPERATION:Object.freeze({
  family:'OPTICAL_OPERATION',state:'ADMITTED_MAIN',authority:'R152 optical operational convergence + hardened post-deploy proof',revisionLine:['R152-OPTICAL'],purpose:'20,736-address screening surface, Tier-2 prepared packets, current solver status and live proof diagnostics',dependencies:['CANONICAL_RUNTIME'],boundary:'screening and PREPARED_NOT_SOLVED packets are not RCWA/FDTD execution or fabrication evidence'
 }),
 ALL_MODES_TRUTH:Object.freeze({
  family:'ALL_MODES_TRUTH',state:'INTEGRATED_CANDIDATE',authority:'R151 provenance-weighted all-modes truth fusion',revisionLine:['R151-ALL_MODES'],purpose:'179 source modes + 62 canon/calculus lenses over one packet with provenance-separated 241-channel fusion',dependencies:['CANONICAL_RUNTIME'],boundary:'mode agreement is internal coherence, not independent empirical replication'
 }),
 UNIVERSAL_EVIDENCE:Object.freeze({
  family:'UNIVERSAL_EVIDENCE',state:'INTEGRATED_CANDIDATE',authority:'R152 universal evidence-to-all-modes truth envelope',revisionLine:['R152-EVIDENCE'],purpose:'source-family-aware evidence precedence, uncertainty, contradiction and missing-data acquisition routing',dependencies:['ALL_MODES_TRUTH'],boundary:'maximum-available evidence envelope is not omniscient or absolute truth'
 }),
 CAUSAL_NOW:Object.freeze({
  family:'CAUSAL_NOW',state:'INTEGRATED_CANDIDATE',authority:'R153 lemma motion NOW continuity',revisionLine:['R153-NOW'],purpose:'canonical address + causal NOW + motion + lemma exchange + scar/history + observer projection in one replayable packet',dependencies:['UNIVERSAL_EVIDENCE'],boundary:'projection/time-sector mappings do not manufacture external observations or physical law'
 }),
 RELATIVE_CAPACITY:Object.freeze({
  family:'RELATIVE_CAPACITY',state:'INTEGRATED_CANDIDATE',authority:'R154 motion-relative dimensional capacity fabric',revisionLine:['R154-CAPACITY'],purpose:'operation-relative compute lanes, temporal rate, history depth, view resolution, swarm fanout and solver fidelity',dependencies:['CAUSAL_NOW','CANONICAL_RUNTIME'],boundary:'capacity planning is not invocation, execution proof, empirical truth or CanonState admission'
 }),
 DURABLE_MISSION_GRAPH:Object.freeze({
  family:'DURABLE_MISSION_GRAPH',state:'INTEGRATION_TARGET',authority:'R148 durable multi-operation execution graph',revisionLine:['R148-MISSION'],purpose:'dependency-governed 1–64 node durable mission DAG over R146 runs and R147 executors',dependencies:['CANONICAL_RUNTIME','RELATIVE_CAPACITY'],boundary:'verified execution graph proves node execution receipts only, not factual truth or CanonState'
 }),
 FULLWAVE_COMPUTATION:Object.freeze({
  family:'FULLWAVE_COMPUTATION',state:'INTEGRATION_TARGET',authority:'R145→R149 advanced computation/full-wave/calibration/active-learning line',revisionLine:['R145-SCREEN','R146-SPECTRAL','R147-CALIBRATION','R148-ACTIVE','R149-COVERAGE'],purpose:'reduced-order screening → bounded spectral RCWA promotion → cross-validated feedback → active evidence acquisition → coverage closure',dependencies:['CANONICAL_RUNTIME','UNIVERSAL_EVIDENCE','RELATIVE_CAPACITY'],boundary:'numerical full-wave convergence and calibration are not measured material properties, fabrication validity or independent experimental evidence'
 }),
 INTERFACE_PRESERVATION:Object.freeze({
  family:'INTERFACE_PRESERVATION',state:'INTEGRATION_TARGET',authority:'preservation-first interface convergence',revisionLine:['R146-INTERFACE'],purpose:'44-route desktop/mobile reachability, non-covering navigation, accessibility and specialist-layer preservation',dependencies:['SYSTEM_COMPLETION'],boundary:'reachability and polish do not prove execution'
 }),
 SYSTEM_COMPLETION:Object.freeze({
  family:'SYSTEM_COMPLETION',state:'INTEGRATED_CANDIDATE',authority:'R153 full one-system completion authority',revisionLine:['R153-COMPLETION'],purpose:'100 systems / 24 families / 12 menus / 36 controls / 18 capabilities / 44 routes reconciled against current successor reality',dependencies:['CANONICAL_RUNTIME','SOVEREIGN_BUILD','OPTICAL_OPERATION'],boundary:'successor implementation coverage does not convert evidence/device gates into fictional success'
 })
});

const ORDER=Object.freeze(['CANONICAL_RUNTIME','SOVEREIGN_BUILD','OPTICAL_OPERATION','ALL_MODES_TRUTH','UNIVERSAL_EVIDENCE','CAUSAL_NOW','RELATIVE_CAPACITY','DURABLE_MISSION_GRAPH','FULLWAVE_COMPUTATION','SYSTEM_COMPLETION','INTERFACE_PRESERVATION']);

export function wholeSystemConvergenceManifestR155(){
 const families=ORDER.map(id=>R155_CAPABILITY_FAMILIES[id]);
 const stateCounts=families.reduce((acc,f)=>{acc[f.state]=(acc[f.state]||0)+1;return acc;},{});
 return{
  ok:true,
  schema:R155_SCHEMA,
  revision:R155_REVISION,
  invariant:'ONE CANONICAL PRODUCT / MANY CAPABILITY FAMILIES / EXPLICIT AUTHORITY AND PROOF',
  canonicalAdmission:'R125',
  publicEntrypoint:'src/workerR116.js',
  familyOrder:ORDER,
  families,
  stateCounts,
  collisionPolicy:{revisionNumbers:'NON_AUTHORITATIVE_LABELS',winner:'CURRENT_ADMITTED_OWNER_OR_STRONGER_PROVEN_SUCCESSOR',overlap:'RECONCILE_BY_CAPABILITY_OWNER_AND_INHERITED_GATES',history:'PRESERVE_PREDECESSOR_PROVENANCE'},
  promotionOrder:['repair focused SYSTEM_COMPLETION proof','import non-overlapping proven truth/NOW/capacity modules','reconcile operation/capability-field overlaps','integrate durable mission graph','integrate full-wave computation family','run desktop/mobile interface preservation','run whole inherited matrix + Worker dry-run + live evidence gates','only then promote to main'],
  truthBoundary:'R155 is a convergence and ownership authority. It does not make candidate families canonical merely by listing or importing them. Every family remains subject to its own focused proof, inherited proof chain, runtime/device evidence and R125 CanonState admission boundary.'
 };
}

export function capabilityFamilyR155(id){return R155_CAPABILITY_FAMILIES[String(id||'').toUpperCase()]||null;}

export function assertFamilyDependenciesR155(ids=ORDER){
 const selected=new Set(ids);
 const missing=[];
 for(const id of ids){const family=R155_CAPABILITY_FAMILIES[id];if(!family){missing.push({family:id,dependency:'UNKNOWN_FAMILY'});continue;}for(const dep of family.dependencies)if(R155_CAPABILITY_FAMILIES[dep]&&!selected.has(dep))missing.push({family:id,dependency:dep});}
 return{ok:missing.length===0,selected:[...selected],missing,authority:'DEPENDENCY_CHECK_ONLY_NOT_PROMOTION'};
}
