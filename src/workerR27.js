import r9 from './workerR9.js';

const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const CANONICAL_URL='https://omegav6.jeffdeweyeljefe.workers.dev';
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:JSON_HEADERS});
async function sha256(value){const bytes=new TextEncoder().encode(JSON.stringify(value));const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function buildReceipt(request,env){
  if(!env?.ASSETS?.fetch)return {ok:false,state:'ASSET_BINDING_UNAVAILABLE'};
  try{
    const url=new URL('/omega-build-receipt.json',request.url);
    const response=await env.ASSETS.fetch(new Request(url,{headers:{'cache-control':'no-cache'}}));
    const text=await response.text();
    if(!response.ok)return {ok:false,state:'BUILD_RECEIPT_UNAVAILABLE',status:response.status};
    return {ok:true,data:JSON.parse(text)};
  }catch(error){return {ok:false,state:'BUILD_RECEIPT_READ_FAILED',error:error instanceof Error?error.message:String(error)}}
}
async function releaseEvidence(request,env){
  const receipt=await buildReceipt(request,env);
  const metadata=env?.CF_VERSION_METADATA||null;
  const core={
    schema:'OMEGA_RELEASE_EVIDENCE_V1',
    canonicalUrl:CANONICAL_URL,
    source:receipt.ok?receipt.data?.source||null:null,
    promotionLineage:receipt.ok?receipt.data?.promotion||null:null,
    packageReceipt:receipt.ok?{schema:receipt.data?.schema||null,receiptSha256:receipt.data?.receiptSha256||null,state:receipt.data?.state||null,workflow:receipt.data?.workflow||null}:null,
    runtimeVersion:metadata?{id:String(metadata.id||''),tag:metadata.tag?String(metadata.tag):null,timestamp:metadata.timestamp?String(metadata.timestamp):null}:null,
    runtimeAuthority:{cloudflareVersionMetadata:metadata?'RETURNED':'UNAVAILABLE',publicWorkerMutationAuthority:false},
    externalGates:{candidateQa:'EXTERNAL_GITHUB_EVIDENCE_REQUIRED',postDeployVerification:'EXTERNAL_FIRST_HAND_PROBE_REQUIRED',rollback:'EXTERNAL_RELEASE_LEDGER_REQUIRED'},
    truthBoundary:'This read-only endpoint binds packaged source and verified merge-parent lineage, when present in the governed receipt, to the Cloudflare version currently executing this response. Candidate QA and post-deploy verification remain external governed evidence and are never invented by the public Worker.'
  };
  const evidenceSha256=await sha256(core);
  return json({...core,evidenceSha256,returnedAt:new Date().toISOString()});
}
async function runtimeAttestationR144(request,env){
  const receipt=await buildReceipt(request,env);
  const metadata=env?.CF_VERSION_METADATA||null;
  const source=receipt.ok?receipt.data?.source||null:null;
  const promotionLineage=receipt.ok?receipt.data?.promotion||null:null;
  const packageReceipt=receipt.ok?{schema:receipt.data?.schema||null,receiptSha256:receipt.data?.receiptSha256||null,state:receipt.data?.state||null,workflow:receipt.data?.workflow||null}:null;
  const runtimeVersion=metadata?{id:String(metadata.id||''),tag:metadata.tag?String(metadata.tag):null,timestamp:metadata.timestamp?String(metadata.timestamp):null}:null;
  const mergeBound=Boolean(promotionLineage?.promotedMergeSha&&promotionLineage?.candidateSha&&promotionLineage?.rollbackSha&&promotionLineage?.authority==='GITHUB_MERGE_PARENTS');
  const core={
    schema:'OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144',
    revision:'R144',
    canonicalUrl:CANONICAL_URL,
    source,
    promotionLineage,
    packageReceipt,
    runtimeVersion,
    authorityChain:{uiOperationChain:{revision:'R143',schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143'},capabilityLifecycle:{revision:'R142',schema:'OMEGA_CAPABILITY_EXECUTION_RECEIPT_R142'},hybridExecutionProof:{revision:'R141',authority:'EXACT_PAYLOAD_CLOSURE'},canonicalAdmission:{revision:'R125',authority:'CANONSTATE_PROOF_GATED_ADMISSION'}},
    lifecycle:{implemented:'IMPLEMENTED',tested:'EXTERNAL_GITHUB_EVIDENCE_REQUIRED',merged:mergeBound?'MERGE_LINEAGE_BOUND':'EXTERNAL_RELEASE_LEDGER_REQUIRED',deployed:metadata?'CLOUDFLARE_VERSION_RETURNED':'UNVERIFIED',live:'CURRENT_RUNTIME_RESPONSE_RETURNED',verified:'EXTERNAL_FIRST_HAND_PROBE_REQUIRED'},
    bindings:{sourceSha:source?.sha||null,packageReceiptSha256:packageReceipt?.receiptSha256||null,cloudflareVersionId:runtimeVersion?.id||null,releaseEvidence:'/api/release-evidence',buildReceipt:'/omega-build-receipt.json'},
    runtimeAuthority:{cloudflareVersionMetadata:metadata?'RETURNED':'UNAVAILABLE',publicWorkerMutationAuthority:false,canonicalMutation:false,admissionAuthority:'R125'},
    truthBoundary:'R144 separates implemented, tested, merged, deployed, live and verified states. The Worker may attest only first-hand package/runtime facts available in this response. GitHub candidate QA, merge admission, post-deploy verification and rollback remain separately proved external boundaries; no state is promoted by inference.'
  };
  const attestationSha256=await sha256(core);
  return json({...core,attestationSha256,returnedAt:new Date().toISOString()});
}

async function fetchR27(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/release-evidence'&&request.method==='GET')return releaseEvidence(request,env);
  if(url.pathname==='/api/runtime-attestation'&&request.method==='GET')return runtimeAttestationR144(request,env);
  return r9.fetch(request,env);
}

export default {fetch:fetchR27};