import {useMemo,useState} from 'react';
import {fibonacciAdjacentPairR752} from './proof/singmasterPellClassificationR752.js';
import {computePellWorkbenchR755,verifyPellWorkbenchR755} from './proof/singmasterResearchWorkbenchR755.js';

/** Executable exact number-theory workbench; does not mutate CanonState. */
export default function PellResearchWorkbenchR755(){
 const[t,setT]=useState('3'),[column,setColumn]=useState('274'),[row,setRow]=useState('550'),[prime,setPrime]=useState('5');
 const[importText,setImportText]=useState(''),[recovery,setRecovery]=useState('');
 const result=useMemo(()=>{try{return{packet:computePellWorkbenchR755(t,column,row,prime),error:''}}catch(e){return{packet:null,error:e instanceof Error?e.message:'Invalid exact inputs'}}},[t,column,row,prime]);
 const changeT=(value:string)=>{
  setT(value);
  try{const pair=fibonacciAdjacentPairR752(Number(value)),l=Number(pair.k)+2;setColumn(String(l));setRow(String(2*l))}catch{}
 };
 const exportWitness=()=>{
  if(!result.packet)return;
  const raw=JSON.stringify(result.packet,null,2);
  setImportText(raw);setRecovery('Witness exported; verify independently below.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r755-pell-exact-witness.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const verify=()=>{try{verifyPellWorkbenchR755(importText);setRecovery('PASS: all witness fields match fresh exact source computation.')}catch(e){setRecovery('REFUSED: '+(e instanceof Error?e.message:'Invalid witness'))}};
 return <section className="r316-research" data-dewey-v9-workbench="r755-style" data-r755-pell-workbench="executable" aria-label="R755 exact Pell and crossing research workbench">
  <header className="r316-head"><div><span>R755 · EXACT INTEGER RESEARCH</span><h3>Pell thread, valuations and row crossing</h3><p>Execute a known adjacent-binomial Pell family, inspect its arithmetic constraints, and certify a higher-column row interval. All results are exact for the bounded selected parameters, not a proof of the global Singmaster conjecture.</p></div></header>
  <div className="r316-grid">
   <article className="r316-card"><h3>Declared computation</h3>
    <label>Pell index (2–5) <select data-r755-t value={t} onChange={e=>changeT(e.target.value)}>{[2,3,4,5].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
    <label>Higher column <input data-r755-column inputMode="numeric" value={column} onChange={e=>setColumn(e.target.value)}/></label>
    <label>Candidate row <input data-r755-row inputMode="numeric" value={row} onChange={e=>setRow(e.target.value)}/></label>
    <label>Necessary-valuation prime <select data-r755-prime value={prime} onChange={e=>setPrime(e.target.value)}>{[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
   </article>
   <article className="r316-card" data-r755-result><h3>Executed exact certificate</h3>
    {result.packet?<><p>Adjacent pair: <strong data-r755-pair>C({result.packet.pair.n}, {result.packet.pair.k})</strong></p>
      <p>Interior Fibonacci square: <strong data-r755-square>{result.packet.pair.interiorSquare}</strong></p>
      <p>Forced divisor: <strong data-r755-divisor>{result.packet.arithmetic.forcedDivisor}</strong></p>
      <p>Higher-column interval: {result.packet.crossing.rowMin}–{result.packet.crossing.rowMax} ({result.packet.crossing.coveredRows} rows)</p>
      <p>Crossing certificate: <strong data-r755-crossing>{result.packet.crossing.status}</strong></p>
      <p>Selected-prime necessary sieve: <strong data-r755-candidate>{result.packet.candidate.status}</strong></p>
      <p>Shared coefficient base-{prime} carries: {result.packet.valuation.sharedCoefficientCarries}; required minimum: {result.packet.valuation.requiredMinCarries}</p>
      <button type="button" data-r755-export onClick={exportWitness}>Export exact witness JSON</button></>:<p role="alert">{result.error}</p>}
   </article>
  </div>
  <details><summary>Recover and independently recompute witness</summary>
   <textarea data-r755-import aria-label="R755 JSON witness" rows={5} value={importText} onChange={e=>setImportText(e.target.value)}/>
   <button type="button" data-r755-verify onClick={verify}>Verify against exact source computation</button>
   <p role="status" data-r755-recovery>{recovery}</p>
  </details>
  <p className="r316-boundary">Research boundary: classical Pell/Fibonacci arithmetic, selected-prime necessary conditions and one exact higher-column interval. No global fourfold closure, physical dimension, autonomous execution, CanonState mutation or device proof. Unexcluded candidates are not established equalities.</p>
 </section>;
}
