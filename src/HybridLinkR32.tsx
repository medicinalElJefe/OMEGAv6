import {useState} from 'react';
import {Cpu,FolderOpen,Gauge,GraduationCap,ShieldCheck,TerminalSquare} from 'lucide-react';
import HybridMissionControlR8 from './HybridMissionControlR8';
import SovereignConnectionR117 from './SovereignConnectionR117';
import HybridProofClosureR141 from './HybridProofClosureR141';
import WovenExecutionGraphR142 from './WovenExecutionGraphR142';
import './hybridLinkR32.css';
import './hybridLinkR112.css';

type Props={status:any;record:any};

export default function HybridLinkR32({status,record}:Props){
 const[deepOpen,setDeepOpen]=useState(false);
 return <section className='hybrid-r32 special-app r112-hybrid-link'>
  <header className='r112-hybrid-hero'>
   <div><span>SOVEREIGN COMPUTE · HYBRID LINK · R117 + R141 PROOF + R142 WOVEN GRAPH</span><h2>Your PCs can operate as one proof-governed compute fabric.</h2><p>The ordinary path stays bounded: rotate one durable credential, connect authenticated Windows nodes, prove current heartbeats, execute only confirmed allow-listed work, close every return through R141 exact-payload proof, and—when explicitly chosen—let R142 split one objective across hash-attested replicas and rejoin only verified dependency paths.</p></div>
   <div className='r112-hybrid-truth'><ShieldCheck/><b>PROOF BEFORE NATIVE ACTION · PROOF BEFORE GRAPH ADVANCE</b><small>Browser state never substitutes for a real host heartbeat. R142 never treats two PCs as replicas until their independently returned project-tree SHA-256 values match. A dependency edge does not advance until its R141 closure is verified. Replica drift becomes a scar/hold, not a silent merge. No graph join promotes CanonState.</small></div>
  </header>

  <SovereignConnectionR117/>
  <HybridProofClosureR141/>
  <WovenExecutionGraphR142/>

  <section className='r112-host-uses' aria-label='What Sovereign Compute adds'>
   <article><FolderOpen/><div><b>Work with approved local roots</b><span>Read, index, hash, patch, build, test and package only inside bounded machine roots. R142 preserves relative-path and hash-bound mutation restrictions.</span></div></article>
   <article><Cpu/><div><b>Distribute bounded native work</b><span>Independent graph tasks can fan out across currently authenticated PCs only after workspace identity is proved. Capability assignment follows the operations each device actually advertises.</span></div></article>
   <article><GraduationCap/><div><b>Learn and validate without collapsing truth</b><span>TRAIN_LOCAL remains a bounded local learning job. R142 can sequence it with other proof tasks but does not turn local retrieval training into a foundation-model claim.</span></div></article>
   <article><Gauge/><div><b>Join proof instead of assuming agreement</b><span>R141 verifies each host return. R142 carries those proof heads across dependency edges and writes either a deterministic R134 graph-join proof or a scar/hold when a branch disagrees or fails.</span></div></article>
  </section>

  <details className='r112-hybrid-deep' onToggle={e=>setDeepOpen((e.currentTarget as HTMLDetailsElement).open)}>
   <summary><TerminalSquare/><span><b>Advanced federation, mission planning and diagnostics</b><small>Open this for existing PROPOSE → SCREEN → SOLVE → ADMIT routing, solver state, recovery or donor architecture. R142 native graph scheduling remains a separate authenticated execution layer.</small></span></summary>
   {deepOpen&&<HybridMissionControlR8 status={status} record={record}/>}
  </details>

  <footer className='special-boundary'><ShieldCheck/>R142 preserves the R101/R32 allow-listed Hybrid queue, R117 bootstrap, R113 vector carry, R114/R115 federation and machine adapters, R116 truth separation, R125 admission authority, R134 continuity, R136 living evidence, R139 unified capability engine, R140 living/mode operation fabrics and R141 exact host-return proof. The new capability is bounded multi-executor scheduling with replica attestation and deterministic evidence joining—not a second runtime or an authority bypass.</footer>
 </section>;
}
