export const R214_REVISION='R214';
export const R214_SCHEMA='OMEGA_RENDER_ATTEMPT_CONTINUITY_R214';
export const R214_SNAPSHOT_KEY='omega.r214.renderAttemptContinuity';
export const R214_EVENT='omega-r214-render-attempt-continuity';
export const R214_BOUNDARY='R214 makes the existing R213 render-attempt identity recoverable through the existing browser/project continuity path. It does not execute a render, create a rendered frame, mutate CanonState, create a persistence backend, execute a device, close federation, validate a solver, or prove computed photoreal reality.';

const stable=(v)=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v};
const sha256=async(v)=>{const bytes=new TextEncoder().encode(JSON.stringify(stable(v)));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const hash64=(v)=>/^[a-f0-9]{64}$/.test(String(v||''));

export async function compileRenderAttemptContinuityR214({attempt,projectId}={}){
 const ready=attempt?.state==='ADAPTIVE_RENDER_ATTEMPT_READY'&&attempt?.renderAttemptPlanned===true&&hash64(attempt?.attemptSha256)&&hash64(attempt?.parentLineageSha256)&&hash64(attempt?.worldBindingOperationSha256);
 const payload={schema:R214_SCHEMA,revision:R214_REVISION,parentAttemptSha256:String(attempt?.attemptSha256||''),parentLineageSha256:String(attempt?.parentLineageSha256||''),missionId:String(attempt?.missionId||''),worldBindingOperationSha256:String(attempt?.worldBindingOperationSha256||''),previousWorldHeadSha256:String(attempt?.previousWorldHeadSha256||''),earthHash:String(attempt?.earthHash||''),groundHash:String(attempt?.groundHash||''),profile:String(attempt?.profile||'HELD'),budget:attempt?.budget||{lod:'NONE',sampleScale:0,temporalCarry:false},projectId:String(projectId||''),continuityPath:['R214 browser snapshot','R86 operation receipt','R87 active-project operation reference','R97 authenticated continuity sync when paired'],rendererAuthority:'R122_EXISTING_COMPUTED_REALITY',adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',canonicalAdmissionAuthority:'R125',newPersistenceAuthority:false,renderAttemptExecuted:false,renderedFrame:false,renderReceipt:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false};
 const anchorSha256=await sha256(payload);
 return{...payload,anchorSha256,state:ready?'RENDER_ATTEMPT_CONTINUITY_READY':'HELD_FOR_R213_ATTEMPT',truthBoundary:R214_BOUNDARY};
}

export function readRenderAttemptContinuityR214(){try{const value=JSON.parse(localStorage.getItem(R214_SNAPSHOT_KEY)||'null');return value?.schema===R214_SCHEMA?value:null}catch{return null}}

export function persistRenderAttemptContinuityR214(receipt){
 if(receipt?.state!=='RENDER_ATTEMPT_CONTINUITY_READY'||!hash64(receipt?.anchorSha256))return false;
 try{localStorage.setItem(R214_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R214_EVENT,{detail:receipt}));return true}catch{return false}
}

export function manifestR214(){return{schema:'OMEGA_RENDER_ATTEMPT_CONTINUITY_MANIFEST_R214',revision:R214_REVISION,chain:['R211 deterministic pre-render lineage','R213 adaptive render-attempt SHA','R214 recoverable render-attempt continuity anchor','R86 operation receipt','R87 project continuity','R97 authenticated continuity sync when paired','future executed artifact/frame receipt must return to R214/R213 identity'],authority:{newRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false,computedReality:'R122',adaptivePerformance:'R185',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97',canonicalAdmission:'R125'},truthBoundary:R214_BOUNDARY};}
