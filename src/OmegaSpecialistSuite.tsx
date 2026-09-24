import OmegaUtilityAuthorityR26 from './OmegaUtilityAuthorityR26';
import OmegaFieldMotionConvergenceR28 from './OmegaFieldMotionConvergenceR28';
import OmegaEvidenceMemoryR28 from './OmegaEvidenceMemoryR28';
import SingmasterProofWorkbenchR290 from './SingmasterProofWorkbenchR290';
import './proofCarryR292.css';
import OmegaGovernanceProjectMediaR29 from './OmegaGovernanceProjectMediaR29';
import OmegaSystemConsolidationR30 from './OmegaSystemConsolidationR30';
import OmegaConvergenceMasterR314 from './OmegaConvergenceMasterR314';
import OmegaResearchAdvancementR316 from './OmegaResearchAdvancementR316';
import OmegaSwarmR121 from './OmegaSwarmR121';
import OmegaOrganismR123 from './OmegaOrganismR123';
import OmegaAutonomicR125 from './OmegaAutonomicR125';
import OmegaMaximumCockpitR126 from './OmegaMaximumCockpitR126';
import OmegaCapabilityFieldR138 from './OmegaCapabilityFieldR138';
import ReflexAutonomicR164 from './ReflexAutonomicR164';
import AppliedCalculusR168 from './AppliedCalculusR168';
import FullRestorationConvergenceR168 from './FullRestorationConvergenceR168';
import RecursiveSelfBuildR240 from './RecursiveSelfBuildR240';
import CalculusAddressFabricR240 from './CalculusAddressFabricR240';
import OmegaUnifiedConvergenceR348 from './OmegaUnifiedConvergenceR348';
import OmegaHardwareFieldR349 from './OmegaHardwareFieldR349';
import OmegaTemporalCheckpointR350 from './OmegaTemporalCheckpointR350';
import OmegaGpuPacketMirrorR351 from './OmegaGpuPacketMirrorR351';
import OmegaGpuComputeR352 from './OmegaGpuComputeR352';
import OmegaReleaseLineageR353 from './OmegaReleaseLineageR353';
import OmegaProofBoundSceneR354 from './OmegaProofBoundSceneR354';
import OmegaProofBoundTemporalTraversalR355 from './OmegaProofBoundTemporalTraversalR355';

type Props={panel:string;record:any;state:any;address:number;onAddress:(n:number)=>void;onNavigate:(p:string)=>void;status:any;restore:any;uiMode:any;onUiMode:(m:any)=>void};

export default function OmegaSpecialistSuite(props:Props){
 const {panel,record,state,address,onAddress,onNavigate,status,restore}=props;
 const capability=<OmegaCapabilityFieldR138 panel={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/>;
 const capabilityContext=<details className='r356-capability-context'><summary><span><b>Capability topology</b><small>Routes, projected state candidates, execution domains and relative capacity</small></span><strong>CONTEXT</strong></summary><div>{capability}</div></details>;
 const wrap=(content:any)=><div className='r138-capability-first r356-specialist-stack'>{capabilityContext}{content}</div>;
 if(panel==='Convergence')return wrap(<div className='r356-convergence'>
  <section className='r356-module-group'>
   <header><span>CURRENT CONVERGENCE</span><h3>One present scene, one temporal path</h3><p>The current relational/convergence field and proof-bound traversal are primary. Historical engines remain below as supporting modules.</p></header>
   <div className='r356-module-stack'><OmegaUnifiedConvergenceR348 record={record} status={status}/><OmegaProofBoundTemporalTraversalR355/></div>
  </section>
  <section className='r356-module-group'>
   <header><span>TEMPORAL + COMPUTE</span><h3>Field → replay → packet → render correspondence</h3><p>Hardware planning, checkpoint replay, packet mirroring, compute correspondence and scene receipt share one model-state lineage.</p></header>
   <div className='r356-module-stack'><OmegaHardwareFieldR349 address={address}/><OmegaTemporalCheckpointR350/><OmegaGpuPacketMirrorR351/><OmegaGpuComputeR352/><OmegaProofBoundSceneR354/></div>
  </section>
  <section className='r356-module-group'>
   <header><span>GOVERNANCE + ADVANCEMENT</span><h3>Calculus, address fabric and bounded self-build</h3><p>Research and recursive build controls remain explicit governance instruments rather than competing visual shells.</p></header>
   <div className='r356-module-stack'><AppliedCalculusR168/><CalculusAddressFabricR240 record={record}/><OmegaResearchAdvancementR316/><RecursiveSelfBuildR240/></div>
  </section>
  <section className='r356-module-group'>
   <header><span>RESTORED EXECUTION</span><h3>Maximum cockpit and restoration continuity</h3><p>Recovered execution layers remain fully reachable while lower historical bodies are subordinate compatibility context.</p></header>
   <div className='r356-module-stack'><FullRestorationConvergenceR168 record={record} address={address} onNavigate={onNavigate}/><OmegaMaximumCockpitR126 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/></div>
  </section>
  <section className='r356-module-group r356-legacy-stack'>
   <header><span>HISTORICAL CONTINUITY</span><h3>Retained compatibility bodies</h3><p>Nothing is deleted; older direct bodies are collapsed so they no longer dominate ordinary operation.</p></header>
   <details className='r121-legacy-convergence'><summary>R164 returned reflex → autonomic swarm · replay / residual carry / governed recruitment</summary><ReflexAutonomicR164/></details>
   <details className='r121-legacy-convergence'><summary>R126 autonomic execution · scope / detach / checkpoint / rejoin</summary><OmegaAutonomicR125/></details>
   <details className='r121-legacy-convergence'><summary>R123 organism body · seed / organ / branch / cell hierarchy</summary><OmegaOrganismR123/></details>
   <details className='r121-legacy-convergence'><summary>R121 direct swarm body · compatibility / independent-cell control</summary><OmegaSwarmR121 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/></details>
   <details className='r121-legacy-convergence'><summary>Retained continuity / convergence field instrument</summary><OmegaFieldMotionConvergenceR28 variant={panel} record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/></details>
  </section>
 </div>);
 if(panel==='Field'||panel==='Data Motion')return wrap(<OmegaFieldMotionConvergenceR28 variant={panel} record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/>);
 if(panel==='Evidence & Proof')return wrap(<div><OmegaEvidenceMemoryR28 variant={panel} record={record} address={address} onAddress={onAddress} status={status} restore={restore}/><OmegaReleaseLineageR353/><SingmasterProofWorkbenchR290 record={record}/></div>);
 if(panel==='Memory')return wrap(<OmegaEvidenceMemoryR28 variant={panel} record={record} address={address} onAddress={onAddress} status={status} restore={restore}/>);
 if(panel==='Canon Evolution'||panel==='Governance')return wrap(<div><CalculusAddressFabricR240 record={record}/><RecursiveSelfBuildR240/><OmegaGovernanceProjectMediaR29 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/></div>);
 if(panel==='Projects'||panel==='Assets'||panel==='Render Queue')return wrap(<OmegaGovernanceProjectMediaR29 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/>);
 if(panel==='Consolidation')return wrap(<div><OmegaSystemConsolidationR30 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore} uiMode={props.uiMode} onUiMode={props.onUiMode}/><OmegaConvergenceMasterR314/><OmegaResearchAdvancementR316/></div>);
 if(panel==='Instructions'||panel==='Settings'||panel==='System')return wrap(<OmegaSystemConsolidationR30 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore} uiMode={props.uiMode} onUiMode={props.onUiMode}/>);
 return wrap(<OmegaUtilityAuthorityR26 {...props}/>);
}
