import {useState} from 'react';
import OmegaUtilityAuthorityR26 from './OmegaUtilityAuthorityR26';
import OmegaFieldMotionConvergenceR28 from './OmegaFieldMotionConvergenceR28';
import OmegaEvidenceMemoryR28 from './OmegaEvidenceMemoryR28';
import OmegaGovernanceProjectMediaR29 from './OmegaGovernanceProjectMediaR29';
import OmegaSystemConsolidationR30 from './OmegaSystemConsolidationR30';
import OmegaSwarmR121 from './OmegaSwarmR121';
import OmegaOrganismR123 from './OmegaOrganismR123';
import OmegaAutonomicR125 from './OmegaAutonomicR125';
import OmegaMaximumCockpitR126 from './OmegaMaximumCockpitR126';
import OmegaCapabilityFieldR138 from './OmegaCapabilityFieldR138';
import ReflexAutonomicR164 from './ReflexAutonomicR164';
import AppliedCalculusR168 from './AppliedCalculusR168';
import FullRestorationConvergenceR168 from './FullRestorationConvergenceR168';
import R181ConvergenceWorkstation from './R181ConvergenceWorkstation';

type Props={panel:string;record:any;state:any;address:number;onAddress:(n:number)=>void;onNavigate:(p:string)=>void;status:any;restore:any;uiMode:any;onUiMode:(m:any)=>void};
type RetainedTool='NONE'|'CALCULUS'|'RESTORATION'|'MAXIMUM'|'REFLEX'|'AUTONOMIC'|'ORGANISM'|'SWARM'|'FIELD'|'CAPABILITY';
const RETAINED:readonly {id:RetainedTool;label:string;detail:string}[]=[
 {id:'CALCULUS',label:'R168 Calculus',detail:'applied calculus diagnostics'},
 {id:'RESTORATION',label:'R168 Restoration',detail:'whole-system restoration convergence'},
 {id:'MAXIMUM',label:'R126 Maximum',detail:'maximum mission compiler'},
 {id:'REFLEX',label:'R164 Reflex',detail:'returned proof → residual recruitment'},
 {id:'AUTONOMIC',label:'R125 Autonomic',detail:'scope / detach / checkpoint / rejoin'},
 {id:'ORGANISM',label:'R123 Organism',detail:'seed / organ / branch / cell hierarchy'},
 {id:'SWARM',label:'R121 Swarm',detail:'direct cell compatibility controls'},
 {id:'FIELD',label:'Legacy Field',detail:'continuity / motion convergence instrument'},
 {id:'CAPABILITY',label:'Capability Field',detail:'R138 capability authority surface'}
];
function RetainedConvergenceTools({record,state,address,onAddress,onNavigate,status,restore}:Pick<Props,'record'|'state'|'address'|'onAddress'|'onNavigate'|'status'|'restore'>){const[tool,setTool]=useState<RetainedTool>('NONE');const body=tool==='CALCULUS'?<AppliedCalculusR168/>:tool==='RESTORATION'?<FullRestorationConvergenceR168 record={record} address={address} onNavigate={onNavigate}/>:tool==='MAXIMUM'?<OmegaMaximumCockpitR126 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/>:tool==='REFLEX'?<ReflexAutonomicR164/>:tool==='AUTONOMIC'?<OmegaAutonomicR125/>:tool==='ORGANISM'?<OmegaOrganismR123/>:tool==='SWARM'?<OmegaSwarmR121 record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/>:tool==='FIELD'?<OmegaFieldMotionConvergenceR28 variant='Convergence' record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/>:tool==='CAPABILITY'?<OmegaCapabilityFieldR138 panel='Convergence' record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/>:null;return <section className='r181-retained-tools'><header><div><span>RETAINED SPECIALIST INSTRUMENTS</span><b>Load one deep tool only when needed.</b><small>The old convergence stack no longer mounts every heavyweight surface simultaneously.</small></div><button onClick={()=>setTool('NONE')} disabled={tool==='NONE'}>CLEAR</button></header><nav>{RETAINED.map(x=><button key={x.id} className={tool===x.id?'active':''} onClick={()=>setTool(v=>v===x.id?'NONE':x.id)}><b>{x.label}</b><small>{x.detail}</small></button>)}</nav>{body&&<div className='r181-retained-body'>{body}</div>}</section>}

export default function OmegaSpecialistSuite(props:Props){
 const {panel,record,state,address,onAddress,onNavigate,status,restore}=props;
 const capability=<OmegaCapabilityFieldR138 panel={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/>;
 const wrap=(content:any)=><div className='r138-capability-first'>{capability}{content}</div>;
 if(panel==='Convergence')return <div className='r181-convergence-surface'><R181ConvergenceWorkstation record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/><RetainedConvergenceTools record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/></div>;
 if(panel==='Field'||panel==='Data Motion')return wrap(<OmegaFieldMotionConvergenceR28 variant={panel} record={record} state={state} address={address} onAddress={onAddress} onNavigate={onNavigate}/>);
 if(panel==='Evidence & Proof'||panel==='Memory')return wrap(<OmegaEvidenceMemoryR28 variant={panel} record={record} address={address} onAddress={onAddress} status={status} restore={restore}/>);
 if(panel==='Canon Evolution'||panel==='Governance'||panel==='Projects'||panel==='Assets'||panel==='Render Queue')return wrap(<OmegaGovernanceProjectMediaR29 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore}/>);
 if(panel==='Instructions'||panel==='Settings'||panel==='System'||panel==='Consolidation')return wrap(<OmegaSystemConsolidationR30 variant={panel} record={record} address={address} onAddress={onAddress} onNavigate={onNavigate} status={status} restore={restore} uiMode={props.uiMode} onUiMode={props.onUiMode}/>);
 return wrap(<OmegaUtilityAuthorityR26 {...props}/>);
}
