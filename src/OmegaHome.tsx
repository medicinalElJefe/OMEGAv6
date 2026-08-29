import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,BrainCircuit,Globe2,Home,Orbit,Send,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import './omegaHome.css';

type Props={onEnter:(panel:string)=>void};
const LAUNCH=[
  ['Command Center','AI',Sparkles],
  ['Matter Traversal','MATTER',Orbit],
  ['Relativity','MOTION',Waypoints],
  ['Earth Now','EARTH',Globe2],
  ['Forecast','FUTURE',BrainCircuit],
  ['SAI Lab','FABRIC',BrainCircuit]
] as const;

export default function OmegaHome({onEnter}:Props){
  const[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1',''));
  const[busy,setBusy]=useState(false),[reply,setReply]=useState(''),[route,setRoute]=useState('');
  const state=useMemo(()=>{const n=Number(localStorage.getItem('omega.v6.address')||11498);return Number.isFinite(n)?Math.max(1,Math.min(20736,Math.floor(n)+1)):11499},[]);
  useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
  const ask=async()=>{if(!prompt.trim()||busy)return;setBusy(true);setReply('');try{const p=await api.post<any>('/api/route-preview',{text:prompt}),r=await api.post<any>('/api/chat',{text:prompt});setRoute(String(p.data?.route||'ROUTED'));setReply(String(r.data?.reply||'No response returned.'))}catch(e:any){setRoute('BOUNDED_FAILURE');setReply(e?.message||'Provider unavailable. Deterministic workstation tools remain available.')}finally{setBusy(false)}};
  const enter=(panel:string)=>{localState.write('omega.v6.panel',panel);onEnter(panel)};
  return <main className='omega-home'>
    <div className='oh-atmosphere' aria-hidden='true'><i/><i/><i/><i/></div>
    <header className='oh-top'><div className='oh-brand'><span className='oh-mark'><Home size={15}/></span><div><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild} · SOVEREIGN WORKSTATION</small></div></div><div className='oh-state'><ShieldCheck size={14}/><span>STATE {state.toLocaleString()}</span></div></header>
    <section className='oh-stage' aria-label='OMEGA visual start field'>
      <div className='oh-orbit' aria-hidden='true'><span className='ring r1'/><span className='ring r2'/><span className='ring r3'/><span className='ring r4'/><span className='axis a1'/><span className='axis a2'/><span className='core'><Orbit/></span><i className='node n1'/><i className='node n2'/><i className='node n3'/><i className='node n4'/><i className='node n5'/><i className='node n6'/></div>
      <div className='oh-title'><span>ONE FIELD · MANY LENSES</span><h1>OMEGA</h1></div>
      <div className='oh-launch-ring'>{LAUNCH.map(([panel,label,Icon],i)=><button key={panel} className={'oh-launch p'+i} onClick={()=>enter(panel)} aria-label={'Open '+panel}><Icon/><span>{label}</span><small>{panel}</small></button>)}</div>
    </section>
    <section className='oh-command'>
      <div className='oh-prompt'><Sparkles size={18}/><textarea rows={1} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask OMEGA anything, inspect a state, build, translate, forecast, or navigate…'/><button onClick={()=>void ask()} disabled={busy||!prompt.trim()} aria-label='Send prompt'>{busy?<Orbit className='spin'/>:<Send/>}</button></div>
      {reply&&<div className='oh-reply'><span>{route}</span><p>{reply}</p><button onClick={()=>enter('Command Center')}>Continue in Command Center <ArrowRight size={14}/></button></div>}
      <div className='oh-enter'><button onClick={()=>enter('Command Center')}>ENTER WORKSTATION <ArrowRight size={15}/></button><small>44 coherent surfaces · desktop + mobile adaptive navigation</small></div>
    </section>
  </main>
}
