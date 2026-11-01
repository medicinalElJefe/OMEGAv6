import {useMemo,useState} from 'react';
import {computePellWorkbenchR752,verifyPellWorkbenchR752} from './proof/pellWorkbenchR752.js';
/** Executable exact arithmetic; no physical measurement or global Singmaster claim. */
export default function PellWorkbenchR752(){
 const[index,setIndex]=useState('1'),[importText,setImportText]=useState(''),[status,setStatus]=useState('');
 const result=useMemo(()=>{try{return{packet:computePellWorkbenchR752(index),error:''}}catch(e){return{packet:null,error:e instanceof Error?e.message:'Invalid index'}}},[index]);
 const exportWitness=()=>{
  if(!result.packet)return;
  const raw=JSON.stringify(result.packet,null,2);
  setImportText(raw);setStatus('Exact witness exported; verification is available below.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r752-pell-witness.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const verify=()=>{try{verifyPellWorkbenchR752(importText);setStatus('PASS: exact Pell witness recomputed, classification and inverse verified.')}catch(e){setStatus('REFUSED: '+(e instanceof Error?e.message:'Invalid witness'))}};
 return <section className="r316-research" data-r752-pell-workbench="executable" aria-label="R752 exact Pell thread workbench">
  <header className="r316-head"><div><span>R752 · EXECUTABLE NUMBER THEORY</span><h3>Reversible Pell thread</h3><p>Compute a known Singmaster adjacent-pair family with exact integers, certify the inverse and Cassini classification, and export a recomputable witness. The global fourfold question remains open.</p></div></header>
  <div className="r316-grid">
   <article className="r316-card"><h3>Bounded exact computation</h3><label>Thread index (0–64) <input data-r752-index inputMode="numeric" value={index} onChange={e=>setIndex(e.target.value)}/></label>
    <p>Index 0 is the algebraic seed, not a nontrivial binomial pair. Higher indices produce certified adjacent-row/column pairs.</p></article>
   <article className="r316-card" data-r752-result><h3>Computed certificate</h3>
    {result.packet?<><p>n: <strong data-r752-n>{result.packet.pair.n}</strong></p><p>k: <strong data-r752-k>{result.packet.pair.k}</strong></p>
     <p>Descent: <strong data-r752-classification>{result.packet.classification.status}</strong></p>
     <p>Exact Pell norm: <strong data-r752-norm>{result.packet.norm.value}</strong></p>
     <p>Global polynomial identity: <strong data-r752-identity>{result.packet.polynomial.isGlobalIdentity?'PASS':'FAIL'}</strong></p>
     <button type="button" data-r752-export onClick={exportWitness}>Export exact JSON witness</button></>:<p role="alert">{result.error}</p>}
   </article>
  </div>
  <details><summary>Recover and verify exported Pell witness</summary><textarea data-r752-import aria-label="R752 JSON witness" rows={5} value={importText} onChange={e=>setImportText(e.target.value)}/><button type="button" data-r752-verify onClick={verify}>Verify by fresh computation</button><p data-r752-status role="status">{status}</p></details>
  <p className="r316-boundary">Known 1975 number theory, exact for the declared adjacent-pair family only. No sharp Singmaster proof, new physical dimension, automatic CanonState change or source-authority promotion.</p>
 </section>;
}
