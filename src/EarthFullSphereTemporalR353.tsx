import{useEffect,useMemo,useState}from'react';
import{CircleDot,Clock3,Globe2,Orbit,ShieldCheck,Waypoints}from'lucide-react';
import'./earthFullSphereTemporalR353.css';

type Props={address:number;lat:number;lon:number;evidence:any};
type Lens='DODECAHEDRAL'|'OBSERVER'|'ANTIPODE';
const short=(x:string|null|undefined,n=12)=>x?x.slice(0,n):'—';
const fmt=(x:number,d=4)=>Number.isFinite(x)?Number(x).toFixed(d):'—';

export default function EarthFullSphereTemporalR353({address,lat,lon,evidence}:Props){
 const[tick,setTick]=useState(6),[lens,setLens]=useState<Lens>('DODECAHEDRAL'),[view,setView]=useState<any>(null),[error,setError]=useState('');
 const evidenceKey=useMemo(()=>String(evidence?.evidenceHash||'UNBOUND'),[evidence?.evidenceHash]);
 useEffect(()=>{
  let live=true;setError('');
  if(typeof Worker==='undefined'){setError('R353 worker unavailable; source Earth views remain unaffected.');return()=>{live=false}};
  const w=new Worker(new URL('./system/earthFullSphereTemporalWorkerR353.ts',import.meta.url),{type:'module'});
  w.onmessage=e=>{if(!live)return;if(e.data?.ok)setView(e.data.view);else setError(String(e.data?.error||'R353 compile failed'));w.terminate()};
  w.onerror=()=>{if(live)setError('R353 worker execution failed; no source imagery was substituted.');w.terminate()};
  w.postMessage({type:'COMPILE_R353',address,lat,lon,tick,evidence:{evidenceHash:evidence?.evidenceHash||null,verifiedAt:evidence?.verifiedAt||null}});
  return()=>{live=false;w.terminate()};
 },[address,lat,lon,tick,evidenceKey]);
 const points=view?.grammar?.points||[],edges=view?.grammar?.edges||[];
 const relation=view?.relation|| (tick<6?'HISTORY':tick===6?'NOW':'FORECAST');
 return <section className='earth-r353' data-r353-full-sphere='OMEGA_EARTH_FULL_SPHERE_TEMPORAL_CONVERGENCE_R353' data-r353-ready={view?'RETURNED':'DEFERRED'} data-r353-relation={relation}>
  <header><div><span>R353 · EARTH / FULL SPHERE / TEMPORAL CONVERGENCE</span><h3>Returned Earth context + WGS84 frame + deterministic model time + proof-bound Full Sphere grammar</h3><p>Existing Earth providers remain the observation authority. History/NOW/forecast below are R350 software/model states. Dodecahedral, antipode and precession/orbit motifs are representational donor grammar only.</p></div><ShieldCheck/></header>
  <div className='r353-controls'>
   <label><Clock3/><span>Model tick <b>{tick}</b></span><input aria-label='R353 model timeline tick' type='range' min='0' max='12' step='1' value={tick} onChange={e=>setTick(Number(e.target.value))}/></label>
   <label><Waypoints/><span>Full Sphere lens</span><select aria-label='R353 Full Sphere lens' value={lens} onChange={e=>setLens(e.target.value as Lens)}><option>DODECAHEDRAL</option><option>OBSERVER</option><option>ANTIPODE</option></select></label>
   <div className={'r353-relation '+String(relation).toLowerCase()}><b>{relation}</b><small>{relation==='FORECAST'?'MODEL PROJECTED · NOT OBSERVED':relation==='HISTORY'?'DETERMINISTIC REPLAY · NOT OBSERVED':'MODEL NOW · SOURCE CONTEXT SEPARATE'}</small></div>
  </div>
  <div className='r353-grid'>
   <article className='r353-sphere'>
    <svg viewBox='0 0 100 100' role='img' aria-label='Representational Full Sphere dodecahedral temporal grammar'>
     <circle cx='50' cy='50' r='43' className='r353-shell'/>
     <ellipse cx='50' cy='50' rx='43' ry='13' className='r353-orbit'/>
     {lens==='DODECAHEDRAL'&&edges.map((e:any,i:number)=>{const a=points[e.a],b=points[e.b];return a&&b?<line key={i} x1={a.screenX*100} y1={a.screenY*100} x2={b.screenX*100} y2={b.screenY*100} className='r353-edge'/>:null})}
     {lens==='DODECAHEDRAL'&&points.map((p:any)=><circle key={p.id} cx={p.screenX*100} cy={p.screenY*100} r={p.depth>0?1.3:.8} className={p.depth>0?'r353-node front':'r353-node'}/>)}
     {lens==='OBSERVER'&&<><line x1='50' y1='50' x2='82' y2='33' className='r353-vector'/><circle cx='82' cy='33' r='2.3' className='r353-target'/><text x='82' y='28'>observer frame</text></>}
     {lens==='ANTIPODE'&&<><circle cx='35' cy='38' r='2.6' className='r353-target'/><circle cx='65' cy='62' r='2.6' className='r353-antipode'/><line x1='35' y1='38' x2='65' y2='62' className='r353-vector'/><text x='31' y='33'>target</text><text x='60' y='70'>antipode</text></>}
    </svg>
    <div><span><Orbit/> REPRESENTATIONAL PHASE</span><b>{view?fmt(view.grammar.angleDeg,1)+'°':'compiling'}</b><small>R350 integer tick drives display grammar; this is not astronomical precession.</small></div>
   </article>
   <div className='r353-facts'>
    <article><Globe2/><span><small>WGS84 OBSERVER ROUND TRIP</small><b>{view?.proof?.wgs84RoundTrip?'PASS':'PENDING'}</b><em>{view?`lat Δ ${view.observerProof.latResidualDeg.toExponential(2)}° · lon Δ ${view.observerProof.lonResidualDeg.toExponential(2)}°`:'R284 projection proof compiling'}</em></span></article>
    <article><CircleDot/><span><small>TARGET / ANTIPODE</small><b>{view?`${fmt(view.target.lat,2)}°, ${fmt(view.target.lon,2)}°`:'—'}</b><em>{view?`antipode ${fmt(view.antipode.lat,2)}°, ${fmt(view.antipode.lon,2)}°`:'—'}</em></span></article>
    <article><Clock3/><span><small>FIELD IDENTITY</small><b>{view?short(view.selected.fieldHash,16):'compiling'}</b><em>{view?`tick ${view.tick} · checkpoint/replay SHA-256`:'20,736-address model state'}</em></span></article>
    <article><Waypoints/><span><small>MODEL SCENARIO SPREAD</small><b>{view?fmt(view.comparison.scenarioSpread,5):'—'}</b><em>not probability · not future observation</em></span></article>
    <article><ShieldCheck/><span><small>RETURNED SOURCE CONTEXT</small><b>{view?.source?.authority||'UNBOUND'}</b><em>{view?.source?.verifiedAt||'no verification timestamp returned'}</em></span></article>
    <article><ShieldCheck/><span><small>GPU/FRAME CORRESPONDENCE</small><b>{view?short(view.render.frameReceiptHash):'—'}</b><em>{view?`packet ${view.render.packetHash} · shader ${view.render.gpuPlanShaderHash}`:'R351/R352 proof context compiling'}</em></span></article>
   </div>
  </div>
  <div className='r353-timeline' aria-label='R353 checkpoint timeline'>{(view?.checkpointFrames||[]).map((f:any)=><span key={f.tick} className={f.relation.toLowerCase()} title={f.fieldHash}><i/><b>t{f.tick}</b><small>{f.relation}</small></span>)}</div>
  <footer><ShieldCheck/><span>{view?.boundary||'R353 compiles model-time representation only; existing Earth source surfaces remain authoritative.'}</span></footer>
  {error&&<div className='r353-error'>{error}</div>}
 </section>;
}
