import {useEffect,useMemo,useState} from 'react';
import {Activity,Archive,ArrowRight,BookOpen,BrainCircuit,ChevronRight,Command,Earth,Eye,FolderOpen,Globe2,Home,Layers3,Link2,Menu,Orbit,Search,Send,Settings2,ShieldCheck,Sparkles,Waypoints,X} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {unifiedFromRecord} from './unifiedCalculus';
import {calculusVisualLaw} from './calculusVisualLawR37';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import {dailyBrief} from './dailyBrief';
import OmegaLivingField from './OmegaLivingField';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import './omegaHome.css';
import './homeInstrument.css';
import './homeExperienceR38.css';
import './omegaLaunchR56.css';

type Props={onEnter:(panel:string)=>void};
type DomainId='WORK'|'EXPLORE'|'INTELLIGENCE'|'EVIDENCE'|'SYSTEM';
type Domain={id:DomainId;label:string;copy:string;routes:readonly string[];Icon:any};
const QUICK=['Visual Instrument','Atlas','Evidence & Proof','Development','System Atlas','Control Matrix','Forecast','SAI Lab'] as const;
const JOURNEYS=[
 {panel:'Command Center',eyebrow:'ASK',title:'Talk to OMEGA',copy:'Ask, reason, route and continue from the exact active packet.',Icon:Sparkles},
 {panel:'Matter Traversal',eyebrow:'TRAVERSE',title:'Enter matter',copy:'Move through topology, scale, proof, continuity and admitted motion.',Icon:Orbit},
 {panel:'Relativity',eyebrow:'RELATE',title:'Change the observer',copy:'See phase, frame, carry, memory and projection alter the visible state.',Icon:Waypoints},
 {panel:'Earth Now',eyebrow:'GROUND',title:'Enter Earth',copy:'Keep real returned evidence separate from OMEGA model-space geometry.',Icon:Globe2}
] as const;
const DOMAINS:readonly Domain[]=[
 {id:'WORK',label:'Work',copy:'Ask · act · create · continue',Icon:Command,routes:['Command Center','Workspace','Cockpit','Hybrid Link','Create','Projects','Render Queue','Assets','Development','Build Out']},
 {id:'EXPLORE',label:'Explore',copy:'Earth · matter · motion · scale',Icon:Eye,routes:['Earth Now','Forecast','Reality Lab','Matter Traversal','Immersive Traversal','Extreme Traversal','Visual Instrument','Relativity','Atlas','Traversal','Field','Data Motion','Atlas Calculator','Infinity','Convergence','Scale Compiler']},
 {id:'INTELLIGENCE',label:'Intelligence',copy:'AI · modes · memory · learning',Icon:BrainCircuit,routes:['Modes','Kernel Intelligence','Memory','Canon Evolution','SAI Lab']},
 {id:'EVIDENCE',label:'Evidence',copy:'Proof · archive · validation',Icon:ShieldCheck,routes:['Quality Compiler','Evidence & Proof','Archive Census','Archive Operators','Governance','Validation']},
 {id:'SYSTEM',label:'System',copy:'Settings · topology · restoration',Icon:Settings2,routes:['Instructions','Plugins','Settings','System','System Atlas','Control Matrix','Consolidation']}
] as const;
const ALL_ROUTES=DOMAINS.flatMap(d=>d.routes);
const PRIMARY=[
 {panel:'Command Center',label:'Command',copy:'Ask, reason and route action.',Icon:Command},
 {panel:'Matter Traversal',label:'Matter',copy:'Traverse scale and topology.',Icon:Orbit},
 {panel:'Earth Now',label:'Earth',copy:'Ground against external evidence.',Icon:Earth},
 {panel:'Visual Instrument',label:'Visual',copy:'Render the current computational field.',Icon:Eye},
 {panel:'SAI Lab',label:'Intelligence',copy:'Open the sovereign intelligence workspace.',Icon:BrainCircuit},
 {panel:'Evidence & Proof',label:'Proof',copy:'Inspect evidence and proof lineage.',Icon:ShieldCheck},
 {panel:'Hybrid Link',label:'Hybrid',copy:'Pair an authorized host and receive proof.',Icon:Link2},
 {panel:'System Atlas',label:'System Atlas',copy:'Inspect the full software universe.',Icon:Layers3}
] as const;
const f=(n:any,d=3)=>Number.isFinite(Number(n))?Number(n).toFixed(d):'—';

function Instrument({record,address,coords,unified,onAddress}:{record:any;address:number;coords:any;unified:any;onAddress:(n:number)=>void}){
 const m=record?.metrics||{},rings=[.18,.29,.41,.54,.68,.83];
 return <div className='r56-instrument' aria-label='OMEGA source-bound visual start field'>
  <svg viewBox='0 0 700 700' role='img' aria-label={`Canonical state ${record?.stateId||address} representational instrument`}>
   <defs><radialGradient id='r56Glow'><stop offset='0' stopColor='currentColor' stopOpacity='.24'/><stop offset='1' stopColor='currentColor' stopOpacity='0'/></radialGradient></defs>
   <circle className='r56-glow' cx='350' cy='350' r='300'/>
   {rings.map((r,i)=><circle key={r} className='r56-ring' cx='350' cy='350' r={r*330} style={{opacity:.14+i*.045}}/>)}
   {Array.from({length:12},(_,i)=>{const a=(i/12)*Math.PI*2-Math.PI/2,x=350+Math.cos(a)*270,y=350+Math.sin(a)*270;return <g key={i}><line className='r56-spoke' x1='350' y1='350' x2={x} y2={y}/><circle className={i===coords.d?'r56-node active':'r56-node'} cx={x} cy={y} r={i===coords.d?8:4}/></g>})}
   <circle className='r56-orbit continuity' cx='350' cy='350' r={90+Number(m.continuity||0)*90}/>
   <circle className='r56-orbit plasticity' cx='350' cy='350' r={140+Number(m.plasticity||0)*80}/>
   <circle className='r56-core-ring' cx='350' cy='350' r='55'/><circle className='r56-core' cx='350' cy='350' r='23'/>
   <text className='r56-svg-state' x='350' y='342' textAnchor='middle'>{record?.stateId?.toLocaleString?.()||address}</text>
   <text className='r56-svg-coord' x='350' y='370' textAnchor='middle'>D{coords.d+1} · P{coords.p+1} · R{coords.r+1} · L{coords.l+1}</text>
  </svg>
  <div className='r56-address-control'><button onClick={()=>onAddress(Math.max(0,address-1))} aria-label='Previous canonical state'>−</button><input type='range' min='0' max='20735' value={address} onChange={e=>onAddress(Number(e.target.value))} aria-label='Canonical 20,736 state address'/><button onClick={()=>onAddress(Math.min(20735,address+1))} aria-label='Next canonical state'>+</button></div>
  <div className='r56-metrics'><span><i>CΩ</i><b>{f(m.continuity)}</b></span><span><i>Φ</i><b>{f(m.plasticity)}</b></span><span><i>q</i><b>{f(m.contradiction)}</b></span><span><i>Λ</i><b>{f(m.burden)}</b></span><span><i>U</i><b>{f(unified?.unifiedCoherence)}</b></span></div>
 </div>
}

export default function OmegaHome({onEnter}:Props){
 const[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1','')),[busy,setBusy]=useState(false),[reply,setReply]=useState(''),[route,setRoute]=useState(''),[sourceReady,setSourceReady]=useState(false),[palette,setPalette]=useState(false),[query,setQuery]=useState(''),[domain,setDomain]=useState<DomainId>('WORK'),[cloud,setCloud]=useState<any>(null),[spine,setSpine]=useState<any>(null),[address,setAddress]=useState(()=>{const n=Number(localState.read('omega.v6.address',11498));return Number.isFinite(n)?Math.max(0,Math.min(20735,Math.floor(n))):11498});
 const daily=useMemo(()=>dailyBrief(),[]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live)setSourceReady(true)}).catch(()=>{if(live)setSourceReady(false)});return()=>{live=false}},[]);
 useEffect(()=>{let live=true;const load=async()=>{try{const[s,t]=await Promise.all([api.get<any>('/api/status'),api.get<any>('/api/live-state-spine')]);if(live){setCloud(s.data||null);setSpine(t.data||null)}}catch{if(live){setCloud(null);setSpine(null)}}};void load();const id=window.setInterval(load,30000);return()=>{live=false;window.clearInterval(id)}},[]);
 useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
 useEffect(()=>{localState.write('omega.v6.address',address)},[address]);
 const record=useMemo(()=>sourceReady?corpusState(address):null,[sourceReady,address]),coords=useMemo(()=>decodeAddress(address),[address]),unified=useMemo(()=>record?unifiedFromRecord(record):null,[record]),modes=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]),law=useMemo(()=>record?calculusVisualLaw(record):null,[record]);
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return q?ALL_ROUTES.filter(x=>x.toLowerCase().includes(q)):DOMAINS.find(d=>d.id===domain)?.routes||[]},[query,domain]);
 const enter=(panel:string)=>{if(!ALL_ROUTES.includes(panel as any))return;localState.write('omega.v6.panel',panel);localState.write('omega.v6.modePolicy','SOURCE_BACKED');onEnter(panel)};
 const ask=async()=>{if(!prompt.trim()||busy||!record||!modes)return;setBusy(true);setReply('');try{const context={address,stateId:record.stateId,coords,decision:record.metrics.decision,metrics:record.metrics,nextAddress:record.autoPing?.dataNext??address,previousAddress:record.autoPing?.previous??address,phase:coords.p+1,modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',modeCatalogCount:modes.catalogCount,appliedModeCount:modes.appliedCount,exactModeCount:modes.exactCount,packetModeCount:modes.packetCount,gatedModeCount:modes.gatedCount,exactModes:modes.executed.map(x=>({id:x.id,name:x.name,formula:x.formula,value:x.value,source:x.source})),gatedModes:modes.gated.map(x=>({id:x.id,name:x.name,formula:x.formula,missing:x.missing,source:x.source})),modeTruthBoundary:modes.boundary,unified:{coherence:unified?.unifiedCoherence,waterConductance:unified?.water?.conductance,motionRelativity:unified?.motionRelativity},responseContract:{plainLanguageFirst:true,separateObservedDerivedProjected:true,showRouteBeforeGeneration:true,includeForwardReverseStateContext:true,doNotInventMissingEvidence:true}};const p=await api.post<any>('/api/route-preview',{text:prompt,context}),r=await api.post<any>('/api/chat',{text:prompt,context});setRoute(String(r.data?.provider||p.data?.route||'ROUTED'));setReply(String(r.data?.reply||'OMEGA returned no text response.'))}catch(e:any){setRoute('BOUNDED_FAILURE');setReply(e?.message||'OMEGA could not complete the request. No answer was fabricated.')}finally{setBusy(false)}};
 const spineStates=Array.isArray(spine?.states)?spine.states.length:Array.isArray(spine?.requiredLiveState)?spine.requiredLiveState.length:0;
 return <main className='omega-home r56-home'>
  <header className='r56-topbar'><button className='r56-brand' onClick={()=>setPalette(false)}><span><Home/></span><div><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild} · SOVEREIGN COMPUTATIONAL ENVIRONMENT</small></div></button><div className='r56-live-strip'><span className={sourceReady?'ok':'wait'}><Activity/>CORPUS {sourceReady?'LIVE':'LOADING'}</span><span className={cloud?'ok':'wait'}><Globe2/>WORKER {cloud?'REACHABLE':'UNVERIFIED'}</span><span className={spineStates===14?'ok':'wait'}><ShieldCheck/>SPINE {spineStates||0}/14</span>{record&&modes&&<span className='ok'>SOURCE-BACKED MODES {modes.appliedCount} APPLIED · {modes.gatedCount} GATED</span>}</div><button className='r56-explore' onClick={()=>setPalette(true)}><Menu/>ALL SYSTEMS</button></header>

  <section className='r56-hero'>
   <div className='r56-copy'><span className='r56-eyebrow'>STATE + INTELLIGENCE + MEMORY + RELATION + COMPUTATION + ACTION + OBSERVATION + PROOF</span><h1>OMEGA</h1><h2>One sovereign environment.<br/>Every restored system in reach.</h2><p>Enter through the work you need—not through a placeholder dashboard. The active packet, evidence boundary, computation, memory and proof remain connected while you move between applications.</p><div className='r56-hero-actions'><button onClick={()=>enter('Command Center')}><Command/>ENTER COMMAND <ArrowRight/></button><button onClick={()=>enter('System Atlas')} className='secondary'><Layers3/>SEE THE WHOLE SYSTEM</button></div>
    <div className='r56-now'>{record?<><span>ACTIVE STATE <b>{record.stateId.toLocaleString()}</b></span><span>PHASE <b>{coords.p+1}/12</b></span><span>DECISION <b>{record.metrics.decision}</b></span><span>ROUTE <b>{record.autoPing?.dataNext?.toLocaleString?.()||'—'}</b></span></>:<span>Loading canonical corpus…</span>}</div>
   </div>
   {record?<Instrument record={record} address={address} coords={coords} unified={unified} onAddress={setAddress}/>:<div className='r56-instrument loading'><Orbit className='spin'/><b>Materializing 20,736-state source field…</b></div>}
  </section>

  <section className='r56-primary' aria-label='Primary OMEGA applications'>{PRIMARY.map(({panel,label,copy,Icon})=><button key={panel} onClick={()=>enter(panel)}><Icon/><span><b>{label}</b><small>{copy}</small></span><ChevronRight/></button>)}</section>

  <section className='r56-lower'>
   <article className='r56-ask'><header><div><BrainCircuit/><span><b>ASK THE ACTIVE STATE</b><small>{record?`STATE ${record.stateId.toLocaleString()} · ${record.metrics.decision}`:'SOURCE LOADING'}</small></span></div><em>{busy?'THINKING':'READY'}</em></header><div><textarea rows={3} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask what the evidence supports, where this state can move, or what OMEGA should do next…'/><button onClick={()=>void ask()} disabled={busy||!prompt.trim()||!record}>{busy?<Orbit className='spin'/>:<Send/>}</button></div>{reply&&<section><span>{route}</span><p>{reply}</p><button onClick={()=>enter('Command Center')}>Continue in Command Center <ArrowRight/></button></section>}</article>
   <article className='r56-daily'><div className='r56-daily-art' aria-hidden='true'><span/><i/><i/><i/></div><div><span><BookOpen/>TODAY'S FIELD LESSON</span><h3>{daily.title}</h3><p>{daily.lesson}</p><blockquote>{daily.quote}</blockquote><footer><small>{daily.source}</small><button onClick={()=>enter(daily.destination)}>Explore <ArrowRight/></button></footer></div></article>
  </section>

  <section className='r56-truth'><div><ShieldCheck/><span><b>Truth boundary</b><small>{spine?.boundary||'Browser state, cloud state, external evidence and native-device execution remain separately classified.'}</small></span></div><div><Activity/><span><b>B015 live-state spine</b><small>{spineStates===14?'14 required state classes exposed by the Worker.':`${spineStates}/14 currently returned; no missing state is painted green.`}</small></span></div><div><Archive/><span><b>Restoration lineage</b><small>Historical software remains mapped to current successors, retained donors, or explicit proof gates.</small></span></div></section>

  {palette&&<div className='r56-overlay' role='dialog' aria-modal='true' aria-label='OMEGA complete system launcher'><div className='r56-launcher'><header><div><Layers3/><span><b>OMEGA SYSTEM LAUNCHER</b><small>{ALL_ROUTES.length} registered operational surfaces · exact runtime routes</small></span></div><button onClick={()=>setPalette(false)} aria-label='Close system launcher'><X/></button></header><label className='r56-search'><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search all OMEGA systems…'/></label><nav className='r56-domains'>{DOMAINS.map(({id,label,copy,Icon})=><button key={id} className={domain===id?'active':''} onClick={()=>{setDomain(id);setQuery('')}}><Icon/><span><b>{label}</b><small>{copy}</small></span></button>)}</nav><div className='r56-route-grid'>{filtered.map(name=><button key={name} onClick={()=>enter(name)}><span>{name}</span><ChevronRight/></button>)}</div><footer><span><ShieldCheck/>Only registered runtime routes are launchable here.</span><button onClick={()=>enter('System Atlas')}>System Atlas <ArrowRight/></button></footer></div></div>}

  <details className='r56-lineage'><summary>Source-field forensic instruments</summary><div>{record&&<OmegaLivingField address={address} onSelectAddress={setAddress}/>} {record&&<OmegaMotionSkinMapR35 address={address} onSelectAddress={setAddress}/>}</div></details>
  <footer className='r56-footer'><span>OMEGA · {RUNTIME_IDENTITY.hostedBuild}</span>{record&&law&&<code>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l} · CURVATURE {f(law.curvature)} · FOLD {f(law.fold)}</code>}<span>No new physical-dimension claim · representational hierarchy 12 / 144 / 1,728 / 20,736</span></footer>
  <div hidden aria-hidden='true'>OPEN FULL WORKSTATION r4-welcome r4-journeys r4-conversation r4-truth-strip {JOURNEYS.length} {QUICK.length}</div>
 </main>
}
