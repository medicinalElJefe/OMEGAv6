import {evaluateQtiR332,verifyObservedOutcomeR332} from './qtiControlR332.js';
import {calibratedRelativityR334,calibrationManifestR334} from './calibrationR334.js';
import {calibratedRelativityR339,calibrationAdvancementManifestR339} from './calibrationAdvancementR339.js';

export const R334_RELATIONAL_SCHEMA='OMEGA_PROOF_GOVERNED_RELATIONAL_RUNTIME_R334';
export const R334_RELATIONAL_REVISION='R334';
export const R334_OPERATORS=Object.freeze([
 'OBSERVE','NORMALIZE','RELATE','CARRY','TRANSLATE','RECONSTRUCT','PRUNE','PROVE','FORECAST','LEDGER'
]);
export const R334_DECISIONS=Object.freeze(['STAY','TURN','ESCALATE']);

const clean=(value,max=240)=>String(value??'').trim().slice(0,max);
const clamp01=value=>Math.max(0,Math.min(1,Number(value)));
const finite=value=>Number.isFinite(Number(value));

function deepFreezeR334(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.freeze(value);
  for(const child of Object.values(value))deepFreezeR334(child);
 }
 return value;
}

function canonicalR334(value){
 if(value===null)return null;
 const type=typeof value;
 if(type==='string'||type==='boolean')return value;
 if(type==='number'){
  if(!Number.isFinite(value))throw new Error('R334 non-finite canonical number');
  return value;
 }
 if(Array.isArray(value))return value.map(canonicalR334);
 if(type!=='object')throw new Error('R334 non-JSON canonical value');
 const out={};
 for(const key of Object.keys(value).sort())out[key]=canonicalR334(value[key]);
 return out;
}

async function sha256HexR334(value){
 const bytes=new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(canonicalR334(value)));
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
}

function metricR334(name,input){
 if(!input||typeof input!=='object')throw new Error('R334 '+name+' metric is required');
 if(!finite(input.value))throw new Error('R334 '+name+' metric value must be finite');
 const sourceId=clean(input.sourceId);
 const method=clean(input.method,480);
 if(!sourceId||!method)throw new Error('R334 '+name+' metric requires sourceId and method');
 return Object.freeze({name,value:clamp01(input.value),sourceId,method});
}

function metricsR334(input){
 return Object.freeze({
  continuity:metricR334('continuity',input?.continuity),
  plasticity:metricR334('plasticity',input?.plasticity),
  contradiction:metricR334('contradiction',input?.contradiction),
  burden:metricR334('burden',input?.burden),
  evidence:metricR334('evidence',input?.evidence),
 });
}

function listR334(value,max=256){
 return Array.isArray(value)?value.map(x=>clean(x,320)).filter(Boolean).slice(0,max):[];
}

export function buildRelationalStateR334(input={}){
 const stateVersion=clean(input.stateVersion);
 if(!stateVersion)throw new Error('R334 stateVersion is required');
 const observations=Array.isArray(input.observations)?input.observations.map((row,index)=>{
  const observationId=clean(row?.observationId||row?.id);
  const sourceId=clean(row?.sourceId);
  const frameId=clean(row?.frameId);
  if(!observationId||!sourceId||!frameId)throw new Error('R334 observation '+index+' requires observationId, sourceId and frameId');
  return Object.freeze({
   observationId,sourceId,frameId,
   provenanceId:clean(row?.provenanceId)||null,
   evidenceIds:listR334(row?.evidenceIds,64),
   scarIds:listR334(row?.scarIds,64),
  });
 }):[];
 if(!observations.length)throw new Error('R334 requires at least one observation');
 const relations=Array.isArray(input.relations)?input.relations.map((row,index)=>{
  const relationId=clean(row?.relationId||row?.id);
  const from=clean(row?.from),to=clean(row?.to),kind=clean(row?.kind);
  if(!relationId||!from||!to||!kind)throw new Error('R334 relation '+index+' requires relationId, from, to and kind');
  return Object.freeze({relationId,from,to,kind,evidenceIds:listR334(row?.evidenceIds,64)});
 }):[];
 return deepFreezeR334({
  schema:R334_RELATIONAL_SCHEMA,
  revision:R334_RELATIONAL_REVISION,
  stateVersion,
  parentStateVersion:clean(input.parentStateVersion)||null,
  metrics:metricsR334(input.metrics),
  observations,
  relations,
  constraints:listR334(input.constraints),
  scarIds:listR334(input.scarIds),
  provenanceIds:listR334(input.provenanceIds),
  canonicalAdmission:false,
 });
}

function candidateR334(state,input,index){
 const candidateId=clean(input?.candidateId||input?.id);
 if(!candidateId)throw new Error('R334 candidate '+index+' requires candidateId');
 const priority=Number(input?.priority);
 if(!Number.isSafeInteger(priority)||priority<0)throw new Error('R334 '+candidateId+' priority must be a non-negative safe integer');
 if(!input?.qtiProposal||typeof input.qtiProposal!=='object')throw new Error('R334 '+candidateId+' requires qtiProposal');
 return deepFreezeR334({
  candidateId,
  priority,
  stateVersion:state.stateVersion,
  actionClass:clean(input.actionClass||input.qtiProposal.actionClass),
  predictedMetrics:metricsR334(input.predictedMetrics),
  predictionEvidenceIds:listR334(input.predictionEvidenceIds,128),
  scarCarryIds:[...new Set([...state.scarIds,...listR334(input.scarCarryIds,128)])],
  qtiProposal:canonicalR334(input.qtiProposal),
  canonicalAdmission:false,
 });
}

const ge=(a,b)=>a>=b-1e-12;
const le=(a,b)=>a<=b+1e-12;
const gt=(a,b)=>a>b+1e-12;
const lt=(a,b)=>a<b-1e-12;

export function paretoDominatesR334(a,b){
 const A=a.predictedMetrics||a.metrics;
 const B=b.predictedMetrics||b.metrics;
 const noWorse=
  ge(A.continuity.value,B.continuity.value)&&
  ge(A.plasticity.value,B.plasticity.value)&&
  ge(A.evidence.value,B.evidence.value)&&
  le(A.contradiction.value,B.contradiction.value)&&
  le(A.burden.value,B.burden.value);
 const better=
  gt(A.continuity.value,B.continuity.value)||
  gt(A.plasticity.value,B.plasticity.value)||
  gt(A.evidence.value,B.evidence.value)||
  lt(A.contradiction.value,B.contradiction.value)||
  lt(A.burden.value,B.burden.value);
 return noWorse&&better;
}

export function evaluateRelationalCycleR334(input={}){
 const state=input.state?.schema===R334_RELATIONAL_SCHEMA?input.state:buildRelationalStateR334(input.state||{});
 const qtiStateVersion=clean(input.qtiState?.stateVersion);
 if(qtiStateVersion!==state.stateVersion)throw new Error('R334 QTI stateVersion must equal relational stateVersion');
 const contradictionEscalate=Number(input.policy?.contradictionEscalate);
 const burdenEscalate=Number(input.policy?.burdenEscalate);
 if(!finite(contradictionEscalate)||contradictionEscalate<0||contradictionEscalate>1)throw new Error('R334 contradictionEscalate must be within [0,1]');
 if(!finite(burdenEscalate)||burdenEscalate<0||burdenEscalate>1)throw new Error('R334 burdenEscalate must be within [0,1]');

 const candidates=(Array.isArray(input.candidates)?input.candidates:[]).map((row,index)=>candidateR334(state,row,index));
 const ids=new Set();
 for(const c of candidates){if(ids.has(c.candidateId))throw new Error('R334 duplicate candidateId '+c.candidateId);ids.add(c.candidateId)}

 const evaluated=candidates.map(candidate=>{
  const qti=evaluateQtiR332(candidate.qtiProposal,input.qtiState);
  const proofEligible=qti.outcome==='PASS'&&qti.authorizationEligible===true&&qti.authorizationRequest!==null;
  return deepFreezeR334({...candidate,qti,proofEligible});
 });
 const proofEligible=evaluated.filter(x=>x.proofEligible);
 const frontier=proofEligible.filter(a=>!proofEligible.some(b=>a!==b&&paretoDominatesR334(b,a)));
 const improving=frontier.filter(x=>paretoDominatesR334(x,state));
 improving.sort((a,b)=>a.priority-b.priority||a.candidateId.localeCompare(b.candidateId));

 const pressureHigh=
  state.metrics.contradiction.value>=contradictionEscalate||
  state.metrics.burden.value>=burdenEscalate;

 let decision='STAY';
 if(improving.length)decision='TURN';
 else if(pressureHigh&&!proofEligible.length)decision='ESCALATE';

 const selectedCandidate=decision==='TURN'?improving[0]:null;
 return deepFreezeR334({
  schema:R334_RELATIONAL_SCHEMA,
  revision:R334_RELATIONAL_REVISION,
  state,
  policy:Object.freeze({contradictionEscalate,burdenEscalate,tieBreak:'EXPLICIT_PRIORITY_THEN_CANDIDATE_ID'}),
  evaluated,
  paretoFrontier:frontier.map(x=>x.candidateId),
  improvingFrontier:improving.map(x=>x.candidateId),
  decision,
  selectedCandidate,
  authorizationRequest:selectedCandidate?.qti?.authorizationRequest??null,
  execution:null,
  observedOutcome:null,
  calibration:calibratedRelativityR334(),
  calibrationAdvancement:calibratedRelativityR339(),
  canonicalAdmission:false,
  authorityBoundary:'R334 reconstructs, prunes, proves and forecasts candidate state transitions. R339 v4 ablation/forecast context is read-only and frozen against retuning. The runtime may emit an R332 authorization request but cannot authorize, dispatch, execute or admit CanonState.',
 });
}

export async function finalizeRelationalCycleR334(input={}){
 const cycle=evaluateRelationalCycleR334(input);
 const previousLedgerDigest=clean(input.previousLedgerDigest)||null;
 const ledgerCore={
  schema:'OMEGA_RELATIONAL_LEDGER_EVENT_R334',
  revision:R334_RELATIONAL_REVISION,
  previousLedgerDigest,
  stateVersion:cycle.state.stateVersion,
  decision:cycle.decision,
  selectedCandidateId:cycle.selectedCandidate?.candidateId??null,
  paretoFrontier:cycle.paretoFrontier,
  improvingFrontier:cycle.improvingFrontier,
  scarCarry:[...cycle.state.scarIds],
  proofOutcomes:cycle.evaluated.map(x=>({candidateId:x.candidateId,outcome:x.qti.outcome,proofEligible:x.proofEligible})),
  canonicalAdmission:false,
 };
 const ledgerDigest=await sha256HexR334(ledgerCore);
 return deepFreezeR334({...cycle,ledgerEvent:Object.freeze({...ledgerCore,ledgerDigest})});
}

export function verifyRelationalReturnR334({cycle,executionReceipt,observation}={}){
 if(!cycle?.authorizationRequest)return deepFreezeR334({outcome:'REVISE',successfulOutcome:false,nextParentProposal:null,canonicalAdmission:false,reason:'R334_NO_BOUND_AUTHORIZATION_REQUEST'});
 const observed=verifyObservedOutcomeR332({authorizationRequest:cycle.authorizationRequest,executionReceipt,observation});
 const nextParentProposal=observed.successfulOutcome?Object.freeze({
  schema:'OMEGA_NEXT_PARENT_PROPOSAL_R334',
  revision:R334_RELATIONAL_REVISION,
  priorStateVersion:cycle.state.stateVersion,
  candidateId:cycle.selectedCandidate?.candidateId??null,
  returnedStateVersion:clean(observation?.stateVersion)||null,
  proofOutcome:observed.outcome,
  requiresR125Admission:true,
  canonicalAdmission:false,
 }):null;
 return deepFreezeR334({...observed,nextParentProposal});
}

export function relationalManifestR334(){
 return deepFreezeR334({
  schema:R334_RELATIONAL_SCHEMA,
  revision:R334_RELATIONAL_REVISION,
  operators:R334_OPERATORS,
  decisions:R334_DECISIONS,
  stateMetrics:['continuity','plasticity','contradiction','burden','evidence'],
  selection:'QTI_PASS_AND_PARETO_IMPROVEMENT_WITH_EXPLICIT_PRIORITY_TIE_BREAK',
  ledger:'APPEND_ONLY_HASH_BOUND_EVENT',
  returnProof:'R332_POSTCONDITION_REQUIRED_BEFORE_NEXT_PARENT_PROPOSAL',
  calibration:calibrationManifestR334(),
  calibrationAdvancement:calibrationAdvancementManifestR339(),
  authorizationAuthority:false,
  executionAuthority:false,
  canonicalAdmission:false,
  canonicalAdmissionAuthority:'R125',
  boundary:'R334 makes the OMEGA observe→relate→carry→translate→reconstruct→prune→prove→forecast→ledger loop executable. R339 adds source-hash-bound ablation and frozen prospective compatibility context only; it creates no second state, authorization, execution or CanonState authority.',
 });
}

export const R334_B06_PROGRESS_RECEIPT=Object.freeze({
 revision:R334_RELATIONAL_REVISION,
 stage:'R314-B06',
 state:'ACTIVE_PARTIAL',
 implemented:Object.freeze([
  'typed provenance-bound relational state',
  'structured continuity/plasticity/contradiction/burden/evidence metrics',
  'scar/provenance carry',
  'deterministic Pareto candidate pruning',
  'R332 QTI proof binding',
  'STAY/TURN/ESCALATE cycle decision',
  'authorization-request-only transition boundary',
  'append-only hash-bound relational ledger event',
  'observed-return proof before next-parent proposal',
  'R334 calibrated CERN/Omega relativity evidence context with source-exact/derived separation',
 ]),
 remaining:Object.freeze([
  'full observer/frame transform registry',
  'motion derivative and uncertainty operators',
  'Water transport and Violet re-expression adapters',
  'recorded golden-row relativity replay',
  'external held-out benchmark integration',
 ]),
 canonicalAdmission:false,
 authorizationAuthority:false,
 executionAuthority:false,
 calibrationRelease:calibrationManifestR334().releaseId,
});
