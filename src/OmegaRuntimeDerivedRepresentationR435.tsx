import {useEffect,useMemo,useState} from 'react';
import {ShieldCheck,Triangle,Activity,Database,Zap} from 'lucide-react';
import {compileRuntimeDerivedRepresentationR435} from './system/runtimeDerivedRepresentationR435';
import {readRuntimeEvidenceR435,R435_EVIDENCE_EVENT} from './system/representationEvidenceBusR435';
import './runtimeDerivedRepresentationR435.css';

type Props={address:number;record:any;surface?:string;compact?:boolean;theta?:number};
const f=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';

export default function OmegaRuntimeDerivedRepresentationR435({address,record,surface='Convergence',compact=false,theta=0}:Props){
 const[evidence,setEvidence]=useState(()=>readRuntimeEvidenceR435());
 useEffect(()=>{const sync=(e:Event)=>setEvidence(((e as CustomEvent).detail?.packets||readRuntimeEvidenceR435()).slice());window.addEventListener(R435_EVIDENCE_EVENT,sync as EventListener);return()=>window.removeEventListener(R435_EVIDENCE_EVENT,sync as EventListener)},[]);
 const receipt=useMemo(()=>compileRuntimeDerivedRepresentationR435({address,theta,surface,record,evidence,hardware:{logicalCores:typeof navigator!=='undefined'?navigator.hardwareConcurrency||1:1,deviceMemoryGB:typeof navigator!=='undefined'?Number((navigator as any).deviceMemory)||null:null,workerAvailable:typeof Worker!=='undefined'}}),[address,theta,surface,record,evidence]);
 const p=receipt.permissions,t=receipt.truth,s=receipt.field,b=receipt.atlas.bearing;
 return <section className={'r435-representation'+(compact?' is-compact':'')} data-r435-representation={receipt.representationState} data-r435-claim-ceiling={receipt.claimCeiling}>
  <header><div><span>R435 · RUNTIME-DERIVED REPRESENTATION</span><h3>Display only what the current state can prove</h3><p>Canonical packet → returned evidence/proof → truth envelope → typed field → Atlas360 → representation receipt.</p></div><ShieldCheck/></header>
  <div className='r435-state'>
   <article><Database/><span><small>REPRESENTATION STATE</small><b>{receipt.representationState}</b><em>{receipt.claimCeiling}</em></span></article>
   <article><Activity/><span><small>TRUTH ENVELOPE</small><b>{t.status}</b><em>confidence {f(t.confidence)} · uncertainty {f(t.uncertainty)}</em></span></article>
   <article><Triangle/><span><small>ATLAS STATE</small><b>{receipt.atlas.hierarchy.address} · {b.theta}° ↔ {b.antipode}°</b><em>{receipt.atlas.execution.pairCount} active bearing pairs</em></span></article>
   <article><Zap/><span><small>RECEIPT</small><b>{receipt.receipt}</b><em>{t.validEvidence} verified packet{t.validEvidence===1?'':'s'} · {t.independentSourceFamilies} source families</em></span></article>
  </div>
  {!compact&&<div className='r435-field'>
   <div><span>CΩ</span><b>{f(s.continuity)}</b></div><div><span>Φ</span><b>{f(s.futurePlasticity)}</b></div><div><span>q</span><b>{f(s.contradiction)}</b></div><div><span>Λ</span><b>{f(s.burden)}</b></div><div><span>scar</span><b>{f(s.scar)}</b></div><div><span>evidence</span><b>{f(s.evidence)}</b></div>
  </div>}
  <div className='r435-permissions'>
   <span className={p.renderReturnedEvidence?'pass':'hold'}>returned evidence {p.renderReturnedEvidence?'BOUND':'HOLD'}</span>
   <span className={p.renderEmpiricalClaim?'pass':'hold'}>empirical claim {p.renderEmpiricalClaim?'ALLOWED':'HELD'}</span>
   <span className={p.renderTriangleClosure?'pass':'hold'}>triangle closure {p.renderTriangleClosure?'BOUND':'HOLD'}</span>
   <span className='hold'>forecast as observation FORBIDDEN</span>
  </div>
  <footer><b>{t.nextAction}</b><span>{receipt.reasons.length?receipt.reasons.join(' · '):receipt.provenance.proof}</span></footer>
 </section>;
}
