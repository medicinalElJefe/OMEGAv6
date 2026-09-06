import {Cpu,FolderOpen,Gauge,GraduationCap,ShieldCheck,TerminalSquare} from 'lucide-react';
import HybridMissionControlR8 from './HybridMissionControlR8';
import SovereignConnectionR117 from './SovereignConnectionR117';
import './hybridLinkR32.css';
import './hybridLinkR112.css';

type Props={status:any;record:any};

export default function HybridLinkR32({status,record}:Props){
 return <section className='hybrid-r32 special-app r112-hybrid-link'>
  <header className='r112-hybrid-hero'>
   <div><span>SOVEREIGN COMPUTE · HYBRID LINK · R117</span><h2>Your PC is an OMEGA compute node.</h2><p>The ordinary path is now intentionally narrow: rotate one fresh durable credential, download one clean Windows connector, prove one current heartbeat, then expose local capabilities. Old preview-host launchers are no longer part of the user path.</p></div>
   <div className='r112-hybrid-truth'><ShieldCheck/><b>PROOF BEFORE NATIVE ACTION</b><small>Browser state never substitutes for a real host heartbeat. Native execution is claimed only while an authenticated agent heartbeat is current.</small></div>
  </header>

  <SovereignConnectionR117/>

  <section className='r112-host-uses' aria-label='What Sovereign Compute adds'>
   <article><FolderOpen/><div><b>Work with the approved local root</b><span>Read, index, hash, patch, build, test and package only inside the bounded machine root.</span></div></article>
   <article><Cpu/><div><b>Run high-compute workers</b><span>RCWA is active when its dependency and heartbeat are proved; future FDTD/FEM/GPU workers remain separately truth-gated.</span></div></article>
   <article><GraduationCap/><div><b>Learn from your local corpus</b><span>TRAIN_LOCAL builds bounded local indexes and learning receipts from approved files. It does not claim silent foundation-model weight training.</span></div></article>
   <article><Gauge/><div><b>Return proof, not mystery actions</b><span>Every enacted job returns status, output identity and evidence/receipt information to the canonical OMEGA runtime.</span></div></article>
  </section>

  <details className='r112-hybrid-deep'>
   <summary><TerminalSquare/><span><b>Advanced federation, mission planning and diagnostics</b><small>Not required to connect the PC. Open this only when inspecting routes, queues, solver details, recovery or donor architecture.</small></span></summary>
   <HybridMissionControlR8 status={status} record={record}/>
  </details>

  <footer className='special-boundary'><ShieldCheck/>R117 preserves the durable R101 bridge model, R32 allow-listed execution/proof queue, R113 vector carry, R114 federation closure, R115 machine adapters and R116 truth separation. The connection path itself is now fresh-bootstrap → clean connector → authenticated heartbeat → capability.</footer>
 </section>;
}
