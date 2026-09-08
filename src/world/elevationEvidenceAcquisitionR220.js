export const R220_REVISION='R220';
export const R220_SCHEMA='OMEGA_ELEVATION_EVIDENCE_ACQUISITION_R220';
export const R220_SOURCE_SCHEMA='OMEGA_SOURCE_ELEVATION_EVIDENCE_V1';
export const R220_BOUNDARY='R220 acquires only returned numeric USGS EPQS point elevations for the exact R218 WGS84 sample coordinates and packages them for R219. It does not interpolate missing samples, infer vertical datum or per-sample uncertainty when the service does not return them, claim surveyed-grade accuracy, infer depth/material/radiometry, execute a solver/native renderer, prove federation closure, mutate CanonState, or prove computed photoreal reality.';

const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const text=v=>String(v??'').trim();
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const clampInt=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(Number(v)||a)));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function extractElevation(raw){
 const candidates=[raw?.value,raw?.elevation,raw?.USGS_Elevation_Point_Query_Service?.Elevation_Query?.Elevation];
 for(const candidate of candidates)if(finite(candidate))return Number(candidate);
 return null;
}

function sourceIdFrom(raw,fallback){
 const id=raw?.rasterId??raw?.RasterId??raw?.dataSource??raw?.source??raw?.USGS_Elevation_Point_Query_Service?.Elevation_Query?.Data_Source;
 return text(id)||fallback;
}

function fieldReady(field){
 return Boolean(field?.state==='GEOSPATIAL_SCENE_FIELD_COMPUTED'&&field?.fieldComputed===true&&field?.crs==='WGS84 / EPSG:4326'&&hash64(field?.fieldSha256)&&hash64(field?.receiptSha256)&&Array.isArray(field?.samples)&&field.samples.length===Number(field?.sampleCount)&&field.samples.length>0&&field.samples.length<=81);
}

function epqsUrl(sample){
 const params=new URLSearchParams({x:String(Number(sample.lon)),y:String(Number(sample.lat)),wkid:'4326',units:'Meters',includeDate:'false'});
 return `https://epqs.nationalmap.gov/v1/json?${params}`;
}

async function fetchPoint(fetcher,sample,{retries,retryDelayMs}){
 const sourceUrl=epqsUrl(sample);
 let lastError='SOURCE_FETCH_FAILED';
 for(let attempt=0;attempt<=retries;attempt++){
  try{
   const response=await fetcher(sourceUrl,{headers:{accept:'application/json'}});
   if(!response?.ok){lastError=`HTTP_${Number(response?.status)||0}`;}
   else{
    const raw=await response.json();
    const elevationM=extractElevation(raw);
    if(elevationM!==null)return{ok:true,i:Number(sample.i),lat:Number(sample.lat),lon:Number(sample.lon),elevationM,sourceId:sourceIdFrom(raw,sourceUrl),uncertaintyM:null,sourceUrl};
    lastError='NON_NUMERIC_ELEVATION';
   }
  }catch(error){lastError=error instanceof Error?error.message:String(error)}
  if(attempt<retries&&retryDelayMs>0)await sleep(retryDelayMs);
 }
 return{ok:false,i:Number(sample.i),lat:Number(sample.lat),lon:Number(sample.lon),sourceUrl,error:lastError};
}

export async function acquireElevationEvidenceR220({field,fetcher=globalThis.fetch,concurrency=4,retries=1,retryDelayMs=120}={}){
 if(!fieldReady(field)||typeof fetcher!=='function')return{schema:R220_SCHEMA,revision:R220_REVISION,state:'HELD_FOR_R218_FIELD',acquisitionComplete:false,elevationEvidenceAccepted:false,reason:'R218_FIELD_OR_FETCHER_NOT_READY',computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R220_BOUNDARY};
 const limit=clampInt(concurrency,1,8),retryCount=clampInt(retries,0,2),delay=Math.max(0,Math.min(1000,Number(retryDelayMs)||0));
 const samples=new Array(field.samples.length),failures=[];
 let cursor=0;
 const workers=Array.from({length:Math.min(limit,field.samples.length)},async()=>{
  while(true){
   const index=cursor++;if(index>=field.samples.length)return;
   const result=await fetchPoint(fetcher,field.samples[index],{retries:retryCount,retryDelayMs:delay});
   if(result.ok)samples[index]={i:result.i,lat:result.lat,lon:result.lon,elevationM:result.elevationM,sourceId:result.sourceId,uncertaintyM:null};
   else failures.push({i:result.i,lat:result.lat,lon:result.lon,sourceUrl:result.sourceUrl,error:result.error});
  }
 });
 await Promise.all(workers);
 if(failures.length)return{schema:R220_SCHEMA,revision:R220_REVISION,state:'HELD_FOR_COMPLETE_SOURCE_EVIDENCE',acquisitionComplete:false,elevationEvidenceAccepted:false,requestedSampleCount:field.samples.length,returnedSampleCount:field.samples.length-failures.length,failures:failures.sort((a,b)=>a.i-b.i),sourceFamily:'USGS_3DEP',sourceUrl:'https://epqs.nationalmap.gov/v1/json',crs:'WGS84 / EPSG:4326',verticalDatum:'UNSPECIFIED_BY_EPQS_RESPONSE',computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R220_BOUNDARY};
 return{schema:R220_SOURCE_SCHEMA,acquisitionSchema:R220_SCHEMA,revision:R220_REVISION,state:'RETURNED_COMPLETE_USGS_ELEVATION_EVIDENCE',acquisitionComplete:true,elevationEvidenceAccepted:true,sourceFamily:'USGS_3DEP',sourceUrl:'https://epqs.nationalmap.gov/v1/json',retrievedAt:new Date().toISOString(),crs:'WGS84 / EPSG:4326',verticalDatum:'UNSPECIFIED_BY_EPQS_RESPONSE',serviceAccuracyNote:'USGS describes EPQS elevations as interpolated 3DEP-derived values; source/location accuracy varies and the service-wide RMSE is not promoted to per-sample uncertainty.',requestedSampleCount:field.samples.length,returnedSampleCount:samples.length,r218FieldSha256:String(field.fieldSha256),r218ReceiptSha256:String(field.receiptSha256),samples,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R220_BOUNDARY};
}

export function manifestR220(){return{schema:'OMEGA_ELEVATION_EVIDENCE_ACQUISITION_MANIFEST_R220',revision:R220_REVISION,chain:['R218 exact WGS84 lattice','bounded USGS EPQS point acquisition','complete-sample fail-close gate','R219-compatible source evidence envelope'],limits:{maxSamples:81,maxConcurrency:8,maxRetries:2},authority:{earthEvidence:'R9/R121 existing Earth source chain',elevationMesh:'R219',computedReality:'R122 existing authority',adaptivePerformance:'R185',canonicalAdmission:'R125'},truthBoundary:R220_BOUNDARY};}
