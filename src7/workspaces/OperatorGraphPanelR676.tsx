import {useEffect,useMemo,useState} from 'react';
import {getMandala20736Field,type Mandala20736Field} from '../../src/mandala20736Runtime';
import {collapseCanonicalFieldR676,decodeOperatorNodeR676,operatorNodeForAddressR676,propagateOperatorR676,applyOperatorR676,operatorDiskPointR676,edgesFromOperatorNodeR676,R676_DONOR_PROOF} from './operatorGraphR676.js';
import {replayHistoricalDonorR678,verifyOriginalDonorReplayR678,R678_DONOR_REPLAY_PROOF} from './historicalOperatorReplayR678.js';

type Props={address:number;onAddress:(next:number)=>void};
const fmt=(x:number)=>Number.isFinite(x)?x.toFixed(7):'UNAVAILABLE';
const measure=(arr:Float64Array)=>{let s=0;for(const x of arr)s+=x;return s};
export function OperatorGraphPanelR676({address,onAddress}:Props){
 const [open,setOpen]=useState(false),[field,setField]=useState<Mandala20736Field|null>(null);
 const [error,setError]=useState(''),[channel,setChannel]=useState('C'),[iterations,setIterations]=useState(12);
 const [result,setResult]=useState<{values:Float64Array;ledger:any[];type:string}|null>(null);
 const [historicalParity,setHistoricalParity]=useState<{match:boolean;sha256:string;expectedSha256:string}|null>(null);
 useEffect(()=>{if(!open||field)return;let live=true;getMandala20736Field().then(f=>{if(live)setField(f)}).catch(e=>{if(live)setError(String(e))});return()=>{live=false}},[open,field]);
 useEffect(()=>{setResult(null);setHistoricalParity(null)},[address,channel,iterations]);
 const location=operatorNodeForAddressR676(address);
 const top=useMemo(()=>{if(!result)return[];return Array.from(result.values,(value,node)=>({node,value})).sort((a,b)=>b.value-a.value||a.node-b.node).slice(0,12)},[result]);
 const disk=useMemo(()=>{
  if(!result)return null;
  const domain=Math.floor(location.node/144);
  const nodes=Array.from({length:144},(_,i)=>operatorDiskPointR676(domain*144+i));
  const current=operatorDiskPointR676(location.node);
  const localEdges=edgesFromOperatorNodeR676(location.node).filter(e=>Math.floor(e.dst/144)===domain).map(e=>({kind:e.type,weight:e.weight,dst:operatorDiskPointR676(e.dst)}));
  const max=Math.max(1e-12,...nodes.map(n=>result.values[n.node]));
  return {domain,nodes,current,localEdges,max};
 },[result,location.node]);
 const run=(type:string)=>{
  setHistoricalParity(null);
  try{
   if(!field)throw Error('Load source canonical field before executing');
   const seed=collapseCanonicalFieldR676(field,channel);
   if(type==='PROPAGATE'){
    const q=propagateOperatorR676(seed,{iterations});
    setResult({values:q.values,ledger:q.ledger,type});
   }else{
    const values=applyOperatorR676(seed,type);
    setResult({values,ledger:[],type});
   }
   setError('');
  }catch(e){setError(e instanceof Error?e.message:String(e));setResult(null)}
 };
 const replayOriginal=async()=>{
  setHistoricalParity(null);
  try{
   const replay=replayHistoricalDonorR678(59);
   const check=await verifyOriginalDonorReplayR678(replay.values);
   setResult({values:replay.values,ledger:replay.ledger,type:'HISTORICAL_59_UPDATE_REPLAY'});
   setHistoricalParity({match:check.match,sha256:check.sha256,expectedSha256:check.expectedSha256});
   setError(check.match?'':'Original donor hash does not match. Replay held.');
  }catch(e){setResult(null);setError(e instanceof Error?e.message:String(e))}
 };
 const pick=(node:number)=>{const c=decodeOperatorNodeR676(node);onAddress(c.d*1728+c.p*144+c.r*12+location.layer)};
 return <section data-r676-operator-panel='true' style={{padding:16,margin:'16px 0',border:'1px solid #536579',borderRadius:12}}>
  <header><h3 style={{margin:0}}>Recovered TRUE Operator Engine v9 · 1,728 nodes</h3>
   <p>Actual B053 typed graph: 18,144 edges across phase, regulation, local, triad and antipode relationships. This donor is a 12×12×12 operator instrument, not an independently established physical 1,728-dimensional space.</p></header>
  <button type='button' aria-expanded={open} onClick={()=>setOpen(x=>!x)}>{open?'Close':'Open'} historical construct/prune operator</button>
  {open&&<div>
   <p>Current 20,736-state address {address+1} → operator node {location.node} with original layer {location.layer+1}. Explicit layer-average projection is used; the canonical source remains unchanged.</p>
   {!field&&!error&&<p role='status'>Loading canonical field…</p>}
   <div style={{display:'flex',flexWrap:'wrap',alignItems:'end',gap:10}}>
    <label>Canonical source channel <select aria-label='Operator source channel' value={channel} onChange={e=>setChannel(e.target.value)}>{[['C','Continuity CΩ'],['Phi','Plasticity Φ'],['evidence','Evidence weight'],['scar','Scar'],['q','Contradiction q']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <label>Iteration count <select aria-label='Operator iteration count' value={iterations} onChange={e=>setIterations(Number(e.target.value))}>{[1,3,12,60].map(n=><option value={n} key={n}>{n}</option>)}</select></label>
    <button type='button' disabled={!field} onClick={()=>run('P_plus_011')}>Construct 011</button>
    <button type='button' disabled={!field} onClick={()=>run('P_minus_01m1')}>Prune 01−1</button>
    <button type='button' disabled={!field} onClick={()=>run('P_rw')}>Random walk</button>
    <button type='button' disabled={!field} onClick={()=>run('PROPAGATE')}>Propagate construct−prune</button>
    <button type='button' onClick={replayOriginal}>Verify original donor CSV (59 updates)</button>
   </div>
   {error&&<p role='alert'>{error}</p>}
   {result&&<div data-r676-operator-receipt='true'>
    <p><b>{result.type}</b> · {result.values.length} computed operator nodes · resulting sum {fmt(measure(result.values))} · {result.ledger.length} completed propagation iterations</p>
    {disk&&<div data-r677-operator-disk='source-exact' style={{margin:'12px 0',maxWidth:540}}>
      <h4>Original donor disk geometry · D{disk.domain+1}</h4>
      <p>144 original phase/regulation coordinates: θ=2π(P−1)/12; radius=√((R−0.5)/12). Cyan intensity is the selected computed operator channel. Gold is the selected node. Connecting lines show only directly observed same-domain typed edges; cross-domain links remain active in the operator but are not falsely drawn inside this disk.</p>
      <svg viewBox='0 0 360 360' role='img' aria-label={'Source-exact 144-node disk projection for domain '+(disk.domain+1)} style={{display:'block',width:'100%',height:'auto',background:'#071622',border:'1px solid #344a5e',borderRadius:8}}>
      {[1,3,6,9,12].map(r=><circle key={r} cx={180} cy={180} r={Math.sqrt((r-.5)/12)*160} fill='none' stroke='#3e5b6c' strokeWidth='.7'/>)}
      {disk.localEdges.map((e,k)=><line key={k} x1={180+disk.current.x*160} y1={180-disk.current.y*160} x2={180+e.dst.x*160} y2={180-e.dst.y*160} stroke={e.kind==='LOCAL'?'#9bafbc':'#d3a76a'} strokeOpacity='.65' strokeWidth={.7+e.weight}/>)}
      {disk.nodes.map(n=><circle key={n.node} cx={180+n.x*160} cy={180-n.y*160} r={n.node===location.node?5:2.4} fill={n.node===location.node?'#ffd586':'#79d5e4'} opacity={n.node===location.node?1:Math.max(.2,Math.min(1,result.values[n.node]/disk.max))} stroke={n.node===location.node?'#fff3d5':'none'} strokeWidth={n.node===location.node?1.3:0}/>)}
      <text x='10' y='20' fill='#d2deec' fontSize='12'>SOURCE MODEL · D{disk.domain+1} · 144/1728 NODES</text>
      <text x='10' y='347' fill='#afc4d2' fontSize='11'>Selected {location.node} · Phase {disk.current.p+1} · Regulation {disk.current.r+1}</text>
      </svg>
     </div>}
    {historicalParity&&<div data-r678-historical-parity={historicalParity.match?'matched':'held'} style={{padding:10,border:'1px solid #687e8e',borderRadius:8,margin:'10px 0'}}>
     <b>Original 1,728-value donor replay · {historicalParity.match?'SOURCE-MATCHED':'HELD'}</b>
     <p>Source README says T={R678_DONOR_REPLAY_PROOF.claimedIterations}; original CSV actually matches {R678_DONOR_REPLAY_PROOF.matchedEffectiveUpdates} effective updates. The discrepancy is retained explicitly. Every output value is verified at seven-decimal precision against the archived distribution's SHA-256.</p>
     <p style={{overflowWrap:'anywhere'}}>Computed source digest {historicalParity.sha256}; archived digest {historicalParity.expectedSha256}</p>
     <p>Reconstructed source-model replay, not live physical observation, not a new physical primitive, and not CanonState promotion.</p>
    </div>}
    <h4>Strongest returned nodes</h4>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8}}>
     {top.map(x=><button type='button' key={x.node} onClick={()=>pick(x.node)} title={'Select operator node '+x.node+' preserving current layer'} style={{padding:8,textAlign:'left',border:'1px solid #516e80',borderRadius:8}}><b>Node {x.node}</b><div>{fmt(x.value)}</div></button>)}
    </div>
    {result.ledger.length>0&&<details><summary>Iteration ledger and clipping residuals</summary>{result.ledger.map(row=><div key={row.step}>Step {row.step}: retained mass {fmt(row.preNormalizationMass)}, clipped negative mass {fmt(row.clippedNegativeMass)}</div>)}</details>}
    <p><b>Proof boundary:</b> B053 typed edge identities are independently matched to the original 18,144-edge donor. This interactive mathematical projection is source-model execution, not a calibrated physical model or automatic CanonState promotion. Full historical 60-step propagation numerical parity remains unverified.</p>
    <details><summary>Historical source authority</summary><p>{R676_DONOR_PROOF.zip} / {R676_DONOR_PROOF.source} · canonical edge digest {R676_DONOR_PROOF.canonicalSortedEdgeSha256}</p></details>
   </div>}
  </div>}
 </section>;
}
