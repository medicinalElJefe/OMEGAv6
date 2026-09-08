export const R231_REVISION='R231';
export const R231_SCHEMA='OMEGA_SOURCE_SPATIAL_CALIBRATION_VALIDATION_R231';
export const R231_SNAPSHOT_KEY='omega.r231.sourceSpatialCalibrationValidation';
export const R231_EVENT='omega-r231-source-spatial-calibration-validation';
export const R231_BOUNDARY='R231 evaluates only independently supplied world-to-image correspondences against the exact R228 camera evidence and exact R230 frame lineage, producing deterministic reprojection residuals and a bounded validation receipt. It does not authenticate the external source by itself, derive correspondences from R228 geometry, solve or alter calibration, infer missing measurements, prove global physical registration, validate a scientific solver, invoke native/remote execution, prove PC online state, close federation, mutate CanonState, or prove computed photoreal reality.';

const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const sha256=async v=>{const bytes=new TextEncoder().encode(JSON.stringify(stable(v)));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const finite=v=>Number.isFinite(Number(v));
const text=v=>String(v||'');
const round=(v,p=6)=>Number(Number(v).toFixed(p));
const allowedMethods=new Set(['SURVEY_CONTROL','CALIBRATION_TARGET','EXTERNAL_REGISTRATION','MARKER_DETECTION','INDEPENDENT_SENSOR']);

function quaternion(q){
 if(!q||!['x','y','z','w'].every(k=>finite(q[k])))return null;
 const x=Number(q.x),y=Number(q.y),z=Number(q.z),w=Number(q.w),n=Math.hypot(x,y,z,w);
 if(!Number.isFinite(n)||n===0||Math.abs(n-1)>.02)return null;
 return{x:x/n,y:y/n,z:z/n,w:w/n};
}
function rotate(v,q){const tx=2*(q.y*v.z-q.z*v.y),ty=2*(q.z*v.x-q.x*v.z),tz=2*(q.x*v.y-q.y*v.x);return{x:v.x+q.w*tx+(q.y*tz-q.z*ty),y:v.y+q.w*ty+(q.z*tx-q.x*tz),z:v.z+q.w*tz+(q.x*ty-q.y*tx)}}
function inverseWorldToCamera(world,pos,q){const d={x:Number(world.x)-Number(pos.x),y:Number(world.y)-Number(pos.y),z:Number(world.z)-Number(pos.z)};return rotate(d,{x:-q.x,y:-q.y,z:-q.z,w:q.w})}
function percentile(values,p){if(!values.length)return null;const a=[...values].sort((x,y)=>x-y),i=Math.min(a.length-1,Math.max(0,Math.ceil((p/100)*a.length)-1));return a[i]}

export async function validateSourceSpatialCalibrationR231({frame,reconstruction,camera,validationEvidence,rmsThresholdPx=2,maxThresholdPx=5,minCorrespondences=4}={}){
 const missing=[];
 if(frame?.state!=='SOURCE_SPATIAL_COMPUTED_FRAME_RENDERED'||!hash64(frame?.frameSha256)||!hash64(frame?.receiptSha256))missing.push('R230_FRAME');
 if(reconstruction?.state!=='SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED'||!hash64(reconstruction?.geometrySha256)||!hash64(reconstruction?.receiptSha256))missing.push('R228_RECONSTRUCTION');
 if(text(frame?.r228GeometrySha256)!==text(reconstruction?.geometrySha256)||text(frame?.r228ReceiptSha256)!==text(reconstruction?.receiptSha256))missing.push('R230_R228_LINEAGE');
 const cameraSha256=await sha256(stable(camera||null));
 if(cameraSha256!==text(reconstruction?.cameraEvidenceSha256))missing.push('R228_CAMERA_HASH_MISMATCH');
 const width=Number(camera?.imageWidthPx),height=Number(camera?.imageHeightPx),fx=Number(camera?.intrinsics?.fx),fy=Number(camera?.intrinsics?.fy),cx=Number(camera?.intrinsics?.cx),cy=Number(camera?.intrinsics?.cy),pos=camera?.pose?.position,q=quaternion(camera?.pose?.orientation),frameName=text(camera?.pose?.referenceFrame);
 if(!Number.isInteger(width)||width<=0||!Number.isInteger(height)||height<=0||!finite(fx)||fx<=0||!finite(fy)||fy<=0||!finite(cx)||!finite(cy))missing.push('camera.intrinsics');
 if(!pos||!['x','y','z'].every(k=>finite(pos[k]))||!q)missing.push('camera.pose');
 if(frameName!==text(reconstruction?.referenceFrame))missing.push('camera.referenceFrame');
 const ev=validationEvidence||{},method=text(ev.acquisitionMethod).toUpperCase(),corr=Array.isArray(ev.correspondences)?ev.correspondences:[];
 if(!text(ev.sourceIdentity)||!text(ev.provenance)||!allowedMethods.has(method))missing.push('validationEvidence.sourceProvenance');
 if(text(ev.referenceFrame)!==frameName)missing.push('validationEvidence.referenceFrame');
 if(text(ev.sourceIdentity)===text(camera?.sourceIdentity)||text(ev.sourceIdentity)===text(reconstruction?.r227BundleSha256))missing.push('validationEvidence.independence');
 const minN=Math.max(4,Math.min(32,Math.floor(Number(minCorrespondences)||4)));
 if(corr.length<minN||corr.length>256)missing.push('validationEvidence.correspondenceCount');
 const rows=[];
 if(!missing.length){
  for(let i=0;i<corr.length;i++){
   const c=corr[i],w=c?.world||c?.worldPoint||{},u=Number(c?.u),v=Number(c?.v);
   if(!finite(u)||!finite(v)||!['x','y','z'].every(k=>finite(w[k]))||u<0||u>=width||v<0||v>=height){missing.push(`correspondence.${i}.shape`);continue}
   const cam=inverseWorldToCamera(w,pos,q);if(!finite(cam.x)||!finite(cam.y)||!finite(cam.z)||cam.z<=0){missing.push(`correspondence.${i}.behindCamera`);continue}
   const pu=fx*cam.x/cam.z+cx,pv=fy*cam.y/cam.z+cy,residual=Math.hypot(pu-u,pv-v);
   rows.push({i,u:round(u,3),v:round(v,3),projectedU:round(pu,3),projectedV:round(pv,3),residualPx:round(residual,6),world:{x:round(w.x),y:round(w.y),z:round(w.z)}})
  }
 }
 const rmsLimit=Math.max(.05,Math.min(25,Number(rmsThresholdPx)||2)),maxLimit=Math.max(rmsLimit,Math.min(50,Number(maxThresholdPx)||5));
 if(missing.length)return{schema:R231_SCHEMA,revision:R231_REVISION,state:'HELD_FOR_INDEPENDENT_CALIBRATION_EVIDENCE',missing:[...new Set(missing)],r230FrameSha256:text(frame?.frameSha256),r228GeometrySha256:text(reconstruction?.geometrySha256),cameraEvidenceSha256:cameraSha256,independentCorrespondenceValidationPassed:false,spatialCalibrationProved:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R231_BOUNDARY};
 const residuals=rows.map(r=>r.residualPx),rms=Math.sqrt(residuals.reduce((s,x)=>s+x*x,0)/residuals.length),max=Math.max(...residuals),p95=percentile(residuals,95),passed=rms<=rmsLimit&&max<=maxLimit;
 const evidenceSha256=await sha256(stable({sourceIdentity:text(ev.sourceIdentity),provenance:text(ev.provenance),acquisitionMethod:method,referenceFrame:text(ev.referenceFrame),capturedOrAuthoritativeTime:text(ev.capturedOrAuthoritativeTime),uncertainty:ev.uncertainty??null,correspondences:corr}));
 const core={r230FrameSha256:text(frame.frameSha256),r230ReceiptSha256:text(frame.receiptSha256),r228GeometrySha256:text(reconstruction.geometrySha256),r228ReceiptSha256:text(reconstruction.receiptSha256),cameraEvidenceSha256:cameraSha256,validationEvidenceSha256:evidenceSha256,referenceFrame:frameName,correspondenceCount:rows.length,rmsResidualPx:round(rms),p95ResidualPx:round(p95),maxResidualPx:round(max),rmsThresholdPx:rmsLimit,maxThresholdPx:maxLimit,independentCorrespondenceValidationPassed:passed};
 const receiptSha256=await sha256(core);
 return{schema:R231_SCHEMA,revision:R231_REVISION,state:passed?'INDEPENDENT_SPATIAL_CALIBRATION_VALIDATION_PASSED':'INDEPENDENT_SPATIAL_CALIBRATION_VALIDATION_FAILED',...core,receiptSha256,residuals:rows,validationSourceIdentity:text(ev.sourceIdentity),validationAcquisitionMethod:method,sourceAuthenticationProved:false,spatialCalibrationProved:false,globalPhysicalRegistrationProved:false,calibrationSolvedOrAltered:false,renderedComputedRealityFrame:true,computedRepresentationOnly:true,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,computedRealityAuthority:'R122_EXISTING_AUTHORITY_UNCHANGED',adaptivePerformanceAuthority:'R185_EXISTING_AUTHORITY_UNCHANGED',canonicalAdmissionAuthority:'R125',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97_WHEN_PAIRED',truthBoundary:R231_BOUNDARY};
}
export function persistSourceSpatialCalibrationValidationR231(receipt){if(!['INDEPENDENT_SPATIAL_CALIBRATION_VALIDATION_PASSED','INDEPENDENT_SPATIAL_CALIBRATION_VALIDATION_FAILED'].includes(receipt?.state)||!hash64(receipt?.receiptSha256))return false;try{localStorage.setItem(R231_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R231_EVENT,{detail:receipt}));return true}catch{return false}}
export function readSourceSpatialCalibrationValidationR231(){try{const v=JSON.parse(localStorage.getItem(R231_SNAPSHOT_KEY)||'null');return v?.schema===R231_SCHEMA?v:null}catch{return null}}
export function manifestR231(){return{schema:'OMEGA_SOURCE_SPATIAL_CALIBRATION_VALIDATION_MANIFEST_R231',revision:R231_REVISION,chain:['exact R230 frame receipt','exact R228 source-derived geometry receipt','exact R228-bound camera evidence hash','independent source correspondence evidence','world-to-camera reprojection','RMS/p95/max pixel residuals','bounded pass/fail receipt'],authority:{computedReality:'R122 unchanged',adaptivePerformance:'R185 unchanged',canonicalAdmission:'R125',continuity:'R86/R87/R97 when authenticated'},truthBoundary:R231_BOUNDARY};}
