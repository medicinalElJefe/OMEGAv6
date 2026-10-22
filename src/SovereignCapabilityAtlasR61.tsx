import {useMemo,useState} from 'react';
import {ArrowRight,Search,ShieldCheck} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL,type CapabilityReality} from './capabilityAuthority';
import {OPERATIONAL_CAPABILITIES} from './operationalCapabilityRuntimeR45';
import './sovereignCapabilityAtlasR61.css';

type Props={onNavigate:(name:string)=>void};
const ORDER:CapabilityReality[]=['RUNTIME_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE','EVIDENCE_GATED','PROVIDER_GATED','DEVICE_GATED'];
const META:Record<CapabilityReality,{title:string;copy:string}>={
 RUNTIME_ACTIVE:{title:'Live runtime',copy:'active runtime-owned execution'},
 SOURCE_ACTIVE:{title:'Source active',copy:'canonical packet/source execution'},
 LOCAL_ACTIVE:{title:'Local active',copy:'browser-local artifact or persistence execution'},
 EVIDENCE_GATED:{title:'Evidence gated',copy:'works only within returned evidence/proof authority'},
 PROVIDER_GATED:{title:'Provider gated',copy:'requires a live governed provider path'},
 DEVICE_GATED:{title:'Device gated',copy:'requires paired-host/device proof'},
 RESTORATION_DEBT:{title:'Restore',copy:'not primary-routable yet'},
 DONOR_ONLY:{title:'Donor',copy:'historical donor only'}
};
export default function SovereignCapabilityAtlasR61({onNavigate}:Props){
 const[q,setQ]=useState(''),[filter,setFilter]=useState<CapabilityReality|'ALL'>('ALL');
 const list=useMemo(()=>OPERATIONAL_CAPABILITIES.filter(x=>x.routable).filter(x=>filter==='ALL'||x.reality===filter).filter(x=>!q.trim()||`${x.name} ${x.familyId} ${x.output} ${x.proof}`.toLowerCase().includes(q.trim().toLowerCase())),[q,filter]);
 const counts=useMemo(()=>Object.fromEntries(ORDER.map(r=>[r,OPERATIONAL_CAPABILITIES.filter(x=>x.routable&&x.reality===r).length])),[]);
 return <section className='r61-capability-atlas'>
  <header><div><span>OPERATIONAL CAPABILITY AUTHORITY</span><h2>Capability Command Atlas</h2><p>Every launch below resolves to a registered routable capability and carries its real execution boundary. A route is never presented as proof of unavailable external execution.</p></div><strong>{OPERATIONAL_CAPABILITIES.filter(x=>x.routable).length} ROUTABLE</strong></header>
  <div className='r61-capability-tools'><label><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder='Search function, family, purpose or proof boundary'/></label><nav><button className={filter==='ALL'?'active':''} onClick={()=>setFilter('ALL')}>ALL</button>{ORDER.map(r=><button key={r} className={filter===r?'active':''} onClick={()=>setFilter(r)}>{CAPABILITY_REALITY_LABEL[r]} <small>{counts[r]}</small></button>)}</nav></div>
  <div className='r61-capability-grid'>{list.map(x=><button key={x.name} className={`reality-${x.reality.toLowerCase()}`} onClick={()=>onNavigate(x.name)}><span className='r61-capability-state'>{CAPABILITY_REALITY_LABEL[x.reality]}</span><div><b>{x.name}</b><small>{x.familyId} · {x.persistence} · {x.performance}</small><p>{x.output}</p></div><ArrowRight/></button>)}</div>
  {list.length===0&&<div className='r61-empty'>No routable capabilities match this filter.</div>}
  <footer><ShieldCheck/><span><b>Execution truth:</b> source/local capabilities can execute within their stated browser/runtime boundary. Evidence, provider and device capabilities remain gated until their required authority is present.</span></footer>
 </section>
}
