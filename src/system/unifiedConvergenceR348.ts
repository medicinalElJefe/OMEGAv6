import{TRAVERSAL_VISUAL_GRAMMAR_R347,traversalNodeR347}from'../traversalFieldR347';

export const OMEGA_UNIFIED_CONVERGENCE_SCHEMA_R348='OMEGA_UNIFIED_CONVERGENCE_R348';
export const OMEGA_R348_SOURCE_MANIFEST='/canon/omega-r348-source-manifest.json';

export type OmegaFrameR348='CANONICAL'|'PHYSICAL'|'SYSTEM';
export type OmegaTruthClassR348='SOURCE_BOUND_MODEL_STATE'|'DERIVED_MODEL'|'DERIVED_HISTORY'|'ADMISSIBLE_MODEL_FUTURE'|'OBSERVED_UNIT_BOUND'|'RETURNED_RUNTIME'|'HELD';

export type PhysicalObservationR348={
 id:string;sourceId:string;quantity:string;value:number;unit:string;frame:string;
 eventTime:string;receivedAt:string;provenance:string[];evidenceHash:string;uncertainty?:number|null;
};

export const FRAME_AUTHORITY_R348={
 CANONICAL:{coordinates:'D/P/R/L + canonical address',authority:'R125 admission + source packet',boundary:'Canonical address/state is not latitude/longitude, SI position, or a physical dimension.'},
 PHYSICAL:{coordinates:'declared physical frame + unit + event time',authority:'returned/observed evidence only',boundary:'No model or canonical coordinate silently becomes a physical measurement.'},
 SYSTEM:{coordinates:'service/capability/execution/proof topology',authority:'returned runtime/proof envelopes',boundary:'Runtime reachability or execution is not empirical scientific validation.'}
}as const;

export const R348_MACHINE_LAYERS=['State','Intelligence','Memory','Relation','Computation','Action','Observation','Proof']as const;
export const R348_SCENE_LAYERS=['World','Canon','Motion','Memory','Future','Evidence','System']as const;
export const R348_WOVEN_OPERATOR=['PARTITION','EXCHANGE_OR_TRANSFORM','INVARIANT_CARRY','SCAR_OR_RESIDUAL_CARRY','RECONTEXTUALIZE','PROVE']as const;
export const R348_GOVERNANCE_OPERATOR=['PRUNE','TRANSLATE','PROVE']as const;

export const DEWEY_STAGE_POLICY_R348={
 source:'Dewey_Full_Corpus_Recalibrated_Direct_Rerun.xlsx',
 sourceSha256:'3b5eac2b4057d2b0c0e5087ad0c51214a08fcdbae1e822e5a8d333292ca3f4e7',
 universalSuperiority:'REJECTED',
 B0:{state:'RETAIN',role:'GLOBAL_FALLBACK'},
 B3:{state:'DEFAULT',role:'STRONGEST_REUSABLE_DEWEY_CORE'},
 B4:{state:'GATED',role:'CONTEXT_VALIDATION_REQUIRED'},
 B5:{state:'GATED',role:'CONTEXT_VALIDATION_REQUIRED'},
 B6:{state:'GATED',role:'CONTEXT_VALIDATION_REQUIRED'},
 forecast:{state:'HOLD',role:'NO_LEAKAGE_PROSPECTIVE_VALIDATION_REQUIRED'},
 contextPacket:['domain','codomain','units','frame','time','boundary','uncertainty','provenance'],
 claimCeiling:'FORMAL_OR_STRUCTURAL_PROOF_NEVER_SELF_PROMOTES_TO_EMPIRICAL_CAUSAL_OR_PHYSICAL_TRUTH'
}as const;

export const R348_CORPUS_BINDINGS=[
 {name:'Dewey_Reference_Implementation_v2_FULL.zip',sha256:'9c0701b81fcd5d83444c5e8b2da362c01bab3067d6efec9cfd9ea775db1349ae',role:'FORMAL_REFERENCE_IMPLEMENTATION',boundary:'Reference harness; benchmark evidence does not establish a universal physical law.'},
 {name:'OmegaJ_FULL_COHERENCE_ORCHESTRATION_QCD_ATLAS.csv',sha256:'9670eb94bedbc41c941b6aa21cf426dced3ae729ce22fcf7a67f7157439ab6df',role:'QCD_RELATIONAL_ATLAS',boundary:'306×20 source atlas; NO NEW PHYSICAL PRIMITIVE.'},
 {name:'OmegaJ_FULL_MODE_FINAL_QCD_JUNCTION_ATLAS.csv',sha256:'2a8b599256ada51e5c888e006c1cb0bbec7e81b14c1a4ec2c9bc4a0aae6870ba',role:'QCD_JUNCTION_ATLAS',boundary:'203×16 formal/implementation/empirical-interface atlas; source status retained.'},
 {name:'OmegaJ_FULL_MODE_QCD_JUNCTION_COHERENCE_ORCHESTRATED_v5.csv',sha256:'5648bf1ceb9adb050604d4d430f41b5dbc550d9a9dd7496c8c33fcb6d136a5b2',role:'20736_STATE_QCD_ORCHESTRATION',boundary:'20,782×151 rows including 20,736 atlas states; representation is not physical dimensionality.'},
 {name:'dewey_calculus_comprehensive_full_alignment.csv',sha256:'323a5c473138d46fcc6dd492e148b87e73b4d13f9028475932b0141167f41133',role:'CALCULUS_ALIGNMENT_CROSSWALK',boundary:'28×7 semantic/formal correspondence; mapping is not independent empirical proof.'},
 {name:'Dewey_Full_Corpus_Recalibrated_Direct_Rerun.xlsx',sha256:'3b5eac2b4057d2b0c0e5087ad0c51214a08fcdbae1e822e5a8d333292ca3f4e7',role:'RECALIBRATION_EVIDENCE',boundary:'Universal superiority rejected; B0 fallback, B3 default, later stages gated.'},
 {name:'PSC_20736D_FINISHED_FULL_ATLAS_QR_ALL_DATA_UNDER_150MB.zip',sha256:'b085ffc7c1e3a8d8381c81817801a5d640adb32ed88205e03e6c28bc8a3bab7b',role:'SEARCHABLE_CORPUS_DONOR',boundary:'Retrieval/index corpus; retrieved rows retain their source evidence class.'},
 {name:'Pasted markdown.md',sha256:'20cc66171f173a948c9cf8d9d76721a83651e793a4285e0f5690235f1fa6002b',role:'VISUAL_SCENE_ARCHITECTURE',boundary:'Design-control source for one scene graph, three frames, time spine and visual grammar.'}
]as const;

const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const iso=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const hash=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{64}$/i.test(v);
const text=(v:unknown)=>typeof v==='string'&&v.trim().length>0;
const clampAddress=(v:unknown)=>Math.max(0,Math.min(20735,Math.floor(Number(v)||0)));

export function validatePhysicalObservationR348(o:PhysicalObservationR348){
 const reasons:string[]=[];
 if(!text(o.id))reasons.push('ID_REQUIRED');
 if(!text(o.sourceId))reasons.push('SOURCE_ID_REQUIRED');
 if(!text(o.quantity))reasons.push('QUANTITY_REQUIRED');
 if(!finite(o.value))reasons.push('FINITE_VALUE_REQUIRED');
 if(!text(o.unit))reasons.push('UNIT_REQUIRED');
 if(!text(o.frame))reasons.push('FRAME_REQUIRED');
 if(!iso(o.eventTime))reasons.push('EVENT_TIME_REQUIRED');
 if(!iso(o.receivedAt))reasons.push('RECEIVED_TIME_REQUIRED');
 if(!Array.isArray(o.provenance)||!o.provenance.length||o.provenance.some(x=>!text(x)))reasons.push('PROVENANCE_REQUIRED');
 if(!hash(o.evidenceHash))reasons.push('SHA256_EVIDENCE_HASH_REQUIRED');
 if(o.uncertainty!=null&&(!finite(o.uncertainty)||o.uncertainty<0))reasons.push('UNCERTAINTY_INVALID');
 return{valid:reasons.length===0,reasons};
}

function addressDigits(address:number){
 return{d:Math.floor(address/1728),p:Math.floor(address/144)%12,r:Math.floor(address/12)%12,l:address%12};
}

export function compileUnifiedConvergenceR348(record:any,status:any=null,observations:PhysicalObservationR348[]=[]){
 const address=clampAddress(record?.address??(Number(record?.stateId)-1));
 const digits=addressDigits(address),node=traversalNodeR347(address,0);
 const checked=observations.map(observation=>({observation,validation:validatePhysicalObservationR348(observation)}));
 const admittedPhysical=checked.filter(x=>x.validation.valid).map(x=>x.observation);
 const physicalHeld=checked.filter(x=>!x.validation.valid);
 const runtimeReturned=Boolean(status&&!status?.error);
 const runtimeState=runtimeReturned?String(status?.state??status?.status??status?.cloud?.worker??'RETURNED'):'UNBOUND';
 const metrics={
  continuity:node.continuity,plasticity:node.plasticity,contradiction:node.contradiction,burden:node.burden,
  scar:node.scar,evidence:node.evidence,continuityFlux:node.continuityFlux,invariantCarry:node.invariantCarry,
  residualCarry:node.residualCarry,recoverability:node.recoverability,orientation:node.orientation,
  modelIntensity:node.modelIntensity,actionProxy:node.actionProxy
 };
 const scene=[
  {layer:'World',frame:'PHYSICAL' as const,truthClass:(admittedPhysical.length?'OBSERVED_UNIT_BOUND':'HELD')as OmegaTruthClassR348,state:admittedPhysical.length?'BOUND':'PHYSICAL_EVIDENCE_REQUIRED',payload:{observations:admittedPhysical,held:physicalHeld.length}},
  {layer:'Canon',frame:'CANONICAL' as const,truthClass:'SOURCE_BOUND_MODEL_STATE'as const,state:'BOUND',payload:{address,stateId:record?.stateId??address+1,digits,metrics}},
  {layer:'Motion',frame:'CANONICAL' as const,truthClass:'DERIVED_MODEL'as const,state:'BOUND',payload:{continuityFlux:node.continuityFlux,invariantCarry:node.invariantCarry,residualCarry:node.residualCarry,orientation:node.orientation}},
  {layer:'Memory',frame:'CANONICAL' as const,truthClass:'DERIVED_HISTORY'as const,state:'BOUND',payload:{scar:node.scar,residualCarry:node.residualCarry,recoverability:node.recoverability}},
  {layer:'Future',frame:'CANONICAL' as const,truthClass:'ADMISSIBLE_MODEL_FUTURE'as const,state:'MODEL_ONLY',payload:{plasticity:node.plasticity,probability:null,boundary:'Future support/admissibility is not probability without calibrated probability authority.'}},
  {layer:'Evidence',frame:'CANONICAL' as const,truthClass:'SOURCE_BOUND_MODEL_STATE'as const,state:'BOUND',payload:{evidence:node.evidence,corpusBindings:R348_CORPUS_BINDINGS.length,physicalObservationCount:admittedPhysical.length}},
  {layer:'System',frame:'SYSTEM' as const,truthClass:(runtimeReturned?'RETURNED_RUNTIME':'HELD')as OmegaTruthClassR348,state:runtimeState,payload:{runtimeReturned,hybridState:status?.hybridLink?.state??status?.hybrid?.state??'DEVICE_PROOF_REQUIRED'}}
 ];
 return{
  schema:OMEGA_UNIFIED_CONVERGENCE_SCHEMA_R348,
  address,stateId:record?.stateId??address+1,digits,
  frames:FRAME_AUTHORITY_R348,
  scene,
  machineLayers:R348_MACHINE_LAYERS,
  visualGrammar:TRAVERSAL_VISUAL_GRAMMAR_R347,
  wovenOperator:R348_WOVEN_OPERATOR,
  governanceOperator:R348_GOVERNANCE_OPERATOR,
  deweyStagePolicy:DEWEY_STAGE_POLICY_R348,
  sourceManifest:OMEGA_R348_SOURCE_MANIFEST,
  sourceBindings:R348_CORPUS_BINDINGS,
  physicalEvidence:{admitted:admittedPhysical.length,held:physicalHeld.length,observations:admittedPhysical},
  runtime:{returned:runtimeReturned,state:runtimeState},
  truthBoundary:[
   'NO_NEW_PHYSICAL_PRIMITIVE',
   '20,736 AND HIGHER ADDRESS COUNTS ARE COMPUTATIONAL/REPRESENTATIONAL UNLESS INDEPENDENTLY VALIDATED OTHERWISE',
   'CANONICAL, PHYSICAL AND SYSTEM FRAMES MAY BE CORRELATED BUT NEVER SILENTLY CONVERTED',
   'MODEL ACTIVITY IS DIMENSIONLESS MODEL STATE UNLESS UNIT-BOUND PHYSICAL EVIDENCE IS PRESENT',
   'LOGICAL ROUTE STEP IS NOT WALL-CLOCK OR EVENT TIME',
   'FUTURE SUPPORT IS NOT PROBABILITY WITHOUT CALIBRATION',
   'EXECUTION SUCCESS IS NOT AUTOMATIC EMPIRICAL OR SCIENTIFIC TRUTH',
   'R125 REMAINS SOLE CANONSTATE ADMISSION AUTHORITY'
  ]
 };
}
