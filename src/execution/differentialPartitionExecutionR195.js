import {readRunR146} from './durableOperationExecutionR146.js';
import {runtimeStorageR168} from './runtimeStorageR168.js';

export const R195_REVISION='R195';
export const R195_SCHEMA='OMEGA_DIFFERENTIAL_PARTITION_EXECUTION_R195';
export const R195_MAX_PARTITIONS=64;
export const R195_LAWS=Object.freeze([
 'PARTITION_IDENTITY_IS_CONTENT_DERIVED_NOT_POSITION_ONLY',
 'UNCHANGED_PARTITIONS_MAY_CARRY_ONLY_FROM_R146_VERIFIED_SOURCE_RUNS',
 'CHANGED_PARTITIONS_RECOMPUTE_WHILE_UNCHANGED_PARTITIONS_RETAIN_EXACT_BOUND_BYTES',
 'PARTITION_CACHE_KEYS_BIND_MODEL_PARAMETERS_OPERATOR_FRAME_AND_R193_AXIS_REQUIREMENTS',
 'CARRIED_PARTITION_IS_NOT_FRESH_PROVIDER_EXECUTION_OR_OBSERVATION',
 'FRESH_PARTITION_RETURN_IS_STILL_PROVIDER_OUTPUT_NOT_FACTUAL_TRUTH',
 'INDEPENDENT_EVIDENCE_REQUIREMENTS_FORCE_FRESH_PARTITION_EXECUTION',
 'REQUIRE_FRESH_PARTITIONS_BYPASSES_ALL_PARTITION_CARRY',
 'PARTITION_REASSEMBLY_PRESERVES_DECLARED_ORDER_AND_PROVENANCE',
 'R194_WHOLE_RESULT_REUSE_REMAINS_SEPARATE_FROM_R195_PARTIAL_CARRY',
 'R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY',
 'R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const PREFIX='execution:r195:partition:';
const DEEP_PROOF=new Set(['INDEPENDENT_EVIDENCE_REQUIRED','INDEPENDENT_EVIDENCE_PLUS_R125_ADMISSION_REVIEW']);
const txt=(v,n=12000)=>String(v??'').trim().slice(0,n);
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort())out[k]=stable(v[k]);return out}return v};
const sha=async v=>{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(v))));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const storage=runtime=>runtimeStorageR168(runtime);
const domainOf=run=>txt(run?.contract?.executionDomain,32).toUpperCase();
const safeId=v=>{const s=txt(v,100);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};
const axisBasis=m=>({addressResolution:Number(m?.axes?.address?.targetResolution)||null,targetHz:Number(m?.axes?.time?.targetHz)||null,solverTarget:txt(m?.axes?.fidelity?.solverTarget,120)||null,fidelityTier:txt(m?.axes?.fidelity?.tier,120)||null,framePolicy:txt(m?.axes?.frame?.policy,120)||null,observerFrame:txt(m?.axes?.frame?.declaredObserverFrame,180)||null,logicalLanes:Number(m?.axes?.compute?.logicalLanes)||null,proofRequired:txt(m?.axes?.proof?.required,120).toUpperCase()||null,sourceModeBudget:Number(m?.axes?.modes?.sourceModeBudget)||null,canonLensBudget:Number(m?.axes?.modes?.canonLensBudget)||null});

function normalizedPartitions(input={}){
 const rows=Array.isArray(input.partitions)?input.partitions:[];if(!rows.length)return[];if(rows.length>R195_MAX_PARTITIONS)throw new Error('R195_PARTITION_LIMIT_EXCEEDED');
 const seen=new Set();return rows.map((p,i)=>{const id=safeId(p?.id)||`P${String(i+1).padStart(3,'0')}`;if(seen.has(id))throw new Error(`R195_DUPLICATE_PARTITION_ID:${id}`);seen.add(id);const prompt=txt(p?.prompt??p?.content,12000);if(!prompt)throw new Error(`R195_PARTITION_CONTENT_REQUIRED:${id}`);return{id,ordinal:i,prompt,forceFresh:p?.forceFresh===true,metadata:p?.metadata&&typeof p.metadata==='object'?stable(p.metadata):null}})
}

async function partitionKey({run,partition,input,multiAxis,model}){
 const basis={schema:'OMEGA_R195_PARTITION_KEY_BASIS',domain:domainOf(run),routeId:txt(run?.contract?.routeId||run?.contract?.capabilityId||run?.contract?.route,180)||null,partitionId:partition.id,partitionContentSha256:await sha(partition.prompt),model:txt(model,180),temperature:Number.isFinite(Number(input.temperature))?Number(input.temperature):.2,maxTokens:Math.max(128,Math.min(1600,Number(input.maxTokens)||900)),operatorFingerprint:txt(input.operatorFingerprint,256)||null,frameFingerprint:txt(input.frameFingerprint,256)||null,axes:axisBasis(multiAxis)};return{basis,keySha256:await sha(basis)};
}

async function validateEntry(runtime,entry,keySha256){
 if(!entry||entry.schema!==R195_SCHEMA||entry.revision!==R195_REVISION||entry.keySha256!==keySha256)return{ok:false,reason:'MISS_OR_SCHEMA_KEY_MISMATCH'};
 const unsigned={...entry};delete unsigned.entrySha256;if(await sha(unsigned)!==entry.entrySha256)return{ok:false,reason:'ENTRY_SHA256_MISMATCH'};
 const sourceRun=await readRunR146(runtime,entry.sourceRunId);if(!sourceRun||sourceRun.state!=='VERIFIED')return{ok:false,reason:'SOURCE_RUN_NOT_VERIFIED'};
 const result=entry.result;if(!result||await sha(result)!==entry.resultSha256)return{ok:false,reason:'PARTITION_RESULT_SHA256_MISMATCH'};
 return{ok:true,sourceRun,result};
}

export async function planDifferentialPartitionsR195(runtime,{run,input={},multiAxis=null,model=''}={}){
 let partitions;try{partitions=normalizedPartitions(input)}catch(error){return{enabled:true,ok:false,code:txt(error instanceof Error?error.message:error,240)}}
 if(!partitions.length)return{enabled:false,ok:true,reason:'NO_PARTITIONS'};
 const domain=domainOf(run);if(!['AI','SAI'].includes(domain))return{enabled:false,ok:true,reason:'DOMAIN_NOT_PARTITION_EXECUTABLE',domain};
 const proofRequired=axisBasis(multiAxis).proofRequired;if(DEEP_PROOF.has(proofRequired))return{enabled:true,ok:true,forceFresh:true,reason:'INDEPENDENT_EVIDENCE_REQUIRES_FRESH_EXECUTION',proofRequired,partitions:await Promise.all(partitions.map(async p=>({...p,...await partitionKey({run,partition:p,input,multiAxis,model}),action:'RECOMPUTE',carry:null})))};
 const forceAll=input.requireFreshPartitions===true,planned=[];for(const p of partitions){const keyed=await partitionKey({run,partition:p,input,multiAxis,model});let action='RECOMPUTE',carry=null,reason=forceAll?'REQUIRE_FRESH_PARTITIONS':p.forceFresh?'PARTITION_FORCE_FRESH':'MISS';if(!forceAll&&!p.forceFresh){const entry=await storage(runtime).get(PREFIX+keyed.keySha256),valid=await validateEntry(runtime,entry,keyed.keySha256);if(valid.ok){action='CARRY';reason='EXACT_VERIFIED_PARTITION_HIT';carry={sourceRunId:entry.sourceRunId,sourceExecutorId:entry.sourceExecutorId,result:valid.result,resultSha256:entry.resultSha256,entrySha256:entry.entrySha256}}else reason=valid.reason}planned.push({...p,...keyed,action,reason,carry})}
 const carried=planned.filter(x=>x.action==='CARRY').length,recompute=planned.length-carried;return{enabled:true,ok:true,schema:'OMEGA_DIFFERENTIAL_PARTITION_PLAN_R195',revision:R195_REVISION,partitionCount:planned.length,carried,recompute,carryFraction:planned.length?carried/planned.length:0,recomputeFraction:planned.length?recompute/planned.length:0,partitions:planned,proofRequired,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R195 marks unchanged partitions CARRY only after exact content/model/parameter/axis-key match to a SHA-bound result from an R146 VERIFIED source run. CARRY is not fresh provider execution, fresh observation, or factual re-verification.'};
}

export async function publishDifferentialPartitionsR195(runtime,{run,executorId,plan,freshResults=[]}={}){
 if(!run||run.state!=='VERIFIED')return{published:0,reason:'SOURCE_RUN_NOT_VERIFIED'};if(!plan?.enabled||!plan?.ok)return{published:0,reason:'VALID_PLAN_REQUIRED'};
 const byId=new Map(freshResults.map(x=>[x.id,x])),rows=[];for(const p of plan.partitions||[]){if(p.action!=='RECOMPUTE')continue;const fresh=byId.get(p.id);if(!fresh)continue;const result=stable(fresh.result),entry={schema:R195_SCHEMA,revision:R195_REVISION,keySha256:p.keySha256,keyBasis:p.basis,partitionId:p.id,sourceRunId:run.id,sourceExecutorId:txt(executorId,64).toUpperCase(),result,resultSha256:await sha(result),publishedAt:Date.now(),canonicalMutation:false,canonicalAdmissionAuthority:'R125'};entry.entrySha256=await sha(entry);await storage(runtime).put(PREFIX+p.keySha256,entry);rows.push({partitionId:p.id,keySha256:p.keySha256,entrySha256:entry.entrySha256})}
 return{published:rows.length,rows,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R195 publication makes freshly returned partition bytes eligible for future exact carry only after the enclosing R146 run reached VERIFIED. Publication is not factual truth or CanonState admission.'};
}

export function assembleDifferentialPartitionsR195(plan,freshResults=[]){
 if(!plan?.enabled||!plan?.ok)return null;const fresh=new Map(freshResults.map(x=>[x.id,x.result])),rows=(plan.partitions||[]).map(p=>{if(p.action==='CARRY')return{id:p.id,ordinal:p.ordinal,status:'CARRIED',text:txt(p.carry?.result?.text??p.carry?.result?.value,16000),sourceRunId:p.carry?.sourceRunId||null,resultSha256:p.carry?.resultSha256||null};const r=fresh.get(p.id)||{};return{id:p.id,ordinal:p.ordinal,status:'EXECUTED',text:txt(r?.text??r?.value,16000),sourceRunId:null,resultSha256:null}}).sort((a,b)=>a.ordinal-b.ordinal);return{schema:'OMEGA_DIFFERENTIAL_PARTITION_ASSEMBLY_R195',revision:R195_REVISION,partitions:rows,text:rows.map(x=>x.text).filter(Boolean).join('\n\n'),carried:rows.filter(x=>x.status==='CARRIED').length,executed:rows.filter(x=>x.status==='EXECUTED').length,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'Assembly preserves declared partition order and provenance. Carried bytes remain prior verified returns; executed bytes are fresh provider returns. Neither category automatically establishes factual truth or CanonState.'};
}

export function manifestR195(){return{ok:true,schema:'OMEGA_DIFFERENTIAL_PARTITION_EXECUTION_MANIFEST_R195',revision:R195_REVISION,laws:R195_LAWS,maxPartitions:R195_MAX_PARTITIONS,supportedDomains:['AI','SAI'],inputs:['explicit partition ids/content','actual partition content SHA-256','model and generation parameters','operator/frame fingerprints when supplied','R193 axis requirements','R146 source-run state'],actions:['CARRY exact verified partition','RECOMPUTE changed or unproven partition','ASSEMBLE in declared order'],authority:{multiAxis:'R193',wholeReuse:'R194',dispatch:'R147',history:'R146',admission:'R125'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R195 is differential computation, not a new truth authority. It reduces repeated partitionable AI/SAI work by carrying exact SHA-bound partitions from prior R146 VERIFIED runs and invoking the provider only for changed partitions. Deep independent-evidence requirements and explicit fresh-partition requests force recomputation.'}};
