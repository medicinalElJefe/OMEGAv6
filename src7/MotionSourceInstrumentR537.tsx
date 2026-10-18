import {useMemo,useState} from 'react';
import {motionSequenceR537,type MotionPacketR537} from './motionSourceR537';
import './motionSourceR537.css';
export default function MotionSourceInstrumentR537(){
 const[packet,setPacket]=useState<MotionPacketR537>({face:0,tier:1,stability:70,adaptation:40,harmony:70,highRisk:false});
 const[steps,setSteps]=useState(12);
 const sequence=useMemo(()=>motionSequenceR537(packet,steps),[packet,steps]);
 const change=(key:keyof MotionPacketR537,value:number|boolean)=>setPacket(p=>({...p,[key]:value}));
 const nodes=[packet,...sequence.map(x=>x.after)];
 return <section className='o7-r537-motion' data-r537-motion='source-model'>
  <header><span>RECOVERED HISTORICAL INSTRUMENT · SOURCE MODEL</span><h2>12 × 12 Motion Engine</h2><p>Interactive reconstruction from the original triangulated motion workbook. R1–R6 are bounded conceptual transitions; deterministic choices resolve donor ambiguity, not measured physics.</p></header>
  <div className='o7-r537-controls'>
   {(['face','tier','stability','adaptation','harmony'] as const).map(key=><label key={key}>{key}<input aria-label={'Motion '+key} type='number' min={key==='tier'?-3:0} max={key==='face'?11:key==='tier'?3:100} value={packet[key]} onChange={e=>change(key,Math.max(key==='tier'?-3:0,Math.min(key==='face'?11:key==='tier'?3:100,Number(e.target.value)||0)))}/></label>)}
   <label>Steps<input aria-label='Motion steps' type='number' min='1' max='48' value={steps} onChange={e=>setSteps(Math.max(1,Math.min(48,Number(e.target.value)||1)))}/></label>
   <label className='o7-r537-risk'><input type='checkbox' checked={packet.highRisk} onChange={e=>change('highRisk',e.target.checked)}/>High risk</label>
  </div>
  <svg viewBox='0 0 760 240' role='img' aria-label='Historical motion tier sequence with center horizon' className='o7-r537-plot'><line x1='24' y1='120' x2='736' y2='120' stroke='#d9b66f' strokeDasharray='5 7' opacity='.65'/>{[-3,-2,-1,0,1,2,3].map(t=><text key={t} x='6' y={120-t*30+4} fill='#94a8b7' fontSize='11'>{t}</text>)}<polyline fill='none' stroke='#a7d8e8' strokeWidth='3' strokeLinejoin='round' points={nodes.map((n,i)=>`${24+i*712/(nodes.length-1||1)},${120-n.tier*30}`).join(' ')}/>{nodes.map((n,i)=><circle key={i} cx={24+i*712/(nodes.length-1||1)} cy={120-n.tier*30} r='4' fill={n.tier===0?'#d9b66f':'#a7d8e8'}/>)}</svg>
  <div className='o7-r537-sequence' aria-label='Motion sequence steps'>{sequence.map((x,i)=><div key={i}><span>{String(i+1).padStart(2,'0')}</span><strong>{x.rule}</strong><span>{x.before.tier} → {x.after.tier}</span><small>Face {x.after.face+1} · {x.description}</small></div>)}</div>
  <footer>Donor: Vertical_12x12_Motion_Engine_Triangulated.xlsx · R537 deterministic source reconstruction · no empirical motion claim</footer>
 </section>;
}
