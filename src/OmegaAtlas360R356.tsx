import {useMemo,useState} from 'react';
import {addressBearingSampleR356,compileAtlas360ExecutionPlanR356,R356_ATLAS360_COUNTS,R356_ATLAS360_SOURCE} from './system/atlas360TriangulationR356.js';

type Props={address:number;compact?:boolean};
const fmt=(n:number)=>new Intl.NumberFormat('en-US').format(n);

export default function OmegaAtlas360R356({address,compact=false}:Props){
 const [theta,setTheta]=useState(0);
 const leaf=Math.max(0,Math.min(20735,Math.floor(Number(address)||0)));
 const sample=useMemo(()=>addressBearingSampleR356(leaf,theta),[leaf,theta]);
 const plan=useMemo(()=>compileAtlas360ExecutionPlanR356({
  activeAddresses:[leaf],bearingStep:1,
  logicalCores:typeof navigator!=='undefined'?navigator.hardwareConcurrency||1:1,
  deviceMemoryGB:typeof navigator!=='undefined'?Number((navigator as any).deviceMemory)||null:null,
  workerAvailable:typeof Worker!=='undefined'
 }),[leaf]);
 const h=sample.hierarchy,b=sample.bearing;
 return <div className={'r356-atlas360'+(compact?' is-compact':'')} data-omega-atlas360-r356='true'>
  <div className='r356-atlas360-head'>
   <div><span>ATLAS 360</span><b>Woven holonomic triangulation</b></div>
   <small>Derived proof/relativity layer · no Canon or production authority</small>
  </div>
  <div className='r356-atlas360-grid'>
   <div><span>Leaf</span><b>{h.address}</b><small>{h.L1.address} → {h.L2.address} → {h.L3.address} → {h.L4.address}</small></div>
   <div><span>Bearing</span><b>{b.theta}° ↔ {b.antipode}°</b><small>sector {b.sector} · phase {b.phase.toFixed(3)}</small></div>
   <div><span>Active slice</span><b>{fmt(plan.pairCount)} pairs</b><small>{fmt(plan.geometryBytes)} B geometry · cached/on demand</small></div>
   <div><span>Full logical field</span><b>{fmt(R356_ATLAS360_COUNTS.logicalEvaluationSlots)}</b><small>{fmt(R356_ATLAS360_COUNTS.logicalEvaluationSlotsWithSigma)} with σ expansion</small></div>
  </div>
  {!compact&&<label className='r356-atlas360-bearing'>Observer bearing <input aria-label='Atlas 360 observer bearing' type='range' min='0' max='359' step='1' value={theta} onChange={e=>setTheta(Number(e.currentTarget.value))}/><output>{theta}°</output></label>}
  <div className='r356-atlas360-foot'>Source tensor {R356_ATLAS360_SOURCE.baseTensorSha256.slice(0,12)}… · measurement-dependent closure remains HOLD until real independent anchors are bound.</div>
 </div>
}
