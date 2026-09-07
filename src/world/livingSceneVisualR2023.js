export const R2023_REVISION='R202.3';
export const R2023_SCHEMA='OMEGA_LIVING_SCENE_VISUAL_R202_3';
export const R2023_EVENT='omega-r2022-scene-ingress';
export const R2023_SNAPSHOT_KEY='omega.r2021.reality.readiness';
const HEX64=/^[a-f0-9]{64}$/i;
const text=(v,n=160)=>String(v??'').trim().slice(0,n);
const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
export function projectLivingSceneVisualR2023({receipt=null,snapshot=null}={}){
 const accepted=receipt?.schema==='OMEGA_EVIDENCE_BOUND_SCENE_INGRESS_R202_2'&&receipt?.revision==='R202.2'&&['SOURCE_EVIDENCE_INGRESSED_NOT_PHOTOREAL','ALREADY_INGRESSED'].includes(receipt?.state);
 const earthHash=text(snapshot?.earthHash,64),groundHash=text(snapshot?.groundHash,64);
 const provenance=accepted&&snapshot?.schema==='OMEGA_EVIDENCE_BOUND_REALITY_SNAPSHOT_R202_1'&&snapshot?.revision==='R202.1'&&snapshot?.renderInputReady===true&&HEX64.test(earthHash)&&HEX64.test(groundHash)&&snapshot?.computedPhotorealRealityProved===false&&snapshot?.solverValidityProved===false&&snapshot?.canonicalMutation===false;
 const target=provenance?{lat:num(snapshot?.target?.lat),lon:num(snapshot?.target?.lon),crs:text(snapshot?.target?.crs,64)||'WGS84 / EPSG:4326'}:null;
 return{schema:R2023_SCHEMA,revision:R2023_REVISION,eventAccepted:Boolean(provenance),state:provenance?'EVIDENCE_BOUND_SCENE_ACTIVE':'SCENE_EVIDENCE_UNPROVED',label:provenance?'LIVING SCENE · SOURCE EVIDENCE ACTIVE':'LIVING SCENE · EVIDENCE REQUIRED',worldId:'OMEGA_CANONICAL_WORLD',renderAuthority:'R122',worldContinuityAuthority:'R134/R149/R186',ingressAuthority:'R86/R140/R136/R134',canonicalAdmissionAuthority:'R125',earthHash:provenance?earthHash:null,groundHash:provenance?groundHash:null,digest:provenance?text(receipt?.digest,160):null,target,route:'Earth Now',renderInputReady:Boolean(provenance),computedPhotorealRealityProved:false,solverValidityProved:false,pcOnlineProved:false,federationClosedProved:false,dispatchAuthorized:false,canonicalMutation:false,truthBoundary:provenance?'R202.3 visualizes provenance-bound Earth/ground evidence already ingressed through R202.2 into the existing one-world continuity path. Renderer eligibility is not photoreal reconstruction or scientific validation.':'R202.3 refuses to visualize an evidence-bound scene until both the R202.2 ingress receipt and matching R202.1 provenance snapshot are present.'};
}
