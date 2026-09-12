import {useMemo,useState} from 'react';
import {ArchiveRestore,Download,Filter,Search,ShieldCheck,TriangleAlert} from 'lucide-react';
import {ARCHIVE_SCARS_R288} from './archiveGenomeLedgerR288c';
import {ARCHIVE_GENOME_CURRENT_R289,archiveGenomeCurrentSummaryR289} from './archiveGenomeLedgerR288d';
import type {ArchiveGenomeRowR288,RuntimeCoverageR288,PromotionClassR288} from './archiveGenomeLedgerR288';
import './archiveGenomeR288.css';

const COVERAGE:['ALL',...RuntimeCoverageR288[]]=['ALL','ACTIVE','PARTIAL','LEDGER_ONLY','ABSENT','GATED'];
const PROMOTION:['ALL',...PromotionClassR288[]]=['ALL','RECOVER_EXECUTOR','INGEST_TYPED_DATA','RECOVER_VISUAL_GRAMMAR','ADMIT_DEPENDENCY','PROOF_PROVENANCE','CROSS_VALIDATE','HOLD'];
const exportJson=(name:string,data:unknown)=>{const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
const text=(r:ArchiveGenomeRowR288)=>[r.id,r.family,...r.artifacts,r.origin,r.evidenceState,r.currentCoverage,r.omegaV6Connection,...r.missingDelta,r.promotionClass,...r.validation,r.boundary].join(' ').toLowerCase();

export default function ArchiveGenomeQueueR288({operators=false}:{operators?:boolean}){
 const [q,setQ]=useState(''),[coverage,setCoverage]=useState<'ALL'|RuntimeCoverageR288>('ALL'),[promotion,setPromotion]=useState<'ALL'|PromotionClassR288>('ALL'),[priorityOnly,setPriorityOnly]=useState(false);
 const current=archiveGenomeCurrentSummaryR289();
 const summary={...current,scars:ARCHIVE_SCARS_R288.length};
 const rows=useMemo(()=>[...ARCHIVE_GENOME_CURRENT_R289].filter(r=>(coverage==='ALL'||r.currentCoverage===coverage)&&(promotion==='ALL'||r.promotionClass===promotion)&&(!priorityOnly||r.priority===1)&&text(r).includes(q.trim().toLowerCase())).sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id)),[q,coverage,promotion,priorityOnly]);
 const receipt=()=>exportJson('OMEGA_R289_ARCHIVE_GENOME_RECEIPT.json',{schema:'OMEGA_ARCHIVE_GENOME_LEDGER_R289_CURRENT',generatedAt:new Date().toISOString(),summary,rows:[...ARCHIVE_GENOME_CURRENT_R289],scars:ARCHIVE_SCARS_R288,boundary:{archive:'Archive evidence is not execution, scientific, medical, device or production proof.',origin:'Third-party/dependency artifacts retain origin/version/license and never become OMEGA-original by archive presence.'}});
 return <section className='archive-genome-r288'>
  <header><div><span>R289.1 · ARCHIVE GENOME → OMEGAv6</span><h3>Upgrade Queue</h3><p>Drive-derived capability deltas, dependency boundaries, recovery scars and proof paths. Discovery does not grant execution authority.</p></div><button onClick={receipt}><Download/>Genome receipt</button></header>
  <div className='agr-summary'>{[['TYPED FAMILIES',summary.rows],['P1',summary.priority1],['ACTIVE',summary.active],['PARTIAL',summary.partial],['ABSENT',summary.absent],['GATED',summary.gated],['SCARS',summary.scars]].map(([k,v])=><div key={String(k)}><span>{k}</span><b>{v}</b></div>)}</div>
  <div className='agr-controls'><label><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder='Search archive family, artifact, delta or validation…'/></label><label><Filter/><select value={coverage} onChange={e=>setCoverage(e.target.value as any)}>{COVERAGE.map(x=><option key={x}>{x}</option>)}</select></label><select value={promotion} onChange={e=>setPromotion(e.target.value as any)}>{PROMOTION.map(x=><option key={x}>{x}</option>)}</select><button className={priorityOnly?'active':''} onClick={()=>setPriorityOnly(x=>!x)}>P1 only</button></div>
  <div className='agr-pipeline'><span>PRUNE</span><i>→</i><span>FINGERPRINT</span><i>→</i><span>ORIGIN</span><i>→</i><span>MAP</span><i>→</i><span>DIFF</span><i>→</i><span>RECOVER / ADAPT</span><i>→</i><span>TEST</span><i>→</i><span>PROVE</span><i>→</i><span>PROMOTE</span><i>→</i><span>RE-ARCHIVE</span></div>
  <div className='agr-grid'>{rows.map(r=><article key={r.id} className={`agr-card p${r.priority}`}><header><div><ArchiveRestore/><span><b>{r.id} · {r.family}</b><small>{r.origin} · {r.evidenceState}</small></span></div><strong>P{r.priority}</strong></header><div className='agr-badges'><em>{r.currentCoverage}</em><em>{r.promotionClass}</em></div><p>{r.omegaV6Connection}</p><details open={operators&&r.priority===1}><summary>Missing delta · {r.missingDelta.length}</summary><ul>{r.missingDelta.map(x=><li key={x}>{x}</li>)}</ul></details><details><summary>Validation · {r.validation.length}</summary><ul>{r.validation.map(x=><li key={x}>{x}</li>)}</ul></details><details><summary>Archive evidence · {r.artifacts.length}</summary><code>{r.artifacts.join('\n')}</code></details><footer><ShieldCheck/><span>{r.boundary}</span></footer></article>)}</div>
  {operators&&<section className='agr-scars'><header><TriangleAlert/><div><b>Failure-derived scar ledger</b><span>Historical failures become explicit regression obligations, never hidden donors.</span></div></header><div>{ARCHIVE_SCARS_R288.map(s=><article key={s.id}><b>{s.id} · {s.failureClass}</b><p>{s.lesson}</p><code>{s.regressionTest}</code><span>{s.status}</span></article>)}</div></section>}
 </section>;
}
