import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,Blocks,BrainCircuit,Command,Earth,Eye,Link2,Search,Send,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {corpusState,decodeAddress,initCorpusPack,type Projection,type ViewMode} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {unifiedFromRecord} from './unifiedCalculus';
import {calculusVisualLaw,operatorColor,type OperatorColorRole} from './calculusVisualLawR37';
import CanonicalMembraneR95 from './CanonicalMembraneR95';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import {compileFullOverallModePlanR79,compactModePlanR79} from './fullOverallModeOrchestratorR79';
import {OMEGA_ALL_ROUTES_R82,OMEGA_FIELD_PROJECTIONS_R82,OMEGA_WORKSPACES_R82,projectionForR82,type OmegaFieldProjectionR82,type OmegaWorkspaceIdR82} from './omegaExperienceRegistryR82';
import OmegaSystemInventoryR83 from './OmegaSystemInventoryR83';
import OmegaSideNavigatorR88 from './OmegaSideNavigatorR88';
import {CANON_AUTHORITY_COUNT} from './allModesAuthority';
import OmegaIntentWorkbenchR85 from './OmegaIntentWorkbenchR85';
import './omegaHomeR71.css';

type Props={onEnter:(panel:string)=>void};
type DomainId=OmegaWorkspaceIdR82;
type FieldMode=OmegaFieldProjectionR82;
type FederationNode={id:string;role:string;url?:string|null;endpoint?:string;availability?:string;stateGate?:string};
type FederationManifest={schema?:string;canonicalAuthority?:string;nodes?:FederationNode[]};

const ROLES:OperatorColorRole[]=['ALPHA','BASE','CONSTRUCT','PRUNE','OMEGA'];
const ROLE_COPY:Record<OperatorColorRole,string>={ALPHA:'seed possibility / phase opening',BASE:'substrate evidence / continuity anchor',CONSTRUCT:'expansion / admitted growth',PRUNE:'inversion / contradiction reduction',OMEGA:'integration / coherent closure'};
const QUICK=[['Earth','Earth Now',Earth],['Hybrid','Hybrid Link',Link2],['SAI','SAI Lab',BrainCircuit],['Proof','Evidence & Proof',ShieldCheck],['Visual','Visual Instrument',Eye],['Command','Command Center',Command]] as const;
const HOME_LENS:Record<FieldMode,{projection:Projection;view:ViewMode}>={
 FIELD:{projection:'MANDALA',view:'SOURCE_COLOR'},MATTER:{projection:'LATTICE',view:'SCAR'},TRAVERSAL:{projection:'THREAD',view:'CONTINUITY'},FORECAST:{projection:'THREAD',view:'PHI'},
 RELATIVITY:{projection:'INVERSE',view:'MATH'},INFINITY:{projection:'MANDALA',view:'INVERSE'},SCALE:{projection:'LATTICE',view:'PSC'},CONVERGENCE:{projection:'INVERSE',view:'DECISION'}
};
const ENGINE_META=[
 {id:'omega-v6',label:'CANONICAL',action:'admit · prove · replay'},
 {id:'omega-genesis',label:'GENESIS',action:'propose · explore'},
 {id:'omega-optical',label:'OPTICAL',action:'screen · rank · queue'},
 {id:'omega-sovereign',label:'SOVEREIGN',action:'execute · return proof'}
] as const;
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
const fmt=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';
function forwardRoute(start:number,steps=20){const out:number[]=[];let a=clamp(start);for(let i=0;i<steps;i++){out.push(a);const next=corpusState(a).autoPing?.dataNext;a=Number.isFinite(next)?clamp(Number(next)):a}return [...new Set(out)]}

export default function OmegaHomeR71({onEnter}:Props){
 const[address,setAddress]=useState(()=>clamp(Number(localState.read('omega.v6.address',11498))));
 const[ready,setReady]=useState(false),[domain,setDomain]=useState<DomainId>(()=>{try{const x=localStorage.getItem('omega.r82.workspace') as DomainId|null;return x&&OMEGA_WORKSPACES_R82.some(w=>w.id===x)?x:'EXPLORE'}catch{return'EXPLORE'}});
 const[mode,setMode]=useState<FieldMode>(()=>{try{const x=localStorage.getItem('omega.r82.homeProjection') as FieldMode|null;return x&&OMEGA_FIELD_PROJECTIONS_R82.some(m=>m.id===x)?x:'FIELD'}catch{return'FIELD'}}),[selectedRole,setSelectedRole]=useState<OperatorColorRole>('OMEGA');
 const[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1','')),[reply,setReply]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState<any>(null),[hybrid,setHybrid]=useState<any>(null),[federation,setFederation]=useState<FederationManifest|null>(null);
 const[showSystemMap,setShowSystemMap]=useState(()=>{try{const saved=localStorage.getItem('omega.r88.systemMapOpen');if(saved!==null)return saved==='true';return false}catch{return false}}),[showWorkflow,setShowWorkflow]=useState(false);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>live&&setReady(true)).catch(()=>live&&setReady(false));return()=>{live=false}},[]);
 useEffect(()=>{localState.write('omega.v6.address',address)},[address]);
 useEffect(()=>{try{localStorage.setItem('omega.r82.workspace',domain)}catch{}},[domain]);
 useEffect(()=>{try{localStorage.setItem('omega.r82.homeProjection',mode)}catch{}},[mode]);
 useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
 useEffect(()=>{try{localStorage.setItem('omega.r88.systemMapOpen',String(showSystemMap))}catch{}},[showSystemMap]);
 useEffect(()=>{let live=true;const load=async()=>{try{const[s,h,f]=await Promise.all([api.get<any>('/api/status'),api.get<any>('/api/hybrid/status'),fetch('/omega-federation.json',{cache:'no-store'}).then(r=>r.ok?r.json():null)]);if(live){setStatus(s.data||null);setHybrid(h.data||null);setFederation(f)}}catch{if(live){setStatus(null);setHybrid(null)}}};void load();const id=window.setInterval(load,30000);return()=>{live=false;window.clearInterval(id)}},[]);
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const modes=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]);
 const unified=useMemo(()=>record?unifiedFromRecord(record):null,[record]);
 const law=useMemo(()=>record?calculusVisualLaw(record):null,[record]);
 const projection=projectionForR82(mode),modePanel=projection.panel,lens=HOME_LENS[mode];
 const modePlan=useMemo(()=>record?compileFullOverallModePlanR79(record,modePanel,prompt):null,[record,modePanel,prompt]);
 const route=useMemo(()=>ready?forwardRoute(address,24):[],[ready,address]);
 const nextAddress=record?clamp(Number(record.autoPing?.dataNext??address)):address;
 const allRoutes=useMemo(()=>[...OMEGA_ALL_ROUTES_R82],[]),activeWorkspace=OMEGA_WORKSPACES_R82.find(x=>x.id===domain)||OMEGA_WORKSPACES_R82[0];
 const enter=(panel:string)=>{if(!allRoutes.includes(panel))return;localState.write('omega.v6.panel',panel);localState.write('omega.v6.modePolicy','SOURCE_BACKED');onEnter(panel)};
 const openApplications=(workspace:DomainId=domain)=>{setDomain(workspace);window.dispatchEvent(new CustomEvent('omega-r88-open-navigator',{detail:{layer:'APPLICATIONS'}}))};
 const openSoftware=()=>window.dispatchEvent(new CustomEvent('omega-r88-open-navigator',{detail:{layer:'SOFTWARE'}}));
 const targetRole=(role:OperatorColorRole)=>{if(!ready||!route.length)return;let best=address,bestWeight=-1;for(const a of route){const candidate=corpusState(a),weight=calculusVisualLaw(candidate).operatorWeights[role];if(weight>bestWeight){bestWeight=weight;best=a}}setSelectedRole(role);setAddress(best)};
 const ask=async()=>{if(!record||!modes||!modePlan||!prompt.trim()||busy)return;setBusy(true);setReply('');try{const context={address,stateId:record.stateId,coords,decision:record.metrics.decision,metrics:record.metrics,nextAddress,modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',appliedModeCount:modes.appliedCount,gatedModeCount:modes.gatedCount,fullOverallModePlan:compactModePlanR79(modePlan),unified:{coherence:unified?.unifiedCoherence,motionRelativity:unified?.motionRelativity},responseContract:{plainLanguageFirst:true,showRouteBeforeGeneration:true,doNotInventMissingEvidence:true,preserveTruthBoundary:true}};await api.post('/api/route-preview',{text:prompt,context});const r=await api.post<any>('/api/chat',{text:prompt,context});setReply(String(r.data?.reply||'No response returned.'))}catch(e:any){setReply(e?.message||'No answer fabricated; provider/runtime path failed.')}finally{setBusy(false)}};
 const nativeOnline=Boolean(hybrid?.nativeExecutionClaimed===true&&(hybrid?.authenticatedHeartbeat===true||hybrid?.heartbeatAuthenticated===true||String(hybrid?.connectionState||hybrid?.state||'').toUpperCase()==='PC ONLINE'||String(hybrid?.state||'').toUpperCase()==='VERIFIED_DEVICE_ONLINE'));
 const hybridLabel=nativeOnline?'PC ONLINE':hybrid?.browserCredentialReady||hybrid?.paired?'BROWSER CREDENTIAL READY · PC UNPROVEN':'PC NOT PROVEN ONLINE';
 const federationNodes=new Map((federation?.nodes||[]).map(node=>[node.id,node]));
 const engineState=(id:string)=>id==='omega-v6'?(status?'LIVE':'UNVERIFIED'):id==='omega-sovereign'?(nativeOnline?'PC ONLINE':'DEVICE PROOF REQUIRED'):(federationNodes.get(id)?.availability||'REGISTERED · EXTERNAL GATE');

 return <main className='r71-home r96-home' data-color-authority='ALPHA BASE CONSTRUCT PRUNE OMEGA'>
  <OmegaSideNavigatorR88 onNavigate={enter}/>
  <header className='r96-topbar'>
   <button className='r96-brand' onClick={()=>setDomain('EXPLORE')}><span className='r96-mark'/><span><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild} · ONE CANONICAL RUNTIME</small></span></button>
   <div className='r96-now'><span>NOW</span><b>{record?`STATE ${record.stateId.toLocaleString()}`:'MATERIALIZING'}</b><small>{record?`${record.metrics.decision} · D${coords.d+1} P${coords.p+1} R${coords.r+1} L${coords.l+1}`:'source-bound corpus'}</small></div>
   <div className='r96-header-actions'><button onClick={()=>openApplications()}><Search/>All 44 applications</button><button onClick={openSoftware}><Blocks/>Complete software system</button></div>
  </header>

  <nav className='r96-workspaces' aria-label='OMEGA working contexts'>{OMEGA_WORKSPACES_R82.map(w=><button key={w.id} className={domain===w.id?'active':''} data-role={w.role} onClick={()=>setDomain(w.id)} style={{'--workspace-color':law?operatorColor(law,w.role,.95):undefined} as React.CSSProperties}><i/><span><b>{w.label}</b><small>{w.copy}</small></span><strong>{w.routes.length}</strong></button>)}</nav>

  <section className='r96-engine-spine' aria-label='OMEGA federation engines'>
   {ENGINE_META.map((engine,index)=>{const node=federationNodes.get(engine.id),state=engineState(engine.id),live=state==='LIVE'||state==='PC ONLINE';return <article key={engine.id} className={live?'live':state.includes('REQUIRED')||state.includes('GATE')?'held':''} title={node?.role||engine.action}><span>0{index+1} · {engine.label}</span><b>{engine.action}</b><small><i/>{state}</small></article>})}
  </section>

  <section className='r96-workbench'>
   <section className='r96-canvas'>
    <header className='r96-canvas-head'><div><span>ACTIVE COMPUTATION · 20,736 SOURCE CELLS</span><b>{projection.label}</b><small>{projection.intent}</small></div><button onClick={()=>enter(projection.panel)}>Open specialist <ArrowRight/></button></header>
    <nav className='r71-modes' aria-label='Canonical membrane analysis lenses'>{OMEGA_FIELD_PROJECTIONS_R82.map(m=><button key={m.id} className={mode===m.id?'active':''} data-signature={m.signature} title={`${m.label} · ${m.intent}`} onClick={()=>setMode(m.id)}><b>{m.label}</b><small>{HOME_LENS[m.id].projection} · {HOME_LENS[m.id].view.replaceAll('_',' ')}</small></button>)}</nav>
    <div className='r96-projection-law'><span>{projection.signature}</span><b>{lens.projection} position + {lens.view.replaceAll('_',' ')} color</b><small>{projection.intent} · primary Home display remains the canonical 20,736-cell membrane</small></div>
    <div className='r71-field'>{record?<CanonicalMembraneR95 address={address} onAddress={setAddress} projection={lens.projection} view={lens.view} showControls={false} compact label={`HOME · ${projection.label.toUpperCase()} · CANONICAL MEMBRANE`}/>:<div className='r71-loading'><Activity/><b>Loading canonical membrane</b></div>}</div>
    <div className='r71-traverse'><button onClick={()=>setAddress(clamp(address-1))}>− STATE</button><input aria-label='Canonical atlas address' type='range' min='0' max='20735' value={address} onChange={e=>setAddress(clamp(Number(e.target.value)))}/><button onClick={()=>setAddress(nextAddress)}><Waypoints/>ADMITTED NEXT</button></div>
    <div className='r96-command-dock'><div><span>SOURCE-BACKED ASSISTANT</span><b>Route first. Generate second.</b></div><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask OMEGA to explain, forecast, inspect, traverse, build or prove from this state…'/><button onClick={()=>void ask()} disabled={!record||busy||!prompt.trim()}><Send/><span>{busy?'RUNNING':'RUN OMEGA'}</span></button>{reply&&<div className='r71-reply'>{reply}</div>}</div>
   </section>

   <aside className='r96-inspector'>
    <section className='r96-state-card'><header><span>CANONICAL PACKET</span><b>{record?record.stateId:'—'}</b></header>{record&&<div><article><span>CΩ</span><b>{fmt(record.metrics.continuity)}</b></article><article><span>Φ</span><b>{fmt(record.metrics.plasticity)}</b></article><article><span>q</span><b>{fmt(record.metrics.contradiction)}</b></article><article><span>Λ</span><b>{fmt(record.metrics.burden)}</b></article><article><span>COHERENCE</span><b>{fmt(unified?.unifiedCoherence)}</b></article><article><span>MODES</span><b>{modes?.appliedCount??0}</b><small>{modes?.gatedCount??0} gated</small></article></div>}</section>
    <section className='r96-operator-card'><header><div><span>COLOR RELATIVITY</span><b>Operators</b></div><Sparkles/></header><p>Function changes hue and the strongest lawful point on the admitted route.</p><div>{ROLES.map(role=>{const weight=law?.operatorWeights?.[role]??0;return <button key={role} className={selectedRole===role?'active':''} onClick={()=>targetRole(role)} style={{'--role-color':law?operatorColor(law,role,.95):undefined} as React.CSSProperties}><i/><span><b>{role}</b><small>{ROLE_COPY[role]}</small></span><strong>{Number(weight).toFixed(2)}</strong></button>})}</div></section>
    <section className='r96-context-card'><header><div><span>{activeWorkspace.label.toUpperCase()} CONTEXT</span><b>{activeWorkspace.copy}</b></div><button onClick={()=>openApplications(domain)}><Search/>All tools</button></header><div>{activeWorkspace.routes.map(panel=><button key={panel} onClick={()=>enter(panel)}><span>{panel}</span><ArrowRight/></button>)}</div></section>
    <section className='r96-quick-card'><header><span>DIRECT</span><small>specialist identity preserved</small></header><div>{QUICK.map(([label,panel,I])=><button key={panel} onClick={()=>enter(panel)}><I/><span><b>{label}</b><small>{panel}</small></span></button>)}</div></section>
   </aside>
  </section>

  <section className='r96-progressive'>
   <details open={showWorkflow} onToggle={e=>setShowWorkflow(e.currentTarget.open)}><summary><span><Waypoints/><b>Operational workflow</b><small>intent → canonical actions → checkpoint → proof</small></span><strong>{showWorkflow?'Close':'Open'}</strong></summary>{record&&<OmegaIntentWorkbenchR85 record={record} address={address} currentPanel='Home' onAddress={setAddress} onNavigate={enter}/>}</details>
   <details open={showSystemMap} onToggle={e=>setShowSystemMap(e.currentTarget.open)}><summary><span><Blocks/><b>System lineage</b><small>44 application routes · 100 system rows · 24 runtime families · 179 source modes · {CANON_AUTHORITY_COUNT} canon lenses</small></span><strong>{showSystemMap?'Close':'Open'}</strong></summary>{showSystemMap&&<OmegaSystemInventoryR83 compact onNavigate={enter}/>}</details>
  </section>

  <footer className='r71-truthbar'><span className={status?'ok':'warn'}><Activity/>WORKER {status?'RESPONDING':'UNVERIFIED'}</span><span className={nativeOnline?'ok':'warn'}><Link2/>{hybridLabel}</span><span><ShieldCheck/>Representation shells are model/interface coordinates, not claims of physical dimensions.</span></footer>
 </main>
}
