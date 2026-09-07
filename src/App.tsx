import {Component,Suspense,lazy,useEffect,useState,type ErrorInfo,type ReactNode} from 'react';
/* R70 current-union style authority remains foundational. R71 changes composition and interaction,
   not cascade ownership: the direct operator workspace becomes the primary home application. */
import './index.css';
import './workstation.css';
import './coherenceRepairR35.css';
import './specialistDepthR38_3.css';
import './mobileMatterR42.css';
import './sovereignDesignR59.css';
import './instrumentOSR62.css';
import './productResetR67.css';
import './surfaceIntegrityR81.css';
import './capabilityFirstR138.css';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import LivingWorldPulseR174 from './LivingWorldPulseR174';
import {installLivingWorldOperationBridgeR140} from './world/operationWorldBridgeR140';
import {installRuntimeAttestationWorldScarR145} from './world/runtimeAttestationWorldScarR145';
import {installDurableWorldHeadContinuityR149} from './world/durableWorldHeadContinuityR149';
import {installReflexOperationIngressR160} from './world/reflexOperationIngressR160';
import {installFederationLedgerWorldObserverR173} from './world/federationLedgerWorldObserverR173.js';
import {installLivingWorldProofMembraneR1901} from './world/livingWorldProofMembraneR1901.js';
import {installLivingWorldIntelligenceProofR196} from './world/livingWorldIntelligenceProofR196.js';
const OmegaHomeR71=lazy(()=>import('./OmegaHomeR71'));
const OmegaWorkstation=lazy(()=>import('./OmegaWorkstationFullV2'));
type BoundaryState={error:string};
class AppBoundary extends Component<{children:ReactNode},BoundaryState>{state:BoundaryState={error:''};static getDerivedStateFromError(error:unknown){return{error:error instanceof Error?error.message:String(error)}}componentDidCatch(error:unknown,info:ErrorInfo){console.error('OMEGA_APP_BOUNDARY',error,info.componentStack)}render(){if(this.state.error)return <div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · STARTUP ERROR</b><span>{this.state.error}</span><button className='gold' onClick={()=>window.location.reload()}>Reload OMEGA</button></div>;return this.props.children}}
function App(){const[home,setHome]=useState(true);useEffect(()=>{installLivingWorldOperationBridgeR140();installRuntimeAttestationWorldScarR145();installDurableWorldHeadContinuityR149();installReflexOperationIngressR160();const stopFederationObserver=installFederationLedgerWorldObserverR173();const stopProofMembrane=installLivingWorldProofMembraneR1901();const stopIntelligenceProof=installLivingWorldIntelligenceProofR196();return()=>{stopIntelligenceProof();stopProofMembrane();stopFederationObserver()}},[]);useEffect(()=>{const open=()=>setHome(true);window.addEventListener('omega-home-request',open as EventListener);return()=>window.removeEventListener('omega-home-request',open as EventListener)},[]);const navigate=(name:string)=>{localStorage.setItem('omega.v6.panel',JSON.stringify(name));setHome(false)};const fallback=<div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · {RUNTIME_IDENTITY.runtimeContract}</b><span>{home?'Starting direct operator home…':'Starting full specialist workstation…'}</span></div>;return <AppBoundary><LivingWorldPulseR174 onNavigate={navigate}/><Suspense fallback={fallback}>{home?<OmegaHomeR71 onEnter={navigate}/>:<OmegaWorkstation/>}</Suspense></AppBoundary>}
export default App;