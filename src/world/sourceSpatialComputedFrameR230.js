export const R230_REVISION='R230';
export const R230_SCHEMA='OMEGA_SOURCE_SPATIAL_COMPUTED_FRAME_R230';
export const R230_BOUNDARY='R230 renders only the exact R228 source-derived 3-D points into deterministic browser-local SVG bytes and hashes those exact bytes. It is a computed representational frame, not empirical imagery or computed photoreal reality; it does not independently validate camera calibration, solver validity, native execution, PC online state, federation closure, or CanonState admission.';
const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const sha256Bytes=async text=>{const bytes=new TextEncoder().encode(text);const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const sha256=async v=>sha256Bytes(JSON.stringify(stable(v)));
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const finite=v=>Number.isFinite(Number(v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function bounded(points,limit){if(points.length<=limit)return points;const out=[];for(let i=0;i<limit;i++)out.push(points[Math.floor(i*(points.length-1)/(limit-1))]);return out}
export async function renderSourceSpatialComputedFrameR230({reconstruction,width=640,height=400,maxVisualPoints=1024}={}){
 const missing=[];
 if(reconstruction?.state!=='SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED'||!hash64(reconstruction?.geometrySha256)||!hash64(reconstruction?.receiptSha256))missing.push('R228_RECONSTRUCTION');
 const points=Array.isArray(reconstruction?.points)?reconstruction.points:[];
 if(points.length<3||points.some(p=>!finite(p?.x)||!finite(p?.y)||!finite(p?.z)))missing.push('R228_NUMERIC_POINTS');
 width=Math.max(240,Math.min(1920,Math.floor(Number(width)||640)));height=Math.max(180,Math.min(1080,Math.floor(Number(height)||400)));maxVisualPoints=Math.max(16,Math.min(2048,Math.floor(Number(maxVisualPoints)||1024)));
 if(missing.length)return{schema:R230_SCHEMA,revision:R230_REVISION,state:'HELD_FOR_R228_SOURCE_GEOMETRY',missing,renderedComputedRealityFrame:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,truthBoundary:R230_BOUNDARY};
 const sample=bounded(points,maxVisualPoints),pad=24;
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
 for(const p of sample){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z)}
 const sx=Math.max(1e-9,maxX-minX),sy=Math.max(1e-9,maxY-minY),sz=Math.max(1e-9,maxZ-minZ);
 const projected=sample.map((p,i)=>({i,x:Number((pad+(p.x-minX)/sx*(width-pad*2)).toFixed(3)),y:Number((height-pad-(p.y-minY)/sy*(height-pad*2)).toFixed(3)),r:Number((1.2+2.8*(p.z-minZ)/sz).toFixed(3))}));
 const meta=`R230 ${String(reconstruction.geometrySha256).slice(0,16)} ${esc(reconstruction.referenceFrame||'UNSPECIFIED')}`;
 const circles=projected.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="white" fill-opacity="0.78"/>`).join('');
 const svgBytes=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="R230 source-derived computed spatial frame; not photoreal imagery"><rect width="${width}" height="${height}" fill="#040812"/><g>${circles}</g><text x="${pad}" y="${height-8}" fill="white" fill-opacity="0.58" font-size="10">${meta}</text></svg>`;
 const frameSha256=await sha256Bytes(svgBytes);
 const core={r228GeometrySha256:reconstruction.geometrySha256,r228ReceiptSha256:reconstruction.receiptSha256,requestSha256:reconstruction.requestSha256,r227BundleSha256:reconstruction.r227BundleSha256,r224ReceiptSha256:reconstruction.r224ReceiptSha256,r222GeometrySha256:reconstruction.r222GeometrySha256,r219MeshSha256:reconstruction.r219MeshSha256,r218FieldSha256:reconstruction.r218FieldSha256,referenceFrame:reconstruction.referenceFrame,width,height,sourcePointCount:points.length,renderedPointCount:sample.length,maxVisualPoints,frameSha256};
 const receiptSha256=await sha256(core);
 return{schema:R230_SCHEMA,revision:R230_REVISION,state:'SOURCE_SPATIAL_COMPUTED_FRAME_RENDERED',...core,receiptSha256,svgBytes,renderedComputedRealityFrame:true,computedRepresentationOnly:true,empiricalPixelReconstruction:false,spatialCalibrationProved:false,independentCalibrationValidation:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false,rendererAuthority:'R230_BROWSER_LOCAL_DETERMINISTIC_SVG',computedRealityAuthority:'R122_EXISTING_AUTHORITY_UNCHANGED',adaptivePerformanceAuthority:'R185_EXISTING_AUTHORITY_UNCHANGED',canonicalAdmissionAuthority:'R125',truthBoundary:R230_BOUNDARY};
}
