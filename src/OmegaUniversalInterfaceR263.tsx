import {useMemo,useState} from 'react';
import {BookOpen,ChevronDown,ChevronUp,Compass,Gamepad2,GraduationCap,Layers3,Play,Search,ShieldCheck,Sparkles,WandSparkles,Wrench} from 'lucide-react';
import {useOmegaExperienceR257,type OmegaExperienceDepthR257} from './OmegaExperienceContextR257';
import {activityDefinitionR263,OMEGA_ACTIVITIES_R263,OMEGA_PLANES_R263,OMEGA_REALITY_LAYERS_R263,resolveActivityR263,R263_TRUTH_CONTRACT,type OmegaActivityR263,type OmegaRealityLayerR263} from './omegaUniversalInterfaceR263';
import './omegaUniversalInterfaceR263.css';

type Props={onNavigate:(route:string)=>void};
const DEPTH_BY_EXPERIENCE:Record<string,OmegaExperienceDepthR257>={EXPLORE:'FOCUS',OPERATE:'ADVANCED',VISUALIZE:'FOCUS',ANALYZE:'ADVANCED',BUILD:'ADVANCED',PROVE:'FULL'};
const ICONS:Record<OmegaActivityR263,typeof Compass>={DISCOVER:Compass,UNDERSTAND:BookOpen,LEARN:GraduationCap,VISUALIZE:Layers3,COMPARE:Search,CREATE:WandSparkles,OPERATE:Wrench,PROVE:ShieldCheck,PLAY:Gamepad2};
export default function OmegaUniversalInterfaceR263({onNavigate}:Props){
 const{setExperienceProfile}=useOmegaExperienceR257();
 const[intent,setIntent]=useState('');
 const[activity,setActivity]=useState<OmegaActivityR263>('DISCOVER');
 const[layer,setLayer]=useState<OmegaRealityLayerR263>('REFERENCE');
 const[expanded,setExpanded]=useState(false);
 const active=useMemo(()=>activityDefinitionR263(activity),[activity]);
 const selectActivity=(id:OmegaActivityR263)=>{const next=activityDefinitionR263(id);setActivity(id);setLayer(next.defaultRealityLayer);setExperienceProfile(next.experience,DEPTH_BY_EXPERIENCE[next.experience]);};
 const routeIntent=()=>{const next=resolveActivityR263(intent);selectActivity(next.id);if(next.routes[0])onNavigate(next.routes[0]);};
 return <section className='r263-universal' aria-label='OMEGA universal activity interface' data-r263-authority={R263_TRUTH_CONTRACT.authority} data-r263-activity={activity} data-r263-layer={layer}>
  <div className='r263-intent-row'>
   <div className='r263-brand'><Sparkles aria-hidden='true'/><span><b>UNIVERSAL INTERFACE</b><small>intent → evidence → tools → experience → proof</small></span></div>
   <form onSubmit={e=>{e.preventDefault();routeIntent()}} role='search' className='r263-intent-form'>
    <label className='sr-only' htmlFor='r263-intent'>What do you want OMEGA to do?</label>
    <input id='r263-intent' value={intent} onChange={e=>setIntent(e.target.value)} placeholder='Show, teach, compare, build, operate, prove, create or play…' autoComplete='off'/>
    <button type='submit' disabled={!intent.trim()}><Play aria-hidden='true'/><span>Route intent</span></button>
   </form>
   <button type='button' className='r263-expand' aria-expanded={expanded} aria-controls='r263-universal-details' onClick={()=>setExpanded(x=>!x)}>{expanded?<ChevronUp/>:<ChevronDown/>}<span>{expanded?'Less':'More'}</span></button>
  </div>
  <nav className='r263-activities' aria-label='Activity modes'>{OMEGA_ACTIVITIES_R263.map(item=>{const Icon=ICONS[item.id];return <button type='button' key={item.id} className={activity===item.id?'active':''} aria-pressed={activity===item.id} onClick={()=>selectActivity(item.id)} title={item.description}><Icon/><span><b>{item.label}</b><small>{item.verb}</small></span></button>})}</nav>
  <div className='r263-active-row'>
   <div className='r263-active-summary'><b>{active.label}</b><span>{active.description}</span></div>
   <nav className='r263-route-row' aria-label={`${active.label} primary tools`}>{active.routes.map(route=><button type='button' key={route} onClick={()=>onNavigate(route)}>{route}</button>)}</nav>
   <div className='r263-classification'><span>DATA CLASS</span><select aria-label='Current information classification' value={layer} onChange={e=>setLayer(e.target.value as OmegaRealityLayerR263)}>{OMEGA_REALITY_LAYERS_R263.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
  </div>
  {expanded&&<div id='r263-universal-details' className='r263-details'>
   <section aria-label='Information classification'><header><b>Reality ↔ interpretation ↔ creation</b><span>The classification travels with the information. Changing the view does not change what the data is.</span></header><div className='r263-layer-grid'>{OMEGA_REALITY_LAYERS_R263.map(x=><button type='button' key={x.id} className={layer===x.id?'active':''} aria-pressed={layer===x.id} onClick={()=>setLayer(x.id)}><b>{x.label}</b><span>{x.description}</span></button>)}</div></section>
   <section aria-label='OMEGA interoperability planes'><header><b>Nine interoperating planes</b><span>One activity can cross evidence, knowledge, computation, action, creation and proof without becoming nine separate products.</span></header><div className='r263-plane-grid'>{OMEGA_PLANES_R263.map(x=><article key={x.id} className={active.planes.includes(x.id)?'active':''}><b>{x.label}</b><span>{x.description}</span></article>)}</div></section>
   <footer><ShieldCheck/><span><b>{R263_TRUTH_CONTRACT.law.replaceAll('_',' ')}</b><small>Routing can select an experience or tool surface. It cannot create execution, source-promotion, deployment or Canon authority.</small></span></footer>
  </div>}
 </section>;
}
