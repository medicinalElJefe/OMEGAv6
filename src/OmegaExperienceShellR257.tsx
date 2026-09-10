import {Compass,Focus,Layers3,Maximize2,Minimize2,RotateCcw,ShieldCheck} from 'lucide-react';
import type {ReactNode} from 'react';
import {useOmegaExperienceR257,type OmegaExperienceDepthR257} from './OmegaExperienceContextR257';
import {EXPERIENCE_TRUTH_CONTRACT_R257,OMEGA_EXPERIENCES_R257,experienceDefinitionR257} from './omegaExperienceShellR257';
import './omegaExperienceShellR257.css';

type Props={children:ReactNode;onNavigate:(route:string)=>void;onHome:()=>void;home:boolean};
const DEPTHS:readonly {id:OmegaExperienceDepthR257;label:string;copy:string}[]=[
 {id:'FOCUS',label:'Focus',copy:'task-first essentials'},
 {id:'ADVANCED',label:'Advanced',copy:'controls + context'},
 {id:'FULL',label:'Full',copy:'complete instrumentation'}
];
const persistLegacyView=(workspace:string,lens:string,depth:OmegaExperienceDepthR257)=>{try{localStorage.setItem('omega.r82.workspace',workspace);localStorage.setItem('omega.r82.homeProjection',lens);localStorage.setItem('omega.r132.depth',depth==='FOCUS'?'FOCUS':'DEEP')}catch{}};
export default function OmegaExperienceShellR257({children,onNavigate,onHome,home}:Props){
 const{experience,depth,immersive,setDepth,setImmersive,setExperienceProfile,reset}=useOmegaExperienceR257();
 const active=experienceDefinitionR257(experience);
 const choose=(id:typeof experience)=>{
  const next=experienceDefinitionR257(id);
  persistLegacyView(next.workspace,next.lens,next.defaultDepth);
  setExperienceProfile(id,next.defaultDepth);
 };
 const chooseDepth=(next:OmegaExperienceDepthR257)=>{persistLegacyView(active.workspace,active.lens,next);setDepth(next)};
 const resetAll=()=>{const next=experienceDefinitionR257('EXPLORE');persistLegacyView(next.workspace,next.lens,next.defaultDepth);reset()};
 return <div className={`r257-shell ${immersive?'immersive':''}`} data-r257-experience={experience} data-r257-depth={depth} data-r257-immersive={immersive?'true':'false'} data-r257-authority={EXPERIENCE_TRUTH_CONTRACT_R257.authority}>
  <div className='r257-truth-ribbon'><ShieldCheck/><b>SOURCE-BACKED VIEW</b><span>{EXPERIENCE_TRUTH_CONTRACT_R257.law.replaceAll('_',' ')}</span><small>Experience changes presentation and priority only. Proof, evidence class, execution authority and Canon admission do not change.</small></div>
  <header className='r257-experience-bar'>
   <button className='r257-home' onClick={onHome} aria-label='OMEGA Home'><Compass/><span><b>OMEGA EXPERIENCE</b><small>{active.label} · {active.copy}</small></span></button>
   <nav aria-label='Experience mode'>{OMEGA_EXPERIENCES_R257.map(x=><button key={x.id} aria-label={`Experience mode: ${x.label}`} aria-pressed={experience===x.id} className={experience===x.id?'active':''} onClick={()=>choose(x.id)} title={`${x.label}: ${x.copy}`}><b>{x.label}</b><small>{x.copy}</small></button>)}</nav>
   <div className='r257-shell-actions'><button onClick={()=>setImmersive(!immersive)} aria-pressed={immersive} aria-label={immersive?'Exit immersive experience':'Enter immersive experience'}>{immersive?<Minimize2/>:<Maximize2/>}<span>{immersive?'Exit immersive':'Immersive'}</span></button><button onClick={resetAll} aria-label='Reset experience preferences' title='Reset presentation preferences'><RotateCcw/></button></div>
  </header>
  <section className='r257-context-strip'>
   <div><span>{active.workspace} WORKSPACE</span><b>{active.lens} LENS</b></div>
   <nav aria-label={`${active.label} promoted tools`}>{active.routes.map(route=><button key={route} onClick={()=>onNavigate(route)}>{route}</button>)}<button className='all' onClick={()=>window.dispatchEvent(new CustomEvent('omega-r88-open-navigator',{detail:{layer:'APPLICATIONS'}}))}>All systems →</button></nav>
   <div className='r257-depth' aria-label='Presentation depth'><Focus/><span>DEPTH</span>{DEPTHS.map(x=><button key={x.id} aria-label={`Experience depth: ${x.label}`} aria-pressed={depth===x.id} className={depth===x.id?'active':''} onClick={()=>chooseDepth(x.id)} title={x.copy}>{x.label}</button>)}</div>
  </section>
  <main className='r257-stage' data-r257-stage={home?'HOME':'SPECIALIST'}>{children}</main>
  {immersive&&<div className='r257-immersive-dock'><Layers3/><span><b>{active.label}</b><small>{depth} · truth ribbon remains visible</small></span><button onClick={()=>setImmersive(false)}>Exit immersive</button></div>}
 </div>;
}
