/** R620: cross-version capability continuity with explicit production evidence. */
const VALID=new Set(['SUPERSEDED','INTENTIONALLY_DEPRECATED','PLATFORM_SPECIFIC','QUARANTINED']);
const LIVE=new Set(['PRODUCTION_BEHAVIOR','TARGET_RUNTIME_READBACK']);
const id=x=>x?.identity?.id;
const runnable=x=>x?.currentExecutor?.routable===true&&nonempty(x?.currentExecutor?.route)&&['EXECUTES_NOW','EXECUTES_AS_ADAPTER'].includes(x?.strongestImplementation?.state);
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const STATES=new Set(['EXECUTES_NOW','EXECUTES_AS_ADAPTER','TRUTH_GATED']);
const validNode=x=>nonempty(id(x))&&nonempty(x?.lineage?.sourceBindingId)&&nonempty(x?.strongestImplementation?.id)&&STATES.has(x?.strongestImplementation?.state)&&nonempty(x?.evidence?.truthClass)&&typeof x?.currentExecutor?.routable==='boolean'&&(!x.currentExecutor.routable||nonempty(x.currentExecutor.route))&&x.currentExecutor.admissionAuthority==='R125'&&x.currentExecutor.receiptAuthority==='R142'&&x?.canonicalMutation!==true&&x?.presentationSurface?.definesCapability!==true&&typeof x?.presentationSurface?.generatedFromCapability==='boolean'&&typeof x?.presentationSurface?.route==='string'&&(!x.presentationSurface.generatedFromCapability||nonempty(x.presentationSurface.route));
const boundProof=(p,now)=>validNode(now)&&!!p&&LIVE.has(p.type)&&nonempty(p.evidenceId)&&p.implementationId===now.strongestImplementation?.id&&p.sourceBindingId===now.lineage?.sourceBindingId;
const visible=x=>x?.presentationSurface?.generatedFromCapability===true&&!!x?.presentationSurface?.route;
const unique=xs=>[...new Set(xs)].sort();
const listKey=xs=>Array.isArray(xs)?JSON.stringify(unique(xs)):'MISSING';
const changed=(a,b)=>a!==b;
const listChanged=(a,b)=>listKey(a)!==listKey(b);
export function auditCapabilityContinuityR620({previous,candidate,dispositions={},proofs={}}){
 if(!Array.isArray(previous)||!Array.isArray(candidate))throw new TypeError('Graphs must be arrays');
 if([...previous,...candidate].some(x=>!id(x)))throw new TypeError('Capability identity.id required');
 const duplicates=xs=>unique(xs.map(id).filter((v,i,a)=>a.indexOf(v)!==i));
 const duplicateHistorical=duplicates(previous),duplicateCurrent=duplicates(candidate);
 const invalidHistorical=previous.filter(x=>!validNode(x)).map(id),invalidCurrent=candidate.filter(x=>!validNode(x)).map(id);
 const current=new Map(candidate.map(x=>[id(x),x]));
 const missing=[],executorLost=[],executorRoutabilityChanged=[],presentationGenerationChanged=[],executionDowngraded=[],executionStateChanged=[],executionContractChanged=[],presentationLost=[],presentationRouteChanged=[],implementationChanged=[],executorRouteChanged=[],sourceBindingChanged=[],truthClassChanged=[],evidenceRequirementsChanged=[],dependenciesChanged=[],scarPolicyChanged=[],remainingGapChanged=[],capabilityDefinitionChanged=[],lineageStructureChanged=[],implementationSelectionChanged=[],truthGated=[],unproven=[],invalidResolutions=[],declaredResolutions=[];
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
  // A route's presence is not authority to make an executor newly runnable.
  if(old.currentExecutor?.routable!==now.currentExecutor?.routable)executorRoutabilityChanged.push(key);
  // Source-derived presentation authority is distinct from a matching URL.
  if(old.presentationSurface?.generatedFromCapability!==now.presentationSurface?.generatedFromCapability)presentationGenerationChanged.push(key);
  if(old.strongestImplementation?.state==='EXECUTES_NOW'&&now.strongestImplementation?.state==='EXECUTES_AS_ADAPTER')executionDowngraded.push(key);
  // Even an apparent upgrade from TRUTH_GATED to EXECUTES_NOW requires a reviewed executor/proof transition.
  if(old.strongestImplementation?.state!==now.strongestImplementation?.state)executionStateChanged.push(key);
  if(visible(old)&&!visible(now))presentationLost.push(key);
  if(visible(old)&&visible(now)&&old.presentationSurface.route!==now.presentationSurface.route)presentationRouteChanged.push(key);
  if(old.strongestImplementation?.id!==now.strongestImplementation?.id)implementationChanged.push(key);
  if(old.currentExecutor?.route!==now.currentExecutor?.route)executorRouteChanged.push(key);
  if(['operation','capabilityId','executionDomain','reality'].some(field=>old.currentExecutor?.[field]!==now.currentExecutor?.[field])||old.strongestImplementation?.operation!==now.strongestImplementation?.operation)executionContractChanged.push(key);
  if(old.lineage?.sourceBindingId!==now.lineage?.sourceBindingId)sourceBindingChanged.push(key);
  if(old.evidence?.truthClass!==now.evidence?.truthClass)truthClassChanged.push(key);
  if(listKey(old.evidence?.requirements)!==listKey(now.evidence?.requirements))evidenceRequirementsChanged.push(key);
  if(listKey(old.dependencies)!==listKey(now.dependencies))dependenciesChanged.push(key);
  if(old.supersession?.scarPolicy!==now.supersession?.scarPolicy)scarPolicyChanged.push(key);
  if(old.remainingGap!==now.remainingGap)remainingGapChanged.push(key);
  // Preserve the meaning and provenance of a capability, not merely its identifier and executor route.
  if(['function','pillar','primaryKind'].some(field=>changed(old[field],now[field]))||listChanged(old.artifactKinds,now.artifactKinds))capabilityDefinitionChanged.push(key);
  if(changed(old.lineage?.domain,now.lineage?.domain)||listChanged(old.lineage?.predecessors,now.lineage?.predecessors)||listChanged(old.lineage?.relations,now.lineage?.relations)||listChanged(old.supersession?.predecessors,now.supersession?.predecessors))lineageStructureChanged.push(key);
  if(['route','selectionRule'].some(field=>changed(old.strongestImplementation?.[field],now.strongestImplementation?.[field])))implementationSelectionChanged.push(key);
  if(now.strongestImplementation?.state==='TRUTH_GATED')truthGated.push(key);
 }
 // New capabilities need proof references too: previous-only enumeration silently admitted additions.
 for(const now of candidate)if(!boundProof(proofs[id(now)],now))unproven.push(id(now));
 // A caller's supersession/deprecation declaration is not authenticated governance.
 // Missing historical identities therefore cannot pass conservation admission.
 const structurePass=!invalidHistorical.length&&!invalidCurrent.length&&!duplicateHistorical.length&&!duplicateCurrent.length&&!executorLost.length&&!executorRoutabilityChanged.length&&!presentationGenerationChanged.length&&!executionDowngraded.length&&!executionStateChanged.length&&!executionContractChanged.length&&!evidenceRequirementsChanged.length&&!dependenciesChanged.length&&!scarPolicyChanged.length&&!remainingGapChanged.length&&!capabilityDefinitionChanged.length&&!lineageStructureChanged.length&&!implementationSelectionChanged.length&&!presentationLost.length&&!presentationRouteChanged.length&&!implementationChanged.length&&!executorRouteChanged.length&&!sourceBindingChanged.length&&!truthClassChanged.length&&!invalidResolutions.length&&!missing.length;
 return Object.freeze({schema:'OMEGA_CAPABILITY_CONTINUITY_AUDIT_R620',baselineCount:previous.length,currentCount:candidate.length,
  invalidHistorical:unique(invalidHistorical),invalidCurrent:unique(invalidCurrent),duplicateHistorical,duplicateCurrent,missing:unique(missing),executorLost:unique(executorLost),executorRoutabilityChanged:unique(executorRoutabilityChanged),presentationGenerationChanged:unique(presentationGenerationChanged),
  executionDowngraded:unique(executionDowngraded),executionStateChanged:unique(executionStateChanged),executionContractChanged:unique(executionContractChanged),presentationLost:unique(presentationLost),
  presentationRouteChanged:unique(presentationRouteChanged),implementationChanged:unique(implementationChanged),executorRouteChanged:unique(executorRouteChanged),
  sourceBindingChanged:unique(sourceBindingChanged),truthClassChanged:unique(truthClassChanged),
  evidenceRequirementsChanged:unique(evidenceRequirementsChanged),dependenciesChanged:unique(dependenciesChanged),scarPolicyChanged:unique(scarPolicyChanged),remainingGapChanged:unique(remainingGapChanged),
  capabilityDefinitionChanged:unique(capabilityDefinitionChanged),lineageStructureChanged:unique(lineageStructureChanged),implementationSelectionChanged:unique(implementationSelectionChanged),
  truthGated:unique(truthGated),unproven:unique(unproven),
  invalidResolutions:unique(invalidResolutions),declaredResolutions:unique(declaredResolutions),
  dispositionAuthority:'UNVERIFIED_CALLER_SUPPLIED_GOVERNANCE_REFERENCES',
  structurePass,proofReferencesComplete:structurePass&&!unproven.length&&!missing.length,
  productionProven:false,proofAuthority:'UNVERIFIED_CALLER_SUPPLIED_REFERENCES',
  requiresIndependentProductionReadback:true,
  rule:'Caller-supplied proof references are untrusted until authenticated external runtime verification; graph presence and CI never prove deployment.'});
}
