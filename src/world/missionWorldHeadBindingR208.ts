import {buildMissionContinuity} from '../missionContinuityR204';
import type {HybridMission} from '../hybridMissionRuntime';
import {emitOperationR86} from '../omegaOperationBusR86';
import {readLivingWorldBridgeR140} from './operationWorldBridgeR140';

export const R208_REVISION='R208';
export const R208_SCHEMA='OMEGA_MISSION_WORLD_HEAD_BINDING_R208';
export const R208_EVENT='omega-r208-mission-world-bound';
export const R208_SNAPSHOT_KEY='omega.r208.missionWorldBinding';
export const R208_LAWS=Object.freeze([
 'R204_MISSION_PROOF_SCAR_CONTINUITY_IS_BOUND_AS_LINEAGE_NOT_EXECUTION_PROOF',
 'R140_REMAINS_THE_ONLY_OPERATION_TO_LIVING_WORLD_BRIDGE',
 'R134_REMAINS_THE_CANONICAL_WORLD_CONTINUITY_AUTHORITY',
 'R149_REMAINS_THE_EXISTING_WORLD_HEAD_PERSISTENCE_PATH',
 'R97_REMAINS_THE_EXISTING_AUTHENTICATED_DURABLE_CONTINUITY_TRANSPORT',
 'UNPAIRED_CONTINUITY_REMAINS_BROWSER_LOCAL',
 'FEDERATION_PC_SOLVER_AND_PHOTOREAL_TRUTH_REMAIN_SEPARATELY_PROVEN',
 'NO_NEW_DURABLE_OBJECT_EXECUTOR_OR_CANON_AUTHORITY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const MISSION_KEY='omega.v6.hybrid.missions';
const readMissions=():HybridMission[]=>{try{const rows=JSON.parse(localStorage.getItem(MISSION_KEY)||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}};
const text=(v:unknown,n=160)=>String(v??'').trim().slice(0,n);

export async function bindLatestMissionToWorldR208(){
 const missions=readMissions(),mission=missions.at(-1)||null,anchor=buildMissionContinuity(missions).at(-1)||null;
 if(!mission||!anchor)return{ok:false,schema:R208_SCHEMA,revision:R208_REVISION,state:'NO_MISSION_CONTINUITY',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const before=readLivingWorldBridgeR140().head;
 const held=mission.returnPacket?.proof_status==='PROOF_REQUIRED'||anchor.status==='HELD_FOR_PROOF';
 const operation=await emitOperationR86({
  type:'MISSION_WORLD_CONTINUITY_BOUND',surface:'Hybrid Link',status:held?'HOLD':'INFO',
  detail:`R208 bind ${mission.id} continuity into the existing R140/R134 canonical-world lineage`,
  payload:{
   missionId:mission.id,previousMissionId:anchor.previousMissionId,missionCarryHash:anchor.carryHash,
   missionScarIds:[anchor.carryHash,...(anchor.previousMissionId?[anchor.previousMissionId]:[])],
   missionProofStatus:mission.returnPacket?.proof_status||'UNKNOWN',scar:anchor.scarCarry,continuity:Math.max(0,Math.min(1,anchor.returnCarry)),
   evidence:0,uncertainty:held?1:.5,nativeExecutionClaimed:false,renderReceipt:false,federationReturned:false,earthObserved:false
  }
 });
 const snapshot={
  ok:true,schema:R208_SCHEMA,revision:R208_REVISION,state:held?'BOUND_WITH_PROOF_HOLD':'BOUND_AS_LINEAGE',missionId:mission.id,
  previousMissionId:anchor.previousMissionId,carryHash:anchor.carryHash,operationId:operation.id,operationSha256:operation.sha256,
  previousWorldHeadSha256:text(before?.headSha256||before?.sha256||''),canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'R208 emits one existing R86 browser/runtime continuity operation so R140/R136/R134 can hash the R204 mission carry into the same canonical world lineage and R149 can persist that resulting world reference through the existing R87/R97 path. This proves continuity binding only; it does not prove native execution, PC online state, federation closure, solver validity, public deployment, or computed photoreal reality.'
 };
 try{localStorage.setItem(R208_SNAPSHOT_KEY,JSON.stringify(snapshot));window.dispatchEvent(new CustomEvent(R208_EVENT,{detail:snapshot}))}catch{}
 return snapshot;
}

let installed=false;
export function installMissionWorldHeadBindingR208(){
 if(installed||typeof window==='undefined')return()=>{};
 installed=true;
 const onMission=()=>void bindLatestMissionToWorldR208().catch(()=>{});
 window.addEventListener('omega-r206-mission-continuity',onMission as EventListener);
 return()=>window.removeEventListener('omega-r206-mission-continuity',onMission as EventListener);
}

export function manifestR208(){return{
 ok:true,schema:'OMEGA_MISSION_WORLD_HEAD_BINDING_MANIFEST_R208',revision:R208_REVISION,laws:R208_LAWS,
 chain:['R204 mission carry','R208 R86 continuity operation','R140 living-world bridge','R136 visual-first frame','R134 canonical world head','R149 project world reference','R87 project snapshot','R97 authenticated continuity sync'],
 authority:{newExecutor:false,newDurableObject:false,newCanonAuthority:false,worldContinuity:'R134',worldPersistence:'R149',durableTransport:'R97',canonicalAdmission:'R125'},
 truthBoundary:'R208 closes a continuity-linkage gap only. Mission intent and scars become replayable inputs to the existing canonical world head; all external truth and execution domains retain their inherited proof gates.'
};}
