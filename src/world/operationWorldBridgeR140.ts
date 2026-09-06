import type {OmegaOperationR86} from '../omegaOperationBusR86';
import {assembleLivingWorldFrameR136} from './livingWorldFrameR136.js';

export const R140_REVISION='R140';
export const R140_SCHEMA='OMEGA_LIVING_WORLD_OPERATION_BRIDGE_R140';
export const R140_LAWS=Object.freeze([
 'REAL_RUNTIME_OPERATIONS_ADVANCE_ONE_LOGICAL_WORLD_FRAME',
 'BROWSER_OPERATION_RECEIPTS_ARE_NOT_EXTERNAL_OR_NATIVE_PROOF',
 'HOLD_OPERATIONS_CARRY_SCAR_WITHOUT_PROMOTION',
 'EARTH_FEDERATION_HYBRID_AND_RENDER_TRUTH_REQUIRE_EXPLICIT_SOURCE_FIELDS',
 'ADAPTIVE_PERFORMANCE_CHANGES_PROJECTION_COST_NOT_CANONICAL_AUTHORITY',
 'R134_REMAINS_WORLD_CONTINUITY_AUTHORITY',
 'R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY',
 'R97_DURABILITY_REQUIRES_AUTHENTICATED_CONTINUITY_SYNC'
]);

const HEAD_KEY='omega.r140.world.head';
const REF_KEY='omega.r140.world.refs';
const MAX_REFS=64;
const text=(v:unknown,n=160)=>String(v??'').trim().slice(0,n);
const list=(v:unknown,limit=32)=>Array.isArray(v)?v.map(x=>text(x)).filter(Boolean).slice(-limit):[];
const num=(v:unknown,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;

function projectionForSurface(surface:string){
 if(surface==='Earth Now')return'EARTH';
 if(['Matter Traversal','Visual Instrument','Immersive Traversal','Extreme Traversal','Traversal','Field','Data Motion','Convergence'].includes(surface))return'WOVEN';
 if(surface==='Relativity')return'RELATIVITY';
 if(surface==='Forecast')return'FORECAST';
 return'FIELD';
}

export function compileOperationWorldInputR140(event:OmegaOperationR86){
 const p=(event.payload&&typeof event.payload==='object'?event.payload:{}) as Record<string,unknown>;
 const sourceIds=list(p.sourceIds),proofIds=list(p.proofIds),scarIds=[...list(p.scarIds),...(event.status==='HOLD'?[event.sha256]:[])];
 const earthObserved=p.earthObserved===true&&sourceIds.length>0;
 const federationReturned=p.federationReturned===true&&(sourceIds.length>0||proofIds.length>0);
 const devices=Array.isArray(p.devices)?p.devices:[];
 const nativeExecutionClaimed=p.nativeExecutionClaimed===true&&devices.some((d:any)=>d?.online===true&&d?.revoked!==true);
 const renderReceipt=p.renderReceipt===true&&(sourceIds.length>0||proofIds.length>0);
 const directPhotorealValidation=renderReceipt&&p.directPhotorealValidation===true&&proofIds.length>0;
 const metrics={
  continuity:num(p.continuity,0),plasticity:num(p.plasticity,0),contradiction:num(p.contradiction,event.status==='HOLD'?1:0),
  burden:num(p.burden,event.status==='HOLD'?.5:0),evidence:num(p.evidence,event.status==='PASS'?1:0),uncertainty:num(p.uncertainty,event.status==='HOLD'?1:.5),scar:num(p.scar,event.status==='HOLD'?1:0)
 };
 return{
  eventTime:event.at,
  observerId:`browser-${text(event.surface,48).replace(/[^A-Za-z0-9._:-]+/g,'-')||'operator'}`,
  projection:projectionForSurface(event.surface),address:num(event.nextAddress??event.address,0),
  intent:{id:event.workflowId?`workflow-${text(event.workflowId,120)}`:`operation-${text(event.type,80)}`,sourceIds:[event.sha256]},
  mission:{id:event.id,planDigest:event.sha256,scarIds},
  earth:{observed:earthObserved,sourceIds:earthObserved?sourceIds:[],proofIds:earthObserved?proofIds:[],scarIds:earthObserved?scarIds:[],payloadDigest:earthObserved?text(p.payloadDigest):null},
  federation:{returned:federationReturned,node:federationReturned?text(p.federationNode)||'federation-return':null,sourceIds:federationReturned?sourceIds:[],proofIds:federationReturned?proofIds:[],scarIds:federationReturned?scarIds:[],payloadDigest:federationReturned?text(p.payloadDigest):null},
  hybrid:{nativeExecutionClaimed,devices:nativeExecutionClaimed?devices:[],proofIds:nativeExecutionClaimed?proofIds:[],resultFingerprint:nativeExecutionClaimed?text(p.resultFingerprint):null},
  render:{receipt:renderReceipt,sourceIds:renderReceipt?sourceIds:[],proofIds:renderReceipt?proofIds:[],scarIds:renderReceipt?scarIds:[],payloadDigest:renderReceipt?text(p.payloadDigest):null,directPhotorealValidation},
  performance:{load:num(p.runtimeLoad,0),latencyPressure:num(p.latencyPressure,0),evidence:metrics.evidence},metrics
 };
}

function readHead(){if(typeof localStorage==='undefined')return null;try{const x=JSON.parse(localStorage.getItem(HEAD_KEY)||'null');return x?.worldId==='OMEGA_CANONICAL_WORLD'?x:null}catch{return null}}
function saveFrame(frame:any){
 if(typeof localStorage==='undefined')return;
 try{
  localStorage.setItem(HEAD_KEY,JSON.stringify(frame.head));
  const rows=JSON.parse(localStorage.getItem(REF_KEY)||'[]'),refs=Array.isArray(rows)?rows:[];
  refs.push({at:Date.now(),operationRef:frame.operationRef,visualState:frame.visualState});
  localStorage.setItem(REF_KEY,JSON.stringify(refs.slice(-MAX_REFS)));
 }catch{}
}

export async function advanceOperationWorldR140(event:OmegaOperationR86,previousHead:any=undefined){
 const input={...compileOperationWorldInputR140(event),previousHead:previousHead===undefined?readHead():previousHead};
 const frame=await assembleLivingWorldFrameR136(input);
 saveFrame(frame);
 return{schema:R140_SCHEMA,revision:R140_REVISION,eventId:event.id,eventSha256:event.sha256,frame,canonicalMutation:false,canonicalAdmissionAuthority:'R125',durability:'BROWSER_PERSISTED; R97 durable continuity still requires authenticated Hybrid continuity sync',truthBoundary:'R140 bridges real R86 browser/runtime operation receipts into the existing R136 visual-first one-world frame and R134 scar/proof chain. It never upgrades browser actions into Earth, federation, native Hybrid, solver, deployment or photoreal proof unless the operation payload carries the explicit source/proof fields already required by those domains.'};
}

let installed=false;
export function installLivingWorldOperationBridgeR140(){
 if(installed||typeof window==='undefined')return false;
 installed=true;
 window.addEventListener('omega-r86-operation',((e:Event)=>{
  const event=(e as CustomEvent<OmegaOperationR86>).detail;
  if(!event||event.schema!=='OMEGA_OPERATION_EVENT_R86')return;
  void advanceOperationWorldR140(event).then(receipt=>window.dispatchEvent(new CustomEvent('omega-r140-world-frame',{detail:receipt}))).catch(()=>{});
 }) as EventListener);
 return true;
}

export function readLivingWorldBridgeR140(){
 if(typeof localStorage==='undefined')return{schema:R140_SCHEMA,head:null,refs:[],durability:'UNAVAILABLE_OUTSIDE_BROWSER'};
 try{return{schema:R140_SCHEMA,head:readHead(),refs:JSON.parse(localStorage.getItem(REF_KEY)||'[]'),durability:'BROWSER_PERSISTED; DURABLE_ONLY_AFTER_AUTHENTICATED_R97_SYNC'}}catch{return{schema:R140_SCHEMA,head:null,refs:[],durability:'BROWSER_PERSISTED_READ_FAILURE'}}
}
