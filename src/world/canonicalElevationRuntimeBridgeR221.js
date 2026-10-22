import {acquireElevationEvidenceR220} from './elevationEvidenceAcquisitionR220.js';
import {computeElevationSceneMeshR219,persistElevationSceneMeshR219} from './elevationSceneMeshR219.js';

export const R221_REVISION='R221';
export const R221_SCHEMA='OMEGA_CANONICAL_ELEVATION_RUNTIME_BRIDGE_R221';
export const R221_BOUNDARY='R221 routes each exact R218 WGS84 sample through the existing canonical OMEGAv6 /api/earth/ground/evidence authority, accepts only explicitly RETURNED_USGS_ELEVATION values, then reuses R220 complete-source fail-close acquisition and R219 source-backed elevation-mesh binding. It does not call USGS directly from the browser, interpolate missing elevation, infer datum/uncertainty/depth/material/radiometry, prove solver validity, claim PC online or federation closure, mutate CanonState, or prove computed photoreal reality.';

const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const text=v=>String(v??'').trim();

function canonicalBase(origin){
 const fallback='https://omegav6.jeffdeweyeljefe.workers.dev';
 try{const u=new URL(text(origin)||fallback);return `${u.protocol}//${u.host}`}catch{return fallback}
}

function readEpqsPoint(url){
 try{const u=new URL(url),lon=Number(u.searchParams.get('x')),lat=Number(u.searchParams.get('y'));return finite(lat)&&finite(lon)?{lat,lon}:null}catch{return null}
}

function groundFetcherR221(fetcher,origin){
 const base=canonicalBase(origin);
 return async epqsUrl=>{
  const point=readEpqsPoint(epqsUrl);
  if(!point)return new Response(JSON.stringify({code:'R221_INVALID_R220_POINT'}),{status:400,headers:{'content-type':'application/json'}});
  const url=new URL('/api/earth/ground/evidence',base);
  url.searchParams.set('lat',String(point.lat));url.searchParams.set('lon',String(point.lon));url.searchParams.set('radius','250');
  let response;
  try{response=await fetcher(url.toString(),{headers:{accept:'application/json','cache-control':'no-cache'}})}catch{return new Response(JSON.stringify({code:'R221_CANONICAL_GROUND_FETCH_FAILED'}),{status:502,headers:{'content-type':'application/json'}})}
  if(!response?.ok)return response;
  const body=await response.clone().json().catch(()=>null),ground=body?.levels?.GROUND;
  if(ground?.state!=='RETURNED_USGS_ELEVATION'||!finite(ground?.elevationM))return new Response(JSON.stringify({code:'R221_USGS_ELEVATION_NOT_RETURNED'}),{status:422,headers:{'content-type':'application/json'}});
  return new Response(JSON.stringify({elevation:Number(ground.elevationM),source:ground.source||ground.sourceUrl||'USGS_3DEP_VIA_OMEGAV6_GROUND_EVIDENCE'}),{status:200,headers:{'content-type':'application/json'}});
 };
}

export async function acquireCanonicalElevationMeshR221({field,fetcher=globalThis.fetch,origin,concurrency=4,retries=1,retryDelayMs=120,persist=false}={}){
 if(typeof fetcher!=='function')return{schema:R221_SCHEMA,revision:R221_REVISION,state:'HELD_FOR_CANONICAL_RUNTIME_FETCH',meshComputed:false,elevationEvidenceAccepted:false,canonicalWorkerMediated:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R221_BOUNDARY};
 const evidence=await acquireElevationEvidenceR220({field,fetcher:groundFetcherR221(fetcher,origin),concurrency,retries,retryDelayMs});
 if(evidence?.state!=='RETURNED_COMPLETE_USGS_ELEVATION_EVIDENCE')return{schema:R221_SCHEMA,revision:R221_REVISION,state:'HELD_FOR_COMPLETE_CANONICAL_ELEVATION_EVIDENCE',meshComputed:false,elevationEvidenceAccepted:false,canonicalWorkerMediated:true,evidence,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R221_BOUNDARY};
 const mesh=await computeElevationSceneMeshR219({field,evidence});
 if(mesh?.state!=='SOURCE_BACKED_ELEVATION_MESH_COMPUTED')return{schema:R221_SCHEMA,revision:R221_REVISION,state:'HELD_FOR_R219_ELEVATION_MESH',meshComputed:false,elevationEvidenceAccepted:true,canonicalWorkerMediated:true,evidence,mesh,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R221_BOUNDARY};
 const persisted=Boolean(persist&&persistElevationSceneMeshR219(mesh));
 return{schema:R221_SCHEMA,revision:R221_REVISION,state:'CANONICAL_ELEVATION_MESH_READY',canonicalWorkerMediated:true,groundEvidenceAuthority:'R9/R121_EXISTING_CANONICAL_WORKER',acquisitionAuthority:'R220',elevationMeshAuthority:'R219',computedRealityAuthority:'R122',adaptivePerformanceAuthority:'R185',canonicalAdmissionAuthority:'R125',missionId:mesh.missionId,projectId:mesh.projectId,r218FieldSha256:mesh.r218FieldSha256,elevationEvidenceSha256:mesh.elevationEvidenceSha256,meshSha256:mesh.meshSha256,receiptSha256:mesh.receiptSha256,sampleCount:mesh.sampleCount,minElevationM:mesh.minElevationM,maxElevationM:mesh.maxElevationM,reliefM:mesh.reliefM,persisted,meshComputed:true,elevationEvidenceAccepted:true,sourceBackedVerticalField:true,depthReconstruction:false,materialReconstruction:false,radiometricReconstruction:false,empiricalPixelReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,evidence,mesh,truthBoundary:R221_BOUNDARY};
}

export function manifestR221(){return{schema:'OMEGA_CANONICAL_ELEVATION_RUNTIME_BRIDGE_MANIFEST_R221',revision:R221_REVISION,chain:['R218 exact WGS84 lattice','same-origin/canonical OMEGAv6 ground-evidence routing','R220 bounded complete-source acquisition','R219 source-backed elevation mesh','optional existing R219 browser continuity persistence'],authority:{groundEvidence:'R9/R121 existing canonical Worker',acquisition:'R220',elevationMesh:'R219',computedReality:'R122',adaptivePerformance:'R185',canonicalAdmission:'R125'},truthBoundary:R221_BOUNDARY};}
