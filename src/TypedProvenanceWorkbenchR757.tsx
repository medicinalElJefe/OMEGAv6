import {useEffect,useMemo,useState} from 'react';
import {computeTypedProvenanceWitnessR757,verifyTypedProvenanceWitnessR757} from './proof/canonCrossDomainProvenanceR757.js';
import {conditionalCanonGateR758} from './proof/canonPrecisionIntervalR758.js';
import {jointCanonPrecisionR759,computeJointCanonWitnessR759,verifyJointCanonWitnessR759} from './proof/canonJointPrecisionR759.js';
import {observerRelativeCanonR760} from './proof/deweyObserverTransportR760.js';
import {reconstructCanonIndexR761,computeCanonIndexWitnessR761,verifyCanonIndexWitnessR761} from './proof/canonIndexReconstructionR761.js';

type Props={address:number;onAddress:(address:number)=>void};
const parseIndex=(value:string,max:number,name:string)=>{
 if(!/^(0|[1-9][0-9]*)$/.test(value))throw new RangeError(name+' must be a nonnegative integer');
 const n=Number(value);
 if(!Number.isSafeInteger(n)||n>max)throw new RangeError(name+' must be 0..'+max);
 return n;
};
const parseMetric=(value:string,name:string)=>{
 if(!/^(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)$/.test(value))throw new RangeError(name+' must be a positive decimal');
 const n=Number(value);
 if(!Number.isFinite(n)||n<=0)throw new RangeError(name+' must be positive and finite');
 return n;
};
/** Interactive coordinate provenance, not cross-ontology identity or an observation. */
export default function TypedProvenanceWorkbenchR757({address,onAddress}:Props){
 const[slot,setSlot]=useState(String(address)),[domain,setDomain]=useState('1');
 const[c,setC]=useState('0.1'),[phi,setPhi]=useState('0.42'),[q,setQ]=useState('0.1'),[lambda,setLambda]=useState('0.1');
 const[storedS,setStoredS]=useState('0.2090');
 const[referenceLo,setReferenceLo]=useState('0.2090'),[referenceHi,setReferenceHi]=useState('0.2091'),[transportError,setTransportError]=useState('0.00001');
 const[importText,setImportText]=useState(''),[recovery,setRecovery]=useState('');
 const[jointImport,setJointImport]=useState(''),[jointRecovery,setJointRecovery]=useState('');
 const[canonAxes,setCanonAxes]=useState({D:1,S:1,R:1,M:1,P:1});
 const[canonImport,setCanonImport]=useState(''),[canonRecovery,setCanonRecovery]=useState('');
 const canonRow=useMemo(()=>reconstructCanonIndexR761(canonAxes.D,canonAxes.S,canonAxes.R,canonAxes.M,canonAxes.P),[canonAxes]);
 useEffect(()=>setSlot(String(address)),[address]);
 const result=useMemo(()=>{
  try{return {packet:computeTypedProvenanceWitnessR757({
   slot0:parseIndex(slot,20735,'Atlas address'),
   domain1:parseIndex(domain,12,'Canon domain'),
   metrics:{c:parseMetric(c,'C'),phi:parseMetric(phi,'Phi'),q:parseMetric(q,'q'),lambda:parseMetric(lambda,'Lambda')}
  }),error:''};}
  catch(e){return {packet:null,error:e instanceof Error?e.message:String(e)};}
 },[slot,domain,c,phi,q,lambda]);
 const precision=useMemo(()=>{
  try{return {certificate:conditionalCanonGateR758({c,phi,q,lambda}),error:''};}
  catch(e){return {certificate:null,error:e instanceof Error?e.message:String(e)};}
 },[c,phi,q,lambda]);
 const combined=useMemo(()=>{
  try{return {certificate:jointCanonPrecisionR759({c,phi,q,lambda},storedS),error:''};}
  catch(e){return {certificate:null,error:e instanceof Error?e.message:String(e)};}
 },[c,phi,q,lambda,storedS]);
 const observer=useMemo(()=>{
  try{return {certificate:observerRelativeCanonR760({metrics:{c,phi,q,lambda},storedScore:storedS,
   referenceLower:referenceLo,referenceUpper:referenceHi,error:transportError}),error:''};}
  catch(e){return {certificate:null,error:e instanceof Error?e.message:String(e)};}
 },[c,phi,q,lambda,storedS,referenceLo,referenceHi,transportError]);
 const exportWitness=()=>{
  if(!result.packet)return;
  const raw=JSON.stringify(result.packet,null,2);
  setImportText(raw);setRecovery('Exported. Recompute the witness to verify.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r757-typed-provenance.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportJoint=()=>{
  if(!combined.certificate)return;
  const raw=JSON.stringify(computeJointCanonWitnessR759({c,phi,q,lambda},storedS),null,2);
  setJointImport(raw);setJointRecovery('Exported conditional witness; recompute to verify.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r759-conditional-joint-precision.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const verifyJoint=()=>{
  try{verifyJointCanonWitnessR759(jointImport);setJointRecovery('PASS: exact joint witness recomputed; no live authority.');}
  catch(e){setJointRecovery('REFUSED: '+(e instanceof Error?e.message:'Invalid joint witness'));}
 };
 const exportCanon=()=>{
  const raw=JSON.stringify(computeCanonIndexWitnessR761(canonAxes),null,2);
  setCanonImport(raw);setCanonRecovery('Exported deterministic model witness; verify by recomputation.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r761-canon-reconstruction.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const verifyCanon=()=>{
  try{verifyCanonIndexWitnessR761(canonImport);setCanonRecovery('PASS: R761 index-only witness recomputed; no source authority.');}
  catch(e){setCanonRecovery('REFUSED: '+(e instanceof Error?e.message:'Invalid reconstruction witness'));}
 };
 const verify=()=>{
  try{verifyTypedProvenanceWitnessR757(importText);setRecovery('PASS: typed witness deterministically recomputed.');}
  catch(e){setRecovery('REFUSED: '+(e instanceof Error?e.message:'Invalid witness'));}
 };
 return <section className="r316-research" data-r757-typed-workbench="executable" aria-label="R757 typed coordinate provenance explorer">
  <header className="r316-head"><div><span>R757 · EXECUTABLE TYPED PROVENANCE</span>
   <h3>Compare independent address systems without conflating them</h3>
   <p>Choose one V8 source slot, a separate Canon5 domain and hypothetical decision metrics. Calculate their typed keys, Mode 188 index and modeled decision. Matching numbers do not establish shared meaning.</p></div></header>
  <div className="r316-grid">
   <article className="r316-card"><h3>Selected inputs</h3>
    <label>V8 source address (0–20735) <input data-r757-slot inputMode="numeric" value={slot} onChange={e=>setSlot(e.target.value)}/></label>
    <label>Independent Canon5 domain <select data-r757-domain value={domain} onChange={e=>setDomain(e.target.value)}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
    <p>Hypothetical metrics (not measured or imported Canon observations)</p>
    <label>C <input data-r757-c inputMode="decimal" value={c} onChange={e=>setC(e.target.value)}/></label>
    <label>Phi <input data-r757-phi inputMode="decimal" value={phi} onChange={e=>setPhi(e.target.value)}/></label>
    <label>q <input data-r757-q inputMode="decimal" value={q} onChange={e=>setQ(e.target.value)}/></label>
    <label>Lambda <input data-r757-lambda inputMode="decimal" value={lambda} onChange={e=>setLambda(e.target.value)}/></label>
     <label>Hypothetical stored S (four decimals) <input data-r759-stored-s inputMode="decimal" value={storedS} onChange={e=>setStoredS(e.target.value)}/></label>
    <button type="button" disabled={!result.packet||result.packet.inputs.slot0===address} onClick={()=>{if(result.packet)onAddress(result.packet.inputs.slot0)}} data-r757-commit>Navigate selected atlas address</button>
   </article>
   <article className="r316-card"><h3>Executed typed comparison</h3>
    {result.packet?<><p>V8 D/P/R/L: <strong data-r757-v8>{result.packet.coordinates.v8Id}</strong></p>
     <p>PSC PingID (ordinal only): <strong data-r757-psc>{result.packet.coordinates.pscPingId}</strong></p>
     <p>Canon5 D/S/R/M/P: <strong data-r757-canon>{result.packet.coordinates.canon5Key}</strong></p>
     <p>Mode 188 computed index: <strong data-r757-mode>{result.packet.coordinates.mode188}</strong></p>
     <p>Hypothetical decision: <strong data-r757-decision>{result.packet.modeledDecision.decision}</strong></p>
     <p>Score: {result.packet.modeledDecision.score.toPrecision(9)}</p>
      <p>Four-decimal source assumption: <strong data-r758-precision-gate>{precision.certificate?.conditionalGate||'PRECISION_INPUT_REQUIRED'}</strong></p>
      <p data-r758-precision-scope>{precision.certificate?'Conditional arithmetic only; not original-precision or live action evidence.':precision.error}</p>
      <p>Combined input-and-score evidence: <strong data-r759-joint-gate>{combined.certificate?.jointGate||'PRECISION_INPUT_REQUIRED'}</strong></p>
      <p data-r759-joint-scope>{combined.certificate?(combined.certificate.status==='INCOMPATIBLE_CONDITIONAL_OBSERVATIONS_HOLD'?'Incompatible supplied score; no inference.':'Stronger conditional same-source rounding assumption; never live action.') : combined.error}</p>
     <button type="button" data-r759-export disabled={!combined.certificate} onClick={exportJoint}>Export conditional joint witness JSON</button>
     <p>Semantic identity: <strong>NOT PROVED</strong> · External source validation: <strong>NOT PROVIDED</strong></p>
     <button type="button" data-r757-export onClick={exportWitness}>Export computed witness JSON</button>
    </>:<p role="alert" data-r757-error>{result.error}</p>}
   </article>
  </div>
  <details data-r760-observer-panel>
   <summary>V26 hypothetical observer-relative transport — research, not measured motion</summary>
   <label>Reference score lower <input data-r760-reference-low inputMode="decimal" value={referenceLo} onChange={e=>setReferenceLo(e.target.value)}/></label>
   <label>Reference score upper <input data-r760-reference-high inputMode="decimal" value={referenceHi} onChange={e=>setReferenceHi(e.target.value)}/></label>
   <label>Assumed absolute transport error <input data-r760-error inputMode="decimal" value={transportError} onChange={e=>setTransportError(e.target.value)}/></label>
   <p>Conditional transport gate: <strong data-r760-gate>{observer.certificate?.conditionalGate||'INVALID_INTERVAL'}</strong></p>
   <p data-r760-status>{observer.certificate?.status||observer.error}</p>
   <p>These reference measurements and their error bounds have NOT been authenticated. An apparent decision never authorizes a live Canon action.</p>
  </details>
  <details data-r761-canon-panel>
   <summary>V27 executable Canon5 index-only reconstruction — 248,832 modeled states</summary>
   <p>Choose five independent 1–12 axes. This inferred exact-rational generator reproduces the recorded source dataset at four decimals, without authenticating the historical generator or any physical measurement.</p>
   <div className="r316-grid">
    {(['D','S','R','M','P'] as const).map(axis=><label key={axis}>Canon {axis} axis
     <select data-r761-axis={axis} value={String(canonAxes[axis])} onChange={e=>setCanonAxes(prev=>({...prev,[axis]:Number(e.target.value)}))}>
      {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
     </select></label>)}
   </div>
   <p>Reconstructed source address: <strong data-r761-index>{canonRow.index}</strong> · <strong data-r761-key>{canonRow.key}</strong></p>
   <p>Mode 188: <strong data-r761-mode>{canonRow.mode188}</strong> · CΩ {canonRow.C} · Φ {canonRow.Phi} · q {canonRow.q} · Λ {canonRow.lambda}</p>
   <p>Exact-before-rounding coherence: <strong data-r761-score>{canonRow.score}</strong> · Replayed label: <strong data-r761-decision>{canonRow.decision}</strong></p>
   <p data-r761-boundary>Model replay only: the original source generator is not authenticated; no CanonState mutation, physical 5D inference or live action is authorized.</p>
   <button type="button" data-r761-export onClick={exportCanon}>Export reconstructed witness JSON</button>
   <label>Recover a reconstructed witness
    <textarea rows={5} data-r761-import aria-label="R761 reconstruction witness JSON" value={canonImport} onChange={e=>setCanonImport(e.target.value)}/>
   </label>
   <button type="button" data-r761-verify onClick={verifyCanon}>Recompute and verify reconstruction</button>
   <p role="status" data-r761-recovery>{canonRecovery}</p>
  </details>
  <details data-r757-recovery-panel><summary>Recover and independently verify a witness</summary>
   <textarea rows={5} data-r757-import aria-label="R757 typed witness JSON" value={importText} onChange={e=>setImportText(e.target.value)}/>
   <button type="button" data-r757-verify onClick={verify}>Recompute and verify</button>
   <p role="status" data-r757-recovery>{recovery}</p>
  </details>
  <details data-r759-recovery-panel><summary>Recover and recompute R759 conditional joint evidence</summary>
   <textarea rows={5} data-r759-import aria-label="R759 conditional joint witness JSON" value={jointImport} onChange={e=>setJointImport(e.target.value)}/>
   <button type="button" data-r759-verify onClick={verifyJoint}>Recompute joint witness</button>
   <p role="status" data-r759-recovery>{jointRecovery}</p>
  </details>
  <p className="r316-boundary">Only finite ordinal/key calculations and hypothetical Mode 188 decision arithmetic execute here. This does not validate external PSC/Canon source rows, global theorems, physical dimensions, autonomous Ping, production authority or device action.</p>
 </section>;
}
