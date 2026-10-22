import {assembleLivingWorldFrameR136} from './livingWorldFrameR136.js';

export const R171_REVISION='R171';
export const R171_SCHEMA='OMEGA_FEDERATION_RECEIPT_WORLD_RECONCILER_R171';
export const R171_STAGES=Object.freeze(['INTENT','PROPOSE','SCREEN','QUEUE','SOLVE','ADMIT']);
export const R171_LAWS=Object.freeze([
 'FEDERATION_CLOSURE_REQUIRES_CONTIGUOUS_VERIFIED_RECEIPT_CHAIN',
 'ROUTING_OR_REACHABILITY_IS_NOT_EXECUTION',
 'RETURNED_IS_NOT_CANONSTATE',
 'ADMIT_REQUIRES_R125_AUTHORITY',
 'R136_REMAINS_VISUAL_WORLD_FRAME_AUTHORITY',
 'R134_REMAINS_CANONICAL_WORLD_SCAR_CONTINUITY_AUTHORITY',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'PC_ONLINE_SOLVER_VALIDITY_AND_PHOTOREAL_REALITY_REQUIRE_DIRECT_PROOF'
]);

const text=(v,n=180)=>String(v??'').trim().slice(0,n);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));

function normalizeReceipt(receipt={}){
 const stage=text(receipt.stage,24).toUpperCase();
 return{
  stage,
  verified:receipt.verified===true,
  receiptId:text(receipt.receiptId||receipt.id||receipt.proofId,160)||null,
  source:text(receipt.source||receipt.node||receipt.authority,120)||null,
  authority:text(receipt.authority,80)||null,
  payloadDigest:text(receipt.payloadDigest||receipt.digest||receipt.hash,180)||null
 };
}

export async function reconcileFederationReceiptWorldR171({receipts=[],context={}}={}){
 const normalized=Array.isArray(receipts)?receipts.map(normalizeReceipt):[];
 const byStage=new Map(normalized.filter(r=>R171_STAGES.includes(r.stage)).map(r=>[r.stage,r]));
 const stages=[];
 let contiguous=true;
 for(const stage of R171_STAGES){
  const receipt=byStage.get(stage)||null;
  const authorityOk=stage!=='ADMIT'||receipt?.authority==='R125';
  const complete=contiguous&&receipt?.verified===true&&Boolean(receipt.receiptId)&&authorityOk;
  if(!complete)contiguous=false;
  stages.push({stage,receipt,complete,status:complete?'VERIFIED':receipt?'HELD':'WAITING'});
 }
 const verifiedStages=stages.filter(s=>s.complete);
 const lastVerified=verifiedStages.at(-1)||null;
 const federationClosed=verifiedStages.length===R171_STAGES.length;
 const scarIds=verifiedStages.map(s=>`R171:${s.stage}:${s.receipt.receiptId}`);
 const nextStage=stages.find(s=>!s.complete)?.stage||null;
 const frame=await assembleLivingWorldFrameR136({
  eventTime:context.eventTime??Date.now(),
  observerId:context.observerId||'omega-federation-receipt-reconciler',
  projection:context.projection||'WOVEN',
  address:context.address??0,
  previousHead:context.previousHead||null,
  intent:{id:federationClosed?'R171-REVIEW-CLOSED-FEDERATION':'R171-COMPLETE-FEDERATION-CHAIN',sourceIds:['R114','R169']},
  mission:{id:`R171-FEDERATION-${text(context.sessionId||'SESSION',80)}`,planDigest:`R171:${lastVerified?.stage||'NONE'}:${nextStage||'COMPLETE'}`,scarIds},
  federation:lastVerified?{
   returned:true,
   node:lastVerified.receipt.source||lastVerified.stage,
   sourceIds:['R114','R169',...verifiedStages.map(s=>s.stage)],
   proofIds:verifiedStages.map(s=>s.receipt.receiptId),
   scarIds,
   payloadDigest:lastVerified.receipt.payloadDigest||lastVerified.receipt.receiptId
  }:null,
  performance:context.performance||{},
  metrics:{
   continuity:clamp(context.metrics?.continuity??0.82),
   plasticity:clamp(context.metrics?.plasticity??0.58),
   contradiction:clamp(federationClosed?0.05:(1-verifiedStages.length/R171_STAGES.length)*0.7),
   burden:clamp(federationClosed?0.15:0.4+0.5*(1-verifiedStages.length/R171_STAGES.length)),
   evidence:clamp(verifiedStages.length/R171_STAGES.length),
   uncertainty:clamp(1-verifiedStages.length/R171_STAGES.length),
   scar:clamp(scarIds.length?0.25:0.7)
  }
 });
 return{
  schema:R171_SCHEMA,revision:R171_REVISION,
  stageOrder:R171_STAGES,
  stages,
  lastVerifiedStage:lastVerified?.stage||null,
  nextRequiredStage:nextStage,
  federationClosed,
  worldId:frame.worldId,
  frame,
  visualOverlay:{stage:lastVerified?.stage||'NONE',nextStage,closed:federationClosed,lod:frame.visualState.lod,sampleBudget:frame.visualState.sampleBudget,federationTruthBand:frame.visualState.truthBands.federation},
  routingIntent:{targetFamily:nextStage?`FEDERATION_${nextStage}`:'FEDERATION_REPLAY',dispatchAuthorized:false},
  canonicalMutation:false,
  canonicalAdmissionAuthority:'R125',
  claims:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,federationClosedProved:federationClosed},
  truthBoundary:'R171 reconciles only the supplied verified receipt packet into the existing R136/R134 living world. Closure means the supplied INTENT→PROPOSE→SCREEN→QUEUE→SOLVE→ADMIT chain is contiguous, receipt-bound, and R125-admitted; it does not independently prove current network reachability, deployment, PC state, solver scientific validity, or photoreal reality.'
 };
}

export function manifestR171(){return{schema:R171_SCHEMA,revision:R171_REVISION,laws:R171_LAWS,stageOrder:R171_STAGES,visualWorldAuthority:'R136/R134',canonicalAdmissionAuthority:'R125',canonicalMutation:false};}
