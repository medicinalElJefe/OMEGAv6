import {Component,Suspense,lazy,useState,type ErrorInfo,type ReactNode} from 'react';
import {GitBranch,Home,X} from 'lucide-react';
import './index.css';
import './workstation.css';
import './surpass.css';
import './surfacePolish.css';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import OmegaHome from './OmegaHome';
const OmegaWorkstation=lazy(()=>import('./OmegaSurpassShell'));
const WovenBuildOutPanel=lazy(()=>import('./WovenBuildOutPanel'));
type BoundaryState={error:string};
class AppBoundary extends Component<{children:ReactNode},BoundaryState>{state:BoundaryState={error:''};static getDerivedStateFromError(error:unknown){return{error:error instanceof Error?error.message:String(error)}}componentDidCatch(error:unknown,info:ErrorInfo){console.error('OMEGA_APP_BOUNDARY',error,info.componentStack)}render(){if(this.state.error)return <div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · STARTUP ERROR</b><span>{this.state.error}</span><button className='gold' onClick={()=>window.location.reload()}>Reload OMEGA</button></div>;return this.props.children}}
function App(){const[home,setHome]=useState(true),[buildOut,setBuildOut]=useState(false);const address=()=>{const n=Number(localStorage.getItem('omega.v6.address')||11498);return Number.isFinite(n)?Math.max(0,Math.min(20735,Math.floor(n))):11498};const navigate=(name:string)=>{localStorage.setItem('omega.v6.panel',JSON.stringify(name));setBuildOut(false);setHome(false);window.dispatchEvent(new StorageEvent('storage',{key:'omega.v6.panel',newValue:JSON.stringify(name)}))};return <AppBoundary>{home?<OmegaHome onEnter={navigate}/>:<Suspense fallback={<div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · {RUNTIME_IDENTITY.runtimeContract}</b><span>Starting restored + surpass sovereign workstation…</span></div>}><OmegaWorkstation/><button className='omega-home-launch' onClick={()=>{setBuildOut(false);setHome(true)}} aria-label='Return to OMEGA home'><Home/></button><button className='woven-buildout-launch' onClick={()=>setBuildOut(true)} aria-label='Open Build Out mode'><GitBranch/>BUILD OUT</button>{buildOut&&<div className='woven-buildout-overlay'><header><div><span>ALL MODES · BUILD OUT</span><b>Woven Continuity Control Plane</b></div><button onClick={()=>setBuildOut(false)} aria-label='Close Build Out'><X/></button></header><main><WovenBuildOutPanel address={address()} onNavigate={navigate}/></main></div>}</Suspense>}</AppBoundary>}
export default App;
