import {useState} from 'react';
import {Cpu,FolderOpen,Gauge,GraduationCap,ShieldCheck,TerminalSquare} from 'lucide-react';
import HybridMissionControlR8 from './HybridMissionControlR8';
import SovereignConnectionR117 from './SovereignConnectionR117';
import HybridProofClosureR139 from './HybridProofClosureR139';
import './hybridLinkR32.css';
import './hybridLinkR112.css';

type Props={status:any;record:any};

export default function HybridLinkR32({status,record}:Props){
 const[deepOpen,setDeepOpen]=useState(false);
 return <section className='hybrid-r32 special-app r112-hybrid-link'>
  <header className='r112-hybrid-hero'>
   <div><span>SOVEREIGN COMPUTE · HYBRID LINK · R117 CONNECTION + R139 PROOF CLOSURE</span><h2>Your PC is an OMEGA compute node.</h2><p>The ordinary path stays narrow: rotate one fresh durable credential, download one clean Windows connector, prove one current heartbeat, execute only confirmed bounded work, then close every returned host packet into fingerprint-verified continuity/scar evidence with deterministic replay.</p></div>
   <div className='r112-hybrid-truth'><ShieldCheck/><b>PROOF BEFORE NATIVE ACTION</b><small>Browser state never substitutes for a real host heartbeat. Native execution is claimed only while an authenticated agent heartbeat is current. A returned workload is not accepted as execution proof until R139 verifies its exact payload fingerprint and semantic equality. Neither heartbeat nor replay promotes CanonState.</small></div>
  </header>

  <SovereignConnectionR117/>
  <HybridProofClosureR139/>

  <section className='r112-host-uses' aria-label='What Sovereign Compute adds'>
   <article><FolderOpen/><div><b>Work with the approved local root</b><span>Read, index, hash, patch, build, test and package only inside the bounded machine root.</span></div></article>
   <article><Cpu/><div><b>Run high-compute workers</b><span>RCWA is active when its dependency and heartbeat are proved; future FDTD/FEM/GPU workers remain separately truth-gated.</span></div></article>
   <article><GraduationCap/><div><b>Learn from your local corpus</b><span>TRAIN_LOCAL builds bounded local indexes and learning receipts from approved files. It does not claim silent foundation-model weight training.</span></div></article>
   <article><Gauge/><div><b>Return proof, not mystery actions</b><span>Every enacted job returns step proofs and a deterministic fingerprint; R139 closes that packet into R134 scar/proof continuity and an R136 evidence frame, then exposes replay verification.</span></div></article>
  </section>

  <details className='r112-hybrid-deep' onToggle={e=>setDeepOpen((e.currentTarget as HTMLDetailsElement).open)}>
   <summary><TerminalSquare/><span><b>Advanced federation, mission planning and diagnostics</b><small>Not required to connect the PC. Open this only when inspecting routes, queues, solver details, recovery or donor architecture.</small></span></summary>
   {deepOpen&&<HybridMissionControlR8 status={status} record={record}/>}
  </details>

  <footer className='special-boundary'><ShieldCheck/>R139 preserves the durable R101/R32 bridge and allow-listed job queue, the R117 clean bootstrap, R113 vector carry, R114 federation closure, R115 machine adapters, R116 truth separation, R134 world/scar continuity, R136 living evidence framing and R138 capability-first visuals. Host return closure and deterministic replay remain evidence only; R125 remains CanonState admission authority.</footer>
 </section>;
}
