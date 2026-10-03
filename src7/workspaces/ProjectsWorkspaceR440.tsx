import OmegaGovernanceProjectMediaR29 from '../../src/OmegaGovernanceProjectMediaR29';
import {useOmega7NativeRuntimeR440} from '../runtime/Omega7NativeRuntimeR440';

type Props={onNavigate:(route:string)=>void};

export default function ProjectsWorkspaceR440({onNavigate}:Props){
 const{ready,bootError,retry,record,address,commitAddress,status,restore,statusError}=useOmega7NativeRuntimeR440();
 if(bootError)return <section className='o7-command-native-state' role='alert'><b>Projects could not load the shared OMEGA source runtime.</b><p>{bootError}</p><button onClick={()=>void retry()}>Retry source runtime</button></section>;
 if(!ready||!record)return <section className='o7-native-loading' role='status' aria-live='polite'>Preparing project continuity…</section>;
 const runtimeStatus=statusError?{error:statusError}:status;
 const runtimeRestore=statusError?{error:statusError}:restore;
 return <section className='o7-native-workspace o7-projects-workspace' data-omega7-native='projects' data-address={address}>
  <header className='o7-native-head'>
   <div><span>Work · Projects</span><h1>Projects</h1><p>Keep work attached to the same OMEGA state, continuity receipts, workflows, and operations without confusing browser continuity with GitHub, Drive, or native files.</p></div>
   <aside><b>Continuity-bound workspace</b><small>State {record.stateId.toLocaleString()} · rollback to OMEGAv6 preserved</small></aside>
  </header>
  <div className='o7-native-surface'>
   <OmegaGovernanceProjectMediaR29 variant='Projects' record={record} address={address} onAddress={commitAddress} onNavigate={onNavigate} status={runtimeStatus} restore={runtimeRestore}/>
  </div>
 </section>;
}
