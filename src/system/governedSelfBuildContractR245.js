export const R245_GOVERNED_SELFBUILD_CONTRACT='OMEGA_GOVERNED_SELFBUILD_CONTRACT_R245';
export const R170_RESIDUAL_POLICY_SCHEMA='OMEGA_R170_AUTONOMOUS_SOURCE_RESIDUAL_POLICY_V1';
export const R170_CANDIDATE_POLICY_SCHEMA='OMEGA_R170_AUTONOMOUS_CANDIDATE_POLICY_V1';
export const R245_CAPSULE_GENERATOR_REVISION='R245_SHARED_CANONICAL_GENERATOR';

const SEVERITIES=Object.freeze(['LOW','MEDIUM','HIGH','CRITICAL']);
const MODES=Object.freeze(['OBSERVE_ONLY','QUEUE_FOR_REVIEW','BLOCK']);
const upper=v=>String(v??'').trim().toUpperCase();
const uniqueUpper=(values,allowed)=>[...new Set((Array.isArray(values)?values:[]).map(upper).filter(v=>allowed.includes(v)))];

export function validateResidualPolicyR245(policy={}){
 const reasons=[];
 const normalized={
  schema:String(policy?.schema||''),
  sourceAuthority:String(policy?.sourceAuthority||''),
  requireEvidence:policy?.requireEvidence===true,
  blockSeverities:uniqueUpper(policy?.blockSeverities,SEVERITIES),
  blockModes:uniqueUpper(policy?.blockModes,MODES),
  blockedEvidenceStates:[...new Set((Array.isArray(policy?.blockedEvidenceStates)?policy.blockedEvidenceStates:[]).map(upper).filter(Boolean))],
  highOrCriticalAutoRepair:policy?.highOrCriticalAutoRepair===true,
  canonicalMutation:policy?.canonicalMutation===true,
  canonicalAdmission:policy?.canonicalAdmission===true,
  canonicalAdmissionAuthority:String(policy?.canonicalAdmissionAuthority||''),
 };
 if(normalized.schema!==R170_RESIDUAL_POLICY_SCHEMA)reasons.push('schema');
 if(normalized.sourceAuthority!=='R164')reasons.push('sourceAuthority');
 if(!normalized.requireEvidence)reasons.push('requireEvidence');
 if(!normalized.blockSeverities.includes('HIGH')||!normalized.blockSeverities.includes('CRITICAL'))reasons.push('blockSeverities');
 if(!normalized.blockModes.includes('BLOCK'))reasons.push('blockModes');
 if(!normalized.blockedEvidenceStates.includes('BLOCKED'))reasons.push('blockedEvidenceStates');
 if(normalized.highOrCriticalAutoRepair)reasons.push('highOrCriticalAutoRepair');
 if(normalized.canonicalMutation)reasons.push('canonicalMutation');
 if(normalized.canonicalAdmission)reasons.push('canonicalAdmission');
 if(normalized.canonicalAdmissionAuthority!=='R125')reasons.push('canonicalAdmissionAuthority');
 return{valid:reasons.length===0,reasons,policy:normalized};
}

export function deriveResidualGateR245(evidence,policy){
 const checked=validateResidualPolicyR245(policy);
 if(!checked.valid)return{schema:'OMEGA_AUTONOMOUS_SOURCE_RESIDUAL_GATE_R245',contract:R245_GOVERNED_SELFBUILD_CONTRACT,state:'UNPROVEN',allow:false,reason:`canonical residual policy invalid: ${checked.reasons.join(',')||'UNKNOWN'}`,blocking:[],policy:checked.policy,policyValid:false};
 const p=checked.policy;
 if(!evidence&&p.requireEvidence)return{schema:'OMEGA_AUTONOMOUS_SOURCE_RESIDUAL_GATE_R245',contract:R245_GOVERNED_SELFBUILD_CONTRACT,state:'UNPROVEN',allow:false,reason:'current R164 residual evidence is required before autonomous generation',blocking:[],policy:p,policyValid:true};
 const residuals=Array.isArray(evidence?.residuals)?evidence.residuals:[];
 const blockingRows=residuals.filter(row=>p.blockModes.includes(upper(row?.mode))||p.blockSeverities.includes(upper(row?.severity)));
 const evidenceState=upper(evidence?.state||'UNPROVEN');
 const stateBlocked=p.blockedEvidenceStates.includes(evidenceState);
 const blocked=stateBlocked||blockingRows.length>0;
 return{
  schema:'OMEGA_AUTONOMOUS_SOURCE_RESIDUAL_GATE_R245',
  contract:R245_GOVERNED_SELFBUILD_CONTRACT,
  state:blocked?'BLOCK':evidenceState,
  allow:!blocked,
  reason:blocked?'canonical R164 residual policy blocks autonomous source generation':'canonical R164 residual policy permits bounded autonomous source generation',
  blocking:blockingRows.map((row,index)=>String(row?.id||`R164-${index+1}`)),
  blockingRows:blockingRows.map(row=>({id:String(row?.id||''),severity:upper(row?.severity),mode:upper(row?.mode)})),
  summary:evidence?.summary||null,
  evidenceState,
  policy:p,
  policyValid:true,
 };
}

export function validateAutonomousCandidatePolicyR245(policy={}){
 const prefixes=[...new Set((Array.isArray(policy?.branchPrefixes)?policy.branchPrefixes:[]).map(v=>String(v||'').trim()).filter(Boolean))];
 const normalized={schema:String(policy?.schema||''),branchPrefixes:prefixes,maxOpenCandidatePrs:Number(policy?.maxOpenCandidatePrs),crossMachineFence:policy?.crossMachineFence===true,exactBaseRequired:policy?.exactBaseRequired===true};
 const reasons=[];
 if(normalized.schema!==R170_CANDIDATE_POLICY_SCHEMA)reasons.push('schema');
 if(!prefixes.includes('selfbuild/r170-')||!prefixes.includes('cloud/evolution-'))reasons.push('branchPrefixes');
 if(normalized.maxOpenCandidatePrs!==1)reasons.push('maxOpenCandidatePrs');
 if(!normalized.crossMachineFence)reasons.push('crossMachineFence');
 if(!normalized.exactBaseRequired)reasons.push('exactBaseRequired');
 return{valid:reasons.length===0,reasons,policy:normalized};
}

export function autonomousCandidatePrefixesR245(policy){
 const checked=validateAutonomousCandidatePolicyR245(policy);
 return checked.valid?[...checked.policy.branchPrefixes]:[];
}

export function isAutonomousCandidateBranchR245(branch,policy){
 const name=String(branch||'');
 return autonomousCandidatePrefixesR245(policy).some(prefix=>name.startsWith(prefix));
}

const header=`// GENERATED BY OMEGA GOVERNED SELF-BUILD FABRIC R170/R223/R240/R243/R245.\n// One canonical deterministic source body is shared by GitHub Actions and CLOUD-01.\n// Source candidate only. CanonState admission remains exclusively R125.\n`;

export const R245_CAPSULE_BODIES=Object.freeze({
 SG001:header+`export type WorkflowCapacity={active:number;archived:number;queued:number;inProgress:number;limit:number};\nexport function workflowPressure(x:WorkflowCapacity){const live=x.queued+x.inProgress;return{live,ratio:live/Math.max(1,x.limit),saturated:live>=x.limit,withinBound:x.active<=x.limit}}\nexport const HISTORICAL_PROOF_EXECUTION_REQUIRED_BY_DEFAULT=false as const;\nexport const GOVERNED_GENERATOR_CONTRACT='R245_SHARED_CANONICAL_GENERATOR' as const;\n`,
 SG002:header+`export type DeploymentState='PUBLISHED'|'PROPAGATING'|'RUNTIME_MATCHED'|'ASSET_MATCHED'|'LIVE_VERIFIED'|'REJECTED';\nexport type DeploymentReceipt={candidateSha:string;publishedVersion:string|null;runtimeVersion:string|null;assetHashesMatch:boolean;federationVerified:boolean;state:DeploymentState};\nexport function deriveDeploymentState(x:DeploymentReceipt):DeploymentState{if(x.state==='REJECTED')return 'REJECTED';if(!x.publishedVersion)return 'PUBLISHED';if(x.runtimeVersion!==x.publishedVersion)return 'PROPAGATING';if(!x.assetHashesMatch)return 'RUNTIME_MATCHED';if(!x.federationVerified)return 'ASSET_MATCHED';return 'LIVE_VERIFIED'}\nexport const REACHABLE_EQUALS_PROMOTED=false as const;\nexport const GOVERNED_GENERATOR_CONTRACT='R245_SHARED_CANONICAL_GENERATOR' as const;\n`,
 SG003:header+`export type ResidualSeverity='LOW'|'MEDIUM'|'HIGH'|'CRITICAL';\nexport type ResidualMode='OBSERVE_ONLY'|'QUEUE_FOR_REVIEW'|'BLOCK';\nexport type ResidualProjection={id:string;severity:ResidualSeverity;mode:ResidualMode;summary:string;canonicalMutation:false};\nexport type ResidualPolicy={blockSeverities:readonly ResidualSeverity[];blockModes:readonly ResidualMode[]};\nexport function projectResiduals(rows:ResidualProjection[],policy:ResidualPolicy){const autonomousBlock=rows.filter(x=>policy.blockModes.includes(x.mode)||policy.blockSeverities.includes(x.severity));return{blocking:rows.filter(x=>x.mode==='BLOCK'),review:rows.filter(x=>x.mode==='QUEUE_FOR_REVIEW'),observe:rows.filter(x=>x.mode==='OBSERVE_ONLY'),autonomousBlock,canonicalMutation:false as const}}\nexport const GOVERNED_GENERATOR_CONTRACT='R245_SHARED_CANONICAL_GENERATOR' as const;\n`,
 SG004:header+`export type CandidateStatus='GENERATED_PENDING_PROOF'|'SANDBOX'|'PROVED_PENDING_PR'|'SOURCE_PROMOTED_PENDING_PRODUCTION'|'SOURCE_MERGE_OBSERVED'|'REJECTED';\nexport type CandidateProofReceipt={capsuleId:string;baseSha:string;candidateSha:string|null;branch:string|null;tests:Record<string,boolean>;residualGate:'PASS'|'BLOCK'|'UNPROVEN';status:CandidateStatus;canonicalAdmission:false};\nexport function provedForPr(x:CandidateProofReceipt){return x.residualGate==='PASS'&&Object.values(x.tests).every(Boolean)&&x.status==='PROVED_PENDING_PR'&&x.canonicalAdmission===false}\nexport function provedForPromotion(x:CandidateProofReceipt){return provedForPr(x)}\nexport const GOVERNED_GENERATOR_CONTRACT='R245_SHARED_CANONICAL_GENERATOR' as const;\n`,
 SG005:header+`export type CapabilityProjection={id:string;authority:string;liveness:'LIVE'|'READY'|'DEGRADED'|'UNPROVEN'|'UNAVAILABLE';execution:'NOT_INVOKED'|'INVOKED'|'RETURNED'|'VERIFIED';proofIds:string[]};\nexport function usableCapability(x:CapabilityProjection){return x.liveness==='LIVE'&&x.execution==='VERIFIED'&&x.proofIds.length>0}\nexport const AVAILABILITY_EQUALS_EXECUTION=false as const;\nexport const EXECUTION_EQUALS_CANON_ADMISSION=false as const;\nexport const GOVERNED_GENERATOR_CONTRACT='R245_SHARED_CANONICAL_GENERATOR' as const;\n`,
});

export function capsuleBodyR245(capsuleId){
 const body=R245_CAPSULE_BODIES[String(capsuleId||'')];
 if(!body)throw new Error(`No deterministic governed generator registered for ${capsuleId}`);
 return body;
}
