export const R134_REVISION='R134';
export const R134_SCHEMA='OMEGA_CANONICAL_WORLD_CONTINUITY_R134';
export const R134_WORLD_ID='OMEGA_CANONICAL_WORLD';
export const R134_EVENT_KINDS=['OBSERVATION','MISSION','FEDERATION_RETURN','RENDER_RECEIPT','PROOF','SCAR','ADMISSION_RECEIPT'];
export const R134_LAWS=[
 'ONE_LOGICAL_WORLD_IDENTITY',
 'APPEND_ONLY_SCAR_AND_PROOF_CHAIN',
 'PROJECTION_AND_RENDERING_NEVER_MUTATE_CANON',
 'FEDERATION_RETURN_IS_EVIDENCE_NOT_AUTHORITY',
 'MISSION_PLAN_IS_INTENT_ASSEMBLY_NOT_EXECUTION_PROOF',
 'R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY',
 'PHOTOREAL_REALITY_REQUIRES_DIRECT_RENDER_PROOF',
 'PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'SOLVER_VALIDITY_REQUIRES_SOLVER_AND_VALIDATION_RECEIPTS',
 'OLD_DONORS_ARE_EVIDENCE_NOT_WHOLESALE_AUTHORITY'
];

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const text=(v,n=240)=>String(v??'').trim().slice(0,n);
const safeId=(v,fallback='')=>{const s=text(v,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:fallback};
const refs=(value,limit=64)=>Array.isArray(value)?value.slice(-limit).map(x=>safeId(x)).filter(Boolean):[];
function stable(value){
 if(Array.isArray(value))return value.map(stable);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
 return value;
}
export function stableStringifyR134(value){return JSON.stringify(stable(value));}
export async function sha256R134(value){
 const bytes=new TextEncoder().encode(typeof value==='string'?value:stableStringifyR134(value));
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

export function normalizeWorldEventR134(input={}){
 const kind=R134_EVENT_KINDS.includes(input.kind)?input.kind:'PROOF';
 const projection=text(input.projection,48).toUpperCase()||'FIELD';
 const eventId=safeId(input.eventId)||`event-${clamp(input.sequence,0,Number.MAX_SAFE_INTEGER)}`;
 const proofIds=refs(input.proofIds),sourceIds=refs(input.sourceIds),scarIds=refs(input.scarIds);
 const claim=input.claim&&typeof input.claim==='object'?{
  publicDeploymentProved:input.claim.publicDeploymentProved===true,
  pcOnlineProved:input.claim.pcOnlineProved===true,
  solverValidityProved:input.claim.solverValidityProved===true,
  computedPhotorealRealityProved:input.claim.computedPhotorealRealityProved===true
 }:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false};
 return{
  schema:'OMEGA_WORLD_EVENT_R134',revision:R134_REVISION,worldId:R134_WORLD_ID,eventId,kind,
  sequence:clamp(input.sequence,0,Number.MAX_SAFE_INTEGER),eventTime:clamp(input.eventTime,0,Number.MAX_SAFE_INTEGER),
  observerId:safeId(input.observerId,'observer-unknown'),projection,
  intentId:safeId(input.intentId)||null,missionId:safeId(input.missionId)||null,federationNode:safeId(input.federationNode)||null,
  sourceIds,proofIds,scarIds,
  address:clamp(input.address,0,20735),
  metrics:{continuity:clamp(input.metrics?.continuity,0,1),plasticity:clamp(input.metrics?.plasticity,0,1),contradiction:clamp(input.metrics?.contradiction,0,1),burden:clamp(input.metrics?.burden,0,1),evidence:clamp(input.metrics?.evidence,0,1),uncertainty:clamp(input.metrics?.uncertainty,0,1),scar:clamp(input.metrics?.scar,0,1)},
  claim,
  payloadDigest:safeId(input.payloadDigest)||null,
  authority:kind==='ADMISSION_RECEIPT'?'R125_ADMISSION_RECEIPT_EVIDENCE':'CONTINUITY_EVIDENCE_NOT_CANON',
  canonicalMutation:false
 };
}

export async function appendWorldEventR134(previous,eventInput){
 const prior=previous&&previous.schema===R134_SCHEMA?previous:null;
 const event=normalizeWorldEventR134(eventInput);
 const previousHead=prior?.headSha256||null;
 const eventCore={...event,previousHead};
 const eventSha256=await sha256R134(eventCore);
 const receipt={...eventCore,eventSha256};
 const count=(prior?.count||0)+1;
 const scarCount=(prior?.scarCount||0)+(event.kind==='SCAR'||event.scarIds.length?1:0);
 const proofCount=(prior?.proofCount||0)+(event.proofIds.length?1:0);
 return{
  schema:R134_SCHEMA,revision:R134_REVISION,worldId:R134_WORLD_ID,
  count,scarCount,proofCount,headSha256:eventSha256,lastEvent:receipt,
  invariantCarry:{worldIdentity:R134_WORLD_ID,previousHead,eventSha256,address:event.address,projection:event.projection},
  proofBoundary:{canonicalMutation:false,canonicalAdmissionAuthority:'R125',federationReturnIsCanon:false,renderIsCanon:false,missionPlanIsExecutionProof:false},
  truthBoundary:'R134 is a deterministic append-only continuity/scar/proof chain. Recording an observation, mission, federation return, render receipt, solver receipt, deployment receipt, or R125 admission receipt does not itself prove that external claim or mutate CanonState.'
 };
}

export async function compileWorldContinuityR134(events=[]){
 let head=null;
 const receipts=[];
 for(const input of Array.isArray(events)?events:[]){head=await appendWorldEventR134(head,input);receipts.push(head.lastEvent);}
 return{head,receipts,replayIdentity:head?.headSha256||await sha256R134({schema:R134_SCHEMA,worldId:R134_WORLD_ID,empty:true}),canonicalMutation:false};
}

export function continuityOperationRefR134(head){
 if(!head||head.schema!==R134_SCHEMA)return null;
 return{schema:'OMEGA_CONTINUITY_OPERATION_REF_R134',worldId:R134_WORLD_ID,headSha256:head.headSha256,count:head.count,scarCount:head.scarCount,proofCount:head.proofCount,canonicalMutation:false,authority:'DURABLE_CONTINUITY_REFERENCE_NOT_CANON'};
}

export function manifestR134(){return{
 ok:true,schema:R134_SCHEMA,revision:R134_REVISION,worldId:R134_WORLD_ID,eventKinds:R134_EVENT_KINDS,laws:R134_LAWS,
 persistenceAdapter:{existingTransport:'OMEGA_CONTINUITY_SNAPSHOT_R97.operationRefs',referenceFactory:'continuityOperationRefR134',newDurableAuthorityIntroduced:false},
 integration:{livingWorld:'R123',canonicalAdmission:'R125',causalScar:'R126',proofFabric:'R127',empiricalReplay:'R128-R129',operations:'R130',capacity:'R131',computedReality:'R122/R132'},
 truthBoundary:'One logical world identity and deterministic scar/proof lineage are defined here without replacing R125 authority. Durability is inherited only when the returned operation reference is saved through the already-authenticated durable continuity snapshot path.'
};}
