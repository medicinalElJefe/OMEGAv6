export const R217_REVISION='R217';
export const R217_SCHEMA='OMEGA_EVIDENCE_RECONSTRUCTION_FRAME_R217';
export const R217_SNAPSHOT_KEY='omega.r217.evidenceReconstructionFrame';
export const R217_EVENT='omega-r217-evidence-reconstruction-frame';
export const R217_BOUNDARY='R217 executes only a bounded browser-local, evidence-bound representational reconstruction from the already accepted R216 request. It hashes the exact generated SVG bytes and returns the frame receipt to the same mission/world lineage. It does not reconstruct empirical pixels, invoke a native/GPU/remote renderer, mutate CanonState, execute a device, close federation, validate a solver, or prove computed photoreal reality.';

const stable=(v)=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v};
const bytes=(v)=>new TextEncoder().encode(v);
const hex=(buffer)=>[...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256Bytes=async(v)=>hex(await crypto.subtle.digest('SHA-256',v));
const sha256=async(v)=>sha256Bytes(bytes(JSON.stringify(stable(v))));
const hash64=(v)=>/^[a-f0-9]{64}$/.test(String(v||''));
const text=(v)=>String(v||'');
const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number(n)||0));

function adaptiveGrid(performance={}){
 const continuity=clamp(performance?.continuity,0,1),plasticity=clamp(performance?.plasticity,0,1),burden=clamp(performance?.burden,0,1),contradiction=clamp(performance?.contradiction,0,1);
 const score=continuity*.42+plasticity*.28+(1-burden)*.18+(1-contradiction)*.12;
 if(score>=.78)return{profile:'FULL_FIELD',grid:24};
 if(score>=.55)return{profile:'BALANCED',grid:18};
 return{profile:'CONSERVATIVE',grid:12};
}

function svgFrame({request,scene,profile,grid,seed}){
 const width=720,height=405,cellW=width/grid,cellH=height/grid;
 const cells=[];
 for(let y=0;y<grid;y++)for(let x=0;x<grid;x++){
  const i=(y*grid+x)%seed.length,v=seed[i],v2=seed[(i+17)%seed.length],light=18+Math.round((v/255)*46),hue=Math.round((v2/255)*280);
  cells.push(`<rect x="${(x*cellW).toFixed(2)}" y="${(y*cellH).toFixed(2)}" width="${(cellW+.4).toFixed(2)}" height="${(cellH+.4).toFixed(2)}" fill="hsl(${hue} 58% ${light}%)"/>`);
 }
 const mission=text(request?.missionId).replace(/[<>&"]/g,''),earth=text(request?.earthHash).slice(0,12),ground=text(request?.groundHash).slice(0,12),evidence=text(request?.evidenceDigest).slice(0,12);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="OMEGA R217 evidence-bound representational reconstruction"><metadata>R217 representational reconstruction; empirical pixels not reconstructed; computed photoreal reality unproven; mission=${mission}; earth=${earth}; ground=${ground}; evidence=${evidence}; profile=${profile}</metadata><rect width="720" height="405" fill="#060912"/>${cells.join('')}<rect x="0" y="333" width="720" height="72" fill="rgba(0,0,0,.72)"/><text x="18" y="359" fill="white" font-family="system-ui,sans-serif" font-size="16">R217 · EVIDENCE-BOUND STATE RECONSTRUCTION · ${profile}</text><text x="18" y="382" fill="#d4d8e2" font-family="system-ui,sans-serif" font-size="12">mission ${mission.slice(0,18)} · earth ${earth} · ground ${ground} · empirical pixels NOT reconstructed</text></svg>`;
}

export async function executeEvidenceReconstructionFrameR217({request,scene,performance}={}){
 const ready=Boolean(request?.state==='EVIDENCE_RECONSTRUCTION_INTENT_READY'&&hash64(request?.requestSha256)&&scene?.eventAccepted===true&&scene?.renderInputReady===true&&text(request?.earthHash)&&text(request?.groundHash)&&text(request?.evidenceDigest));
 if(!ready)return{schema:R217_SCHEMA,revision:R217_REVISION,state:'HELD_FOR_PROOF',requestSha256:text(request?.requestSha256),reconstructionExecuted:false,renderedFrame:false,renderReceipt:false,computedPhotorealRealityProved:false,empiricalPixelReconstruction:false,canonicalMutation:false,truthBoundary:R217_BOUNDARY};
 const adaptive=adaptiveGrid(performance);
 const seedHash=await sha256({requestSha256:request.requestSha256,earthHash:request.earthHash,groundHash:request.groundHash,evidenceDigest:request.evidenceDigest,profile:adaptive.profile,grid:adaptive.grid});
 const seed=Uint8Array.from(seedHash.match(/../g).map(v=>parseInt(v,16)));
 const frameSvg=svgFrame({request,scene,profile:adaptive.profile,grid:adaptive.grid,seed});
 const frameBytes=bytes(frameSvg),frameSha256=await sha256Bytes(frameBytes);
 const payload={schema:R217_SCHEMA,revision:R217_REVISION,state:'EVIDENCE_RECONSTRUCTION_FRAME_RENDERED',missionId:text(request.missionId),projectId:text(request.projectId),r216RequestSha256:text(request.requestSha256),r214AnchorSha256:text(request.r214AnchorSha256),r213AttemptSha256:text(request.r213AttemptSha256),r211LineageSha256:text(request.r211LineageSha256),r208WorldBindingOperationSha256:text(request.r208WorldBindingOperationSha256),previousWorldHeadSha256:text(request.previousWorldHeadSha256),earthHash:text(request.earthHash),groundHash:text(request.groundHash),evidenceDigest:text(request.evidenceDigest),adaptivePerformanceAuthority:'R185_EXISTING_PERFORMANCE_LAYER',computedRealityAuthority:'R122_EXISTING_COMPUTED_REALITY',executionAuthority:'R217_BROWSER_LOCAL_BOUNDED',profile:adaptive.profile,grid:adaptive.grid,width:720,height:405,mime:'image/svg+xml',frameBytes:frameBytes.byteLength,frameSha256,reconstructionExecuted:true,renderedFrame:true,renderReceipt:true,evidenceBoundRepresentationalFrame:true,empiricalPixelReconstruction:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,newNativeRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false};
 const receiptSha256=await sha256(payload);
 return{...payload,receiptSha256,frameSvg,truthBoundary:R217_BOUNDARY};
}

export function persistEvidenceReconstructionFrameR217(receipt){if(receipt?.state!=='EVIDENCE_RECONSTRUCTION_FRAME_RENDERED'||!hash64(receipt?.frameSha256)||!hash64(receipt?.receiptSha256))return false;try{localStorage.setItem(R217_SNAPSHOT_KEY,JSON.stringify(receipt));window.dispatchEvent(new CustomEvent(R217_EVENT,{detail:receipt}));return true}catch{return false}}
export function readEvidenceReconstructionFrameR217(){try{const value=JSON.parse(localStorage.getItem(R217_SNAPSHOT_KEY)||'null');return value?.schema===R217_SCHEMA?value:null}catch{return null}}
export function manifestR217(){return{schema:'OMEGA_EVIDENCE_RECONSTRUCTION_FRAME_MANIFEST_R217',revision:R217_REVISION,chain:['R216 evidence reconstruction request identity','R217 bounded browser-local evidence-bound representational reconstruction','exact SVG frame bytes SHA-256','receipt returns to R216/R214/R213/R211/R208 world lineage'],authority:{computedReality:'R122 existing authority',adaptivePerformance:'R185',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97 when paired',canonicalAdmission:'R125'},truthBoundary:R217_BOUNDARY};}
