export const R216_REVISION='R216';
export const R216_SCHEMA='OMEGA_EVIDENCE_RECONSTRUCTION_INTENT_R216';
export const R216_SNAPSHOT_KEY='omega.r216.evidenceReconstructionIntent';
export const R216_EVENT='omega-r216-evidence-reconstruction-intent';
export const R216_BOUNDARY='R216 binds existing mission/world/render continuity, byte-proven representational artifact evidence, and the current evidence-bound Earth/ground scene into one deterministic request identity for the existing R122 computed-reality authority. It does not invoke the renderer, create a reconstructed frame, promote a representational artifact into empirical evidence, mutate CanonState, execute a device, close federation, validate a solver, or prove computed photoreal reality.';

const stable=(v)=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v};
const sha256=async(v)=>{const bytes=new TextEncoder().encode(JSON.stringify(stable(v)));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const hash64=(v)=>/^[a-f0-9]{64}$/.test(String(v||''));
const text=(v)=>String(v||'');

export async function compileEvidenceReconstructionIntentR216({mission,anchor,scene,artifactReceipt,projectId}={}){
 const artifactContinuity=artifactReceipt?.continuity||{};
 const earthHash=text(scene?.earthHash||scene?.earth?.hash||scene?.sourceHashes?.earth);
 const groundHash=text(scene?.groundHash||scene?.ground?.hash||scene?.sourceHashes?.ground);
 const evidenceDigest=text(scene?.evidenceDigest||scene?.sceneEvidenceDigest||scene?.evidence?.digest);
 const artifactReceiptSha256=text(artifactReceipt?.artifactReceiptSha256||artifactReceipt?.receiptSha256);
 const artifactSha256=text(artifactReceipt?.artifact?.sha256||artifactReceipt?.artifactSha256||artifactReceipt?.sha256);
 const anchorSha256=text(anchor?.anchorSha256);
 const ready=Boolean(
  mission?.id&&
  anchor?.state==='RENDER_ATTEMPT_CONTINUITY_READY'&&hash64(anchorSha256)&&
  scene?.renderInputReady===true&&scene?.eventAccepted===true&&earthHash&&groundHash&&evidenceDigest&&
  hash64(artifactReceiptSha256)&&hash64(artifactSha256)&&
  artifactReceipt?.authority?.representationalArtifactGenerated===true&&
  artifactReceipt?.authority?.computedRealityFrame===false&&
  (!artifactContinuity.r214AnchorSha256||artifactContinuity.r214AnchorSha256===anchorSha256)
 );
 const missing=[];
 if(!mission?.id)missing.push('MISSION_ID');
 if(anchor?.state!=='RENDER_ATTEMPT_CONTINUITY_READY'||!hash64(anchorSha256))missing.push('R214_ANCHOR');
 if(scene?.eventAccepted!==true)missing.push('EVIDENCE_SCENE_ACCEPTED');
 if(scene?.renderInputReady!==true)missing.push('R122_INPUT_READY');
 if(!earthHash)missing.push('EARTH_EVIDENCE_HASH');
 if(!groundHash)missing.push('GROUND_EVIDENCE_HASH');
 if(!evidenceDigest)missing.push('SCENE_EVIDENCE_DIGEST');
 if(!hash64(artifactReceiptSha256))missing.push('R215_ARTIFACT_RECEIPT_SHA');
 if(!hash64(artifactSha256))missing.push('R215_ARTIFACT_SHA');
 if(artifactReceipt?.authority?.representationalArtifactGenerated!==true)missing.push('REPRESENTATIONAL_ARTIFACT_PROOF');
 if(artifactReceipt?.authority?.computedRealityFrame!==false)missing.push('R215_NON_COMPUTED_FRAME_BOUNDARY');
 if(artifactContinuity.r214AnchorSha256&&artifactContinuity.r214AnchorSha256!==anchorSha256)missing.push('R214_R215_CONTINUITY_MATCH');
 const payload={
  schema:R216_SCHEMA,revision:R216_REVISION,state:ready?'EVIDENCE_RECONSTRUCTION_INTENT_READY':'HELD_FOR_PROOF',missing,
  missionId:text(mission?.id),command:text(mission?.command),projectId:text(projectId),
  r214AnchorSha256:anchorSha256,r213AttemptSha256:text(anchor?.parentAttemptSha256),r211LineageSha256:text(anchor?.parentLineageSha256),r208WorldBindingOperationSha256:text(anchor?.worldBindingOperationSha256),previousWorldHeadSha256:text(anchor?.previousWorldHeadSha256),
  earthHash,groundHash,evidenceDigest,
  r215ArtifactReceiptSha256:artifactReceiptSha256,r215ArtifactSha256:artifactSha256,r215ArtifactMime:text(artifactReceipt?.artifact?.mime||artifactReceipt?.artifact?.mimeType),r215ArtifactBytes:Number(artifactReceipt?.artifact?.byteLength||0),
  requestedAuthority:'R122_EXISTING_COMPUTED_REALITY',adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97_WHEN_PAIRED',canonicalAdmissionAuthority:'R125',
  requestStages:['R122 M09 Earth Evidence Layer','R122 M14 Data Ingestion Adapters','R122 M05 LOD / Octree / Sparse Field','R122 M07 Cinematic Field Renderer','frame artifact receipt must return to R216 request identity'],
  representationalArtifactIsEmpiricalEvidence:false,rendererInvoked:false,reconstructionExecuted:false,renderedFrame:false,renderReceipt:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,newRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false
 };
 const requestSha256=await sha256(payload);
 return{...payload,requestSha256,truthBoundary:R216_BOUNDARY};
}

export function readEvidenceReconstructionIntentR216(){try{const value=JSON.parse(localStorage.getItem(R216_SNAPSHOT_KEY)||'null');return value?.schema===R216_SCHEMA?value:null}catch{return null}}
export function persistEvidenceReconstructionIntentR216(receipt){if(receipt?.state!=='EVIDENCE_RECONSTRUCTION_INTENT_READY'||!hash64(receipt?.requestSha256))return false;try{localStorage.setItem(R216_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R216_EVENT,{detail:receipt}));return true}catch{return false}}
export function readLatestR215ArtifactReceipt(){try{const rows=JSON.parse(localStorage.getItem('omega.v6.render.receipts.r215')||'[]');return Array.isArray(rows)?rows.at(-1)||null:null}catch{return null}}
export function manifestR216(){return{schema:'OMEGA_EVIDENCE_RECONSTRUCTION_INTENT_MANIFEST_R216',revision:R216_REVISION,chain:['R204 mission proof/scar continuity','R208 canonical-world binding','R211 evidence-bound pre-render lineage','R213 adaptive render attempt','R214 recoverable attempt continuity','R215 exact representational artifact byte receipt','R216 evidence reconstruction request identity','future R122 executed frame receipt must return to R216 identity'],authority:{newRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false,computedReality:'R122',adaptivePerformance:'R185',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97 when paired',canonicalAdmission:'R125'},truthBoundary:R216_BOUNDARY};}
