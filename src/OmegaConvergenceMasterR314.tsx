import {useMemo,useState} from 'react';
import {Activity,CheckCircle2,ChevronRight,GitBranch,Search,ShieldCheck,TriangleAlert} from 'lucide-react';
import {buildConvergenceMasterR314} from './convergenceMasterR314';
import './omegaConvergenceMasterR314.css';

const label=(value:string)=>value.replaceAll('_',' ');

export default function OmegaConvergenceMasterR314(){
 const master=useMemo(()=>buildConvergenceMasterR314(),[]);
 const [query,setQuery]=useState('');
 const q=query.trim().toLowerCase();
 const current=master.charts.current.filter(row=>!q||`${row.name} ${row.family} ${row.reality} ${row.purpose}`.toLowerCase().includes(q));
 const incomplete=master.charts.incomplete.filter(row=>!q||`${row.id} ${row.family} ${row.coverage} ${row.missing.join(' ')}`.toLowerCase().includes(q));
 const build=master.charts.build.filter(row=>!q||`${row.id} ${row.title} ${row.objective} ${row.sourceFamilies.join(' ')}`.toLowerCase().includes(q));
 const residual=master.residual;
 return <section className='r314-master' data-r314-convergence-master={master.revision}>
  <header className='r314-head'>
   <div><span>R314 · ONE SYSTEM · CURRENT → RESIDUAL → BUILD</span><h2>Convergence Master</h2><p>Three linked charts derived from the current capability authority and archive genome. No duplicated runtime authority and no revision-only progress.</p></div>
   <div className='r314-status'><ShieldCheck/><b>{residual.build.invalidDependencies.length?'GRAPH HOLD':'GRAPH COHERENT'}</b><small>{residual.build.total} ordered build stages</small></div>
  </header>
  <div className='r314-search'><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder='Search capabilities, archive debt, missing mechanics, or build stages'/></div>
  <div className='r314-kpis'>
   <article><span>Current surfaces</span><b>{residual.capability.total}</b><small>{residual.capability.active} active · {residual.capability.gated} truth/device/provider gated</small></article>
   <article><span>Archive families</span><b>{residual.archive.total}</b><small>{residual.archive.incomplete} not fully active · {residual.archive.priority1} priority-1 residuals</small></article>
   <article><span>Build graph</span><b>{residual.build.total}</b><small>{residual.build.invalidDependencies.length} invalid dependencies</small></article>
   <article><span>Residual pressure</span><b>{residual.archive.residualPressure}</b><small>deterministic scheduler pressure, not a scientific score</small></article>
  </div>

  <details className='r314-chart' open>
   <summary><span><Activity/>Chart 1 · What OMEGAv6 has now</span><b>{current.length}/{master.charts.current.length}</b></summary>
   <p className='r314-chart-intro'>Every canonical user-facing capability is represented exactly once with its implementation topology, proof boundary and current reality state.</p>
   <div className='r314-table-wrap'><table><thead><tr><th>#</th><th>Capability</th><th>Family</th><th>Reality</th><th>Boundary</th><th>Purpose</th></tr></thead><tbody>{current.map(row=><tr key={row.name}><td>{row.index}</td><td><b>{row.name}</b><small>{row.implementation}</small></td><td>{row.family}</td><td><span className={`r314-pill ${row.state.toLowerCase()}`}>{label(row.reality)}</span></td><td>{label(row.boundary)}</td><td>{row.purpose}</td></tr>)}</tbody></table></div>
  </details>

  <details className='r314-chart' open>
   <summary><span><TriangleAlert/>Chart 2 · What remains incomplete</span><b>{incomplete.length}/{master.charts.incomplete.length}</b></summary>
   <p className='r314-chart-intro'>Archive evidence is kept distinct from current implementation. Each row exposes exact missing mechanics, validation obligations and the truth boundary that must survive recovery.</p>
   <div className='r314-debt-grid'>{incomplete.map(row=><article key={row.id} className='r314-debt-card'>
    <header><code>{row.id}</code><span className={`r314-pill ${row.coverage.toLowerCase().replace('_','-')}`}>{label(row.coverage)}</span><b>P{row.priority}</b></header>
    <h3>{row.family}</h3><p>{row.connection}</p>
    <details><summary>Missing · {row.missing.length}</summary><ul>{row.missing.map(item=><li key={item}>{item}</li>)}</ul></details>
    <details><summary>Proof required · {row.validation.length}</summary><ul>{row.validation.map(item=><li key={item}>{item}</li>)}</ul></details>
    <small className='r314-boundary'>{row.boundary}</small>
   </article>)}</div>
  </details>

  <details className='r314-chart' open>
   <summary><span><GitBranch/>Chart 3 · Exact build sequence</span><b>{build.length}/{master.charts.build.length}</b></summary>
   <p className='r314-chart-intro'>A stage may advance only after its dependencies and proof gates are satisfied. Autonomous work is branch-isolated and must reduce evidenced residuals before it counts as progress.</p>
   <div className='r314-build-list'>{build.map(stage=><article key={stage.id} className='r314-build-stage'>
    <div className='r314-order'>{stage.order}</div><div className='r314-build-body'><header><code>{stage.id}</code><b>{stage.title}</b><span>{stage.automationClass}</span></header><p>{stage.objective}</p>
     <div className='r314-build-meta'><div><strong>Depends on</strong><small>{stage.dependsOn.length?stage.dependsOn.join(' · '):'root integrity gate'}</small></div><div><strong>Source families</strong><small>{stage.sourceFamilies.join(' · ')}</small></div><div><strong>Deliverables</strong><small>{stage.deliverables.join(' · ')}</small></div><div><strong>Proof gate</strong><small>{stage.proof.join(' · ')}</small></div></div>
    </div><ChevronRight className='r314-arrow'/>
   </article>)}</div>
  </details>

  <div className='r314-laws'><CheckCircle2/><div><b>Advancement contract</b><p>{master.laws.join(' · ')}</p></div></div>
 </section>;
}
