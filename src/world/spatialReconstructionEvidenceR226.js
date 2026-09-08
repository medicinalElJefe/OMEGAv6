export const R226_REVISION='R226';
export const R226_SCHEMA='OMEGA_SPATIAL_RECONSTRUCTION_EVIDENCE_REQUEST_R226';
export const R226_SNAPSHOT_KEY='omega.r226.spatialReconstructionEvidenceRequest';
export const R226_EVENT='omega-r226-spatial-reconstruction-evidence';
export const R226_BOUNDARY='R226 binds the proven R224 source-backed terrain experience to an explicit source-evidence contract for future R122 numerical 3-D reconstruction. It requests calibrated camera pose/intrinsics and measured or source-derived depth with provenance and uncertainty; it does not synthesize missing depth, infer camera calibration from terrain, execute a solver, render a computed-reality frame, claim native execution, close federation, mutate CanonState, prove PC online state, or prove computed photoreal reality.';

const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const sha256=async v=>{const bytes=new TextEncoder().encode(JSON.stringify(stable(v)));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const text=v=>String(v||'');

export async function compileSpatialReconstructionEvidenceRequestR226({terrain}={}){
 const ready=terrain?.state==='LIVING_SOURCE_BACKED_TERRAIN_READY'&&terrain?.experienceReady===true&&hash64(terrain?.receiptSha256)&&hash64(terrain?.visualSha256)&&hash64(terrain?.r222GeometrySha256)&&hash64(terrain?.r219MeshSha256)&&hash64(terrain?.r218FieldSha256);
 const missing=[];
 if(terrain?.state!=='LIVING_SOURCE_BACKED_TERRAIN_READY'||terrain?.experienceReady!==true)missing.push('R224_TERRAIN_EXPERIENCE');
 for(const [key,value] of [['R224_RECEIPT_SHA',terrain?.receiptSha256],['R224_VISUAL_SHA',terrain?.visualSha256],['R222_GEOMETRY_SHA',terrain?.r222GeometrySha256],['R219_MESH_SHA',terrain?.r219MeshSha256],['R218_FIELD_SHA',terrain?.r218FieldSha256]])if(!hash64(value))missing.push(key);
 const evidenceRequirements={
  camera:{required:true,minimum:['sourceIdentity','capturedOrAuthoritativeTime','imageWidthPx','imageHeightPx','intrinsics.fx','intrinsics.fy','intrinsics.cx','intrinsics.cy','pose.referenceFrame','pose.position','pose.orientation','provenance','uncertainty'],acceptOnlySourceBacked:true,inferFromTerrain:false},
  depth:{required:true,minimum:['sourceIdentity','capturedOrAuthoritativeTime','referenceFrame','samplesOrDepthMap','units','provenance','uncertainty'],acceptOnlyMeasuredOrSourceDerived:true,syntheticFill:false},
  registration:{required:true,minimum:['terrainReceiptSha256','cameraEvidenceSha256','depthEvidenceSha256','referenceFrameMatch','temporalRelation'],mustBindSameWorld:true},
  optionalLater:['material evidence','radiometric evidence','independent geometry cross-check']
 };
 const payload={schema:R226_SCHEMA,revision:R226_REVISION,state:ready?'SPATIAL_RECONSTRUCTION_EVIDENCE_REQUEST_READY':'HELD_FOR_R224_TERRAIN_PROOF',missing,missionId:text(terrain?.missionId),projectId:text(terrain?.projectId),profile:text(terrain?.profile),r224ReceiptSha256:text(terrain?.receiptSha256),r224VisualSha256:text(terrain?.visualSha256),r222GeometrySha256:text(terrain?.r222GeometrySha256),r219MeshSha256:text(terrain?.r219MeshSha256),r218FieldSha256:text(terrain?.r218FieldSha256),lineage:terrain?.lineage||null,evidenceRequirements,requestedAuthority:'R122_EXISTING_COMPUTED_REALITY',adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97_WHEN_PAIRED',federationRouting:'EXISTING_FEDERATION_ONLY_WHEN_AUTHENTICATED',canonicalAdmissionAuthority:'R125',terrainSourceBacked:true,cameraEvidencePresent:false,depthEvidencePresent:false,spatialCalibrationProved:false,numerical3DReconstructionExecuted:false,renderedComputedRealityFrame:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,newRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false};
 const requestSha256=await sha256(payload);
 return{...payload,requestSha256,truthBoundary:R226_BOUNDARY};
}

export function persistSpatialReconstructionEvidenceRequestR226(receipt){if(receipt?.state!=='SPATIAL_RECONSTRUCTION_EVIDENCE_REQUEST_READY'||!hash64(receipt?.requestSha256))return false;try{localStorage.setItem(R226_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R226_EVENT,{detail:receipt}));return true}catch{return false}}
export function readSpatialReconstructionEvidenceRequestR226(){try{const value=JSON.parse(localStorage.getItem(R226_SNAPSHOT_KEY)||'null');return value?.schema===R226_SCHEMA?value:null}catch{return null}}
export function manifestR226(){return{schema:'OMEGA_SPATIAL_RECONSTRUCTION_EVIDENCE_MANIFEST_R226',revision:R226_REVISION,chain:['R218 evidence-bound WGS84 field','R221 canonical elevation acquisition','R219 source-backed elevation mesh','R222 terrain geometry','R224 Living World terrain experience','R226 source-backed camera/depth evidence request','future R122 numerical 3-D reconstruction'],authority:{computedReality:'R122',adaptivePerformance:'R185',canonicalAdmission:'R125',operationContinuity:'R86/R87/R97 when available',newRenderer:false,newExecutor:false,newPersistenceAuthority:false},truthBoundary:R226_BOUNDARY};}
