import {emitOperationR86,type OmegaOperationR86} from '../omegaOperationBusR86';

export const R186_REVISION='R186' as const;
export const R186_SCHEMA='OMEGA_VERIFIED_RETURN_WORLD_INGRESS_R186' as const;
export const R186_LAWS=Object.freeze([
 'ONLY_R180_R146_VERIFIED_RETURNS_EMIT_WORLD_INGRESS',
 'R86_R140_R136_R134_REMAIN_THE_EXISTING_LIVE_WORLD_PATH',
 'R146_HEAD_AND_RUN_ID_ARE_CARRIED_AS_PROOF_AND_SCAR_LINEAGE',
 'DUPLICATE_VERIFIED_HEADS_DO_NOT_MANUFACTURE_DUPLICATE_WORLD_SCARS',
 'EXECUTION_VERIFICATION_IS_NOT_SOLVER_SCIENTIFIC_VALIDITY_OR_EXTERNAL_EMPIRICAL_TRUTH',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'
]);
const KEY='omega.r186.ingestedVerifiedHeads';
const safe=(v:unknown,n=180)=>String(v??'').trim().replace(/[^A-Za-z0-9._:-]/g,'-').slice(0,n);
const verified=(x:any)=>Boolean(x?.verified===true&&x?.returned===true&&x?.executionInvoked===true&&x?.state==='VERIFIED'&&safe(x?.runId)&&safe(x?.headSha256));
function readHeads(){if(typeof localStorage==='undefined')return new Set<string>();try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return new Set(Array.isArray(rows)?rows.map(x=>safe(x)).filter(Boolean).slice(-128):[])}catch{return new Set<string>()}}
function saveHeads(heads:Set<string>){if(typeof localStorage==='undefined')return;try{localStorage.setItem(KEY,JSON.stringify([...heads].slice(-128)))}catch{}}

export async function emitVerifiedReturnWorldIngressR186(r180:any):Promise<{ok:boolean;schema:string;revision:string;emitted:number;duplicates:number;rejected:number;events:OmegaOperationR86[];canonicalMutation:false;canonicalAdmissionAuthority:'R125';claims:Record<string,boolean>}>{
 const valid=Boolean(r180?.ok===true&&r180?.schema==='OMEGA_LIVING_WORLD_EXECUTION_DISPATCH_R180'&&r180?.revision==='R180'&&r180?.worldId==='OMEGA_CANONICAL_WORLD'&&r180?.canonicalMutation===false&&r180?.canonicalAdmissionAuthority==='R125'&&Array.isArray(r180?.results));
 const claims={publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,federationClosedProved:false,earthTruthProved:false};
 if(!valid)return{ok:false,schema:R186_SCHEMA,revision:R186_REVISION,emitted:0,duplicates:0,rejected:0,events:[],canonicalMutation:false,canonicalAdmissionAuthority:'R125',claims};
 const heads=readHeads(),events:OmegaOperationR86[]=[];let duplicates=0,rejected=0;
 for(const result of r180.results){
  if(!verified(result)){rejected++;continue}
  const runId=safe(result.runId),head=safe(result.headSha256);if(heads.has(head)){duplicates++;continue}
  const event=await emitOperationR86({type:'PROOF_REFRESHED',surface:'Evidence & Proof',status:'PASS',detail:`R186 accepted VERIFIED R146 return ${runId} into existing living-world proof continuity.`,payload:{sourceIds:[runId],proofIds:[`r146-head:${head}`],scarIds:[`verified-run:${runId}`],payloadDigest:head,evidence:1,uncertainty:0,continuity:1,plasticity:.5,contradiction:0,burden:0,scar:1,verifiedExecutionReturn:true,executionLifecycleAuthority:'R146',dispatchAuthority:'R147',worldAuthority:'R134',canonicalAdmissionAuthority:'R125',publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,federationClosedProved:false,earthTruthProved:false}});
  heads.add(head);events.push(event);
 }
 saveHeads(heads);
 return{ok:true,schema:R186_SCHEMA,revision:R186_REVISION,emitted:events.length,duplicates,rejected,events,canonicalMutation:false,canonicalAdmissionAuthority:'R125',claims};
}

export function manifestR186(){return{schema:R186_SCHEMA,revision:R186_REVISION,laws:R186_LAWS,ingressAuthority:'R86',worldBridge:'R140',visualWorldAuthority:'R136/R134',executionLifecycleAuthority:'R146',dispatchAuthority:'R147',canonicalAdmissionAuthority:'R125',canonicalMutation:false,truthBoundary:'R186 automatically feeds only already-VERIFIED R180/R146 returns into the existing R86→R140→R136→R134 live-world path. It records execution proof/scar continuity and does not infer public deployment, PC-online state, solver scientific validity, federation closure, Earth truth, computed-photoreal reality, or CanonState admission.'};}
