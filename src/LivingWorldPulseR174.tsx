import {useEffect,useState} from 'react';
import {Activity,ArrowRight,Earth,Link2,ShieldCheck} from 'lucide-react';
import {R173_EVENT} from './world/federationLedgerWorldObserverR173.js';
import {projectFederationWorldVisualR174} from './world/livingWorldPulseR174.js';
import './livingWorldPulseR174.css';

type Pulse={eventAccepted:boolean;worldId:string|null;ledgerHead:string|null;stage:string;nextStage:string|null;federationClosed:boolean;truthBand:string;lod:number|null;sampleBudget:number|null;scarCount:number;routingTarget:string|null;dispatchAuthorized:boolean;claims:{pcOnlineProved:boolean;solverValidityProved:boolean;computedPhotorealRealityProved:boolean}};
type Props={onNavigate:(panel:string)=>void};
const EMPTY:Pulse={eventAccepted:false,worldId:null,ledgerHead:null,stage:'NONE',nextStage:null,federationClosed:false,truthBand:'AWAITING_VERIFIED_LEDGER_EVENT',lod:null,sampleBudget:null,scarCount:0,routingTarget:null,dispatchAuthorized:false,claims:{pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false}};

export default function LivingWorldPulseR174({onNavigate}:Props){
 const[pulse,setPulse]=useState<Pulse>(()=>{try{const raw=localStorage.getItem('omega.r174.worldPulse');return raw?{...EMPTY,...JSON.parse(raw)}:EMPTY}catch{return EMPTY}});
 useEffect(()=>{
  const receive=(event:Event)=>{
   const next=projectFederationWorldVisualR174((event as CustomEvent).detail) as Pulse;
   if(!next.eventAccepted)return;
   setPulse(next);
   try{localStorage.setItem('omega.r174.worldPulse',JSON.stringify(next))}catch{}
  };
  window.addEventListener(R173_EVENT,receive as EventListener);
  return()=>window.removeEventListener(R173_EVENT,receive as EventListener);
 },[]);
 const state=pulse.federationClosed?'CLOSED RECEIPT CHAIN':pulse.stage==='NONE'?'AWAITING VERIFIED LEDGER EVENT':`${pulse.stage} VERIFIED`;
 return <section className='r174-pulse' aria-label='Living canonical world pulse' data-closed={pulse.federationClosed?'true':'false'}>
  <div className='r174-pulse-title'><Activity/><span><b>LIVING WORLD</b><small>R173 → R174 · evidence-visible, authority-preserving</small></span></div>
  <div className='r174-pulse-state'><span>FEDERATION</span><b>{state}</b><small>{pulse.nextStage?`NEXT ${pulse.nextStage}`:'No unverified next membrane'} · {pulse.truthBand}</small></div>
  <div className='r174-pulse-metrics'><span><b>{pulse.scarCount}</b><small>SCARS</small></span><span><b>{pulse.lod??'—'}</b><small>LOD</small></span><span><b>{pulse.sampleBudget??'—'}</b><small>SAMPLES</small></span></div>
  <div className='r174-pulse-truth'><ShieldCheck/><span><b>PROOF BOUND</b><small>PC {pulse.claims.pcOnlineProved?'PROVED':'UNPROVEN'} · SOLVER {pulse.claims.solverValidityProved?'PROVED':'UNPROVEN'} · PHOTOREAL {pulse.claims.computedPhotorealRealityProved?'PROVED':'UNPROVEN'}</small></span></div>
  <div className='r174-pulse-actions'><button onClick={()=>onNavigate('Evidence & Proof')}><ShieldCheck/>Proof</button><button onClick={()=>onNavigate('Hybrid Link')}><Link2/>Hybrid</button><button onClick={()=>onNavigate('Earth Now')}><Earth/>Earth</button><button onClick={()=>onNavigate('Convergence')}>World <ArrowRight/></button></div>
 </section>;
}
