import {useEffect,useMemo,useRef,useState} from 'react';
import {AudioLines,Pause,Play,ShieldCheck,SlidersHorizontal} from 'lucide-react';
import './signalFieldR44.css';

type Props={record:any};
const cl=(n:any)=>Math.max(0,Math.min(1,Number(n)||0));
const fmt=(n:number)=>Number(n.toFixed(2));

export default function OmegaSignalFieldR44({record}:Props){
 const[running,setRunning]=useState(false),[phase,setPhase]=useState(0),[gain,setGain]=useState(.16),audio=useRef<{ctx:AudioContext;master:GainNode;osc:OscillatorNode[]}|null>(null);
 const signal=useMemo(()=>{const m=record?.metrics||{},C=cl(m.continuity),Phi=cl(m.plasticity),q=cl(m.contradiction),L=cl(m.burden),scar=cl(m.scar),evidence=cl(m.evidence),base=72+Number(record?.coordinates?.d||0)*11+Number(record?.coordinates?.p||0)*2;return{C,Phi,q,L,scar,evidence,f:[base*(1+C),base*1.5*(1+Phi*.5),base*2*(1+evidence*.4),base*.75*(1+q)],a:[.17+.35*C,.1+.28*Phi,.05+.22*evidence,.02+.18*q]}} ,[record]);
 useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setPhase(x=>(x+1)%10000),45);return()=>window.clearInterval(id)},[running]);
 useEffect(()=>{const a=audio.current;if(!a)return;a.master.gain.setTargetAtTime(gain,a.ctx.currentTime,.04);a.osc.forEach((o,i)=>o.frequency.setTargetAtTime(signal.f[i],a.ctx.currentTime,.05))},[gain,signal]);
 useEffect(()=>()=>{const a=audio.current;if(a){a.osc.forEach(o=>{try{o.stop()}catch{}});void a.ctx.close();audio.current=null}},[]);
 const start=async()=>{if(audio.current){await audio.current.ctx.resume();setRunning(true);return}const AudioCtor=window.AudioContext||(window as any).webkitAudioContext;if(!AudioCtor)return;const ctx:AudioContext=new AudioCtor(),master=ctx.createGain();master.gain.value=gain;master.connect(ctx.destination);const waves:OscillatorType[]=['sine','triangle','sine','sawtooth'],osc=signal.f.map((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=waves[i];o.frequency.value=f;g.gain.value=signal.a[i]*(.52-i*.07);o.connect(g);g.connect(master);o.start();return o});audio.current={ctx,master,osc};await ctx.resume();setRunning(true)};
 const stop=async()=>{setRunning(false);if(audio.current)await audio.current.ctx.suspend()};
 const points=useMemo(()=>Array.from({length:160},(_,i)=>{const x=i/159,y=signal.a.reduce((sum,a,k)=>sum+a*Math.sin(x*Math.PI*2*(k+1)+(phase*.025)*(k+1)),0),py=50-y*34;return`${fmt(x*100)},${fmt(py)}`}).join(' '),[signal,phase]);
 const bars=useMemo(()=>Array.from({length:48},(_,i)=>{const x=i/47,v=cl((signal.C*Math.sin(x*Math.PI*2)**2+signal.Phi*Math.sin(x*Math.PI*5+.7)**2+signal.evidence*.35)*(1-signal.L*.38)+signal.q*.12);return v}),[signal]);
 return <section className='r44-signal-field'>
  <header><div><span>PACKET SONIFICATION · WEB AUDIO / SVG</span><h3>Signal Field</h3><p>Hear and inspect the packet as a deterministic signal mapping. Frequency, amplitude and spectrum respond to the same immutable state used by every renderer.</p></div><div className='r44-signal-actions'>{running?<button className='active' onClick={stop}><Pause/>Pause</button>:<button className='primary-action' onClick={start}><Play/>Start signal</button>}<label><SlidersHorizontal/>output<input aria-label='Signal output gain' type='range' min='0' max='.35' step='.01' value={gain} onChange={e=>setGain(Number(e.target.value))}/></label></div></header>
  <div className='r44-signal-stage'><div className='r44-wave'><svg viewBox='0 0 100 100' preserveAspectRatio='none' role='img' aria-label='Packet-derived signal waveform'><defs><linearGradient id='r44-wave-gradient' x1='0' x2='1'><stop offset='0' stopColor='#29c9b6'/><stop offset='1' stopColor='#d5a74f'/></linearGradient></defs><path d='M0 50H100' className='axis'/><polyline points={points} fill='none' stroke='url(#r44-wave-gradient)' strokeWidth='1.15' vectorEffect='non-scaling-stroke'/></svg><div className='r44-spectrum'>{bars.map((v,i)=><i key={i} style={{height:`${Math.max(3,v*100)}%`,opacity:.25+.75*v}}/>)}</div><span className={running?'live':''}><AudioLines/>{running?'AUDIBLE / LIVE':'VISUAL / PAUSED'}</span></div><aside>{[['CΩ CARRIER',signal.f[0],signal.C],['Φ HARMONIC',signal.f[1],signal.Phi],['EVIDENCE TONE',signal.f[2],signal.evidence],['q PRESSURE',signal.f[3],signal.q]].map(([name,f,a])=><article key={String(name)}><span>{name}</span><b>{Number(f).toFixed(1)} Hz</b><div><i style={{width:`${Number(a)*100}%`}}/></div></article>)}<footer>Λ damping {(signal.L*100).toFixed(0)}% · scar texture {(signal.scar*100).toFixed(0)}%</footer></aside></div>
  <footer className='r44-signal-boundary'><ShieldCheck/>This is packet sonification, not a microphone measurement, biological treatment frequency, physical resonance claim or scientific audio observation. Browser audio starts only after explicit user action.</footer>
 </section>
}
