import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,BookOpen,BrainCircuit,Globe2,Home,Menu,Orbit,Send,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {corpusState,decodeAddress,evaluateCorpusModes,initCorpusPack} from './corpusRuntime';
import {unifiedFromRecord} from './unifiedCalculus';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import {dailyBrief} from './dailyBrief';
import PhaseWheel from './PhaseWheel';
import './omegaHome.css';
import './homeInstrument.css';

type Props={onEnter:(panel:string)=>void};
const QUICK=['Visual Instrument','Atlas','Evidence & Proof','Build Out','System Atlas','Control Matrix'] as const;
const JOURNEYS=[
 {panel:'Command Center',eyebrow:'ASK',title:'Talk to OMEGA',copy:'Ask a question, inspect the current state, or continue a governed build.',Icon:Sparkles},
 {panel:'Matter Traversal',eyebrow:'TRAVERSE',title:'Move through matter',copy:'Explore the same canonical field through scale, topology, proof and motion.',Icon:Orbit},
 {panel:'Relativity',eyebrow:'UNDERSTAND',title:'See motion relationally',copy:'Watch phase, observer frame, carry, memory and possible next state interact.',Icon:Waypoints},
 {panel:'Earth Now',eyebrow:'EXPLORE',title:'Enter Earth',copy:'Use real UTC solar geometry and evidence-gated Earth traversal without fake live claims.',Icon:Globe2}
] as const;

export default function OmegaHome({onEnter}:Props){
 const[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1','')),[busy,setBusy]=useState(false),[reply,setReply]=useState(''),[route,setRoute]=useState(''),[sourceReady,setSourceReady]=useState(false),[palette,setPalette]=useState(false),[address,setAddress]=useState(()=>{const n=Number(localState.read('omega.v6.address',11498));return Number.isFinite(n)?Math.max(0,Math.min(20735,Math.floor(n))):11498});
 const daily=useMemo(()=>dailyBrief(),[]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live)setSourceReady(true)}).catch(()=>{if(live)setSourceReady(false)});return()=>{live=false}},[]);
 useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
 useEffect(()=>{localState.write('omega.v6.address',address)},[address]);
 const record=useMemo(()=>sourceReady?corpusState(address):null,[sourceReady,address]),coords=useMemo(()=>decodeAddress(address),[address]),unified=useMemo(()=>record?unifiedFromRecord(record):null,[record]),modes=useMemo(()=>record?evaluateCorpusModes(record):null,[record]);
 const enter=(panel:string)=>{localState.write('omega.v6.panel',panel);localState.write('omega.v6.modePolicy','ALL');onEnter(panel)};
 const ask=async()=>{if(!prompt.trim()||busy||!record||!modes)return;setBusy(true);setReply('');try{const context={address,stateId:record.stateId,coords,decision:record.metrics.decision,metrics:record.metrics,nextAddress:record.autoPing?.dataNext??address,phase:coords.p+1,modePolicy:'ALL',modeCount:modes.count,modeSummary:{stay:modes.stay,turn:modes.turn,escalate:modes.escalate},unified:{coherence:unified?.unifiedCoherence,waterConductance:unified?.water?.conductance,motionRelativity:unified?.motionRelativity}};const p=await api.post<any>('/api/route-preview',{text:prompt}),r=await api.post<any>('/api/chat',{text:prompt,context});setRoute(String(r.data?.provider||p.data?.route||'ROUTED'));setReply(String(r.data?.reply||'OMEGA returned no text response.'))}catch(e:any){setRoute('BOUNDED_FAILURE');setReply(e?.message||'OMEGA could not complete the request. No answer was fabricated.')}finally{setBusy(false)}};
 return <main className='omega-home omega-home-r4'>
  <header className='oh-top r4-top'><div className='oh-brand'><span className='oh-mark'><Home size={15}/></span><div><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild} · LIVING SOVEREIGN WORKSTATION</small></div></div><div className='oh-top-actions'>{record&&<div className='r4-mode-proof'><ShieldCheck/><span>ALL MODES ACTIVE</span><b>{modes?.count??0}</b></div>}<button className='oh-menu-button' onClick={()=>setPalette(x=>!x)} aria-expanded={palette}><Menu/><span>EXPLORE</span></button></div></header>
  {palette&&<nav className='oh-palette'>{QUICK.map(name=><button key={name} onClick={()=>enter(name)}>{name}</button>)}<button className='all' onClick={()=>enter('Command Center')}>OPEN FULL WORKSTATION <ArrowRight/></button></nav>}

  <section className='r4-welcome'>
   <div className='r4-intro'><span className='r4-kicker'>A LIVING MAP OF STATE · MOTION · EVIDENCE · POSSIBILITY</span><h1>Explore something<br/><em>that changes with what you ask.</em></h1><p>OMEGA is not a pile of dashboards. Start with a question or touch the phase field. Every route keeps the same canonical state, and every visual must say whether it is source-derived, modeled, externally observed, or unavailable.</p><div className='r4-intro-actions'><button onClick={()=>enter('Command Center')}>ENTER OMEGA <ArrowRight/></button><button className='quiet' onClick={()=>enter('Instructions')}><BookOpen/>How this works</button></div></div>
   <div className='r4-living-instrument'>{record?<PhaseWheel address={address} onSelectAddress={setAddress} title='Touch the phase field'/>:<div className='r4-loading'><Orbit className='spin'/><b>Materializing the 20,736-state field…</b></div>}</div>
  </section>

  <section className='r4-journeys' aria-label='Ways to begin'>{JOURNEYS.map(({panel,eyebrow,title,copy,Icon})=><button key={panel} onClick={()=>enter(panel)}><span><Icon/><b>{eyebrow}</b></span><h2>{title}</h2><p>{copy}</p><i><ArrowRight/></i></button>)}</section>

  <section className='r4-conversation'>
   <div className='r4-ask'><header><div><BrainCircuit/><span><b>ASK OMEGA</b><small>{record?`STATE ${record.stateId.toLocaleString()} · PHASE ${coords.p+1} · ${record.metrics.decision}`:'SOURCE LOADING'}</small></span></div><span className={busy?'busy':''}>{busy?'THINKING':'READY'}</span></header><div className='r4-prompt'><textarea rows={3} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask about this state, motion, matter, Earth, a project, or what OMEGA can teach you…'/><button onClick={()=>void ask()} disabled={busy||!prompt.trim()||!record}>{busy?<Orbit className='spin'/>:<Send/>}<span>ASK</span></button></div>{reply&&<div className='r4-reply' aria-live='polite'><span>{route}</span><p>{reply}</p><button onClick={()=>enter('Command Center')}>Continue with the full assistant <ArrowRight/></button></div>}</div>
   <article className='r4-daily'><div className='r4-daily-art' aria-hidden='true'><i/><i/><i/><i/><span/></div><div><span className='r4-kicker'><BookOpen/>TODAY'S FIELD LESSON</span><h2>{daily.title}</h2><p>{daily.lesson}</p><blockquote>{daily.quote}</blockquote><footer><small>{daily.source}</small><button onClick={()=>enter(daily.destination)}>Explore <ArrowRight/></button></footer></div></article>
  </section>

  <footer className='r4-truth-strip'><ShieldCheck/><span><b>Truth first.</b> Internal OMEGA state is computational. Earth observations, physical measurements, native-device actions and AI synthesis are identified separately and never silently fabricated.</span>{record&&<code>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l} · CΩ {record.metrics.continuity.toFixed(3)} · U {unified?.unifiedCoherence.toFixed(3)}</code>}</footer>
 </main>
}
