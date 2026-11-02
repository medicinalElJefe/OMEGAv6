import {useMemo,useState} from 'react';
import {R764_LOCAL_KEY,createCanonReplayCheckpointR764,verifyCanonReplayCheckpointR764} from '../../src/proof/canonTrajectoryR764.js';
import {computeCanonMandalaBridgeR767} from './canonMandalaBridgeR767.ts';
import {computeCanonMandalaSweepR768,verifyCanonMandalaSweepR768} from './canonMandalaSweepR768.ts';

type Loaded={raw:string};
const errorText=(e:unknown)=>e instanceof Error?e.message:String(e);

/** Execute a verified Science path against the historical R604 clock/formulas. */
export default function VerifiedCanonMandalaR767({seconds,onAddress,onClock}:{seconds:number;onAddress:(address:number)=>void;onClock:(seconds:number)=>void}){
 const [loaded,setLoaded]=useState<Loaded|null>(null);
 const [status,setStatus]=useState('Load a saved Science → Relativity path to compare each symbolic step with the original Time Mandala formula replay.');
 const [error,setError]=useState('');
 const [sweepOpen,setSweepOpen]=useState(false);
 const [sweepJson,setSweepJson]=useState('');
 const [sweepError,setSweepError]=useState('');
 const sweep=useMemo(()=>loaded&&sweepOpen?computeCanonMandalaSweepR768(loaded.raw):null,[loaded,sweepOpen]);
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
 const project=(index:number,clockSeconds=seconds)=>{try{
  if(!loaded||!bridge)throw Error('Load a verified path first.');
  const raw=read();
  if(raw!==loaded.raw)throw Error('Saved Science checkpoint changed since loading; reload and reverify.');
  if(!Number.isSafeInteger(index)||index<0||index>=bridge.frames.length)throw RangeError('Frame outside verified path.');
  const original=verifyCanonReplayCheckpointR764(raw);
  const next=createCanonReplayCheckpointR764(original.witness,index);
  const nextRaw=JSON.stringify(next);
  const confirmed=computeCanonMandalaBridgeR767(nextRaw,clockSeconds);
  if(confirmed.selectedFrame!==index)throw Error('Pre-write source recomputation failed.');
  localStorage.setItem(R764_LOCAL_KEY,nextRaw);
  try{if(read()!==nextRaw)throw Error('Post-write verification failed.');}
  catch(e){localStorage.setItem(R764_LOCAL_KEY,raw);throw e;}
  if(clockSeconds!==seconds)onClock(clockSeconds);
  onAddress(confirmed.frames[index].address);
  setLoaded({raw:nextRaw});setError('');
  setStatus('Projected frame '+(index+1)+' at sector '+confirmed.clockSector+' to Atlas '+confirmed.frames[index].address+' and updated the Science checkpoint.');
 }catch(e){setLoaded(null);setStatus('');setError('REFUSED: '+errorText(e));}};
 const recoverSweep=()=>{try{
  const verified=verifyCanonMandalaSweepR768(sweepJson);
  localStorage.setItem(R764_LOCAL_KEY,verified.sourceCheckpoint);
  if(localStorage.getItem(R764_LOCAL_KEY)!==verified.sourceCheckpoint)throw Error('Local checkpoint recovery failed.');
  setLoaded({raw:verified.sourceCheckpoint});setSweepOpen(true);setSweepError('');setError('');
  setStatus('Verified all seven clock sectors and restored the source-recomputed Science checkpoint locally.');
 }catch(e){setSweepError('REFUSED: '+errorText(e));}};
 const downloadSweep=()=>{if(!sweep)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(sweep,null,2)],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='omega-r768-seven-sector-sweep.json';
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
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
  <div data-r768-instrument style={{marginTop:12,padding:8,border:'1px solid #64748b',borderRadius:8}}>
   <h5>R768 · Seven-sector trajectory sweep</h5>
   <p>Execute all seven historical clock sectors against every independently verified path frame. Each cell can set the actual Time Mandala clock and project its Atlas address; the seven-star return is checked as a complete cycle.</p>
   <button type="button" data-r768-open onClick={()=>setSweepOpen(value=>!value)}>{sweepOpen?'Hide':'Compute'} seven-sector sweep</button>
   {sweep&&<div data-r768-sweep>
    <p data-r768-summary>{sweep.sectors.length} sectors × {sweep.frameCount} path frames · {sweep.verifiedStarTransitions} exact cyclic transitions · complete cycle {String(sweep.completeSevenSectorCycle)}</p>
    <div style={{overflowX:'auto',maxWidth:'100%'}}>
     <table aria-label="Seven-sector Canon Time Mandala sweep" style={{borderCollapse:'collapse',width:'100%',fontSize:'0.85rem'}}>
      <thead><tr><th scope="col">Clock sector</th>{sweep.sectors[0].frames.map(cell=><th scope="col" key={cell.index}>Path {cell.index+1}</th>)}</tr></thead>
      <tbody>{sweep.sectors.map(sector=><tr key={sector.sector}>
       <th scope="row">Sector {sector.sector}</th>
       {sector.frames.map(cell=><td key={cell.index} style={{padding:3,border:'1px solid #64748b'}}>
        <button type="button" data-r768-cell={sector.sector+'-'+cell.index}
         aria-label={'Project sector '+sector.sector+' path '+(cell.index+1)}
         onClick={()=>project(cell.index,sector.seconds)}
         style={{minWidth:70}}>
         Star {cell.activeStar} · {cell.mode188Gate}
        </button>
       </td>)}
      </tr>)}</tbody>
     </table>
    </div>
    <button type="button" data-r768-export onClick={()=>setSweepJson(JSON.stringify(sweep))}>Export computed JSON to editor</button>
    <button type="button" data-r768-download onClick={downloadSweep}>Download verified sweep JSON</button>
   </div>}
   <label style={{display:'block',marginTop:8}}>Portable sweep JSON (local, bounded, independently recomputed)
    <textarea aria-label="R768 sweep JSON" rows={3} value={sweepJson}
     onChange={e=>{setSweepJson(e.target.value);setSweepError('')}} style={{display:'block',width:'100%',maxWidth:'100%',boxSizing:'border-box'}}/>
   </label>
   <button type="button" data-r768-recover onClick={recoverSweep}>Verify and restore sweep JSON</button>
   {sweepError&&<p role="alert" data-r768-error>{sweepError}</p>}
   <small>Finite symbolic model only. No physical time forecast, donor-byte authentication, CanonState admission or cross-device memory.</small>
  </div>
  <small data-r767-boundary>Canon decision/Mode 188 and workbook gate are distinct models, not equivalent measurements. Clock changes recompute the historical symbolic projection; they do not predict physical evolution. Every address projection revalidates the saved witness and refuses changed or altered source. Browser-local only; no authenticated donor provenance, native execution, CanonState admission or cross-device sync.</small>
 </section>;
}
