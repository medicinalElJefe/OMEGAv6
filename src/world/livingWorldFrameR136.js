import {appendWorldEventR134,continuityOperationRefR134,R134_WORLD_ID} from './canonicalWorldContinuityR134.js';

export const R136_REVISION='R136';
export const R136_SCHEMA='OMEGA_LIVING_WORLD_FRAME_R136';
export const R136_LAWS=Object.freeze([
 'ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS',
 'CURRENT_EVIDENCE_PRECEDES_CURRENT_TRUTH',
 'MISSION_INTENT_IS_NOT_EXECUTION_PROOF',
 'FEDERATION_RETURN_IS_EVIDENCE_NOT_AUTHORITY',
 'HYBRID_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'RENDER_RECEIPT_IS_NOT_PHOTOREAL_PROOF_WITHOUT_DIRECT_RENDER_VALIDATION',
 'ADAPTIVE_PERFORMANCE_CHANGES_PROJECTION_COST_NOT_CANONICAL_AUTHORITY',
 'R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY',
 'OLD_DONORS_REMAIN_LINEAGE_EVIDENCE_ONLY'
]);
const text=(v,n=240)=>String(v??'').trim().slice(0,n);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const ids=(xs,limit=32)=>Array.isArray(xs)?xs.map(x=>text(x,160)).filter(Boolean).slice(-limit):[];

export function hybridTruthR136(hybrid={}){
 const online=(hybrid.devices||[]).filter(d=>d?.online===true&&d?.revoked!==true);
 const proved=hybrid.nativeExecutionClaimed===true&&online.length>0;
 return{state:proved?'CURRENT_EXECUTION_PROOF':'DEVICE_PROOF_REQUIRED',proved,deviceIds:online.map(d=>text(d.id,160)).filter(Boolean),authority:'HOST_EXECUTION_EVIDENCE_NOT_CANON'};
}

export function adaptiveProfileR136(input={}){
 const load=clamp(input.load,0,1),latency=clamp(input.latencyPressure,0,1),evidence=clamp(input.evidence,0,1);
 const pressure=(load+latency)/2;
 if(pressure>.78)return{profile:'SURVIVAL',lod:'LOW',sampleBudget:144,reason:'bounded load/latency pressure'};
 if(pressure>.48)return{profile:'BALANCED',lod:'MEDIUM',sampleBudget:1728,reason:'moderate runtime pressure'};
 return{profile:evidence>.72?'EVIDENCE_RICH':'VISUAL_FIRST',lod:'HIGH',sampleBudget:20736,reason:evidence>.72?'current evidence supports richer projection':'default visual-first projection'};
}

function eventBase(frame,kind,sequence){return{kind,sequence,eventTime:frame.eventTime,observerId:frame.observerId,projection:frame.projection,address:frame.address,intentId:frame.intentId,missionId:frame.missionId,metrics:frame.metrics,claim:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false}}}

export async function assembleLivingWorldFrameR136(input={}){
 const frame={
  eventTime:clamp(input.eventTime,0,Number.MAX_SAFE_INTEGER),observerId:text(input.observerId,160)||'observer-unknown',projection:text(input.projection,48).toUpperCase()||'FIELD',address:clamp(input.address,0,20735),
  intentId:text(input.intent?.id,160)||null,missionId:text(input.mission?.id,160)||null,
  metrics:{continuity:clamp(input.metrics?.continuity,0,1),plasticity:clamp(input.metrics?.plasticity,0,1),contradiction:clamp(input.metrics?.contradiction,0,1),burden:clamp(input.metrics?.burden,0,1),evidence:clamp(input.metrics?.evidence,0,1),uncertainty:clamp(input.metrics?.uncertainty,0,1),scar:clamp(input.metrics?.scar,0,1)}
 };
 const hybrid=hybridTruthR136(input.hybrid||{}),performance=adaptiveProfileR136(input.performance||{}),events=[];
 if(input.intent||input.mission)events.push({...eventBase(frame,'MISSION',events.length),sourceIds:ids(input.intent?.sourceIds),proofIds:[],scarIds:ids(input.mission?.scarIds),payloadDigest:text(input.mission?.planDigest,160)||null});
 if(input.earth?.observed===true)events.push({...eventBase(frame,'OBSERVATION',events.length),sourceIds:ids(input.earth.sourceIds),proofIds:ids(input.earth.proofIds),scarIds:ids(input.earth.scarIds),payloadDigest:text(input.earth.payloadDigest,160)||null});
 if(input.federation?.returned===true)events.push({...eventBase(frame,'FEDERATION_RETURN',events.length),federationNode:text(input.federation.node,160)||null,sourceIds:ids(input.federation.sourceIds),proofIds:ids(input.federation.proofIds),scarIds:ids(input.federation.scarIds),payloadDigest:text(input.federation.payloadDigest,160)||null});
 if(input.render?.receipt===true)events.push({...eventBase(frame,'RENDER_RECEIPT',events.length),sourceIds:ids(input.render.sourceIds),proofIds:ids(input.render.proofIds),scarIds:ids(input.render.scarIds),payloadDigest:text(input.render.payloadDigest,160)||null,claim:{...eventBase(frame,'RENDER_RECEIPT',0).claim,computedPhotorealRealityProved:input.render.directPhotorealValidation===true&&ids(input.render.proofIds).length>0}});
 if(hybrid.proved)events.push({...eventBase(frame,'PROOF',events.length),sourceIds:hybrid.deviceIds,proofIds:ids(input.hybrid?.proofIds),scarIds:[],payloadDigest:text(input.hybrid?.resultFingerprint,160)||null,claim:{...eventBase(frame,'PROOF',0).claim,pcOnlineProved:true}});
 let head=input.previousHead||null;const receipts=[];for(const event of events){head=await appendWorldEventR134(head,event);receipts.push(head.lastEvent)}
 return{ok:true,schema:R136_SCHEMA,revision:R136_REVISION,worldId:R134_WORLD_ID,frame:{...frame,performance,hybrid},events:receipts,head,operationRef:continuityOperationRefR134(head),visualState:{projection:frame.projection,address:frame.address,lod:performance.lod,sampleBudget:performance.sampleBudget,truthBands:{mission:input.mission?'INTENT_ASSEMBLED_NOT_EXECUTION_PROOF':'NONE',earth:input.earth?.observed===true?'OBSERVED_EVIDENCE':'UNPROVED',federation:input.federation?.returned===true?'RETURNED_EVIDENCE_NOT_CANON':'NONE',hybrid:hybrid.state,render:input.render?.receipt===true?(input.render.directPhotorealValidation===true&&ids(input.render.proofIds).length>0?'DIRECT_RENDER_PROOF_PRESENT':'RENDER_RECEIPT_NOT_PHOTOREAL_PROOF'):'NONE'}},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R136 assembles current intent, observation, federation, Hybrid and render evidence into one replayable visual-first world frame and R134 scar/proof chain. It changes projection cost adaptively but does not mutate CanonState or elevate donor, mission, federation, host, render, deployment or solver claims without their direct proof.'};
}
