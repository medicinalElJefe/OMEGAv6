import {useMemo,useState} from 'react';
import {V9_SCENARIO_NAMES} from './proof/deweyTemporalRotationV9.js';
import {computeTemporalWorkbenchV9,verifyTemporalWorkbenchV9} from './proof/deweyTemporalWorkbenchRuntimeV9.js';

/** Research-only, executable UI. No CanonState, provider, or physical inference. */
export default function DeweyTemporalWorkbenchV9(){
 const[model,setModel]=useState('relative'),[x,setX]=useState('1'),[y,setY]=useState('2');
 const[t,setT]=useState('1'),[q,setQ]=useState('1'),[importText,setImportText]=useState(''),[recovery,setRecovery]=useState('');
 const result=useMemo(()=>{try{return{packet:computeTemporalWorkbenchV9(model,x,y,t,q),error:''}}catch(e){return{packet:null,error:e instanceof Error?e.message:'Invalid inputs'}}},[model,x,y,t,q]);
 const exportPacket=()=>{
  if(!result.packet)return;
  const raw=JSON.stringify(result.packet,null,2);setImportText(raw);setRecovery('Exported exact model witness; import verification remains optional.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download='omega-dewey-v9-temporal-witness.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const verifyImport=()=>{try{verifyTemporalWorkbenchV9(importText);setRecovery('PASS: exact witness recomputed and matched. No global or physical inference.')}catch(e){setRecovery('REFUSED: '+(e instanceof Error?e.message:'Invalid packet'))}};
 return <section className="r316-research" data-dewey-v9-workbench="executable" aria-label="Dewey V9 exact time and rotation workbench">
  <header className="r316-head"><div><span>V9 · EXACT DISCRETE RESEARCH INSTRUMENT</span><h3>Time, rotation and return</h3><p>Run six declared integer-linear models. Compare rotate-then-evolve against evolve-then-rotate, and distinguish return up to rotation from ordinary return. Results are exact for the selected model, not physical measurements.</p></div></header>
  <div className="r316-grid">
   <article className="r316-card"><h3>Model and state</h3>
    <label>Evolution model <select data-v9-model value={model} onChange={e=>setModel(e.target.value)}>{V9_SCENARIO_NAMES.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
    <label>Initial x <input data-v9-x inputMode="numeric" value={x} onChange={e=>setX(e.target.value)}/></label>
    <label>Initial y <input data-v9-y inputMode="numeric" value={y} onChange={e=>setY(e.target.value)}/></label>
    <label>Time steps (0–16) <input data-v9-time inputMode="numeric" value={t} onChange={e=>setT(e.target.value)}/></label>
    <label>Quarter turns (−16–16) <input data-v9-rotation inputMode="numeric" value={q} onChange={e=>setQ(e.target.value)}/></label>
   </article>
   <article className="r316-card" data-v9-result><h3>Executed exact witness</h3>
    {result.packet?<><p>Composition defect squared: <strong data-v9-composition>{result.packet.composition.squaredDefect}</strong></p>
      <p>Rotated-return defect squared: <strong data-v9-return>{result.packet.rotatedReturn.squaredDefect}</strong></p>
      <p>Global C4 equivariance within this linear model: <strong data-v9-equivariance>{result.packet.equivariance.allIntegerStatesAndAllQuarterTurns?'YES':'NO'}</strong></p>
      <p>Residuals: {result.packet.composition.residual.join(', ')} / {result.packet.rotatedReturn.residual.join(', ')}</p>
      <button data-v9-export type="button" onClick={exportPacket}>Export exact witness JSON</button></>:<p role="alert">{result.error}</p>}
   </article>
  </div>
  <details><summary>Recover and verify an exported witness</summary><textarea data-v9-import aria-label="V9 JSON witness" rows={5} value={importText} onChange={e=>setImportText(e.target.value)}/><button data-v9-verify type="button" onClick={verifyImport}>Verify against fresh computation</button><p data-v9-recovery role="status">{recovery}</p></details>
  <p className="r316-boundary">Research boundary: finite exact integer-linear dynamics only. No physical time law, universal nonlinear theorem, automatic proof promotion, device execution or CanonState mutation.</p>
 </section>;
}
