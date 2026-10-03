import {useEffect,useMemo,useState} from 'react';
import {R356_ATLAS360_COUNTS,R356_ATLAS360_SOURCE} from './system/atlas360TriangulationR356.js';
import {compileRuntimeDerivedRepresentationR435} from './system/runtimeDerivedRepresentationR435';
import {readRuntimeEvidenceR435,R435_EVIDENCE_EVENT} from './system/representationEvidenceBusR435';

type Props={address:number;compact?:boolean;record?:any;surface?:string};
const fmt=(n:number)=>new Intl.NumberFormat('en-US').format(n);
const f=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';

export default function OmegaAtlas360R356({address,compact=false,record,surface='Convergence'}:Props){
 const[theta,setTheta]=useState(0),[evidence,setEvidence]=useState(()=>readRuntimeEvidenceR435());
 useEffect(()=>{const sync=(e:Event)=>setEvidence(((e as CustomEvent).detail?.packets||readRuntimeEvidenceR435()).slice());window.addEventListener(R435_EVIDENCE_EVENT,sync as EventListener);return()=>window.removeEventListener(R435_EVIDENCE_EVENT,sync as EventListener)},[]);
 const leaf=Math.max(0,Math.min(20735,Math.floor(Number(address)||0)));
 const receipt=useMemo(()=>compileRuntimeDerivedRepresentationR435({
  address:leaf,theta,surface,record,evidence,
  hardware:{logicalCores:typeof navigator!=='undefined'?navigator.hardwareConcurrency||1:1,deviceMemoryGB:typeof navigator!=='undefined'?Number((navigator as any).deviceMemory)||null:null,workerAvailable:typeof Worker!=='undefined'}
 }),[leaf,theta,surface,record,evidence]);
 const h=receipt.atlas.hierarchy,b=receipt.atlas.bearing,s=receipt.field,t=receipt.truth,p=receipt.permissions;
 return <div className={'r356-atlas360'+(compact?' is-compact':'')} data-omega-atlas360-r356='true' data-r435-representation={receipt.representationState} data-r435-receipt={receipt.receipt}>
  <div className='r356-atlas360-head'>
   <div><span>ATLAS 360 · R435 LIVE BINDING</span><b>Woven holonomic triangulation</b></div>
   <small>{receipt.representationState} · claim ceiling {receipt.claimCeiling}</small>
  </div>
  <div className='r356-atlas360-grid'>
   <div><span>Leaf</span><b>{h.address}</b><small>{h.L1.address} → {h.L2.address} → {h.L3.address} → {h.L4.address}</small></div>
   <div><span>Bearing</span><b>{b.theta}° ↔ {b.antipode}°</b><small>sector {b.sector} · phase {b.phase.toFixed(3)}</small></div>
   <div><span>Runtime state</span><b>CΩ {f(s.continuity)} · Φ {f(s.futurePlasticity)}</b><small>q {f(s.contradiction)} · Λ {f(s.burden)} · scar {f(s.scar)}</small></div>
   <div><span>Evidence gate</span><b>{t.status}</b><small>{t.validEvidence} verified · {t.independentSourceFamilies} independent families · U {f(t.uncertainty)}</small></div>
   <div><span>Active slice</span><b>{fmt(receipt.atlas.execution.pairCount)} pairs</b><small>{fmt(receipt.atlas.execution.geometryBytes)} B geometry · {receipt.atlas.execution.fullTensorMaterialized?'materialized':'computed on demand'}</small></div>
   <div><span>Triangle closure</span><b>{receipt.triangle.gateState}</b><small>{p.renderTriangleClosure?'real anchors bound':(receipt.triangle.reasons||[]).join(' · ')}</small></div>
  </div>
  {!compact&&<label className='r356-atlas360-bearing'>Observer bearing <input aria-label='Atlas 360 observer bearing' type='range' min='0' max='359' step='1' value={theta} onChange={e=>setTheta(Number(e.currentTarget.value))}/><output>{theta}°</output></label>}
  <div className='r356-atlas360-foot'>R435 receipt {receipt.receipt} · source tensor {R356_ATLAS360_SOURCE.baseTensorSha256.slice(0,12)}… · {fmt(s.evidence)} R349 field evidence · {fmt(receipt.fusion.truthConfidence)} R151 internal truth · empirical display {p.renderEmpiricalClaim?'ALLOWED':'HELD'} · full logical field {fmt(R356_ATLAS360_COUNTS.logicalEvaluationSlots)} slots remains factorized.</div>
 </div>;
}
