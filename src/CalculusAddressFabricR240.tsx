import {useMemo,useState} from 'react';
import {Activity,Boxes,GitBranch,Layers3,ShieldCheck} from 'lucide-react';
import {compile20736CalculusFabricR240,type R240AddressedOperator} from './system/calculusAddressFabricR240';
import type {R240Orientation} from './system/recursiveSelfBuildR240';
import './calculusAddressFabricR240.css';

type Props={record:any};
const short=(s:string,n=36)=>s.length>n?`${s.slice(0,n)}…`:s;
export default function CalculusAddressFabricR240({record}:Props){
 const[orientation,setOrientation]=useState<R240Orientation>(0);
 const fabric=useMemo(()=>compile20736CalculusFabricR240(record,{orientation}),[record,orientation]);
 const active=fabric.operators.filter((x:R240AddressedOperator)=>x.active),gated=fabric.operators.filter((x:R240AddressedOperator)=>x.state==='GATED_MISSING_INPUTS'),catalog=fabric.operators.filter((x:R240AddressedOperator)=>x.state==='CATALOG_ONLY');
 return <section className='r240-calculus-address' aria-label='R240 20736 calculus address fabric' data-r240-calculus-address='SPARSE_ADDRESS_FABRIC' data-r240-calculus-orientation={orientation}>
  <header><div><span>R240 · FULL CALCULUS · 20,736 ADDRESS FABRIC</span><h3>All modes stay addressable. Only lawful modes activate.</h3><p>One 12×12×12×12 sparse computational fabric carries source modes, Canon/calculus lenses, orientation and proof state without pretending that address capacity is physical dimensionality or simultaneous execution.</p></div><ShieldCheck/></header>
  <div className='r240-calculus-stats'>
   <article><Boxes/><span><small>ADDRESS CAPACITY</small><b>20,736</b><em>12×12×12×12 · computational</em></span></article>
   <article><Layers3/><span><small>REGISTERED OPERATORS</small><b>{fabric.registeredOperators}</b><em>179 source modes + 62 lenses</em></span></article>
   <article><Activity/><span><small>ACTIVE NOW</small><b>{fabric.activeOperators}</b><em>{gated.length} gated · {catalog.length} catalog-only</em></span></article>
   <article><GitBranch/><span><small>DEEP ADDRESS</small><b>248,832</b><em>20,736 × 12 phase/address extension</em></span></article>
  </div>
  <div className='r240-orientation' aria-label='Calculus orientation'><span>ORIENTATION σ</span>{([-1,0,1] as R240Orientation[]).map(v=><button key={v} className={orientation===v?'active':''} onClick={()=>setOrientation(v)} aria-pressed={orientation===v}>{v===1?'+1 DISPATCH':v===-1?'−1 RETURN':'0 OBSERVE'}</button>)}</div>
  <div className='r240-active-grid'>{active.slice(0,12).map((row:R240AddressedOperator)=><article key={row.ref}><span><b>{row.ref}</b><small>{row.family} · {row.state}</small></span><code>{row.address.address}</code><p>{short(row.name)}</p><em>weight {row.weight.toFixed(3)} · σ {row.orientation}</em></article>)}</div>
  {!active.length&&<div className='r240-calculus-empty'>No lawful mode output is active for the current record. The address fabric remains available but does not fabricate missing execution.</div>}
  <footer><ShieldCheck/><span>{fabric.truthBoundary} The bridge uses the same address/orientation law; R141 closes returned proof, R147 remains dispatch authority, and R125 remains sole CanonState admission authority.</span></footer>
 </section>;
}
