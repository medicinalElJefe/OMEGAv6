import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import {ArrowRight,BrainCircuit,Globe2,Home,Orbit,Send,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from './corpusRuntime';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import './omegaHome.css';
import './homeInstrument.css';

type Props={onEnter:(panel:string)=>void};
const LAUNCH=[
  ['Command Center','AI',Sparkles],
  ['Matter Traversal','MATTER',Orbit],
  ['Relativity','MOTION',Waypoints],
  ['Earth Now','EARTH',Globe2],
  ['Forecast','FUTURE',BrainCircuit],
  ['SAI Lab','FABRIC',BrainCircuit]
] as const;
const clamp01=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const nodeStyle=(value:number):CSSProperties=>({opacity:.2+.8*clamp01(value),transform:`scale(${.68+.62*clamp01(value)})`});

export default function OmegaHome({onEnter}:Props){
  const[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1',''));
  const[busy,setBusy]=useState(false),[reply,setReply]=useState(''),[route,setRoute]=useState(''),[sourceReady,setSourceReady]=useState(false);
  const address=useMemo(()=>{const n=Number(localStorage.getItem('omega.v6.address')||11498);return Number.isFinite(n)?Math.max(0,Math.min(20735,Math.floor(n))):11498},[]);
  useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live)setSourceReady(true)}).catch(()=>{if(live)setSourceReady(false)});return()=>{live=false}},[]);
  useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
  const record=useMemo(()=>sourceReady?corpusState(address):null,[sourceReady,address]);
  const coords=useMemo(()=>decodeAddress(address),[address]);
  const next=record?.autoPing.dataNext??address;
  const nextRecord=useMemo(()=>sourceReady?corpusState(next):null,[sourceReady,next]);
  const nextAngle=((nextRecord?.geometry.theta??0)*Math.PI*2)-Math.PI/2;
  const nextNode:CSSProperties={left:`${50+43*Math.cos(nextAngle)}%`,top:`${50+43*Math.sin(nextAngle)}%`};
  const metrics=record?.metrics;
  const decision=metrics?.decision||'SOURCE_LOADING';
  const motion=record?.math.normalizedMotionRelativity??0;
  const fieldStyle={
    '--oh-c':String(clamp01(metrics?.continuity??0)),
    '--oh-phi':String(clamp01(metrics?.plasticity??0)),
    '--oh-q':String(clamp01(metrics?.contradiction??0)),
    '--oh-burden':String(clamp01(metrics?.burden??0)),
    '--oh-motion':String(clamp01(motion)),
    '--oh-evidence':String(clamp01(metrics?.evidence??0)),
    '--oh-scar':String(clamp01(metrics?.scar??0)),
    '--oh-axis-a':`${18+coords.p*4}deg`,
    '--oh-axis-b':`${-18-coords.r*4}deg`,
    '--oh-spin':`${Math.max(16,50-28*clamp01(motion))}s`
  } as CSSProperties;
  const ask=async()=>{if(!prompt.trim()||busy)return;setBusy(true);setReply('');try{const p=await api.post<any>('/api/route-preview',{text:prompt}),r=await api.post<any>('/api/chat',{text:prompt});setRoute(String(p.data?.route||'ROUTED'));setReply(String(r.data?.reply||'No response returned.'))}catch(e:any){setRoute('BOUNDED_FAILURE');setReply(e?.message||'Provider unavailable. Deterministic workstation tools remain available.')}finally{setBusy(false)}};
  const enter=(panel:string)=>{localState.write('omega.v6.panel',panel);onEnter(panel)};
  return <main className='omega-home' style={fieldStyle}>
    <div className='oh-atmosphere' aria-hidden='true'><i/><i/><i/><i/></div>
    <header className='oh-top'><div className='oh-brand'><span className='oh-mark'><Home size={15}/></span><div><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild} · SOVEREIGN WORKSTATION</small></div></div><div className={'oh-state '+decision.toLowerCase()}><ShieldCheck size={14}/><span>STATE {(address+1).toLocaleString()} · {decision}</span></div></header>
    <section className='oh-stage' aria-label='OMEGA source-bound visual start field'>
      <div className='oh-orbit' aria-hidden='true'>
        <span className='ring r1'/><span className='ring r2'/><span className='ring r3'/><span className='ring r4'/><span className='axis a1'/><span className='axis a2'/>
        <span className={'core '+decision.toLowerCase()}><Orbit/></span>
        <i className='node n1' style={nodeStyle(metrics?.continuity??0)}/><i className='node n2' style={nodeStyle(metrics?.plasticity??0)}/><i className='node n3 risk' style={nodeStyle(metrics?.contradiction??0)}/><i className='node n4 risk' style={nodeStyle(metrics?.burden??0)}/><i className='node n5' style={nodeStyle(motion)}/><i className='node n6' style={nodeStyle(metrics?.evidence??0)}/>
        {sourceReady&&<i className='next-node' style={nextNode}/>}<span className='route-thread'/>
      </div>
      <div className='oh-title'><span>{sourceReady?`CΩ ${metrics!.continuity.toFixed(2)} · Φ ${metrics!.plasticity.toFixed(2)} · q ${metrics!.contradiction.toFixed(2)} · Λ ${metrics!.burden.toFixed(2)}`:'SOURCE MODEL MATERIALIZING'}</span><h1>OMEGA</h1><small>{sourceReady?`D${coords.d} P${coords.p} R${coords.r} L${coords.l} → ${next+1}`:'20,736-state source field'}</small></div>
      <div className='oh-launch-ring'>{LAUNCH.map(([panel,label,Icon],i)=><button key={panel} className={'oh-launch p'+i} onClick={()=>enter(panel)} aria-label={'Open '+panel}><Icon/><span>{label}</span><small>{panel}</small></button>)}</div>
    </section>
    <section className='oh-command'>
      <div className='oh-prompt'><Sparkles size={18}/><textarea rows={1} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask OMEGA anything, inspect a state, build, translate, forecast, or navigate…'/><button onClick={()=>void ask()} disabled={busy||!prompt.trim()} aria-label='Send prompt'>{busy?<Orbit className='spin'/>:<Send/>}</button></div>
      {reply&&<div className='oh-reply'><span>{route}</span><p>{reply}</p><button onClick={()=>enter('Command Center')}>Continue in Command Center <ArrowRight size={14}/></button></div>}
      <div className='oh-enter'><button onClick={()=>enter('Command Center')}>ENTER WORKSTATION <ArrowRight size={15}/></button><small>{sourceReady?'source-bound field · 44 coherent surfaces':'loading source-bound field'}</small></div>
    </section>
  </main>
}
