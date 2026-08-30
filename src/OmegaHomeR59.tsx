import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,BrainCircuit,Command,Earth,Eye,Globe2,Layers3,Link2,Menu,Orbit,Search,Send,Settings2,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {unifiedFromRecord} from './unifiedCalculus';
import CalculusFieldR37 from './CalculusFieldR37';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import LivingRuntimePulseR33 from './LivingRuntimePulseR33';
import ExtremeTraversalUnionR60 from './ExtremeTraversalUnionR60';
import SovereignCapabilityAtlasR61 from './SovereignCapabilityAtlasR61';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import {dailyBrief} from './dailyBrief';
import './omegaHomeR59.css';

type Props={onEnter:(panel:string)=>void};
type DomainId='WORK'|'EXPLORE'|'INTELLIGENCE'|'EVIDENCE'|'SYSTEM';
const DOMAINS={
 WORK:['Command Center','Workspace','Cockpit','Hybrid Link','Create','Projects','Development','Build Out'],
 EXPLORE:['Earth Now','Forecast','Reality Lab','Matter Traversal','Immersive Traversal','Extreme Traversal','Visual Instrument','Relativity','Atlas','Traversal','Field','Data Motion','Atlas Calculator','Infinity','Convergence','Scale Compiler'],
 INTELLIGENCE:['Modes','Kernel Intelligence','Memory','Canon Evolution','SAI Lab'],
 EVIDENCE:['Quality Compiler','Evidence & Proof','Archive Census','Archive Operators','Governance','Validation'],
 SYSTEM:['Instructions','Plugins','Settings','System','System Atlas','Control Matrix','Consolidation']
} as const;
const DOMAIN_META={WORK:{label:'Work',operator:'ALPHA',shell:'12D',Icon:Sparkles},EXPLORE:{label:'Explore',operator:'CONSTRUCT',shell:'1728D',Icon:Eye},INTELLIGENCE:{label:'Intelligence',operator:'PRUNE',shell:'144D',Icon:BrainCircuit},EVIDENCE:{label:'Evidence',operator:'BASE',shell:'20736D',Icon:ShieldCheck},SYSTEM:{label:'System',operator:'OMEGA',shell:'248832D',Icon:Settings2}} as const;
const ALL=Object.values(DOMAINS).flat();
const DISPLAYS=[
 ['Unified Field','Visual Instrument','five-role calculus field'],['Matter','Matter Traversal','scale + topology volume'],['Motion','Traversal','admitted state evolution'],['Forecast','Forecast','future-plasticity corridors'],['Relativity','Relativity','observer projection'],['Atlas','Atlas','20,736 state atlas'],['Reality','Reality Lab','measured/imported evidence'],['Proof','Evidence & Proof','proof + receipt lineage']
] as const;
const PRIMARY=[['Command','Command Center',Command],['Matter','Matter Traversal',Orbit],['Earth','Earth Now',Earth],['Visual','Visual Instrument',Eye],['SAI','SAI Lab',BrainCircuit],['Proof','Evidence & Proof',ShieldCheck],['Hybrid','Hybrid Link',Link2],['System','System Atlas',Layers3]] as const;
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
const fmt=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';

export default function OmegaHomeR59({onEnter}:Props){
 const[address,setAddress]=useState(()=>clamp(Number(localState.read('omega.v6.address',11498)))),[ready,setReady]=useState(false),[domain,setDomain]=useState<DomainId>('WORK'),[query,setQuery]=useState(''),[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1','')),[reply,setReply]=useState(''),[busy,setBusy]=useState(false),[cloud,setCloud]=useState<any>(null),[spine,setSpine]=useState<any>(null),[showRuntimeFunctions,setShowRuntimeFunctions]=useState(false);
 const daily=useMemo(()=>dailyBrief(),[]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>live&&setReady(true)).catch(()=>live&&setReady(false));return()=>{live=false}},[]);
 useEffect(()=>{localState.write('omega.v6.address',address)},[address]);
 useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
 useEffect(()=>{let live=true;const load=async()=>{try{const[s,p]=await Promise.all([api.get<any>('/api/status'),api.get<any>('/api/live-state-spine')]);if(live){setCloud(s.data||null);setSpine(p.data||null)}}catch{if(live){setCloud(null);setSpine(null)}}};void load();const id=window.setInterval(load,30000);return()=>{live=false;window.clearInterval(id)}},[]);
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]),coords=useMemo(()=>decodeAddress(address),[address]),modes=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]),unified=useMemo(()=>record?unifiedFromRecord(record):null,[record]);
 const routes=useMemo(()=>{const q=query.trim().toLowerCase();return q?ALL.filter(x=>x.toLowerCase().includes(q)):DOMAINS[domain]},[query,domain]);
 const enter=(panel:string)=>{if(!ALL.includes(panel as any))return;localState.write('omega.v6.panel',panel);localState.write('omega.v6.modePolicy','SOURCE_BACKED');onEnter(panel)};
 const ask=async()=>{if(!record||!modes||!prompt.trim()||busy)return;setBusy(true);setReply('');try{const context={address,stateId:record.stateId,coords,decision:record.metrics.decision,metrics:record.metrics,nextAddress:record.autoPing?.dataNext??address,modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',appliedModeCount:modes.appliedCount,gatedModeCount:modes.gatedCount,unified:{coherence:unified?.unifiedCoherence,motionRelativity:unified?.motionRelativity},responseContract:{plainLanguageFirst:true,showRouteBeforeGeneration:true,doNotInventMissingEvidence:true}};await api.post('/api/route-preview',{text:prompt,context});const r=await api.post<any>('/api/chat',{text:prompt,context});setReply(String(r.data?.reply||'No response returned.'))}catch(e:any){setReply(e?.message||'No answer fabricated; provider/runtime path failed.')}finally{setBusy(false)}};
 const spineCount=Array.isArray(spine?.states)?spine.states.length:Array.isArray(spine?.requiredLiveState)?spine.requiredLiveState.length:0;
 const runtimeState=record?{atlas:{address},modePolicy:'SOURCE_BACKED',frozen:false,d:coords.d,p:coords.p,r:coords.r,l:coords.l,workflow:'LAW',preset:'SOVEREIGN',timeAuthority:'NOW',viewportMode:'CANON_FIELD',instrumentView:'LIVE',workspace:'LAW',embodimentIndex:4}:null;
 return <main className='r59-home'>
  <aside className='r59-rail' aria-label='OMEGA home navigation'>
   <header><button aria-label='OMEGA home' onClick={()=>{setDomain('WORK');setQuery('')}}><span className='r59-orb'/></button><div><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild}</small></div></header>
   <LivingRuntimePulseR33 onNavigate={enter}/>
   <nav className='r59-domain-tabs'>{(Object.keys(DOMAINS) as DomainId[]).map(id=>{const m=DOMAIN_META[id],I=m.Icon;return <button key={id} className={domain===id?'active':''} data-operator={m.operator} onClick={()=>{setDomain(id);setQuery('')}}><I/><span><b>{m.label}</b><small>{m.operator} · {m.shell}</small></span></button>})}</nav>
   <label className='r59-search'><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Find any OMEGA instrument'/></label>
   <div className='r59-route-list'>{routes.map(x=><button key={x} onClick={()=>enter(x)}><span>{x}</span><ArrowRight/></button>)}</div>
  </aside>

  <section className='r59-main'>
   <header className='r59-top'><div><span className={ready?'ok':'wait'}><Activity/>CORPUS {ready?'LIVE':'LOADING'}</span><span className={cloud?'ok':'wait'}><Globe2/>WORKER {cloud?'LIVE':'UNVERIFIED'}</span><span className={spineCount===14?'ok':'wait'}><ShieldCheck/>SPINE {spineCount}/14</span>{modes&&<span className='ok'>MODES {modes.appliedCount} APPLIED · {modes.gatedCount} GATED</span>}</div><button onClick={()=>enter('System Atlas')}><Menu/>SYSTEM MAP</button></header>

   <section className='r59-command-stage'>
    <div className='r59-intro'><span>SOVEREIGN COMPUTATIONAL ENVIRONMENT</span><h1>OMEGA</h1><p>One state. One memory. One proof chain. Many executable views.</p><div className='r59-command-box'><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask, compute, inspect, traverse, build or prove from the active packet…'/><button onClick={()=>void ask()} disabled={!record||busy||!prompt.trim()}>{busy?<Orbit className='spin'/>:<Send/>}<span>{busy?'RUNNING':'RUN OMEGA'}</span></button></div>{reply&&<div className='r59-reply'><p>{reply}</p><button onClick={()=>enter('Command Center')}>Continue in Command Center <ArrowRight/></button></div>}</div>
    <div className='r59-field'>{record?<CalculusFieldR37 address={address} mode='FIELD' steps={30} onAddress={setAddress} label='OMEGA · LIVE CANONICAL FIELD'/>:<div className='r59-loading'><Orbit className='spin'/><b>Materializing canonical field…</b></div>}</div>
   </section>

   {record&&<section className='r59-state-strip'><div><span>STATE</span><b>{record.stateId.toLocaleString()}</b><small>D{coords.d+1} · P{coords.p+1} · R{coords.r+1} · L{coords.l+1}</small></div><div><span>DECISION</span><b>{record.metrics.decision}</b><small>next {Number(record.autoPing.dataNext)+1}</small></div><div><span>CΩ</span><b>{fmt(record.metrics.continuity)}</b><small>continuity</small></div><div><span>Φ</span><b>{fmt(record.metrics.plasticity)}</b><small>plasticity</small></div><div><span>q</span><b>{fmt(record.metrics.contradiction)}</b><small>contradiction</small></div><div><span>Λ</span><b>{fmt(record.metrics.burden)}</b><small>burden</small></div><div><span>COHERENCE</span><b>{fmt(unified?.unifiedCoherence)}</b><small>unified packet</small></div></section>}

   <section className='r59-display-deck'><header><div><b>DISPLAY UNIVERSE</b><small>Every card opens a real state-bound application; none is decorative.</small></div><button onClick={()=>enter('Visual Instrument')}>Open full 8-view deck <ArrowRight/></button></header><div>{DISPLAYS.map(([label,panel,copy])=><button key={label} onClick={()=>enter(panel)}><span>{label}</span><small>{copy}</small><ArrowRight/></button>)}</div></section>

   <section className='r59-primary'>{PRIMARY.map(([label,panel,I])=><button key={panel} onClick={()=>enter(panel)}><I/><span><b>{label}</b><small>{panel}</small></span><ArrowRight/></button>)}</section>

   <section className='r60-runtime-functions'><header><div><span>RESTORED EXECUTION STACK</span><h2>Runtime Functions</h2><p>Expose real accepted engines without creating shadow routes: canonical traversal, biological scale, micro build, data/language, cinematic rendering, host observation and proof/state supervision.</p></div><button onClick={()=>setShowRuntimeFunctions(v=>!v)} aria-expanded={showRuntimeFunctions}>{showRuntimeFunctions?'Hide runtime functions':'Open runtime functions'} <ArrowRight/></button></header>{showRuntimeFunctions&&record&&runtimeState&&<ExtremeTraversalUnionR60 record={record} address={address} state={runtimeState} onAddress={setAddress} onNavigate={enter}/>}</section>

   <SovereignCapabilityAtlasR61 onNavigate={enter}/>

   <section className='r59-bottom-grid'><article className='r59-motion'><header><Waypoints/><div><b>ROUTE + MOTION</b><small>same canonical packet · admitted transitions</small></div></header>{record&&<OmegaMotionSkinMapR35 address={address} onSelectAddress={setAddress} compact/>}</article><article className='r59-daily'><span>TODAY'S FIELD LESSON</span><h2>{daily.title}</h2><p>{daily.lesson}</p><blockquote>{daily.quote}</blockquote><button onClick={()=>enter(daily.destination)}>Explore lesson <ArrowRight/></button></article></section>
   <footer className='r59-boundary'><ShieldCheck/><span><b>Truth boundary:</b> browser state, Worker state, external evidence, provider output and native-device execution remain separately classified. Representation shells are not claims of physical dimensions.</span></footer>
  </section>
 </main>
}
