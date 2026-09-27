export const PCWD_SCHEMA='OMEGA_PROOF_CARRYING_WOVEN_DYNAMICS_V1';
export const PCWD_PACKET_SCHEMA='OMEGA_PCWD_STATE_PACKET_V1';
export const PCWD_PROOF_SCHEMA='OMEGA_PCWD_PROOF_RECEIPT_V1';
export const PCWD_STAGES=Object.freeze(['SENSE','NORMALIZE','DECOMPOSE','LEMMA','TRANSPORT','RECOVER','PROVE']);
export const PCWD_PROMOTION_GATES=Object.freeze([
 'continuityValid','invariantsPreserved','scarRetained','recoveryBounded',
 'dynamicsBounded','observablesBounded','evidenceAdmissible','pathRecoverable'
]);
export const PCWD_ATLAS_LEVELS=Object.freeze([12,144,1728,20736,248832]);
export const PCWD_BOUNDARY='PCWD is a proof-carrying software/model state-transport formalism. It introduces no new physical primitive, does not turn atlas address levels into physical dimensions, does not convert model history into observed history, and does not grant CanonState, dispatch, durable-history, observation, or production authority. R125/R141/R146/R147 and ci.yml retain their existing authority.';

const EPS=1e-12;
const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp01=v=>Math.max(0,Math.min(1,finite(v)));
const stable=v=>{
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return '['+v.map(stable).join(',')+']';
 if(ArrayBuffer.isView(v))return '['+Array.from(v).map(stable).join(',')+']';
 return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
};
function hash32(v){let h=2166136261,s=String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
export const fingerprintPCWD=v=>'pcwd-'+hash32(stable(v));
const asVector=(v,label='state')=>{
 if(!Array.isArray(v)&&!ArrayBuffer.isView(v))throw new Error('PCWD '+label+' must be a numeric vector');
 const out=Array.from(v,Number);
 if(!out.length||out.some(x=>!Number.isFinite(x)))throw new Error('PCWD '+label+' must contain finite numeric values');
 return out;
};
const sub=(a,b)=>{if(a.length!==b.length)throw new Error('PCWD vector length mismatch');return a.map((x,i)=>x-b[i])};
const l2=a=>Math.sqrt(a.reduce((s,x)=>s+x*x,0));
const maxAbs=a=>a.reduce((m,x)=>Math.max(m,Math.abs(x)),0);
const mean=a=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length);
const sum=a=>a.reduce((s,x)=>s+x,0);
const normSq=a=>a.reduce((s,x)=>s+x*x,0);
const within=(v,t)=>Number.isFinite(v)&&v<=Math.max(0,finite(t));

export function normalizeStatePCWD(state,spec={}){
 const x=asVector(state),mode=String(spec.mode||'IDENTITY').toUpperCase();
 if(mode==='IDENTITY')return{mode,state:x,parameters:{},invertible:true};
 if(mode==='CENTER'){
  const offset=mean(x);return{mode,state:x.map(v=>v-offset),parameters:{offset},invertible:true};
 }
 if(mode==='AFFINE'){
  const offset=finite(spec.offset),scale=finite(spec.scale,1);
  if(Math.abs(scale)<=EPS)throw new Error('PCWD affine normalization requires nonzero scale');
  return{mode,state:x.map(v=>(v-offset)/scale),parameters:{offset,scale},invertible:true};
 }
 if(mode==='MAX_ABS'){
  const scale=maxAbs(x)||1;return{mode,state:x.map(v=>v/scale),parameters:{scale},invertible:true};
 }
 throw new Error('PCWD unsupported normalization mode');
}

function validatePermutation(p,n){
 if(!Array.isArray(p)||p.length!==n)throw new Error('PCWD permutation length mismatch');
 const q=p.map(Number);
 if(q.some(x=>!Number.isInteger(x)||x<0||x>=n)||new Set(q).size!==n)throw new Error('PCWD permutation must be bijective');
 return q;
}
function applyDeclaredTransform(x,t={}){
 const id=String(t.id||'transform'),sign=finite(t.sign,1);
 const p=t.permutation?validatePermutation(t.permutation,x.length):x.map((_,i)=>i);
 return{id,state:p.map(i=>sign*x[i]),sign,permutation:p};
}
export function decomposeSymmetryPCWD(state,transforms=[]){
 const x=asVector(state);
 const declared=Array.isArray(transforms)&&transforms.length?transforms:[{id:'identity'}];
 const orbit=declared.map(t=>applyDeclaredTransform(x,t));
 const projected=x.map((_,i)=>orbit.reduce((s,o)=>s+o.state[i],0)/orbit.length);
 const residual=sub(x,projected);
 const secondOrbit=declared.map(t=>applyDeclaredTransform(projected,t).state);
 const second=projected.map((_,i)=>secondOrbit.reduce((s,o)=>s+o[i],0)/secondOrbit.length);
 const projectionIdempotenceError=l2(sub(second,projected));
 return{
  method:'DECLARED_FINITE_TRANSFORM_AVERAGE',source:x,projected,residual,
  transforms:orbit.map(o=>({id:o.id,sign:o.sign,permutation:o.permutation})),
  residualNorm:l2(residual),projectionIdempotenceError,
  exactProjection:projectionIdempotenceError<=1e-10
 };
}

export function compileLemmaPCWD(state,spec={}){
 const x=asVector(state),kind=String(spec.kind||'IDENTITY').toUpperCase(),id=String(spec.id||kind);
 if(kind==='IDENTITY'){
  return{id,kind,source:x,reduced:[...x],reconstructed:[...x],residual:new Array(x.length).fill(0),recoveryError:0,compressionRatio:1};
 }
 if(kind==='BLOCK_MEAN'){
  const blockSize=Math.max(1,Math.floor(finite(spec.blockSize,2)));
  if(x.length%blockSize!==0)throw new Error('PCWD BLOCK_MEAN requires vector length divisible by blockSize');
  const reduced=[];
  for(let i=0;i<x.length;i+=blockSize)reduced.push(mean(x.slice(i,i+blockSize)));
  const reconstructed=reduced.flatMap(v=>new Array(blockSize).fill(v));
  const residual=sub(x,reconstructed);
  return{id,kind,blockSize,source:x,reduced,reconstructed,residual,recoveryError:l2(residual),compressionRatio:reduced.length/x.length};
 }
 throw new Error('PCWD unsupported lemma kind');
}
export function recoverLemmaPCWD(reduced,spec={},sourceLength){
 const z=asVector(reduced,'reduced state'),kind=String(spec.kind||'IDENTITY').toUpperCase();
 if(kind==='IDENTITY')return[...z];
 if(kind==='BLOCK_MEAN'){
  const blockSize=Math.max(1,Math.floor(finite(spec.blockSize,2))),out=z.flatMap(v=>new Array(blockSize).fill(v));
  if(sourceLength!==undefined&&out.length!==sourceLength)throw new Error('PCWD recovered length mismatch');
  return out;
 }
 throw new Error('PCWD unsupported lemma recovery kind');
}
function inversePermutation(p){const inv=new Array(p.length);p.forEach((v,i)=>{inv[v]=i});return inv}
function applyStep(x,step={},inverse=false){
 const kind=String(step.kind||'SHIFT').toUpperCase(),n=x.length;
 if(kind==='SHIFT'){
  const raw=Math.trunc(finite(step.offset)),k=((inverse?-raw:raw)%n+n)%n;
  return x.map((_,i)=>x[(i-k+n)%n]);
 }
 if(kind==='PERMUTE'){
  const p=validatePermutation(step.permutation,n),q=inverse?inversePermutation(p):p;
  return q.map(i=>x[i]);
 }
 if(kind==='AFFINE'){
  const scale=finite(step.scale,1),offset=finite(step.offset);
  if(Math.abs(scale)<=EPS)throw new Error('PCWD AFFINE transport requires nonzero scale');
  return inverse?x.map(v=>(v-offset)/scale):x.map(v=>v*scale+offset);
 }
 throw new Error('PCWD unsupported transport step');
}
export function transportPathPCWD(state,path={}){
 const source=asVector(state),steps=Array.isArray(path.steps)?path.steps:[],id=String(path.id||'IDENTITY_PATH');
 let current=[...source];const receipts=[];
 for(const [index,step] of steps.entries()){
  const before=[...current];current=applyStep(current,step,false);
  receipts.push({index,kind:String(step.kind||'SHIFT').toUpperCase(),beforeFingerprint:fingerprintPCWD(before),afterFingerprint:fingerprintPCWD(current),deltaNorm:l2(sub(current,before))});
 }
 let recovered=[...current],recoverable=true;
 try{for(let i=steps.length-1;i>=0;i--)recovered=applyStep(recovered,steps[i],true)}catch{recoverable=false}
 const roundTripError=recoverable?l2(sub(recovered,source)):Infinity;
 const holonomyResidual=path.closed===true?l2(sub(current,source)):null;
 return{
  id,source,state:current,steps:receipts,closed:path.closed===true,recoverable,
  roundTripError,holonomyResidual,pathFingerprint:fingerprintPCWD({id,steps,pathClosed:path.closed===true})
 };
}

export function evaluateObservablePCWD(state,spec={}){
 const x=asVector(state),kind=String(spec.kind||'SUM').toUpperCase();
 if(kind==='SUM')return sum(x);
 if(kind==='MEAN')return mean(x);
 if(kind==='L2')return l2(x);
 if(kind==='NORM_SQ')return normSq(x);
 if(kind==='MAX_ABS')return maxAbs(x);
 if(kind==='LINEAR'){
  const w=asVector(spec.weights,'observable weights');if(w.length!==x.length)throw new Error('PCWD LINEAR observable length mismatch');
  return x.reduce((s,v,i)=>s+v*w[i],0)+finite(spec.bias);
 }
 throw new Error('PCWD unsupported observable kind');
}
function compareObservables(source,target,specs=[]){
 const rows=(Array.isArray(specs)?specs:[]).map((spec,index)=>{
  const sourceValue=evaluateObservablePCWD(source,spec),targetValue=evaluateObservablePCWD(target,spec);
  const residual=Math.abs(sourceValue-targetValue),tolerance=Math.max(0,finite(spec.tolerance,1e-9));
  return{id:String(spec.id||'observable-'+index),kind:String(spec.kind||'SUM').toUpperCase(),sourceValue,targetValue,residual,tolerance,pass:residual<=tolerance};
 });
 return{rows,maxResidual:rows.length?Math.max(...rows.map(r=>r.residual)):Infinity,pass:rows.length>0&&rows.every(r=>r.pass)};
}
function admissibleEvidence(evidence=[]){
 const rows=Array.isArray(evidence)?evidence:[];
 const normalized=rows.map((e,index)=>({id:String(e?.id||'evidence-'+index),admissible:e?.admissible===true,source:String(e?.source||''),hash:String(e?.hash||''),kind:String(e?.kind||'EVIDENCE')}));
 return{rows,pass:normalized.length>0&&normalized.every(e=>e.admissible)};
}
function scorePCWD({continuity=0,futurePlasticity=0,contradiction=0,burden=0,recoveryError=0,dynamicsError=0,observableError=0,weights={}}={}){
 const C=Math.max(0,finite(continuity)),P=Math.max(0,finite(futurePlasticity)),q=Math.max(0,finite(contradiction)),L=Math.max(0,finite(burden));
 const a=Math.max(0,finite(weights.recovery,1)),b=Math.max(0,finite(weights.dynamics,1)),g=Math.max(0,finite(weights.observables,1));
 const denominator=q+L+a*Math.max(0,finite(recoveryError))+b*Math.max(0,finite(dynamicsError))+g*Math.max(0,finite(observableError))+1e-9;
 return{continuity:C,futurePlasticity:P,contradiction:q,burden:L,recoveryPenalty:a,dynamicsPenalty:b,observablePenalty:g,score:(C*P)/denominator};
}

export function compileStatePacketPCWD(input={}){
 const sensed=asVector(input.state??input.x??[]),address=input.address??null;
 const normalized=normalizeStatePCWD(sensed,input.normalization||{});
 const decomposition=decomposeSymmetryPCWD(normalized.state,input.symmetryTransforms||[]);
 const lemma=compileLemmaPCWD(decomposition.projected,input.lemma||{});
 const activePath=transportPathPCWD(lemma.reduced,input.path||{id:'identity',steps:[]});
 const referencePath=input.referencePath?transportPathPCWD(lemma.reduced,input.referencePath):null;
 const transportedFull=recoverLemmaPCWD(activePath.state,input.lemma||{},decomposition.projected.length);
 const sourceRecovered=lemma.reconstructed;
 const sigmaVector=referencePath?sub(activePath.state,referencePath.state):new Array(activePath.state.length).fill(0);
 const sigma={
  kind:referencePath?'PATH_DEPENDENCE':'NO_REFERENCE_PATH',
  vector:sigmaVector,norm:l2(sigmaVector),activePath:activePath.id,referencePath:referencePath?.id||null,
  holonomyResidual:activePath.holonomyResidual
 };
 const scarLedger=[...(Array.isArray(input.scarLedger)?input.scarLedger:[])];
 scarLedger.push({kind:'SYMMETRY_RESIDUAL',norm:decomposition.residualNorm,fingerprint:fingerprintPCWD(decomposition.residual)});
 scarLedger.push({kind:'LEMMA_RECOVERY_RESIDUAL',norm:lemma.recoveryError,fingerprint:fingerprintPCWD(lemma.residual)});
 scarLedger.push({kind:'PATH_RESIDUAL',norm:sigma.norm,fingerprint:fingerprintPCWD(sigmaVector)});
 if(activePath.holonomyResidual!==null)scarLedger.push({kind:'HOLONOMY_RESIDUAL',norm:activePath.holonomyResidual,fingerprint:activePath.pathFingerprint});
 const invariants=compareObservables(decomposition.projected,transportedFull,input.invariants||[]);
 const observables=compareObservables(decomposition.projected,sourceRecovered,input.observables||[]);
 const dynamicsExpected=input.dynamics?.expectedFullState?asVector(input.dynamics.expectedFullState,'expected full dynamics state'):null;
 let dynamicsError=Infinity,dynamicsReducedExpected=null;
 if(dynamicsExpected){
  if(dynamicsExpected.length!==decomposition.projected.length)throw new Error('PCWD expected dynamics state length mismatch');
  dynamicsReducedExpected=compileLemmaPCWD(dynamicsExpected,input.lemma||{}).reduced;
  if(dynamicsReducedExpected.length!==activePath.state.length)throw new Error('PCWD reduced dynamics length mismatch');
  dynamicsError=l2(sub(dynamicsReducedExpected,activePath.state));
 }
 const evidence=admissibleEvidence(input.evidence||[]);
 const tolerances={
  continuity:Math.max(0,finite(input.tolerances?.continuity,0)),
  recovery:Math.max(0,finite(input.tolerances?.recovery,1e-9)),
  dynamics:Math.max(0,finite(input.tolerances?.dynamics,1e-9)),
  observables:Math.max(0,finite(input.tolerances?.observables,1e-9)),
  path:Math.max(0,finite(input.tolerances?.path,1e-9))
 };
 const C=clamp01(input.continuity??input.COmega??0),Phi=clamp01(input.futurePlasticity??input.Phi??0),q=Math.max(0,finite(input.contradiction??input.q)),Lambda=Math.max(0,finite(input.burden??input.Lambda));
 const gates={
  continuityValid:C>=tolerances.continuity&&normalized.state.every(Number.isFinite),
  invariantsPreserved:invariants.pass,
  scarRetained:scarLedger.length>=3,
  recoveryBounded:lemma.recoveryError<=tolerances.recovery,
  dynamicsBounded:dynamicsError<=tolerances.dynamics,
  observablesBounded:observables.pass&&observables.maxResidual<=tolerances.observables,
  evidenceAdmissible:evidence.pass,
  pathRecoverable:activePath.recoverable&&activePath.roundTripError<=tolerances.path
 };
 const failedGates=PCWD_PROMOTION_GATES.filter(k=>gates[k]!==true),allow=failedGates.length===0;
 const errors={recovery:lemma.recoveryError,dynamics:dynamicsError,observables:observables.maxResidual,pathRoundTrip:activePath.roundTripError,symmetryProjection:decomposition.projectionIdempotenceError,pathDependence:sigma.norm};
 const score=scorePCWD({continuity:C,futurePlasticity:Phi,contradiction:q,burden:Lambda,recoveryError:errors.recovery,dynamicsError:Number.isFinite(errors.dynamics)?errors.dynamics:1e9,observableError:Number.isFinite(errors.observables)?errors.observables:1e9,weights:input.penaltyWeights||{}});
 const motion=!gates.continuityValid||!gates.evidenceAdmissible||!gates.pathRecoverable?'ESCALATE':allow?'STAY':'TURN';
 const proofCore={
  schema:PCWD_PROOF_SCHEMA,gates,failedGates,allow,motion,errors,tolerances,
  invariantReceipts:invariants.rows,observableReceipts:observables.rows,evidence:evidence.rows,
  sourceFingerprint:fingerprintPCWD(decomposition.projected),targetFingerprint:fingerprintPCWD(transportedFull),
  pathFingerprint:activePath.pathFingerprint,score:score.score,
  canonicalMutation:false,physicalPrimitiveIntroduced:false,atlasPhysicalDimensionClaimed:false
 };
 const proof={...proofCore,proofFingerprint:fingerprintPCWD(proofCore)};
 const packet={
  schema:PCWD_PACKET_SCHEMA,
  A_t:address,
  x_t:sensed,
  P_G_x_t:decomposition.projected,
  r_t:decomposition.residual,
  C_Omega:C,
  Phi,
  q,
  Lambda,
  Sigma_t:sigma,
  Gamma_t:{id:activePath.id,pathFingerprint:activePath.pathFingerprint,steps:activePath.steps,recoverable:activePath.recoverable,roundTripError:activePath.roundTripError},
  L_t:{id:lemma.id,kind:lemma.kind,compressionRatio:lemma.compressionRatio,reduced:lemma.reduced,transportedReduced:activePath.state},
  E_t:evidence.rows,
  Pi_t:proof,
  scars:scarLedger,
  stageReceipts:{
   SENSE:{fingerprint:fingerprintPCWD(sensed),dimension:sensed.length},
   NORMALIZE:{mode:normalized.mode,fingerprint:fingerprintPCWD(normalized.state)},
   DECOMPOSE:{projectedFingerprint:fingerprintPCWD(decomposition.projected),residualNorm:decomposition.residualNorm},
   LEMMA:{id:lemma.id,kind:lemma.kind,recoveryError:lemma.recoveryError,compressionRatio:lemma.compressionRatio},
   TRANSPORT:{pathFingerprint:activePath.pathFingerprint,pathDependence:sigma.norm},
   RECOVER:{targetFingerprint:fingerprintPCWD(transportedFull),recoveryError:lemma.recoveryError},
   PROVE:{proofFingerprint:proof.proofFingerprint,allow}
  },
  boundary:PCWD_BOUNDARY
 };
 return{
  schema:PCWD_SCHEMA,stages:PCWD_STAGES,packet,
  normalized,decomposition,lemma,transport:activePath,referenceTransport:referencePath,
  recovered:{source:sourceRecovered,target:transportedFull},invariants,observables,dynamics:{expectedFullState:dynamicsExpected,reducedExpected:dynamicsReducedExpected,error:dynamicsError},
  proof,promotion:{allow,failedGates,motion},boundary:PCWD_BOUNDARY
 };
}

export function compileForecastBranchesPCWD({parentPacket,branches=[]}={}){
 if(!parentPacket||parentPacket.schema!==PCWD_PACKET_SCHEMA)throw new Error('PCWD forecast requires a PCWD parent packet');
 const rows=(Array.isArray(branches)?branches:[]).map((b,index)=>{
  const probability=Math.max(0,finite(b?.probability));
  const result=compileStatePacketPCWD({...b,input:b?.input,state:b?.state??parentPacket.P_G_x_t});
  return{id:String(b?.id||'branch-'+index),probability,result};
 });
 const probabilityMass=rows.reduce((s,r)=>s+r.probability,0);
 return{
  schema:'OMEGA_PCWD_FORECAST_BRANCH_SET_V1',
  parentProofFingerprint:parentPacket.Pi_t.proofFingerprint,
  branches:rows,
  probabilityMass,
  normalizedProbabilityMass:probabilityMass>0?rows.map(r=>({id:r.id,p:r.probability/probabilityMass})):[],
  retainedBranchCount:rows.length,
  prunedBranchCount:0,
  boundary:'Forecast branches are model futures, not observations. Branches remain explicit until an external admissibility rule prunes them.'
 };
}

export function quantumPureStateAdapterPCWD(amplitudes=[]){
 const rows=Array.isArray(amplitudes)?amplitudes:[];
 if(!rows.length)throw new Error('PCWD quantum adapter requires amplitudes');
 const state=[];
 for(const [i,a] of rows.entries()){
  const re=Array.isArray(a)?Number(a[0]):Number(a?.re),im=Array.isArray(a)?Number(a[1]):Number(a?.im);
  if(!Number.isFinite(re)||!Number.isFinite(im))throw new Error('PCWD quantum amplitude '+i+' must be finite complex data');
  state.push(re,im);
 }
 return{
  state,
  invariants:[{id:'PURE_STATE_NORM',kind:'NORM_SQ',tolerance:1e-9}],
  observables:[{id:'PURE_STATE_NORM',kind:'NORM_SQ',tolerance:1e-9}],
  normSquared:normSq(state),
  boundary:'This adapter only maps a supplied pure-state amplitude vector into PCWD software coordinates and tracks norm preservation. It is not a quantum-mechanics replacement, measurement model, physical validation, or claim about an observed quantum system.'
 };
}
