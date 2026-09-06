import {useState} from 'react';
import {Cpu,FolderOpen,Gauge,GraduationCap,ShieldCheck,TerminalSquare} from 'lucide-react';
import HybridMissionControlR8 from './HybridMissionControlR8';
import SovereignConnectionR117 from './SovereignConnectionR117';
import './hybridLinkR32.css';
import './hybridLinkR112.css';

type Props={status:any;record:any};

export default function HybridLinkR32({status,record}:Props){
 const[deepOpen,setDeepOpen]=useState(false);
 return <section className='hybrid-r32 special-app r112-hybrid-link'>
  <header className='r112-hybrid-hero'>
   <div><span>SOVEREIGN COMPUTE · HYBRID LINK · R127 ZERO DRIFT</span><h2>One canonical cloud ↔ one proved PC node.</h2><p>The ordinary path is deliberately singular: mint one fresh durable pairing, download one SHA-256-verified root-safe Windows connector, prove one current authenticated heartbeat, then expose only the capabilities that heartbeat actually supports. No preview-host fallback, no C: runtime fallback, no partial-agent execution, no stale-agent substitution, and no browser-only PC ONLINE claim.</p></div>
   <div className='r112-hybrid-truth'><ShieldCheck/><b>PROOF BEFORE NATIVE ACTION</b><small>Pairing, download, agent validation and heartbeat are separate states. Native execution is claimed only while the paired device heartbeat is current.</small></div>
  </header>

  <SovereignConnectionR117/>

  <section className='r112-host-uses' aria-label='What Sovereign Compute adds'>
   <article><FolderOpen/><div><b>Bounded local root</b><span>Read, index, hash, patch, build, test and package only inside the explicitly approved machine root.</span></div></article>
   <article><Cpu/><div><b>Proved compute workers</b><span>RCWA becomes active only when dependency, transport source and worker heartbeat are proved; other machine workers remain independently gated.</span></div></article>
   <article><GraduationCap/><div><b>Local corpus learning</b><span>TRAIN_LOCAL produces bounded indexes and receipts from approved files. It does not silently mutate foundation-model weights.</span></div></article>
   <article><Gauge/><div><b>Receipts instead of mystery actions</b><span>Every enacted Hybrid job is allow-listed, root-confined and expected to return bounded result/proof information to canonical OMEGAv6.</span></div></article>
  </section>

  <details className='r112-hybrid-deep' onToggle={e=>setDeepOpen((e.currentTarget as HTMLDetailsElement).open)}>
   <summary><TerminalSquare/><span><b>Advanced federation, queues and diagnostics</b><small>Not required to connect the PC. Open only when inspecting solver state, mission routing, recovery, proof or donor architecture.</small></span></summary>
   {deepOpen&&<HybridMissionControlR8 status={status} record={record}/>}
  </details>

  <footer className='special-boundary'><ShieldCheck/>R127 preserves the durable R101 bridge model, R32 allow-listed execution/proof queue, R113 vector carry, R114 federation closure, R115 machine adapters, R116 truth separation, R121–R126 swarm/organism/autonomic runtime, and the R125 accuracy authority. The connection itself is now constrained to canonical bootstrap → quarantined download → server/local SHA-256 equality → parser preflight → authenticated register → current heartbeat → governed poll.</footer>
 </section>;
}
