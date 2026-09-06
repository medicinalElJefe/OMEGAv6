import {useState} from 'react';
import {Cpu,FolderOpen,Gauge,GraduationCap,ShieldCheck,TerminalSquare} from 'lucide-react';
import HybridMissionControlR8 from './HybridMissionControlR8';
import SovereignConnectionR117 from './SovereignConnectionR117';
import HybridProofClosureR141 from './HybridProofClosureR141';
import WovenExecutionGraphR143 from './WovenExecutionGraphR143';
import './hybridLinkR32.css';
import './hybridLinkR112.css';

type Props={status:any;record:any};

export default function HybridLinkR32({status,record}:Props){
 const[deepOpen,setDeepOpen]=useState(false);
 return <section className='hybrid-r32 special-app r112-hybrid-link'>
  <header className='r112-hybrid-hero'>
   <div><span>SOVEREIGN COMPUTE · R117 CONNECTION + R141 PROOF CLOSURE + R142 LIFECYCLE + R143 WOVEN GRAPH</span><h2>Your authenticated PCs can operate as one proof-governed compute fabric.</h2><p>Connect bounded Windows nodes, prove current heartbeats, execute only confirmed allow-listed work, close each return through R141 exact-payload proof, classify verified returns through the admitted R142 capability lifecycle, then let R143 split one explicit objective across hash-attested replicas and rejoin only lawful dependency paths.</p></div>
   <div className='r112-hybrid-truth'><ShieldCheck/><b>PROOF BEFORE NATIVE ACTION · PROOF BEFORE GRAPH ADVANCE</b><small>Native execution is claimed only while an authenticated agent heartbeat is current. Browser state never substitutes for that real host proof. R143 never treats two PCs as replicas until independent project-tree SHA-256 values match. A dependency edge does not advance until R141 verifies it and R142 lifecycle state is VERIFIED. Replica drift or an unschedulable ready task becomes a scar/hold. No graph join promotes CanonState.</small></div>
  </header>

  <SovereignConnectionR117/>
  <HybridProofClosureR141/>
  <WovenExecutionGraphR143/>

  <section className='r112-host-uses' aria-label='What Sovereign Compute adds'>
   <article><FolderOpen/><div><b>Work with approved local roots</b><span>Read, index, hash, patch, build, test and package only inside bounded machine roots. Existing relative-path and hash-bound mutation restrictions remain active.</span></div></article>
   <article><Cpu/><div><b>Distribute bounded native work</b><span>Independent DAG tasks can fan out across currently authenticated PCs only after workspace identity is proved. Assignment follows operations each device actually advertises and counts same-pass queued load.</span></div></article>
   <article><GraduationCap/><div><b>Learn and validate without collapsing truth</b><span>TRAIN_LOCAL remains bounded local learning. R143 can sequence it with other proof tasks, but R142 capability states keep discovered, available, invoked, returned and verified as different facts.</span></div></article>
   <article><Gauge/><div><b>Join proof instead of assuming agreement</b><span>R141 verifies each host return; R142 records verified capability lifecycle; R143 carries those receipts over graph edges and writes either a deterministic R134 proof join or an explicit scar/hold.</span></div></article>
  </section>

  <details className='r112-hybrid-deep' onToggle={e=>setDeepOpen((e.currentTarget as HTMLDetailsElement).open)}>
   <summary><TerminalSquare/><span><b>Advanced federation, mission planning and diagnostics</b><small>Open this for existing PROPOSE → SCREEN → SOLVE → ADMIT routing, solver state, recovery or donor architecture. R143 native graph scheduling remains a separate authenticated execution layer.</small></span></summary>
   {deepOpen&&<HybridMissionControlR8 status={status} record={record}/>}
  </details>

  <footer className='special-boundary'><ShieldCheck/>R143 preserves R101/R32 Hybrid jobs, R117 bootstrap, R113 vector carry, R114/R115 federation, R116 truth separation, R125 admission, R134 continuity, R136 living evidence, R139 routing, the complete R140 operating fabric, R141 exact host proof/replay and R142 proof-aware capability lifecycle. The added authority is bounded multi-executor scheduling with replica attestation and deterministic evidence joining—not a second runtime or an admission bypass.</footer>
 </section>;
}
