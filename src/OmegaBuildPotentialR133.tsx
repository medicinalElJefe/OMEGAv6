import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,CheckCircle2,Filter,FlaskConical,PackageOpen,RefreshCw,RotateCcw,Search,ShieldCheck,Target,TriangleAlert,Wifi} from 'lucide-react';
import {api} from './platformAdapter';
import {BUILD_POTENTIAL_LANES_R133,BUILD_POTENTIAL_ROWS_R133,BUILD_POTENTIAL_LAWS_R133,type BuildPotentialLaneR133} from './buildPotentialRuntimeR133';
import {familyOperationalProofR134,familyOperationalProofSummaryR134,FAMILY_OPERATIONAL_PROOF_LAWS_R134} from './familyOperationalProofR134';
import './buildPotentialR133.css';

type Props={onNavigate:(panel:string)=>void;compact?:boolean};
type LaneFilter='ALL'|BuildPotentialLaneR133;
const LABEL:Record<BuildPotentialLaneR133,string>={OPERATING:'Operating now',PROVE_NEXT:'Prove next',RESTORE_NEXT:'Restore next',PRODUCTIZE_NEXT:'Productize next'};
const ICON:Record<BuildPotentialLaneR133,typeof Activity>={OPERATING:CheckCircle2,PROVE_NEXT:FlaskConical,RESTORE_NEXT:RotateCcw,PRODUCTIZE_NEXT:PackageOpen};
const TONE:Record<BuildPotentialLaneR133,string>={OPERATING:'operating',PROVE_NEXT:'prove',RESTORE_NEXT:'restore',PRODUCTIZE_NEXT:'productize'};
const proofTone=(state:string)=>state==='CURRENT_EXECUTION_PROOF'?'current':state==='CURRENT_SERVICE_OBSERVATION'?'observed':state==='GATE_CURRENTLY_HELD'?'held':state==='UNKNOWN'?'unknown':'declared';

export default function OmegaBuildPotentialR133({onNavigate,compact=false}:Props){
 const[lane,setLane]=useState<LaneFilter>('ALL'),[query,setQuery]=useState(''),[operational,setOperational]=useState<any>(null),[hybrid,setHybrid]=useState<any>(null),[proofBusy,setProofBusy]=useState(false),[proofError,setProofError]=useState('');
 const loadProof=async()=>{setProofBusy(true);try{const[o,h]=await Promise.all([api.get<any>('/api/system/operational'),api.get<any>('/api/hybrid/status')]);setOperational(o.data);setHybrid(h.data);setProofError('')}catch(e:any){setOperational(null);setHybrid(null);setProofError(e?.message||'Operational proof unavailable')}finally{setProofBusy(false)}};
 useEffect(()=>{void loadProof();const id=window.setInterval(()=>void loadProof(),15000);return()=>window.clearInterval(id)},[]);
 const proofSummary=useMemo(()=>familyOperationalProofSummaryR134(operational,hybrid),[operational,hybrid]);
 const q=query.trim().toLowerCase();
 const rows=useMemo(()=>BUILD_POTENTIAL_ROWS_R133.filter(x=>(lane==='ALL'||x.lane===lane)&&(!q||[x.family.id,x.family.name,x.family.status,x.family.statusNote,x.family.inventoryPurpose,x.family.target,x.lane,x.action,...x.planeLabels].join(' ').toLowerCase().includes(q))),[lane,q]);
 const open=(target:string,id:string)=>{try{localStorage.setItem('omega.r133.buildPotentialFamily',id)}catch{}onNavigate(target||'System Atlas')};
 return <section className={'r133-potential '+(compact?'compact':'full')}>
  <header className='r133-potential-head'><div><span>R134 LIVE PROOF + R133 BUILD POTENTIAL</span><h3>What works, what is gated, and what should be built next</h3><p>The declared 24-family execution status stays immutable while R134 overlays current operational evidence. A gate can therefore remain part of the architecture while also being shown as currently satisfied by real proof.</p></div><div className='r133-summary'>{BUILD_POTENTIAL_LANES_R133.map(x=><button key={x.lane} className={TONE[x.lane]} onClick={()=>setLane(lane===x.lane?'ALL':x.lane)} aria-pressed={lane===x.lane}><b>{x.count}</b><span>{LABEL[x.lane]}</span><small>{x.priority}</small></button>)}</div></header>
  <section className='r134-live-proof' aria-label='Current operational proof overlay'>
   <div className={proofSummary.pcOnlineProved?'current':'held'}><Wifi/><span><small>PC EXECUTION PROOF</small><b>{proofSummary.pcOnlineProved?'CURRENT AUTHENTICATED HEARTBEAT':'NOT CURRENTLY PROVED'}</b><em>{proofSummary.onlineDeviceCount} online non-revoked device{proofSummary.onlineDeviceCount===1?'':'s'}</em></span></div>
   <div className={proofSummary.operationalObserved?'observed':'unknown'}><Activity/><span><small>OPERATIONAL MATRIX</small><b>{proofSummary.operationalObserved?`${proofSummary.reachableCount}/${proofSummary.requiredCount} PROBES REACHABLE`:'UNAVAILABLE'}</b><em>canonical runtime · {proofSummary.canonicalRuntime}</em></span></div>
   <div><ShieldCheck/><span><small>PROOF AUTHORITY</small><b>OBSERVATION · NOT CANON</b><em>{proofSummary.observedAt||'no current observation timestamp'}</em></span></div>
   <button onClick={()=>void loadProof()} disabled={proofBusy}><RefreshCw className={proofBusy?'spin':''}/>{proofBusy?'CHECKING':'REFRESH PROOF'}</button>
  </section>
  {proofError&&<div className='r134-proof-error'><TriangleAlert/>{proofError} · missing runtime evidence remains unknown; declared family status is unchanged.</div>}
  <div className='r133-controls'><nav aria-label='Build potential lanes'><button className={lane==='ALL'?'active':''} onClick={()=>setLane('ALL')}><Filter/>ALL 24</button>{BUILD_POTENTIAL_LANES_R133.map(x=>{const I=ICON[x.lane];return <button key={x.lane} className={lane===x.lane?'active':''} onClick={()=>setLane(x.lane)}><I/>{LABEL[x.lane]} <b>{x.count}</b></button>})}</nav><label><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search family, gate, target, plane or development action…'/></label></div>
  <div className='r133-lane-law'>{BUILD_POTENTIAL_LANES_R133.filter(x=>lane==='ALL'||x.lane===lane).map(x=><article key={x.lane} className={TONE[x.lane]}><span>{x.priority} · {LABEL[x.lane].toUpperCase()}</span><p>{x.action}</p><small>{x.familyIds.join(' · ')}</small></article>)}</div>
  <div className='r133-family-grid'>{rows.map(row=>{const I=ICON[row.lane],proof=familyOperationalProofR134(row.family,operational,hybrid);return <article key={row.family.id} className={TONE[row.lane]}>
   <header><code>{row.family.id}</code><div><b>{row.family.name}</b><small>{row.family.role} · {row.family.status}</small></div><I/></header>
   <p>{row.family.inventoryPurpose}</p>
   <div className='r133-family-proof'><span>DECLARED FAMILY STATUS</span><b>{row.family.status.replaceAll('_',' ')}</b><small>{row.family.statusNote}</small></div>
   <div className={'r134-family-live '+proofTone(proof.state)}><span>CURRENT OPERATIONAL PROOF</span><b>{proof.label}</b><small>{proof.detail}</small><em>{proof.source}{proof.observedAt?` · ${proof.observedAt}`:''}</em></div>
   <div className='r133-family-next'><span>{row.priority} · NEXT DEVELOPMENT ACTION</span><p>{row.action}</p></div>
   <div className='r133-plane-list'>{row.planeLabels.map(x=><i key={x}>{x}</i>)}</div>
   <footer><button onClick={()=>open(row.family.target,row.family.id)}>OPEN {row.family.target||'System Atlas'} <ArrowRight/></button><small>{row.breadth} expression plane{row.breadth===1?'':'s'} · family registration ≠ execution</small></footer>
  </article>})}</div>
  {rows.length===0&&<div className='r133-empty'><TriangleAlert/><b>No family matches this filter.</b><span>Nothing was synthesized to fill the gap.</span></div>}
  <footer className='r133-truth'><ShieldCheck/><span><b>Authority boundary:</b> {BUILD_POTENTIAL_LAWS_R133.authority} {FAMILY_OPERATIONAL_PROOF_LAWS_R134.separation}. {FAMILY_OPERATIONAL_PROOF_LAWS_R134.reachability}.</span><Target/><small>Priority and current proof are organization/observation signals; neither can auto-promote evidence, scientific validity, native breadth, restoration completeness or CanonState.</small></footer>
 </section>;
}
