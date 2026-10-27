import {useEffect,useMemo,useState} from 'react';
type Props={address:number;onAddress:(n:number)=>void};
const colors=['#df5850','#e99a53','#e4c96d','#72b986','#5eacb6','#6d8bd1','#ad7fc6'];
export default function SevenStarProjectionR594({address,onAddress}:Props){
 const[rotation,setRotation]=useState(0),[asymmetry,setAsymmetry]=useState(.5),[connections,setConnections]=useState(true),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(18);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setRotation(v=>(v+speed/10)%360),100);return()=>window.clearInterval(timer)},[playing,speed]);
 const nodes=useMemo(()=>colors.map((_,i)=>{const a=(i*2*Math.PI/7)-Math.PI/2+rotation*Math.PI/180,r=135+45*asymmetry*Math.sin(i*2*Math.PI/7+rotation*Math.PI/180);return{x:210+r*Math.cos(a),y:210+r*Math.sin(a)}}),[rotation,asymmetry]);
 return <section data-r594-seven-star='true' aria-label='Seven-Star Color Traversal'>
 <h2>Seven-Star Color Traversal · successor projection</h2><p>Seven relational color nodes projected over the current canonical address. This is an interactive successor, not a claim that the complete historical renderer has been recovered or that model colors are measured spectral data.</p>
 <div><label>Rotation <input aria-label='Seven-Star rotation' type='range' min='0' max='360' value={rotation} onChange={e=>setRotation(Number(e.target.value))}/>{rotation}°</label>
 <label>Asymmetry <input aria-label='Seven-Star asymmetry' type='range' min='0' max='1' step='.01' value={asymmetry} onChange={e=>setAsymmetry(Number(e.target.value))}/>{asymmetry.toFixed(2)}</label>
 <label><input type='checkbox' checked={connections} onChange={e=>setConnections(e.target.checked)}/> Connections</label>
 <button type='button' aria-label={playing?'Pause Seven-Star motion':'Play Seven-Star motion'} aria-pressed={playing} onClick={()=>setPlaying(v=>!v)}>{playing?'Pause motion':'Play motion'}</button>
 <output aria-label='Seven-Star motion state' aria-live='polite'>{playing?'Running':'Paused'}</output>
 <label>Motion speed <input aria-label='Seven-Star motion speed' type='range' min='1' max='60' value={speed} onChange={e=>setSpeed(Number(e.target.value))}/>{speed}°/s</label>
 <button onClick={()=>{setPlaying(false);setRotation(0);setAsymmetry(.5);setConnections(true);setSpeed(18)}}>Reset</button></div>
 <svg viewBox='0 0 420 420' role='img' aria-label='Seven colored relational nodes' style={{maxWidth:540,width:'100%',height:'auto',background:'#101925',borderRadius:12}}>
 <circle cx='210' cy='210' r='175' fill='none' stroke='#aebaca' strokeOpacity='.35'/>
 {connections&&nodes.map((p,i)=>nodes.slice(i+1).map((q,j)=><line key={i+'-'+j} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={colors[i]} strokeOpacity='.3'/>))}
 {nodes.map((p,i)=><g key={i}><line x1='210' y1='210' x2={p.x} y2={p.y} stroke={colors[i]}/><circle cx={p.x} cy={p.y} r='15' fill={colors[i]} stroke='#fff'/><text x={p.x} y={p.y+4} textAnchor='middle' fontSize='12' fill='#101925'>{i+1}</text></g>)}
 <circle cx='210' cy='210' r='8' fill='#fff'/></svg>
 <p>Address {address+1} / 20,736 · node traversal changes the displayed address, not canonical authority.</p>
 <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{colors.map((color,i)=><button key={i} style={{borderBottom:'4px solid '+color}} onClick={()=>onAddress(Math.max(0,Math.min(20735,address+(i+1)*144)))}>Traverse node {i+1}</button>)}</div>
 </section>;
}