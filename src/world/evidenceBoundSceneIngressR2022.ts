import {emitOperationR86} from '../omegaOperationBusR86';

export const R2022_REVISION='R202.2';
export const R2022_SCHEMA='OMEGA_EVIDENCE_BOUND_SCENE_INGRESS_R202_2';
export const R2022_EVENT='omega-r2021-reality-readiness';
export const R2022_SNAPSHOT_KEY='omega.r2021.reality.readiness';
const DEDUPE_KEY='omega.r2022.scene.ingress.digests';
const HEX64=/^[a-f0-9]{64}$/i;

type RealitySnapshotR2022={
 schema?:string;revision?:string;state?:string;renderInputReady?:boolean;observedAt?:number;
 earthHash?:string|null;groundHash?:string|null;target?:{lat?:number;lon?:number;crs?:string}|null;
 computedPhotorealRealityProved?:boolean;solverValidityProved?:boolean;canonicalMutation?:boolean;
};

const text=(v:unknown,n=160)=>String(v??'').trim().slice(0,n);
const numberOr=(v:unknown,fallback:number)=>Number.isFinite(Number(v))?Number(v):fallback;

export function validateEvidenceBoundSceneSnapshotR2022(snapshot:RealitySnapshotR2022|null|undefined){
 const earthHash=text(snapshot?.earthHash,64),groundHash=text(snapshot?.groundHash,64);
 const ready=snapshot?.schema==='OMEGA_EVIDENCE_BOUND_REALITY_SNAPSHOT_R202_1'&&
  snapshot?.revision==='R202.1'&&snapshot?.state==='SOURCE_EVIDENCE_READY_FOR_EXISTING_RENDERER'&&
  snapshot?.renderInputReady===true&&HEX64.test(earthHash)&&HEX64.test(groundHash)&&
  snapshot?.computedPhotorealRealityProved===false&&snapshot?.solverValidityProved===false&&snapshot?.canonicalMutation===false;
 return{ok:ready,earthHash:ready?earthHash:null,groundHash:ready?groundHash:null,target:ready?{lat:numberOr(snapshot?.target?.lat,0),lon:numberOr(snapshot?.target?.lon,0),crs:text(snapshot?.target?.crs,64)||'WGS84 / EPSG:4326'}:null,digest:ready?`${earthHash}.${groundHash}`:null};
}

function readSeen(){if(typeof localStorage==='undefined')return new Set<string>();try{const x=JSON.parse(localStorage.getItem(DEDUPE_KEY)||'[]');return new Set<string>(Array.isArray(x)?x.filter(v=>typeof v==='string').slice(-128):[])}catch{return new Set<string>()}}
function saveSeen(rows:Set<string>){if(typeof localStorage==='undefined')return;try{localStorage.setItem(DEDUPE_KEY,JSON.stringify([...rows].slice(-128)))}catch{}}

export async function ingressEvidenceBoundSceneR2022(snapshot:RealitySnapshotR2022){
 const v=validateEvidenceBoundSceneSnapshotR2022(snapshot);
 if(!v.ok||!v.earthHash||!v.groundHash||!v.digest)return{ok:false,schema:R2022_SCHEMA,revision:R2022_REVISION,state:'HELD_EMPIRICAL_EVIDENCE_REQUIRED',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const seen=readSeen();
 if(seen.has(v.digest))return{ok:true,schema:R2022_SCHEMA,revision:R2022_REVISION,state:'ALREADY_INGRESSED',digest:v.digest,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const event=await emitOperationR86({
  type:'EVIDENCE_BOUND_SCENE_INGRESSED',surface:'Earth Now',status:'PASS',workflowId:null,
  detail:'R202.1 provenance-bound Earth + ground evidence entered the existing R140/R136/R134 living world as observation evidence.',
  payload:{
   earthObserved:true,sourceIds:[`earth:${v.earthHash}`,`ground:${v.groundHash}`],proofIds:[v.earthHash,v.groundHash],
   scarIds:[`r2022:${v.earthHash.slice(0,16)}:${v.groundHash.slice(0,16)}`],payloadDigest:v.digest,
   continuity:1,plasticity:.5,contradiction:0,burden:.1,evidence:1,uncertainty:.25,scar:.1,
   target:v.target,renderReceipt:false,directPhotorealValidation:false,nativeExecutionClaimed:false,
   computedPhotorealRealityProved:false,solverValidityProved:false,canonicalMutation:false
  }
 });
 seen.add(v.digest);saveSeen(seen);
 return{ok:true,schema:R2022_SCHEMA,revision:R2022_REVISION,state:'SOURCE_EVIDENCE_INGRESSED_NOT_PHOTOREAL',digest:v.digest,eventId:event.id,eventSha256:event.sha256,worldIngress:'R86 → R140 → R136 → R134',durability:'R140 browser continuity; R149/R97 durable continuity remains separately authenticated',canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R202.2 ingresses only R202.1 provenance-bound Earth/ground evidence into the existing living-world continuity path. It does not prove photoreal reconstruction, solver validity, federation closure, PC online state, native execution, deployment, or CanonState admission.'};
}

let installed=false;
export function installEvidenceBoundSceneIngressR2022(){
 if(installed||typeof window==='undefined')return()=>{};installed=true;
 const accept=(value:any)=>{void ingressEvidenceBoundSceneR2022(value).then(receipt=>window.dispatchEvent(new CustomEvent('omega-r2022-scene-ingress',{detail:receipt}))).catch(()=>{})};
 const onEvent=(e:Event)=>accept((e as CustomEvent).detail);
 const onStorage=(e:StorageEvent)=>{if(e.key!==R2022_SNAPSHOT_KEY||!e.newValue)return;try{accept(JSON.parse(e.newValue))}catch{}};
 window.addEventListener(R2022_EVENT,onEvent as EventListener);window.addEventListener('storage',onStorage);
 try{const existing=localStorage.getItem(R2022_SNAPSHOT_KEY);if(existing)accept(JSON.parse(existing))}catch{}
 return()=>{window.removeEventListener(R2022_EVENT,onEvent as EventListener);window.removeEventListener('storage',onStorage);installed=false};
}
