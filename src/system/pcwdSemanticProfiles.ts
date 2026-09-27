import{
 UNIFIED_PCWD_SCHEMA,UNIFIED_PCWD_STAGES,UNIFIED_PCWD_GATES,UNIFIED_PCWD_BOUNDARY,
 verifyUnifiedProofTransportV1,type UnifiedDecisionV1,
}from'./unifiedProofTransportKernel';

export const PCWD_SEMANTIC_PROFILE_SCHEMA='OMEGA_PCWD_DOMAIN_SEMANTICS_PROFILE_v1' as const;
export const PCWD_CROSS_DOMAIN_PROJECTION_SCHEMA='OMEGA_PCWD_CROSS_DOMAIN_INVARIANT_PROJECTION_v1' as const;
export const PCWD_SEMANTIC_BOUNDARY='R360 separates structural proof invariants from domain semantics. Identical field names do not make raw values comparable across domains. Cross-domain comparison is allowed only for explicitly structural fields or metrics whose semantic profile declares the same semantic identity, unit, scale, and comparison rule.' as const;

export type MetricScaleV1='BOOLEAN'|'COUNT'|'PROBABILITY'|'RATIO'|'SIGNED'|'NONNEGATIVE'|'NORM'|'DOMAIN_LOCAL';
export type MetricDescriptorV1={
 id:string;
 meaning:string;
 unit:string;
 scale:MetricScaleV1;
 comparison:'EQUALITY'|'ORDER'|'DISTANCE'|'NONE';
 crossDomainComparable:boolean;
};
export type DomainSemanticsProfileV1={
 schema:typeof PCWD_SEMANTIC_PROFILE_SCHEMA;
 domain:string;
 domainVersion:string;
 stateSpace:string;
 transportMeaning:string;
 recoveryMeaning:string;
 evidenceMeaning:string;
 scarMeaning:string;
 pathMeaning:string;
 observablesMeaning:string;
 governanceMetrics:{
  continuity:MetricDescriptorV1;
  futurePlasticity:MetricDescriptorV1;
  contradiction:MetricDescriptorV1;
  burden:MetricDescriptorV1;
 };
 errorMetrics:{
  recovery:MetricDescriptorV1;
  dynamics:MetricDescriptorV1;
  observables:MetricDescriptorV1;
  path:MetricDescriptorV1;
  invariants:MetricDescriptorV1;
 };
 structuralComparableFields:string[];
 rawDomainFieldsNeverCompared:string[];
 profileDigest:string;
 boundary:typeof PCWD_SEMANTIC_BOUNDARY;
};

export type CrossDomainInvariantProjectionV1={
 schema:typeof PCWD_CROSS_DOMAIN_PROJECTION_SCHEMA;
 domain:string;
 domainVersion:string;
 address:unknown;
 stageTopology:readonly string[];
 gateTopology:readonly string[];
 gateMask:number;
 gateVector:boolean[];
 decision:UnifiedDecisionV1;
 promotionEligible:boolean;
 integrityVerified:boolean;
 profileDigest:string;
 stageChainDigest:string;
 proofDigest:string;
 packetDigest:string;
 envelopeDigest:string;
 structural:{
  stageOrderValid:boolean;
  allGateNamesPresent:boolean;
  promotionDerivedFromAllGates:boolean;
  decisionIsGateDerived:boolean;
  boundaryPreserved:boolean;
 };
 excludedRawFields:string[];
 boundary:typeof PCWD_SEMANTIC_BOUNDARY;
};

const stable=(v:any):string=>{
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return'['+v.map(stable).join(',')+']';
 return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
};
async function sha256(v:any){
 if(!globalThis.crypto?.subtle)throw new Error('R360 semantic profiles require Web Crypto SHA-256');
 const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(v)));
 return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const descriptor=(id:string,meaning:string,unit='domain-local',scale:MetricScaleV1='DOMAIN_LOCAL',comparison:MetricDescriptorV1['comparison']='NONE',crossDomainComparable=false):MetricDescriptorV1=>({id,meaning,unit,scale,comparison,crossDomainComparable});

export async function compileDomainSemanticsProfileV1(input:Omit<DomainSemanticsProfileV1,'schema'|'profileDigest'|'boundary'|'structuralComparableFields'|'rawDomainFieldsNeverCompared'> & {structuralComparableFields?:string[];rawDomainFieldsNeverCompared?:string[]}):Promise<DomainSemanticsProfileV1>{
 const core={
  schema:PCWD_SEMANTIC_PROFILE_SCHEMA,
  domain:input.domain,domainVersion:input.domainVersion,stateSpace:input.stateSpace,
  transportMeaning:input.transportMeaning,recoveryMeaning:input.recoveryMeaning,evidenceMeaning:input.evidenceMeaning,
  scarMeaning:input.scarMeaning,pathMeaning:input.pathMeaning,observablesMeaning:input.observablesMeaning,
  governanceMetrics:input.governanceMetrics,errorMetrics:input.errorMetrics,
  structuralComparableFields:input.structuralComparableFields??['stageTopology','gateTopology','gateVector','promotionEligible','decision','integrityVerified','digestLinkage'],
  rawDomainFieldsNeverCompared:input.rawDomainFieldsNeverCompared??['state','continuity','futurePlasticity','contradiction','burden','recoveryError','dynamicsError','observableError','pathError','invariantError','evidencePayload','scarPayload','pathPayload','observablesPayload'],
  boundary:PCWD_SEMANTIC_BOUNDARY,
 } as const;
 return{...core,profileDigest:await sha256(core)};
}


export async function verifyDomainSemanticsProfileV1(profile:DomainSemanticsProfileV1){
 if(profile?.schema!==PCWD_SEMANTIC_PROFILE_SCHEMA||profile?.boundary!==PCWD_SEMANTIC_BOUNDARY)return false;
 const core={
  schema:profile.schema,domain:profile.domain,domainVersion:profile.domainVersion,stateSpace:profile.stateSpace,
  transportMeaning:profile.transportMeaning,recoveryMeaning:profile.recoveryMeaning,evidenceMeaning:profile.evidenceMeaning,
  scarMeaning:profile.scarMeaning,pathMeaning:profile.pathMeaning,observablesMeaning:profile.observablesMeaning,
  governanceMetrics:profile.governanceMetrics,errorMetrics:profile.errorMetrics,
  structuralComparableFields:profile.structuralComparableFields,rawDomainFieldsNeverCompared:profile.rawDomainFieldsNeverCompared,
  boundary:profile.boundary,
 };
 return(await sha256(core))===profile.profileDigest;
}

export function metricCompatibilityV1(a:MetricDescriptorV1,b:MetricDescriptorV1){
 const sameIdentity=a.id===b.id;
 const sameUnit=a.unit===b.unit;
 const sameScale=a.scale===b.scale;
 const sameRule=a.comparison===b.comparison;
 const allowed=a.crossDomainComparable&&b.crossDomainComparable&&sameIdentity&&sameUnit&&sameScale&&sameRule&&a.comparison!=='NONE';
 return{comparable:allowed,sameIdentity,sameUnit,sameScale,sameRule,reason:allowed?'EXPLICITLY_COMPATIBLE':'DOMAIN_SEMANTICS_DIFFER'};
}

export async function compileCrossDomainInvariantProjectionV1(result:any,profile:DomainSemanticsProfileV1):Promise<CrossDomainInvariantProjectionV1>{
 if(result?.schema!==UNIFIED_PCWD_SCHEMA)throw new Error('R360 projection requires a unified PCWD result');
 if(!await verifyDomainSemanticsProfileV1(profile))throw new Error('R360 semantic profile digest invalid');
 if(result?.domain!==profile.domain||result?.domainVersion!==profile.domainVersion)throw new Error('R360 semantic profile domain/version mismatch');
 const integrityVerified=await verifyUnifiedProofTransportV1(result);
 const gates=UNIFIED_PCWD_GATES.map(k=>Boolean(result.proof?.gates?.[k]));
 let gateMask=0;gates.forEach((v,i)=>{if(v)gateMask|=(1<<i)});
 const all=gates.every(Boolean);
 const expectedDecision:UnifiedDecisionV1=all?'STAY':(!gates[0]||!gates[1]||!gates[6]||!gates[7])?'ESCALATE':'TURN';
 return{
  schema:PCWD_CROSS_DOMAIN_PROJECTION_SCHEMA,
  domain:profile.domain,domainVersion:profile.domainVersion,address:result.address,
  stageTopology:[...UNIFIED_PCWD_STAGES],gateTopology:[...UNIFIED_PCWD_GATES],gateMask,gateVector:gates,
  decision:result.proof.decision,promotionEligible:result.proof.promotionEligible,integrityVerified,
  profileDigest:profile.profileDigest,stageChainDigest:result.proof.stageChainDigest,proofDigest:result.proof.proofDigest,
  packetDigest:result.seal.packetDigest,envelopeDigest:result.seal.envelopeDigest,
  structural:{
   stageOrderValid:(result.stages||[]).map((s:any)=>s.stage).join('|')===UNIFIED_PCWD_STAGES.join('|'),
   allGateNamesPresent:UNIFIED_PCWD_GATES.every(k=>Object.prototype.hasOwnProperty.call(result.proof.gates,k)),
   promotionDerivedFromAllGates:result.proof.promotionEligible===all,
   decisionIsGateDerived:result.proof.decision===expectedDecision,
   boundaryPreserved:result.proof.boundary===UNIFIED_PCWD_BOUNDARY,
  },
  excludedRawFields:[...profile.rawDomainFieldsNeverCompared],
  boundary:PCWD_SEMANTIC_BOUNDARY,
 };
}

export function compareCrossDomainInvariantShapeV1(a:CrossDomainInvariantProjectionV1,b:CrossDomainInvariantProjectionV1){
 const stageTopologyEqual=a.stageTopology.join('|')===b.stageTopology.join('|');
 const gateTopologyEqual=a.gateTopology.join('|')===b.gateTopology.join('|');
 const structuralContractEqual=stageTopologyEqual&&gateTopologyEqual&&
  Object.keys(a.structural).join('|')===Object.keys(b.structural).join('|');
 return{
  structuralContractEqual,stageTopologyEqual,gateTopologyEqual,
  rawMetricComparisonAttempted:false,
  comparableFields:['stageTopology','gateTopology','gateVector shape','promotion derivation','decision derivation','integrity linkage'],
  intentionallyIncomparableFields:['state representation','governance metric values','error magnitudes','evidence payloads','scar payloads','path payloads','observable payloads'],
  boundary:PCWD_SEMANTIC_BOUNDARY,
 };
}

export const PCWD_PROFILE_BUILDERS={
 async r349(){
  return compileDomainSemanticsProfileV1({
   domain:'OMEGA_R349_PCWD_ADAPTER',domainVersion:'1',
   stateSpace:'R349 woven typed scalar field packet',
   transportMeaning:'declared R349 address/path transport',
   recoveryMeaning:'reconstruct projected representative plus residual into the source field values',
   evidenceMeaning:'R349 source/evidence admissibility supplied by the caller',
   scarMeaning:'R349 accumulated/local transport residual history',
   pathMeaning:'R349 Gamma transport receipt',
   observablesMeaning:'R349 declared field observables and invariant carry',
   governanceMetrics:{
    continuity:descriptor('R349_CONTINUITY','R349 normalized continuity score','ratio','RATIO','ORDER',false),
    futurePlasticity:descriptor('R349_FUTURE_PLASTICITY','R349 normalized future-option score','ratio','RATIO','ORDER',false),
    contradiction:descriptor('R349_CONTRADICTION','R349 contradiction burden','ratio','NONNEGATIVE','ORDER',false),
    burden:descriptor('R349_BURDEN','R349 accumulated burden','ratio','NONNEGATIVE','ORDER',false),
   },
   errorMetrics:{
    recovery:descriptor('R349_RECOVERY_ERROR','maximum field reconstruction error','field units','NORM','ORDER',false),
    dynamics:descriptor('R349_DYNAMICS_ERROR','declared R349 dynamics correspondence error','field units','NORM','ORDER',false),
    observables:descriptor('R349_OBSERVABLE_ERROR','declared observable mismatch','field units','NORM','ORDER',false),
    path:descriptor('R349_PATH_ERROR','path recoverability gate proxy','booleanized','BOOLEAN','EQUALITY',false),
    invariants:descriptor('R349_INVARIANT_ERROR','invariant preservation gate proxy','booleanized','BOOLEAN','EQUALITY',false),
   },
  });
 },
 async lens(){
  return compileDomainSemanticsProfileV1({
   domain:'OMEGA_MICRO_MACRO_RESOLUTION_LENS_PCWD_ADAPTER',domainVersion:'1',
   stateSpace:'finite real-valued vector under block resolution lens',
   transportMeaning:'identity transport of a coarse representative plus explicit residual sidecar',
   recoveryMeaning:'coarse bin representative plus stored residual reconstructs the supplied vector',
   evidenceMeaning:'caller-declared admissibility for the supplied software vector',
   scarMeaning:'resolution residual sidecar; not physical damage/history',
   pathMeaning:'representation-scale transport path',
   observablesMeaning:'sum/invariant and reconstruction checks over the supplied vector',
   governanceMetrics:{
    continuity:descriptor('LENS_CONTINUITY','representation continuity policy scalar','ratio','RATIO','ORDER',false),
    futurePlasticity:descriptor('LENS_FUTURE_PLASTICITY','representation policy scalar','ratio','RATIO','ORDER',false),
    contradiction:descriptor('LENS_CONTRADICTION','adapter policy contradiction scalar','ratio','NONNEGATIVE','ORDER',false),
    burden:descriptor('LENS_BURDEN','adapter policy burden scalar','ratio','NONNEGATIVE','ORDER',false),
   },
   errorMetrics:{
    recovery:descriptor('LENS_RMSE_MAX','vector round-trip maximum error','input units','NORM','ORDER',false),
    dynamics:descriptor('LENS_DYNAMICS','no independent dynamics in identity lens','input units','NORM','ORDER',false),
    observables:descriptor('LENS_SUM_ERROR','sum preservation error','input units','NORM','ORDER',false),
    path:descriptor('LENS_PATH_ERROR','representation path error','input units','NORM','ORDER',false),
    invariants:descriptor('LENS_INVARIANT_ERROR','sum invariant error','input units','NORM','ORDER',false),
   },
  });
 },
 async qubit(){
  return compileDomainSemanticsProfileV1({
   domain:'OMEGA_QUBIT_UNITARY_PCWD_ADAPTER',domainVersion:'1',
   stateSpace:'2×2 complex density matrix',
   transportMeaning:'standard quantum-mechanical unitary conjugation UρU†',
   recoveryMeaning:'inverse unitary conjugation U†ρ′U',
   evidenceMeaning:'caller-declared admissibility of the mathematical input; not experimental measurement evidence',
   scarMeaning:'software recovery/observable residuals; not a new quantum observable',
   pathMeaning:'declared unitary transport identity and proof digest',
   observablesMeaning:'expectation values of caller-supplied 2×2 observables',
   governanceMetrics:{
    continuity:descriptor('QUBIT_GOVERNANCE_CONTINUITY','adapter governance scalar, not quantum amplitude continuity','ratio','RATIO','ORDER',false),
    futurePlasticity:descriptor('QUBIT_GOVERNANCE_PLASTICITY','adapter governance scalar, not a quantum law','ratio','RATIO','ORDER',false),
    contradiction:descriptor('QUBIT_GOVERNANCE_CONTRADICTION','adapter governance burden scalar','ratio','NONNEGATIVE','ORDER',false),
    burden:descriptor('QUBIT_GOVERNANCE_BURDEN','adapter governance burden scalar','ratio','NONNEGATIVE','ORDER',false),
   },
   errorMetrics:{
    recovery:descriptor('QUBIT_MATRIX_RECOVERY_ERROR','matrix maximum round-trip difference','matrix coefficient magnitude','NORM','ORDER',false),
    dynamics:descriptor('QUBIT_DYNAMICS_ERROR','no independent dynamics residual in the current unitary adapter','matrix coefficient magnitude','NORM','ORDER',false),
    observables:descriptor('QUBIT_EXPECTATION_ERROR','maximum expectation-value mismatch','observable units','NORM','ORDER',false),
    path:descriptor('QUBIT_UNITARY_RECOVERY_ERROR','inverse-unitary path recovery error','matrix coefficient magnitude','NORM','ORDER',false),
    invariants:descriptor('QUBIT_VALIDITY_GATE','density/unitary validity encoded as a gate proxy','booleanized','BOOLEAN','EQUALITY',false),
   },
  });
 },
};
