import {useEffect,useMemo,useState} from 'react';
import {ArrowUpRight,Compass,Layers3,Orbit,Activity,ShieldCheck,Hexagon} from 'lucide-react';
import {menuCapabilitiesR512,quickActionsR512} from './capabilityMenuR512';
import {OMEGA7_CAPABILITIES,type Omega7Domain,type Omega7Capability} from './capabilityRegistry';

export const R519_VISUAL_NAVIGATION_SCHEMA='OMEGA_VISUAL_CAPABILITY_NAVIGATION_R519' as const;
const PRESENTATION:Record<Omega7Domain,{eyebrow:string;headline:string;description:string;glyph:string}>={
 HOME:{eyebrow:'THE FULL OMEGA FIELD',headline:'Every chamber has a purpose.',description:'From live traversal to historical systems: explore the actual capabilities carried by this runtime.',glyph:'Ω'},
 WORK:{eyebrow:'CONTINUITY OF WORK',headline:'Where your work keeps growing.',description:'Move between projects, memory and connected workspaces without losing the thread.',glyph:'W'},
 EXPLORE:{eyebrow:'ATLAS · PHASE · RELATIVITY',headline:'Explore the structure behind the view.',description:'Travel from planetary context into state spaces, geometry, phase motion, evidence and forecasts.',glyph:'Φ'},
 CREATE:{eyebrow:'VISUAL PROJECTION STUDIO',headline:'Give structure a living form.',description:'Bring existing rendering, creative instruments, visual data and outputs into one workspace.',glyph:'◈'},
 DEVELOP:{eyebrow:'RUNTIME · INTELLIGENCE · EXECUTION',headline:'Build the system that builds.',description:'Enter the available software, compute, integration and repair execution environments.',glyph:'Δ'},
 SYSTEM:{eyebrow:'PROOF · CANON · RECOVERY',headline:'Find the evidence behind each capability.',description:'Inspect the real authority, continuity ledger, system map and verification surfaces.',glyph:'Σ'}
};
function orbitPosition(index:number,length:number){
 const angle=-Math.PI/2+(2*Math.PI*index)/Math.max(1,length);
 return {left:String(50+35*Math.cos(angle))+'%',top:String(50+36*Math.sin(angle))+'%'};
}
export function R519VisualNavigation({domain,onNavigate}:{domain:Omega7Domain;onNavigate:(route:string)=>void}){
 const [selectedIndex,setSelectedIndex]=useState(0);
 useEffect(()=>setSelectedIndex(0),[domain]);
 const entries=useMemo(()=>{
  const preferred=quickActionsR512(domain);
  const used=new Set(preferred.map(cap=>cap.id));
  return [...preferred,...menuCapabilitiesR512(domain).filter(cap=>!used.has(cap.id))].slice(0,9);
 },[domain]);
 const available=domain==='HOME'?OMEGA7_CAPABILITIES:OMEGA7_CAPABILITIES.filter(x=>x.domain===domain);
 const ready=available.filter(x=>x.availability==='READY').length;
 const focus=entries[Math.min(selectedIndex,Math.max(entries.length-1,0))];
 const meta=PRESENTATION[domain];
 if(!focus)return null;
 return <section className={'o7-r519-portal o7-r519-'+domain.toLowerCase()} data-r519-visual-navigation={domain} aria-label={meta.eyebrow}>
  <header className='o7-r519-heading'>
   <div><span className='o7-r519-overline'><Compass size={13} aria-hidden='true'/> {meta.eyebrow}</span><h2>{meta.headline}</h2><p>{meta.description}</p></div>
   <div className='o7-r519-metrics'><span><strong>{available.length}</strong> inherited routes</span><span><strong>{ready}</strong> source-ready</span><span><strong>{available.length-ready}</strong> evidence / other states</span></div>
  </header>
  <div className='o7-r519-stage'>
   <div className='o7-r519-field' aria-label='Interactive map of real OMEGA capabilities'>
    <svg className='o7-r519-geometry' viewBox='0 0 500 500' role='img' aria-label='Capability navigation geometry; nodes represent existing routes, not measured physical states'>
     <defs>
      <radialGradient id={'o7-r519-wash-'+domain}><stop stopColor='#b89a68' stopOpacity='.17'/><stop offset='.58' stopColor='#4b94ac' stopOpacity='.055'/><stop offset='1' stopColor='#050b11' stopOpacity='0'/></radialGradient>
     </defs>
     <circle cx='250' cy='250' r='244' fill={'url(#o7-r519-wash-'+domain+')'}/>
     {[70,115,164,211].map((radius,i)=><circle key={'ring-'+i} cx='250' cy='250' r={radius} fill='none' stroke={i===2?'#c7a477':'#5c94a0'} strokeWidth={i===2?1.05:.7} strokeOpacity={i===2?.46:.22} strokeDasharray={i===1?'2 8':undefined}/>)}
     {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{
      const a=i*Math.PI/6;
      return <line key={'axis-'+i} x1={250+68*Math.cos(a)} y1={250+68*Math.sin(a)} x2={250+218*Math.cos(a)} y2={250+218*Math.sin(a)} stroke='#bb9a63' strokeOpacity='.13' strokeWidth='.75'/>;
     })}
     <path d='M250 84 L394 167 L394 333 L250 416 L106 333 L106 167 Z' fill='none' stroke='#c6a67b' strokeOpacity='.5' strokeWidth='1.25'/>
     <path d='M250 84 L250 416 M106 167 L394 333 M394 167 L106 333 M106 167 L394 167 M106 333 L394 333' fill='none' stroke='#83c3ca' strokeOpacity='.26' strokeWidth='.85'/>
     {entries.map((cap,i)=>{
      const a=-Math.PI/2+i*2*Math.PI/entries.length;
      const x=250+175*Math.cos(a),y=250+180*Math.sin(a);
      return <g key={cap.id}><path d={'M250 250 Q'+String(250+95*Math.cos(a+.28))+' '+String(250+95*Math.sin(a+.28))+' '+x+' '+y} fill='none' stroke={i===Math.min(selectedIndex,entries.length-1)?'#dfb980':'#78b4c3'} strokeWidth={i===selectedIndex?1.8:.65} strokeOpacity={i===selectedIndex?.85:.35}/><circle cx={x} cy={y} r={i===selectedIndex?7:4} stroke='#ecd4ae' strokeOpacity='.8' strokeWidth='1' fill={cap.availability==='READY'?'#c9ad82':'#496b75'} fillOpacity={i===selectedIndex?1:.7}/></g>;
     })}
     <circle cx='250' cy='250' r='57' fill='#070d14' fillOpacity='.9' stroke='#d6b783' strokeWidth='1' strokeOpacity='.76'/>
     <path d='M250 205 L289 228 L289 272 L250 295 L211 272 L211 228 Z M250 205 L250 295 M211 228 L289 272 M289 228 L211 272' fill='none' stroke='#a4d9d9' strokeWidth='.95' strokeOpacity='.68'/>
     <circle cx='250' cy='250' r='13' fill='#dcb678' fillOpacity='.17' stroke='#e2ba7c' strokeWidth='1.4'/>
    </svg>
    <div className='o7-r519-core' aria-hidden='true'>{meta.glyph}</div>
    {entries.map((cap,i)=><button key={cap.id} type='button' className={'o7-r519-node'+(i===selectedIndex?' active':'')} style={orbitPosition(i,entries.length)} data-r519-node={cap.legacyRoute} aria-pressed={i===selectedIndex} aria-label={'Focus '+cap.label} title={cap.label+' · '+cap.availability} onClick={()=>setSelectedIndex(i)} onFocus={()=>setSelectedIndex(i)}><span className='o7-r519-node-dot' aria-hidden='true'/><span className='o7-r519-node-name'>{cap.label}</span></button>)}
    <div className='o7-r519-field-caption'><Orbit size={13} aria-hidden='true'/> REAL ROUTES · INTERACTIVE CONSTELLATION</div>
   </div>
   <div className='o7-r519-inspector' data-r519-focus={focus.legacyRoute}>
    <span className='o7-r519-overline'><Activity size={13} aria-hidden='true'/> SELECTED CAPABILITY</span>
    <div className='o7-r519-inspector-symbol' aria-hidden='true'><Hexagon size={46} strokeWidth={1}/></div>
    <h3>{focus.label}</h3>
    <p>{focus.description}</p>
    <div className='o7-r519-feature-meta'><span>{focus.family}</span><span data-r519-evidence={focus.availability.toLowerCase()}>{focus.availability==='READY'?'Source ready':focus.availability==='HELD'?'Evidence gated':focus.availability.toLowerCase()}</span></div>
    <button type='button' className='o7-r519-launch' data-r519-launch={focus.legacyRoute} onClick={()=>onNavigate(focus.legacyRoute)}>Open {focus.label} <ArrowUpRight size={18}/></button>
    <small>Current executor: {focus.legacyRoute} · {focus.compatibility==='OMEGAV6_BRIDGE'?'V6 continuity bridge':'Current runtime'}</small>
    <div className='o7-r519-workflow'><Layers3 size={14} aria-hidden='true'/> Explore an instrument to inspect its real inputs, outputs and evidence.</div>
   </div>
  </div>
  <div className='o7-r519-rail' aria-label='Direct access to featured capabilities'>
   {entries.map(cap=><button key={cap.id} type='button' data-r519-direct={cap.legacyRoute} onClick={()=>onNavigate(cap.legacyRoute)}><span className='o7-r519-rail-glyph' aria-hidden='true'>◈</span><span>{cap.label}</span><ArrowUpRight size={13} aria-hidden='true'/></button>)}
  </div>
  <footer className='o7-r519-truth'><ShieldCheck size={14} aria-hidden='true'/> A navigation projection of existing capabilities. Geometry is illustrative; route readiness and execution proof remain independent.</footer>
 </section>;
}
