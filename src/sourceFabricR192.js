export const SOURCE_FABRIC_REVISION='R192';
export const SOURCE_FABRIC_SCHEMA='OMEGA_SOURCE_FABRIC_R192';
export const SOURCE_FABRIC_LAWS=Object.freeze([
 'ONE_CANONICAL_RUNTIME_AUTHORITY_OMEGAV6',
 'CONNECTED_DRIVE_AND_CHATGPT_LIBRARY_ARE_BUILD_CONTROL_CORPORA_NOT_IMPLICIT_WORKER_FILESYSTEMS',
 'SOURCE_REGISTRATION_IS_NOT_OBSERVATION',
 'PROVIDER_AVAILABILITY_IS_NOT_TARGET_COVERAGE',
 'RETURNED_PUBLIC_DATA_PRESERVES_PROVIDER_TIMESTAMP_AND_PROVENANCE',
 'STABLE_OBSERVATION_HASH_IS_DISTINCT_FROM_TIME_SPECIFIC_QUERY_RECEIPT',
 'DERIVED_SUMMARIES_NEVER_REPLACE_RAW_PROVIDER_AUTHORITY',
 'CLOUD_SURFACE_REACHABILITY_IS_NOT_EXECUTION_PROOF',
 'SOVEREIGN_HOST_EXECUTION_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const CANON='https://omegav6.jeffdeweyeljefe.workers.dev';
const PUBLIC_SOURCES=Object.freeze([
 {id:'USGS_EARTHQUAKE_DAY',label:'USGS Earthquake GeoJSON · all day',plane:'PUBLIC_OBSERVATION',endpoint:'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',adapter:'EARTHQUAKE_GEOJSON_SUMMARY',evidenceClass:'MEASURED_PROVIDER_RETURN',state:'ACTIVE_QUERY'},
 {id:'NASA_EONET_OPEN',label:'NASA EONET v3 · open events',plane:'PUBLIC_OBSERVATION',endpoint:'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100',adapter:'EONET_EVENT_SUMMARY',evidenceClass:'MEASURED_PROVIDER_RETURN',state:'ACTIVE_QUERY'},
 {id:'NOAA_SWPC_KP',label:'NOAA SWPC planetary K-index',plane:'PUBLIC_OBSERVATION',endpoint:'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',adapter:'SWPC_ARRAY_TAIL',evidenceClass:'MEASURED_PROVIDER_RETURN',state:'ACTIVE_QUERY'},
 {id:'NOAA_SWPC_KP_1M',label:'NOAA SWPC one-minute planetary K-index',plane:'PUBLIC_OBSERVATION',endpoint:'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',adapter:'SWPC_OBJECT_TAIL',evidenceClass:'MEASURED_PROVIDER_RETURN',state:'ACTIVE_QUERY'},
 {id:'NOAA_SWPC_ALERTS',label:'NOAA SWPC alerts',plane:'PUBLIC_OBSERVATION',endpoint:'https://services.swpc.noaa.gov/products/alerts.json',adapter:'SWPC_OBJECT_TAIL',evidenceClass:'MEASURED_PROVIDER_RETURN',state:'ACTIVE_QUERY'},
 {id:'NOAA_SWPC_SOLAR_REGIONS',label:'NOAA SWPC solar regions',plane:'PUBLIC_OBSERVATION',endpoint:'https://services.swpc.noaa.gov/json/solar_regions.json',adapter:'SWPC_OBJECT_TAIL',evidenceClass:'MEASURED_PROVIDER_RETURN',state:'ACTIVE_QUERY'},
 {id:'NOAA_SWPC_AURORA',label:'NOAA SWPC OVATION aurora latest',plane:'PUBLIC_OBSERVATION',endpoint:'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',adapter:'AURORA_GRID_SUMMARY',evidenceClass:'MEASURED_PROVIDER_RETURN',state:'ACTIVE_QUERY'},
 {id:'OPEN_METEO_CURRENT',label:'Open-Meteo current weather',plane:'PUBLIC_OBSERVATION',endpoint:'https://api.open-meteo.com/v1/forecast',adapter:'TARGET_WEATHER',evidenceClass:'MEASURED_PROVIDER_RETURN',state:'ACTIVE_QUERY_TARGET_REQUIRED'},
 {id:'CDSE_SENTINEL1_GRD',label:'Copernicus Data Space STAC · Sentinel-1 GRD',plane:'PUBLIC_OBSERVATION',endpoint:'https://stac.dataspace.copernicus.eu/v1/',adapter:'EARTH_SAR_R181',evidenceClass:'OBSERVED_METADATA',state:'ACTIVE_QUERY_VIA_R181'},
 {id:'ASF_SENTINEL1_NISAR',label:'NASA ASF Search · Sentinel-1 / NISAR',plane:'PUBLIC_OBSERVATION',endpoint:'https://api.daac.asf.alaska.edu/services/search/param',adapter:'EARTH_SAR_R181',evidenceClass:'OBSERVED_METADATA',state:'ACTIVE_QUERY_VIA_R181'}
]);

const CLOUD_SURFACES=Object.freeze([
 {id:'OMEGAV6',label:'OMEGAv6 canonical Cloudflare runtime',plane:'CLOUD_RUNTIME',origin:CANON,role:'CANONICAL_RUNTIME_AND_ADMISSION_PATH',authority:'CANONICAL_RUNTIME',state:'REGISTERED_RUNTIME_CURRENT_LIVENESS_REQUIRES_PROBE'},
 {id:'GENESIS',label:'OMEGA Genesis',plane:'CLOUD_SPECIALIST',origin:'https://omega-genesis-v1.jeffdeweyeljefe.workers.dev',role:'PROPOSE_DISCOVERY_ARCHIVE_RECOVERY',authority:'SPECIALIST_RETURN_NOT_CANON',state:'APPROVED_DISTRIBUTED_SURFACE'},
 {id:'LIVING_LIGHT',label:'OMEGA Living Light / Optical human surface',plane:'CLOUD_SPECIALIST',origin:'https://omega-living-light-etching-private-woven2.vercel.app',role:'OPTICAL_VISUAL_SCREEN_SURFACE',authority:'SPECIALIST_SURFACE_NOT_CANON',state:'APPROVED_DISTRIBUTED_SURFACE'},
 {id:'OPTICAL_LEGACY',label:'OMEGA Optical legacy surface',plane:'CLOUD_SPECIALIST',origin:'https://omega-optical-cloud-woven2.vercel.app',role:'OPTICAL_SCREEN_FALLBACK_SURFACE',authority:'SPECIALIST_SURFACE_NOT_CANON',state:'APPROVED_DISTRIBUTED_SURFACE'},
 {id:'SOVEREIGN_RETIRED_PREVIEW',label:'OMEGA Sovereign convergence preview',plane:'CLOUD_REFERENCE',origin:'https://omega-sovereign-convergence.foundasound.chatgpt.site',role:'HISTORICAL_PREVIEW_REFERENCE',authority:'NO_RUNTIME_AUTHORITY',state:'RETIRED_FROM_CANONICAL_HYBRID_BOOTSTRAP'}
]);

const CONNECTED_CORPUS=Object.freeze([
 {id:'DRIVE_MASTER_CORPUS_AUDIT',label:'MASTER_CORPUS_AUDIT_REPORT.md',plane:'DRIVE_REFERENCE_CORPUS',locator:'gdrive:1ek-MDZZIwXFv1SAVp2JePht2uhwgfJAU',role:'188-file corpus audit snapshot',evidenceClass:'DOCUMENT_BACKED',automaticRuntimeRead:false},
 {id:'DRIVE_FOLD_SCALE_HARNESS',label:'Fold_Scale_Relativity_Calibration_Test_Harness_v1.xlsx',plane:'DRIVE_REFERENCE_CORPUS',locator:'gdrive:1z2MF57R1ObBdxFOcbKVVQ40uqUFC8xjO',role:'calibration harness and source-defined threshold reference',evidenceClass:'REFERENCE_PRIOR',automaticRuntimeRead:false},
 {id:'DRIVE_CONTINUITY_ENGINE',label:'universal_continuity_engine_v2_executable.xlsx',plane:'DRIVE_REFERENCE_CORPUS',locator:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',role:'continuity/overlap/scar reference',evidenceClass:'REFERENCE_PRIOR',automaticRuntimeRead:false},
 {id:'LIBRARY_20736_RELATIVITY',label:'Dewey_20736D_Relativity_Calculus_Tree_FULL.csv',plane:'CHATGPT_LIBRARY_CORPUS',locator:'library:file_000000007eec81fdb56ce0d408ca3a24',role:'40MB 20,736-state relativity/calculus artifact',evidenceClass:'STRUCTURED_REFERENCE',automaticRuntimeRead:false},
 {id:'LIBRARY_20736_EDGES',label:'Dewey_20736D_Relativity_Calculus_Tree_EDGES.csv',plane:'CHATGPT_LIBRARY_CORPUS',locator:'library:file_00000000b4b881fdbd9cde9a0845b73d',role:'27MB state-edge artifact',evidenceClass:'STRUCTURED_REFERENCE',automaticRuntimeRead:false},
 {id:'LIBRARY_PSC_20736',label:'PSC_20736D_all_domains_parent_accumulation_autoping.csv',plane:'CHATGPT_LIBRARY_CORPUS',locator:'library:file_00000000021481f88647e52a82292736',role:'144MB all-domain parent/autoping corpus artifact',evidenceClass:'STRUCTURED_REFERENCE',automaticRuntimeRead:false},
 {id:'LIBRARY_FULL_BUILD_ATLAS',label:'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx',plane:'CHATGPT_LIBRARY_CORPUS',locator:'library:file_000000005250720cb2c0ffa8c805681f',role:'software/render/test/packaging control atlas',evidenceClass:'DOCUMENT_BACKED_STRUCTURE',automaticRuntimeRead:false},
 {id:'LIBRARY_PHASE6_PROOF_GATE',label:'PHASE6_INTEGRATION_PROOF_GATE_PLAN.md',plane:'CHATGPT_LIBRARY_CORPUS',locator:'library:file_00000000383c71f5a0b05953c8c91d42',role:'external benchmark gate specification',evidenceClass:'DOCUMENT_BACKED',automaticRuntimeRead:false}
]);

const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return o}return v};
async function sha(value){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(value))));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const json=(v,s=200)=>new Response(JSON.stringify(v,null,2),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-source-fabric':SOURCE_FABRIC_REVISION}});
const finite=(v,a,b,f)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):f));
async function fetchJson(url){const started=Date.now();try{const r=await fetch(url,{headers:{accept:'application/json, application/geo+json','user-agent':'OMEGAv6-R192/1.0'},cache:'no-store',signal:AbortSignal.timeout(10000),cf:{cacheTtl:0,cacheEverything:false}}),raw=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status}`);return{ok:true,data:JSON.parse(raw),httpStatus:r.status,latencyMs:Date.now()-started,source:String(url)}}catch(error){return{ok:false,data:null,httpStatus:0,latencyMs:Date.now()-started,source:String(url),error:error instanceof Error?error.message:String(error)}}}
function normalize(source,data){
 if(source.adapter==='EARTHQUAKE_GEOJSON_SUMMARY'){const rows=(Array.isArray(data?.features)?data.features:[]).slice(0,25).map(x=>({id:x?.id||null,time:x?.properties?.time?new Date(x.properties.time).toISOString():null,magnitude:Number.isFinite(Number(x?.properties?.mag))?Number(x.properties.mag):null,place:x?.properties?.place||null,coordinates:Array.isArray(x?.geometry?.coordinates)?x.geometry.coordinates.slice(0,3):null}));return{count:Number(data?.metadata?.count??data?.features?.length??0),events:rows}}
 if(source.adapter==='EONET_EVENT_SUMMARY'){const events=(Array.isArray(data?.events)?data.events:[]).slice(0,25).map(x=>({id:x.id,title:x.title,categories:(x.categories||[]).map(c=>c.title),geometry:(x.geometry||[]).slice(-3)}));return{count:Number(data?.events?.length||0),events}}
 if(source.adapter==='SWPC_ARRAY_TAIL')return{rows:Array.isArray(data)?data.slice(-48):[]};
 if(source.adapter==='SWPC_OBJECT_TAIL')return{rows:Array.isArray(data)?data.slice(-48):data&&typeof data==='object'?[data]:[]};
 if(source.adapter==='AURORA_GRID_SUMMARY'){const coords=Array.isArray(data?.coordinates)?data.coordinates:[],probs=coords.map(x=>Number(x?.[2])).filter(Number.isFinite);return{observationTime:data?.['Observation Time']||data?.observation_time||null,forecastTime:data?.['Forecast Time']||data?.forecast_time||null,points:coords.length,maxProbability:probs.length?Math.max(...probs):null,meanProbability:probs.length?probs.reduce((a,b)=>a+b,0)/probs.length:null}}
 if(source.adapter==='TARGET_WEATHER')return{current:data?.current||null,currentUnits:data?.current_units||null,latitude:data?.latitude??null,longitude:data?.longitude??null};
 return data;
}
function queryUrl(source,url){if(source.id!=='OPEN_METEO_CURRENT')return source.endpoint;const lat=finite(url.searchParams.get('lat'),-90,90,32.2226),lon=finite(url.searchParams.get('lon'),-180,180,-110.9747),u=new URL(source.endpoint);u.searchParams.set('latitude',String(lat));u.searchParams.set('longitude',String(lon));u.searchParams.set('current','temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover');u.searchParams.set('timezone','UTC');return u.toString()}
export function sourceFabricManifestR192(){const sources=[...CLOUD_SURFACES,...CONNECTED_CORPUS,...PUBLIC_SOURCES];const planeCounts=Object.fromEntries([...new Set(sources.map(x=>x.plane))].sort().map(p=>[p,sources.filter(x=>x.plane===p).length]));return{ok:true,schema:SOURCE_FABRIC_SCHEMA,revision:SOURCE_FABRIC_REVISION,laws:SOURCE_FABRIC_LAWS,canonicalRuntime:CANON,sources,planeCounts,publicQueryPath:'/api/public-data/r192/query?source=SOURCE_ID',publicManifestPath:'/api/public-data/r192/manifest',benchmarkHarness:'OMEGA_EMPIRICAL_BENCHMARK_R192',runtimeCorpusBoundary:'Drive and ChatGPT Library entries are provenance-bearing build/control-plane references captured from connected corpus review. The deployed Worker has no implicit permission to browse those private corpora. Runtime ingestion requires an explicit authenticated connector/evidence packet.',canonicalMutation:false,canonicalAdmissionAuthority:'R125'} }
export async function sourceFabricApiR192(request,url=new URL(request.url)){
 if(request.method==='GET'&&(url.pathname==='/api/system/source-fabric/r192'||url.pathname==='/api/public-data/r192/manifest'))return json(sourceFabricManifestR192());
 if(request.method==='GET'&&url.pathname==='/api/public-data/r192/query'){
  const id=String(url.searchParams.get('source')||'').toUpperCase(),source=PUBLIC_SOURCES.find(x=>x.id===id);if(!source)return json({ok:false,code:'R192_PUBLIC_SOURCE_NOT_FOUND',available:PUBLIC_SOURCES.map(x=>x.id),canonicalMutation:false},404);
  if(source.adapter==='EARTH_SAR_R181')return json({ok:false,code:'R192_USE_SPECIALIZED_SAR_ADAPTER',source,route:'/api/earth/sar/search',canonicalMutation:false,truthBoundary:'SAR target search remains in R181 so footprint/mission semantics and no-fabricated-pixel boundaries stay intact.'},409);
  const target=queryUrl(source,url),result=await fetchJson(target);if(!result.ok)return json({ok:false,schema:'OMEGA_PUBLIC_OBSERVATION_R192',revision:SOURCE_FABRIC_REVISION,source,state:'UNAVAILABLE',verifiedAt:new Date().toISOString(),provider:{url:target,httpStatus:result.httpStatus,latencyMs:result.latencyMs,error:result.error},observation:null,canonicalMutation:false,truthBoundary:'Provider failure remains unavailable; OMEGA does not synthesize replacement observations.'},502);
  const observation=normalize(source,result.data),observationHash=await sha({sourceId:source.id,observation}),core={ok:true,schema:'OMEGA_PUBLIC_OBSERVATION_R192',revision:SOURCE_FABRIC_REVISION,source,state:'OBSERVED_RETURNED',verifiedAt:new Date().toISOString(),provider:{url:target,httpStatus:result.httpStatus,latencyMs:result.latencyMs},observation,observationHash,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'Returned provider data is observational evidence only for the fields actually returned. OMEGA normalization is a bounded summary, not a new sensor or physical inference. Stable observation hash is separated from query time.'},receiptHash=await sha(core);return json({...core,receiptHash});
 }
 return null;
}
export const R192_PUBLIC_SOURCES=PUBLIC_SOURCES;
export const R192_CONNECTED_CORPUS=CONNECTED_CORPUS;
export const R192_CLOUD_SURFACES=CLOUD_SURFACES;
