/** R620: cross-version capability continuity with explicit production evidence. */
const VALID=new Set(['SUPERSEDED','INTENTIONALLY_DEPRECATED','PLATFORM_SPECIFIC','QUARANTINED']);
const LIVE=new Set(['PRODUCTION_BEHAVIOR','TARGET_RUNTIME_READBACK']);
const id=x=>x?.identity?.id;
const runnable=x=>x?.currentExecutor?.routable===true&&['EXECUTES_NOW','EXECUTES_AS_ADAPTER'].includes(x?.strongestImplementation?.state);
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const STATES=new Set(['EXECUTES_NOW','EXECUTES_AS_ADAPTER','TRUTH_GATED']);
const validNode=x=>nonempty(id(x))&&nonempty(x?.lineage?.sourceBindingId)&&nonempty(x?.strongestImplementation?.id)&&STATES.has(x?.strongestImplementation?.state)&&nonempty(x?.evidence?.truthClass)&&typeof x?.currentExecutor?.routable==='boolean'&&typeof x?.presentationSurface?.generatedFromCapability==='boolean'&&typeof x?.presentationSurface?.route==='string';
const boundProof=(p,now)=>validNode(now)&&!!p&&LIVE.has(p.type)&&nonempty(p.evidenceId)&&p.implementationId===now.strongestImplementation?.id&&p.sourceBindingId===now.lineage?.sourceBindingId;
const visible=x=>x?.presentationSurface?.generatedFromCapability===true&&!!x?.presentationSurface?.route;
const unique=xs=>[...new Set(xs)].sort();
export function auditCapabilityContinuityR620({previous,candidate,dispositions={},proofs={}}){
 if(!Array.isArray(previous)||!Array.isArray(candidate))throw new TypeError('Graphs must be arrays');
 if([...previous,...candidate].some(x=>!id(x)))throw new TypeError('Capability identity.id required');
 const duplicates=xs=>unique(xs.map(id).filter((v,i,a)=>a.indexOf(v)!==i));
 const duplicateHistorical=duplicates(previous),duplicateCurrent=duplicates(candidate);
 const invalidHistorical=previous.filter(x=>!validNode(x)).map(id),invalidCurrent=candidate.filter(x=>!validNode(x)).map(id);
 const current=new Map(candidate.map(x=>[id(x),x]));
 const missing=[],executorLost=[],executionDowngraded=[],presentationLost=[],sourceBindingChanged=[],truthClassChanged=[],truthGated=[],unproven=[],invalidResolutions=[],declaredResolutions=[];
 for(const old of previous){
  const key=id(old),now=current.get(key);
  if(!now){
   missing.push(key);
   const d=dispositions[key];
   if(!d||!VALID.has(d.status)||!nonempty(d.evidenceId)||!nonempty(d.approver)||(d.status==='SUPERSEDED'&&(!d.replacementId||!current.has(d.replacementId))))invalidResolutions.push(key);
   else declaredResolutions.push(key);
   continue;
  }
  if(runnable(old)&&!runnable(now))executorLost.push(key);
  if(old.strongestImplementation?.state==='EXECUTES_NOW'&&now.strongestImplementation?.state==='EXECUTES_AS_ADAPTER')executionDowngraded.push(key);
  if(visible(old)&&!visible(now))presentationLost.push(key);
  if(old.lineage?.sourceBindingId!==now.lineage?.sourceBindingId)sourceBindingChanged.push(key);
  if(old.evidence?.truthClass!==now.evidence?.truthClass)truthClassChanged.push(key);
  if(now.strongestImplementation?.state==='TRUTH_GATED')truthGated.push(key);
 }
 // New capabilities need proof references too: previous-only enumeration silently admitted additions.
 for(const now of candidate)if(!boundProof(proofs[id(now)],now))unproven.push(id(now));
 const structurePass=!invalidHistorical.length&&!invalidCurrent.length&&!duplicateHistorical.length&&!duplicateCurrent.length&&!executorLost.length&&!executionDowngraded.length&&!presentationLost.length&&!sourceBindingChanged.length&&!truthClassChanged.length&&!invalidResolutions.length;
 return Object.freeze({schema:'OMEGA_CAPABILITY_CONTINUITY_AUDIT_R620',baselineCount:previous.length,currentCount:candidate.length,
  invalidHistorical:unique(invalidHistorical),invalidCurrent:unique(invalidCurrent),duplicateHistorical,duplicateCurrent,missing:unique(missing),executorLost:unique(executorLost),
  executionDowngraded:unique(executionDowngraded),presentationLost:unique(presentationLost),
  sourceBindingChanged:unique(sourceBindingChanged),truthClassChanged:unique(truthClassChanged),
  truthGated:unique(truthGated),unproven:unique(unproven),
  invalidResolutions:unique(invalidResolutions),declaredResolutions:unique(declaredResolutions),
  dispositionAuthority:'UNVERIFIED_CALLER_SUPPLIED_GOVERNANCE_REFERENCES',
  structurePass,proofReferencesComplete:structurePass&&!unproven.length&&!missing.length,
  productionProven:false,proofAuthority:'UNVERIFIED_CALLER_SUPPLIED_REFERENCES',
  requiresIndependentProductionReadback:true,
  rule:'Graph membership, CI, archive, route and target-runtime proof are separate evidence classes.'});
}
