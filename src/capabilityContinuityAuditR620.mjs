/** R620: cross-version capability continuity with explicit production evidence. */
const VALID=new Set(['SUPERSEDED','INTENTIONALLY_DEPRECATED','PLATFORM_SPECIFIC','QUARANTINED']);
const LIVE=new Set(['PRODUCTION_BEHAVIOR','TARGET_RUNTIME_READBACK']);
const id=x=>x?.identity?.id;
const runnable=x=>x?.currentExecutor?.routable===true&&x?.strongestImplementation?.state!=='TRUTH_GATED';
const visible=x=>x?.presentationSurface?.generatedFromCapability===true&&!!x?.presentationSurface?.route;
const unique=xs=>[...new Set(xs)].sort();
export function auditCapabilityContinuityR620({previous,candidate,dispositions={},proofs={}}){
 if(!Array.isArray(previous)||!Array.isArray(candidate))throw new TypeError('Graphs must be arrays');
 if([...previous,...candidate].some(x=>!id(x)))throw new TypeError('Capability identity.id required');
 const duplicates=xs=>unique(xs.map(id).filter((v,i,a)=>a.indexOf(v)!==i));
 const duplicateHistorical=duplicates(previous),duplicateCurrent=duplicates(candidate);
 const current=new Map(candidate.map(x=>[id(x),x]));
 const missing=[],executorLost=[],presentationLost=[],truthGated=[],unproven=[],invalidResolutions=[],provenResolutions=[];
 for(const old of previous){
  const key=id(old),now=current.get(key),p=proofs[key];
  if(!now){
   missing.push(key);
   const d=dispositions[key];
   if(!d||!VALID.has(d.status)||!d.evidenceId||!d.approver||(d.status==='SUPERSEDED'&&(!d.replacementId||!current.has(d.replacementId))))invalidResolutions.push(key);
   else provenResolutions.push(key);
   continue;
  }
  if(runnable(old)&&!runnable(now))executorLost.push(key);
  if(visible(old)&&!visible(now))presentationLost.push(key);
  if(now.strongestImplementation?.state==='TRUTH_GATED')truthGated.push(key);
  if(!p||!LIVE.has(p.type)||!p.evidenceId||p.implementationId!==now.strongestImplementation?.id||p.sourceBindingId!==now.lineage?.sourceBindingId)unproven.push(key);
 }
 const structurePass=!duplicateHistorical.length&&!duplicateCurrent.length&&!executorLost.length&&!presentationLost.length&&!invalidResolutions.length;
 return Object.freeze({schema:'OMEGA_CAPABILITY_CONTINUITY_AUDIT_R620',baselineCount:previous.length,currentCount:candidate.length,
  duplicateHistorical,duplicateCurrent,missing:unique(missing),executorLost:unique(executorLost),
  presentationLost:unique(presentationLost),truthGated:unique(truthGated),unproven:unique(unproven),
  invalidResolutions:unique(invalidResolutions),provenResolutions:unique(provenResolutions),
  structurePass,productionProven:structurePass&&!unproven.length&&!missing.length,
  rule:'Graph membership, CI, archive, route and target-runtime proof are separate evidence classes.'});
}
