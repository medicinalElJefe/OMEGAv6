import {useMemo,useState} from 'react';
import {Activity,Dna,Layers3,ShieldCheck,Trash2,Upload} from 'lucide-react';
import {corpusState,decodeAddress} from './corpusRuntime';
import {BIO_CONTEXT_LAYERS_R281,BIO_DOMAINS_R281,BIO_SCALE_LEVELS_R281,compileBioInstrumentFrameR281,parseBioInstrumentTextR281,type BioInstrumentSampleR281} from './bioInstrumentRuntimeR281';
import {compileBioAllModesFabricR281} from './bioAllModesFabricR281';
import BioModeWorkbenchR284 from './BioModeWorkbenchR284';
import BioMedicalProductionPanelR282 from './BioMedicalProductionPanelR282';
import './bioInstrumentR281.css';

type Props={address:number;onAddress?:(n:number)=>void};
const polar=(cx:number,cy:number,r:number,a:number)=>({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});
const fmt=(n:number,d=3)=>Number.isFinite(n)?n.toFixed(d):'—';
const qualityLabel=(q:string)=>q.replaceAll('_',' ');

export default function BioInstrumentSurfaceR281({address,onAddress}:Props){
 const c=useMemo(()=>decodeAddress(address),[address]),record=useMemo(()=>corpusState(address),[address]);
 const[samples,setSamples]=useState<BioInstrumentSampleR281[]>([]),[scale,setScale]=useState(0),[layer,setLayer]=useState(()=>Math.max(0,Math.min(11,c.l))),[domain,setDomain]=useState(()=>Math.max(0,Math.min(11,c.d))),[error,setError]=useState('');
 const frame=useMemo(()=>compileBioInstrumentFrameR281(record,samples),[record,samples]);
 const allModeFabric=useMemo(()=>compileBioAllModesFabricR281(record),[record]);
 const selectedLayer=frame.atlas.layers[layer],selectedDomain=frame.atlas.domains[domain];
 const handleFile=async(file?:File)=>{if(!file)return;try{const text=await file.text();const parsed=parseBioInstrumentTextR281(text,file.name);setSamples(parsed);setError(parsed.length?'':`No measurement rows were parsed from ${file.name}.`)}catch(e:any){setError(String(e?.message||e));setSamples([])}};
 const modeMarks=frame.allModes.overlays;
 const model=frame.model.metrics;
 const activeAddress=(domain*1728)+(c.p*144)+(c.r*12)+layer;
 const commitAxes=(d:number,l:number)=>{setDomain(d);setLayer(l);if(onAddress)onAddress((d*1728)+(c.p*144)+(c.r*12)+l)};
 const centerParticles=useMemo(()=>Array.from({length:Math.max(9,42-scale*4)},(_,i)=>{const a=i*2.399963229728653+(c.p+1)*.11,r=5+((i*11+c.r*3)%30)*(1-scale*.07);return{...polar(50,50,r,a),s:.7+((i+c.l)%4)*.35}}),[scale,c]);
 return <section className='bio281' aria-label='Heavy Bio instrument and all-mode visualization'>
  <header className='bio281-head'>
   <div><span>R284 · S10 BIOLOGICAL TRAVERSAL · MEDICAL-PRODUCTION + MODE EXPERIENCE</span><h3>Heavy Bio Instrument Surface</h3><p>Measured channels, calibration uncertainty, 20,736 Heavy Bio addressing, 12 domains, 12 context layers, seven physical scales, all 241 analytical channels, and R282 medical-production controls remain explicitly separated on one proof-aware surface.</p></div>
   <div className='bio281-state' data-state={frame.readiness}><b>{frame.readiness.replaceAll('_',' ')}</b><small>clinical authority · {frame.clinicalAuthority.replaceAll('_',' ')}</small></div>
  </header>

  <div className='bio281-kpis'>
   <article><span>INSTRUMENT READY</span><b>{frame.measurement.instrumentReady}</b><small>{frame.measurement.supplied} supplied · {frame.measurement.rejected} rejected</small></article>
   <article><span>ANALYTICAL CHANNELS</span><b>{allModeFabric.total}</b><small>{allModeFabric.sourceCatalogCount} source + {allModeFabric.canonAuthorityCount} canon · measurement authority 0</small></article>
   <article><span>HEAVY BIO ADDRESS</span><b>{activeAddress+1}</b><small>20,736 materialized · 61,917,364,224 projected</small></article>
   <article><span>MODEL DECISION</span><b>{model.decision}</b><small>canon model · not an instrument reading</small></article>
   <article><span>PROVENANCE</span><b>{frame.measurement.provenanceHash}</b><small>measurement-frame fingerprint</small></article>
  </div>

  <div className='bio281-main'>
   <div className='bio281-visual'>
    <div className='bio281-svg-wrap'>
     <svg viewBox='0 0 100 100' role='img' aria-label='Twelve Heavy Bio layers, twelve biological domains, instrument measurements, and sixty-two canon mode overlays'>
      <defs><radialGradient id='bio281core'><stop offset='0' stopOpacity='.42'/><stop offset='.52' stopOpacity='.12'/><stop offset='1' stopOpacity='0'/></radialGradient></defs>
      <circle className='bio281-core-glow' cx='50' cy='50' r='39' fill='url(#bio281core)'/>
      {BIO_CONTEXT_LAYERS_R281.map((_,i)=><circle key={`ring-${i}`} className={i===layer?'bio281-ring active':'bio281-ring'} cx='50' cy='50' r={12+i*2.72}/>) }
      {BIO_DOMAINS_R281.map((_,i)=>{const a=-Math.PI/2+i*Math.PI*2/12,p1=polar(50,50,11,a),p2=polar(50,50,44,a);return <line key={`ray-${i}`} className={i===domain?'bio281-ray active':'bio281-ray'} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}/>})}
      {centerParticles.map((p,i)=><circle key={`p-${i}`} className='bio281-particle' cx={p.x} cy={p.y} r={p.s}/>) }
      {frame.measurement.samples.filter(x=>x.quality!=='REJECTED').map((x,i)=>{const a=-Math.PI/2+(x.domain-1)*Math.PI*2/12,r=12+(x.layer-1)*2.72,p=polar(50,50,r,a);return <g key={`m-${x.id}-${i}`}><circle className={`bio281-measure ${x.quality.toLowerCase()}`} cx={p.x} cy={p.y} r='1.35'/><circle className='bio281-measure-u' cx={p.x} cy={p.y} r={1.8+Math.min(2.2,x.relativeExpandedUncertainty==null?1:x.relativeExpandedUncertainty*4)}/></g>})}
      {modeMarks.map((m,i)=>{const a=-Math.PI/2+i*Math.PI*2/modeMarks.length,p1=polar(50,50,45.5,a),p2=polar(50,50,45.5+Math.max(.7,m.experimentalWeight*3.1),a);return <line key={`mode-${m.id}`} className={`bio281-mode-mark ${m.realization.toLowerCase()}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}/>})}
      <circle className='bio281-center' cx='50' cy='50' r='7.7'/><text x='50' y='48.8' textAnchor='middle'>{BIO_SCALE_LEVELS_R281[scale]}</text><text className='small' x='50' y='53' textAnchor='middle'>MODEL + MEASURED</text>
     </svg>
     <div className='bio281-legend'><span><i className='instrument'/>instrument-ready</span><span><i className='research'/>research/calibration</span><span><i className='model'/>62-mode canon ring</span></div>
    </div>

    <div className='bio281-scale-rail'>{BIO_SCALE_LEVELS_R281.map((x,i)=><button key={x} className={scale===i?'active':''} onClick={()=>setScale(i)}><b>{x}</b><small>{i===0?'whole system':i===1?'functional structure':i===2?'cooperating field':i===3?'bounded living unit':i===4?'intracellular structure':i===5?'chemical scale':'atomic constituent'}</small></button>)}</div>
   </div>

   <aside className='bio281-side'>
    <section><header><Dna/><div><b>BIO DOMAIN</b><small>{selectedDomain.name.replaceAll('_',' ')}</small></div></header><div className='bio281-domain-grid'>{BIO_DOMAINS_R281.map((x,i)=><button key={x} className={domain===i?'active':''} onClick={()=>commitAxes(i,layer)}><span>{i+1}</span>{x.replaceAll('_',' ')}</button>)}</div></section>
    <section><header><Layers3/><div><b>HEAVY BIO LAYER</b><small>{selectedLayer.name.replaceAll('_',' ')}</small></div></header><div className='bio281-layer-grid'>{BIO_CONTEXT_LAYERS_R281.map((x,i)=><button key={x} className={layer===i?'active':''} onClick={()=>commitAxes(domain,i)}><span>L{String(i+1).padStart(2,'0')}</span>{x.replaceAll('_',' ')}</button>)}</div></section>
   </aside>
  </div>

  <section className='bio281-ingest'>
   <header><Upload/><div><b>LOCAL INSTRUMENT PACKET INGEST</b><small>JSON/CSV · values stay in this browser state · no patient identity required</small></div><label>Load JSON/CSV<input type='file' accept='.json,.csv,application/json,text/csv' onChange={e=>handleFile(e.target.files?.[0])}/></label>{samples.length>0&&<button onClick={()=>{setSamples([]);setError('')}}><Trash2/>Clear</button>}</header>
   {error&&<p className='bio281-error'>{error}</p>}
   {!samples.length?<div className='bio281-empty'><Activity/><div><b>No instrument packet loaded.</b><span>The full atlas remains visible, but measurements are intentionally empty. Model/canon state is never disguised as a device reading.</span></div></div>:
   <div className='bio281-table-wrap'><table><thead><tr><th>Variable</th><th>Domain / layer</th><th>Observed</th><th>Corrected ± expanded U</th><th>Calibration</th><th>Quality</th><th>Device / source</th></tr></thead><tbody>{frame.measurement.samples.map(x=><tr key={x.id} data-quality={x.quality}><td><b>{x.variable}</b><small>{x.observedAt}</small></td><td>{BIO_DOMAINS_R281[x.domain-1].replaceAll('_',' ')}<small>{BIO_CONTEXT_LAYERS_R281[x.layer-1].replaceAll('_',' ')}</small></td><td>{fmt(x.rawValue)} {x.unit}</td><td>{fmt(x.correctedValue)} ± {fmt(x.expandedUncertainty)} {x.unit}<small>k={fmt(x.coverageFactor,1)} · u={fmt(x.standardUncertainty)}</small></td><td>{x.calibrationState}<small>{x.calibration?.standard||'standard not declared'}</small></td><td><b>{qualityLabel(x.quality)}</b><small>{[...x.errors,...x.warnings].join(' · ')||'checks passed'}</small></td><td>{x.device.id}<small>{x.source}</small></td></tr>)}</tbody></table></div>}
  </section>

  <div className='bio281-proof-grid'>
   <section><header><ShieldCheck/><div><b>MEASUREMENT / MODEL SEPARATION</b><small>{frame.separation.rule}</small></div></header><dl><div><dt>Observed</dt><dd>{frame.separation.observed}</dd></div><div><dt>Derived</dt><dd>{frame.separation.derived}</dd></div><div><dt>Model</dt><dd>{frame.separation.model}</dd></div></dl></section>
   <section><header><Activity/><div><b>CANON MODEL CHANNEL</b><small>visible but never substituted for device data</small></div></header><div className='bio281-model-bars'>{Object.entries(model).filter(([k])=>k!=='decision').map(([k,v])=><div key={k}><span>{k}</span><i><b style={{width:`${Math.max(1,Number(v)*100)}%`}}/></i><strong>{fmt(Number(v))}</strong></div>)}</div></section>
  </div>

  <BioModeWorkbenchR284 record={record} instrumentReady={frame.measurement.instrumentReady} instrumentSupplied={frame.measurement.supplied}/>
  <BioMedicalProductionPanelR282 record={record} samples={samples}/>

  <details className='bio281-modes'><summary>ALL 62 CANON MODES · analytical overlay ledger <span>{frame.allModes.count} canon authorities</span></summary><div>{modeMarks.map(m=><article key={m.id}><code>{String(m.id).padStart(2,'0')}</code><span><b>{m.name}</b><small>{m.realization} · {m.basis}</small></span><strong>{fmt(m.activation)}<small>measurement authority {m.measurementAuthority}</small></strong></article>)}</div></details>

  <footer className='bio281-boundary'><ShieldCheck/><span>{frame.truthBoundary} R284 adds a truth-bound 241-channel educational/interaction layer while R282 retains intended-use, risk, validation, audit and authorization gates. Mode exploration cannot create measurement, diagnosis, treatment authority, regulatory clearance or clinical authorization.</span></footer>
 </section>
}
