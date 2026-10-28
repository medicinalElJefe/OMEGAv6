import {evaluateDevelopmentalTransitionR457} from '../heightenedModeR457';

// R673: actual R457 growth computation over R671 model output. Fails closed because
// source-packet diagnostics are NOT release proof; never fabricate a Git SHA or receipts.
const unit=(x:number)=>Number.isFinite(x)?Math.min(1,Math.max(0,x)):0;
const average=(rows:readonly any[],field:string)=>rows.length?rows.reduce((sum,r)=>sum+Number(r[field]||0),0)/rows.length:0;
export function evaluateLocalModeProposalR673(local:any){
 if(!local||local.schema!=='OMEGA7_CANONICAL_MODE_EXECUTION_R671'||!local.sourceTrace?.length||!local.frame?.canonicalState?.length)throw new Error('R673 requires executed local source model receipt');
 const before=local.sourceTrace,after=local.frame.canonicalState;
 const mapped=(source:readonly any[],proposal:boolean)=>({
  continuity:unit(average(source,'continuity')),
  futurePlasticity:unit(average(source,proposal?'plasticity':'plasticity')),
  contradiction:unit(average(source,'contradiction')),
  burden:unit(average(source,'burden')),
  scarPressure:unit(average(source,'scar')),
  // These are release-acceptance dimensions; they cannot be invented from local state packets.
  recoverability:0,proofCoverage:0,capabilityCoverage:0,humanComprehension:0,futureTopologyRetention:0
 });
 const parent=mapped(before,false),candidate=mapped(after,true);
 const governed=evaluateDevelopmentalTransitionR457({
  parent,candidate,authorityClosed:false,proofSurvives:false,
  rollbackAvailable:false,dependencyOrderPreserved:true,canonicalMutation:false,
  evidence:{
   parentStateRef:'CANONICAL_FIELD:'+String(local.address),
   candidateStateRef:'LOCAL_MODE_EXECUTION:'+String(local.address)+':'+String(local.mode),
   sourceHead:'',proofRefs:[],
   metricRefs:{
    continuity:'SOURCE_PACKET_C_OMEGA',
    futurePlasticity:'SOURCE_PACKET_PHI',
    contradiction:'SOURCE_PACKET_Q',
    burden:'SOURCE_PACKET_LAMBDA',
    scarPressure:'SOURCE_PACKET_SCAR'
   }
  }
 });
 if(governed.promotionAllowed)throw Error('R673 local model must never self-certify deployment');
 return Object.freeze({
  schema:'OMEGA_LOCAL_DEVELOPMENTAL_PROOF_GATE_R673',
  status:'HELD' as const,
  decision:governed.decision,hardVetoes:governed.hardVetoes,
  growth:governed.growthVector,acceleration:governed.developmentalAcceleration,
  jerk:governed.developmentalJerk,curvature:governed.developmentalCurvature,
  dewey:governed.dewey,continuityCone:governed.continuityCone,
  promotionAllowed:false as const,canonicalMutation:false as const,
  sourceAuthority:'R125_REQUIRED',
  truthBoundary:'R457 is evaluated against actual R671 local field results. Release coverage, recoverability, proof receipts, exact Git head and production authority remain unknown, and are NOT inferred from model packets. The ledger cannot promote this local diagnostic.'
 });
}
