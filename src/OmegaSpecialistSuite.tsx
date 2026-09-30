import OmegaUtilityAuthorityR26 from './OmegaUtilityAuthorityR26';
import OmegaFieldMotionConvergenceR28 from './OmegaFieldMotionConvergenceR28';
import OmegaEvidenceMemoryR28 from './OmegaEvidenceMemoryR28';
import SingmasterProofWorkbenchR290 from './SingmasterProofWorkbenchR290';
import './proofCarryR292.css';
import OmegaGovernanceProjectMediaR29 from './OmegaGovernanceProjectMediaR29';
import OmegaSystemConsolidationR30 from './OmegaSystemConsolidationR30';
import OmegaConvergenceMasterR314 from './OmegaConvergenceMasterR314';
import OmegaResearchAdvancementR316 from './OmegaResearchAdvancementR316';
import OmegaCapabilityFieldR138 from './OmegaCapabilityFieldR138';
import RecursiveSelfBuildR240 from './RecursiveSelfBuildR240';
import CalculusAddressFabricR240 from './CalculusAddressFabricR240';
import OmegaReleaseLineageR353 from './OmegaReleaseLineageR353';
import OmegaAtlas360R356 from './OmegaAtlas360R356';
import OmegaProofCarryingWovenDynamics from './OmegaProofCarryingWovenDynamics';

type Props={panel:string;record:any;state:any;address:number;onAddress:(n:number)=>void;onNavigate:(p:string)=>void;status:any;restore:any;uiMode:any;onUiMode:(m:any)=>void};

export default function OmegaSpecialistSuite(props:Props){
 const {panel,record,state,address,onAddress,onNavigate,status,restore}=props;
 const capability=<OmegaCapabilityFieldR138 panel={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/>;
 const wrap=(content:any)=><div className='r138-capability-first'>{capability}{content}</div>;
 if(panel==='Field'||panel==='Data Motion')return wrap(<div><OmegaFieldMotionConvergenceR28 variant={panel} record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/><OmegaAtlas360R356 address={address}/></div>);
 if(panel==='Evidence & Proof')return wrap(<div><OmegaEvidenceMemoryR28 variant={panel} record={record} address={address} onAddress={onAddress} status={status} restore={restore}/><OmegaReleaseLineageR353/><OmegaProofCarryingWovenDynamics address={address} compact/><OmegaAtlas360R356 address={address} compact/><SingmasterProofWorkbenchR290 record={record}/></div>);
 if(panel==='Memory')return wrap(<OmegaEvidenceMemoryR28 variant={panel} record={record} address={address} onAddress={onAddress} status={status} restore={restore}/>);
 if(panel==='Canon Evolution'||panel==='Governance')return wrap(<div><CalculusAddressFabricR240 record={record}/><RecursiveSelfBuildR240/><OmegaGovernanceProjectMediaR29 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/></div>);
 if(panel==='Projects'||panel==='Assets'||panel==='Render Queue')return wrap(<OmegaGovernanceProjectMediaR29 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/>);
 if(panel==='Consolidation')return wrap(<div><OmegaSystemConsolidationR30 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore} uiMode={props.uiMode} onUiMode={props.onUiMode}/><OmegaConvergenceMasterR314/><OmegaResearchAdvancementR316/></div>);
 if(panel==='Instructions'||panel==='Settings'||panel==='System')return wrap(<OmegaSystemConsolidationR30 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore} uiMode={props.uiMode} onUiMode={props.onUiMode}/>);
 return wrap(<OmegaUtilityAuthorityR26 {...props}/>);
}
