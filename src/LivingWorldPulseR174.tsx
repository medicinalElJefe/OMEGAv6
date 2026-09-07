import {useEffect,useState} from 'react';
import {Activity,ArrowRight,Earth,Link2,ShieldCheck} from 'lucide-react';
import {R173_EVENT} from './world/federationLedgerWorldObserverR173.js';
import {R175_R140_EVENT,projectMultiDomainLivingWorldTruthR175} from './world/multiDomainLivingWorldTruthR175.js';
import './livingWorldPulseR174.css';

type Bands={mission:string;earth:string;federation:string;hybrid:string;render:string};
type Pulse={eventAccepted:boolean;sourceRevision:string;worldId:string|null;operationRef:unknown;federationStage:string;nextFederationStage:string|null;federationClosed:boolean;truthBands:Bands;activeDomains:string[];lod:number|null;sampleBudget:number|null;scarCount:number;routingTarget:string|null;dispatchAuthorized:boolean;claims:{pcOnlineProved:boolean;solverValidityProved:boolean;computedPhotorealRealityProved:boolean}};
type Props={onNavigate:(panel:string)=>void};
const EMPTY:Pulse={eventAccepted:false,sourceRevision:'NONE',worldId:null,operationRef:null,federationStage:'NONE',nextFederationStage:null,federationClosed:false,truthBands:{mission:'NONE',earth:'UNPROVED',federation:'NONE',hybrid:'DEVICE_PROOF_REQUIRED',render:'NONE'},activeDomains:[],lod:null,sampleBudget:null,scarCount:0,routingTarget:null,dispatchAuthorized:false,claims:{pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false}};

export default function LivingWorldPulseR174({onNavigate}:Props){
 const[pulse,setPulse]=useState<Pulse>(EMPTY);
 useEffect(()=>{
  const receive=(event:Event)=>{
   const next=projectMultiDomainLivingWorldTruthR175((event as CustomEvent).detail) as Pulse;
   if(!next.eventAccepted)return;
   setPulse(next);
   try{localStorage.setItem('omega.r175.worldTruthSurface',JSON.stringify({...next,claims:{...next.claims,pcOnlineProved:false,computedPhotorealRealityProved:false}}))}catch{}
  };
  window.addEventListener(R173_EVENT,receive as EventListener);
  window.addEventListener(R175_R140_EVENT,receive as EventListener);
  return()=>{window.removeEventListener(R173_EVENT,receive as EventListener);window.removeEventListener(R175_R140_EVENT,receive as EventListener)};
 },[]);
 const federation=pulse.federationClosed?'CLOSED RECEIPT CHAIN':pulse.federationStage==='NONE'?'NO NEW FEDERATION RECEIPT':`${pulse.federationStage} VERIFIED`;
 const domains=`MISSION ${pulse.truthBands.mission} · EARTH ${pulse.truthBands.earth} · HYBRID ${pulse.truthBands.hybrid} · RENDER ${pulse.truthBands.render}`;
 return <section className='r174-pulse' aria-label='Living canonical world truth surface' data-closed={pulse.federationClosed?'true':'false'}>
  <div className='r174-pulse-title'><Activity/><span><b>LIVING WORLD</b><small>R140 + R173 → R175 · multi-domain evidence, one authority-preserving view</small></span></div>
  <div className='r174-pulse-state'><span>WORLD TRUTH · {pulse.sourceRevision}</span><b>{federation}</b><small>{pulse.nextFederationStage?`NEXT ${pulse.nextFederationStage} · `:''}{domains}</small></div>
  <div className='r174-pulse-metrics'><span><b>{pulse.scarCount}</b><small>SCARS</small></span><span><b>{pulse.lod??'—'}</b><small>LOD</small></span><span><b>{pulse.sampleBudget??'—'}</b><small>SAMPLES</small></span></div>
  <div className='r174-pulse-truth'><ShieldCheck/><span><b>PROOF BOUND</b><small>PC {pulse.claims.pcOnlineProved?'PROVED THIS EVENT':'UNPROVEN'} · SOLVER {pulse.claims.solverValidityProved?'PROVED':'UNPROVEN'} · PHOTOREAL {pulse.claims.computedPhotorealRealityProved?'DIRECT PROOF THIS EVENT':'UNPROVEN'}</small></span></div>
  <div className='r174-pulse-actions'><button onClick={()=>onNavigate('Evidence & Proof')}><ShieldCheck/>Proof</button><button onClick={()=>onNavigate('Hybrid Link')}><Link2/>Hybrid</button><button onClick={()=>onNavigate('Earth Now')}><Earth/>Earth</button><button onClick={()=>onNavigate('Convergence')}>World <ArrowRight/></button></div>
 </section>;
}
