import {Component,Suspense,lazy,useEffect,useState,type ErrorInfo,type ReactNode} from 'react';
import {Home} from 'lucide-react';
import './index.css';
import './workstation.css';
import './surpass.css';
import './surfacePolish.css';
import './omegaVisualIdentity.css';
import './uxSurpassR2.css';
import './uxSurpassR3.css';
import './experienceR4.css';
import './runtimeRailR4.css';
import './omegaSovereignVisualR10.css';
import './navigationButtonPolishR11.css';
import './omegaProfessionalR13.css';
import './omegaInterfaceR16.css';
import './omegaHomeR17.css';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import OmegaHome from './OmegaHome';
import OmegaLauncher from './OmegaLauncher';
import OmegaModeAuthorityDock from './OmegaModeAuthorityDock';
import OmegaViewAuthorityBar from './OmegaViewAuthorityBar';
const OmegaWorkstation=lazy(()=>import('./OmegaWorkstationFullV2'));
type BoundaryState={error:string};
class AppBoundary extends Component<{children:ReactNode},BoundaryState>{state:BoundaryState={error:''};static getDerivedStateFromError(error:unknown){return{error:error instanceof Error?error.message:String(error)}}componentDidCatch(error:unknown,info:ErrorInfo){console.error('OMEGA_APP_BOUNDARY',error,info.componentStack)}render(){if(this.state.error)return <div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · STARTUP ERROR</b><span>{this.state.error}</span><button className='gold' onClick={()=>window.location.reload()}>Reload OMEGA</button></div>;return this.props.children}}
function App(){const[home,setHome]=useState(true);useEffect(()=>{const open=()=>setHome(true);window.addEventListener('omega-home-request',open as EventListener);return()=>window.removeEventListener('omega-home-request',open as EventListener)},[]);const navigate=(name:string)=>{localStorage.setItem('omega.v6.panel',JSON.stringify(name));setHome(false)};return <AppBoundary>{home?<OmegaHome onEnter={navigate}/>:<><Suspense fallback={<div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · {RUNTIME_IDENTITY.runtimeContract}</b><span>Starting full specialist workstation…</span></div>}><OmegaWorkstation/></Suspense><OmegaLauncher onNavigate={navigate}/><OmegaModeAuthorityDock onNavigate={navigate}/><OmegaViewAuthorityBar/><button className='omega-home-launch' onClick={()=>setHome(true)} aria-label='Return to OMEGA home'><Home/></button></>}</AppBoundary>}
export default App;