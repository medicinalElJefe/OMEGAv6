import {useState} from 'react';
import {Cpu,FolderOpen,Gauge,GraduationCap,ShieldCheck,TerminalSquare} from 'lucide-react';
import HybridMissionControlR8 from './HybridMissionControlR8';
import SovereignConnectionR117 from './SovereignConnectionR117';
import HybridHostEffectsR212 from './HybridHostEffectsR212';
import HybridCommandDeckR237 from './HybridCommandDeckR237';
import HybridProofClosureR141 from './HybridProofClosureR141';
import MissionLineageReviewR209 from './MissionLineageReviewR209';
import './hybridLinkR32.css';
import './hybridLinkR112.css';

type Props={status:any;record:any};

export default function HybridLinkR32({status,record}:Props){
 const[deepOpen,setDeepOpen]=useState(false);
 return <section className='hybrid-r32 special-app r112-hybrid-link'>
  <header className='r112-hybrid-hero'>
   <div><span>SOVEREIGN COMPUTE · HYBRID LINK · R117 CONNECTION + R212 HOST EFFECTS + R237 COMMAND AUTHORITY + R141 PROOF CLOSURE + R209 LINEAGE</span><h2>Your PC is an OMEGA compute node.</h2><p>The ordinary path stays narrow but is now operational: prove one current authenticated heartbeat, select only capabilities the host actually advertised, admit at most one active native job per device, cancel work only before host claim, pause/resume governed missions with authenticated bridge authority, expose the exact returned host effects, then close every returned host packet into R141 proof continuity. R237 adds a practical operator command deck without inventing a second executor or bypassing the established R147/R141/R125 boundaries.</p></div>
   <div className='r112-hybrid-truth'><ShieldCheck/><b>PROOF BEFORE NATIVE ACTION</b><small>Browser state never substitutes for a real host heartbeat. Native execution is claimed only while an authenticated agent heartbeat is current. R237 refuses parallel QUEUED/RUNNING work on the same device, requires the bridge secret for mission-control writes, and never pretends a running local process was remotely killed. A returned workload is not accepted as execution proof until R141 verifies its exact payload fingerprint and semantic equality. Neither heartbeat, host command admission, R209/R212 correlation, durable closure, world projection nor replay promotes CanonState.</small></div>
  </header>

  <SovereignConnectionR117/>
  <HybridHostEffectsR212/>
  <HybridCommandDeckR237/>
  <HybridProofClosureR141/>
  <MissionLineageReviewR209/>

  <section className='r112-host-uses' aria-label='What Sovereign Compute adds'>
   <article><FolderOpen/><div><b>Work with the approved local root</b><span>Read, index, hash, build, test, package and learn only inside the bounded machine root. Source repair remains proof-conditioned rather than blind.</span></div></article>
   <article><Cpu/><div><b>Run high-compute workers without piling work</b><span>R237 adds per-device backpressure so one authenticated host is not silently given overlapping QUEUED/RUNNING jobs. RCWA remains separately truth-gated by dependency and heartbeat proof.</span></div></article>
   <article><GraduationCap/><div><b>Learn from your local corpus</b><span>TRAIN_LOCAL builds bounded local indexes and learning receipts from approved files. It does not claim silent foundation-model weight training.</span></div></article>
   <article><Gauge/><div><b>Return proof, not mystery actions</b><span>Every enacted job returns step proofs and a deterministic exact-payload fingerprint. R212 exposes the host effects; R237 exposes current command admission and control; R141 then closes the packet into R134 scar/proof continuity and an R136 evidence frame.</span></div></article>
  </section>

  <details className='r112-hybrid-deep' onToggle={e=>setDeepOpen((e.currentTarget as HTMLDetailsElement).open)}>
   <summary><TerminalSquare/><span><b>Advanced federation, mission planning and diagnostics</b><small>Not required to connect the PC or use the R237 command deck. Open this when inspecting lower-level routes, solver details, recovery or donor architecture.</small></span></summary>
   {deepOpen&&<HybridMissionControlR8 status={status} record={record}/>}
  </details>

  <footer className='special-boundary'><ShieldCheck/>R237 preserves the durable R101/R32 bridge and allow-listed job queue, R117 clean bootstrap, R113 vector carry, R114 federation closure, R115 machine adapters, R116 truth separation, R125 admission authority, R134 world/scar continuity, R136 living evidence framing, R138 capability-first visuals, R139 unified capability engine, R140 living-world operation bridge, R141 exact return closure, R146 history, R147 executor/dispatch authority, R209 correlation-only lineage and R212 first-hand host-effect observation. Command admission is bounded native control, not Canon admission or fabricated proof.</footer>
 </section>;
}
