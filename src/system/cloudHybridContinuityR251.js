export const R251_CLOUD_HYBRID_CONTINUITY_CONTRACT='R251_CLOUD_AUTHORITATIVE_HYBRID_CATCHUP_V1';

const READY_PC_TIERS=new Set(['READY','HIGH_CAPACITY']);
const ASSIST_PREFS=new Set(['AUTO','ASSIST']);

export function deriveCloudHybridContinuityR251({
  cloudHeadSha,
  cloudProductionProof='UNKNOWN',
  pc=null,
  preference='AUTO',
}={}){
  const head=String(cloudHeadSha||'').trim();
  if(!head) throw new Error('R251 requires an exact cloud head SHA');

  const proof=String(cloudProductionProof||'UNKNOWN').toUpperCase();
  const pref=String(preference||'AUTO').toUpperCase();
  const online=Boolean(pc?.online===true && pc?.stale!==true);
  const pcHead=String(pc?.cloudHeadSha||'').trim();
  const tier=String(pc?.resourceTier||'UNPROVED').toUpperCase();
  const exactHead=online && pcHead===head;
  const catchupRequired=online && !exactHead;
  const assistRequested=ASSIST_PREFS.has(pref);
  const assistAdmissible=online && exactHead && assistRequested && READY_PC_TIERS.has(tier);

  return Object.freeze({
    schema:R251_CLOUD_HYBRID_CONTINUITY_CONTRACT,
    authority:{
      evolution:'CLOUD',
      canonicalSource:'GITHUB_MAIN',
      productionWriter:'CI_YML_ONLY',
      canonicalAdmission:'R125_ONLY',
      pcMayOverrideCloud:false,
    },
    cloud:{
      headSha:head,
      evolution:'CONTINUE_NON_BLOCKING',
      pcRequiredForEvolution:false,
      productionPromotion:proof==='SUCCESS'?'ELIGIBLE':'HELD_BY_EXISTING_PROOF_GATES',
      productionProof:proof,
    },
    pc:{
      online,
      stale:Boolean(pc?.stale===true),
      reportedCloudHeadSha:pcHead||null,
      resourceTier:tier,
      preference:pref,
      synchronization:!online?'DETACHED_NON_BLOCKING':exactHead?'CAUGHT_UP':'CATCH_UP_REQUIRED',
      catchupRequired,
      catchupTargetSha:catchupRequired?head:null,
      assistAdmissible,
      role:!online?'DETACHED':catchupRequired?'CATCH_UP':assistAdmissible?'ASSIST':'OBSERVE',
    },
    receiptLaw:{
      exactCloudHeadRequired:true,
      acceptAssistReceiptBaseSha:head,
      stalePcReceiptMustBeRejected:true,
      pcResultIsCanonicalAdmission:false,
    },
    invariants:[
      'CLOUD_EVOLUTION_NEVER_REQUIRES_PC_HEARTBEAT',
      'PC_RECONNECTS_BY_CATCHING_UP_TO_EXACT_CLOUD_HEAD',
      'PC_ASSIST_REQUIRES_EXACT_HEAD_AND_CURRENT_RESOURCE_PROOF',
      'STALE_PC_RESULTS_CANNOT_MUTATE_NEWER_CLOUD_STATE',
      'PC_ABSENCE_CANNOT_DOWNGRADE_CLOUD_BUILD_AUTHORITY',
      'EXISTING_PRODUCTION_AND_CANON_ADMISSION_GATES_REMAIN_IN_FORCE',
    ],
  });
}

export function admitPcAssistReceiptR251(receipt,continuity){
  if(continuity?.schema!==R251_CLOUD_HYBRID_CONTINUITY_CONTRACT) return {accepted:false,reason:'CONTINUITY_CONTRACT_REQUIRED'};
  if(!continuity.pc.assistAdmissible) return {accepted:false,reason:'PC_ASSIST_NOT_ADMISSIBLE'};
  if(String(receipt?.baseSha||'')!==continuity.cloud.headSha) return {accepted:false,reason:'STALE_OR_MISMATCHED_CLOUD_HEAD'};
  if(String(receipt?.deviceId||'').trim()==='') return {accepted:false,reason:'DEVICE_ID_REQUIRED'};
  return {accepted:true,reason:'EXACT_CLOUD_HEAD_ASSIST_RECEIPT',canonicalAdmission:false};
}
