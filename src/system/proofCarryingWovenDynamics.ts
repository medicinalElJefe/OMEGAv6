import {
  evolveHardwareFieldR349,
  R349_OPERATOR,
  R349_RESOLUTION,
  R349_SCHEMA,
  type TypedFieldR349,
} from './wovenHardwareFieldR349';

export const PCWD_SCHEMA='OMEGA_PROOF_CARRYING_WOVEN_DYNAMICS_v1' as const;
export const PCWD_PACKET_SCHEMA='OMEGA_WOVEN_STATE_PACKET_v1' as const;
export const PCWD_REVISION='PCWD-v1' as const;
export const PCWD_STAGES=['Sense','Normalize','Decompose','Lemma','Transport','Recover','Prove'] as const;
export const PCWD_BOUNDARY='Proof-Carrying Woven Dynamics formalizes equivalence, transport, bounded error, recovery, scar/path dependence and promotion over established OMEGA model state. It introduces no new physical primitive, does not treat 12^n atlas levels as literal physical dimensions, does not upgrade model state into observation, and does not replace R125 CanonState admission, R141 exact returned proof, R146 durable execution history, R147 dispatch, or governed production promotion.' as const;

export type Orientation=-1|0|1;
export type Decision='STAY'|'TURN'|'ESCALATE';
export type LocalStateV1={
  continuity:number;
  plasticity:number;
  burden:number;
  contradiction:number;
  scar:number;
  evidence:number;
  invariant:number;
  motion:number;
  support:number;
  orientation:Orientation;
};
export type LocalResidualV1={continuity:number;plasticity:number;burden:number;contradiction:number;scar:number;evidence:number;invariant:number;motion:number;support:number;orientation:number};
export type AtlasAddressV1={
  resolution:20736;
  level:4;
  address:number;
  digits:[number,number,number,number];
  radix:12;
  physicalDimensionsClaimed:false;
};
export type EvidenceV1={
  admissible:boolean;
  sources:string[];
  support:number;
  authority:string;
  proofCarryFingerprint?:string;
  observedClaim:boolean;
};
export type ErrorTolerancesV1={recovery:number;dynamics:number;observables:number;continuity:number};
export type ScoreWeightsV1={alpha:number;beta:number;gamma:number;epsilon:number};
export type PromotionGatesV1={
  continuityValid:boolean;
  invariantsPreserved:boolean;
  scarRetained:boolean;
  recoveryBounded:boolean;
  dynamicsBounded:boolean;
  observablesBounded:boolean;
  evidenceAdmissible:boolean;
  pathRecoverable:boolean;
};
export type ProofReceiptV1={
  schema:'OMEGA_PCWD_PROOF_RECEIPT_v1';
  previousProofDigest:string;
  gates:PromotionGatesV1;
  errors:{recovery:number;dynamics:number;observables:number;holonomy:number};
  tolerances:ErrorTolerancesV1;
  decisionScore:number;
  decision:Decision;
  promotionEligible:boolean;
  proofDigest:string;
  canonicalMutation:false;
  observedHistoryClaimed:false;
  physicalPrimitiveAdded:false;
  boundary:typeof PCWD_BOUNDARY;
};
export type WovenStatePacketV1={
  schema:typeof PCWD_PACKET_SCHEMA;
  revision:typeof PCWD_REVISION;
  t:number;
  A_t:AtlasAddressV1;
  x_t:LocalStateV1;
  P_G_x_t:LocalStateV1;
  r_t:LocalResidualV1;
  C_omega:number;
  Phi:number;
  q:number;
  Lambda:number;
  Sigma_t:{
    localScarBefore:number;
    localScarAfter:number;
    scarDelta:number;
    pathResidual:number;
    holonomyResidual:number;
    holonomyMeanResidual:number;
    ledger:[{kind:'TRANSPORT';tick:number;orientation:Orientation;transportRate:number;scarDelta:number},{kind:'HOLONOMY_LOOP';tick:number;residual:number;meanResidual:number}];
  };
  Gamma_t:{
    id:string;
    sourceTick:number;
    targetTick:number;
    atlasAddress:number;
    orientation:Orientation;
    transportRate:number;
    operator:typeof R349_OPERATOR;
    sourceRetained:true;
    recoverableViaLedger:true;
  };
  L_t:{
    id:'PCWD_Z2_ATLAS_QUOTIENT_v1';
    domain:'R349_LOCAL_STATE';
    codomain:'SYMMETRY_EQUIVALENCE_CLASS_PLUS_RESIDUAL';
    group:'Z2_ATLAS_COMPLEMENT_WITH_ORIENTATION_INVERSION';
    partnerAddress:number;
    representative:LocalStateV1;
    residual:LocalResidualV1;
    recoveryRule:'x = P_G(x) + r';
    exactResidualCarry:true;
  };
  E_t:EvidenceV1;
  Pi_t:ProofReceiptV1;
  stages:Array<{stage:(typeof PCWD_STAGES)[number];status:'PASS'|'HOLD';detail:string}>;
  boundary:typeof PCWD_BOUNDARY;
};

const CHANNELS=['continuity','plasticity','burden','contradiction','scar','evidence','invariant','motion','support'] as const;
const OBSERVABLES=['continuity','invariant','evidence','support','scar'] as const;
const cl=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(Number(n))?Number(n):0));
const sig=(n:number):Orientation=>n<0?-1:n>0?1:0;
const abs=(n:number)=>Math.abs(Number(n)||0);

function localState(field:TypedFieldR349,address:number):LocalStateV1{
  if(field?.schema!==R349_SCHEMA||field.resolution!==R349_RESOLUTION)throw new Error('PCWD requires canonical R349 typed field');
  const a=Math.max(0,Math.min(R349_RESOLUTION-1,Math.floor(Number(address)||0)));
  return{
    continuity:cl(field.continuity[a]),plasticity:cl(field.plasticity[a]),burden:cl(field.burden[a]),contradiction:cl(field.contradiction[a]),
    scar:cl(field.scar[a]),evidence:cl(field.evidence[a]),invariant:cl(field.invariant[a]),motion:cl(field.motion[a]),support:cl(field.support[a]),orientation:sig(field.orientation[a]),
  };
}
function normalizeState(x:LocalStateV1):LocalStateV1{
  return{continuity:cl(x.continuity),plasticity:cl(x.plasticity),burden:cl(x.burden),contradiction:cl(x.contradiction),scar:cl(x.scar),evidence:cl(x.evidence),invariant:cl(x.invariant),motion:cl(x.motion),support:cl(x.support),orientation:sig(x.orientation)};
}
function digits12(address:number):[number,number,number,number]{
  let n=Math.max(0,Math.min(R349_RESOLUTION-1,Math.floor(Number(address)||0)));
  const a0=n%12;n=Math.floor(n/12);const a1=n%12;n=Math.floor(n/12);const a2=n%12;n=Math.floor(n/12);const a3=n%12;
  return[a0,a1,a2,a3];
}
export function atlasAddressV1(address:number):AtlasAddressV1{
  const a=Math.max(0,Math.min(R349_RESOLUTION-1,Math.floor(Number(address)||0)));
  return{resolution:R349_RESOLUTION,level:4,address:a,digits:digits12(a),radix:12,physicalDimensionsClaimed:false};
}
function addResidual(p:LocalStateV1,r:LocalResidualV1):LocalStateV1{
  return normalizeState({
    continuity:p.continuity+r.continuity,plasticity:p.plasticity+r.plasticity,burden:p.burden+r.burden,contradiction:p.contradiction+r.contradiction,
    scar:p.scar+r.scar,evidence:p.evidence+r.evidence,invariant:p.invariant+r.invariant,motion:p.motion+r.motion,support:p.support+r.support,
    orientation:sig(p.orientation+r.orientation),
  });
}
function symmetryProjection(field:TypedFieldR349,address:number,x:LocalStateV1){
  const partnerAddress=R349_RESOLUTION-1-address;
  const y=localState(field,partnerAddress);
  const gy={...y,orientation:sig(-y.orientation)} as LocalStateV1;
  const p=normalizeState({
    continuity:(x.continuity+gy.continuity)/2,plasticity:(x.plasticity+gy.plasticity)/2,burden:(x.burden+gy.burden)/2,contradiction:(x.contradiction+gy.contradiction)/2,
    scar:(x.scar+gy.scar)/2,evidence:(x.evidence+gy.evidence)/2,invariant:(x.invariant+gy.invariant)/2,motion:(x.motion+gy.motion)/2,support:(x.support+gy.support)/2,
    orientation:sig((x.orientation+gy.orientation)/2),
  });
  const r:LocalResidualV1={
    continuity:x.continuity-p.continuity,plasticity:x.plasticity-p.plasticity,burden:x.burden-p.burden,contradiction:x.contradiction-p.contradiction,
    scar:x.scar-p.scar,evidence:x.evidence-p.evidence,invariant:x.invariant-p.invariant,motion:x.motion-p.motion,support:x.support-p.support,orientation:x.orientation-p.orientation,
  };
  return{partnerAddress,projected:p,residual:r};
}
function maxStateDiff(a:LocalStateV1,b:LocalStateV1){
  let m=0;for(const k of CHANNELS)m=Math.max(m,abs(a[k]-b[k]));m=Math.max(m,abs(a.orientation-b.orientation));return m;
}
function observableDiff(a:LocalStateV1,b:LocalStateV1){
  let m=0;for(const k of OBSERVABLES)m=Math.max(m,abs(a[k]-b[k]));return m;
}
function cloneField(field:TypedFieldR349):TypedFieldR349{
  return{...field,continuity:field.continuity.slice(),plasticity:field.plasticity.slice(),burden:field.burden.slice(),contradiction:field.contradiction.slice(),scar:field.scar.slice(),evidence:field.evidence.slice(),invariant:field.invariant.slice(),motion:field.motion.slice(),support:field.support.slice(),orientation:field.orientation.slice(),knownMask:field.knownMask.slice()};
}
function writeLocalState(field:TypedFieldR349,address:number,x:LocalStateV1){
  field.continuity[address]=x.continuity;field.plasticity[address]=x.plasticity;field.burden[address]=x.burden;field.contradiction[address]=x.contradiction;field.scar[address]=x.scar;field.evidence[address]=x.evidence;field.invariant[address]=x.invariant;field.motion[address]=x.motion;field.support[address]=x.support;field.orientation[address]=x.orientation;
}
function maxFieldDiff(a:TypedFieldR349,b:TypedFieldR349){
  let m=0;
  for(const k of CHANNELS){const x=a[k],y=b[k];for(let i=0;i<R349_RESOLUTION;i++)m=Math.max(m,abs(x[i]-y[i]));}
  for(let i=0;i<R349_RESOLUTION;i++)m=Math.max(m,abs(a.orientation[i]-b.orientation[i]));
  return m;
}
function maxArrayDiff(a:Float32Array,b:Float32Array){let m=0;for(let i=0;i<a.length;i++)m=Math.max(m,abs(a[i]-b[i]));return m}
function meanArrayDiff(a:Float32Array,b:Float32Array){let s=0;for(let i=0;i<a.length;i++)s+=abs(a[i]-b[i]);return s/Math.max(1,a.length)}
function scarRetained(before:Float32Array,after:Float32Array,tol:number){for(let i=0;i<before.length;i++)if(after[i]+tol<before[i])return false;return true}

function canonical(value:any):string{
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(ArrayBuffer.isView(value))return canonical(Array.from(value as any));
  if(Array.isArray(value))return'['+value.map(canonical).join(',')+']';
  return'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
}
async function sha256(value:any){
  if(!globalThis.crypto?.subtle)throw new Error('PCWD SHA-256 requires Web Crypto');
  const bytes=new TextEncoder().encode(typeof value==='string'?value:canonical(value));
  const d=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

export function computeHolonomyLoopV1(field:TypedFieldR349,transportRate=.125){
  const rate=Math.max(0,Math.min(.5,Number(transportRate)||0));
  const forward=evolveHardwareFieldR349(field,{orientation:1,transportRate:rate});
  const backward=evolveHardwareFieldR349(forward.field,{orientation:-1,transportRate:rate});
  return{
    schema:'OMEGA_PCWD_HOLONOMY_LOOP_v1' as const,
    path:[1,-1] as const,
    transportRate:rate,
    invariantMaxResidual:maxArrayDiff(field.invariant,backward.field.invariant),
    invariantMeanResidual:meanArrayDiff(field.invariant,backward.field.invariant),
    sourceRetained:true as const,
    inverseClaimed:false as const,
    interpretation:'software operator loop residual / path dependence; not physical curvature' as const,
  };
}

export async function executeProofCarryingWovenStepV1(field:TypedFieldR349,opts:{
  tick?:number;
  address?:number;
  orientation?:number;
  transportRate?:number;
  evidence?:Partial<EvidenceV1>;
  tolerances?:Partial<ErrorTolerancesV1>;
  scoreWeights?:Partial<ScoreWeightsV1>;
  previousProofDigest?:string;
}={}):Promise<{packet:WovenStatePacketV1;targetField:TypedFieldR349}>{
  if(field?.schema!==R349_SCHEMA||field.resolution!==R349_RESOLUTION)throw new Error('PCWD step requires canonical R349 typed field');
  const tick=Math.max(0,Math.floor(Number(opts.tick)||0));
  const address=Math.max(0,Math.min(R349_RESOLUTION-1,Math.floor(Number(opts.address)||0)));
  const orientation=sig(Number(opts.orientation));
  const transportRate=orientation===0?0:Math.max(0,Math.min(.5,Number(opts.transportRate??.125)||0));
  const tolerances:ErrorTolerancesV1={recovery:1e-6,dynamics:1e-6,observables:1e-6,continuity:1e-7,...opts.tolerances};
  const weights:ScoreWeightsV1={alpha:1,beta:1,gamma:1,epsilon:1e-9,...opts.scoreWeights};
  const E_t:EvidenceV1={
    admissible:opts.evidence?.admissible===true,
    sources:Array.isArray(opts.evidence?.sources)?opts.evidence!.sources!.map(String):[],
    support:cl(Number(opts.evidence?.support??0)),
    authority:String(opts.evidence?.authority||'UNBOUND_EVIDENCE'),
    proofCarryFingerprint:opts.evidence?.proofCarryFingerprint?String(opts.evidence.proofCarryFingerprint):undefined,
    observedClaim:opts.evidence?.observedClaim===true,
  };

  const x_t=normalizeState(localState(field,address));
  const dec=symmetryProjection(field,address,x_t);
  const recovered=addResidual(dec.projected,dec.residual);
  const recoveryError=maxStateDiff(x_t,recovered);
  const observableError=observableDiff(x_t,recovered);

  const reconstructedField=cloneField(field);
  writeLocalState(reconstructedField,address,recovered);
  const directEvolution=evolveHardwareFieldR349(field,{orientation,transportRate});
  const reconstructedEvolution=evolveHardwareFieldR349(reconstructedField,{orientation,transportRate});
  const dynamicsError=maxFieldDiff(directEvolution.field,reconstructedEvolution.field);
  const continuityResidual=maxArrayDiff(field.continuity,directEvolution.field.continuity);
  const holonomy=computeHolonomyLoopV1(field,transportRate||.125);

  const targetLocal=localState(directEvolution.field,address);
  const scarDelta=Math.max(0,targetLocal.scar-x_t.scar);
  const pathResidual=abs(targetLocal.invariant-x_t.invariant);
  const gates:PromotionGatesV1={
    continuityValid:continuityResidual<=tolerances.continuity,
    invariantsPreserved:directEvolution.proof.invariantStatus==='PASS',
    scarRetained:scarRetained(field.scar,directEvolution.field.scar,tolerances.recovery),
    recoveryBounded:recoveryError<=tolerances.recovery,
    dynamicsBounded:dynamicsError<=tolerances.dynamics,
    observablesBounded:observableError<=tolerances.observables,
    evidenceAdmissible:E_t.admissible&&E_t.sources.length>0,
    pathRecoverable:recoveryError<=tolerances.recovery&&directEvolution.proof.recoverableSourceRetained===true,
  };
  const promotionEligible=Object.values(gates).every(Boolean);
  const coreLawFailed=!gates.continuityValid||!gates.invariantsPreserved||!gates.evidenceAdmissible||!gates.pathRecoverable;
  const decision:Decision=promotionEligible?'STAY':coreLawFailed?'ESCALATE':'TURN';
  const denom=x_t.contradiction+x_t.burden+weights.alpha*recoveryError+weights.beta*dynamicsError+weights.gamma*observableError+weights.epsilon;
  const decisionScore=(x_t.continuity*x_t.plasticity)/denom;
  const previousProofDigest=String(opts.previousProofDigest||'PCWD-GENESIS');

  const proofCore={
    schema:'OMEGA_PCWD_PROOF_RECEIPT_v1',
    previousProofDigest,gates,
    errors:{recovery:recoveryError,dynamics:dynamicsError,observables:observableError,holonomy:holonomy.invariantMaxResidual},
    tolerances,decisionScore,decision,promotionEligible,
    canonicalMutation:false,observedHistoryClaimed:false,physicalPrimitiveAdded:false,boundary:PCWD_BOUNDARY,
  } as const;
  const proofDigest=await sha256(proofCore);
  const Pi_t:ProofReceiptV1={...proofCore,proofDigest};
  const status=(ok:boolean):'PASS'|'HOLD'=>ok?'PASS':'HOLD';
  const stages:WovenStatePacketV1['stages']=[
    {stage:'Sense',status:'PASS',detail:`R349 canonical address ${address} sampled at model tick ${tick}`},
    {stage:'Normalize',status:'PASS',detail:'bounded declared channels and signed orientation normalized'},
    {stage:'Decompose',status:'PASS',detail:`Z2 atlas-complement orbit representative with partner ${dec.partnerAddress}`},
    {stage:'Lemma',status:status(gates.recoveryBounded),detail:`quotient representative + residual sidecar; recovery error ${recoveryError}`},
    {stage:'Transport',status:status(gates.continuityValid&&gates.invariantsPreserved&&gates.scarRetained),detail:`R349 transport orientation ${orientation}, rate ${transportRate}`},
    {stage:'Recover',status:status(gates.recoveryBounded&&gates.dynamicsBounded&&gates.observablesBounded),detail:`recovery/dynamics/observable = ${recoveryError}/${dynamicsError}/${observableError}`},
    {stage:'Prove',status:status(promotionEligible),detail:`${decision}; promotionEligible=${promotionEligible}`},
  ];
  const packet:WovenStatePacketV1={
    schema:PCWD_PACKET_SCHEMA,revision:PCWD_REVISION,t:tick,A_t:atlasAddressV1(address),x_t,P_G_x_t:dec.projected,r_t:dec.residual,
    C_omega:x_t.continuity,Phi:x_t.plasticity,q:x_t.contradiction,Lambda:x_t.burden,
    Sigma_t:{
      localScarBefore:x_t.scar,localScarAfter:targetLocal.scar,scarDelta,pathResidual,holonomyResidual:holonomy.invariantMaxResidual,holonomyMeanResidual:holonomy.invariantMeanResidual,
      ledger:[{kind:'TRANSPORT',tick,orientation,transportRate,scarDelta},{kind:'HOLONOMY_LOOP',tick,residual:holonomy.invariantMaxResidual,meanResidual:holonomy.invariantMeanResidual}],
    },
    Gamma_t:{id:`PCWD:${tick}->${tick+1}:${address}:${orientation}`,sourceTick:tick,targetTick:tick+1,atlasAddress:address,orientation,transportRate,operator:R349_OPERATOR,sourceRetained:true,recoverableViaLedger:true},
    L_t:{id:'PCWD_Z2_ATLAS_QUOTIENT_v1',domain:'R349_LOCAL_STATE',codomain:'SYMMETRY_EQUIVALENCE_CLASS_PLUS_RESIDUAL',group:'Z2_ATLAS_COMPLEMENT_WITH_ORIENTATION_INVERSION',partnerAddress:dec.partnerAddress,representative:dec.projected,residual:dec.residual,recoveryRule:'x = P_G(x) + r',exactResidualCarry:true},
    E_t,Pi_t,stages,boundary:PCWD_BOUNDARY,
  };
  return{packet,targetField:directEvolution.field};
}

export async function verifyProofReceiptV1(packet:WovenStatePacketV1){
  const p=packet.Pi_t;
  const core={schema:p.schema,previousProofDigest:p.previousProofDigest,gates:p.gates,errors:p.errors,tolerances:p.tolerances,decisionScore:p.decisionScore,decision:p.decision,promotionEligible:p.promotionEligible,canonicalMutation:p.canonicalMutation,observedHistoryClaimed:p.observedHistoryClaimed,physicalPrimitiveAdded:p.physicalPrimitiveAdded,boundary:p.boundary};
  const digestValid=(await sha256(core))===p.proofDigest;
  const allGates=Object.values(p.gates).every(Boolean);
  const expectedDecision:Decision=allGates?'STAY':(!p.gates.continuityValid||!p.gates.invariantsPreserved||!p.gates.evidenceAdmissible||!p.gates.pathRecoverable)?'ESCALATE':'TURN';
  const semanticValid=
    p.schema==='OMEGA_PCWD_PROOF_RECEIPT_v1'&&
    p.promotionEligible===allGates&&
    p.decision===expectedDecision&&
    p.canonicalMutation===false&&
    p.observedHistoryClaimed===false&&
    p.physicalPrimitiveAdded===false&&
    p.boundary===PCWD_BOUNDARY;
  return digestValid&&semanticValid;
}

export async function compileTemporalChainV1(field:TypedFieldR349,opts:{
  steps?:number;
  address?:number;
  orientations?:number[];
  transportRate?:number;
  evidence?:Partial<EvidenceV1>;
}={}){
  const steps=Math.max(1,Math.min(32,Math.floor(Number(opts.steps)||4)));
  const orientations=Array.isArray(opts.orientations)&&opts.orientations.length?opts.orientations:[1,-1,1,0];
  let current=field,previous='PCWD-GENESIS';
  const packets:WovenStatePacketV1[]=[];
  for(let tick=0;tick<steps;tick++){
    const step=await executeProofCarryingWovenStepV1(current,{tick,address:opts.address??42,orientation:orientations[tick%orientations.length],transportRate:opts.transportRate,evidence:opts.evidence,previousProofDigest:previous});
    packets.push(step.packet);current=step.targetField;previous=step.packet.Pi_t.proofDigest;
  }
  return{
    schema:'OMEGA_PCWD_TEMPORAL_CHAIN_v1' as const,
    packets,
    finalField:current,
    chainDigest:previous,
    linkIntegrity:packets.every((p,i)=>p.Pi_t.previousProofDigest===(i===0?'PCWD-GENESIS':packets[i-1].Pi_t.proofDigest)),
    allProofDigestsValid:(await Promise.all(packets.map(verifyProofReceiptV1))).every(Boolean),
    boundary:PCWD_BOUNDARY,
  };
}

export async function compileForecastBranchesV1(field:TypedFieldR349,opts:{
  tick?:number;
  address?:number;
  transportRate?:number;
  evidence?:Partial<EvidenceV1>;
  weights?:Partial<Record<'NEGATIVE'|'HOLD'|'POSITIVE',number>>;
}={}){
  const raw={NEGATIVE:Math.max(0,Number(opts.weights?.NEGATIVE??1)),HOLD:Math.max(0,Number(opts.weights?.HOLD??1)),POSITIVE:Math.max(0,Number(opts.weights?.POSITIVE??1))};
  const total=raw.NEGATIVE+raw.HOLD+raw.POSITIVE||3;
  const specs=[['NEGATIVE',-1,raw.NEGATIVE/total],['HOLD',0,raw.HOLD/total],['POSITIVE',1,raw.POSITIVE/total]] as const;
  const branches=[] as Array<{id:string;orientation:Orientation;weight:number;packet:WovenStatePacketV1}>;
  for(const [id,orientation,weight] of specs){
    const step=await executeProofCarryingWovenStepV1(field,{tick:opts.tick,address:opts.address,orientation,transportRate:opts.transportRate,evidence:opts.evidence,previousProofDigest:'PCWD-FORECAST-ROOT'});
    branches.push({id,orientation,weight,packet:step.packet});
  }
  return{schema:'OMEGA_PCWD_FORECAST_BRANCH_SET_v1' as const,branches,weightsSum:branches.reduce((s,b)=>s+b.weight,0),allBranchesRetained:true as const,observationClaimed:false as const,boundary:PCWD_BOUNDARY};
}
