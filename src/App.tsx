import {Component,Suspense,lazy,type ErrorInfo,type ReactNode} from 'react';
import './index.css';
import './workstation.css';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
const OmegaWorkstation=lazy(()=>import('./OmegaSurpassShell'));
type BoundaryState={error:string};
class AppBoundary extends Component<{children:ReactNode},BoundaryState>{state:BoundaryState={error:''};static getDerivedStateFromError(error:unknown){return{error:error instanceof Error?error.message:String(error)}}componentDidCatch(error:unknown,info:ErrorInfo){console.error('OMEGA_APP_BOUNDARY',error,info.componentStack)}render(){if(this.state.error)return <div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · STARTUP ERROR</b><span>{this.state.error}</span><button className='gold' onClick={()=>window.location.reload()}>Reload OMEGA</button></div>;return this.props.children}}
function App(){return <AppBoundary><Suspense fallback={<div className='boot'><b>OMEGA {RUNTIME_IDENTITY.hostedBuild} · {RUNTIME_IDENTITY.runtimeContract}</b><span>Starting restored + surpass sovereign workstation…</span></div>}><OmegaWorkstation/></Suspense></AppBoundary>}
export default App;
