import {useEffect,useState} from 'react';
import {Pause,Play,ShieldCheck,StepBack,StepForward} from 'lucide-react';
import MatterTraversal from './MatterTraversal';
import OmegaVisualInstrument from './OmegaVisualInstrument';
import OmegaTraversalStudio from './OmegaTraversalStudio';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import CalculusFieldR37 from './CalculusFieldR37';
import CapabilityMatrixR43 from './CapabilityMatrixR43';
import OmegaSignalFieldR44 from './OmegaSignalFieldR44';
import {corpusState} from './corpusRuntime';
import './livingSurfaceR36.css';
import './capabilityRestoreR43.css';

type WorkspaceView='LIVE'|'CAPABILITY'|'SIGNAL'|'DEEP'|'ROUTE';
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
function nextOf(a:number){return clamp(corpusState(clamp(a)).autoPing?.dataNext??a)}
function prevOf(a:number){return clamp(corpusState(clamp(a)).autoPing?.previous??a)}

function useActualTraversal(address:number,onAddress:(n:number)=>void){
 const[running,setRunning]=useState(false),[rate,setRate]=useState(900),[ticks,setTicks]=useState(0);
 useEffect(()=>{if(!running)return;const id=window.setInterval(()=>{onAddress(nextOf(address));setTicks(x=>x+1)},rate);return()=>window.clearInterval(id)},[running,rate,address,onAddress]);
 return{running,setRunning,rate,setRate,ticks};
}

function TraversalBar({address,onAddress,label}:{address:number;onAddress:(n:number)=>void;label:string}){
 const t=useActualTraversal(address,onAddress),r=corpusState(address);
 return <div className='r36-traversal-bar'><button onClick={()=>onAddress(prevOf(address))}><StepBack/>Previous</button><button className={t.running?'active primary-action':'primary-action'} onClick={()=>t.setRunning(v=>!v)}>{t.running?<Pause/>:<Play/>}{t.running?'Traversing':'Traverse'}</button><button onClick={()=>onAddress(nextOf(address))}><StepForward/>Admitted next</button><label>rate<select value={t.rate} onChange={e=>t.setRate(Number(e.target.value))}><option value='1500'>slow</option><option value='900'>normal</option><option value='450'>fast</option></select></label><span><b>{label}</b> · {r.stateId} · {t.ticks} enacted transitions</span></div>;
}

function useWorkspaceView(key:string){
 const[v,setV]=useState<WorkspaceView>(()=>{const x=localStorage.getItem(`omega.r43.${key}.view`) as WorkspaceView|null;return x&&['LIVE','CAPABILITY','SIGNAL','DEEP','ROUTE'].includes(x)?x:'LIVE'});
 const set=(x:WorkspaceView)=>{setV(x);localStorage.setItem(`omega.r43.${key}.view`,x)};
 return[v,set] as const;
}

function WorkspaceTabs({view,setView,deepLabel}:{view:WorkspaceView;setView:(v:WorkspaceView)=>void;deepLabel:string}){
 return <nav className='r43-workspace-tabs' aria-label='Specialist workspace depth'><button className={view==='LIVE'?'active':''} onClick={()=>setView('LIVE')}><b>LIVE FIELD</b><span>calculus-driven state</span></button><button className={view==='CAPABILITY'?'active':''} onClick={()=>setView('CAPABILITY')}><b>CAPABILITY MATRIX</b><span>144 × 12 × 12 operator space</span></button><button className={view==='SIGNAL'?'active':''} onClick={()=>setView('SIGNAL')}><b>SIGNAL FIELD</b><span>packet sonification</span></button><button className={view==='DEEP'?'active':''} onClick={()=>setView('DEEP')}><b>{deepLabel}</b><span>restored specialist controls</span></button><button className={view==='ROUTE'?'active':''} onClick={()=>setView('ROUTE')}><b>ROUTE + PROOF</b><span>reverse / admitted future</span></button></nav>;
}

export function MatterTraversalR36({address,onAddress,state,onNavigate}:{address:number;onAddress:(n:number)=>void;state:any;onNavigate?:(p:string)=>void}){
 const r=corpusState(address),[view,setView]=useWorkspaceView('matter');
 return <section className='special-app r36-living-surface r43-restored-surface'><header className='r36-surface-head'><div><span>MATTER · DEWEY/RSC CALCULUS VOLUME · SOURCE-BOUND</span><h2>Matter Traversal</h2><p>Live calculus rendering and the restored Matter compiler now share one canonical address. Nothing is hidden merely to make the screen simpler.</p></div><strong>{r.metrics.decision}</strong></header><WorkspaceTabs view={view} setView={setView} deepLabel='DEEP MATTER'/><div className='r43-workspace-stage' data-view={view}>{view==='LIVE'&&<><CalculusFieldR37 address={address} mode='MATTER' steps={30} onAddress={onAddress} label='MATTER · CALCULUS VOLUME'/><TraversalBar address={address} onAddress={onAddress} label='canonical matter evolution'/></>}{view==='CAPABILITY'&&<CapabilityMatrixR43 address={address} onAddress={onAddress} onNavigate={onNavigate}/>} {view==='SIGNAL'&&<OmegaSignalFieldR44 record={r}/>} {view==='DEEP'&&<MatterTraversal state={state} onCommit={(c:any)=>onAddress(1728*c.d+144*c.p+12*c.r+c.l)} onNavigate={onNavigate}/>} {view==='ROUTE'&&<><OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress}/><TraversalBar address={address} onAddress={onAddress} label='route / proof traversal'/></>}</div><footer className='r36-truth'><ShieldCheck/>The rendered volume is a calculus-driven representation of the OMEGA packet. Atlas coordinates and reference scales are not relabeled as measured particle positions.</footer></section>;
}

export function VisualInstrumentR36({address,onAddress,onNavigate}:{address:number;onAddress:(n:number)=>void;onNavigate?:(p:string)=>void}){
 const r=corpusState(address),[view,setView]=useWorkspaceView('visual');
 return <section className='special-app r36-living-surface r36-visual r43-restored-surface'><header className='r36-surface-head'><div><span>VISUAL INSTRUMENT · CALCULUS + RESTORED COMPILER</span><h2>Visual Instrument</h2><p>The living field, 20,736 depth camera, compiler lineage, PC spine, lenses, signal engine and capability atlas remain equally reachable instead of one generation replacing another.</p></div></header><WorkspaceTabs view={view} setView={setView} deepLabel='DEEP COMPILER'/><div className='r43-workspace-stage' data-view={view}>{view==='LIVE'&&<><div className='r36-visual-primary'><CalculusFieldR37 address={address} mode='FIELD' steps={30} onAddress={onAddress} label='UNIFIED VISUAL INSTRUMENT'/></div><TraversalBar address={address} onAddress={onAddress} label='visual state evolution'/></>}{view==='CAPABILITY'&&<CapabilityMatrixR43 address={address} onAddress={onAddress} onNavigate={onNavigate}/>} {view==='SIGNAL'&&<OmegaSignalFieldR44 record={r}/>} {view==='DEEP'&&<OmegaVisualInstrument address={address} onCommit={onAddress}/>} {view==='ROUTE'&&<><OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress}/><TraversalBar address={address} onAddress={onAddress} label='visual route / proof'/></>}</div><footer className='r36-truth'><ShieldCheck/>Deep compiler controls are restored as a normal workspace. Simplification may change presentation, never constitutional capability.</footer></section>;
}

export function TraversalR36({variant,address,state,onAddress,onNavigate}:{variant:'Immersive Traversal'|'Extreme Traversal'|'Traversal';address:number;state:any;onAddress:(n:number)=>void;onNavigate?:(p:string)=>void}){
 const r=corpusState(address),[view,setView]=useWorkspaceView(`traversal.${variant}`);
 return <section className='special-app r36-living-surface r43-restored-surface'><header className='r36-surface-head'><div><span>TRAVERSAL · ENACTED CALCULUS ROUTE · RESTORED STUDIO</span><h2>{variant}</h2><p>Traversal advances the canonical packet through admitted states while the living renderer, signal field and restored traversal studio remain available on the same state.</p></div></header><WorkspaceTabs view={view} setView={setView} deepLabel='DEEP STUDIO'/><div className='r43-workspace-stage' data-view={view}>{view==='LIVE'&&<><CalculusFieldR37 address={address} mode='TRAVERSAL' steps={36} onAddress={onAddress} label={`${variant.toUpperCase()} · CALCULUS EVOLUTION`}/><TraversalBar address={address} onAddress={onAddress} label='enacted traversal'/></>}{view==='CAPABILITY'&&<CapabilityMatrixR43 address={address} onAddress={onAddress} onNavigate={onNavigate}/>} {view==='SIGNAL'&&<OmegaSignalFieldR44 record={r}/>} {view==='DEEP'&&<OmegaTraversalStudio variant={variant} address={address} state={state} onAddress={onAddress}/>} {view==='ROUTE'&&<><OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress}/><TraversalBar address={address} onAddress={onAddress} label='route / proof traversal'/></>}</div><footer className='r36-truth'><ShieldCheck/>Motion is admitted state evolution in OMEGA address space. Visual curvature/depth are calculus projections, not unsupported claims of extra physical dimensions.</footer></section>;
}
