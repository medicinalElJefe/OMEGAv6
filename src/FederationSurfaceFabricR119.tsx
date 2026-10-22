import {ExternalLink,Layers3,MonitorCog,Network,ShieldCheck,Sparkles} from 'lucide-react';
import {fullSystemConvergenceR95} from './fullSystemConvergenceR95';
import './federationSurfaceFabricR119.css';

type Props={nodes:any;machine:any;runtime:any};

type Surface={
 id:string;
 label:string;
 url:string;
 className:string;
 verb:string;
 role:string;
 contributes:string[];
 truth:string;
 aliases?:string[];
 historical?:boolean;
 currentHumanSurface?:boolean;
};

export const OMEGA_SURFACES_R119:Surface[]=[
 {
  id:'omegav6',label:'OMEGAv6',url:'https://omegav6.jeffdeweyeljefe.workers.dev/',className:'CANONICAL_CONTROL',verb:'ADMIT',currentHumanSurface:true,
  role:'Primary operator product, global CanonState/proof authority, workflow router, archive/system atlas and evidence-bearing result surface.',
  contributes:['canonical state','proof ledger','44 operator destinations','100-system convergence authority','federation admission'],
  truth:'Only this role may globally ADMIT canonical state. Reachability alone never proves a native-PC action.'
 },
 {
  id:'genesis',label:'Genesis',url:'https://omega-genesis-v1.jeffdeweyeljefe.workers.dev/',className:'HUMAN_PROPOSAL_SURFACE',verb:'PROPOSE',currentHumanSurface:true,
  role:'Generative/constructive proposal surface. It expands intent into bounded candidate packets without becoming a second canonical state authority.',
  contributes:['candidate generation','geometry proposals','creative construction','intent expansion','proposal lineage'],
  truth:'Proposal output is candidate state, not proof and not admission. The R115 Genesis machine adapter is the bounded machine PROPOSE path; the human site remains a specialized working surface.'
 },
 {
  id:'sovereign',label:'Sovereign Convergence · historical',url:'https://omega-sovereign-convergence.foundasound.chatgpt.site/',className:'HISTORICAL_SOVEREIGN_SURFACE',verb:'SOLVE HISTORY',historical:true,currentHumanSurface:false,
  role:'Retained historical human-surface and design-lineage reference. It is not a current pairing endpoint, launcher authority, heartbeat origin or native execution transport.',
  contributes:['historical UI lineage','prior pairing design evidence','native-host design donor','rollback/reference evidence'],
  truth:'Current Sovereign execution exists only through the authenticated OMEGAv6 Hybrid/Sovereign transport. A fresh authenticated host heartbeat and returned receipt are required; this retired surface cannot satisfy either gate.'
 },
 {
  id:'optical',label:'Living Light / Optical',url:'https://omega-living-light-etching-private-woven2.vercel.app/',aliases:['https://omega-living-light-etching-private-woven2.vercel.app/?utm_source=chatgpt.com','https://omega-optical-cloud-woven2.vercel.app/'],className:'PROTECTED_DESIGN_SURFACE',verb:'SCREEN',currentHumanSurface:true,
  role:'Protected human optical-design surface for scalar screening, candidate inspection and fabrication-oriented progression toward full-wave validation.',
  contributes:['scalar optical screen','candidate ranking','light/etching design','Tier-2 RCWA request','fabrication boundary'],
  truth:'Scalar screening is reduced-order computation. The R115 Optical machine adapter supplies bounded machine SCREEN execution; full-wave RCWA/FDTD evidence and fabrication validation remain separate gates.'
 }
];

const stateFor=(id:string,nodes:any,machine:any,runtime:any)=>{
 if(id==='genesis')return String(machine?.genesis?.state||nodes?.genesis?.state||'UNVERIFIED');
 if(id==='optical')return String(machine?.optical?.state||nodes?.optical?.state||'UNVERIFIED');
 if(id==='sovereign')return `HISTORICAL_SURFACE · MACHINE ${String(runtime?.sovereign?.state||runtime?.pairing?.state||nodes?.sovereign?.state||'CURRENT_PROOF_REQUIRED')}`;
 if(id==='omegav6')return String(nodes?.v6?.state||nodes?.omegaV6?.state||'CANONICAL');
 return'UNVERIFIED';
};

export default function FederationSurfaceFabricR119({nodes,machine,runtime}:Props){
 const convergence=fullSystemConvergenceR95();
 return <section className='r119-surface-fabric' aria-label='OMEGA unified surface fabric'>
  <header><div><span>R120 · FULL OVERALL CANON SURFACE FABRIC</span><h3>Four roles. Three current human surfaces. One canonical instrument.</h3><p>OMEGAv6, Genesis and Living Light remain active specialized human surfaces. The Foundasound Sovereign page remains visible only as historical design evidence; current native execution is exclusively the authenticated OMEGAv6 Hybrid path. All four roles converge through the same packet, proof, route, continuity and admission laws.</p></div><div className='r119-surface-authority'><Network/><span><b>ONE PRODUCT</b><small>distributed execution · single admission authority</small></span></div></header>
  <div className='r119-surface-grid'>{OMEGA_SURFACES_R119.map(surface=>{const state=stateFor(surface.id,nodes,machine,runtime);return <article key={surface.id} data-surface={surface.id} data-historical={surface.historical?'true':'false'}>
   <div className='r119-surface-head'><span>{surface.id==='omegav6'?<ShieldCheck/>:surface.id==='sovereign'?<MonitorCog/>:surface.id==='optical'?<Layers3/>:<Sparkles/>}<i><b>{surface.label}</b><small>{surface.className}</small></i></span><strong>{surface.verb}</strong></div>
   <p>{surface.role}</p>
   <div className='r119-surface-state'><span>{surface.historical?'HISTORICAL / CURRENT MACHINE BOUNDARY':'OBSERVED FABRIC STATE'}</span><b>{state.replaceAll('_',' ')}</b></div>
   <div className='r119-surface-contrib'>{surface.contributes.map(x=><i key={x}>{x}</i>)}</div>
   {surface.aliases?.length?<small>Normalized surface: tracking/legacy aliases converge on this clean canonical human URL.</small>:null}
   <footer><small>{surface.truth}</small><a href={surface.url} target='_blank' rel='noreferrer'>{surface.historical?'Inspect historical surface':'Open surface'}<ExternalLink/></a></footer>
  </article>})}</div>
  <section className='r119-universe-strip'>
   <div><span>SOFTWARE UNIVERSE</span><b>{convergence.authority.totals.systems}</b><small>charted systems</small></div>
   <div><span>CAPABILITY FAMILIES</span><b>{convergence.authority.totals.families}</b><small>source families</small></div>
   <div><span>OPERATOR OPTIONS</span><b>{convergence.authority.totals.menuOptions}</b><small>menu options</small></div>
   <div><span>RECOVERED CAPABILITIES</span><b>{convergence.authority.totals.capabilities}</b><small>capability contracts</small></div>
   <div><span>MASTER MENUS</span><b>{convergence.authority.totals.masterMenus}</b><small>one-system hierarchy</small></div>
  </section>
  <footer className='r119-surface-boundary'><ShieldCheck/><span><b>R120 convergence boundary.</b> R114 still owns strict federation closure, R115 owns bounded Genesis/Optical machine adapters, R116 remains the proven cloud runtime spine, and R120 upgrades the user/connector/Full Overall Canon layer. Drive/archive data supplies design authority, donors and proofable contracts; live services supply current observations and execution. Human surfaces may specialize, but none may create a shadow CanonState, silently promote historical evidence to current truth, or bypass proof admission.</span></footer>
 </section>;
}