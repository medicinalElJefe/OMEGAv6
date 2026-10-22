import {useMemo,useState} from 'react';
import {Activity,Boxes,GitBranch,Layers3,ShieldCheck} from 'lucide-react';
import {compile20736CalculusFabricR240,executeActiveWovenStateR240,type R240AddressedOperator} from './system/calculusAddressFabricR240';
import type {R240Orientation} from './system/recursiveSelfBuildR240';
import './calculusAddressFabricR240.css';

type Props={record:any};
const short=(s:string,n=36)=>s.length>n?`${s.slice(0,n)}…`:s;
const fixed=(n:number,d=6)=>Number.isFinite(n)?n.toFixed(d):'—';
export default function CalculusAddressFabricR240({record}:Props){
 const[orientation,setOrientation]=useState<R240Orientation>(0);
 const fabric=useMemo(()=>compile20736CalculusFabricR240(record,{orientation}),[record,orientation]);
 const woven=useMemo(()=>executeActiveWovenStateR240(record,{orientation,targetResolution:20736,transportRate:.125}),[record,orientation]);
 const active=fabric.operators.filter((x:R240AddressedOperator)=>x.active),gated=fabric.operators.filter((x:R240AddressedOperator)=>x.state==='GATED_MISSING_INPUTS'),catalog=fabric.operators.filter((x:R240AddressedOperator)=>x.state==='CATALOG_ONLY');
 const evolution=woven.evolution,proof=evolution.proof,carry=evolution.carry.invariant;
 return <section className='r240-calculus-address' aria-label='R240 20736 calculus address fabric' data-r240-calculus-address='SPARSE_ADDRESS_FABRIC' data-r240-calculus-orientation={orientation}>
  <header><div><span>R240 · WOVEN CALCULUS · 20,736 ADDRESS FABRIC</span><h3>State moves through the calculus. It is not reduced to a score.</h3><p>Active addressed operators are partitioned, transported under orientation, carried with invariant and scar history, re-contextualized, and proved. The 12→144→1,728→20,736→248,832 ladder remains representational address resolution, never literal physical dimensionality.</p></div><ShieldCheck/></header>
  <div className='r240-calculus-stats'>
   <article><Boxes/><span><small>ADDRESS CAPACITY</small><b>20,736</b><em>12×12×12×12 · computational</em></span></article>
   <article><Layers3/><span><small>REGISTERED OPERATORS</small><b>{fabric.registeredOperators}</b><em>179 source modes + 62 lenses</em></span></article>
   <article><Activity/><span><small>ACTIVE NOW</small><b>{fabric.activeOperators}</b><em>{gated.length} gated · {catalog.length} catalog-only</em></span></article>
   <article><GitBranch/><span><small>DEEP ADDRESS</small><b>248,832</b><em>20,736 × 12 phase/address extension</em></span></article>
  </div>
  <div className='r240-orientation' aria-label='Calculus orientation'><span>ORIENTATION σ</span>{([-1,0,1] as R240Orientation[]).map(v=><button key={v} className={orientation===v?'active':''} onClick={()=>setOrientation(v)} aria-pressed={orientation===v}>{v===1?'+1 OUTVERSE':v===-1?'−1 INVERSE':'0 OBSERVE'}</button>)}</div>
  <div className='r240-woven-cycle' aria-label='R315 woven state evolution' data-r315-field='WOVEN_STATE_EVOLUTION'>
   <div className='r240-cycle-head'><span><small>R315.FIELD · LIVE WOVEN STATE</small><b>PARTITION → EXCHANGE → CARRY → RE-CONTEXTUALIZE → PROVE</b></span><em>{evolution.frontierCount??woven.frontierCount} active addressed operators · σ {orientation}</em></div>
   <div className='r240-cycle-grid'>
    <span><small>PARTITION</small><b>{evolution.sourceCount} → {evolution.targetCount}</b><em>source/target field elements at 20,736 resolution</em></span>
    <span><small>EXCHANGE PATH</small><b>{evolution.exchange.edges.length} edges</b><em>{orientation===0?'observe: structure held':'bounded conservative transport at 12.5%'}</em></span>
    <span><small>INVARIANT CARRY</small><b>{fixed(carry.before)} → {fixed(carry.afterRepartition)}</b><em>residual {fixed(carry.residual,10)} · {proof.invariantStatus}</em></span>
    <span><small>SCAR / HISTORY</small><b>{fixed(evolution.scarMagnitude)}</b><em>{evolution.carry.scarLedger.length} carried ledger frame(s)</em></span>
    <span><small>RECOVERABLE PATH</small><b>{proof.recoverableFromLedger?'YES':'NO'}</b><em>receipt {evolution.receipt.receiptHash}</em></span>
    <span><small>ROUND-TRIP PROJECTION</small><b>{fixed(proof.roundTripResidual,10)}</b><em>{proof.roundTripStatus} · software residual only</em></span>
   </div>
   <div className='r240-resolution-ladder' aria-label='Woven resolution ladder'>{woven.resolutionLadder.map((row:any)=><span key={row.resolution}><small>{row.resolution.toLocaleString()}</small><b>{fixed(row.residual,6)}</b><em>{row.status} · {row.targetCount} cells</em></span>)}</div>
  </div>
  <div className='r240-active-grid'>{active.slice(0,12).map((row:R240AddressedOperator)=><article key={row.ref}><span><b>{row.ref}</b><small>{row.family} · {row.state}</small></span><code>{row.address.address}</code><p>{short(row.name)}</p><em>weight {row.weight.toFixed(3)} · σ {row.orientation}</em></article>)}</div>
  {!active.length&&<div className='r240-calculus-empty'>No lawful mode output is active for the current record. The address fabric remains available but does not fabricate missing execution.</div>}
  <footer><ShieldCheck/><span>{fabric.truthBoundary} This surface shows an internal software state transform and its measured residuals only. R147 still owns dispatch, R146 durable history, R141 exact Hybrid return proof, and R125 sole CanonState admission.</span></footer>
 </section>;
}
