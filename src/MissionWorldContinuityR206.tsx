import {useEffect,useMemo,useState} from 'react';
import {GitBranch,Route,ShieldCheck,Sparkles} from 'lucide-react';
import type {HybridMission} from './hybridMissionRuntime';
import {buildMissionContinuity} from './missionContinuityR204';
import {R2023_EVENT} from './world/livingSceneVisualR2023.js';
import {R208_EVENT,R208_SNAPSHOT_KEY} from './world/missionWorldHeadBindingR208';
import {compileRenderIntentLineageR211} from './world/renderIntentLineageR211.js';
import './missionWorldContinuityR206.css';

export const R206_MISSION_EVENT='omega-r206-mission-continuity';
const MISSION_KEY='omega.v6.hybrid.missions';
const SCENE_VISUAL_KEY='omega.r2023.livingSceneVisual';

type Props={onNavigate:(panel:string)=>void};
type Snapshot={missions:HybridMission[];scene:any;binding:any};
const parse=<T,>(key:string,fallback:T):T=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
const read=():Snapshot=>({missions:parse<HybridMission[]>(MISSION_KEY,[]),scene:parse<any>(SCENE_VISUAL_KEY,null),binding:parse<any>(R208_SNAPSHOT_KEY,null)});

export default function MissionWorldContinuityR206({onNavigate}:Props){
 const[state,setState]=useState<Snapshot>(()=>read());
 const[renderLineage,setRenderLineage]=useState<any>(null);
 useEffect(()=>{const refresh=()=>setState(read());window.addEventListener(R206_MISSION_EVENT,refresh as EventListener);window.addEventListener(R2023_EVENT,refresh as EventListener);window.addEventListener(R208_EVENT,refresh as EventListener);window.addEventListener('storage',refresh);return()=>{window.removeEventListener(R206_MISSION_EVENT,refresh as EventListener);window.removeEventListener(R2023_EVENT,refresh as EventListener);window.removeEventListener(R208_EVENT,refresh as EventListener);window.removeEventListener('storage',refresh)}},[]);
 const view=useMemo(()=>{const current=state.missions[state.missions.length-1]||null;const chain=buildMissionContinuity(state.missions);const anchor=chain[chain.length-1]||null;const scene=state.scene;const binding=state.binding?.missionId===current?.id?state.binding:null;const sceneBound=Boolean(scene?.eventAccepted);const renderReady=Boolean(scene?.renderInputReady);const proof=current?.returnPacket?.proof_status||'NO_MISSION';const route=current?.adapter||'UNASSEMBLED';return{current,anchor,scene,sceneBound,renderReady,proof,route,binding}},[state]);
 useEffect(()=>{let alive=true;if(!view.current||!view.anchor){setRenderLineage(null);return()=>{alive=false}};void compileRenderIntentLineageR211({mission:view.current,anchor:view.anchor,binding:view.binding,scene:view.scene}).then(receipt=>{if(alive)setRenderLineage(receipt)}).catch(()=>{if(alive)setRenderLineage(null)});return()=>{alive=false}},[view.current,view.anchor,view.binding,view.scene]);
 if(!view.current||!view.anchor)return <section className='r206-world-mission' data-state='EMPTY' aria-label='Living world mission continuity'><div className='r206-world-mission-icon'><GitBranch/></div><div><small>R206 · MISSION → ONE WORLD CONTINUITY</small><b>No mission continuity anchor yet</b><span>Compile an intent in Hybrid Mission Control. The canonical world remains unchanged until evidence and proof arrive.</span></div><button onClick={()=>onNavigate('Hybrid Link')}>Open Hybrid</button></section>;
 const held=view.proof==='PROOF_REQUIRED'||view.anchor.status==='HELD_FOR_PROOF';
 const stateLabel=held?'PROOF HELD':view.sceneBound?'WORLD BOUND':'MISSION ASSEMBLED';
 const durableLabel=view.binding?`${view.binding.state} · ${String(view.binding.operationSha256||'').slice(0,12)}`:'WORLD-HEAD BINDING PENDING';
 const renderLabel=renderLineage?.state==='RENDER_INTENT_LINEAGE_READY'?`R211 READY · ${String(renderLineage.lineageSha256).slice(0,12)}`:`R211 HELD${renderLineage?.missing?.length?` · ${renderLineage.missing.join('/')}`:''}`;
 return <section className='r206-world-mission' data-state={held?'HELD':view.sceneBound?'BOUND':'ASSEMBLED'} aria-label='Living world mission continuity'>
  <div className='r206-world-mission-icon'><Sparkles/></div>
  <div className='r206-world-mission-copy'><small>R204 → R206 → R208 → R211 · INTENT · WORLD · PRE-RENDER LINEAGE</small><b>{stateLabel} · {view.current.command}</b><span><Route/> {view.route} · continuity {view.anchor.carryHash} · scar {view.anchor.scarCarry.toFixed(3)} · return {view.anchor.returnCarry.toFixed(3)}</span><em>{durableLabel} · {view.sceneBound?'Evidence-bound scene attached':'Scene evidence not attached'} · R122 {view.renderReady?'INPUT READY':'HELD'} · {renderLabel} · COMPUTED PHOTOREAL REALITY UNPROVEN</em></div>
  <div className='r206-world-mission-proof'><ShieldCheck/><span>{view.proof}</span><span>World R134 · persist R149/R97</span><span>Canon R125 only</span><span>Federation receipt-gated</span></div>
  <button onClick={()=>onNavigate('Hybrid Link')}><GitBranch/>Inspect mission</button>
 </section>;
}
