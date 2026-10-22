export const R503_WORKER_PACKET_SCHEMA='OMEGA_CALCULUS_NATIVE_WORKER_PACKET_R503';
export const R503_WORKER_ATTESTATION_SCHEMA='OMEGA_CALCULUS_NATIVE_WORKER_ATTESTATION_R503';

export const R503_ARCHITECTURE_PILLARS=Object.freeze([
 'CANONICAL_STATE','CALCULUS','DEVELOPMENTAL_CONTINUITY','KNOWLEDGE_ATLASES','EXECUTION','RENDERING',
 'TRAVERSAL','MEMORY','INTELLIGENCE','APPLICATIONS','PROOF','RECOVERY',
]);
export const R503_DEVELOPMENTAL_OPERATORS=Object.freeze([
 'SENSE','NORMALIZE','PARTITION','INTERACT','TRANSFORM','CARRY','RECONTEXTUALIZE','SCORE','GATE','LEDGER',
 'PRUNE','TRANSLATE','PROVE','PROMOTE',
]);
export const R503_DECISION_LAW=Object.freeze(['STAY','TURN','ESCALATE']);
export const R503_DELTA_FIELDS=Object.freeze([
 'capabilityGain','coherenceGain','autonomyGain','usabilityGain','recoverabilityGain',
 'regressionRisk','duplicationRisk','authorityFragmentationRisk',
]);

const exactArray=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((v,i)=>v===b[i]);
const nonEmpty=v=>typeof v==='string'&&v.trim().length>0;
const bounded01=v=>Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=1;
const has=(text,needle)=>String(text||'').includes(needle);
const uniq=v=>[...new Set(Array.isArray(v)?v.map(String):[])];

export function buildCalculusNativeWorkerPacketR503({
 baseSha,
 capabilitySource,
 executionSource,
 heightenedLedger,
 selfBuildState,
 governedSource,
 sourceRefs={},
}={}){
 const reasons=[];
 const sha=String(baseSha||'');
 if(!/^[0-9a-f]{40}$/i.test(sha))reasons.push('R503_BASE_SHA_INVALID');
 if(!has(capabilitySource,'CAPABILITY_LINEAGE_NOT_ROUTE'))reasons.push('R503_CAPABILITY_LINEAGE_RULE_MISSING');
 if(!has(capabilitySource,'VIEWS_AND_TOOLS_ARE_GENERATED_FROM_CAPABILITIES_AND_NEVER_DEFINE_CANONICAL_CAPABILITY'))reasons.push('R503_PRESENTATION_RULE_MISSING');
 if(!has(capabilitySource,'STRONGEST_VALID_IMPLEMENTATION_NOT_NEWEST_IMPLEMENTATION'))reasons.push('R503_STRONGEST_IMPLEMENTATION_RULE_MISSING');
 if(!has(capabilitySource,'NO_CAPABILITY_MAY_DISAPPEAR_ACROSS_PROMOTION_WITHOUT_EXPLICIT_DISPOSITION_AND_EVIDENCE'))reasons.push('R503_CONSERVATION_RULE_MISSING');
 const capabilityCount=(String(executionSource||'').match(/\bB\('/g)||[]).length;
 if(capabilityCount<69)reasons.push('R503_CAPABILITY_CORPUS_NARROWED');
 if(heightenedLedger?.schema!=='OMEGA7_HEIGHTENED_DEVELOPMENTAL_LEDGER_R457')reasons.push('R503_HEIGHTENED_LEDGER_INVALID');
 if(heightenedLedger?.mode?.id!=='HEIGHTENED_MODE')reasons.push('R503_HEIGHTENED_MODE_MISSING');
 if(heightenedLedger?.mode?.newPhysicalPrimitive!==false||heightenedLedger?.mode?.physicalDimensionClaim!==false)reasons.push('R503_PHYSICAL_PRIMITIVE_BOUNDARY_INVALID');
 if(heightenedLedger?.resolutionBoundary?.classification!=='REPRESENTATIONAL_ADDRESS_RESOLUTION_ONLY')reasons.push('R503_RESOLUTION_BOUNDARY_INVALID');
 if(!exactArray(heightenedLedger?.developmentalLaw?.operators,R503_DEVELOPMENTAL_OPERATORS))reasons.push('R503_DEVELOPMENTAL_OPERATORS_DRIFT');
 if(!exactArray(heightenedLedger?.developmentalLaw?.decisionLaw,R503_DECISION_LAW))reasons.push('R503_DECISION_LAW_DRIFT');
 if(heightenedLedger?.developmentalLaw?.growthDefinition!=='INCREASE_IN_REACHABLE_COHERENT_LAWFUL_POSSIBILITY')reasons.push('R503_GROWTH_DEFINITION_DRIFT');
 if(heightenedLedger?.authority?.canonAdmission!=='R125'||heightenedLedger?.authority?.canonicalMutation!==false)reasons.push('R503_HEIGHTENED_AUTHORITY_DRIFT');
 if(selfBuildState?.schema!=='OMEGA_GOVERNED_SELFBUILD_STATE_R170'||selfBuildState?.active!==true)reasons.push('R503_SELFBUILD_STATE_INVALID');
 if(selfBuildState?.recursiveSchedulerRevision!=='R240'||selfBuildState?.exactSelfPromotionRevision!=='R240')reasons.push('R503_SOURCE_PROMOTION_AUTHORITY_DRIFT');
 if(!has(governedSource,"canonicalAdmissionAuthority!=='R125'")&&!has(governedSource,"canonicalAdmissionAuthority:'R125'"))reasons.push('R503_R125_GOVERNANCE_BOUNDARY_MISSING');
 if(!has(governedSource,"sourceAuthority!=='R164'"))reasons.push('R503_R164_RESIDUAL_AUTHORITY_MISSING');

 const contextId=[
  'R503',sha,heightenedLedger?.revision||'UNKNOWN',selfBuildState?.revision||'UNKNOWN',
  selfBuildState?.recursiveSchedulerRevision||'UNKNOWN',String(capabilityCount),
 ].join(':');

 const packet={
  schema:R503_WORKER_PACKET_SCHEMA,
  revision:'R503',
  contextId,
  baseSha:sha,
  sourceRefs:{...sourceRefs},
  architecture:{
   equation:'OMEGA = Canonical State + Calculus + Developmental Continuity + Knowledge/Atlases + Execution + Rendering + Traversal + Memory + Intelligence + Applications + Proof + Recovery',
   pillars:[...R503_ARCHITECTURE_PILLARS],
   convergenceUnit:'CAPABILITY_LINEAGE_NOT_ROUTE',
   selectionRule:'STRONGEST_VALID_IMPLEMENTATION_NOT_NEWEST_IMPLEMENTATION',
   conservationRule:'NO_CAPABILITY_MAY_DISAPPEAR_ACROSS_PROMOTION_WITHOUT_EXPLICIT_DISPOSITION_AND_EVIDENCE',
   presentationRule:'VIEWS_AND_TOOLS_ARE_GENERATED_FROM_CAPABILITIES_AND_NEVER_DEFINE_CANONICAL_CAPABILITY',
   capabilityCount,
  },
  calculus:{
   relationalLoop:['PARENT','INTERACTION','SCAR','CONTINUITY','COMPRESSION','SKIN','INTERPRETATION','BEHAVIOR'],
   proofSequence:['PRUNE','TRANSLATE','PROVE'],
   operators:[...R503_DEVELOPMENTAL_OPERATORS],
   decisionLaw:[...R503_DECISION_LAW],
   deweyScore:String(heightenedLedger?.developmentalLaw?.deweyScore||''),
   viability:String(heightenedLedger?.developmentalLaw?.viability||''),
   growthDefinition:String(heightenedLedger?.developmentalLaw?.growthDefinition||''),
  },
  authority:{
   canonAdmission:'R125',
   executionReceipt:'R142',
   residualEvidence:'R164',
   sourcePromotion:'R240',
   governedSelfBuild:'R170/R245',
   productionWriter:'ci.yml',
   capabilityLineage:'R474',
   heightenedDevelopmentalContinuity:'R457',
   rendererMayRewriteTruth:false,
   presentationDefinesCapability:false,
   canonicalMutation:false,
  },
  truthBoundaries:{
   newPhysicalPrimitiveAllowed:false,
   representationalAddressScaleIsPhysicalDimension:false,
   availabilityEqualsExecution:false,
   executionEqualsCanonAdmission:false,
   visualSimilarityIsDevelopmentalEquivalence:false,
   contradictionsAndRejectedBranchesRetained:true,
  },
  developmentalContinuity:{
   mode:'HEIGHTENED_MODE',
   classification:String(heightenedLedger?.mode?.classification||''),
   sequenceIsObjectOfAnalysis:true,
   presentAndFutureConeBothRequired:true,
   growthDefinition:String(heightenedLedger?.developmentalLaw?.growthDefinition||''),
   zeroLossRetirement:Boolean(heightenedLedger?.retirement?.zeroLossRequired),
   scarsRetained:heightenedLedger?.retention?.developmentalScars==='RETAIN',
  },
  workerContract:{
   coldStartRequired:true,
   chatHistoryMayNotBeRequired:true,
   exactBaseRequired:true,
   multipleAdmissibleCandidatesRequired:true,
   residualEvidenceRequired:true,
   developmentalDeltaRequired:true,
   vetoesBeforeMutation:true,
   proofAfterMutation:true,
   returnedOutcomeMustBecomeScarOrEvidence:true,
   unqualifiedWorkerMutationAllowed:false,
  },
  coldStartChallenge:[
   'Identify the sole CanonState admission authority and keep it distinct from source promotion.',
   'Reconstruct the 12-pillar capability architecture and capability-lineage convergence unit.',
   'Reconstruct Heightened Mode operators, STAY/TURN/ESCALATE and the growth definition.',
   'State the residual being reduced, its evidence, the target capability and at least two admissible alternatives.',
   'State a developmental delta and all veto boundaries before proposing mutation.',
   'Preserve contradictions, rejected branches and developmental scars as evidence.',
  ],
  canonicalMutation:false,
 };
 return{valid:reasons.length===0,reasons,packet};
}

export function referenceDeterministicWorkerAttestationR503(packet){
 return{
  schema:R503_WORKER_ATTESTATION_SCHEMA,
  revision:'R503',
  workerClass:'DETERMINISTIC_R170_ENGINE',
  contextId:packet?.contextId||'',
  baseSha:packet?.baseSha||'',
  reconstruction:{
   canonAdmission:'R125',executionReceipt:'R142',residualEvidence:'R164',sourcePromotion:'R240',productionWriter:'ci.yml',
   capabilityConvergenceUnit:'CAPABILITY_LINEAGE_NOT_ROUTE',developmentalMode:'HEIGHTENED_MODE',
   decisionLaw:[...R503_DECISION_LAW],growthDefinition:'INCREASE_IN_REACHABLE_COHERENT_LAWFUL_POSSIBILITY',
   proofSequence:['PRUNE','TRANSLATE','PROVE'],physicalDimensionInflation:false,presentationDefinesCapability:false,
   rendererMayRewriteTruth:false,canonicalMutation:false,
  },
  alternativesConsidered:['STAY_OBSERVE','PROPOSE_ONE_BOUNDED_DEPENDENCY_READY_CAPSULE'],
  residualEvidenceIds:['R164_RUNTIME_RESIDUAL_GATE'],
  developmentalDelta:{
   targetCapability:'R170_GOVERNED_SELFBUILD',
   intendedResidual:'DEPENDENCY_READY_BOUNDED_SOURCE_RESIDUAL',
   capabilityGain:0,coherenceGain:0,autonomyGain:0,usabilityGain:0,recoverabilityGain:0,
   regressionRisk:0,duplicationRisk:0,authorityFragmentationRisk:0,
  },
  vetoes:{newPhysicalPrimitive:false,canonAuthorityChange:false,truthClassInflation:false,presentationAsAuthority:false,directProductionMutation:false},
  canonicalMutation:false,
 };
}

export function validateWorkerAttestationR503(packet,attestation,{reasoningRequired=false}={}){
 const reasons=[];
 if(packet?.schema!==R503_WORKER_PACKET_SCHEMA)reasons.push('R503_PACKET_SCHEMA_INVALID');
 if(attestation?.schema!==R503_WORKER_ATTESTATION_SCHEMA)reasons.push('R503_ATTESTATION_SCHEMA_INVALID');
 if(attestation?.contextId!==packet?.contextId)reasons.push('R503_CONTEXT_ID_MISMATCH');
 if(attestation?.baseSha!==packet?.baseSha)reasons.push('R503_ATTESTATION_BASE_MISMATCH');
 const r=attestation?.reconstruction||{};
 for(const [k,v] of Object.entries({
  canonAdmission:'R125',executionReceipt:'R142',residualEvidence:'R164',sourcePromotion:'R240',productionWriter:'ci.yml',
  capabilityConvergenceUnit:'CAPABILITY_LINEAGE_NOT_ROUTE',developmentalMode:'HEIGHTENED_MODE',
  growthDefinition:'INCREASE_IN_REACHABLE_COHERENT_LAWFUL_POSSIBILITY',
 })){if(r[k]!==v)reasons.push('R503_RECONSTRUCTION_'+k.toUpperCase()+'_INVALID')}
 if(!exactArray(r.decisionLaw,R503_DECISION_LAW))reasons.push('R503_RECONSTRUCTION_DECISION_LAW_INVALID');
 if(!exactArray(r.proofSequence,['PRUNE','TRANSLATE','PROVE']))reasons.push('R503_RECONSTRUCTION_PROOF_SEQUENCE_INVALID');
 for(const k of ['physicalDimensionInflation','presentationDefinesCapability','rendererMayRewriteTruth','canonicalMutation'])if(r[k]!==false)reasons.push('R503_RECONSTRUCTION_'+k.toUpperCase()+'_INVALID');
 if(!Array.isArray(attestation?.alternativesConsidered)||uniq(attestation.alternativesConsidered).length<2)reasons.push('R503_MULTIPLE_ALTERNATIVES_REQUIRED');
 if(!Array.isArray(attestation?.residualEvidenceIds)||attestation.residualEvidenceIds.filter(nonEmpty).length<1)reasons.push('R503_RESIDUAL_EVIDENCE_REQUIRED');
 const d=attestation?.developmentalDelta||{};
 if(!nonEmpty(d.targetCapability)||!nonEmpty(d.intendedResidual))reasons.push('R503_DEVELOPMENTAL_DELTA_TARGET_REQUIRED');
 for(const field of R503_DELTA_FIELDS)if(!bounded01(d[field]))reasons.push('R503_DEVELOPMENTAL_DELTA_'+field.toUpperCase()+'_INVALID');
 const v=attestation?.vetoes||{};
 for(const k of ['newPhysicalPrimitive','canonAuthorityChange','truthClassInflation','presentationAsAuthority','directProductionMutation'])if(v[k]!==false)reasons.push('R503_VETO_'+k.toUpperCase()+'_INVALID');
 if(attestation?.canonicalMutation!==false)reasons.push('R503_ATTESTATION_CANONICAL_MUTATION_INVALID');
 if(reasoningRequired&&attestation?.workerClass!=='REASONING_DEVELOPER')reasons.push('R503_REASONING_WORKER_CLASS_REQUIRED');
 return{valid:reasons.length===0,reasons,contextId:packet?.contextId||null,workerClass:attestation?.workerClass||null};
}

export function validateReasoningWorkerProposalR503(packet,proposal){
 const attestation=proposal?.workerAttestation;
 const checked=validateWorkerAttestationR503(packet,attestation,{reasoningRequired:true});
 const reasons=[...checked.reasons];
 if(!proposal?.developmentalDelta||JSON.stringify(proposal.developmentalDelta)!==JSON.stringify(attestation?.developmentalDelta||null))reasons.push('R503_PROPOSAL_DELTA_ATTESTATION_MISMATCH');
 if(!Array.isArray(proposal?.alternativesConsidered)||JSON.stringify(proposal.alternativesConsidered)!==JSON.stringify(attestation?.alternativesConsidered||null))reasons.push('R503_PROPOSAL_ALTERNATIVES_ATTESTATION_MISMATCH');
 if(!Array.isArray(proposal?.residualEvidenceIds)||JSON.stringify(proposal.residualEvidenceIds)!==JSON.stringify(attestation?.residualEvidenceIds||null))reasons.push('R503_PROPOSAL_RESIDUAL_EVIDENCE_ATTESTATION_MISMATCH');
 return{valid:reasons.length===0,reasons,contextId:packet?.contextId||null,workerClass:attestation?.workerClass||null};
}

export function developmentalDeltaScoreR503(delta={}){
 const gain=['capabilityGain','coherenceGain','autonomyGain','usabilityGain','recoverabilityGain'].reduce((s,k)=>s+Number(delta[k]||0),0);
 const risk=['regressionRisk','duplicationRisk','authorityFragmentationRisk'].reduce((s,k)=>s+Number(delta[k]||0),0);
 return Number((gain-risk).toFixed(6));
}
