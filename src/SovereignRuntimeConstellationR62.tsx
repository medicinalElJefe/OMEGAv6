import {useMemo,useState} from 'react';
import {ArrowRight,Orbit,ShieldCheck} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL,type CapabilityReality} from './capabilityAuthority';
import {OPERATIONAL_CAPABILITIES} from './operationalCapabilityRuntimeR45';
import './sovereignRuntimeConstellationR62.css';

type Props={record:any;onNavigate:(name:string)=>void;compact?:boolean};
type OperationalItem=(typeof OPERATIONAL_CAPABILITIES)[number];
type FamilyNode={id:string;items:OperationalItem[];dominant:CapabilityReality;angle:number;x:number;y:number};
const REALITY_RANK:Record<CapabilityReality,number>={RUNTIME_ACTIVE:0,SOURCE_ACTIVE:1,LOCAL_ACTIVE:2,EVIDENCE_GATED:3,PROVIDER_GATED:4,DEVICE_GATED:5,RESTORATION_DEBT:6,DONOR_ONLY:7};
const RADIUS:Record<CapabilityReality,number>={RUNTIME_ACTIVE:112,SOURCE_ACTIVE:112,LOCAL_ACTIVE:136,EVIDENCE_GATED:158,PROVIDER_GATED:178,DEVICE_GATED:178,RESTORATION_DEBT:196,DONOR_ONLY:196};
const cleanFamily=(id:string)=>id.replace(/^S/,'F');
export default function SovereignRuntimeConstellationR62({record,onNavigate,compact=false}:Props){
 const families=useMemo<FamilyNode[]>(()=>{const live=OPERATIONAL_CAPABILITIES.filter(x=>x.routable),map=new Map<string,OperationalItem[]>();for(const item of live){const arr=map.get(item.familyId)||[];arr.push(item);map.set(item.familyId,arr)}const groups=[...map.entries()].sort(([a],[b])=>a.localeCompare(b));return groups.map(([id,items],i)=>{const dominant=[...items].sort((a,b)=>REALITY_RANK[a.reality]-REALITY_RANK[b.reality])[0]?.reality||'SOURCE_ACTIVE';const angle=(Math.PI*2*i/groups.length)-Math.PI/2,r=RADIUS[dominant];return{id,items,dominant,angle,x:250+Math.cos(angle)*r,y:210+Math.sin(angle)*r}})},[]);
 const[selected,setSelected]=useState(()=>families[0]?.id||'S00');const active=families.find(x=>x.id===selected)||families[0];const m=record?.metrics||{};
 const continuity=Math.max(0,Math.min(1,Number(m.continuity||0))),pressure=Math.max(0,Math.min(1,(Number(m.contradiction||0)+Number(m.burden||0))/2));const coreSize=96+Math.round(continuity*22),pressureBlur=Math.round(pressure*24);
 return <section className={`r62-constellation ${compact?'compact':''}`}>
  <header><div><span>CANONICAL PACKET → CAPABILITY FIELD</span><h3>Operator Runtime Constellation</h3><p>One authoritative state surrounded by the real operational families it can address. Ring distance encodes execution boundary, not importance.</p></div><strong>{record?.metrics?.decision||'—'} · STATE {record?.stateId??'—'}</strong></header>
  <div className='r62-layout'><div className='r62-stage' style={{'--core-size':`${coreSize}px`,'--pressure-blur':`${pressureBlur}px`} as React.CSSProperties}>
   <svg viewBox='0 0 500 420' role='img' aria-label='Operational capability constellation derived from current OMEGA capability authority'>
    <circle className='r62-ring source' cx='250' cy='210' r='112'/><circle className='r62-ring local' cx='250' cy='210' r='136'/><circle className='r62-ring evidence' cx='250' cy='210' r='158'/><circle className='r62-ring external' cx='250' cy='210' r='178'/>
    {families.map(f=><line key={`l-${f.id}`} x1='250' y1='210' x2={f.x} y2={f.y} className={`r62-link reality-${f.dominant.toLowerCase()} ${selected===f.id?'active':''}`}/>) }
   </svg>
   <div className='r62-core' aria-label='Current canonical packet'><Orbit/><b>{record?.stateId??'—'}</b><span>{record?.metrics?.decision||'STATE'}</span><small>CΩ {Number(m.continuity||0).toFixed(2)} · Φ {Number(m.plasticity||0).toFixed(2)}</small></div>
   {families.map(f=><button key={f.id} className={`r62-node reality-${f.dominant.toLowerCase()} ${selected===f.id?'active':''}`} style={{left:`${f.x/5}%`,top:`${f.y/4.2}%`}} onClick={()=>setSelected(f.id)} aria-pressed={selected===f.id}><b>{cleanFamily(f.id)}</b><span>{f.items.length}</span><small>{CAPABILITY_REALITY_LABEL[f.dominant]}</small></button>)}
  </div>
  {active&&<aside className='r62-family-panel'><div className='r62-family-title'><span>{cleanFamily(active.id)} · {CAPABILITY_REALITY_LABEL[active.dominant]}</span><b>{active.items.length} operational capabilities</b><small>Dominant boundary is the closest execution class present in this family; every capability keeps its own explicit reality below.</small></div><div className='r62-family-list'>{active.items.map(x=><button key={x.name} onClick={()=>onNavigate(x.name)}><span className={`reality-${x.reality.toLowerCase()}`}>{CAPABILITY_REALITY_LABEL[x.reality]}</span><div><b>{x.name}</b><small>{x.output}</small></div><ArrowRight/></button>)}</div></aside>}
  </div>
  <footer><ShieldCheck/><span><b>Geometry truth:</b> family membership, node counts and launch targets come from the operational capability registry. Ring distance is a UI encoding of execution boundary. It does not create evidence, capability or physical dimensions.</span></footer>
 </section>
}
