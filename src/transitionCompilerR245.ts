import {decodeAddress} from './corpusRuntime';
import type {Mandala20736Field} from './mandala20736Runtime';
import {createAnalysisCacheR189} from './analysisCacheR189';
import {reconstructMultipathR185,type ReconstructionPathR185} from './multipathReconstructionR185';
import {compileDifferentialRelativityR186,type DifferentialRelativityR186} from './differentialRelativityR186';
import {compileChainedFormulaCalibrationR187,type ChainedFormulaCalibrationR187} from './chainedFormulaCalibrationR187';
import {compileCognitiveAuthorityFrameR241,type CognitiveAuthorityFrameR241} from './cognitiveAuthorityR241';
import type {ResourceEnvelopeR239,R239Tier} from './hybridResourceGovernorR239';

export const TRANSITION_COMPILER_REVISION='R245' as const;
export const TRANSITION_COMPILER_SCHEMA='OMEGA_CONSTRAINED_TRANSITION_COMPILER_R245' as const;

export type TransitionProposalR245={
 id:string;
 targetAddress:number;
 confidence:number;
 rationale?:string;
 origin:'AI'|'OPERATOR'|'R241';
};

export type TransitionDispositionR245='READY_FOR_AUTHORIZATION'|'CONSTRAINED_FOR_AUTHORIZATION'|'HOLD'|'UNPROVED';

export type TransitionCandidateR245={
 id:string;
 rank:number;
 sourceAddress:number;
 targetAddress:number;
 stateIds:number[];
 pathId:string;
 objectiveCost:number;
 deterministicCost:number;
 proposalCredit:number;
 proposalSupport:{count:number;maxConfidence:number;ids:string[];origins:string[]};
 metrics:{
  finalResidual:number;
  improvement:number;
  scarCost:number;
  evidenceFloor:number;
  reverseConsistency:number;
  motionConsistency:number;
  temporaryWorsening:number;
  calibrationConfidence:number;
  calibrationRmse:number;
  gradientAlignment:number;
  contradiction:number;
  burden:number;
  resourcePenalty:number;
 };
 disposition:TransitionDispositionR245;
 authorizationEligible:boolean;
 holds:string[];
 truthBoundary:string;
};

export type TransitionCompilerR245={
 schema:typeof TRANSITION_COMPILER_SCHEMA;
 revision:'R245';
 sourceAddress:number;
 sourceStateId:number;
 resourceTier:R239Tier|'UNAVAILABLE';
 cognition:CognitiveAuthorityFrameR241;
 differential:DifferentialRelativityR186;
 calibration:ChainedFormulaCalibrationR187;
 candidateCount:number;
 candidates:TransitionCandidateR245[];
 best:TransitionCandidateR245|null;
 authority:{
  proposal:'R241/AI/OPERATOR';
  authorization:'EXISTING_GOVERNED_AUTHORIZATION_REQUIRED';
  dispatch:'R147';
  returnedProof:'R141';
  durableHistory:'R146';
  canonAdmission:'R125';
 };
 invariants:readonly string[];
 truthBoundary:string;
};

const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const shortest=(a:number,b:number)=>{let d=b-a;if(d>6)d-=12;if(d<-6)d+=12;return d};
const tierPenalty=(tier:R239Tier|'UNAVAILABLE')=>tier==='HIGH_CAPACITY'?0:tier==='READY'?.10:tier==='CONSTRAINED'?.35:tier==='HOLD'?1:.85;

function firstStepAlignment(path:ReconstructionPathR185,diff:DifferentialRelativityR186){
 if(path.states.length<2||diff.gradient.magnitude<=1e-12)return 0;
 const a=decodeAddress(path.states[0].address),b=decodeAddress(path.states[1].address),v={D:shortest(a.d,b.d),P:shortest(a.p,b.p),R:shortest(a.r,b.r),L:shortest(a.l,b.l)},norm=Math.hypot(v.D,v.P,v.R,v.L);
 if(!norm)return 0;
 const g=diff.gradient;
 return Math.max(-1,Math.min(1,-(g.D*v.D+g.P*v.P+g.R*v.R+g.L*v.L)/(g.magnitude*norm)));
}

function resourceGate(envelope:ResourceEnvelopeR239|null|undefined){
 if(!envelope)return{tier:'UNAVAILABLE' as const,holds:['R239_RESOURCE_ENVELOPE_REQUIRED'],eligible:false};
 const holds:string[]=[];
 if(!envelope.snapshotCurrent)holds.push('R239_SHARED_SNAPSHOT_CURRENT_REQUIRED');
 if(!envelope.profileProved)holds.push('R238_RETURNED_HOST_PROFILE_REQUIRED');
 if(!envelope.profileFresh)holds.push('R239_RETURNED_HOST_PROFILE_FRESH_REQUIRED');
 if(envelope.activeNativeWork)holds.push('R239_ONE_ACTIVE_NATIVE_JOB_PER_DEVICE');
 if(envelope.tier==='HOLD')holds.push(...envelope.reasons.map(x=>`R239_${x}`));
 if(envelope.tier==='UNPROVED')holds.push('R239_RESOURCE_TIER_UNPROVED');
 return{tier:envelope.tier,holds:[...new Set(holds)],eligible:holds.length===0&&(envelope.tier==='READY'||envelope.tier==='HIGH_CAPACITY'||envelope.tier==='CONSTRAINED')};
}

function candidateDisposition(input:{cognition:CognitiveAuthorityFrameR241;calibration:ChainedFormulaCalibrationR187;resource:ReturnType<typeof resourceGate>;path:ReconstructionPathR185}){
 const holds=[...input.resource.holds];
 if(input.cognition.stages.find(x=>x.id==='OBSERVATION')?.status!=='SOURCE_BOUND')holds.push('R241_SOURCE_BOUND_OBSERVATION_REQUIRED');
 if(input.path.evidenceFloor<.05)holds.push('R185_EVIDENCE_FLOOR');
 if(input.path.temporaryWorsening>.30)holds.push('R185_TEMPORARY_WORSENING_LIMIT');
 if(input.calibration.calibration.state==='RELINEARIZE_REQUIRED')holds.push('R187_RELINEARIZATION_REQUIRED');
 if(input.calibration.metrics.meanConfidence<.25)holds.push('R187_CALIBRATION_CONFIDENCE_LOW');
 const unique=[...new Set(holds)];
 if(!input.resource.eligible||input.cognition.stages.find(x=>x.id==='OBSERVATION')?.status!=='SOURCE_BOUND')return{disposition:(input.resource.tier==='UNAVAILABLE'||input.resource.tier==='UNPROVED'?'UNPROVED':'HOLD') as TransitionDispositionR245,holds:unique,eligible:false};
 if(unique.length)return{disposition:'HOLD' as const,holds:unique,eligible:false};
 if(input.resource.tier==='CONSTRAINED'||input.calibration.calibration.state==='MIXED_LOCAL_VALIDITY')return{disposition:'CONSTRAINED_FOR_AUTHORIZATION' as const,holds:[],eligible:true};
 return{disposition:'READY_FOR_AUTHORIZATION' as const,holds:[],eligible:true};
}

export function compileTransitionCompilerR245(input:{field:Mandala20736Field;address:number;resourceEnvelope?:ResourceEnvelopeR239|null;proposals?:TransitionProposalR245[]}):TransitionCompilerR245{
 const {field}=input,address=Math.max(0,Math.min(field.count-1,Math.floor(input.address))),cache=createAnalysisCacheR189(field),multipath=reconstructMultipathR185(field,address,12,8,cache),differential=compileDifferentialRelativityR186(field,address,cache),calibration=compileChainedFormulaCalibrationR187(field,address,cache),cognition=compileCognitiveAuthorityFrameR241(field,address),resource=resourceGate(input.resourceEnvelope),proposals=(input.proposals||[]).filter(p=>Number.isInteger(p.targetAddress)&&p.targetAddress>=0&&p.targetAddress<field.count).map(p=>({...p,confidence:clamp(p.confidence)}));
 const paths=(multipath.paretoFrontier.length?multipath.paretoFrontier:multipath.survivors).slice(0,12);
 const provisional=paths.map(path=>{
  const final=path.states.at(-1)!,support=proposals.filter(p=>p.targetAddress===final.address),maxConfidence=Math.max(0,...support.map(p=>p.confidence)),proposalCredit=Math.min(.01,.01*maxConfidence),gradientAlignment=firstStepAlignment(path,differential),calibrationPenalty=1-clamp(calibration.metrics.meanConfidence),resourcePenalty=tierPenalty(resource.tier),deterministicCost=clamp(.25*path.finalResidual+.14*path.scarCost+.12*(1-path.evidenceFloor)+.10*(1-path.reverseConsistency)+.10*(1-path.motionConsistency)+.08*path.temporaryWorsening+.08*calibrationPenalty+.05*resourcePenalty+.04*clamp(final.contradiction)+.02*clamp(final.burden)+.02*(1-clamp((gradientAlignment+1)/2))),objectiveCost=clamp(deterministicCost-proposalCredit),gate=candidateDisposition({cognition,calibration,resource,path});
  return{id:`R245:${path.id}`,sourceAddress:address,targetAddress:final.address,stateIds:path.states.map(x=>x.stateId),pathId:path.id,objectiveCost,deterministicCost,proposalCredit,proposalSupport:{count:support.length,maxConfidence,ids:support.map(x=>x.id),origins:[...new Set(support.map(x=>x.origin))]},metrics:{finalResidual:path.finalResidual,improvement:path.improvement,scarCost:path.scarCost,evidenceFloor:path.evidenceFloor,reverseConsistency:path.reverseConsistency,motionConsistency:path.motionConsistency,temporaryWorsening:path.temporaryWorsening,calibrationConfidence:calibration.metrics.meanConfidence,calibrationRmse:calibration.metrics.rmse,gradientAlignment,contradiction:final.contradiction,burden:final.burden,resourcePenalty},disposition:gate.disposition,authorizationEligible:gate.eligible,holds:gate.holds,truthBoundary:'R245 candidate ranking is deterministic over existing R185/R186/R187/R239/R241 state. Bounded AI/operator proposal support can reduce rank cost by at most 0.01 and cannot remove a hard hold, authorize dispatch, prove execution, fabricate a return, or admit CanonState.'};
 }).sort((a,b)=>Number(b.authorizationEligible)-Number(a.authorizationEligible)||a.objectiveCost-b.objectiveCost||b.metrics.improvement-a.metrics.improvement||a.pathId.localeCompare(b.pathId)).map((x,i)=>({...x,rank:i+1}));
 const best=provisional.find(x=>x.authorizationEligible)||provisional[0]||null;
 return{schema:TRANSITION_COMPILER_SCHEMA,revision:'R245',sourceAddress:address,sourceStateId:address+1,resourceTier:resource.tier,cognition,differential,calibration,candidateCount:provisional.length,candidates:provisional,best,authority:{proposal:'R241/AI/OPERATOR',authorization:'EXISTING_GOVERNED_AUTHORIZATION_REQUIRED',dispatch:'R147',returnedProof:'R141',durableHistory:'R146',canonAdmission:'R125'},invariants:['Proposal != Permission','Permission != Execution','Execution != SuccessfulOutcome','Returned result != CanonState admission','AI support cannot override evidence/calibration/resource holds','At most one currently ranked transition packet is presented as best; it is still proposal-only'],truthBoundary:'R245 composes the existing bounded multipath, differential/Hessian, re-linearized calibration, selected-host resource, and typed cognition layers into one auditable transition ranking. It creates no new physical primitive, executor, source-mutation authority, returned-proof authority, deployment writer, or CanonState admission path.'};
}
