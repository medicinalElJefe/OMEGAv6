import {useMemo,useState} from 'react';
import {V9_MODELS,V9_SCENARIO_NAMES,compositionDefect,rotatedReturnDefect,equivarianceCertificate,DEWEY_V9_BOUNDARY} from './proof/deweyTemporalRotationV9.js';

/** Research-only, executable UI. No CanonState, provider, or physical inference. */
const SCHEMA='omega.dewey-v9.temporal-workbench.v1';
const parseBounded=(raw:string,lo:number,hi:number,label:string)=>{
 if(!/^-?(0|[1-9][0-9]*)$/.test(raw)||!Number.isSafeInteger(Number(raw))||Number(raw)<lo||Number(raw)>hi)throw Error(label+' must be an integer from '+lo+' to '+hi);
 return Number(raw);
};
export function computeTemporalWorkbenchV9(modelName:string,xRaw:string,yRaw:string,tRaw:string,qRaw:string){
 if(!Object.prototype.hasOwnProperty.call(V9_MODELS,modelName))throw Error('Unsupported research model');
 const x=parseBounded(xRaw,-20,20,'x'),y=parseBounded(yRaw,-20,20,'y');
 const t=parseBounded(tRaw,0,16,'time'),q=parseBounded(qRaw,-16,16,'quarter turns');
 const model=V9_MODELS[modelName as keyof typeof V9_MODELS];
 return {schema:SCHEMA,modelName,initialState:[x,y],timeSteps:t,quarterTurns:q,
  composition:compositionDefect(model,[x,y],t,q),
  rotatedReturn:rotatedReturnDefect(model,[x,y],t,q),
  equivariance:equivarianceCertificate(model),
  boundary:DEWEY_V9_BOUNDARY,
  source:'DECLARED_INTEGER_LINEAR_MODEL_ONLY',productionAuthority:false,physicalMeasurement:false};
}
export function verifyTemporalWorkbenchV9(raw:string){
 if(typeof raw!=='string'||raw.length>8192)throw Error('V9 import size refused');
 let packet:any;try{packet=JSON.parse(raw)}catch{throw Error('V9 invalid JSON')}
 if(!packet||packet.schema!==SCHEMA||!Array.isArray(packet.initialState)||packet.initialState.length!==2)throw Error('V9 schema refused');
 const [x,y]=packet.initialState;
 if(![x,y,packet.timeSteps,packet.quarterTurns].every(Number.isSafeInteger))throw Error('V9 exact integer fields required');
 const expected=computeTemporalWorkbenchV9(String(packet.modelName),String(x),String(y),String(packet.timeSteps),String(packet.quarterTurns));
 if(JSON.stringify(packet)!==JSON.stringify(expected))throw Error('V9 imported packet differs from fresh computation');
 return expected;
}
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
