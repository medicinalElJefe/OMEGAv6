export const R219_REVISION='R219';
export const R219_SCHEMA='OMEGA_ELEVATION_SCENE_MESH_R219';
export const R219_SNAPSHOT_KEY='omega.r219.elevationSceneMesh';
export const R219_EVENT='omega-r219-elevation-scene-mesh';
export const R219_BOUNDARY='R219 binds externally returned, source-attributed elevation samples to the exact R218 WGS84 field and inherited mission/world lineage. It does not synthesize missing elevations, infer depth, surface/material/radiometric state, claim surveyed-grade vertical accuracy, execute native/GPU rendering, prove federation closure, prove solver validity, or prove computed photoreal reality.';

const stable=(v)=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v};
const bytes=(v)=>new TextEncoder().encode(v);
const hex=(buffer)=>[...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async(v)=>hex(await crypto.subtle.digest('SHA-256',bytes(JSON.stringify(stable(v)))));
const hash64=(v)=>/^[a-f0-9]{64}$/.test(String(v||''));
const finite=(v)=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const text=(v)=>String(v||'');
const close=(a,b,tol=1e-7)=>finite(a)&&finite(b)&&Math.abs(Number(a)-Number(b))<=tol;

function sourceAcceptable(evidence){
 return Boolean(evidence&&evidence.schema==='OMEGA_SOURCE_ELEVATION_EVIDENCE_V1'&&evidence.sourceFamily==='USGS_3DEP'&&evidence.crs==='WGS84 / EPSG:4326'&&typeof evidence.sourceUrl==='string'&&/^https:\/\//.test(evidence.sourceUrl)&&typeof evidence.retrievedAt==='string'&&Array.isArray(evidence.samples));
}

export async function computeElevationSceneMeshR219({field,evidence}={}){
 const baseReady=Boolean(field?.state==='GEOSPATIAL_SCENE_FIELD_COMPUTED'&&field?.fieldComputed===true&&field?.crs==='WGS84 / EPSG:4326'&&hash64(field?.fieldSha256)&&hash64(field?.receiptSha256)&&Array.isArray(field?.samples)&&field.samples.length===Number(field?.sampleCount));
 if(!baseReady||!sourceAcceptable(evidence))return{schema:R219_SCHEMA,revision:R219_REVISION,state:'HELD_FOR_SOURCE_EVIDENCE',meshComputed:false,elevationEvidenceAccepted:false,depthReconstruction:false,materialReconstruction:false,radiometricReconstruction:false,empiricalPixelReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R219_BOUNDARY};
 if(evidence.samples.length!==field.samples.length)return{schema:R219_SCHEMA,revision:R219_REVISION,state:'HELD_FOR_SOURCE_EVIDENCE',meshComputed:false,elevationEvidenceAccepted:false,reason:'SAMPLE_COUNT_MISMATCH',computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R219_BOUNDARY};
 const joined=[];
 for(let i=0;i<field.samples.length;i++){
  const base=field.samples[i],obs=evidence.samples[i];
  if(Number(obs?.i)!==Number(base?.i)||!close(obs?.lat,base?.lat)||!close(obs?.lon,base?.lon)||!finite(obs?.elevationM))return{schema:R219_SCHEMA,revision:R219_REVISION,state:'HELD_FOR_SOURCE_EVIDENCE',meshComputed:false,elevationEvidenceAccepted:false,reason:'SAMPLE_ID_OR_COORDINATE_MISMATCH',computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R219_BOUNDARY};
  joined.push({...base,elevationM:Number(obs.elevationM),elevationSourceId:text(obs.sourceId||`${evidence.sourceFamily}:${i}`),elevationUncertaintyM:finite(obs.uncertaintyM)?Number(obs.uncertaintyM):null,depthM:null,radiometry:null,material:null});
 }
 const elevationEvidencePayload={schema:evidence.schema,sourceFamily:evidence.sourceFamily,sourceUrl:evidence.sourceUrl,retrievedAt:evidence.retrievedAt,crs:evidence.crs,verticalDatum:text(evidence.verticalDatum||'UNSPECIFIED'),samples:evidence.samples.map(x=>({i:Number(x.i),lat:Number(x.lat),lon:Number(x.lon),elevationM:Number(x.elevationM),sourceId:text(x.sourceId||''),uncertaintyM:finite(x.uncertaintyM)?Number(x.uncertaintyM):null}))};
 const elevationEvidenceSha256=await sha256(elevationEvidencePayload);
 const meshPayload={crs:field.crs,verticalDatum:elevationEvidencePayload.verticalDatum,profile:field.profile,side:field.side,spacingM:field.spacingM,samples:joined};
 const meshSha256=await sha256(meshPayload);
 const elevations=joined.map(x=>x.elevationM),minElevationM=Math.min(...elevations),maxElevationM=Math.max(...elevations),reliefM=maxElevationM-minElevationM;
 const payload={schema:R219_SCHEMA,revision:R219_REVISION,state:'SOURCE_BACKED_ELEVATION_MESH_COMPUTED',missionId:text(field.missionId),projectId:text(field.projectId),r218ReceiptSha256:text(field.receiptSha256),r218FieldSha256:text(field.fieldSha256),r217ReceiptSha256:text(field.r217ReceiptSha256),r216RequestSha256:text(field.r216RequestSha256),r214AnchorSha256:text(field.r214AnchorSha256),r213AttemptSha256:text(field.r213AttemptSha256),r211LineageSha256:text(field.r211LineageSha256),r208WorldBindingOperationSha256:text(field.r208WorldBindingOperationSha256),previousWorldHeadSha256:text(field.previousWorldHeadSha256),earthHash:text(field.earthHash),groundHash:text(field.groundHash),evidenceDigest:text(field.evidenceDigest),computedRealityAuthority:'R122_EXISTING_COMPUTED_REALITY',adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',executionAuthority:'R219_BROWSER_LOCAL_EVIDENCE_BINDING',elevationSourceFamily:evidence.sourceFamily,elevationSourceUrl:evidence.sourceUrl,elevationRetrievedAt:evidence.retrievedAt,verticalDatum:elevationEvidencePayload.verticalDatum,elevationEvidenceSha256,meshSha256,sampleCount:joined.length,minElevationM,maxElevationM,reliefM:Number(reliefM.toFixed(6)),meshComputed:true,elevationEvidenceAccepted:true,sourceBackedVerticalField:true,spatialCalibrationProved:false,depthReconstruction:false,materialReconstruction:false,radiometricReconstruction:false,empiricalPixelReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,newNativeRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false};
 const receiptSha256=await sha256(payload);
 return{...payload,receiptSha256,samples:joined,truthBoundary:R219_BOUNDARY};
}

export function persistElevationSceneMeshR219(receipt){if(receipt?.state!=='SOURCE_BACKED_ELEVATION_MESH_COMPUTED'||!hash64(receipt?.meshSha256)||!hash64(receipt?.receiptSha256))return false;try{localStorage.setItem(R219_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R219_EVENT,{detail:receipt}));return true}catch{return false}}
export function readElevationSceneMeshR219(){try{const value=JSON.parse(localStorage.getItem(R219_SNAPSHOT_KEY)||'null');return value?.schema===R219_SCHEMA?value:null}catch{return null}}
export function manifestR219(){return{schema:'OMEGA_ELEVATION_SCENE_MESH_MANIFEST_R219',revision:R219_REVISION,chain:['R218 bounded WGS84 field','source-attributed elevation evidence','coordinate-exact sample binding','elevation evidence SHA-256 + mesh SHA-256 + receipt returned to inherited mission/world lineage'],authority:{computedReality:'R122 existing authority',adaptivePerformance:'R185',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97 when paired',canonicalAdmission:'R125'},truthBoundary:R219_BOUNDARY};}
