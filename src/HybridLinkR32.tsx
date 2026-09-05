import {Cpu,FolderOpen,Gauge,GraduationCap,ShieldCheck,TerminalSquare} from 'lucide-react';
import HybridMissionControlR8 from './HybridMissionControlR8';
import SovereignConnectionR112 from './SovereignConnectionR112';
import './hybridLinkR32.css';
import './hybridLinkR112.css';

type Props={status:any;record:any};

export default function HybridLinkR32({status,record}:Props){
 return <section className='hybrid-r32 special-app r112-hybrid-link'>
  <header className='r112-hybrid-hero'>
   <div><span>SOVEREIGN COMPUTE · HYBRID LINK</span><h2>Your PC is an OMEGA compute node.</h2><p>This page has one ordinary job: connect the Windows machine, prove the heartbeat, then expose local capabilities. Pairing mechanics, federation topology and recovery controls stay available, but they are not the main interface.</p></div>
   <div className='r112-hybrid-truth'><ShieldCheck/><b>PROOF BEFORE NATIVE ACTION</b><small>Browser state never substitutes for a real host heartbeat.</small></div>
  </header>

  <SovereignConnectionR112/>

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

  <footer className='special-boundary'><ShieldCheck/>R112 preserves the R101 durable bridge and the R32 allow-listed execution/proof queue, but the ordinary experience is now connection → heartbeat → capability. Advanced transport controls remain progressive rather than dominating the screen.</footer>
 </section>;
}
