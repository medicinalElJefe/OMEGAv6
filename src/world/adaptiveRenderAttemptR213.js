export const R213_REVISION='R213';
export const R213_SCHEMA='OMEGA_ADAPTIVE_RENDER_ATTEMPT_R213';
export const R213_BOUNDARY='R213 binds an adaptive render-attempt plan to the existing R211 mission/world/evidence lineage. It selects a bounded rendering profile from existing performance signals but does not render a frame, mutate CanonState, execute a device, close federation, validate a solver, or prove computed photoreal reality.';

const clamp=(v)=>Math.max(0,Math.min(1,Number(v)||0));
const stable=(v)=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v};
const sha256=async(v)=>{const bytes=new TextEncoder().encode(JSON.stringify(stable(v)));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};

export async function compileAdaptiveRenderAttemptR213({lineage,performance}={}){
 const lineageReady=lineage?.state==='RENDER_INTENT_LINEAGE_READY'&&/^[a-f0-9]{64}$/.test(String(lineage?.lineageSha256||''));
 const continuity=clamp(performance?.continuity??performance?.CΩ??0.5);
 const burden=clamp(performance?.burden??performance?.Λ??0);
 const contradiction=clamp(performance?.contradiction??performance?.q??0);
 const plasticity=clamp(performance?.plasticity??performance?.Φ??0.5);
 const pressure=Math.max(burden,contradiction);
 const profile=!lineageReady?'HELD':pressure>=0.67?'CONSERVATIVE':continuity>=0.72&&plasticity>=0.55?'FULL_FIELD':'BALANCED';
 const budget=profile==='FULL_FIELD'?{lod:'HIGH',sampleScale:1,temporalCarry:true}:profile==='BALANCED'?{lod:'MEDIUM',sampleScale:0.66,temporalCarry:true}:profile==='CONSERVATIVE'?{lod:'LOW',sampleScale:0.33,temporalCarry:false}:{lod:'NONE',sampleScale:0,temporalCarry:false};
 const payload={schema:R213_SCHEMA,revision:R213_REVISION,parentLineageSha256:String(lineage?.lineageSha256||''),missionId:String(lineage?.missionId||''),worldBindingOperationSha256:String(lineage?.worldBindingOperationSha256||''),previousWorldHeadSha256:String(lineage?.previousWorldHeadSha256||''),earthHash:String(lineage?.earthHash||''),groundHash:String(lineage?.groundHash||''),rendererAuthority:'R122_EXISTING_COMPUTED_REALITY',adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',profile,budget,signals:{continuity,plasticity,burden,contradiction},canonicalAdmissionAuthority:'R125',canonicalMutation:false,renderAttemptPlanned:lineageReady,renderAttemptExecuted:false,renderedFrame:false,renderReceipt:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false};
 const attemptSha256=await sha256(payload);
 return{...payload,attemptSha256,state:lineageReady?'ADAPTIVE_RENDER_ATTEMPT_READY':'HELD_FOR_R211_LINEAGE',truthBoundary:R213_BOUNDARY};
}

export function manifestR213(){return{schema:'OMEGA_ADAPTIVE_RENDER_ATTEMPT_MANIFEST_R213',revision:R213_REVISION,chain:['R204 proof/scar mission carry','R208 canonical-world binding','R202.3 empirical scene','R211 deterministic pre-render lineage','R185 adaptive performance signals','R213 proof-safe adaptive render-attempt plan','future R122 executed-frame receipt must return to R213 attempt SHA'],authority:{newRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false,computedReality:'R122',adaptivePerformance:'R185',canonicalAdmission:'R125'},truthBoundary:R213_BOUNDARY};}
