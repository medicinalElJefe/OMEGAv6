import type {SystemFamily} from './systemAtlasRuntime';

export type FamilyOperationalProofStateR135='CURRENT_EXECUTION_PROOF'|'CURRENT_SERVICE_OBSERVATION'|'DECLARED_BOUNDARY_ONLY'|'GATE_CURRENTLY_HELD'|'STATIC_LINEAGE_ONLY'|'UNKNOWN';
export type FamilyOperationalProofR135={familyId:string;state:FamilyOperationalProofStateR135;current:boolean;label:string;detail:string;source:string;observedAt:string|null};

export const FAMILY_OPERATIONAL_PROOF_LAWS_R135=Object.freeze({
 revision:'R135',
 separation:'DECLARED_FAMILY_STATUS_AND_CURRENT_OPERATIONAL_PROOF_ARE_SEPARATE_AXES',
 heartbeat:'HYBRID_DEVICE_GATE_OPENS_ONLY_FROM_CURRENT_AUTHENTICATED_HEARTBEAT',
 reachability:'HTTP_OR_CONTROL_PLANE_REACHABILITY_IS_SERVICE_OBSERVATION_NOT_NATIVE_EXECUTION',
 evidence:'GENERIC_HEALTH_CANNOT_SATISFY_DOMAIN_SPECIFIC_EVIDENCE_GATES',
 worldContinuity:'R134_CANONICAL_WORLD_SCAR_PROOF_CHAIN_REMAINS_APPEND_ONLY_AUTHORITY_CONTEXT',
 wovenContinuum:'R134_WOVEN_RELATIVITY_CONTINUUM_REMAINS_STRUCTURAL_REFERENCE_AND_ROUTE_CONTEXT',
 nextAction:'CURRENT_PROOF_MAY_ADVANCE_NEXT_ACTION_WITHOUT_REWRITING_DECLARED_STATUS',
 canon:'CURRENT_OPERATIONAL_PROOF_NEVER_AUTO_PROMOTES_CANONSTATE',
 unknown:'MISSING_OR_STALE_RUNTIME_EVIDENCE_REMAINS_UNKNOWN_OR_HELD'
});

const onlineDevices=(hybrid:any)=>Array.isArray(hybrid?.devices)?hybrid.devices.filter((d:any)=>d?.online===true&&d?.revoked!==true):[];
const observedAt=(operational:any)=>typeof operational?.observedAt==='string'?operational.observedAt:null;
const serviceObserved=(operational:any)=>Boolean(operational&&operational?.summary?.reachableCount>0);
const canonicalObserved=(operational:any)=>Boolean(operational&&String(operational?.summary?.canonicalRuntime||'UNKNOWN').toUpperCase()!=='UNKNOWN');
const pcProved=(operational:any,hybrid:any)=>Boolean(operational?.proofBoundaries?.pcOnlineProved===true||operational?.summary?.sovereign?.authenticatedHeartbeat===true||(hybrid?.nativeExecutionClaimed===true&&onlineDevices(hybrid).length>0));

export function familyOperationalProofR135(family:SystemFamily,operational:any,hybrid:any):FamilyOperationalProofR135{
 const at=observedAt(operational),pc=pcProved(operational,hybrid),devices=onlineDevices(hybrid);
 if(family.id==='S03')return pc?
  {familyId:family.id,state:'CURRENT_EXECUTION_PROOF',current:true,label:'PC EXECUTION GATE CURRENTLY SATISFIED',detail:`Authenticated heartbeat is current${devices.length?` on ${devices.length} non-revoked device${devices.length===1?'':'s'}`:''}. Declared DEVICE_GATED status remains the design boundary; this observation satisfies it only for the current proof window.`,source:'R130 operational matrix + Hybrid authenticated heartbeat',observedAt:at}:
  {familyId:family.id,state:'GATE_CURRENTLY_HELD',current:false,label:'DEVICE GATE CURRENTLY HELD',detail:'No current authenticated non-revoked PC heartbeat is proved in the supplied operational evidence.',source:'R130 operational matrix + Hybrid status',observedAt:at};
 if(family.id==='S00')return canonicalObserved(operational)?
  {familyId:family.id,state:'CURRENT_SERVICE_OBSERVATION',current:true,label:'CANONICAL RUNTIME OBSERVED',detail:`Operational control plane currently reports canonical runtime state ${String(operational?.summary?.canonicalRuntime||'UNKNOWN')}. This is service/runtime observation, not native desktop proof.`,source:'R130 operational matrix',observedAt:at}:
  {familyId:family.id,state:'UNKNOWN',current:false,label:'CANONICAL RUNTIME NOT CURRENTLY OBSERVED',detail:'The current operational payload does not prove a canonical runtime state.',source:'R130 operational matrix',observedAt:at};
 if(family.id==='S23')return serviceObserved(operational)?
  {familyId:family.id,state:'CURRENT_SERVICE_OBSERVATION',current:true,label:'RUNTIME TRANSPORT OBSERVED',detail:`${Number(operational?.summary?.reachableCount||0)}/${Number(operational?.summary?.requiredCount||0)} inherited operational probes are reachable. HTTP/service reachability does not prove historical WebSocket breadth.`,source:'R130 operational matrix',observedAt:at}:
  {familyId:family.id,state:'UNKNOWN',current:false,label:'RUNTIME TRANSPORT OBSERVATION UNAVAILABLE',detail:'No current operational probe matrix is available.',source:'R130 operational matrix',observedAt:at};
 if(family.status==='EVIDENCE_GATED'||family.status==='DEVICE_GATED')return{familyId:family.id,state:'GATE_CURRENTLY_HELD',current:false,label:family.status==='EVIDENCE_GATED'?'DOMAIN EVIDENCE GATE NOT SATISFIED HERE':'DEVICE GATE NOT SATISFIED HERE',detail:'Generic runtime health cannot satisfy this family’s declared proof gate. Use its specialist validation/host evidence path.',source:'declared family boundary',observedAt:at};
 if(family.status==='RESTORATION_DEBT'||family.status==='DONOR_ONLY'||family.status==='NATIVE_TARGET')return{familyId:family.id,state:'STATIC_LINEAGE_ONLY',current:false,label:'NO CURRENT EXECUTION CLAIM',detail:'Known lineage/target value is preserved, but this operational overlay does not claim a live implementation.',source:'authoritative family registry',observedAt:at};
 return{familyId:family.id,state:'DECLARED_BOUNDARY_ONLY',current:false,label:'DECLARED OPERATING BOUNDARY',detail:'This family is registered as operating within its declared hosted/local/source boundary. No stronger per-family live proof is inferred from generic health.',source:'authoritative family registry',observedAt:at};
}

export function currentNextActionR135(family:SystemFamily,proof:FamilyOperationalProofR135,declaredAction:string){
 if(family.id==='S03'&&proof.state==='CURRENT_EXECUTION_PROOF')return'Run a bounded authenticated PC workload, return its execution receipt into the R134 append-only world/scar chain, replay it, and verify the receipt before expanding machine authority.';
 if(family.id==='S00'&&proof.state==='CURRENT_SERVICE_OBSERVATION')return'Harden the observed canonical runtime path, preserve deployment/replay receipts, and keep native desktop breadth separately proof-gated.';
 if(family.id==='S23'&&proof.state==='CURRENT_SERVICE_OBSERVATION')return'Exercise typed runtime transport requests with replay identity and failure receipts; do not infer historical WebSocket breadth from HTTP health.';
 return declaredAction;
}

export function familyOperationalProofSummaryR135(operational:any,hybrid:any){
 const devices=onlineDevices(hybrid);return{revision:'R135',operationalObserved:Boolean(operational),observedAt:observedAt(operational),reachableCount:Number(operational?.summary?.reachableCount||0),requiredCount:Number(operational?.summary?.requiredCount||0),canonicalRuntime:String(operational?.summary?.canonicalRuntime||'UNKNOWN'),pcOnlineProved:pcProved(operational,hybrid),onlineDeviceCount:devices.length,authority:'OPERATIONAL_OBSERVATION_NOT_CANON',worldContinuityAuthority:'R134_APPEND_ONLY_SCAR_PROOF_CHAIN',wovenContinuumAuthority:'R134_STRUCTURAL_REFERENCE_ROUTE_CONTEXT',laws:FAMILY_OPERATIONAL_PROOF_LAWS_R135};
}
