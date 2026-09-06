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
};

export const OMEGA_SURFACES_R119:Surface[]=[
 {
  id:'omegav6',label:'OMEGAv6',url:'https://omegav6.jeffdeweyeljefe.workers.dev/',className:'CANONICAL_CONTROL',verb:'ADMIT',
  role:'Primary operator product, global CanonState/proof authority, workflow router, archive/system atlas and evidence-bearing result surface.',
  contributes:['canonical state','proof ledger','44 operator destinations','100-system convergence authority','federation admission'],
  truth:'Only this role may globally ADMIT canonical state. Reachability alone never proves a native-PC action.'
 },
 {
  id:'genesis',label:'Genesis',url:'https://omega-genesis-v1.jeffdeweyeljefe.workers.dev/',className:'HUMAN_PROPOSAL_SURFACE',verb:'PROPOSE',
  role:'Generative/constructive proposal surface. It expands intent into bounded candidate packets without becoming a second canonical state authority.',
  contributes:['candidate generation','geometry proposals','creative construction','intent expansion','proposal lineage'],
  truth:'Proposal output is candidate state, not proof and not admission.'
 },
 {
  id:'sovereign',label:'Sovereign Convergence',url:'https://omega-sovereign-convergence.foundasound.chatgpt.site/',className:'HOST_CONTROL_SURFACE',verb:'SOLVE / CONTROL',
  role:'Human-facing Sovereign bootstrap/control surface for pairing, launcher delivery and native-host workflows. Current authenticated PC heartbeat remains the execution truth.',
  contributes:['Windows bootstrap','pairing/control','native task handoff','RCWA worker bootstrap','local compute continuity'],
  truth:'The web surface is not itself native execution proof; a fresh authenticated host heartbeat and returned receipt are required.'
 },
 {
  id:'optical',label:'Living Light / Optical',url:'https://omega-living-light-etching-private-woven2.vercel.app/',className:'PROTECTED_DESIGN_SURFACE',verb:'SCREEN',
  role:'Protected human optical-design surface for scalar screening, candidate inspection and fabrication-oriented progression toward full-wave validation.',
  contributes:['scalar optical screen','candidate ranking','light/etching design','Tier-2 RCWA request','fabrication boundary'],
  truth:'Scalar screening is reduced-order computation. Full-wave RCWA/FDTD evidence and fabrication validation remain separate gates.'
 }
];

const stateFor=(id:string,nodes:any,machine:any,runtime:any)=>{
 if(id==='genesis')return String(machine?.genesis?.state||nodes?.genesis?.state||'UNVERIFIED');
 if(id==='optical')return String(machine?.optical?.state||nodes?.optical?.state||'UNVERIFIED');
 if(id==='sovereign')return String(runtime?.sovereign?.state||runtime?.pairing?.state||nodes?.sovereign?.state||'CURRENT_PROOF_REQUIRED');
 if(id==='omegav6')return String(nodes?.v6?.state||nodes?.omegaV6?.state||'CANONICAL');
 return'UNVERIFIED';
};

export default function FederationSurfaceFabricR119({nodes,machine,runtime}:Props){
 const convergence=fullSystemConvergenceR95();
 return <section className='r119-surface-fabric' aria-label='OMEGA unified surface fabric'>
  <header><div><span>R119 · FULL CONCEPTION SURFACE FABRIC</span><h3>Four experiences. One canonical instrument.</h3><p>The separate sites are retained for the jobs they do best, but they no longer imply separate products or competing state engines. Their outputs converge through the same packet, proof, route and admission laws already recovered from the software universe.</p></div><div className='r119-surface-authority'><Network/><span><b>ONE PRODUCT</b><small>distributed execution · single admission authority</small></span></div></header>
  <div className='r119-surface-grid'>{OMEGA_SURFACES_R119.map(surface=>{const state=stateFor(surface.id,nodes,machine,runtime);return <article key={surface.id} data-surface={surface.id}>
   <div className='r119-surface-head'><span>{surface.id==='omegav6'?<ShieldCheck/>:surface.id==='sovereign'?<MonitorCog/>:surface.id==='optical'?<Layers3/>:<Sparkles/>}<i><b>{surface.label}</b><small>{surface.className}</small></i></span><strong>{surface.verb}</strong></div>
   <p>{surface.role}</p>
   <div className='r119-surface-state'><span>OBSERVED FABRIC STATE</span><b>{state.replaceAll('_',' ')}</b></div>
   <div className='r119-surface-contrib'>{surface.contributes.map(x=><i key={x}>{x}</i>)}</div>
   <footer><small>{surface.truth}</small><a href={surface.url} target='_blank' rel='noreferrer'>Open surface<ExternalLink/></a></footer>
  </article>})}</div>
  <section className='r119-universe-strip'>
   <div><span>SOFTWARE UNIVERSE</span><b>{convergence.authority.totals.systems}</b><small>charted systems</small></div>
   <div><span>CAPABILITY FAMILIES</span><b>{convergence.authority.totals.families}</b><small>source families</small></div>
   <div><span>OPERATOR OPTIONS</span><b>{convergence.authority.totals.menuOptions}</b><small>menu options</small></div>
   <div><span>RECOVERED CAPABILITIES</span><b>{convergence.authority.totals.capabilities}</b><small>capability contracts</small></div>
   <div><span>MASTER MENUS</span><b>{convergence.authority.totals.masterMenus}</b><small>one-system hierarchy</small></div>
  </section>
  <footer className='r119-surface-boundary'><ShieldCheck/><span><b>Convergence boundary.</b> Drive/archive data supplies design authority, donors and proofable contracts; live services supply current observations and execution. Human surfaces may specialize, but none may create a shadow CanonState, silently promote historical evidence to current truth, or bypass proof admission.</span></footer>
 </section>;
}
