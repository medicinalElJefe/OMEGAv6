import {useMemo,useState} from 'react';
import {R764_LOCAL_KEY,createCanonReplayCheckpointR764,verifyCanonReplayCheckpointR764} from '../../src/proof/canonTrajectoryR764.js';
import {computeCanonMandalaBridgeR767} from './canonMandalaBridgeR767.ts';

type Loaded={raw:string};
const errorText=(e:unknown)=>e instanceof Error?e.message:String(e);

/** Execute a verified Science path against the historical R604 clock/formulas. */
export default function VerifiedCanonMandalaR767({seconds,onAddress}:{seconds:number;onAddress:(address:number)=>void}){
 const [loaded,setLoaded]=useState<Loaded|null>(null);
 const [status,setStatus]=useState('Load a saved Science → Relativity path to compare each symbolic step with the original Time Mandala formula replay.');
 const [error,setError]=useState('');
 const bridge=useMemo(()=>loaded?computeCanonMandalaBridgeR767(loaded.raw,seconds):null,[loaded,seconds]);
 const read=()=>{
  const raw=localStorage.getItem(R764_LOCAL_KEY);
  if(raw===null)throw Error('No saved R764 Science path in this browser.');
  verifyCanonReplayCheckpointR764(raw);
  return raw;
 };
 const load=()=>{try{
  const raw=read();computeCanonMandalaBridgeR767(raw,seconds);
  setLoaded({raw});setError('');setStatus('Verified path and exact workbook formula replay loaded.');
 }catch(e){setLoaded(null);setStatus('');setError('REFUSED: '+errorText(e));}};
 const project=(index:number)=>{try{
  if(!loaded||!bridge)throw Error('Load a verified path first.');
  const raw=read();
  if(raw!==loaded.raw)throw Error('Saved Science checkpoint changed since loading; reload and reverify.');
  if(!Number.isSafeInteger(index)||index<0||index>=bridge.frames.length)throw RangeError('Frame outside verified path.');
  const original=verifyCanonReplayCheckpointR764(raw);
  const next=createCanonReplayCheckpointR764(original.witness,index);
  const nextRaw=JSON.stringify(next);
  localStorage.setItem(R764_LOCAL_KEY,nextRaw);
  const confirmed=computeCanonMandalaBridgeR767(read(),seconds);
  if(confirmed.selectedFrame!==index)throw Error('Post-write verification failed.');
  onAddress(confirmed.frames[index].address);
  setLoaded({raw:nextRaw});setError('');
  setStatus('Projected frame '+(index+1)+' to Atlas '+confirmed.frames[index].address+' and updated the Science checkpoint.');
 }catch(e){setLoaded(null);setStatus('');setError('REFUSED: '+errorText(e));}};
 const selected=bridge?.selectedFrame??0;
 return <section data-r767-canon-mandala="executable" aria-label="Verified Canon Time Mandala bridge"
  style={{padding:12,margin:'12px 0',border:'1px solid #64748b',borderRadius:8,maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
  <h4>R767 · Canon trajectory × Time Mandala</h4>
  <p>Compute every verified symbolic path step against the actual R604 seven-star workbook formulas at the clock position above. The same selected frame drives the shared 20,736-address Atlas viewport.</p>
  <button type="button" data-r767-load onClick={load}>Load and verify Science trajectory</button>
  {error&&<p role="alert" data-r767-error>{error}</p>}
  {status&&<p role="status" data-r767-status>{status}</p>}
  {bridge&&<div data-r767-session>
   <p data-r767-sector>Workbook sector {bridge.clockSector}/7 · clock {bridge.seconds} seconds · {bridge.frames.length} independently recomputed path frames</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type="button" data-r767-prev disabled={selected===0} onClick={()=>project(selected-1)}>Previous path frame</button>
    <button type="button" data-r767-project onClick={()=>project(selected)}>Project selected frame</button>
    <button type="button" data-r767-next disabled={selected===bridge.frames.length-1} onClick={()=>project(selected+1)}>Next path frame</button>
   </div>
   <ol data-r767-frames style={{maxHeight:340,overflowY:'auto',paddingLeft:24}}>
    {bridge.frames.map(frame=><li key={frame.index} style={{padding:'5px 0'}}>
     <button type="button" data-r767-frame={frame.index} aria-current={frame.index===selected?'step':undefined}
      onClick={()=>project(frame.index)}>
      {frame.index+1}. Atlas {frame.address} · Canon {frame.canonDecision} · star {frame.workbookActiveStar} · {frame.workbookOperator} · workbook {frame.workbookMode188Gate}
     </button>
     {frame.index===selected&&<strong data-r767-selected> Selected · exact carry {frame.exactScoreCarry.numerator}/{frame.exactScoreCarry.denominator} · boundary scars {frame.boundaryScars}</strong>}
    </li>)}
   </ol>
  </div>}
  <small data-r767-boundary>Canon decision/Mode 188 and workbook gate are distinct models, not equivalent measurements. Clock changes recompute the historical symbolic projection; they do not predict physical evolution. Every address projection revalidates the saved witness and refuses changed or altered source. Browser-local only; no authenticated donor provenance, native execution, CanonState admission or cross-device sync.</small>
 </section>;
}
