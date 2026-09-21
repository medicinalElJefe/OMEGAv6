import{useEffect,useMemo,useState}from'react';
import{Activity,Boxes,Clock3,Database,GitBranch,Globe2,RefreshCw,ShieldCheck,Waypoints}from'lucide-react';
import{compileUnifiedConvergenceR348,DEWEY_STAGE_POLICY_R348,FRAME_AUTHORITY_R348,R348_CORPUS_BINDINGS,R348_HISTORICAL_CORPUS_AUDIT,R348_MACHINE_LAYERS,R348_SOFTWARE_LEDGER_CENSUS}from'./system/unifiedConvergenceR348';
import{compileLiveSceneCorrelationR348}from'./system/liveSceneCorrelationR348';
import{getVisualCalibration,type VisualCalibration}from'./visualCalibration';
import{api}from'./platformAdapter';
import'./omegaUnifiedConvergenceR348.css';

type Props={record:any;status:any};
const pretty=(v:string)=>v.replaceAll('_',' ');
const fmt=(n:number)=>Number.isFinite(n)?n.toFixed(3):'—';

export default function OmegaUnifiedConvergenceR348({record,status}:Props){
 const address=Math.max(0,Math.min(20735,Math.floor(Number(record?.address??(Number(record?.stateId)-1))||0)));
 const[calibration,setCalibration]=useState<VisualCalibration|null>(null),[earth,setEarth]=useState<any>(null),[liveStatus,setLiveStatus]=useState<any>(status),[hybrid,setHybrid]=useState<any>(null),[liveError,setLiveError]=useState('');
 const seed=useMemo(()=>compileLiveSceneCorrelationR348(address,null,status,null,calibration),[address,status,calibration]);
 const refreshLive=async()=>{setLiveError('');const q=`/api/earth/evidence?lat=${seed.query.lat.toFixed(5)}&lon=${seed.query.lon.toFixed(5)}`;const rows=await Promise.allSettled([api.get<any>(q),api.get<any>('/api/status'),api.get<any>('/api/hybrid/status')]);if(rows[0].status==='fulfilled')setEarth(rows[0].value.data);if(rows[1].status==='fulfilled')setLiveStatus(rows[1].value.data);if(rows[2].status==='fulfilled')setHybrid(rows[2].value.data);const failed=rows.filter(x=>x.status==='rejected').length;if(failed)setLiveError(`${failed} live source${failed===1?'':'s'} unavailable · missing evidence remains HELD`)};
 useEffect(()=>{let active=true;getVisualCalibration().then(x=>{if(active)setCalibration(x)}).catch(e=>{if(active)setLiveError(e instanceof Error?e.message:String(e))});return()=>{active=false}},[]);
 useEffect(()=>{void refreshLive()},[address]);
 useEffect(()=>{const id=window.setInterval(()=>void refreshLive(),60_000);return()=>window.clearInterval(id)},[address]);
 const live=useMemo(()=>compileLiveSceneCorrelationR348(address,earth,liveStatus??status,hybrid,calibration),[address,earth,liveStatus,status,hybrid,calibration]);
 const packet=useMemo(()=>compileUnifiedConvergenceR348(record,liveStatus??status,live.physicalObservations),[record,liveStatus,status,live.physicalObservations]);
 const canon=packet.scene.find(x=>x.layer==='Canon')!,world=packet.scene.find(x=>x.layer==='World')!,system=packet.scene.find(x=>x.layer==='System')!;
 const rawMetrics=(canon.payload as any).metrics||{},cal=live.calibrated,metrics=cal?{continuity:cal.C,plasticity:cal.Phi,contradiction:cal.q,burden:cal.Lambda,scar:cal.scar,evidence:cal.evidence}:rawMetrics;
 return <section className='r348-unified' data-r348-convergence={packet.schema}>
  <header className='r348-head'><div><span>R348 · UNIFIED CONVERGENCE ENGINE · ONE STATE / THREE FRAMES / SEVEN SCENE LAYERS</span><h2>Canonical Scene Packet</h2><p>All recovered calculus, corpus, traversal, evidence and runtime capability now meet through one explicit packet contract. Correlation is allowed; silent conversion between model state, physical observation and system execution is not.</p></div><div className='r348-seal'><ShieldCheck/><b>BOUND</b><small>state {packet.stateId} · address {packet.address+1}/20,736 · world {world?.state??'HELD'}</small></div></header>

  <div className='r348-live-strip'>
   <article><Globe2/><span><small>LIVE QUERY CONTEXT</small><b>{live.query.lat.toFixed(3)}°, {live.query.lon.toFixed(3)}°</b><em>WGS84 query mapping only · not physical address identity</em></span></article>
   <article><Activity/><span><small>20,736-STATE CALIBRATION</small><b>{live.calibration?(`${live.calibration.channelCount} channels · ${live.calibration.passed?'PASS':'HOLD'}`):'COMPILING'}</b><em>p02→p98 source-relative normalization</em></span></article>
   <article><Clock3/><span><small>SOURCE CLOCKS</small><b>{live.clocks.filter(x=>x.bound).length}/{live.clocks.length} bound</b><em>observation/snapshot time ≠ model-route time</em></span></article>
   <article><Database/><span><small>PHYSICAL OBSERVATIONS</small><b>{live.physicalObservations.length} admitted</b><em>unit + source + time + evidence hash required</em></span></article>
   <article><Boxes/><span><small>HYBRID RETURN</small><b>{live.system.hybridState}</b><em>{live.system.deviceCount} returned device{live.system.deviceCount===1?'':'s'} · native claim {live.system.nativeExecutionClaimed?'YES':'NO'}</em></span></article>
   <button onClick={()=>void refreshLive()} title='Read-only refresh of Earth/runtime/Hybrid evidence'><RefreshCw/>Refresh live scene</button>
  </div>
  {liveError&&<div className='r348-live-error'>{liveError}</div>}

  <div className='r348-machine-spine'>{R348_MACHINE_LAYERS.map((x,i)=><span key={x}><small>{String(i+1).padStart(2,'0')}</small><b>{x}</b></span>)}</div>

  <div className='r348-frame-grid'>
   {Object.entries(FRAME_AUTHORITY_R348).map(([name,frame])=><article key={name} className={'r348-frame '+name.toLowerCase()}><header><span>{name}</span><b>{frame.coordinates}</b></header><p>{frame.authority}</p><small>{frame.boundary}</small></article>)}
  </div>

  <div className='r348-scene'>
   <div className='r348-scene-axis'><span>PHYSICAL</span><i/><span>CANONICAL</span><i/><span>SYSTEM</span></div>
   {packet.scene.map((layer,i)=><article key={layer.layer} data-frame={layer.frame} data-truth={layer.truthClass}>
    <div className='r348-layer-index'>{String(i+1).padStart(2,'0')}</div>
    <div><span>{layer.layer}</span><b>{layer.frame}</b><small>{pretty(layer.truthClass)}</small></div>
    <strong>{layer.state}</strong>
   </article>)}
  </div>

  <div className='r348-census'><article><Database/><span><small>HISTORICAL CORPUS AUDIT</small><b>{R348_HISTORICAL_CORPUS_AUDIT.filesAudited} artifacts · {R348_HISTORICAL_CORPUS_AUDIT.visibleMegabytes} MB</b><em>material instantiation confirmed · universal ontology unconfirmed</em></span></article><article><Boxes/><span><small>ONE-SYSTEM LEDGER</small><b>{R348_SOFTWARE_LEDGER_CENSUS.systems} systems · {R348_SOFTWARE_LEDGER_CENSUS.families} families</b><em>{R348_SOFTWARE_LEDGER_CENSUS.masterMenus} menus · {R348_SOFTWARE_LEDGER_CENSUS.routes} routes · inventory ≠ execution</em></span></article></div>

  <div className='r348-readout'>
   <article><Waypoints/><span><small>CONTINUITY CΩ</small><b>{fmt(metrics.continuity)}</b><em>structural persistence</em></span></article>
   <article><GitBranch/><span><small>FUTURE Φ</small><b>{fmt(metrics.plasticity)}</b><em>branch aperture · not probability</em></span></article>
   <article><Activity/><span><small>CONTRADICTION q</small><b>{fmt(metrics.contradiction)}</b><em>retained conflict pressure</em></span></article>
   <article><Boxes/><span><small>BURDEN Λ</small><b>{fmt(metrics.burden)}</b><em>constraint / compression</em></span></article>
   <article><Clock3/><span><small>SCAR</small><b>{fmt(metrics.scar)}</b><em>path/history carry</em></span></article>
   <article><Database/><span><small>EVIDENCE</small><b>{fmt(metrics.evidence)}</b><em>source/model support</em></span></article>
  </div>

  <div className='r348-policy'>
   <section><header><ShieldCheck/><div><span>DEWEY RECALIBRATION POLICY</span><b>B3 default · B0 fallback · B4–B6 gated</b></div></header><p>The supplied direct rerun rejects universal superiority. The runtime therefore selects by declared context and evidence instead of forcing a later stage merely because it is more elaborate.</p><div className='r348-stage-row'><span>REFERENCE KERNEL <b>{packet.deweyReferenceComputation.state}</b></span><span>SELECTED <b>{packet.deweyReferenceComputation.selectedStage??'—'}</b></span><span>B0 <b>{DEWEY_STAGE_POLICY_R348.B0.state}</b></span><span>B3 <b>{DEWEY_STAGE_POLICY_R348.B3.state}</b></span><span>B4 <b>{DEWEY_STAGE_POLICY_R348.B4.state}</b></span><span>B5 <b>{DEWEY_STAGE_POLICY_R348.B5.state}</b></span><span>B6 <b>{DEWEY_STAGE_POLICY_R348.B6.state}</b></span><span>FORECAST <b>{DEWEY_STAGE_POLICY_R348.forecast.state}</b></span></div></section>
   <section><header><Database/><div><span>FINGERPRINTED CORPUS</span><b>{R348_CORPUS_BINDINGS.length} bound source artifacts</b></div></header><div className='r348-sources'>{R348_CORPUS_BINDINGS.map(x=><div key={x.name}><b>{x.name}</b><code>{x.sha256.slice(0,16)}…</code><small>{pretty(x.role)}</small></div>)}</div></section>
  </div>

  <footer className='r348-boundary'><ShieldCheck/><div><b>Truth boundary</b><span>{[...packet.truthBoundary,...live.truthBoundary].join(' · ')}</span><small>World: {world.state} · System: {system.state} · Hybrid remains device-proof gated unless a current authenticated heartbeat is returned.</small></div></footer>
 </section>;
}
