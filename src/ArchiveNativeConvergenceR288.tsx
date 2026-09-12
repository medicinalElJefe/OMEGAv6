import {useMemo,useState} from 'react';
import {Archive,CheckCircle2,Database,Download,Layers3,ShieldAlert,Waypoints} from 'lucide-react';
import {R288_ARCHIVE_NATIVE_CONVERGENCE,R288_DRIVE_AUTHORITIES,R288_EMERGING_OPERATORS,R288_FAMILY_CONVERGENCE,archiveNativeConvergenceReceiptR288,auditArchiveNativeConvergenceR288} from './archiveNativeConvergenceR288';
import {BLADE_GEOMETRY_R306_TRUTH,bladeGeometryDemoR306} from './bladeGeometryR306.js';
import './archiveNativeConvergenceR288.css';

const CURRENT_STATES=['ALL','WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE','EVIDENCE_GATED','DEVICE_GATED'] as const;
function downloadJson(name:string,value:any){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

export default function ArchiveNativeConvergenceR288(){
 const[state,setState]=useState<(typeof CURRENT_STATES)[number]>('ALL');
 const audit=useMemo(()=>auditArchiveNativeConvergenceR288(),[]);
 const blade=useMemo(()=>bladeGeometryDemoR306(),[]);
 const families=useMemo(()=>R288_FAMILY_CONVERGENCE.filter(x=>state==='ALL'||x.current===state),[state]);
 const counts=useMemo(()=>R288_FAMILY_CONVERGENCE.reduce<Record<string,number>>((out,x)=>{out[x.current]=(out[x.current]||0)+1;return out},{}),[]);
 return <section className='r288-convergence' aria-label='R288 archive native capability convergence'>
  <header className='r288-head'>
   <div><span>R288 · ARCHIVE-NATIVE CAPABILITY CONVERGENCE</span><h3>Drive corpus → current successor reality</h3><p>Recovered software, calculus and build authorities are bound to the current OMEGA successor ledger without allowing archive donors to become shadow runtime authority. Later source recovery is displayed as an explicit successor rather than silently rewriting the historical R288 ledger.</p></div>
   <button className='r288-download' onClick={()=>downloadJson('OMEGA_R288_R306_ARCHIVE_NATIVE_CONVERGENCE_RECEIPT.json',{historical:archiveNativeConvergenceReceiptR288(),successors:{bladeGeometry:{truth:BLADE_GEOMETRY_R306_TRUTH,demo:blade}}})}><Download/>Export convergence receipt</button>
  </header>
  <div className='r288-kpis'>
   <article><Database/><span>Drive authorities</span><b>{R288_DRIVE_AUTHORITIES.length}</b><small>directly re-read in R288</small></article>
   <article><Layers3/><span>Software families</span><b>{R288_FAMILY_CONVERGENCE.length}/24</b><small>{R288_ARCHIVE_NATIVE_CONVERGENCE.successor.executable} executable · {R288_ARCHIVE_NATIVE_CONVERGENCE.successor.gated} gated</small></article>
   <article><Waypoints/><span>System design</span><b>{R288_ARCHIVE_NATIVE_CONVERGENCE.inventory.systems}</b><small>{R288_ARCHIVE_NATIVE_CONVERGENCE.inventory.masterMenus} master menus · {R288_ARCHIVE_NATIVE_CONVERGENCE.inventory.routes} routes</small></article>
   <article>{audit.pass?<CheckCircle2/>:<ShieldAlert/>}<span>Convergence audit</span><b>{audit.pass?'PASS':'HOLD'}</b><small>179 source modes · 62 canon lenses · zero restoration debt</small></article>
  </div>
  <div className='r288-operator'>
   <div><b>MASTER OPERATOR</b><code>{R288_ARCHIVE_NATIVE_CONVERGENCE.operatorStack.operator}</code></div>
   <small>Address levels {R288_ARCHIVE_NATIVE_CONVERGENCE.operatorStack.addressLevels.join(' → ')} are representation/resolution levels, not literal physical dimensions.</small>
  </div>
  <div className='r288-source-grid'>
   {R288_DRIVE_AUTHORITIES.map(source=><article key={source.id}><header><Archive/><span><b>{source.id}</b><small>{source.state}</small></span></header><h4>{source.title}</h4><p>{source.scope}</p><div className='r288-tags'>{source.bindsTo.map(x=><span key={x}>{x}</span>)}</div><small className='r288-boundary'>{source.truthBoundary}</small></article>)}
  </div>
  <div className='r288-family-toolbar'><div><b>CURRENT SUCCESSOR REALITY</b><span>Historical predecessor status is retained as provenance; current successor proof controls this view.</span></div><label>STATE<select value={state} onChange={e=>setState(e.target.value as any)}>{CURRENT_STATES.map(x=><option key={x}>{x}</option>)}</select></label></div>
  <div className='r288-state-summary'>{Object.entries(counts).map(([k,v])=><span key={k}><b>{v}</b> {k}</span>)}</div>
  <div className='r288-family-grid'>
   {families.map(row=><article key={row.id} className={'r288-family '+(row.gated?'gated':'active')}><header><b>{row.id} · {row.name}</b><strong>{row.current}</strong></header><p>{row.proof}</p><dl><div><dt>SURFACE</dt><dd>{row.surface}</dd></div><div><dt>PREDECESSOR</dt><dd>{row.predecessor}</dd></div><div><dt>REMAINING</dt><dd>{row.remaining}</dd></div></dl></article>)}
  </div>
  {R288_EMERGING_OPERATORS.map(row=><aside className='r288-emerging' key={row.id}><ShieldAlert/><div><b>{row.id} · {row.state} @ R288</b><p>{row.reason}</p><small>{row.admission}</small></div></aside>)}
  <aside className='r288-emerging' data-r306-successor='BLADE_GEOMETRY'><CheckCircle2/><div><b>BLADE_GEOMETRY · FORMALIZED_BY_R306</b><p>Authoritative source was subsequently recovered from the project file corpus. R306 formalizes it as {BLADE_GEOMETRY_R306_TRUTH.authority}: generator/state space → legal transitions → invariant partition → symmetry/equivalence quotient → reduced objective → exact lift.</p><small>{BLADE_GEOMETRY_R306_TRUTH.boundary}</small></div></aside>
  <footer className='r288-truth'><CheckCircle2/><span>{R288_ARCHIVE_NATIVE_CONVERGENCE.boundary}</span></footer>
 </section>;
}
