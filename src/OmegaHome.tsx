import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,BookOpen,BrainCircuit,Globe2,Home,Menu,Orbit,Send,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {unifiedFromRecord} from './unifiedCalculus';
import {calculusVisualLaw} from './calculusVisualLawR37';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import {dailyBrief} from './dailyBrief';
import CalculusFieldR37 from './CalculusFieldR37';
import OmegaLivingField from './OmegaLivingField';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import './omegaHome.css';
import './homeInstrument.css';
import './homeExperienceR38.css';

type Props={onEnter:(panel:string)=>void};
const QUICK=['Visual Instrument','Atlas','Evidence & Proof','Development','System Atlas','Control Matrix','Forecast','SAI Lab'] as const;
const JOURNEYS=[
 {panel:'Command Center',eyebrow:'ASK',title:'Talk to OMEGA',copy:'Ask, reason, route and continue from the exact active packet.',Icon:Sparkles},
 {panel:'Matter Traversal',eyebrow:'TRAVERSE',title:'Enter matter',copy:'Move through topology, scale, proof, continuity and admitted motion.',Icon:Orbit},
 {panel:'Relativity',eyebrow:'RELATE',title:'Change the observer',copy:'See phase, frame, carry, memory and projection alter the visible state.',Icon:Waypoints},
 {panel:'Earth Now',eyebrow:'GROUND',title:'Enter Earth',copy:'Keep real returned evidence separate from OMEGA model-space geometry.',Icon:Globe2}
] as const;
const f=(n:any,d=3)=>Number.isFinite(Number(n))?Number(n).toFixed(d):'—';

export default function OmegaHome({onEnter}:Props){
 const[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1','')),[busy,setBusy]=useState(false),[reply,setReply]=useState(''),[route,setRoute]=useState(''),[sourceReady,setSourceReady]=useState(false),[palette,setPalette]=useState(false),[address,setAddress]=useState(()=>{const n=Number(localState.read('omega.v6.address',11498));return Number.isFinite(n)?Math.max(0,Math.min(20735,Math.floor(n))):11498});
 const daily=useMemo(()=>dailyBrief(),[]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live)setSourceReady(true)}).catch(()=>{if(live)setSourceReady(false)});return()=>{live=false}},[]);
 useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
 useEffect(()=>{localState.write('omega.v6.address',address)},[address]);
 const record=useMemo(()=>sourceReady?corpusState(address):null,[sourceReady,address]),coords=useMemo(()=>decodeAddress(address),[address]),unified=useMemo(()=>record?unifiedFromRecord(record):null,[record]),modes=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]),law=useMemo(()=>record?calculusVisualLaw(record):null,[record]);
 const enter=(panel:string)=>{localState.write('omega.v6.panel',panel);localState.write('omega.v6.modePolicy','SOURCE_BACKED');onEnter(panel)};
 const ask=async()=>{if(!prompt.trim()||busy||!record||!modes)return;setBusy(true);setReply('');try{const context={address,stateId:record.stateId,coords,decision:record.metrics.decision,metrics:record.metrics,nextAddress:record.autoPing?.dataNext??address,previousAddress:record.autoPing?.previous??address,phase:coords.p+1,modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',modeCatalogCount:modes.catalogCount,appliedModeCount:modes.appliedCount,exactModeCount:modes.exactCount,packetModeCount:modes.packetCount,gatedModeCount:modes.gatedCount,exactModes:modes.executed.map(x=>({id:x.id,name:x.name,formula:x.formula,value:x.value,source:x.source})),gatedModes:modes.gated.map(x=>({id:x.id,name:x.name,formula:x.formula,missing:x.missing,source:x.source})),modeTruthBoundary:modes.boundary,unified:{coherence:unified?.unifiedCoherence,waterConductance:unified?.water?.conductance,motionRelativity:unified?.motionRelativity},responseContract:{plainLanguageFirst:true,separateObservedDerivedProjected:true,showRouteBeforeGeneration:true,includeForwardReverseStateContext:true,doNotInventMissingEvidence:true}};const p=await api.post<any>('/api/route-preview',{text:prompt,context}),r=await api.post<any>('/api/chat',{text:prompt,context});setRoute(String(r.data?.provider||p.data?.route||'ROUTED'));setReply(String(r.data?.reply||'OMEGA returned no text response.'))}catch(e:any){setRoute('BOUNDED_FAILURE');setReply(e?.message||'OMEGA could not complete the request. No answer was fabricated.')}finally{setBusy(false)}};
 return <main className='omega-home omega-home-r4 omega-home-r38'>
  <header className='oh-top r4-top r38-top'><div className='oh-brand'><span className='oh-mark'><Home size={15}/></span><div><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild} · SOVEREIGN COMPUTATIONAL INSTRUMENT</small></div></div><div className='r38-top-center'>{record&&<><span>STATE <b>{record.stateId.toLocaleString()}</b></span><i/><span>PHASE <b>{coords.p+1}</b></span><i/><span>DECISION <b>{record.metrics.decision}</b></span></>}</div><div className='oh-top-actions'>{record&&modes&&<div className='r4-mode-proof'><ShieldCheck/><span>SOURCE-BACKED MODES</span><b>{modes.appliedCount} APPLIED · {modes.gatedCount} GATED</b></div>}<button className='oh-menu-button' onClick={()=>setPalette(x=>!x)} aria-expanded={palette}><Menu/><span>EXPLORE</span></button></div></header>
  {palette&&<nav className='oh-palette r38-palette'>{QUICK.map(name=><button key={name} onClick={()=>enter(name)}>{name}</button>)}<button className='all' onClick={()=>enter('Command Center')}>OPEN FULL WORKSTATION <ArrowRight/></button></nav>}

  <section className='r4-welcome r38-stage'>
   <div className='r38-field' aria-label='OMEGA source-bound visual start field'>{record?<CalculusFieldR37 address={address} mode='FIELD' steps={36} onAddress={setAddress} label='OMEGA · ACTIVE CALCULUS FIELD'/>:<div className='r4-loading'><Orbit className='spin'/><b>Materializing the 20,736-state field…</b></div>}</div>
   <div className='r38-vignette'/>
   <div className='r4-intro r38-intro'><span className='r4-kicker'>STATE · MOTION · EVIDENCE · POSSIBILITY</span><h1>Don’t open a dashboard.<br/><em>Enter the computation.</em></h1><p>The active state is the interface. Continuity, possibility, contradiction, burden, scar, proof, phase and admitted motion change the geometry you are looking at instead of merely filling boxes beside it.</p><div className='r4-intro-actions'><button onClick={()=>enter('Command Center')}>ENTER OMEGA <ArrowRight/></button><button className='quiet' onClick={()=>enter('Visual Instrument')}><Orbit/>Expand instrument</button></div></div>
   {record&&law&&<aside className='r38-state-rail'><div className='r38-state-id'><span>ACTIVE PACKET</span><b>{record.stateId.toLocaleString()}</b><small>D{coords.d+1} · P{coords.p+1} · R{coords.r+1} · L{coords.l+1}</small></div><div className='r38-metric'><span>CΩ</span><b>{f(record.metrics.continuity)}</b><i style={{transform:`scaleX(${record.metrics.continuity})`}}/></div><div className='r38-metric'><span>Φ</span><b>{f(record.metrics.plasticity)}</b><i style={{transform:`scaleX(${record.metrics.plasticity})`}}/></div><div className='r38-metric'><span>q</span><b>{f(record.metrics.contradiction)}</b><i style={{transform:`scaleX(${record.metrics.contradiction})`}}/></div><div className='r38-metric'><span>Λ</span><b>{f(record.metrics.burden)}</b><i style={{transform:`scaleX(${record.metrics.burden})`}}/></div><div className='r38-metric'><span>U</span><b>{f(unified?.unifiedCoherence)}</b><i style={{transform:`scaleX(${unified?.unifiedCoherence||0})`}}/></div><div className='r38-law-read'><span>CURVATURE <b>{f(law.curvature)}</b></span><span>FOLD <b>{f(law.fold)}</b></span><span>SCAR MEMORY <b>{f(law.scarMemory)}</b></span><span>ROUTE <b>{f(law.routeStrength)}</b></span></div></aside>}
   <nav className='r4-journeys r38-journey-dock' aria-label='Ways to begin'>{JOURNEYS.map(({panel,eyebrow,title,copy,Icon})=><button key={panel} onClick={()=>enter(panel)}><span><Icon/><b>{eyebrow}</b></span><h2>{title}</h2><p>{copy}</p><i><ArrowRight/></i></button>)}</nav>
  </section>

  <section className='r4-conversation r38-command-band'><div className='r4-ask r38-ask'><header><div><BrainCircuit/><span><b>ASK THIS STATE</b><small>{record?`STATE ${record.stateId.toLocaleString()} · PHASE ${coords.p+1} · ${record.metrics.decision}`:'SOURCE LOADING'}</small></span></div><span className={busy?'busy':''}>{busy?'THINKING':'READY'}</span></header><div className='r4-prompt'><textarea rows={2} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask what this state means, where it can move, what the evidence supports, or what OMEGA should do next…'/><button onClick={()=>void ask()} disabled={busy||!prompt.trim()||!record}>{busy?<Orbit className='spin'/>:<Send/>}<span>ASK</span></button></div>{reply&&<div className='r4-reply' aria-live='polite'><span>{route}</span><p>{reply}</p><button onClick={()=>enter('Command Center')}>Continue in Command Center <ArrowRight/></button></div>}</div><article className='r4-daily r38-daily'><div className='r4-daily-art' aria-hidden='true'><i/><i/><i/><i/><span/></div><div><span className='r4-kicker'><BookOpen/>TODAY'S FIELD LESSON</span><h2>{daily.title}</h2><p>{daily.lesson}</p><blockquote>{daily.quote}</blockquote><footer><small>{daily.source}</small><button onClick={()=>enter(daily.destination)}>Explore <ArrowRight/></button></footer></div></article></section>

  <details className='r38-lineage'><summary>Legacy field / phase comparison · retained for parity and forensic inspection</summary><div>{record&&<OmegaLivingField address={address} onSelectAddress={setAddress}/>} {record&&<OmegaMotionSkinMapR35 address={address} onSelectAddress={setAddress}/>}</div></details>
  <footer className='r4-truth-strip r38-truth'><ShieldCheck/><span><b>Truth first.</b> Internal OMEGA state is computational. Source modes execute only when authoritative inputs are present; catalog membership is not execution. Earth observations, physical measurements, native-device actions and AI synthesis remain separately identified and are never silently fabricated.</span>{record&&<code>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l} · CΩ {record.metrics.continuity.toFixed(3)} · U {unified?.unifiedCoherence.toFixed(3)}</code>}</footer>
 </main>
}
