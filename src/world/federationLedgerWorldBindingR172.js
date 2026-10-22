import {reconcileFederationReceiptWorldR171,R171_STAGES} from './federationReceiptWorldReconcilerR171.js';

export const R172_REVISION='R172';
export const R172_SCHEMA='OMEGA_FEDERATION_LEDGER_WORLD_BINDING_R172';
export const R172_LAWS=Object.freeze([
 'ONLY_TRUSTED_R114_LEDGER_RESPONSES_MAY_ADVANCE_R171',
 'R114_RECEIPT_SCHEMA_AND_PREDECESSOR_HASH_LINKAGE_ARE_REQUIRED',
 'LEDGER_REPLAY_IS_NOT_NETWORK_REACHABILITY_OR_EXECUTION_PROOF',
 'R171_REMAINS_FEDERATION_WORLD_RECONCILIATION_AUTHORITY',
 'R136_R134_REMAIN_VISUAL_WORLD_AND_SCAR_CONTINUITY_AUTHORITY',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'NO_PUBLIC_DEPLOYMENT_PC_ONLINE_SOLVER_VALIDITY_OR_PHOTOREAL_CLAIM_WITHOUT_DIRECT_PROOF'
]);

const text=(v,n=180)=>String(v??'').trim().slice(0,n);
const receiptArray=(ledger)=>Array.isArray(ledger)?ledger:Array.isArray(ledger?.receipts)?ledger.receipts:Array.isArray(ledger?.ledger)?ledger.ledger:[];

function normalizeR114Ledger(ledger,{trustedSource=false}={}){
 const raw=receiptArray(ledger);
 const accepted=[];
 let previous=null;
 let chainValid=trustedSource===true;
 let failure=null;
 for(const stage of R171_STAGES){
  const receipt=raw.find(r=>text(r?.stage,24).toUpperCase()===stage);
  if(!receipt)break;
  const schemaOk=receipt.schema==='OMEGA_FEDERATION_RECEIPT_R114';
  const id=text(receipt.receiptSha256,180);
  const linkOk=previous===null?receipt.previousReceiptSha256==null:receipt.previousReceiptSha256===previous;
  if(!schemaOk||!id||!linkOk){chainValid=false;failure={stage,schemaOk,linkOk,receiptIdPresent:Boolean(id)};break;}
  accepted.push({
   stage,
   receiptId:id,
   verified:trustedSource===true,
   authority:stage==='ADMIT'?text(receipt.authority,80)||null:text(receipt.authority,80)||null,
   source:text(receipt.source||receipt.node||receipt.service||stage,120),
   payloadDigest:text(receipt.payloadDigest||receipt.digest||receipt.receiptSha256,180)
  });
  previous=id;
 }
 return{rawCount:raw.length,accepted,chainValid:chainValid&&accepted.length>0,failure};
}

export async function reconcileFederationLedgerWorldR172({ledger,context={},trustedSource=false}={}){
 const normalized=normalizeR114Ledger(ledger,{trustedSource});
 const result=await reconcileFederationReceiptWorldR171({receipts:normalized.chainValid?normalized.accepted:[],context:{...context,sessionId:context.sessionId||'R114-LEDGER'}});
 return{
  schema:R172_SCHEMA,
  revision:R172_REVISION,
  trustedSource:trustedSource===true,
  ledgerSchema:'OMEGA_FEDERATION_RECEIPT_R114',
  rawReceiptCount:normalized.rawCount,
  acceptedReceiptCount:normalized.chainValid?normalized.accepted.length:0,
  predecessorChainValid:normalized.chainValid,
  failure:normalized.failure,
  world:result,
  federationClosed:normalized.chainValid&&result.federationClosed===true,
  nextRequiredStage:result.nextRequiredStage,
  canonicalMutation:false,
  canonicalAdmissionAuthority:'R125',
  claims:{
   publicDeploymentProved:false,
   pcOnlineProved:false,
   solverValidityProved:false,
   computedPhotorealRealityProved:false,
   currentNetworkReachabilityProved:false,
   federationClosedProved:normalized.chainValid&&result.federationClosed===true
  },
  truthBoundary:'R172 advances the existing R171/R136/R134 living federation world only from a caller-designated trusted R114 ledger response whose exact receipt schema and predecessor-hash linkage validate. Replay of that durable ledger does not independently prove current network reachability, public deployment, PC state, solver scientific validity, or computed-photoreal reality.'
 };
}

export function manifestR172(){return{schema:R172_SCHEMA,revision:R172_REVISION,laws:R172_LAWS,sourceAuthority:'R114_LEDGER',worldAuthority:'R171/R136/R134',canonicalAdmissionAuthority:'R125',canonicalMutation:false};}
