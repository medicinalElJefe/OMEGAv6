import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,BrainCircuit,Command,Earth,Eye,Link2,Search,Send,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {unifiedFromRecord} from './unifiedCalculus';
import {calculusVisualLaw,operatorColor,type OperatorColorRole} from './calculusVisualLawR37';
import CalculusFieldR37 from './CalculusFieldR37';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import './omegaHomeR71.css';

type Props={onEnter:(panel:string)=>void};
type DomainId='WORK'|'EXPLORE'|'INTELLIGENCE'|'EVIDENCE'|'SYSTEM';
type FieldMode='FIELD'|'MATTER'|'TRAVERSAL'|'FORECAST'|'RELATIVITY'|'CONVERGENCE';
const ROLES:OperatorColorRole[]=['ALPHA','BASE','CONSTRUCT','PRUNE','OMEGA'];
const ROLE_COPY:Record<OperatorColorRole,string>={
 ALPHA:'seed possibility / phase opening',
 BASE:'substrate evidence / continuity anchor',
 CONSTRUCT:'expansion / admitted growth',
 PRUNE:'inversion / contradiction reduction',
 OMEGA:'integration / coherent closure'
};
const DOMAINS:Record<DomainId,{label:string;role:OperatorColorRole;routes:string[]}>= {
 WORK:{label:'Work',role:'ALPHA',routes:['Command Center','Workspace','Cockpit','Hybrid Link','Create','Projects','Development','Build Out']},
 EXPLORE:{label:'Explore',role:'CONSTRUCT',routes:['Earth Now','Forecast','Reality Lab','Matter Traversal','Immersive Traversal','Extreme Traversal','Visual Instrument','Relativity','Atlas','Traversal','Field','Data Motion','Atlas Calculator','Infinity','Convergence','Scale Compiler']},
 INTELLIGENCE:{label:'Intelligence',role:'PRUNE',routes:['Modes','Kernel Intelligence','Memory','Canon Evolution','SAI Lab']},
 EVIDENCE:{label:'Evidence',role:'BASE',routes:['Quality Compiler','Evidence & Proof','Archive Census','Archive Operators','Governance','Validation']},
 SYSTEM:{label:'System',role:'OMEGA',routes:['Instructions','Plugins','Settings','System','System Atlas','Control Matrix','Consolidation']}
};
const QUICK=[['Earth','Earth Now',Earth],['Hybrid','Hybrid Link',Link2],['SAI','SAI Lab',BrainCircuit],['Proof','Evidence & Proof',ShieldCheck],['Visual','Visual Instrument',Eye],['Command','Command Center',Command]] as const;
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
const fmt=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';
function forwardRoute(start:number,steps=20){const out:number[]=[];let a=clamp(start);for(let i=0;i<steps;i++){out.push(a);const next=corpusState(a).autoPing?.dataNext;a=Number.isFinite(next)?clamp(Number(next)):a}return [...new Set(out)]}

export default function OmegaHomeR71({onEnter}:Props){
 const[address,setAddress]=useState(()=>clamp(Number(localState.read('omega.v6.address',11498))));
 const[ready,setReady]=useState(false),[domain,setDomain]=useState<DomainId>('EXPLORE'),[query,setQuery]=useState(''),[showApps,setShowApps]=useState(false);
 const[mode,setMode]=useState<FieldMode>('FIELD'),[selectedRole,setSelectedRole]=useState<OperatorColorRole>('OMEGA');
 const[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1','')),[reply,setReply]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState<any>(null),[hybrid,setHybrid]=useState<any>(null);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>live&&setReady(true)).catch(()=>live&&setReady(false));return()=>{live=false}},[]);
 useEffect(()=>{localState.write('omega.v6.address',address)},[address]);
 useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
 useEffect(()=>{let live=true;const load=async()=>{try{const[s,h]=await Promise.all([api.get<any>('/api/status'),api.get<any>('/api/hybrid/status')]);if(live){setStatus(s.data||null);setHybrid(h.data||null)}}catch{if(live){setStatus(null);setHybrid(null)}}};void load();const id=window.setInterval(load,30000);return()=>{live=false;window.clearInterval(id)}},[]);
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const modes=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]);
 const unified=useMemo(()=>record?unifiedFromRecord(record):null,[record]);
 const law=useMemo(()=>record?calculusVisualLaw(record):null,[record]);
 const route=useMemo(()=>ready?forwardRoute(address,24):[],[ready,address]);
 const nextAddress=record?clamp(Number(record.autoPing?.dataNext??address)):address;
 const allRoutes=useMemo(()=>Object.values(DOMAINS).flatMap(x=>x.routes),[]);
 const visibleRoutes=useMemo(()=>{const q=query.trim().toLowerCase();if(q)return allRoutes.filter(x=>x.toLowerCase().includes(q)).slice(0,18);return DOMAINS[domain].routes.slice(0,10)},[query,domain,allRoutes]);
 const enter=(panel:string)=>{if(!allRoutes.includes(panel))return;localState.write('omega.v6.panel',panel);localState.write('omega.v6.modePolicy','SOURCE_BACKED');onEnter(panel)};
 const targetRole=(role:OperatorColorRole)=>{if(!ready||!route.length)return;let best=address,bestWeight=-1;for(const a of route){const candidate=corpusState(a);const w=calculusVisualLaw(candidate).operatorWeights[role];if(w>bestWeight){bestWeight=w;best=a}}setSelectedRole(role);setAddress(best)};
 const ask=async()=>{if(!record||!modes||!prompt.trim()||busy)return;setBusy(true);setReply('');try{const context={address,stateId:record.stateId,coords,decision:record.metrics.decision,metrics:record.metrics,nextAddress,modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',appliedModeCount:modes.appliedCount,gatedModeCount:modes.gatedCount,unified:{coherence:unified?.unifiedCoherence,motionRelativity:unified?.motionRelativity},responseContract:{plainLanguageFirst:true,showRouteBeforeGeneration:true,doNotInventMissingEvidence:true}};await api.post('/api/route-preview',{text:prompt,context});const r=await api.post<any>('/api/chat',{text:prompt,context});setReply(String(r.data?.reply||'No response returned.'))}catch(e:any){setReply(e?.message||'No answer fabricated; provider/runtime path failed.')}finally{setBusy(false)}};
 const nativeOnline=Boolean(hybrid?.nativeExecutionClaimed===true&&(hybrid?.authenticatedHeartbeat===true||hybrid?.heartbeatAuthenticated===true||String(hybrid?.connectionState||hybrid?.state||'').toUpperCase()==='PC ONLINE'));
 const hybridLabel=nativeOnline?'PC ONLINE':hybrid?.browserCredentialReady||hybrid?.paired?'BROWSER CREDENTIAL READY · PC UNPROVEN':'PC NOT PROVEN ONLINE';
 return <main className='r71-home' data-color-authority='ALPHA BASE CONSTRUCT PRUNE OMEGA'>
  <header className='r71-topbar'>
   <button className='r71-brand' onClick={()=>{setDomain('EXPLORE');setShowApps(false)}}><span className='r71-mark'/><span><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild}</small></span></button>
   <nav className='r71-domains' aria-label='Application domains'>{(Object.keys(DOMAINS) as DomainId[]).map(id=><button key={id} className={domain===id?'active':''} data-role={DOMAINS[id].role} onClick={()=>{setDomain(id);setQuery('');setShowApps(true)}}><i style={{background:law?operatorColor(law,DOMAINS[id].role,.95):undefined}}/><span>{DOMAINS[id].label}</span></button>)}</nav>
   <button className='r71-apps-toggle' onClick={()=>setShowApps(v=>!v)} aria-expanded={showApps}><Search/><span>Applications</span></button>
  </header>

  {showApps&&<section className='r71-app-drawer' aria-label='OMEGA applications'>
   <div className='r71-drawer-head'><label><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search all OMEGA applications'/></label><button onClick={()=>setShowApps(false)}>Close</button></div>
   <div className='r71-route-grid'>{visibleRoutes.map(panel=><button key={panel} onClick={()=>enter(panel)}><span>{panel}</span><ArrowRight/></button>)}</div>
  </section>}

  <section className='r71-workspace'>
   <section className='r71-field-panel'>
    <div className='r71-field-toolbar'>
     <div><span>ACTIVE COMPUTATION</span><b>{record?`State ${record.stateId.toLocaleString()}`:'Materializing corpus…'}</b><small>{record?`${record.metrics.decision} · D${coords.d+1} P${coords.p+1} R${coords.r+1} L${coords.l+1}`:'source-backed canonical packet'}</small></div>
     <div className='r71-modes'>{(['FIELD','MATTER','TRAVERSAL','FORECAST','RELATIVITY','CONVERGENCE'] as FieldMode[]).map(m=><button key={m} className={mode===m?'active':''} onClick={()=>setMode(m)}>{m}</button>)}</div>
    </div>
    <div className='r71-field'>{record?<CalculusFieldR37 address={address} mode={mode} steps={36} onAddress={setAddress} label={`OMEGA · ${mode} · DIRECT MANIPULATION`}/>:<div className='r71-loading'><Activity/><b>Loading source-backed field</b></div>}</div>
    <div className='r71-traverse'>
     <button onClick={()=>setAddress(clamp(address-1))}>− STATE</button>
     <input aria-label='Canonical atlas address' type='range' min='0' max='20735' value={address} onChange={e=>setAddress(clamp(Number(e.target.value)))}/>
     <button onClick={()=>setAddress(nextAddress)}><Waypoints/> ADMITTED NEXT</button>
    </div>
   </section>

   <aside className='r71-control-panel'>
    <section className='r71-operator-console'>
     <header><div><span>COLOR RELATIVITY</span><h1>Operator console</h1></div><Sparkles/></header>
     <p>Choose an operator to move to the strongest matching state on the current admitted route. Color encodes function, not decoration.</p>
     <div className='r71-role-buttons'>{ROLES.map(role=>{const weight=law?.operatorWeights?.[role]??0;return <button key={role} className={selectedRole===role?'active':''} onClick={()=>targetRole(role)} style={{'--role-color':law?operatorColor(law,role,.95):undefined} as React.CSSProperties}><i/><span><b>{role}</b><small>{ROLE_COPY[role]}</small></span><strong>{Number(weight).toFixed(2)}</strong></button>})}</div>
    </section>

    {record&&<section className='r71-metrics'><div><span>CΩ</span><b>{fmt(record.metrics.continuity)}</b></div><div><span>Φ</span><b>{fmt(record.metrics.plasticity)}</b></div><div><span>q</span><b>{fmt(record.metrics.contradiction)}</b></div><div><span>Λ</span><b>{fmt(record.metrics.burden)}</b></div><div><span>COHERENCE</span><b>{fmt(unified?.unifiedCoherence)}</b></div><div><span>MODES</span><b>{modes?.appliedCount??0}</b><small>{modes?.gatedCount??0} gated</small></div></section>}

    <section className='r71-actions'><header><span>DIRECT APPLICATIONS</span><small>No icon-only ambiguity.</small></header><div>{QUICK.map(([label,panel,I])=><button key={panel} onClick={()=>enter(panel)}><I/><span><b>{label}</b><small>{panel}</small></span><ArrowRight/></button>)}</div></section>
   </aside>
  </section>

  <section className='r71-command'>
   <div className='r71-command-copy'><span>SOURCE-BACKED ASSISTANT</span><h2>Route first. Generate second.</h2><p>The active state, applied/gated modes, next admitted state and unified calculus are attached to the request before synthesis.</p></div>
   <div className='r71-command-input'><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask OMEGA to explain, forecast, inspect, traverse, build or prove from this state…'/><button onClick={()=>void ask()} disabled={!record||busy||!prompt.trim()}><Send/><span>{busy?'RUNNING':'RUN OMEGA'}</span></button>{reply&&<div className='r71-reply'>{reply}</div>}</div>
  </section>

  <footer className='r71-truthbar'><span className={status?'ok':'warn'}><Activity/>WORKER {status?'RESPONDING':'UNVERIFIED'}</span><span className={nativeOnline?'ok':'warn'}><Link2/>{hybridLabel}</span><span><ShieldCheck/>Representation shells are model/interface coordinates, not claims of physical dimensions.</span></footer>
 </main>
}
