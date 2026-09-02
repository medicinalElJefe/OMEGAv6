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
import './truthCourageR78.css';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import OmegaHomeR71 from './OmegaHomeR71';
const OmegaWorkstation=lazy(()=>import('./OmegaWorkstationFullV2'));
type BoundaryState={error:string};
class AppBoundary extends Component<{children:ReactNode},BoundaryState>{state:BoundaryState={error:''};static getDerivedStateFromError(error:unknown){return{error:error instanceof Error?error.message:String(error)}}componentDidCatch(error:unknown,info:ErrorInfo){console.error('OMEGA_APP_BOUNDARY',error,info.componentStack)}render(){if(this.state.error)return <div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · STARTUP ERROR</b><span>{this.state.error}</span><button className='gold' onClick={()=>window.location.reload()}>Reload OMEGA</button></div>;return this.props.children}}
function App(){const[home,setHome]=useState(true);useEffect(()=>{const open=()=>setHome(true);window.addEventListener('omega-home-request',open as EventListener);return()=>window.removeEventListener('omega-home-request',open as EventListener)},[]);const navigate=(name:string)=>{localStorage.setItem('omega.v6.panel',JSON.stringify(name));setHome(false)};return <AppBoundary>{home?<OmegaHomeR71 onEnter={navigate}/>:<Suspense fallback={<div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · {RUNTIME_IDENTITY.runtimeContract}</b><span>Starting full specialist workstation…</span></div>}><OmegaWorkstation/></Suspense>}</AppBoundary>}
export default App;