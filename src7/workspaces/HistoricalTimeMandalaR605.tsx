import {useEffect,useMemo,useState} from 'react';
import {replayWorkbookFrameR604,workbookClockR604} from './timeMandalaFormulaReplayR604';
import {historicalNamedStateR603,HISTORICAL_SEVEN_STAR_OPERATORS,SEVEN_STAR_HISTORICAL_SOURCES} from './sevenStarHistoricalAuthorityR602';
import {reconcileHistoricalBatchR663} from './historicalSourceReconciliationR663';
type Props={address:number;onAddress:(n:number)=>void};
function secondsNow(){const d=new Date();return d.getHours()*3600+d.getMinutes()*60+d.getSeconds()}
export default function HistoricalTimeMandalaR605({address,onAddress}:Props){
 const[seconds,setSeconds]=useState(secondsNow),[live,setLive]=useState(false);
 useEffect(()=>{if(!live)return;setSeconds(secondsNow());const id=window.setInterval(()=>setSeconds(secondsNow()),1000);return()=>window.clearInterval(id)},[live]);
 const[reconSource,setReconSource]=useState('STATE_COORDINATES');
 const[reconInput,setReconInput]=useState('');
 const[reconReceipt,setReconReceipt]=useState<ReturnType<typeof reconcileHistoricalBatchR663>|null>(null);
 const[reconError,setReconError]=useState('');
 useEffect(()=>{setReconReceipt(null);setReconError('')},[address,seconds]);
 const compareRows=(offset:number)=>{
  try{
   if(reconInput.length>262144)throw Error('INPUT_TOO_LARGE_256K');
   const parsed:unknown=JSON.parse(reconInput);
   if(!Array.isArray(parsed))throw Error('EXPECTED_JSON_ARRAY');
   const result=reconcileHistoricalBatchR663(parsed,{sourceId:reconSource,seconds,offset,limit:256});
   setReconReceipt(result);setReconError('');
  }catch(error){setReconReceipt(null);setReconError(error instanceof Error?error.message:String(error))}
 };
 const clock=useMemo(()=>workbookClockR604(seconds),[seconds]);
 const frame=useMemo(()=>replayWorkbookFrameR604(address,seconds),[address,seconds]);
 const named=useMemo(()=>historicalNamedStateR603(address),[address]);
 return <section data-r605-historical-mandala='true' aria-label='Historical Time Mandala workbook replay' style={{padding:16,border:'1px solid #64748b',borderRadius:12,marginTop:12}}>
  <h3>Time Mandala of Matter · Original Workbook Formula Replay</h3>
  <p>Source: Time_Mandala_of_Matter_20736D_Excel_Engine.xlsx · exact 12⁴ model-address indexing. Color/matter correspondences are symbolic, not measured physical states.</p>
  <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
   <label><input type='checkbox' checked={live} onChange={e=>setLive(e.target.checked)}/> Live local clock</label>
   <label>Clock position (seconds since midnight) <input aria-label='Historical clock seconds' type='range' min='0' max='86399' step='1' disabled={live} value={seconds} onChange={e=>setSeconds(Number(e.target.value))}/></label>
   <output data-r605-sector='true'>Sector {clock.liveSector}/7 · phase {(clock.phaseProgress*100).toFixed(2)}%</output>
  </div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
   {HISTORICAL_SEVEN_STAR_OPERATORS.map(star=><div key={star.sector} style={{border:'2px solid '+star.hex,padding:8,borderRadius:8,opacity:star.sector===frame.activeStar?1:.5}} aria-current={star.sector===frame.activeStar?'true':undefined}>
    <strong>{star.sector} · {star.color}</strong><div>{star.operator}</div>
   </div>)}
  </div>
  <p data-r605-frame='true'><b>Address {address+1}/20,736</b> · {named.domain} / {named.phase} / {named.regulation} / {named.scale}</p>
  <p>Base star {frame.baseStar} → active star {frame.activeStar} ({frame.activeColor}) · {frame.operator} · {frame.matterAnalogy}</p>
  <p>θ center {frame.thetaCenter.toFixed(6)} rad · local blend {frame.localBlendWeight.toFixed(6)} · Mode 188 gate <b>{frame.mode188Gate}</b> · dispatch {frame.deweyDispatch}</p>
  <p>Truth: {frame.truthRank} · canonical address remains controlled by the parent workspace.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button onClick={()=>onAddress((address+20735)%20736)}>Previous address</button>
   <button onClick={()=>onAddress((address+1)%20736)}>Next address</button>
   <button onClick={()=>{setLive(false);setSeconds(0)}}>Reset clock to sector 1</button>
  </div>
  <div data-r663-reconciliation='true' style={{marginTop:16,padding:12,border:'1px solid #64748b',borderRadius:8}}>
   <h4>Historical source reconciliation · R663</h4>
   <p>Compare supplied JSON evidence rows against the executable R602/R604 formula replay at the selected clock. This does not authenticate original bytes, prove source provenance, change canonical state, or establish historical application parity. Pasted rows stay in this page session.</p>
   <label>Declared source <select aria-label='Reconciliation source' value={reconSource} onChange={e=>{setReconSource(e.target.value);setReconReceipt(null);setReconError('')}}>{SEVEN_STAR_HISTORICAL_SOURCES.map(s=><option key={s.id} value={s.id}>{s.id}</option>)}</select></label>
   <label style={{display:'block'}}>Evidence rows (JSON array; sourceId, row, address and at least one of digits/baseStar/activeStar/mode188Gate)
    <textarea aria-label='Reconciliation evidence JSON' rows={5} value={reconInput} onChange={e=>{setReconInput(e.target.value);setReconReceipt(null);setReconError('')}} placeholder='[{"sourceId":"STATE_COORDINATES","row":0,"address":0,"baseStar":1}]' style={{display:'block',width:'100%',maxWidth:'100%',boxSizing:'border-box'}}/>
   </label>
   <button type='button' data-r663-compare onClick={()=>compareRows(0)}>Compare first 256 rows</button>
   {reconError&&<p role='alert' data-r663-error='true'>Comparison held: {reconError}</p>}
   {reconReceipt&&<div role='status' data-r663-receipt='true'>
    <p>Compared {reconReceipt.processed} rows · {reconReceipt.accepted} matching rows · {reconReceipt.checkedFields} checked fields · {reconReceipt.discrepancies.length} field discrepancies · offset {reconReceipt.offset}</p>
    <p>Truth: {reconReceipt.truthClass}. Original source authenticated: no. Canonical mutation: no.</p>
    {reconReceipt.discrepancies.length>0&&<ol data-r663-discrepancies='true'>{reconReceipt.discrepancies.slice(0,30).map((d,i)=><li key={i}>Row {d.row} address {d.address} · {d.field}: expected {d.expected}, supplied {d.actual}</li>)}</ol>}
    {reconReceipt.discrepancies.length>30&&<small>Showing first 30 discrepancies of this batch.</small>}
    {reconReceipt.nextOffset!==null&&<button type='button' data-r663-next onClick={()=>compareRows(reconReceipt.nextOffset!)}>Compare next batch from {reconReceipt.nextOffset}</button>}
   </div>}
  </div>
 </section>;
}
