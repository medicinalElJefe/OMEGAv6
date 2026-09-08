export const R211_REVISION='R211';
export const R211_SCHEMA='OMEGA_RENDER_INTENT_LINEAGE_R211';
export const R211_BOUNDARY='R211 creates a deterministic read-only pre-render lineage receipt from existing mission continuity, canonical-world binding, and empirical scene evidence. It does not render a frame, mutate CanonState, execute a device, close federation, validate a solver, or prove computed photoreal reality.';

const text=(v,n=256)=>String(v??'').trim().slice(0,n);
const stable=(v)=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v};
const sha256=async(v)=>{const bytes=new TextEncoder().encode(JSON.stringify(stable(v)));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};

export async function compileRenderIntentLineageR211({mission,anchor,binding,scene}={}){
 const missionId=text(mission?.id),carryHash=text(anchor?.carryHash),operationSha256=text(binding?.operationSha256),previousWorldHeadSha256=text(binding?.previousWorldHeadSha256);
 const earthHash=text(scene?.earthHash||scene?.snapshot?.earthHash),groundHash=text(scene?.groundHash||scene?.snapshot?.groundHash),evidenceDigest=text(scene?.evidenceDigest||scene?.snapshot?.evidenceDigest);
 const renderInputReady=Boolean(scene?.renderInputReady);
 const missing=[];
 if(!missionId)missing.push('MISSION_ID');if(!carryHash)missing.push('R204_CARRY_HASH');if(!operationSha256)missing.push('R208_OPERATION_SHA256');if(!earthHash)missing.push('EARTH_EVIDENCE_HASH');if(!groundHash)missing.push('GROUND_EVIDENCE_HASH');if(!renderInputReady)missing.push('R122_INPUT_READY');
 const payload={schema:R211_SCHEMA,revision:R211_REVISION,missionId,previousMissionId:text(anchor?.previousMissionId),missionCarryHash:carryHash,missionProofStatus:text(mission?.returnPacket?.proof_status||'UNKNOWN'),worldBindingOperationSha256:operationSha256,previousWorldHeadSha256,earthHash,groundHash,evidenceDigest,renderInputReady,rendererAuthority:'R122_EXISTING_COMPUTED_REALITY',canonicalAdmissionAuthority:'R125',canonicalMutation:false,renderedFrame:false,renderReceipt:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false};
 const lineageSha256=await sha256(payload);
 return{...payload,lineageSha256,state:missing.length?'HELD_FOR_PROOF':'RENDER_INTENT_LINEAGE_READY',missing,truthBoundary:R211_BOUNDARY};
}

export function manifestR211(){return{schema:'OMEGA_RENDER_INTENT_LINEAGE_MANIFEST_R211',revision:R211_REVISION,chain:['R204 mission proof/scar carry','R208 canonical-world binding operation','R202.3 empirical living scene','R122 render-input readiness','R211 deterministic pre-render lineage receipt','future rendered-frame receipt must return to same lineage SHA'],authority:{newRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false,computedReality:'R122',canonicalAdmission:'R125'},truthBoundary:R211_BOUNDARY};}
