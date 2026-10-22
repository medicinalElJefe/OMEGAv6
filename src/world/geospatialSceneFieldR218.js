export const R218_REVISION='R218';
export const R218_SCHEMA='OMEGA_GEOSPATIAL_SCENE_FIELD_R218';
export const R218_SNAPSHOT_KEY='omega.r218.geospatialSceneField';
export const R218_EVENT='omega-r218-geospatial-scene-field';
export const R218_BOUNDARY='R218 computes only a bounded WGS84 local tangent-plane coordinate field around the source-backed R202.3 target and binds it to the exact R217 frame receipt and inherited mission/world lineage. It does not infer elevation, depth, surface geometry, materials, radiometry, empirical pixels, camera calibration, native execution, federation closure, solver validity, or computed photoreal reality.';

const stable=(v)=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v};
const bytes=(v)=>new TextEncoder().encode(v);
const hex=(buffer)=>[...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async(v)=>hex(await crypto.subtle.digest('SHA-256',bytes(JSON.stringify(stable(v)))));
const hash64=(v)=>/^[a-f0-9]{64}$/.test(String(v||''));
const finite=(v)=>Number.isFinite(Number(v));
const text=(v)=>String(v||'');
const R_EARTH_M=6378137;

function fieldPlan(profile){
 if(profile==='FULL_FIELD')return{profile:'FULL_FIELD',side:9,spacingM:2};
 if(profile==='BALANCED')return{profile:'BALANCED',side:7,spacingM:4};
 return{profile:'CONSERVATIVE',side:5,spacingM:8};
}

function localWgs84Field(latDeg,lonDeg,plan){
 const lat0=Number(latDeg),lon0=Number(lonDeg),latRad=lat0*Math.PI/180,cosLat=Math.max(.01,Math.abs(Math.cos(latRad))),half=(plan.side-1)/2;
 const samples=[];
 for(let y=0;y<plan.side;y++)for(let x=0;x<plan.side;x++){
  const eastM=(x-half)*plan.spacingM,northM=(half-y)*plan.spacingM;
  const lat=lat0+(northM/R_EARTH_M)*(180/Math.PI);
  const lon=lon0+(eastM/(R_EARTH_M*cosLat))*(180/Math.PI);
  samples.push({i:y*plan.side+x,x,y,eastM,northM,lat:Number(lat.toFixed(9)),lon:Number(lon.toFixed(9)),elevationM:null,depthM:null,radiometry:null,material:null});
 }
 return samples;
}

export async function computeGeospatialSceneFieldR218({frame,scene}={}){
 const lat=scene?.target?.lat,lon=scene?.target?.lon;
 const ready=Boolean(frame?.state==='EVIDENCE_RECONSTRUCTION_FRAME_RENDERED'&&hash64(frame?.frameSha256)&&hash64(frame?.receiptSha256)&&frame?.evidenceBoundRepresentationalFrame===true&&frame?.computedPhotorealRealityProved===false&&scene?.eventAccepted===true&&scene?.renderInputReady===true&&scene?.target?.crs==='WGS84 / EPSG:4326'&&finite(lat)&&finite(lon)&&Number(lat)>=-90&&Number(lat)<=90&&Number(lon)>=-180&&Number(lon)<=180&&text(scene?.earthHash)===text(frame?.earthHash)&&text(scene?.groundHash)===text(frame?.groundHash));
 if(!ready)return{schema:R218_SCHEMA,revision:R218_REVISION,state:'HELD_FOR_PROOF',fieldComputed:false,spatialCalibrationProved:false,depthReconstruction:false,materialReconstruction:false,radiometricReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R218_BOUNDARY};
 const plan=fieldPlan(frame.profile),samples=localWgs84Field(lat,lon,plan);
 const fieldPayload={crs:'WGS84 / EPSG:4326',target:{lat:Number(lat),lon:Number(lon)},profile:plan.profile,side:plan.side,spacingM:plan.spacingM,samples};
 const fieldSha256=await sha256(fieldPayload);
 const payload={schema:R218_SCHEMA,revision:R218_REVISION,state:'GEOSPATIAL_SCENE_FIELD_COMPUTED',missionId:text(frame.missionId),projectId:text(frame.projectId),r217ReceiptSha256:text(frame.receiptSha256),r217FrameSha256:text(frame.frameSha256),r216RequestSha256:text(frame.r216RequestSha256),r214AnchorSha256:text(frame.r214AnchorSha256),r213AttemptSha256:text(frame.r213AttemptSha256),r211LineageSha256:text(frame.r211LineageSha256),r208WorldBindingOperationSha256:text(frame.r208WorldBindingOperationSha256),previousWorldHeadSha256:text(frame.previousWorldHeadSha256),earthHash:text(frame.earthHash),groundHash:text(frame.groundHash),evidenceDigest:text(frame.evidenceDigest),computedRealityAuthority:'R122_EXISTING_COMPUTED_REALITY',adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',executionAuthority:'R218_BROWSER_LOCAL_BOUNDED_NUMERICAL_FIELD',crs:fieldPayload.crs,target:fieldPayload.target,profile:plan.profile,side:plan.side,spacingM:plan.spacingM,sampleCount:samples.length,fieldSha256,fieldComputed:true,spatialCoordinateField:true,spatialCalibrationProved:false,elevationReconstruction:false,depthReconstruction:false,materialReconstruction:false,radiometricReconstruction:false,empiricalPixelReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,newNativeRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false};
 const receiptSha256=await sha256(payload);
 return{...payload,receiptSha256,samples,truthBoundary:R218_BOUNDARY};
}

export function persistGeospatialSceneFieldR218(receipt){if(receipt?.state!=='GEOSPATIAL_SCENE_FIELD_COMPUTED'||!hash64(receipt?.fieldSha256)||!hash64(receipt?.receiptSha256))return false;try{localStorage.setItem(R218_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R218_EVENT,{detail:receipt}));return true}catch{return false}}
export function readGeospatialSceneFieldR218(){try{const value=JSON.parse(localStorage.getItem(R218_SNAPSHOT_KEY)||'null');return value?.schema===R218_SCHEMA?value:null}catch{return null}}
export function manifestR218(){return{schema:'OMEGA_GEOSPATIAL_SCENE_FIELD_MANIFEST_R218',revision:R218_REVISION,chain:['R217 exact-byte evidence-bound representational frame','R202.3 source-backed WGS84 target','R218 bounded local tangent-plane coordinate lattice','field SHA-256 + receipt returned to inherited mission/world lineage'],authority:{computedReality:'R122 existing authority',adaptivePerformance:'R185',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97 when paired',canonicalAdmission:'R125'},truthBoundary:R218_BOUNDARY};}
