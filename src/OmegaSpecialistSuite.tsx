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
 const wrap=(content:any)=><div className='r138-capability-first'>{capability}{content}</div>;
 if(panel==='Convergence')return wrap(<div className='r356-convergence-primary'>
  <section className='r356-convergence-section'>
   <header><div><span>CURRENT AUTHORITY</span><b>Unified convergence</b><small>Current relational field, exact address fabric, research state and governed self-build.</small></div></header>
   <OmegaUnifiedConvergenceR348 record={record} status={status}/>
   <AppliedCalculusR168/>
   <CalculusAddressFabricR240 record={record}/>
   <OmegaResearchAdvancementR316/>
   <RecursiveSelfBuildR240/>
  </section>
  <section className='r356-convergence-section r356-convergence-compute'>
   <header><div><span>COMPUTE / REPLAY</span><b>Hardware → temporal → packet → render</b><small>One model state path; execution correspondence does not create physical or Canon authority.</small></div></header>
   <OmegaHardwareFieldR349 address={address}/>
   <OmegaTemporalCheckpointR350/>
   <OmegaGpuPacketMirrorR351/>
   <OmegaGpuComputeR352/>
  </section>
  <section className='r356-convergence-section r356-convergence-lineage'>
   <header><div><span>PROOF-BOUND SCENE</span><b>Release → scene → traversal</b><small>R354/R355 receipts bind current lineage, deterministic replay and temporal scene continuity.</small></div></header>
   <OmegaProofBoundSceneR354/>
   <OmegaProofBoundTemporalTraversalR355/>
  </section>
  <section className='r356-convergence-section'>
   <header><div><span>RETAINED CAPABILITY</span><b>Recovery and autonomic lineage</b><small>Still available, no longer allowed to visually compete with the current convergence authority.</small></div></header>
   <div className='r356-compatibility-stack'>
    <details><summary>R168 full restoration convergence</summary><FullRestorationConvergenceR168 record={record} address={address} onNavigate={onNavigate}/></details>
    <details><summary>R126 maximum cockpit / execution topology</summary><OmegaMaximumCockpitR126 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/></details>
    <details><summary>R164 returned reflex → autonomic swarm</summary><ReflexAutonomicR164/></details>
    <details><summary>R125 autonomic execution / checkpoint / rejoin</summary><OmegaAutonomicR125/></details>
    <details><summary>R123 organism hierarchy</summary><OmegaOrganismR123/></details>
    <details><summary>R121 direct swarm compatibility</summary><OmegaSwarmR121 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/></details>
    <details><summary>R28 retained continuity / convergence instrument</summary><OmegaFieldMotionConvergenceR28 variant={panel} record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/></details>
   </div>
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
