export const R143_REVISION='R143';
export const R143_SCHEMA='OMEGA_DURABLE_EXECUTION_RUN_R143';
export const R143_STATES=Object.freeze(['DISCOVERED','AUTHORIZED','AVAILABLE','INVOKED','RETURNED','VERIFIED','UNAVAILABLE','FAILED','REJECTED','STALE']);
export const R143_TERMINAL=new Set(['VERIFIED','UNAVAILABLE','FAILED','REJECTED','STALE']);
export const R143_LAWS=Object.freeze([
 'INTENT_CREATES_A_DURABLE_RUN_NOT_AN_EXECUTION_CLAIM',
 'EVERY_STATE_CHANGE_IS_HASH_CHAINED_AND_REPLAYABLE',
 'ROUTE_PRIORITY_DOES_NOT_ADVANCE_EXECUTION_STATE',
 'INVOCATION_REQUIRES_EXPLICIT_AUTHORIZED_TRANSITION',
 'RETURNED_DOES_NOT_EQUAL_VERIFIED',
 'HYBRID_VERIFIED_REQUIRES_R141_EXACT_PAYLOAD_PROOF',
 'NON_HYBRID_VERIFIED_REQUIRES_A_PROOF_REFERENCE_AND_RESULT_FINGERPRINT',
 'TERMINAL_FAILURE_STATES_CANNOT_SELF_RECOVER',
 'EXECUTION_RUNS_NEVER_MUTATE_CANONSTATE',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const ALLOWED=Object.freeze({
 DISCOVERED:new Set(['AUTHORIZED','UNAVAILABLE','REJECTED','STALE']),
 AUTHORIZED:new Set(['AVAILABLE','UNAVAILABLE','REJECTED','STALE']),
 AVAILABLE:new Set(['INVOKED','UNAVAILABLE','FAILED','REJECTED','STALE']),
 INVOKED:new Set(['RETURNED','FAILED','STALE']),
 RETURNED:new Set(['VERIFIED','FAILED','REJECTED','STALE']),
 VERIFIED:new Set(),UNAVAILABLE:new Set(),FAILED:new Set(),REJECTED:new Set(),STALE:new Set()
});
const safeText=(v,n=240)=>String(v??'').trim().slice(0,n);
const safeId=v=>{const s=safeText(v,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};
const canonical=v=>{if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort())out[k]=canonical(v[k]);return out}return v};
const digest=async value=>{const bytes=new TextEncoder().encode(JSON.stringify(canonical(value))),hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const key=id=>`execution:r143:run:${id}`;
const INDEX='execution:r143:index';
const now=()=>Date.now();
function cleanExecutor(input={}){const kind=safeText(input.kind||input.executorKind||'ROUTE',32).toUpperCase();return{kind:['ROUTE','PLUGIN','HYBRID','LOCAL','PROVIDER','SWARM'].includes(kind)?kind:'ROUTE',route:safeText(input.route,120),capabilityId:safeText(input.capabilityId,160),providerId:safeText(input.providerId,160),deviceId:safeText(input.deviceId,160)}}
function cleanEvidence(input={}){return{proofRef:safeText(input.proofRef,240)||null,resultFingerprint:safeText(input.resultFingerprint,256)||null,providerReceipt:safeText(input.providerReceipt,512)||null,r141Closure:input.r141Closure&&typeof input.r141Closure==='object'?input.r141Closure:null}}
function validHybridProof(e){const c=e?.r141Closure;return Boolean(c&&c.state==='VERIFIED_EXECUTION_RETURN'&&c.fingerprint?.verified===true&&c.fingerprint?.digestMatch===true&&c.fingerprint?.semanticMatch===true&&c.finalHeadSha256)}
function validNonHybridProof(e){return Boolean(e?.proofRef&&e?.resultFingerprint)}
async function eventFor(run,from,to,reason,evidence={}){const ordinal=run.events.length,base={schema:'OMEGA_EXECUTION_EVENT_R143',runId:run.id,ordinal,from,to,reason:safeText(reason,400),at:now(),evidence:cleanEvidence(evidence),previousHash:run.headSha256||null,canonicalMutation:false,canonicalAdmissionAuthority:'R125'},hash=await digest(base);return{...base,hash}}
async function persist(runtime,run){await runtime.state.storage.put(key(run.id),run);const index=await runtime.state.storage.get(INDEX)||[];const next=[run.id,...index.filter(x=>x!==run.id)].slice(0,128);await runtime.state.storage.put(INDEX,next);return run}
export function manifestR143(){return{ok:true,schema:'OMEGA_DURABLE_EXECUTION_MANIFEST_R143',revision:R143_REVISION,runSchema:R143_SCHEMA,states:R143_STATES,laws:R143_LAWS,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R143 persists execution intent and state transitions as hash-chained operational evidence. It does not infer invocation from routing, does not infer verification from a return, and cannot admit CanonState.'}}
export async function createExecutionRunR143(runtime,input={}){const id='run_'+crypto.randomUUID().replaceAll('-',''),executor=cleanExecutor(input.executor),intent=safeText(input.intent||input.label||input.route,2000),createdAt=now(),run={schema:R143_SCHEMA,revision:R143_REVISION,id,intent,executor,state:'DISCOVERED',createdAt,updatedAt:createdAt,headSha256:null,events:[],canonicalMutation:false,canonicalAdmissionAuthority:'R125',metadata:input.metadata&&typeof input.metadata==='object'?canonical(input.metadata):{}};const ev=await eventFor(run,null,'DISCOVERED','durable execution intent created',{proofRef:'R143_CREATE'});run.events.push(ev);run.headSha256=ev.hash;return persist(runtime,run)}
export async function readExecutionRunR143(runtime,id){id=safeId(id);if(!id)return null;return await runtime.state.storage.get(key(id))||null}
export async function listExecutionRunsR143(runtime){const ids=await runtime.state.storage.get(INDEX)||[],runs=[];for(const id of ids.slice(0,50)){const run=await runtime.state.storage.get(key(id));if(run)runs.push(run)}return runs}
export async function transitionExecutionRunR143(runtime,id,input={}){const run=await readExecutionRunR143(runtime,id);if(!run)return{ok:false,status:404,code:'R143_RUN_NOT_FOUND'};const target=safeText(input.state,32).toUpperCase();if(!R143_STATES.includes(target))return{ok:false,status:400,code:'R143_STATE_INVALID'};if(R143_TERMINAL.has(run.state))return{ok:false,status:409,code:'R143_TERMINAL_STATE_LOCKED',run};if(!ALLOWED[run.state]?.has(target))return{ok:false,status:409,code:'R143_ILLEGAL_TRANSITION',from:run.state,to:target,run};const evidence=cleanEvidence(input.evidence);if(target==='VERIFIED'){const valid=run.executor.kind==='HYBRID'?validHybridProof(evidence):validNonHybridProof(evidence);if(!valid)return{ok:false,status:409,code:run.executor.kind==='HYBRID'?'R143_R141_PROOF_REQUIRED':'R143_RESULT_PROOF_REQUIRED',run}}const ev=await eventFor(run,run.state,target,input.reason||`${run.state} -> ${target}`,evidence);run.state=target;run.updatedAt=ev.at;run.events=[...run.events,ev];run.headSha256=ev.hash;await persist(runtime,run);return{ok:true,status:200,run,event:ev}}
export async function verifyExecutionReplayR143(runtime,id){const run=await readExecutionRunR143(runtime,id);if(!run)return null;let previous=null,ok=true;for(let i=0;i<run.events.length;i++){const ev=run.events[i],base={schema:ev.schema,runId:ev.runId,ordinal:ev.ordinal,from:ev.from,to:ev.to,reason:ev.reason,at:ev.at,evidence:ev.evidence,previousHash:ev.previousHash,canonicalMutation:false,canonicalAdmissionAuthority:'R125'},expected=await digest(base);if(ev.ordinal!==i||ev.previousHash!==previous||expected!==ev.hash){ok=false;break}previous=ev.hash}return{ok,schema:'OMEGA_EXECUTION_REPLAY_RECEIPT_R143',runId:run.id,eventCount:run.events.length,replayedHeadSha256:previous,storedHeadSha256:run.headSha256,headMatch:previous===run.headSha256,canonicalMutation:false,canonicalAdmissionAuthority:'R125',verifiedAt:now()}}
