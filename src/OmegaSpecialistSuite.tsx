import OmegaUtilityAuthorityR26 from './OmegaUtilityAuthorityR26';
import OmegaFieldMotionConvergenceR28 from './OmegaFieldMotionConvergenceR28';
import OmegaEvidenceMemoryR28 from './OmegaEvidenceMemoryR28';
import OmegaGovernanceProjectMediaR29 from './OmegaGovernanceProjectMediaR29';
import OmegaSystemConsolidationR30 from './OmegaSystemConsolidationR30';
import OmegaSwarmR121 from './OmegaSwarmR121';
import OmegaOrganismR123 from './OmegaOrganismR123';
import OmegaAutonomicR125 from './OmegaAutonomicR125';
import OmegaMaximumCockpitR126 from './OmegaMaximumCockpitR126';

type Props={panel:string;record:any;state:any;address:number;onAddress:(n:number)=>void;onNavigate:(p:string)=>void;status:any;restore:any;uiMode:any;onUiMode:(m:any)=>void};

export default function OmegaSpecialistSuite(props:Props){
 const {panel,record,state,address,onAddress,onNavigate,status,restore}=props;
 if(panel==='Convergence')return <div>
  <OmegaMaximumCockpitR126 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/>
  <details className='r121-legacy-convergence' open><summary>R126 autonomic execution · scope / detach / checkpoint / rejoin</summary><OmegaAutonomicR125/></details>
  <details className='r121-legacy-convergence'><summary>R123 organism body · seed / organ / branch / cell hierarchy</summary><OmegaOrganismR123/></details>
  <details className='r121-legacy-convergence'><summary>R121 direct swarm body · compatibility / independent-cell control</summary><OmegaSwarmR121 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/></details>
  <details className='r121-legacy-convergence'><summary>Retained continuity / convergence field instrument</summary><OmegaFieldMotionConvergenceR28 variant={panel} record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/></details>
 </div>;
 if(panel==='Field'||panel==='Data Motion')return <OmegaFieldMotionConvergenceR28 variant={panel} record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/>;
 if(panel==='Evidence & Proof'||panel==='Memory')return <OmegaEvidenceMemoryR28 variant={panel} record={record} address={address} onAddress={onAddress} status={status} restore={restore}/>;
 if(panel==='Canon Evolution'||panel==='Governance'||panel==='Projects'||panel==='Assets'||panel==='Render Queue')return <OmegaGovernanceProjectMediaR29 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/>;
 if(panel==='Instructions'||panel==='Settings'||panel==='System'||panel==='Consolidation')return <OmegaSystemConsolidationR30 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore} uiMode={props.uiMode} onUiMode={props.onUiMode}/>;
 return <OmegaUtilityAuthorityR26 {...props}/>;
}
