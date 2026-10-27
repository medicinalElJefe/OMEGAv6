import {useState} from 'react';
import {AXES_R623,ADDRESS_CAPACITY_R623,BAND_WIDTH_R623,traverseAddressR623} from '../src/continuity/corpusTraversalKernelR623.js';
const INTEGER=/^(0|-?[1-9][0-9]*)$/;
function safe(text:string){if(!INTEGER.test(text))throw Error('Canonical integer required');const n=Number(text);if(!Number.isSafeInteger(n))throw Error('Safe integer required');return n}
export function CorpusTraversalR623(){
 const [address,setAddress]=useState('0'),[offset,setOffset]=useState('1'),[wrap,setWrap]=useState(false);
 const [receipt,setReceipt]=useState<ReturnType<typeof traverseAddressR623>|null>(null),[error,setError]=useState('');
 const execute=()=>{try{setReceipt(traverseAddressR623({address:safe(address),offset:safe(offset),wrap}));setError('')}catch(e){setReceipt(null);setError(e instanceof Error?e.message:'Traversal refused')}};
 const continueAtTarget=()=>{if(receipt){setAddress(String(receipt.toAddress));setReceipt(null)}};
 return <section data-r623-traversal='read-only' aria-label='Historical address traversal' style={{border:'1px solid #56718a',borderRadius:12,padding:18,margin:'18px 0'}}>
  <h2>Historical address traversal</h2>
  <p>Execute bounded arithmetic in the 12^10 address representation ({ADDRESS_CAPACITY_R623.toLocaleString()} addressable positions; {BAND_WIDTH_R623.toLocaleString()} positions per domain-phase band). No workbook bytes, historical module execution, or Canon mutation.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'end'}}>
   <label>Address <input aria-label='Historical ten-axis address' inputMode='numeric' value={address} onChange={e=>{setAddress(e.target.value);setReceipt(null)}} /></label>
   <label>Signed offset <input aria-label='Historical traversal offset' inputMode='numeric' value={offset} onChange={e=>{setOffset(e.target.value);setReceipt(null)}} /></label>
   <label><input aria-label='Authorize address wrap' type='checkbox' checked={wrap} onChange={e=>{setWrap(e.target.checked);setReceipt(null)}} /> Permit wrap</label>
   <button type='button' data-r623-execute='true' onClick={execute}>Traverse address</button>
  </div>
  {error&&<p role='alert' data-r623-refusal='true'>Traversal refused: {error}</p>}
  {receipt&&<div role='status' data-r623-receipt='true'>
   <p><strong>{receipt.fromAddress.toLocaleString()} → {receipt.toAddress.toLocaleString()}</strong> · band {receipt.fromBand} → {receipt.toBand} · {receipt.wrapped?'wrapped with authorization':'no address wrap'} · {receipt.crossedBand?'crossed band boundary':'within origin band'}</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(105px,1fr))',gap:6}}>
    {AXES_R623.map((axis,i)=><div key={axis} style={{padding:6,border:'1px solid #47617a',borderRadius:6}}><small>{axis}</small><div>{receipt.fromDigits[i]} → {receipt.toDigits[i]}</div></div>)}
   </div>
   <p><small>Truth: {receipt.truthClass}. Private original workbook proof: not asserted. Canon mutation: none.</small></p>
   <button type='button' onClick={continueAtTarget}>Use target as next origin</button>
  </div>}
 </section>;
}
