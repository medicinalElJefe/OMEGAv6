import {R155_CAPABILITY_FAMILIES,wholeSystemConvergenceManifestR155} from './wholeSystemConvergenceR155.js';

export const R156_REVISION='R156';
export const R156_SCHEMA='OMEGA_ORGANISM_REFLEX_FABRIC_R156';
export const R156_SCAR_SCHEMA='OMEGA_CROSS_FAMILY_SCAR_R156';
export const R156_ACTIONS=Object.freeze(['STAY','TURN','ESCALATE','HOLD','REJECT']);
export const R156_STAGES=Object.freeze(['OBSERVED','CLASSIFIED','ROUTED','INVOKED','RETURNED','VERIFIED','RECONTEXTUALIZED','ADMISSION_CANDIDATE']);

export const R156_LAWS=Object.freeze([
 'EVERY_SPECIALIST_RESULT_RETURNS_TO_THE_SAME_ORGANISM',
 'RETURNED_IS_NOT_VERIFIED',
 'VERIFIED_IS_NOT_CANONSTATE_ADMITTED',
 'CONTRADICTION_BECOMES_SCAR_AND_FUTURE_ROUTING_INPUT',
 'DOMAIN_MISMATCH_ROUTES_TO_THE_AUTHORITY_THAT_OWNS_THE_STRONGER_DOMAIN',
 'MISSING_EVIDENCE_ROUTES_TO_EVIDENCE_ACQUISITION_NOT_SYNTHETIC_CERTAINTY',
 'EXECUTION_UNPROVEN_ROUTES_TO_FEDERATION_PROOF_NOT_VISUAL_SUCCESS',
 'SOFTWARE_DEFECT_MAY_ROUTE_TO_SELF_DEVELOPMENT_BUT_TRUTH_LAW_MAY_NOT_BE_REWRITTEN',
 'CAPACITY_PRESSURE_CHANGES_ALLOCATION_NOT_TRUTH',
 'INTERFACE_FAILURE_MAY_NOT_DELETE_OR_FLATTEN_SPECIALIST_CAPABILITY',
 'MAX_HOPS_AND_CYCLE_DETECTION_PREVENT_RUNAWAY_REFLEX_LOOPS',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'
]);

const SEVERITY_WEIGHT=Object.freeze({INFO:0.1,LOW:0.25,MEDIUM:0.5,HIGH:0.75,CRITICAL:1});
const ROUTES=Object.freeze({
 DOMAIN_MISMATCH:Object.freeze({targets:['FULLWAVE_COMPUTATION','UNIVERSAL_EVIDENCE'],action:'TURN',reason:'stronger specialist domain must re-evaluate the returned state'}),
 MISSING_EVIDENCE:Object.freeze({targets:['UNIVERSAL_EVIDENCE'],action:'TURN',reason:'acquire or route missing evidence before stronger claims'}),
 TRUTH_CONTRADICTION:Object.freeze({targets:['UNIVERSAL_EVIDENCE','ALL_MODES_TRUTH'],action:'ESCALATE',reason:'separate provenance, contradiction and internal coherence before reuse'}),
 EXECUTION_UNPROVEN:Object.freeze({targets:['FEDERATION_MACHINE','CANONICAL_RUNTIME'],action:'HOLD',reason:'obtain authenticated execution/return proof before promotion'}),
 SOFTWARE_DEFECT:Object.freeze({targets:['SELF_DEVELOPMENT','SYSTEM_COMPLETION'],action:'TURN',reason:'bounded repair under inherited proof and rollback governance'}),
 CAPACITY_PRESSURE:Object.freeze({targets:['RELATIVE_CAPACITY','DURABLE_MISSION_GRAPH','SWARM_ORGANISM'],action:'TURN',reason:'repartition work without changing evidence semantics'}),
 MISSION_DEPENDENCY:Object.freeze({targets:['DURABLE_MISSION_GRAPH','RELATIVE_CAPACITY'],action:'TURN',reason:'resolve dependency ordering before downstream execution'}),
 INTERFACE_OBSTRUCTION:Object.freeze({targets:['INTERFACE_PRESERVATION','LIVING_VISUAL_MOTION'],action:'TURN',reason:'repair reachability while preserving underlying specialist capability'}),
 STALE_NOW:Object.freeze({targets:['CAUSAL_NOW','UNIVERSAL_EVIDENCE'],action:'TURN',reason:'refresh temporal/evidence context before using the state as current'}),
 CANON_MUTATION_REQUEST:Object.freeze({targets:['CANONICAL_RUNTIME'],action:'HOLD',reason:'route only to R125 admission authority after verification'}),
 UNKNOWN:Object.freeze({targets:['UNIVERSAL_EVIDENCE','SYSTEM_COMPLETION'],action:'HOLD',reason:'unclassified residual requires evidence and ownership review'})
});

const normalize=(v,fallback='')=>String(v??fallback).trim().toUpperCase();
const familyExists=id=>Boolean(R155_CAPABILITY_FAMILIES[id]);
const severityOf=v=>SEVERITY_WEIGHT[normalize(v,'MEDIUM')]??SEVERITY_WEIGHT.MEDIUM;
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const fnv1a=text=>{let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193);}return (h>>>0).toString(16).padStart(8,'0');};
const fingerprint=v=>`r156_${fnv1a(JSON.stringify(stable(v)))}`;

function normalizeResidual(r,index){
 const kind=ROUTES[normalize(r?.kind)]?normalize(r.kind):'UNKNOWN';
 return{
  id:String(r?.id||`residual_${index+1}`).slice(0,160),
  kind,
  severity:normalize(r?.severity,'MEDIUM'),
  summary:String(r?.summary||kind).slice(0,600),
  evidence_id:r?.evidence_id?String(r.evidence_id).slice(0,200):null,
  source_state:r?.source_state?String(r.source_state).slice(0,120):null,
  requested_target:r?.requested_target&&familyExists(normalize(r.requested_target))?normalize(r.requested_target):null
 };
}

function routeResidual(residual,sourceFamily){
 const rule=ROUTES[residual.kind]||ROUTES.UNKNOWN;
 const targets=[residual.requested_target,...rule.targets].filter(Boolean).filter(familyExists).filter((v,i,a)=>a.indexOf(v)===i);
 const dependencyAware=targets.map(id=>{
  const f=R155_CAPABILITY_FAMILIES[id];
  return{family:id,state:f.state,authority:f.authority,dependencies:f.dependencies.filter(familyExists),boundary:f.boundary};
 });
 return{residual_id:residual.id,kind:residual.kind,source_family:sourceFamily,action:rule.action,reason:rule.reason,targets:dependencyAware};
}

function chooseAction(routes,residuals){
 const rank={STAY:0,TURN:1,HOLD:2,ESCALATE:3,REJECT:4};
 let action='STAY';
 for(const r of routes)if(rank[r.action]>rank[action])action=r.action;
 const critical=residuals.some(r=>severityOf(r.severity)>=1);
 if(critical&&action==='TURN')action='ESCALATE';
 return action;
}

export function createCrossFamilyScarR156({sourceFamily,returnedState,residuals,routes,priorScars=[]}){
 const body={schema:R156_SCAR_SCHEMA,source_family:sourceFamily,returned_state:returnedState||'RETURNED',residuals:residuals.map(r=>({id:r.id,kind:r.kind,severity:r.severity,evidence_id:r.evidence_id})),routes:routes.map(r=>({residual_id:r.residual_id,action:r.action,targets:r.targets.map(t=>t.family)})),prior_scar_ids:priorScars.map(s=>String(s?.scar_id||s)).slice(0,64)};
 return{...body,scar_id:fingerprint(body),authority:'HISTORY_CARRY_NOT_CANONSTATE',truth_boundary:'R156 scar identity is a deterministic routing fingerprint, not a cryptographic execution receipt or CanonState admission.'};
}

export function compileOrganismReflexR156(event={},options={}){
 const manifest=wholeSystemConvergenceManifestR155();
 const sourceFamily=normalize(event.source_family||event.family);
 if(!familyExists(sourceFamily))return{ok:false,schema:R156_SCHEMA,revision:R156_REVISION,code:'UNKNOWN_SOURCE_FAMILY',source_family:sourceFamily||null,known_families:manifest.familyOrder};
 const residuals=(Array.isArray(event.residuals)?event.residuals:[]).map(normalizeResidual);
 const routes=residuals.map(r=>routeResidual(r,sourceFamily));
 const action=chooseAction(routes,residuals);
 const maxHops=Math.max(1,Math.min(12,Number(options.max_hops??event.max_hops??6)||6));
 const priorFamilies=(Array.isArray(event.path)?event.path:[]).map(normalize).filter(familyExists);
 const targetOrder=[];
 for(const route of routes)for(const target of route.targets)if(!targetOrder.includes(target.family))targetOrder.push(target.family);
 const cycles=targetOrder.filter(id=>priorFamilies.includes(id));
 const boundedTargets=targetOrder.filter(id=>!cycles.includes(id)).slice(0,maxHops);
 const returnedState=normalize(event.returned_state||event.lifecycle_state,'RETURNED');
 const scar=createCrossFamilyScarR156({sourceFamily,returnedState,residuals,routes,priorScars:event.prior_scars||[]});
 const pressure=residuals.reduce((n,r)=>n+severityOf(r.severity),0);
 const invariantCarry={
  canonical_address:event.canonical_address??null,
  packet_id:event.packet_id??null,
  source_family:sourceFamily,
  source_authority:R155_CAPABILITY_FAMILIES[sourceFamily].authority,
  source_boundary:R155_CAPABILITY_FAMILIES[sourceFamily].boundary,
  canonstate_admission_authority:'R125'
 };
 const next=cycles.length&&boundedTargets.length===0?'HOLD_FOR_CYCLE_REVIEW':action==='STAY'?'NO_CROSS_FAMILY_ACTION':'ROUTE_BOUNDED_CROSS_FAMILY';
 return{
  ok:true,schema:R156_SCHEMA,revision:R156_REVISION,
  invariant:'ONE ORGANISM / MANY SPECIALIST ORGANS / EVERY RETURN BECOMES EVIDENCE + SCAR + NEXT-ROUTING INPUT',
  source_family:sourceFamily,returned_state:returnedState,
  action,next,
  residual_pressure:Number(pressure.toFixed(3)),
  invariant_carry:invariantCarry,
  scar,
  residuals,routes,
  bounded_route:{max_hops:maxHops,prior_families:priorFamilies,cycle_hits:cycles,targets:boundedTargets,requires_execution_receipts:true,requires_return_verification:true,canonical_mutation:false},
  stage_contract:['OBSERVED','CLASSIFIED','ROUTED','INVOKED','RETURNED','VERIFIED','RECONTEXTUALIZED','ADMISSION_CANDIDATE'],
  recontextualization:'Returned specialist evidence is compared against the receiving family domain, dependencies and truth boundary. Mismatch is retained as scar/history and changes future routing; it is not erased by selecting a new winner.',
  truth_boundary:'R156 plans and records cross-family reflexes. It does not prove that a target family executed, that returned evidence is true, that a numerical model is physical reality, or that CanonState changed. R125 remains the sole admission authority.'
 };
}

export function organismReflexManifestR156(){
 const r155=wholeSystemConvergenceManifestR155();
 return{
  ok:true,schema:R156_SCHEMA,revision:R156_REVISION,
  inherits:{whole_system:r155.schema,capability_families:r155.familyOrder.length,canonical_admission:r155.canonicalAdmission},
  laws:R156_LAWS,actions:R156_ACTIONS,stages:R156_STAGES,residual_kinds:Object.keys(ROUTES),
  loop:'OBSERVE → CLASSIFY RESIDUAL → ROUTE BY FAMILY AUTHORITY → EXECUTE/RETURN → VERIFY → CARRY SCAR → RECONTEXTUALIZE → REPARTITION',
  organism_equation:'NEXT_STATE = RECONTEXTUALIZE(INVARIANT_CARRY, VERIFIED_RETURN, SCAR_HISTORY, CURRENT_EVIDENCE, RELATIVE_CAPACITY)',
  truth_boundary:'This is a cross-family control/reflex protocol over R155 ownership. It is not a claim of consciousness, autonomous physical agency, unbounded self-modification, or automatic CanonState admission.'
 };
}
