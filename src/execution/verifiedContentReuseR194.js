import {readRunR146} from './durableOperationExecutionR146.js';
import {runtimeStorageR168} from './runtimeStorageR168.js';

export const R194_REVISION='R194';
export const R194_SCHEMA='OMEGA_VERIFIED_CONTENT_REUSE_R194';
export const R194_ALLOWED_DOMAINS=Object.freeze(['AI','SAI','PROOF','LOCAL']);
export const R194_LAWS=Object.freeze([
 'REUSE_REQUIRES_R193_EXACT_INPUT_AND_OPERATOR_FINGERPRINTS',
 'REUSE_KEY_BINDS_CANONICAL_ACTUAL_EXECUTION_REQUEST_SHA256',
 'CALLER_FINGERPRINTS_ALONE_CAN_NEVER_AUTHORIZE_REUSE',
 'REUSE_KEY_BINDS_ALL_R193_OUTPUT_AFFECTING_AXIS_TARGETS',
 'ONLY_VERIFIED_R146_SOURCE_RUNS_MAY_SEED_REUSE',
 'SOURCE_RESULT_BYTES_ARE_SHA256_BOUND_BEFORE_REUSE',
 'CACHE_HIT_EXECUTES_CONTENT_RETRIEVAL_NOT_THE_ORIGINAL_WORKLOAD',
 'CACHE_REUSE_IS_NEVER_A_FRESH_OBSERVATION_OR_PROVIDER_INVOCATION',
 'CACHE_REUSE_ADDS_ZERO_INDEPENDENT_EVIDENCE_WEIGHT',
 'INDEPENDENT_EVIDENCE_REQUIREMENTS_DISABLE_CACHE_FULFILLMENT',
 'BUILD_HYBRID_AND_PLUGIN_DOMAINS_ARE_NEVER_CACHE_FULFILLED',
 'EXPLICIT_EXECUTOR_OR_NON_AUTO_STRATEGY_BYPASSES_CACHE_SELECTION',
 'CACHE_OF_CACHE_PUBLICATION_IS_FORBIDDEN',
 'R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY',
 'R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY',
 'R141_REMAINS_HYBRID_EXACT_RETURN_PROOF_AUTHORITY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const CACHE_PREFIX='execution:r194:cache:';
const ALLOWED_PROOF=new Set(['PLAN_ONLY','RETURN_RECEIPT_REQUIRED','FINGERPRINT_REQUIRED','VERIFIED_EXECUTION_RETURN_REQUIRED']);
const txt=(v,n=300)=>String(v??'').trim().slice(0,n);
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort())out[k]=stable(v[k]);return out}return v};
const sha=async v=>{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(v))));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const domainOf=run=>txt(run?.contract?.executionDomain,32).toUpperCase();
const routeOf=run=>txt(run?.contract?.routeId||run?.contract?.capabilityId||run?.contract?.route,180);
const storage=runtime=>runtimeStorageR168(runtime);

async function exactBasis(run,multiAxis){
 const reuse=multiAxis?.reuse,axes=multiAxis?.axes||{},domain=domainOf(run),proofRequired=txt(axes?.proof?.required,80).toUpperCase();
 if(!R194_ALLOWED_DOMAINS.includes(domain))return{ok:false,reason:'DOMAIN_NOT_REUSABLE',domain};
 if(!reuse?.eligible||!reuse?.requiresExactKeyMatch||!reuse?.requiresSha256Binding||!reuse?.keyBasis)return{ok:false,reason:'R193_REUSE_NOT_ELIGIBLE',domain,r193State:reuse?.state||null};
 if(!ALLOWED_PROOF.has(proofRequired))return{ok:false,reason:'INDEPENDENT_EVIDENCE_REQUIRED',domain,proofRequired};
 const k=reuse.keyBasis;
 if(!txt(k.inputFingerprint,256)||!txt(k.operatorFingerprint,256))return{ok:false,reason:'EXACT_FINGERPRINTS_REQUIRED',domain};
 if(!k.executionRequestBasis||typeof k.executionRequestBasis!=='object'||Array.isArray(k.executionRequestBasis))return{ok:false,reason:'ACTUAL_EXECUTION_REQUEST_BASIS_REQUIRED',domain};
 const executionRequestSha256=await sha(k.executionRequestBasis);
 return{ok:true,domain,basis:{
  schema:'OMEGA_R194_EXACT_CONTENT_KEY_BASIS',
  domain,
  routeId:routeOf(run)||null,
  inputFingerprint:txt(k.inputFingerprint,256),
  operatorFingerprint:txt(k.operatorFingerprint,256),
  executionRequestSha256,
  frameFingerprint:txt(k.frameFingerprint,256)||null,
  addressResolution:Number(axes?.address?.targetResolution)||Number(k.addressResolution)||null,
  targetTemporalHz:Number(axes?.time?.targetHz)||null,
  solverTarget:txt(axes?.fidelity?.solverTarget||k.solverTarget,120)||null,
  fidelityTier:txt(axes?.fidelity?.tier,120)||null,
  observerFrame:txt(axes?.frame?.declaredObserverFrame||k.observerFrame,180)||null,
  framePolicy:txt(axes?.frame?.policy,120)||null,
  logicalLanes:Number(axes?.compute?.logicalLanes)||null,
  proofRequired,
  sourceModeBudget:Number(axes?.modes?.sourceModeBudget)||null,
  canonLensBudget:Number(axes?.modes?.canonLensBudget)||null
 }};
}

export async function reuseKeyR194({run,multiAxis}={}){
 const exact=await exactBasis(run,multiAxis);if(!exact.ok)return{...exact,keySha256:null};
 return{...exact,keySha256:await sha(exact.basis)};
}

export async function lookupVerifiedReuseR194(runtime,{run,multiAxis}={}){
 const keyed=await reuseKeyR194({run,multiAxis});if(!keyed.ok)return{hit:false,...keyed};
 const entry=await storage(runtime).get(CACHE_PREFIX+keyed.keySha256);if(!entry)return{hit:false,reason:'MISS',...keyed};
 if(entry.schema!==R194_SCHEMA||entry.revision!==R194_REVISION||entry.keySha256!==keyed.keySha256)return{hit:false,reason:'ENTRY_SCHEMA_OR_KEY_MISMATCH',...keyed};
 const unsigned={...entry};delete unsigned.entrySha256;const entrySha256=await sha(unsigned);if(entrySha256!==entry.entrySha256)return{hit:false,reason:'ENTRY_SHA256_MISMATCH',...keyed};
 if(await sha(entry.keyBasis)!==keyed.keySha256)return{hit:false,reason:'ENTRY_BASIS_SHA256_MISMATCH',...keyed};
 const sourceRun=await readRunR146(runtime,entry.sourceRunId);if(!sourceRun||sourceRun.state!=='VERIFIED')return{hit:false,reason:'SOURCE_RUN_NOT_VERIFIED',...keyed};
 const sourceResult=entry.sourceResult;if(!sourceResult||sourceResult.resultFingerprint!==entry.sourceResultFingerprint)return{hit:false,reason:'SOURCE_RESULT_FINGERPRINT_MISMATCH',...keyed};
 const sourceResultStorageSha256=await sha(sourceResult);if(sourceResultStorageSha256!==entry.sourceResultStorageSha256)return{hit:false,reason:'SOURCE_RESULT_SHA256_MISMATCH',...keyed};
 return{hit:true,reason:'EXACT_VERIFIED_CONTENT_HIT',...keyed,entry,sourceRun,sourceResult,freshOriginalExecution:false,freshObservation:false,newIndependentEvidence:false,independentEvidenceIncrement:0,truthBoundary:'R194 hit proves an exact stored-key match to bytes captured from an R146 VERIFIED source run and to the SHA-256 of the canonical actual execution request. It does not prove a fresh model/provider/solver/device invocation, a fresh observation, independent replication, scientific validity, or CanonState admission.'};
}

export async function publishVerifiedReuseR194(runtime,{run,executorId,result,multiAxis}={}){
 if(!run||run.state!=='VERIFIED')return{published:false,reason:'SOURCE_RUN_NOT_VERIFIED'};
 if(txt(executorId,64).toUpperCase()==='CONTENT_CACHE')return{published:false,reason:'CACHE_OF_CACHE_FORBIDDEN'};
 if(!result?.resultFingerprint)return{published:false,reason:'SOURCE_RESULT_FINGERPRINT_REQUIRED'};
 const keyed=await reuseKeyR194({run,multiAxis});if(!keyed.ok)return{published:false,...keyed};
 const prior=await storage(runtime).get(CACHE_PREFIX+keyed.keySha256);if(prior?.schema===R194_SCHEMA&&prior?.entrySha256)return{published:true,reusedExistingEntry:true,keySha256:keyed.keySha256,entry:prior};
 const sourceResult=stable(result),sourceResultStorageSha256=await sha(sourceResult),entry={
  schema:R194_SCHEMA,revision:R194_REVISION,keySha256:keyed.keySha256,keyBasis:keyed.basis,
  sourceRunId:run.id,sourceExecutorId:txt(executorId,64).toUpperCase(),sourceResultFingerprint:result.resultFingerprint,sourceResultStorageSha256,sourceResult,
  publishedAt:Date.now(),freshOriginalExecution:true,freshObservation:false,newIndependentEvidence:false,independentEvidenceIncrement:0,canonicalMutation:false,canonicalAdmissionAuthority:'R125'
 };
 entry.entrySha256=await sha(entry);await storage(runtime).put(CACHE_PREFIX+keyed.keySha256,entry);
 return{published:true,reusedExistingEntry:false,keySha256:keyed.keySha256,entry,truthBoundary:'Publication records a verified computation result under an exact R193-derived content key that is independently bound to the canonical actual-request SHA-256. Publication is not independent evidence, CanonState admission, or conversion of result integrity into factual truth.'};
}

export function manifestR194(){return{ok:true,schema:'OMEGA_VERIFIED_CONTENT_REUSE_MANIFEST_R194',revision:R194_REVISION,allowedDomains:R194_ALLOWED_DOMAINS,laws:R194_LAWS,keyBinds:['execution domain','route identity','caller input fingerprint','operator/model implementation fingerprint','canonical actual execution request SHA-256','frame fingerprint','address target','temporal target','solver/fidelity target','observer frame/policy','logical lanes','proof requirement','source-mode budget','canon-lens budget'],sourceRequirement:'R146 VERIFIED plus persisted R147 result fingerprint and SHA-256-bound result bytes',selectionPolicy:'R147 may choose CONTENT_CACHE only after an exact R194 hit and only when the operator did not explicitly select an executor or non-AUTO strategy',evidenceSemantics:{freshObservation:false,newIndependentEvidence:false,independentEvidenceIncrement:0,dependencyRule:'reused bytes retain source-run ancestry and never count as independent replication'},excluded:['BUILD','HYBRID','PLUGIN','independent-evidence proof requirements','implicit/overridden AI prompts that are not the durable run intent','AI/SAI requests without explicit temperature','PROOF/LOCAL work without explicit deterministic reuse declaration','cache-of-cache publication'],authority:{planning:'R193',dispatch:'R147',history:'R146',hybridProof:'R141',admission:'R125'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R194 is a computation-elision fabric. It can avoid repeating exact verified work only when both caller fingerprints and the independently hashed actual execution request agree. It never claims fresh execution of the original workload, fresh observation, independent replication, solver validity, provider truth, or CanonState admission.'}};
