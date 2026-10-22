import {useEffect,useMemo,useState} from 'react';
import {getMandala20736Field,type Mandala20736Field} from '../../src/mandala20736Runtime';
import {evaluateOperationalModesR671,R671_MODES,R671_MODE_AUTHORITIES} from './operationalModesR671.js';
import {evaluateLocalModeProposalR673} from './modelGovernanceR673';

type Props={address:number;onAddress:(address:number)=>void;onNavigate:(route:string)=>void};
const format=(n:number)=>Number.isFinite(n)?n.toFixed(6):'UNAVAILABLE';
export function OperationalModesPanelR671({address,onAddress,onNavigate}:Props){
 const [field,setField]=useState<Mandala20736Field|null>(null);
 const [error,setError]=useState('');
 const [mode,setMode]=useState('TRANSPORT');
 const [length,setLength]=useState(10);
 const [receipt,setReceipt]=useState<ReturnType<typeof evaluateOperationalModesR671>|null>(null);
 useEffect(()=>{let live=true;getMandala20736Field().then(f=>{if(live)setField(f)}).catch(e=>{if(live)setError(String(e))});return()=>{live=false}},[]);
 useEffect(()=>{setReceipt(null)},[address,mode,length,field]);
 const rows=useMemo(()=>receipt?.sourceTrace||[],[receipt]);
 const governance=useMemo(()=>receipt?evaluateLocalModeProposalR673(receipt):null,[receipt]);
 const run=()=>{
  if(!field){setError('Canonical field is not loaded');return}
  try{const result=evaluateOperationalModesR671(field,address,mode,length);setReceipt(result);setError('')}
  catch(e){setReceipt(null);setError(e instanceof Error?e.message:String(e))}
 };
 const sourceState=field&&address>=0&&address<field.count?{C:field.C[address],Phi:field.Phi[address],q:field.q[address],Lambda:field.Lambda[address],scar:field.scar[address]}:null;
 return <section data-r671-operational-modes='true' aria-label='Operational modes execution' style={{padding:16,border:'1px solid #456077',borderRadius:12,margin:'16px 0'}}>
 <header><h3 style={{margin:'0 0 6px'}}>Operational mode engine · R651–R653 / R671</h3><p>This executes the existing woven carry and symmetry engines over the current canonical source address. The 179-entry catalog and Full Overall Canon / Mode 188 evaluators above remain the authority for their own operators. These five projection policies are not substitutes for all 179 modes.</p></header>
 <div style={{display:'flex',flexWrap:'wrap',alignItems:'end',gap:12}}>
  <label style={{display:'grid',gap:4}}>Projection policy<select aria-label='Operational projection mode' value={mode} onChange={e=>setMode(e.target.value)}>{R671_MODES.map((m:string)=><option key={m} value={m}>{m}</option>)}</select></label>
  <label style={{display:'grid',gap:4}}>Maximum route steps<select aria-label='Operational route depth' value={length} onChange={e=>setLength(Number(e.target.value))}>{[4,8,10,16,24].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
  <button type='button' disabled={!field} onClick={run}>Execute selected mode</button>
  <button type='button' onClick={()=>onNavigate('Evidence & Proof')}>Open evidence authority</button>
 </div>
 <p>Selected canonical address <b>{address+1} / 20,736</b>. {sourceState?'Packet CΩ='+format(sourceState.C)+' · Φ='+format(sourceState.Phi)+' · q='+format(sourceState.q)+' · Λ='+format(sourceState.Lambda):'Loading source packet…'}</p>
 {error&&<p role='alert'>{error}</p>}
 {!field&&!error&&<p role='status'>Loading existing canonical state arrays…</p>}
 {receipt&&<div data-r671-execution-receipt='true' style={{padding:12,border:'1px solid #40657a',borderRadius:8}}>
  <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'space-between'}}><b>Local source-model execution</b><span>{receipt.mode} · {receipt.states.length} route states · {receipt.edges.length} typed edges</span></div>
  <p>Transport continuity residual <b>{format(receipt.conservationResidual)}</b> · Symmetric mass <b>{format(receipt.frame.receipt.symmetricMass)}</b> · Asymmetric mass <b>{format(receipt.frame.receipt.asymmetricMass)}</b> · Blocked <b>{receipt.frame.receipt.blockedEdges}</b></p>
  <p>Mode projection balance <b>{format(receipt.frame.projection.totals.balance)}</b> · cycle/return {receipt.cycleTo===null?'not observed in bounded trace':'address '+(receipt.cycleTo+1)}.</p>
  {receipt.developmental.status==='COMPUTED'?<div data-r671-heightened='true'>
    <h4>Heightened developmental differences</h4>
    <p>Finite differences over ordered address transitions; not velocity or acceleration measured against physical time.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8}}>
    {(['velocity','acceleration','jerk'] as const).map(k=><div key={k} style={{padding:9,border:'1px solid #45576b',borderRadius:8}}><b>{k}</b><div>CΩ: {format((receipt.developmental as any)[k].continuity)}</div><div>q: {format((receipt.developmental as any)[k].contradiction)}</div><div>scar: {format((receipt.developmental as any)[k].scar)}</div></div>)}
    </div>
   </div>:<p>Heightened jerk held: four distinct ordered states were not available.</p>}
  <details><summary>Typed directed carry and retained contradictions</summary>{receipt.edges.map((e:any,k:number)=><div key={k}>{e.from} → {e.to} · {e.kind} · weight {format(e.weight)}</div>)}{receipt.typedResidue.map((e:any,k:number)=><div key={'r'+k}>Residue {e.from} → {e.to}: {e.reason}</div>)}</details>
  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:12}} aria-label='Computed route source states'>{rows.map((row:any)=><button type='button' key={row.stateIndex} onClick={()=>onAddress(row.stateIndex)} title={'CΩ '+format(row.continuity)+'; q '+format(row.contradiction)+'; scar '+format(row.scar)}>{row.address}</button>)}</div>
  {governance&&<section data-r673-governance='held' style={{padding:12,background:'rgba(85,104,125,.12)',border:'1px solid #49687b',borderRadius:8,marginTop:12}}>
   <b>R457 Heightened Mode · advancement {governance.status}</b>
   <p>Growth ΔCΩ {format(governance.growth.continuity)} · ΔΦ {format(governance.growth.futurePlasticity)} · Δq {format(governance.growth.contradiction)} · curvature {format(governance.curvature)}. Developmental values are calculated; production promotion is blocked.</p>
   <p><b>{governance.hardVetoes.length} evidence/authority vetoes</b>. This model has not produced independently verified Git, deployment, capability-coverage, or rollback receipts.</p>
   <details><summary>Inspect R457 vetoes and contradiction-preserving proof</summary><ul>{governance.hardVetoes.map((reason:string)=><li key={reason}>{reason}</li>)}</ul></details>
  </section>}
  <p data-r671-proof-boundary='true'><b>Proof:</b> {receipt.executionProof.class}. This is a computed model result, not a physical observation, trained AI checkpoint, released executor, or production deployment. The underlying CanonState is unchanged.</p>
  <details><summary>Operational lineage / preserved software contracts</summary>{R671_MODE_AUTHORITIES.map(a=><p key={a.id}><b>{a.id}</b> · {a.operation} · {a.source}</p>)}</details>
 </div>}
 </section>;
}
