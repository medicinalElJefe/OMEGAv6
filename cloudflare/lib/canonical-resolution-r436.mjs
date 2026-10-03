export const R436_CLOUD_SCHEMA='OMEGA_CLOUD_CANDIDATE_RESOLUTION_R436';
const GENESIS='00000000';
const fnv=input=>{let h=2166136261;for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')};
const stable=value=>JSON.stringify(value,Object.keys(value||{}).sort());
const hash=value=>fnv(stable(value));

function chain(events){
 let previousHash=GENESIS;
 const rows=events.map((event,index)=>{
  const payload=event.payload||{};
  const row={index,kind:event.kind,previousHash,payload};
  const eventHash=hash(row);
  previousHash=eventHash;
  return{...row,hash:eventHash};
 });
 return{rows,hash:previousHash};
}

export function cloudCandidateResolutionR436(candidate){
 const repair=candidate?.repair||{};
 const scars=[
  ...(Array.isArray(repair.rejectionScars)?repair.rejectionScars:[]),
  ...(Array.isArray(repair.declinedItemScars)?repair.declinedItemScars:[])
 ];
 const paths=Array.isArray(repair.paths)?repair.paths:[];
 const status=String(candidate?.status||'OBSERVE_ONLY');
 const sourceAdvance=candidate?.sourceAdvance===true||paths.length>0;
 const branchStatus=/DECLINE_SCARS|OBSERVE_ONLY/.test(status)?'OBSERVE_ONLY':/HOLD|PENDING_PROOF/.test(status)?'BOUNDED':'ACTIVE';
 const nodeBase={
  schema:R436_CLOUD_SCHEMA,
  revision:'R436.0',
  domain:'CLOUD_CANDIDATE',
  machineId:candidate?.machineId||null,
  candidateSchema:candidate?.schema||null,
  candidateRevision:candidate?.revision||null,
  generatorContract:candidate?.generatorContract||null,
  itemId:candidate?.item?.id||repair?.residualId||null,
  paths,
  expectedProofs:Array.isArray(repair.expectedProofs)?repair.expectedProofs:[],
  status,
  sourceAdvance,
  canonicalAdmission:false,
  directProductionMutation:false,
  authority:'DERIVED_STANDARD',
  proofClass:'STRUCTURAL_ANALOGY'
 };
 const nodeId='NODE-'+hash(nodeBase);
 const checks=[
  {id:'NO_DIRECT_CANON_ADMISSION',kind:'CANON',passed:candidate?.canonicalAdmission!==true,reason:'CLOUD-01 proposal cannot directly admit CanonState'},
  {id:'NO_DIRECT_PRODUCTION_MUTATION',kind:'CANON',passed:candidate?.directProductionMutation!==true,reason:'production authority remains the governed deployment workflow'},
  {id:'PROOF_REQUIRED_FOR_SOURCE_ADVANCE',kind:'CANON',passed:!sourceAdvance||status.includes('PENDING_PROOF')||Boolean(candidate?.receipt),reason:'source-advance candidates remain proof-bound'}
 ];
 const failed=checks.filter(x=>!x.passed);
 const finalStatus=failed.length?'REJECTED_CANON':branchStatus;
 const branchBase={
  nodeId,
  status:finalStatus,
  authority:'DERIVED_STANDARD',
  proofClass:'STRUCTURAL_ANALOGY',
  paths,
  rejectionScarCount:scars.length,
  canonicalAdmissionAuthority:'R125',
  sourcePromotionAuthority:'R240/exact-head governed proof',
  productionAuthority:candidate?.deploymentAuthority||'GOVERNED_PRODUCTION_WORKFLOW',
  canonicalMutation:false
 };
 const branchId='BRANCH-'+hash(branchBase);
 const events=[
  {kind:'NODE',payload:{nodeId,status,paths,itemId:nodeBase.itemId}},
  {kind:'BRANCH',payload:{branchId,status:finalStatus,sourceAdvance,canonicalAdmission:false}},
  ...scars.map((scar,index)=>({kind:'SCAR',payload:{branchId,index,scar}})),
  ...failed.map(check=>({kind:'SCAR',payload:{branchId,check:check.id,reason:check.reason}}))
 ];
 const ledger=chain(events);
 return{
  schema:R436_CLOUD_SCHEMA,
  revision:'R436.0',
  domain:'CLOUD_CANDIDATE',
  node:{...nodeBase,nodeId},
  transition:null,
  branch:{...branchBase,branchId},
  checks,
  ledger:ledger.rows,
  ledgerHash:ledger.hash,
  truthBoundary:'CLOUD-01 may propose bounded source candidates and carry rejection scars, but it cannot directly admit CanonState or mutate production. Exact-head proof and existing governed promotion/deployment authorities remain unchanged.',
  canonicalMutation:false
 };
}
