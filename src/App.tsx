import {Component,Suspense,lazy,useEffect,useState,type ErrorInfo,type ReactNode} from 'react';
import './index.css';import './workstation.css';import './surfaceIntegrityR81.css';import './productCoherenceR356.css';
import {RUNTIME_IDENTITY} from './runtimeIdentity';import Omega7Root from '../src7/Omega7Root';import {requestRouteLifecycleR356} from './system/routeLifecycleR356';import LivingWorldPulseR174 from './LivingWorldPulseR174';import LivingSceneEvidenceBandR2023 from './LivingSceneEvidenceBandR2023';import MissionWorldContinuityR206 from './MissionWorldContinuityR206';import LivingTerrainSurfaceR225 from './LivingTerrainSurfaceR225';import OmegaExperienceShellR257 from './OmegaExperienceShellR257';import {OmegaExperienceProviderR257} from './OmegaExperienceContextR257';import {HybridRuntimeSnapshotProviderR238} from './HybridRuntimeSnapshotR238';import {installLivingWorldOperationBridgeR140} from './world/operationWorldBridgeR140';import {installRuntimeAttestationWorldScarR145} from './world/runtimeAttestationWorldScarR145';import {installDurableWorldHeadContinuityR149} from './world/durableWorldHeadContinuityR149';import {installReflexOperationIngressR160} from './world/reflexOperationIngressR160';import {installMissionWorldHeadBindingR208} from './world/missionWorldHeadBindingR208';import {installFederationLedgerWorldObserverR173} from './world/federationLedgerWorldObserverR173.js';import {installLivingWorldProofMembraneR1901} from './world/livingWorldProofMembraneR1901.js';import {installLivingWorldIntelligenceProofR196} from './world/livingWorldIntelligenceProofR196.js';import {installEvidenceBoundSceneIngressR2022} from './world/evidenceBoundSceneIngressR2022';

const OmegaHomeR71=lazy(()=>import('./OmegaHomeR71'));
const OmegaWorkstation=lazy(()=>import('./OmegaWorkstationFullV2'));

const safeStore=(key:string,value:string)=>{try{window.localStorage.setItem(key,value)}catch{}};
type BoundaryState={error:string};

class AppBoundary extends Component<{children:ReactNode;onHome:()=>void},BoundaryState>{
 state:BoundaryState={error:''};
 static getDerivedStateFromError(error:unknown){return{error:error instanceof Error?error.message:String(error)}}
 componentDidCatch(error:unknown,info:ErrorInfo){console.error('OMEGA_SURFACE_BOUNDARY',error,info.componentStack)}
 render(){
  if(this.state.error)return <section className='r319-bounded-surface-error' role='alert' aria-live='assertive'><b>This surface could not finish loading.</b><span>{this.state.error}</span><div><button type='button' onClick={this.props.onHome}>Return Home</button><button type='button' onClick={()=>this.setState({error:''})}>Retry surface</button></div></section>;
  return this.props.children;
 }
}

function App(){
 const[home,setHome]=useState(true);
 const[omega7,setOmega7]=useState(()=>{try{const params=new URLSearchParams(window.location.search),explicit=params.get('omega7');if(params.get('omega6')==='1'||explicit==='0')return false;if(explicit==='1')return true;return window.localStorage.getItem('omega7.enabled')!=='false'}catch{return true}});\n useEffect(()=>{if(omega7)safeStore('omega7.enabled','true')},[omega7]);

 useEffect(()=>{installLivingWorldOperationBridgeR140();installRuntimeAttestationWorldScarR145();installDurableWorldHeadContinuityR149();installReflexOperationIngressR160();const stopMissionWorldBinding=installMissionWorldHeadBindingR208();const stopFederationObserver=installFederationLedgerWorldObserverR173();const stopProofMembrane=installLivingWorldProofMembraneR1901();const stopIntelligenceProof=installLivingWorldIntelligenceProofR196();const stopEvidenceScene=installEvidenceBoundSceneIngressR2022();return()=>{stopEvidenceScene();stopIntelligenceProof();stopProofMembrane();stopFederationObserver();stopMissionWorldBinding()}},[]);

 useEffect(()=>{const open=()=>setHome(true);window.addEventListener('omega-home-request',open as EventListener);return()=>window.removeEventListener('omega-home-request',open as EventListener)},[]);

 const navigate=(name:string)=>{
  const panel=String(name||'').trim();if(!panel)return;
  requestRouteLifecycleR356(home?'Home':(document.documentElement.dataset.omegaRouteCurrent||'Workstation'),panel);
  safeStore('omega.v6.panel',JSON.stringify(panel));setHome(false);
 };
 const openLegacyFromOmega7=(name:string)=>{safeStore('omega7.lastRoute',name);setOmega7(false);navigate(name)};
 const exitOmega7=()=>{safeStore('omega7.enabled','false');setOmega7(false);setHome(true)};
 const fallback=<div className='r319-bounded-loading' role='status' aria-live='polite' aria-busy='true'><span>{home?'Starting OMEGA…':'Opening workspace…'}</span></div>;

 if(omega7)return <Omega7Root onOpenLegacyRoute={openLegacyFromOmega7} onExitToV6={exitOmega7}/>;

 return <OmegaExperienceProviderR257><OmegaExperienceShellR257 chrome={false} onNavigate={navigate} onHome={()=>setHome(true)} home={home}><main className='r317-product-root' data-r317-composition='SINGLE_CANONICAL_NAVIGATOR' data-r356-product='CANONICAL_PRODUCT_GRAMMAR'><style>{`.r319-bounded-loading,.r319-bounded-surface-error{position:relative;inset:auto;min-height:0;height:auto;padding:12px 16px;margin:10px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(8,12,18,.82);z-index:auto}.r319-bounded-surface-error{display:grid;gap:8px}.r319-bounded-surface-error div{display:flex;gap:8px;flex-wrap:wrap}`}</style><details className='r318-system-diagnostics'><summary>System status</summary><LivingWorldPulseR174 onNavigate={navigate}/><LivingSceneEvidenceBandR2023 onNavigate={navigate}/><MissionWorldContinuityR206 onNavigate={navigate}/><LivingTerrainSurfaceR225/></details><AppBoundary onHome={()=>setHome(true)}><Suspense fallback={fallback}>{home?<OmegaHomeR71 onEnter={navigate}/>:<HybridRuntimeSnapshotProviderR238><OmegaWorkstation/></HybridRuntimeSnapshotProviderR238>}</Suspense></AppBoundary></main></OmegaExperienceShellR257></OmegaExperienceProviderR257>;
}
export default App;
