import {appendWorldEventR134,R134_WORLD_ID} from './canonicalWorldContinuityR134.js';

export const R182_REVISION='R182';
export const R182_SCHEMA='OMEGA_VERIFIED_EXECUTION_WORLD_RECONCILER_R182';
export const R182_LAWS=Object.freeze([
 'ONLY_R180_VERIFIED_R146_RETURNS_ENTER_WORLD_PROOF_CONTINUITY',
 'RETURNED_IS_NOT_VERIFIED',
 'R146_VERIFIED_OPERATION_IS_CONTINUITY_EVIDENCE_NOT_DOMAIN_SCIENTIFIC_VALIDITY',
 'R134_REMAINS_WORLD_SCAR_AND_PROOF_CONTINUITY_AUTHORITY',
 'R125_REMAINS_ONLY_CANONSTATE_ADMISSION_AUTHORITY',
 'NO_PC_ONLINE_SOLVER_VALIDITY_FEDERATION_CLOSURE_DEPLOYMENT_OR_PHOTOREAL_INFERENCE'
]);
const safe=(v,n=180)=>String(v??'').trim().replace(/[^A-Za-z0-9._:-]/g,'-').slice(0,n);
const validR180=x=>Boolean(x?.ok===true&&x?.schema==='OMEGA_LIVING_WORLD_EXECUTION_DISPATCH_R180'&&x?.revision==='R180'&&x?.worldId===R134_WORLD_ID&&x?.canonicalMutation===false&&x?.canonicalAdmissionAuthority==='R125'&&Array.isArray(x?.results));
const verifiedResult=x=>Boolean(x?.verified===true&&x?.returned===true&&x?.executionInvoked===true&&x?.state==='VERIFIED'&&safe(x?.runId)&&safe(x?.headSha256));

export async function reconcileVerifiedExecutionReturnsR182(previousWorld,r180={},input={}){
 if(!validR180(r180))return{ok:false,status:400,code:'R182_VALID_R180_DISPATCH_RECEIPT_REQUIRED',world:previousWorld||null,appended:0,canonicalMutation:false,canonicalAdmissionAuthority:'R125',claims:zeroClaims()};
 const accepted=r180.results.filter(verifiedResult);
 let world=previousWorld||null;
 const receipts=[];
 for(let i=0;i<accepted.length;i++){
  const result=accepted[i];
  const runId=safe(result.runId),head=safe(result.headSha256),executorId=safe(result.executorId)||'executor-unknown';
  world=await appendWorldEventR134(world,{
   kind:'PROOF',sequence:(world?.count||0)+1,eventTime:Number(input.eventTime)||0,observerId:'r182-execution-return',projection:'EXECUTION',missionId:safe(r180.sourceMissionId)||null,
   sourceIds:[runId,executorId],proofIds:[`r146-head:${head}`],scarIds:[`verified-run:${runId}`],
   metrics:{continuity:1,plasticity:0.5,contradiction:0,burden:0,evidence:1,uncertainty:0,scar:1},
   payloadDigest:head,claim:zeroClaims()
  });
  receipts.push(world.lastEvent);
 }
 return{ok:true,status:200,schema:R182_SCHEMA,revision:R182_REVISION,state:accepted.length?'VERIFIED_RETURNS_APPENDED_TO_WORLD_CONTINUITY':'NO_NEW_VERIFIED_RETURN',worldId:R134_WORLD_ID,sourceMissionId:r180.sourceMissionId||null,acceptedRunIds:accepted.map(x=>safe(x.runId)),rejectedRunIds:r180.results.filter(x=>!verifiedResult(x)).map(x=>safe(x.runId)).filter(Boolean),appended:accepted.length,world,receipts,canonicalMutation:false,canonicalAdmissionAuthority:'R125',claims:zeroClaims(),truthBoundary:'R182 appends only R180-reported R146 VERIFIED operation returns into the existing R134 proof/scar continuity. This records durable execution evidence; it does not establish scientific solver validity, current PC-online state, federation closure, public deployment, Earth truth, computed-photoreal reality, or CanonState admission.'};
}
function zeroClaims(){return{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,federationClosedProved:false,earthTruthProved:false};}
export function manifestR182(){return{ok:true,schema:'OMEGA_VERIFIED_EXECUTION_WORLD_RECONCILER_MANIFEST_R182',revision:R182_REVISION,inherits:['R180 explicit living-world execution dispatch','R146 durable VERIFIED lifecycle','R134 canonical-world scar/proof continuity','R125 canonical admission'],laws:R182_LAWS,worldAuthority:'R134',executionLifecycleAuthority:'R146',dispatchAuthority:'R147',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};}
