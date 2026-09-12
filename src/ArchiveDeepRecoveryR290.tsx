import {useMemo,useState} from 'react';
import {Boxes,CheckCircle2,Download,GitBranch,Layers3,ShieldAlert,Waypoints} from 'lucide-react';
import {R290_DEEP_RECOVERY_BINDINGS,R291_PUBLIC_PROVENANCE_BOUNDARY,auditDeepArchiveRecoveryR290,deepArchiveRecoveryReceiptR290,type R290RecoveryState} from './archiveDeepRecoveryR290';
import './archiveDeepRecoveryR290.css';

const STATES:Array<'ALL'|R290RecoveryState>=['ALL','ACTIVE_SUCCESSOR','RECOVERABLE','DONOR_ONLY','DEVICE_GATED','EVIDENCE_GATED'];
function downloadJson(name:string,value:any){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

export default function ArchiveDeepRecoveryR290(){
 const[state,setState]=useState<(typeof STATES)[number]>('ALL');
 const[menu,setMenu]=useState('ALL');
 const audit=useMemo(()=>auditDeepArchiveRecoveryR290(),[]);
 const menus=useMemo(()=>['ALL',...new Set(R290_DEEP_RECOVERY_BINDINGS.map(x=>`${x.masterMenuId} · ${x.masterMenu}`))],[]);
 const rows=useMemo(()=>R290_DEEP_RECOVERY_BINDINGS.filter(x=>(state==='ALL'||x.state===state)&&(menu==='ALL'||`${x.masterMenuId} · ${x.masterMenu}`===menu)),[state,menu]);
 const counts=useMemo(()=>Object.fromEntries(STATES.slice(1).map(s=>[s,R290_DEEP_RECOVERY_BINDINGS.filter(x=>x.state===s).length])),[]);
 return <section className='r290-recovery' aria-label='R290 deep archive execution convergence' data-public-provenance={R291_PUBLIC_PROVENANCE_BOUNDARY}>
  <header className='r290-recovery-head'>
   <div><span>R290 · DEEP ARCHIVE EXECUTION CONVERGENCE</span><h3>Recovered lineage → correct menu → current successor → next proof</h3><p>Connected-archive recovery is projected into the existing 12-menu / 44-route OMEGA shell. This layer plans recovery and exposes public-safe provenance keys; connector storage locators remain external. It does not create a route owner, state writer, proof authority, dispatcher or deployment authority.</p></div>
   <button onClick={()=>downloadJson('OMEGA_R290_DEEP_ARCHIVE_RECOVERY_RECEIPT.json',deepArchiveRecoveryReceiptR290())}><Download/>Export R290 receipt</button>
  </header>
  <div className='r290-recovery-kpis'>
   <article><GitBranch/><span>Context bindings</span><b>{R290_DEEP_RECOVERY_BINDINGS.length}</b><small>deduplicated recovered families</small></article>
   <article><Waypoints/><span>Master-menu coverage</span><b>{new Set(R290_DEEP_RECOVERY_BINDINGS.map(x=>x.masterMenuId)).size}</b><small>existing recovered navigation only</small></article>
   <article><Layers3/><span>Archive artifacts</span><b>{R290_DEEP_RECOVERY_BINDINGS.reduce((n,x)=>n+x.driveArtifacts.length,0)}</b><small>public-safe artifact identities</small></article>
   <article className={audit.pass?'pass':'hold'}>{audit.pass?<CheckCircle2/>:<ShieldAlert/>}<span>Binding audit</span><b>{audit.pass?'PASS':'HOLD'}</b><small>{audit.pass?'no orphan menu/route/genome/provenance refs':'repair recovery binding before promotion'}</small></article>
  </div>
  <div className='r290-recovery-toolbar'>
   <label>STATE<select value={state} onChange={e=>setState(e.target.value as any)}>{STATES.map(x=><option key={x}>{x}</option>)}</select></label>
   <label>MASTER MENU<select value={menu} onChange={e=>setMenu(e.target.value)}>{menus.map(x=><option key={x}>{x}</option>)}</select></label>
   <div className='r290-recovery-counts'>{Object.entries(counts).map(([k,v])=><span key={k}><b>{v}</b>{k}</span>)}</div>
  </div>
  <div className='r290-recovery-grid'>
   {rows.map(row=><article key={row.id} className={`r290-recovery-card state-${row.state.toLowerCase()}`}>
    <header><div><Boxes/><span><b>{row.id}</b><small>{row.masterMenuId} · {row.masterMenu}</small></span></div><strong>{row.state}</strong></header>
    <h4>{row.family}</h4>
    <p className='r290-successor'><span>CURRENT SUCCESSOR</span>{row.successor}</p>
    <p>{row.executionIntent}</p>
    <div className='r290-route-row'>{row.routes.map(route=><span key={route}>{route}</span>)}</div>
    <details><summary>Archive provenance · {row.driveArtifacts.length}</summary><ul>{row.driveArtifacts.map(a=><li key={a.key}><b>{a.kind}</b><span>{a.title}</span><code>{a.key}</code></li>)}</ul></details>
    <details><summary>Next build · {row.nextBuild.length}</summary><ul>{row.nextBuild.map(x=><li key={x}>{x}</li>)}</ul></details>
    <details><summary>Proof required · {row.proofRequired.length}</summary><ul>{row.proofRequired.map(x=><li key={x}>{x}</li>)}</ul></details>
    {!!row.sourceGenomeIds.length&&<div className='r290-genome-row'><span>EXISTING GENOME</span>{row.sourceGenomeIds.map(x=><code key={x}>{x}</code>)}</div>}
    <small className='r290-boundary'>{row.boundary}</small>
   </article>)}
  </div>
  <footer className='r290-recovery-boundary'><ShieldAlert/><span>{audit.boundary}</span></footer>
 </section>;
}