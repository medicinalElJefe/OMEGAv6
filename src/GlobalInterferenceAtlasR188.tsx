import {useMemo} from 'react';
import {Activity,Grid3X3,ShieldCheck,Waypoints} from 'lucide-react';
import type {GlobalInterferenceAtlasR188 as Atlas} from './globalInterferenceAtlasR188';
import './globalInterferenceAtlasR188.css';

const f=(v:number,d=4)=>Number.isFinite(v)?v.toFixed(d):'—';
const pct=(v:number)=>`${Math.round(Math.max(0,Math.min(1,v))*100)}%`;
export default function GlobalInterferenceAtlasR188({atlas,onSelectAddress}:{atlas:Atlas;onSelectAddress:(address:number)=>void}){
 const maxMatrix=useMemo(()=>Math.max(.0001,...atlas.dpMatrix.map(x=>x.meanResidual)),[atlas]);
 return <section className='global-r188'>
  <header><div><span>GLOBAL INTERFERENCE ATLAS · R188</span><h4>{atlas.count.toLocaleString()} actual states scanned</h4><small>Full-field internal coherence map using the same R184 residual authority.</small></div><div className='status'><ShieldCheck/><b>mean {f(atlas.meanResidual)}</b><small>P10 {f(atlas.quantiles.p10)} · P50 {f(atlas.quantiles.p50)} · P90 {f(atlas.quantiles.p90)}</small></div></header>
  <div className='global-r188-summary'><article><Activity/><span>Descending admitted routes</span><b>{atlas.routeStats.descending.toLocaleString()}</b><small>{pct(atlas.routeStats.descending/atlas.count)}</small></article><article><Waypoints/><span>Locally resolvable</span><b>{atlas.routeStats.localResolvable.toLocaleString()}</b><small>has D/P/R/L neighbor reducing residual</small></article><article><Grid3X3/><span>Low-residual clusters</span><b>{atlas.clusters.length}</b><small>P10 connected components retained</small></article></div>
  <section className='global-r188-matrix'><header><b>D × P residual projection</b><small>Each cell aggregates 144 R/L states. It is a projection of the same lattice, not independent confirmation.</small></header><div>{atlas.dpMatrix.map(x=><div key={`${x.d}-${x.p}`} title={`D${x.d+1} P${x.p+1} · residual ${f(x.meanResidual)} · evidence ${f(x.meanEvidence)}`} style={{'--r188-level':String(x.meanResidual/maxMatrix)} as React.CSSProperties}><span>D{x.d+1}/P{x.p+1}</span><b>{f(x.meanResidual,3)}</b></div>)}</div></section>
  <div className='global-r188-columns'><section><header><b>Highest interference</b><small>Click any real state to inspect it.</small></header>{atlas.hotspots.slice(0,12).map(x=><button key={`h-${x.address}`} onClick={()=>onSelectAddress(x.address)}><span>S{x.stateId}</span><b>{f(x.residual)}</b><small>{x.decision} · route Δ {f(x.routeDelta)}</small></button>)}</section><section><header><b>Lowest residual basins</b><small>Evidence remains visible beside low residual.</small></header>{atlas.basins.slice(0,12).map(x=><button key={`b-${x.address}`} onClick={()=>onSelectAddress(x.address)}><span>S{x.stateId}</span><b>{f(x.residual)}</b><small>proof {f(x.evidence)} · CΩ {f(x.continuity)}</small></button>)}</section></div>
  <details><summary>Inspect decision statistics and low-residual connected clusters</summary><div className='global-r188-details'><section>{atlas.decisionStats.map(x=><article key={x.decision}><span>{x.decision}</span><b>{x.count.toLocaleString()}</b><small>mean residual {f(x.meanResidual)} · evidence {f(x.meanEvidence)}</small></article>)}</section><section>{atlas.clusters.map(x=><article key={x.rank}><span>CLUSTER {x.rank}</span><b>{x.size.toLocaleString()} states</b><small>mean {f(x.meanResidual)} · min S{x.minState}/{f(x.minResidual)} · proof {f(x.meanEvidence)}</small></article>)}</section></div></details>
  <footer><ShieldCheck/><span>{atlas.truthBoundary}</span></footer>
 </section>
}
