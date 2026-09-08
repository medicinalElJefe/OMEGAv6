export const R228_REVISION='R228';
export const R228_SCHEMA='OMEGA_SOURCE_SPATIAL_RECONSTRUCTION_R228';
export const R228_SNAPSHOT_KEY='omega.r228.sourceSpatialReconstruction';
export const R228_EVENT='omega-r228-source-spatial-reconstruction';
export const R228_BOUNDARY='R228 deterministically back-projects only exact R227-bound numeric depth samples through the operator-supplied camera intrinsics and declared pose, producing bounded source-derived 3-D geometry with cryptographic lineage. It applies declared calibration parameters but does not independently prove camera calibration, infer missing depth, synthesize pixels, validate a physical solver, invoke native/GPU/remote execution, prove PC online state, close federation, mutate CanonState, or prove computed photoreal reality.';

const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const sha256=async v=>{const bytes=new TextEncoder().encode(JSON.stringify(stable(v)));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const finite=v=>Number.isFinite(Number(v));
const text=v=>String(v||'');
const round=(v,p=6)=>Number(Number(v).toFixed(p));
const unitScale=units=>{const u=String(units||'').trim().toLowerCase();if(['m','meter','meters','metre','metres'].includes(u))return 1;if(['cm','centimeter','centimeters','centimetre','centimetres'].includes(u))return .01;if(['mm','millimeter','millimeters','millimetre','millimetres'].includes(u))return .001;return null};

function sampleObject(sample){
 if(Array.isArray(sample)&&sample.length>=3)return{u:Number(sample[0]),v:Number(sample[1]),depth:Number(sample[2])};
 if(!sample||typeof sample!=='object')return null;
 return{u:Number(sample.u??sample.x??sample.column??sample.col),v:Number(sample.v??sample.y??sample.row),depth:Number(sample.depth??sample.depthM??sample.z??sample.value)};
}

function decodeDepthSamples(depth,maxInputSamples=131072){
 const payload=depth?.samplesOrDepthMap,missing=[];
 let raw=[];
 if(Array.isArray(payload))raw=payload.map(sampleObject);
 else if(payload&&typeof payload==='object'&&Array.isArray(payload.samples))raw=payload.samples.map(sampleObject);
 else if(payload&&typeof payload==='object'&&Array.isArray(payload.values)&&Number.isInteger(Number(payload.width))&&Number.isInteger(Number(payload.height))){
  const width=Number(payload.width),height=Number(payload.height),values=payload.values;
  if(width<=0||height<=0||values.length!==width*height)return{samples:[],missing:['depth.gridShape']};
  if(values.length>maxInputSamples)return{samples:[],missing:['depth.inputSampleLimit']};
  raw=[];
  for(let i=0;i<values.length;i++){const d=values[i];if(d===null||d===undefined||Number(d)<=0)continue;raw.push({u:i%width,v:Math.floor(i/width),depth:Number(d)})}
 }else return{samples:[],missing:['depth.numericSamples']};
 if(raw.length===0)return{samples:[],missing:['depth.numericSamples']};
 if(raw.length>maxInputSamples)return{samples:[],missing:['depth.inputSampleLimit']};
 if(raw.some(s=>!s||!finite(s.u)||!finite(s.v)||!finite(s.depth)||s.depth<=0))missing.push('depth.sampleValidity');
 return{samples:missing.length?[]:raw,missing};
}

function boundedSample(samples,maxPoints){
 const n=samples.length,limit=Math.max(3,Math.min(2048,Math.floor(Number(maxPoints)||2048)));
 if(n<=limit)return samples;
 const out=[];
 for(let i=0;i<limit;i++){const idx=Math.floor(i*(n-1)/(limit-1));out.push(samples[idx])}
 return out;
}

function quaternionDiagnostics(q){
 if(!q||!['x','y','z','w'].every(k=>finite(q[k])))return{ok:false,norm:null,q:null};
 const x=Number(q.x),y=Number(q.y),z=Number(q.z),w=Number(q.w),norm=Math.hypot(x,y,z,w);
 if(!Number.isFinite(norm)||norm===0||Math.abs(norm-1)>.02)return{ok:false,norm,q:null};
 return{ok:true,norm,q:{x:x/norm,y:y/norm,z:z/norm,w:w/norm}};
}

function rotateVector(v,q){
 const tx=2*(q.y*v.z-q.z*v.y),ty=2*(q.z*v.x-q.x*v.z),tz=2*(q.x*v.y-q.y*v.x);
 return{x:v.x+q.w*tx+(q.y*tz-q.z*ty),y:v.y+q.w*ty+(q.z*tx-q.x*tz),z:v.z+q.w*tz+(q.x*ty-q.y*tx)};
}

function geometryStats(points){
 const min={x:Infinity,y:Infinity,z:Infinity},max={x:-Infinity,y:-Infinity,z:-Infinity},sum={x:0,y:0,z:0};
 for(const p of points){for(const k of ['x','y','z']){if(p[k]<min[k])min[k]=p[k];if(p[k]>max[k])max[k]=p[k];sum[k]+=p[k]}}
 const n=points.length;
 return{bounds:{min:{x:round(min.x),y:round(min.y),z:round(min.z)},max:{x:round(max.x),y:round(max.y),z:round(max.z)}},centroid:{x:round(sum.x/n),y:round(sum.y/n),z:round(sum.z/n)}};
}

export async function reconstructSourceSpatialGeometryR228({bundle,camera,depth,maxPoints=2048}={}){
 const missing=[];
 if(bundle?.state!=='SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND'||!hash64(bundle?.bundleSha256))missing.push('R227_BUNDLE');
 const cameraEvidenceSha256=await sha256(stable(camera||null)),depthEvidenceSha256=await sha256(stable(depth||null));
 if(cameraEvidenceSha256!==String(bundle?.cameraEvidenceSha256||''))missing.push('R227_CAMERA_HASH_MISMATCH');
 if(depthEvidenceSha256!==String(bundle?.depthEvidenceSha256||''))missing.push('R227_DEPTH_HASH_MISMATCH');
 const width=Number(camera?.imageWidthPx),height=Number(camera?.imageHeightPx),fx=Number(camera?.intrinsics?.fx),fy=Number(camera?.intrinsics?.fy),cx=Number(camera?.intrinsics?.cx),cy=Number(camera?.intrinsics?.cy);
 if(!Number.isInteger(width)||width<=0||!Number.isInteger(height)||height<=0||!finite(fx)||fx<=0||!finite(fy)||fy<=0||!finite(cx)||!finite(cy))missing.push('camera.intrinsics');
 if(finite(cx)&&(cx<0||cx>width))missing.push('camera.intrinsics.cxBounds');
 if(finite(cy)&&(cy<0||cy>height))missing.push('camera.intrinsics.cyBounds');
 const pos=camera?.pose?.position;
 if(!pos||!['x','y','z'].every(k=>finite(pos[k])))missing.push('camera.pose.position');
 const qd=quaternionDiagnostics(camera?.pose?.orientation);if(!qd.ok)missing.push('camera.pose.orientation.unitQuaternion');
 const frame=text(camera?.pose?.referenceFrame),depthFrame=text(depth?.referenceFrame);
 if(!frame||frame!==depthFrame||frame!==text(bundle?.registration?.referenceFrame))missing.push('registration.referenceFrame');
 const scale=unitScale(depth?.units);if(scale===null)missing.push('depth.units');
 const decoded=decodeDepthSamples(depth);missing.push(...decoded.missing);
 if(missing.length)return{schema:R228_SCHEMA,revision:R228_REVISION,state:'HELD_FOR_NUMERIC_SOURCE_SPATIAL_PROOF',missing:[...new Set(missing)],r227BundleSha256:text(bundle?.bundleSha256),cameraEvidenceSha256,depthEvidenceSha256,sourceDerivedGeometry:false,declaredCalibrationApplied:false,spatialCalibrationProved:false,independentCalibrationValidation:false,numerical3DReconstructionExecuted:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R228_BOUNDARY};
 const inputSamples=decoded.samples;
 for(const s of inputSamples)if(s.u<0||s.u>=width||s.v<0||s.v>=height){missing.push('depth.samplePixelBounds');break}
 if(missing.length)return{schema:R228_SCHEMA,revision:R228_REVISION,state:'HELD_FOR_NUMERIC_SOURCE_SPATIAL_PROOF',missing:[...new Set(missing)],r227BundleSha256:text(bundle?.bundleSha256),cameraEvidenceSha256,depthEvidenceSha256,sourceDerivedGeometry:false,declaredCalibrationApplied:false,spatialCalibrationProved:false,independentCalibrationValidation:false,numerical3DReconstructionExecuted:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R228_BOUNDARY};
 const selected=boundedSample(inputSamples,maxPoints),q=qd.q,position={x:Number(pos.x),y:Number(pos.y),z:Number(pos.z)};
 const points=selected.map((s,i)=>{const z=s.depth*scale,local={x:(s.u-cx)/fx*z,y:(s.v-cy)/fy*z,z},r=rotateVector(local,q);return{i,u:round(s.u,3),v:round(s.v,3),depthM:round(z),x:round(r.x+position.x),y:round(r.y+position.y),z:round(r.z+position.z)}});
 const stats=geometryStats(points);
 const geometryCore={referenceFrame:frame,points};
 const geometrySha256=await sha256(geometryCore);
 const base={schema:R228_SCHEMA,revision:R228_REVISION,state:'SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED',missionId:text(bundle?.missionId),projectId:text(bundle?.projectId),requestSha256:text(bundle?.requestSha256),r227BundleSha256:text(bundle?.bundleSha256),r224ReceiptSha256:text(bundle?.r224ReceiptSha256),r222GeometrySha256:text(bundle?.r222GeometrySha256),r219MeshSha256:text(bundle?.r219MeshSha256),r218FieldSha256:text(bundle?.r218FieldSha256),cameraEvidenceSha256,depthEvidenceSha256,referenceFrame:frame,sourceDepthUnits:text(depth?.units),sourceSampleCount:inputSamples.length,reconstructedPointCount:points.length,downsampled:points.length<inputSamples.length,maxPointsApplied:Math.max(3,Math.min(2048,Math.floor(Number(maxPoints)||2048))),orientationNorm:round(qd.norm,9),orientationNormalizedForComputation:Math.abs(qd.norm-1)>1e-12,declaredCalibrationApplied:true,spatialCalibrationProved:false,independentCalibrationValidation:false,sourceDerivedGeometry:true,numerical3DReconstructionExecuted:true,executionAuthority:'R228_BROWSER_LOCAL_BOUNDED_NUMERICAL',requestedAuthority:'R122_EXISTING_COMPUTED_REALITY',adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',canonicalAdmissionAuthority:'R125',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97_WHEN_PAIRED',geometrySha256,bounds:stats.bounds,centroid:stats.centroid,points,renderedComputedRealityFrame:false,computedPhotorealRealityProved:false,empiricalPixelReconstruction:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,newNativeRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false};
 const receiptSha256=await sha256({...base,points:undefined});
 return{...base,receiptSha256,truthBoundary:R228_BOUNDARY};
}

export function persistSourceSpatialReconstructionR228(receipt){if(receipt?.state!=='SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED'||!hash64(receipt?.geometrySha256)||!hash64(receipt?.receiptSha256)||!Array.isArray(receipt?.points))return false;try{localStorage.setItem(R228_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R228_EVENT,{detail:receipt}));return true}catch{return false}}
export function readSourceSpatialReconstructionR228(){try{const value=JSON.parse(localStorage.getItem(R228_SNAPSHOT_KEY)||'null');return value?.schema===R228_SCHEMA?value:null}catch{return null}}
export function manifestR228(){return{schema:'OMEGA_SOURCE_SPATIAL_RECONSTRUCTION_MANIFEST_R228',revision:R228_REVISION,chain:['R226 source evidence request','R227 exact camera/depth evidence hashes','R228 exact-hash evidence rebind','bounded numeric depth decoding','declared camera intrinsics back-projection','declared pose quaternion transform','source-frame 3-D point geometry SHA-256','candidate for existing R122 computed-reality authority'],authority:{computedReality:'R122 existing authority',adaptivePerformance:'R185',operationContinuity:'R86/R87/R97 when available',canonicalAdmission:'R125',execution:'R228 browser-local bounded numerical only'},truthBoundary:R228_BOUNDARY};}
