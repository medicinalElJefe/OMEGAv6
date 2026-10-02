import{convergeR356}from'./continuousConvergenceRuntimeR356.js';
import{verifyProofReceiptV1,type WovenStatePacketV1}from'./proofCarryingWovenDynamics';

export const PCWD_R356_BRIDGE_SCHEMA='OMEGA_PCWD_R356_CONVERGENCE_BRIDGE_v1' as const;
export const PCWD_R356_BRIDGE_BOUNDARY='This bridge requires both inherited R356 convergence/admission evidence and a valid PCWD proof packet before it can recommend ADMIT. It is an additive gate and does not itself mutate CanonState, dispatch work, write production, or replace R125/R141/R146/R147/ci.yml.' as const;

export type R356ObservationV1={frame:string;identity?:string;canonicalHash?:string;artifactHash?:string;state?:string;capabilities?:string[];observedState?:unknown;lastTransition?:string;health?:string;timestamp?:string};
export type R356CandidateIdentityV1={parentSha:string;candidateSha:string;evidence:Record<string,unknown>;atlas360?:Record<string,unknown>};

function finite(n:unknown,fallback=0){const x=Number(n);return Number.isFinite(x)?x:fallback}
export function compilePcwdR356CandidateV1(packet:WovenStatePacketV1,identity:R356CandidateIdentityV1){
 const p=packet.Pi_t;
 const technicalError=Math.max(p.errors.recovery,p.errors.dynamics,p.errors.observables);
 return{
  parentSha:identity.parentSha,
  candidateSha:identity.candidateSha,
  evidence:{...identity.evidence,pcwdProofDigest:p.proofDigest,pcwdPromotionEligible:p.promotionEligible},
  metrics:{
   continuity:packet.C_omega,
   futurePlasticity:packet.Phi,
   contradiction:packet.q+technicalError,
   burden:packet.Lambda+p.errors.holonomy,
   authorityConflict:p.gates.evidenceAdmissible!==true,
   invariantFailure:p.gates.invariantsPreserved!==true||p.gates.continuityValid!==true,
   proofConflict:p.gates.recoveryBounded!==true||p.gates.dynamicsBounded!==true||p.gates.observablesBounded!==true||p.gates.pathRecoverable!==true,
  },
  atlas360:identity.atlas360||{leafIndex:packet.A_t.address,theta:0,execution:{activeAddresses:[packet.A_t.address],bearingStep:1},observerBearingSource:'NEUTRAL_REFERENCE_FRAME_NOT_MEASUREMENT'},
 };
}
export async function convergeProofCarryingR356V1(args:{observations:R356ObservationV1[];packet:WovenStatePacketV1;identity:R356CandidateIdentityV1;scarLedger?:unknown[]}){
 const candidate=compilePcwdR356CandidateV1(args.packet,args.identity);
 const inherited=convergeR356({observations:args.observations,candidate,scarLedger:args.scarLedger||[]});
 const proofDigestValid=/^[0-9a-f]{64}$/i.test(String(args.packet.Pi_t.proofDigest||''));
 const receiptVerified=proofDigestValid&&await verifyProofReceiptV1(args.packet);
 const proofLinked=String(args.packet.Pi_t.previousProofDigest||'').length>0;
 const pcwdGate=args.packet.Pi_t.promotionEligible===true&&receiptVerified&&proofLinked;
 const inheritedAdmit=inherited?.admissionReceipt?.allow===true;
 const allow=pcwdGate&&inheritedAdmit;
 const reasons:string[]=[];
 if(!args.packet.Pi_t.promotionEligible)reasons.push('PCWD_PROMOTION_GATES_HELD');
 if(!proofDigestValid)reasons.push('PCWD_PROOF_DIGEST_INVALID');
 if(proofDigestValid&&!receiptVerified)reasons.push('PCWD_PROOF_RECEIPT_INVALID');
 if(!proofLinked)reasons.push('PCWD_PROOF_LINK_MISSING');
 if(!inheritedAdmit)reasons.push(...(inherited?.admissionReceipt?.reasons||[]).map((x:unknown)=>String(x)));
 return{
  schema:PCWD_R356_BRIDGE_SCHEMA,
  packetProofDigest:args.packet.Pi_t.proofDigest,
  pcwdDecision:args.packet.Pi_t.decision,
  pcwdDecisionScore:finite(args.packet.Pi_t.decisionScore),
  pcwdGate,
  receiptVerified,
  inherited,
  allow,
  next:allow?'ADMIT':args.packet.Pi_t.decision==='ESCALATE'||inherited?.motion?.motion==='ESCALATE'?'ESCALATE':'ITERATE',
  reasons:[...new Set(reasons)].sort(),
  canonicalMutation:false as const,
  productionMutation:false as const,
  boundary:PCWD_R356_BRIDGE_BOUNDARY,
 };
}
