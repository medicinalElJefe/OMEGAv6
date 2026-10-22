export const R222_REVISION='R222';
export const R222_SCHEMA='OMEGA_SOURCE_BACKED_TERRAIN_VISUAL_PROJECTION_R222';
export const R222_BOUNDARY='R222 deterministically projects the already source-backed R221/R219 elevation mesh into visual-first terrain geometry for the existing Living World. It preserves exact evidence/mission/world lineage and does not invent depth, materials, radiometry, textures, camera calibration, empirical pixels, solver validity, native execution, federation closure, PC online state, Canon mutation, or computed photoreal reality.';

const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const bytes=v=>new TextEncoder().encode(JSON.stringify(stable(v)));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async v=>hex(await crypto.subtle.digest('SHA-256',bytes(v)));
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const held=reason=>({schema:R222_SCHEMA,revision:R222_REVISION,state:'HELD_FOR_SOURCE_BACKED_TERRAIN',terrainProjected:false,reason,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R222_BOUNDARY});

export async function projectSourceBackedTerrainR222(r221={}){
 const mesh=r221?.mesh;
 const side=Number(mesh?.side),samples=mesh?.samples;
 if(r221?.schema!=='OMEGA_CANONICAL_ELEVATION_RUNTIME_BRIDGE_R221'||r221?.state!=='CANONICAL_ELEVATION_MESH_READY'||r221?.meshComputed!==true||r221?.elevationEvidenceAccepted!==true)return held('R221_NOT_READY');
 if(!mesh||mesh.state!=='SOURCE_BACKED_ELEVATION_MESH_COMPUTED'||mesh.sourceBackedVerticalField!==true||!hash64(mesh.meshSha256)||!hash64(mesh.receiptSha256))return held('R219_MESH_NOT_PROVEN');
 if(!Number.isInteger(side)||side<2||side>9||!Array.isArray(samples)||samples.length!==side*side)return held('GRID_SHAPE_INVALID');
 if(samples.some(s=>!finite(s?.eastM)||!finite(s?.northM)||!finite(s?.elevationM)))return held('SOURCE_COORDINATE_OR_ELEVATION_MISSING');
 const minElevationM=Math.min(...samples.map(s=>Number(s.elevationM)));
 const vertices=samples.map(s=>({i:Number(s.i),xM:Number(s.eastM),yM:Number((Number(s.elevationM)-minElevationM).toFixed(6)),zM:Number(s.northM),lat:Number(s.lat),lon:Number(s.lon),elevationM:Number(s.elevationM),elevationSourceId:String(s.elevationSourceId||''),elevationUncertaintyM:finite(s.elevationUncertaintyM)?Number(s.elevationUncertaintyM):null}));
 const triangles=[];
 for(let r=0;r<side-1;r++)for(let c=0;c<side-1;c++){const a=r*side+c,b=a+1,d=(r+1)*side+c,e=d+1;triangles.push([a,d,b],[b,d,e]);}
 const geometryPayload={r219MeshSha256:mesh.meshSha256,r219ReceiptSha256:mesh.receiptSha256,side,spacingM:Number(mesh.spacingM),verticalDatum:String(mesh.verticalDatum||'UNSPECIFIED'),vertices,triangles};
 const geometrySha256=await sha256(geometryPayload);
 const lineage={missionId:String(mesh.missionId||''),projectId:String(mesh.projectId||''),r218FieldSha256:String(mesh.r218FieldSha256||''),r217ReceiptSha256:String(mesh.r217ReceiptSha256||''),r216RequestSha256:String(mesh.r216RequestSha256||''),r214AnchorSha256:String(mesh.r214AnchorSha256||''),r213AttemptSha256:String(mesh.r213AttemptSha256||''),r211LineageSha256:String(mesh.r211LineageSha256||''),r208WorldBindingOperationSha256:String(mesh.r208WorldBindingOperationSha256||''),previousWorldHeadSha256:String(mesh.previousWorldHeadSha256||''),earthHash:String(mesh.earthHash||''),groundHash:String(mesh.groundHash||''),evidenceDigest:String(mesh.evidenceDigest||'')};
 const receiptPayload={schema:R222_SCHEMA,revision:R222_REVISION,state:'SOURCE_BACKED_TERRAIN_VISUAL_READY',geometrySha256,lineage,r219MeshSha256:mesh.meshSha256,r219ReceiptSha256:mesh.receiptSha256,vertexCount:vertices.length,triangleCount:triangles.length,verticalDatum:String(mesh.verticalDatum||'UNSPECIFIED'),minElevationM:Number(mesh.minElevationM),maxElevationM:Number(mesh.maxElevationM),reliefM:Number(mesh.reliefM),visualProjectionOnly:true,sourceBackedVerticalField:true,depthReconstruction:false,materialReconstruction:false,radiometricReconstruction:false,empiricalPixelReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false};
 const receiptSha256=await sha256(receiptPayload);
 return{...receiptPayload,receiptSha256,vertices,triangles,terrainProjected:true,computedRealityAuthority:'R122',adaptivePerformanceAuthority:'R185',canonicalAdmissionAuthority:'R125',truthBoundary:R222_BOUNDARY};
}

export function manifestR222(){return{schema:'OMEGA_SOURCE_BACKED_TERRAIN_VISUAL_MANIFEST_R222',revision:R222_REVISION,chain:['R218 WGS84 field','R221 canonical elevation acquisition','R219 source-backed elevation mesh','R222 deterministic visual terrain geometry','existing Living World projection target'],authority:{computedReality:'R122',adaptivePerformance:'R185',canonicalAdmission:'R125',sourceElevation:'R219/R220/R221'},truthBoundary:R222_BOUNDARY};}
