export const R195_REVISION='R195';
export const R195_SCHEMA='OMEGA_AUTHENTICATED_INTELLIGENCE_BRIDGE_R195';

export type R195TruthState='LIVE'|'AVAILABLE'|'DEVICE_PROOF_REQUIRED'|'DEGRADED'|'UNVERIFIED';
export type R195Lane={
 id:'HOSTED_AI'|'SAI'|'HYBRID'|'PROOF'|'REUSE';
 state:R195TruthState;
 label:string;
 detail:string;
 authority:string;
};
export type R195BridgeSnapshot={
 schema:typeof R195_SCHEMA;
 revision:typeof R195_REVISION;
 measuredAt:string;
 lanes:R195Lane[];
 hybridOnline:boolean;
 deviceCount:number;
 trainerAvailable:boolean;
 buildAvailable:boolean;
 bridgeState:'AUTHENTICATED_SAI_HYBRID_BRIDGE_AVAILABLE'|'DEVICE_PROOF_REQUIRED';
 chain:string[];
 laws:string[];
 canonicalMutation:false;
 canonicalAdmissionAuthority:'R125';
};

const currentDevices=(hybrid:any)=>Array.isArray(hybrid?.devices)?hybrid.devices.filter((d:any)=>d?.online===true&&d?.revoked!==true):[];
const operations=(caps:any)=>Array.isArray(caps?.operations)?caps.operations.map((x:any)=>String(x).toUpperCase()):[];
const has=(items:string[],value:string)=>items.includes(value);

export function compileIntelligenceBridgeR195(input:{core?:any;hybrid?:any;capabilities?:any;federation?:any;measuredAt?:string}):R195BridgeSnapshot{
 const hybrid=input.hybrid||{},caps=input.capabilities||{},core=input.core||{},federation=input.federation||{};
 const devices=currentDevices(hybrid),ops=operations(caps);
 const hybridOnline=hybrid?.state==='VERIFIED_DEVICE_ONLINE'&&hybrid?.nativeExecutionClaimed===true&&devices.length>0;
 const trainerAvailable=has(ops,'TRAIN_LOCAL');
 const buildAvailable=has(ops,'BUILD');
 const canonicalLive=core?.ok===true&&core?.state==='LIVE'&&core?.canonicalRequest===true;
 const federationLive=String(federation?.state||federation?.status||'').toUpperCase().includes('LIVE')||String(federation?.overallState||'').toUpperCase().includes('LIVE');
 const bridgeState=hybridOnline&&trainerAvailable?'AUTHENTICATED_SAI_HYBRID_BRIDGE_AVAILABLE':'DEVICE_PROOF_REQUIRED';
 const lanes:R195Lane[]=[
  {id:'HOSTED_AI',state:canonicalLive?'AVAILABLE':'UNVERIFIED',label:'Hosted AI',detail:canonicalLive?'Canonical runtime is live; model execution remains invocation/receipt-bound.':'Canonical live runtime has not been proven in this browser refresh.',authority:'R147 / provider receipt'},
  {id:'SAI',state:trainerAvailable?'AVAILABLE':'DEGRADED',label:'SAI',detail:trainerAvailable?'Grounded SAI planning plus TRAIN_LOCAL host operation contract is present.':'SAI remains proposal/retrieval only until a compatible host training operation is available.',authority:'B059 proposal + R147 execution'},
  {id:'HYBRID',state:hybridOnline?'LIVE':'DEVICE_PROOF_REQUIRED',label:'Hybrid',detail:hybridOnline?`${devices.length} authenticated non-revoked device${devices.length===1?'':'s'} online.`:'No current authenticated non-revoked device heartbeat is proven.',authority:'authenticated heartbeat / R141 return'},
  {id:'PROOF',state:canonicalLive?'AVAILABLE':'UNVERIFIED',label:'Proof',detail:'Execution return, factual truth, and CanonState admission remain distinct.',authority:'R146 history → R141 exact return → R125 admission only'},
  {id:'REUSE',state:'AVAILABLE',label:'Verified reuse',detail:'R194 may reuse exact verified bytes only where its exclusion and independence gates permit it.',authority:'R194 exact-content retrieval under R147'}
 ];
 return{
  schema:R195_SCHEMA,revision:R195_REVISION,measuredAt:input.measuredAt||new Date().toISOString(),lanes,hybridOnline,deviceCount:devices.length,trainerAvailable,buildAvailable,bridgeState,
  chain:['SAI_GROUNDED_PROPOSAL','R147_EXECUTOR_SELECTION','AUTHENTICATED_HYBRID_ADMISSION','HOST_OPERATION','R141_EXACT_RETURN_PROOF','R146_DURABLE_EXECUTION_HISTORY','R125_SEPARATE_CANON_ADMISSION'],
  laws:[
   'SAI_PROPOSAL_IS_NOT_HOST_EXECUTION',
   'HYBRID_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_NON_REVOKED_HEARTBEAT',
   'TRAIN_LOCAL_PIPELINE_AVAILABILITY_IS_NOT_TRAINED_MODEL_WEIGHT_PROOF',
   'R194_REUSE_IS_NOT_FRESH_PROVIDER_MODEL_SOLVER_OR_DEVICE_EXECUTION',
   'EXECUTION_SUCCESS_IS_NOT_FACTUAL_TRUTH',
   'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
   federationLive?'FEDERATION_LIVE_IS_SPECIALIST_TRANSPORT_NOT_CANON':'FEDERATION_STATE_NOT_PROMOTED_BY_R195'
  ],
  canonicalMutation:false,canonicalAdmissionAuthority:'R125'
 };
}
