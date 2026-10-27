import {useEffect,useMemo,useState} from 'react';
import {DEFAULT_MOTION_R537,R537_STORAGE_KEY,exportMotionSnapshotR537,importMotionSnapshotR537,motionTraceR537,type MotionPacketR537} from './motionSourceR537';
import './motionSourceR537.css';
const initial=()=>{
 try{const raw=localStorage.getItem(R537_STORAGE_KEY);if(raw){const s=importMotionSnapshotR537(raw);return{packet:s.packet,steps:s.steps};}}catch{}
 return{packet:{...DEFAULT_MOTION_R537},steps:12};
};
export default function MotionSourceInstrumentR537(){
 const[initialState]=useState(initial);
 const[packet,setPacket]=useState<MotionPacketR537>(initialState.packet);
 const[steps,setSteps]=useState(initialState.steps);
 const[snapshotText,setSnapshotText]=useState('');
 const[status,setStatus]=useState('');
 const trace=useMemo(()=>motionTraceR537(packet,steps),[packet,steps]);
 const sequence=trace.sequence;
 const change=(key:keyof MotionPacketR537,value:number|boolean)=>{setPacket(p=>({...p,[key]:value}));setStatus('');};
 const nodes=[packet,...sequence.map(x=>x.after)];
 useEffect(()=>{try{localStorage.setItem(R537_STORAGE_KEY,exportMotionSnapshotR537(packet,steps));}catch{setStatus('LOCAL_STORAGE_UNAVAILABLE: export remains available');}},[packet,steps]);
 const exportSnapshot=()=>{setSnapshotText(exportMotionSnapshotR537(packet,steps));setStatus('LOCAL_MODEL_EXPORTED: no network upload or canonical mutation');};
 const importSnapshot=()=>{try{const snapshot=importMotionSnapshotR537(snapshotText);setPacket(snapshot.packet);setSteps(snapshot.steps);setStatus('LOCAL_MODEL_IMPORTED: source reconstruction only');}catch(e){setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const reset=()=>{setPacket({...DEFAULT_MOTION_R537});setSteps(12);setSnapshotText('');setStatus('LOCAL_MODEL_RESET');};
 return <section className='o7-r537-motion' data-r537-motion='source-model'>
  <header><span>RECOVERED HISTORICAL INSTRUMENT · SOURCE MODEL</span><h2>12 × 12 Motion Engine</h2><p>Executable R1–R6 conceptual transitions. Deterministic choices resolve donor ambiguity; this is not verified original workbook parity, measured motion or CanonState admission.</p></header>
  <div className='o7-r537-controls'>
   {(['face','tier','stability','adaptation','harmony'] as const).map(key=><label key={key}>{key}<input aria-label={'Motion '+key} type='number' min={key==='tier'?-3:0} max={key==='face'?11:key==='tier'?3:100} value={packet[key]} onChange={e=>change(key,Math.max(key==='tier'?-3:0,Math.min(key==='face'?11:key==='tier'?3:100,Number(e.target.value)||0)))}/></label>)}
   <label>Steps<input aria-label='Motion steps' type='number' min='1' max='48' value={steps} onChange={e=>{setSteps(Math.max(1,Math.min(48,Math.trunc(Number(e.target.value)||1))));setStatus('');}}/></label>
   <label className='o7-r537-risk'><input aria-label='Motion high risk' type='checkbox' checked={packet.highRisk} onChange={e=>change('highRisk',e.target.checked)}/>High risk</label>
  </div>
  <svg viewBox='0 0 760 240' role='img' aria-label='Historical motion tier sequence with center horizon' className='o7-r537-plot'><line x1='24' y1='120' x2='736' y2='120' stroke='#d9b66f' strokeDasharray='5 7' opacity='.65'/>{[-3,-2,-1,0,1,2,3].map(t=><text key={t} x='6' y={120-t*30+4} fill='#94a8b7' fontSize='11'>{t}</text>)}<polyline fill='none' stroke='#a7d8e8' strokeWidth='3' strokeLinejoin='round' points={nodes.map((n,i)=>`${24+i*712/(nodes.length-1||1)},${120-n.tier*30}`).join(' ')}/>{nodes.map((n,i)=><circle key={i} cx={24+i*712/(nodes.length-1||1)} cy={120-n.tier*30} r='4' fill={n.tier===0?'#d9b66f':'#a7d8e8'}/>)}</svg>
  <p data-r537-return={trace.cyclePeriod===null?'NONE':'MODEL_CYCLE'}>Model return: {trace.cyclePeriod===null?'no exact repeated packet in selected trace':`state ${trace.cycleStart} repeats every ${trace.cyclePeriod} step(s)`} · final face {trace.terminal.face+1}/12 · tier {trace.terminal.tier} · model recurrence, not physical time</p>
  <div className='o7-r537-sequence' aria-label='Motion sequence steps'>{sequence.map((x,i)=><div key={i} data-r537-step-rule={x.rule} data-r537-step-tier={x.after.tier}><span>{String(i+1).padStart(2,'0')}</span><strong>{x.rule}</strong><span>{x.before.tier} → {x.after.tier}</span><small>Face {x.after.face+1} · {x.description}</small></div>)}</div>
  <div className='o7-r537-portable'><h3>Local model recovery</h3><p>Stored in this browser only. Export/import uses a bounded, validated JSON snapshot. No remote upload, physical measurement, or canonical mutation.</p><div className='o7-r537-actions'><button type='button' onClick={exportSnapshot}>Export motion snapshot</button><button type='button' onClick={importSnapshot}>Import motion snapshot</button><button type='button' onClick={reset}>Reset motion model</button></div><textarea aria-label='Motion snapshot JSON' value={snapshotText} onChange={e=>setSnapshotText(e.target.value)} rows={3} maxLength={8193} spellCheck={false}/><output data-r537-snapshot-status role='status'>{status}</output></div>
  <footer>Donor: Vertical_12x12_Motion_Engine_Triangulated.xlsx · R537 deterministic reconstruction · historical original-byte parity not authenticated</footer>
 </section>;
}
