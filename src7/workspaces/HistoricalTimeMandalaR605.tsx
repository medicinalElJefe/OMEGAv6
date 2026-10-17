import {useEffect,useMemo,useState} from 'react';
import {replayWorkbookFrameR604,workbookClockR604} from './timeMandalaFormulaReplayR604';
import {historicalNamedStateR603,HISTORICAL_SEVEN_STAR_OPERATORS} from './sevenStarHistoricalAuthorityR602';
type Props={address:number;onAddress:(n:number)=>void};
function secondsNow(){const d=new Date();return d.getHours()*3600+d.getMinutes()*60+d.getSeconds()}
export default function HistoricalTimeMandalaR605({address,onAddress}:Props){
 const[seconds,setSeconds]=useState(secondsNow),[live,setLive]=useState(false);
 useEffect(()=>{if(!live)return;setSeconds(secondsNow());const id=window.setInterval(()=>setSeconds(secondsNow()),1000);return()=>window.clearInterval(id)},[live]);
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
 </section>;
}
