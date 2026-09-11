import {useMemo,useState} from 'react';
import {Activity,ChartNoAxesCombined,Database,ShieldCheck,Trash2,Upload} from 'lucide-react';
import {BIO_CONTEXT_LAYERS_R281,BIO_DOMAINS_R281} from './bioInstrumentRuntimeR281';
import {compileBioEmpiricalConvergenceR281,parseBioEmpiricalTextR281,type BioEmpiricalCaseR281} from './bioEmpiricalConvergenceR281';
import {summarizeEmpiricalEvidenceRegistryR281} from './bioEmpiricalEvidenceRegistryR281';
import './bioEmpiricalConvergenceR281.css';

const fmt=(x:number|null|undefined,d=4)=>x==null||!Number.isFinite(x)?'—':Number(x).toFixed(d);
const pct=(x:number|null|undefined)=>x==null||!Number.isFinite(x)?'—':`${(x*100).toFixed(2)}%`;
const polar=(cx:number,cy:number,r:number,a:number)=>({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});

export default function BioEmpiricalConvergenceR281(){
 const[cases,setCases]=useState<BioEmpiricalCaseR281[]>([]),[error,setError]=useState('');
 const frame=useMemo(()=>compileBioEmpiricalConvergenceR281(cases),[cases]);
 const evidence=useMemo(()=>summarizeEmpiricalEvidenceRegistryR281(),[]);
 const handleFile=async(file?:File)=>{if(!file)return;try{const rows=parseBioEmpiricalTextR281(await file.text(),file.name);setCases(rows);setError(rows.length?'':`No empirical cases parsed from ${file.name}.`)}catch(e:any){setError(String(e?.message||e));setCases([])}};
 const holdout=frame.summaries.holdout,candidate=frame.candidate,strongest=evidence.strongestHeldOut;
 return <section className='bio281-empirical' aria-label='Heavy Bio empirical convergence and recursive calibration'>
  <header className='bio281-empirical-head'>
   <div><span>R281 · EMPIRICAL CONVERGENCE · RECURSIVE CALIBRATION</span><h3>Heavy Bio Empirical Perfection Loop</h3><p>Verified reference observations are invariant carry. Model and baseline residuals become scar/history carry. FIT may propose a calibration transform; untouched HOLDOUT must prove it; PROSPECTIVE data keeps testing it as evidence accumulates.</p></div>
   <strong data-status={frame.status}>{frame.status.replaceAll('_',' ')}</strong>
  </header>

  <div className='bio281-empirical-kpis'>
   <article><span>ACCEPTED CASES</span><b>{frame.accepted}</b><small>{frame.rejected} rejected · {frame.supplied} supplied</small></article>
   <article><span>HOLDOUT MODEL MAE</span><b>{fmt(holdout.mae)}</b><small>baseline {fmt(holdout.baselineMae)}</small></article>
   <article><span>HOLDOUT LIFT</span><b>{pct(holdout.lift)}</b><small>{holdout.wins} wins · {holdout.losses} losses · {holdout.ties} ties</small></article>
   <article><span>CANDIDATE HOLDOUT MAE</span><b>{fmt(candidate.holdout.mae)}</b><small>vs current {pct(candidate.holdout.liftVsCurrent)}</small></article>
   <article><span>PROMOTION</span><b>{candidate.promotable?'HOLDOUT PASS':'HELD'}</b><small>measurement authority 0</small></article>
  </div>

  <section className='bio281-empirical-evidence' aria-label='Immutable historical empirical evidence receipts'>
   <header><Database/><div><b>ESTABLISHED EMPIRICAL EVIDENCE RECEIPTS</b><small>append-only archive anchors · prior wins and failures remain visible through later calibration cycles</small></div><strong>{evidence.counts.total} receipts</strong></header>
   {strongest&&<div className='bio281-empirical-anchor'>
    <div><span>STRONGEST HELD-OUT ARCHIVE RESULT</span><b>{strongest.title}</b><small>{strongest.scope}</small></div>
    <dl><div><dt>rows</dt><dd>{strongest.sampleCount}</dd></div><div><dt>train / test</dt><dd>{strongest.trainCount} / {strongest.testCount}</dd></div><div><dt>MAE</dt><dd>{fmt(strongest.modelValue,6)}</dd></div><div><dt>baseline MAE</dt><dd>{fmt(strongest.baselineValue,6)}</dd></div><div><dt>improvement</dt><dd>{pct(strongest.improvement)}</dd></div></dl>
    <p>{strongest.recordedState}</p>
   </div>}
   <div className='bio281-empirical-receipts'>{evidence.receipts.map(x=><article key={x.id} data-verdict={x.verdict} data-evidence-class={x.evidenceClass}>
    <code>{x.evidenceClass}</code><span><b>{x.title}</b><small>{x.sourceArtifact} · {x.scope}</small></span><strong>{x.verdict.replaceAll('_',' ')}<small>{x.modelValue!=null?`${x.metric}: ${fmt(x.modelValue,6)}${x.baselineValue!=null?` · baseline ${fmt(x.baselineValue,6)}`:''}`:x.recordedState}</small></strong>
   </article>)}</div>
   <footer>{evidence.rule}</footer>
  </section>

  <div className='bio281-empirical-main'>
   <div className='bio281-empirical-field'>
    <svg viewBox='0 0 100 100' role='img' aria-label='Twelve Heavy Bio domains by twelve context layers with empirical residual marks'>
     <circle className='emp-core' cx='50' cy='50' r='42'/>
     {BIO_CONTEXT_LAYERS_R281.map((_,i)=><circle key={`l-${i}`} className='emp-ring' cx='50' cy='50' r={11+i*2.75}/>) }
     {BIO_DOMAINS_R281.map((_,i)=>{const a=-Math.PI/2+i*Math.PI*2/12,p1=polar(50,50,9,a),p2=polar(50,50,44,a);return <line key={`d-${i}`} className='emp-ray' x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}/>})}
     {frame.residuals.map((x,i)=>{const a=-Math.PI/2+(x.domain-1)*Math.PI*2/12,r=11+(x.layer-1)*2.75,p=polar(50,50,r,a),mag=Math.min(2.2,.7+Math.abs(x.deltaAbsError));return <g key={`${x.id}-${i}`} data-winner={x.winner}><circle className={`emp-point ${x.winner.toLowerCase()}`} cx={p.x} cy={p.y} r={mag}/><line className='emp-residual' x1={p.x} y1={p.y} x2={p.x+Math.max(-4,Math.min(4,x.modelResidual))} y2={p.y}/></g>})}
     <circle className='emp-center' cx='50' cy='50' r='7.5'/><text x='50' y='49' textAnchor='middle'>RESIDUAL</text><text className='small' x='50' y='53' textAnchor='middle'>SCAR LEDGER</text>
    </svg>
    <div className='bio281-empirical-legend'><span><i className='model-win'/>model lower error</span><span><i className='base-win'/>baseline lower error</span><span><i className='tie'/>tie</span></div>
   </div>

   <aside className='bio281-empirical-side'>
    <section><header><ChartNoAxesCombined/><div><b>CALIBRATION CANDIDATE</b><small>fit partition only · never auto-promoted</small></div></header><code>y* = {fmt(candidate.slope,6)} · ŷ + {fmt(candidate.offset,6)}</code><dl><div><dt>FIT N</dt><dd>{candidate.fitN}</dd></div><div><dt>HOLDOUT N</dt><dd>{candidate.holdout.n}</dd></div><div><dt>candidate lift vs current</dt><dd>{pct(candidate.holdout.liftVsCurrent)}</dd></div><div><dt>candidate lift vs baseline</dt><dd>{pct(candidate.holdout.liftVsBaseline)}</dd></div></dl></section>
    <section><header><Activity/><div><b>WOVEN CONTINUITY</b><small>empirical calibration cycle</small></div></header><ol><li><b>Partition</b><span>{frame.wovenContinuity.partition}</span></li><li><b>Exchange / transform</b><span>{frame.wovenContinuity.exchangeTransform}</span></li><li><b>Invariant carry</b><span>{frame.wovenContinuity.invariantCarry}</span></li><li><b>Scar carry</b><span>{frame.wovenContinuity.scarCarry}</span></li><li><b>Re-contextualize</b><span>{frame.wovenContinuity.recontextualize}</span></li></ol></section>
   </aside>
  </div>

  <section className='bio281-empirical-ingest'>
   <header><Upload/><div><b>EMPIRICAL BENCHMARK / CALIBRATION PACKET</b><small>JSON/CSV · observed + predicted + baseline + FIT/HOLDOUT/PROSPECTIVE</small></div><label>Load empirical packet<input type='file' accept='.json,.csv,application/json,text/csv' onChange={e=>handleFile(e.target.files?.[0])}/></label>{cases.length>0&&<button onClick={()=>{setCases([]);setError('')}}><Trash2/>Clear</button>}</header>
   {error&&<p className='bio281-empirical-error'>{error}</p>}
   {!cases.length?<div className='bio281-empirical-empty'><Activity/><div><b>No new empirical comparison packet loaded.</b><span>Historical benchmark receipts remain visible above. The recursive convergence engine waits for row-level evidence rather than fabricating a calibration from summary metrics.</span></div></div>:
   <div className='bio281-empirical-table'><table><thead><tr><th>Variable</th><th>Partition</th><th>Observed</th><th>Model</th><th>Baseline</th><th>|e| Δ</th><th>Winner</th></tr></thead><tbody>{frame.residuals.map(x=><tr key={x.id} data-winner={x.winner}><td><b>{x.variable}</b><small>D{x.domain} · L{x.layer}</small></td><td>{x.partition}</td><td>{fmt(x.observed)} {x.unit}</td><td>{fmt(x.predicted)}<small>e={fmt(x.modelResidual)}</small></td><td>{fmt(x.baseline)}<small>e={fmt(x.baselineResidual)}</small></td><td>{fmt(x.deltaAbsError)}</td><td><b>{x.winner}</b></td></tr>)}</tbody></table></div>}
  </section>

  <details className='bio281-empirical-slices'><summary>12 DOMAIN + 12 LAYER PERFORMANCE SLICES <span>{frame.atlas.regressions.length} domain regressions visible</span></summary><div className='bio281-empirical-slice-grid'>{frame.atlas.domains.map(x=><article key={`d-${x.index}`} data-status={x.status}><code>D{String(x.index).padStart(2,'0')}</code><span><b>{x.name.replaceAll('_',' ')}</b><small>n={x.n} · MAE {fmt(x.mae)} · baseline {fmt(x.baselineMae)}</small></span><strong>{x.status.replaceAll('_',' ')}<small>lift {pct(x.lift)}</small></strong></article>)}{frame.atlas.layers.map(x=><article key={`l-${x.index}`} data-status={x.status}><code>L{String(x.index).padStart(2,'0')}</code><span><b>{x.name.replaceAll('_',' ')}</b><small>n={x.n} · MAE {fmt(x.mae)} · baseline {fmt(x.baselineMae)}</small></span><strong>{x.status.replaceAll('_',' ')}<small>lift {pct(x.lift)}</small></strong></article>)}</div></details>

  <footer className='bio281-empirical-boundary'><ShieldCheck/><span><b>Empirical recursive law:</b> {frame.equation}. {frame.truthBoundary} A successful domain benchmark becomes evidence for that scope and a calibration candidate; it is not allowed to erase failures in another domain.</span></footer>
 </section>
}
