import {GitBranch,ShieldCheck} from 'lucide-react';
import type {HybridMission} from './hybridMissionRuntime';
import {buildMissionContinuity} from './missionContinuityR204';
import './missionContinuityR204.css';

export default function MissionContinuityR204({missions}:{missions:HybridMission[]}){
 const chain=buildMissionContinuity(missions),current=chain[chain.length-1];
 if(!current)return null;
 return <section className='r204-continuity' aria-label='Mission scar and proof continuity'>
  <header><GitBranch/><div><span>R204 · MISSION CONTINUITY</span><b>Intent → return → scar/proof carry → next intent</b></div><strong>{current.status}</strong></header>
  <div className='r204-continuity-grid'>
   <div><span>PREVIOUS</span><b>{current.previousMissionId||'ROOT'}</b></div>
   <div><span>CARRY HASH</span><b>{current.carryHash}</b></div>
   <div><span>PRIOR PROOF</span><b>{current.previousProof}</b></div>
   <div><span>SCAR CARRY</span><b>{current.scarCarry.toFixed(3)}</b></div>
   <div><span>RETURN CARRY</span><b>{current.returnCarry.toFixed(3)}</b></div>
   <div><span>CHAIN DEPTH</span><b>{chain.length}</b></div>
  </div>
  <footer><ShieldCheck/>Read-only continuity projection. It preserves mission history and exposes carry; it does not admit CanonState, execute the PC, close federation, or validate a solver.</footer>
 </section>;
}
