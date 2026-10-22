import type {HybridMission} from './hybridMissionRuntime';

export type MissionContinuityAnchor={
 missionId:string;
 previousMissionId:string|null;
 carryHash:string;
 previousProof:string;
 scarCarry:number;
 returnCarry:number;
 status:'ROOT'|'CONTINUED'|'HELD_FOR_PROOF';
};

const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')};
const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));

/**
 * R204 read-only continuity projection.
 * Chains already-compiled Hybrid mission return packets without creating a new
 * execution, Canon, device, federation, or persistence authority.
 */
export function buildMissionContinuity(missions:HybridMission[]):MissionContinuityAnchor[]{
 return missions.map((mission,index)=>{
  const previous=index>0?missions[index-1]:null;
  const previousProof=previous?.returnPacket?.proof_status||'ROOT';
  const scarCarry=previous?clamp((previous.scar+mission.scar)/2):clamp(mission.scar);
  const returnCarry=previous?clamp((previous.returnSignal+mission.returnSignal)/2):clamp(mission.returnSignal);
  const carryHash=hash([previous?.id||'ROOT',previousProof,mission.id,mission.returnPacket.proof_status,scarCarry.toFixed(6),returnCarry.toFixed(6)].join('|'));
  const held=mission.returnPacket.proof_status==='PROOF_REQUIRED'||previousProof==='PROOF_REQUIRED';
  return{missionId:mission.id,previousMissionId:previous?.id||null,carryHash,previousProof,scarCarry,returnCarry,status:index===0?'ROOT':held?'HELD_FOR_PROOF':'CONTINUED'};
 });
}
