import {acquireCanonicalElevationMeshR221} from './canonicalElevationRuntimeBridgeR221.js';
import {projectSourceBackedTerrainR222} from './sourceBackedTerrainProjectionR222.js';

export const R224_REVISION='R224';
export const R224_SCHEMA='OMEGA_LIVING_TERRAIN_EXPERIENCE_R224';
export const R224_SNAPSHOT_KEY='omega.r224.livingTerrainExperience';
export const R224_EVENT='omega-r224-living-terrain-experience';
export const R224_BOUNDARY='R224 makes the proven R218→R221→R219→R222 source-backed terrain chain operator-invokable and visually consumable inside the existing Living World. It acquires only complete canonical Worker-mediated USGS elevation evidence, projects only the proven terrain mesh, preserves mission/world/proof lineage, and does not infer depth, materials, radiometry, textures, camera calibration, empirical pixels, solver validity, native execution, federation closure, PC online state, Canon mutation, or computed photoreal reality.';

const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const bytes=v=>new TextEncoder().encode(JSON.stringify(stable(v)));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async v=>hex(await crypto.subtle.digest('SHA-256',bytes(v)));
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const held=(reason,extra={})=>({schema:R224_SCHEMA,revision:R224_REVISION,state:'HELD_FOR_SOURCE_BACKED_TERRAIN_EXPERIENCE',experienceReady:false,reason,...extra,visualProjectionOnly:true,depthReconstruction:false,materialReconstruction:false,radiometricReconstruction:false,empiricalPixelReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R224_BOUNDARY});

function plan(profile){if(profile==='FULL_FIELD')return{concurrency:6,verticalGain:1.15};if(profile==='BALANCED')return{concurrency:4,verticalGain:1};return{concurrency:2,verticalGain:.85};}
function visualPacket(terrain,gain){
 const raw=terrain.vertices.map(v=>({i:v.i,u:(v.xM-v.zM)*.72,v:(v.xM+v.zM)*.34-v.yM*gain}));
 const xs=raw.map(p=>p.u),ys=raw.map(p=>p.v),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),dx=Math.max(1e-9,maxX-minX),dy=Math.max(1e-9,maxY-minY);
 const points=raw.map(p=>({i:p.i,x:Number((5+90*(p.u-minX)/dx).toFixed(4)),y:Number((5+60*(p.v-minY)/dy).toFixed(4))}));
 const byI=new Map(points.map(p=>[p.i,p]));
 const edgeSet=new Set(),segments=[];
 for(const tri of terrain.triangles)for(const [a,b] of [[tri[0],tri[1]],[tri[1],tri[2]],[tri[2],tri[0]]]){const key=a<b?`${a}:${b}`:`${b}:${a}`;if(edgeSet.has(key))continue;edgeSet.add(key);const p=byI.get(a),q=byI.get(b);if(p&&q)segments.push({a,b,x1:p.x,y1:p.y,x2:q.x,y2:q.y});}
 return{viewBox:'0 0 100 70',points,segments,verticalGain:gain};
}

export async function assembleLivingTerrainExperienceR224({field,fetcher=globalThis.fetch,origin,persist=false}={}){
 if(field?.state!=='GEOSPATIAL_SCENE_FIELD_COMPUTED'||field?.fieldComputed!==true||!hash64(field?.fieldSha256)||!hash64(field?.receiptSha256))return held('R218_FIELD_NOT_READY');
 const p=plan(field.profile);
 const r221=await acquireCanonicalElevationMeshR221({field,fetcher,origin,concurrency:p.concurrency,retries:1,retryDelayMs:120,persist});
 if(r221?.state!=='CANONICAL_ELEVATION_MESH_READY')return held('R221_CANONICAL_ELEVATION_NOT_READY',{r221});
 const terrain=await projectSourceBackedTerrainR222(r221);
 if(terrain?.state!=='SOURCE_BACKED_TERRAIN_VISUAL_READY'||!hash64(terrain?.geometrySha256)||!hash64(terrain?.receiptSha256))return held('R222_TERRAIN_NOT_READY',{r221,terrain});
 const visual=visualPacket(terrain,p.verticalGain),visualSha256=await sha256({geometrySha256:terrain.geometrySha256,profile:field.profile,visual});
 const payload={schema:R224_SCHEMA,revision:R224_REVISION,state:'LIVING_SOURCE_BACKED_TERRAIN_READY',missionId:terrain.lineage?.missionId||'',projectId:terrain.lineage?.projectId||'',profile:field.profile,r218FieldSha256:field.fieldSha256,r219MeshSha256:terrain.r219MeshSha256,r222GeometrySha256:terrain.geometrySha256,r222ReceiptSha256:terrain.receiptSha256,visualSha256,vertexCount:terrain.vertexCount,triangleCount:terrain.triangleCount,minElevationM:terrain.minElevationM,maxElevationM:terrain.maxElevationM,reliefM:terrain.reliefM,verticalDatum:terrain.verticalDatum,canonicalWorkerMediated:true,sourceBackedVerticalField:true,operatorInvoked:true,visualProjectionOnly:true,depthReconstruction:false,materialReconstruction:false,radiometricReconstruction:false,empiricalPixelReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,lineage:terrain.lineage,visual};
 const receiptSha256=await sha256(payload),receipt={...payload,receiptSha256,experienceReady:true,truthBoundary:R224_BOUNDARY};
 if(persist)persistLivingTerrainExperienceR224(receipt);
 return receipt;
}

export function persistLivingTerrainExperienceR224(receipt){if(receipt?.state!=='LIVING_SOURCE_BACKED_TERRAIN_READY'||!hash64(receipt?.visualSha256)||!hash64(receipt?.receiptSha256))return false;try{localStorage.setItem(R224_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R224_EVENT,{detail:receipt}));return true}catch{return false}}
export function readLivingTerrainExperienceR224(){try{const value=JSON.parse(localStorage.getItem(R224_SNAPSHOT_KEY)||'null');return value?.schema===R224_SCHEMA?value:null}catch{return null}}
export function manifestR224(){return{schema:'OMEGA_LIVING_TERRAIN_EXPERIENCE_MANIFEST_R224',revision:R224_REVISION,chain:['R217 exact-byte representational frame','R218 bounded WGS84 field','R221 canonical Worker-mediated complete elevation acquisition','R219 source-backed elevation mesh','R222 deterministic terrain geometry','R224 operator-invoked adaptive Living World visual packet'],authority:{groundEvidence:'R9/R121',computedReality:'R122',adaptivePerformance:'R185 through inherited field profile',canonicalAdmission:'R125',operationContinuity:'R86/R87/R97 when available'},truthBoundary:R224_BOUNDARY};}
