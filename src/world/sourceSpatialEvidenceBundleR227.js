export const R227_REVISION='R227';
export const R227_SCHEMA='OMEGA_SOURCE_SPATIAL_EVIDENCE_BUNDLE_R227';
export const R227_SNAPSHOT_KEY='omega.r227.sourceSpatialEvidenceBundle';
export const R227_EVENT='omega-r227-source-spatial-evidence-bundle';
export const R227_BOUNDARY='R227 validates and binds operator-supplied source-backed camera and depth evidence to an exact R226 request. It proves evidence presence, deterministic identity, shared declared reference frame, and bounded temporal relationship only. It does not infer missing calibration, synthesize depth, execute R122 reconstruction, render a computed-reality frame, claim solver validity, native execution, PC online state, federation closure, Canon mutation, or computed photoreal reality.';

const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const sha256=async v=>{const bytes=new TextEncoder().encode(JSON.stringify(stable(v)));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const finite=v=>Number.isFinite(Number(v));
const nonempty=v=>typeof v==='string'&&v.trim().length>0;
const timeMs=v=>{const n=Date.parse(String(v||''));return Number.isFinite(n)?n:null};
const positionOk=v=>v&&finite(v.x)&&finite(v.y)&&finite(v.z);
const orientationOk=v=>v&&finite(v.x)&&finite(v.y)&&finite(v.z)&&finite(v.w);
const uncertaintyOk=v=>v!==null&&v!==undefined&&(finite(v)||typeof v==='object');
const sourceMethod=v=>['MEASURED','SOURCE_DERIVED','SENSOR_CAPTURE','AUTHORITATIVE_DATASET'].includes(String(v||'').toUpperCase());

function validateCamera(camera){
 const missing=[];
 if(!nonempty(camera?.sourceIdentity))missing.push('camera.sourceIdentity');
 if(timeMs(camera?.capturedOrAuthoritativeTime)===null)missing.push('camera.capturedOrAuthoritativeTime');
 if(!Number.isInteger(Number(camera?.imageWidthPx))||Number(camera?.imageWidthPx)<=0)missing.push('camera.imageWidthPx');
 if(!Number.isInteger(Number(camera?.imageHeightPx))||Number(camera?.imageHeightPx)<=0)missing.push('camera.imageHeightPx');
 for(const k of ['fx','fy','cx','cy'])if(!finite(camera?.intrinsics?.[k]))missing.push(`camera.intrinsics.${k}`);
 if(finite(camera?.intrinsics?.fx)&&Number(camera.intrinsics.fx)<=0)missing.push('camera.intrinsics.fx>0');
 if(finite(camera?.intrinsics?.fy)&&Number(camera.intrinsics.fy)<=0)missing.push('camera.intrinsics.fy>0');
 if(!nonempty(camera?.pose?.referenceFrame))missing.push('camera.pose.referenceFrame');
 if(!positionOk(camera?.pose?.position))missing.push('camera.pose.position');
 if(!orientationOk(camera?.pose?.orientation))missing.push('camera.pose.orientation');
 if(!nonempty(camera?.provenance))missing.push('camera.provenance');
 if(!uncertaintyOk(camera?.uncertainty))missing.push('camera.uncertainty');
 if(!sourceMethod(camera?.acquisitionMethod))missing.push('camera.acquisitionMethod');
 return missing;
}

function validateDepth(depth){
 const missing=[];
 if(!nonempty(depth?.sourceIdentity))missing.push('depth.sourceIdentity');
 if(timeMs(depth?.capturedOrAuthoritativeTime)===null)missing.push('depth.capturedOrAuthoritativeTime');
 if(!nonempty(depth?.referenceFrame))missing.push('depth.referenceFrame');
 const payload=depth?.samplesOrDepthMap;
 if(!(Array.isArray(payload)?payload.length>0:(payload&&typeof payload==='object')))missing.push('depth.samplesOrDepthMap');
 if(!nonempty(depth?.units))missing.push('depth.units');
 if(!nonempty(depth?.provenance))missing.push('depth.provenance');
 if(!uncertaintyOk(depth?.uncertainty))missing.push('depth.uncertainty');
 if(!sourceMethod(depth?.acquisitionMethod))missing.push('depth.acquisitionMethod');
 if(String(depth?.syntheticFill||'').toLowerCase()==='true'||depth?.syntheticFill===true)missing.push('depth.syntheticFill=false');
 return missing;
}

export async function bindSourceSpatialEvidenceBundleR227({request,camera,depth,maxTemporalDeltaMs=300000}={}){
 const missing=[];
 if(request?.state!=='SPATIAL_RECONSTRUCTION_EVIDENCE_REQUEST_READY'||!hash64(request?.requestSha256))missing.push('R226_REQUEST');
 missing.push(...validateCamera(camera),...validateDepth(depth));
 const cameraFrame=String(camera?.pose?.referenceFrame||'');
 const depthFrame=String(depth?.referenceFrame||'');
 const referenceFrameMatch=nonempty(cameraFrame)&&cameraFrame===depthFrame;
 if(!referenceFrameMatch)missing.push('registration.referenceFrameMatch');
 const cameraTime=timeMs(camera?.capturedOrAuthoritativeTime);
 const depthTime=timeMs(depth?.capturedOrAuthoritativeTime);
 const temporalDeltaMs=cameraTime!==null&&depthTime!==null?Math.abs(cameraTime-depthTime):null;
 const temporalRelationBound=temporalDeltaMs!==null&&temporalDeltaMs<=Number(maxTemporalDeltaMs);
 if(!temporalRelationBound)missing.push('registration.temporalRelation');
 const valid=missing.length===0;
 const normalizedCamera=valid?stable(camera):null;
 const normalizedDepth=valid?stable(depth):null;
 const cameraEvidenceSha256=valid?await sha256(normalizedCamera):'';
 const depthEvidenceSha256=valid?await sha256(normalizedDepth):'';
 const registration=valid?{terrainReceiptSha256:request.r224ReceiptSha256,cameraEvidenceSha256,depthEvidenceSha256,referenceFrame:cameraFrame,referenceFrameMatch:true,temporalDeltaMs,temporalRelation:'WITHIN_BOUND'}:null;
 const base={schema:R227_SCHEMA,revision:R227_REVISION,state:valid?'SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND':'HELD_FOR_SOURCE_SPATIAL_EVIDENCE',missing:[...new Set(missing)],requestSha256:String(request?.requestSha256||''),r224ReceiptSha256:String(request?.r224ReceiptSha256||''),r222GeometrySha256:String(request?.r222GeometrySha256||''),r219MeshSha256:String(request?.r219MeshSha256||''),r218FieldSha256:String(request?.r218FieldSha256||''),missionId:String(request?.missionId||''),projectId:String(request?.projectId||''),profile:String(request?.profile||''),lineage:request?.lineage||null,cameraEvidenceSha256,depthEvidenceSha256,registration,requestedAuthority:'R122_EXISTING_COMPUTED_REALITY',adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',canonicalAdmissionAuthority:'R125',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97_WHEN_PAIRED',federationRouting:'EXISTING_FEDERATION_ONLY_WHEN_AUTHENTICATED',cameraEvidencePresent:valid,depthEvidencePresent:valid,referenceFrameMatch:valid,temporalRelationBound:valid,spatialCalibrationProved:false,numerical3DReconstructionExecuted:false,renderedComputedRealityFrame:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,newRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false};
 const bundleSha256=await sha256(base);
 return{...base,bundleSha256,truthBoundary:R227_BOUNDARY};
}

export function persistSourceSpatialEvidenceBundleR227(bundle){if(bundle?.state!=='SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND'||!hash64(bundle?.bundleSha256))return false;try{localStorage.setItem(R227_SNAPSHOT_KEY,JSON.stringify(bundle));window.dispatchEvent(new CustomEvent(R227_EVENT,{detail:bundle}));return true}catch{return false}}
export function readSourceSpatialEvidenceBundleR227(){try{const value=JSON.parse(localStorage.getItem(R227_SNAPSHOT_KEY)||'null');return value?.schema===R227_SCHEMA?value:null}catch{return null}}
export function manifestR227(){return{schema:'OMEGA_SOURCE_SPATIAL_EVIDENCE_MANIFEST_R227',revision:R227_REVISION,chain:['R224 source-backed terrain','R226 camera/depth evidence request','R227 source evidence bundle + declared-frame/temporal binding','future R122 numerical 3-D reconstruction'],authority:{computedReality:'R122',adaptivePerformance:'R185',canonicalAdmission:'R125',operationContinuity:'R86/R87/R97 when available'},truthBoundary:R227_BOUNDARY};}
