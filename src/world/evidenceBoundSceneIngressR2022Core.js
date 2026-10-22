export const R2022_REVISION='R202.2';
export const R2022_SCHEMA='OMEGA_EVIDENCE_BOUND_SCENE_INGRESS_R202_2';
const HEX64=/^[a-f0-9]{64}$/i;
const text=(v,n=160)=>String(v??'').trim().slice(0,n);
const numberOr=(v,fallback)=>Number.isFinite(Number(v))?Number(v):fallback;
export function validateEvidenceBoundSceneSnapshotR2022(snapshot){
 const earthHash=text(snapshot?.earthHash,64),groundHash=text(snapshot?.groundHash,64);
 const ready=snapshot?.schema==='OMEGA_EVIDENCE_BOUND_REALITY_SNAPSHOT_R202_1'&&snapshot?.revision==='R202.1'&&snapshot?.state==='SOURCE_EVIDENCE_READY_FOR_EXISTING_RENDERER'&&snapshot?.renderInputReady===true&&HEX64.test(earthHash)&&HEX64.test(groundHash)&&snapshot?.computedPhotorealRealityProved===false&&snapshot?.solverValidityProved===false&&snapshot?.canonicalMutation===false;
 return{ok:ready,earthHash:ready?earthHash:null,groundHash:ready?groundHash:null,target:ready?{lat:numberOr(snapshot?.target?.lat,0),lon:numberOr(snapshot?.target?.lon,0),crs:text(snapshot?.target?.crs,64)||'WGS84 / EPSG:4326'}:null,digest:ready?`${earthHash}.${groundHash}`:null};
}
