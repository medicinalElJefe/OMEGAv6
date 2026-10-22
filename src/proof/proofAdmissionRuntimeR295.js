import {activeProofReturnSnapshotR294} from './proofReturnRuntimeR294.js';
import {proofDomainAdapterR295} from './proofDomainRegistryR295.js';

export const PROOF_ADMISSION_SCHEMA_R295='OMEGA_PROOF_SOURCE_ADMISSION_R295';
export const PROOF_ADMISSION_BOUNDARY_R295='R295 compiles R294 returned evidence into deterministic source-admission proposals against a registered proof-domain adapter. It never edits source, closes a proof scar, changes theorem truth, promotes a branch, deploys production, or mutates CanonState. A proposal is only eligible for governed human/machine review after exact domain/claim/receipt lineage, evidence locator, and base SHA are bound.';

const SHA40=/^[0-9a-f]{40}$/i;
const stable=value=>{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`};
const hash32=value=>{const text=String(value);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const fingerprint=value=>`r295-${hash32(stable(value)).toString(16).padStart(8,'0')}`;
const mutationScopeFor=kind=>({GATE:'PROOF_GATE_STATUS_OR_DETAIL',PARTITION:'PARTITION_EXHAUSTIVENESS_OR_REFINEMENT',SOURCE:'SOURCE_LINEAGE_REGISTRY',EXACT_CHECK:'EXACT_CHECK_CERTIFICATE',TRANSFORM:'INVARIANT_TRANSFORM_CERTIFICATE',REQUIREMENT:'PROOF_REQUIREMENT_CONTRACT'}[String(kind||'GATE')]||'PROOF_ADAPTER_REVIEW');
const actionFor=outcome=>outcome==='RESOLUTION_CANDIDATE'?'SOURCE_ADMISSION_CANDIDATE':outcome==='COUNTEREXAMPLE'?'COUNTEREXAMPLE_ESCALATION':'RETURN_ARCHIVE_ONLY';

function proposalFor(row,proofReturn,adapter,baseSha){
 const receipt=row?.receipt||{},cell=row?.cell||{},outcome=String(receipt.outcome||'RETURNED'),action=actionFor(outcome),actionable=action!=='RETURN_ARCHIVE_ONLY';
 const baseBound=SHA40.test(String(baseSha||'')),locatorBound=String(receipt.evidenceLocator||'').trim().length>0,adapterRegistered=Boolean(adapter);
 let status=action;
 if(!adapterRegistered)status='ADAPTER_UNREGISTERED';
 else if(actionable&&!baseBound)status='BLOCKED_BASE_SHA';
 else if(actionable&&!locatorBound)status='BLOCKED_EVIDENCE_LOCATOR';
 const reviewReady=adapterRegistered&&actionable&&baseBound&&locatorBound;
 const independentReplicationRequired=outcome==='COUNTEREXAMPLE';
 const core={
  schema:'OMEGA_PROOF_ADMISSION_PROPOSAL_R295',
  revision:'R295',
  domainId:String(proofReturn?.domainId||receipt.domainId||cell.domainId||'UNBOUND'),
  claimId:String(proofReturn?.claimId||receipt.claimId||cell.claimId||'UNBOUND'),
  workCellId:String(receipt.workCellId||cell.id||''),
  scarId:String(receipt.scarId||cell.scarId||''),
  scarKind:String(cell.kind||'GATE'),
  scarFingerprint:String(receipt.scarFingerprint||cell.scarFingerprint||''),
  proofFingerprint:String(receipt.proofFingerprint||proofReturn?.proofFingerprint||''),
  evolutionFingerprint:String(receipt.evolutionFingerprint||proofReturn?.evolutionFingerprint||''),
  returnFingerprint:String(receipt.receiptFingerprint||''),
  returnOutcome:outcome,
  evidenceClass:String(receipt.evidenceClass||'UNSPECIFIED'),
  evidenceDigest:String(receipt.evidenceDigest||''),
  evidenceLocator:String(receipt.evidenceLocator||''),
  verifierState:String(receipt.verifierState||'UNVERIFIED'),
  reproducible:receipt.reproducible===true,
  adapterPath:String(adapter?.adapterPath||''),
  workbenchPath:String(adapter?.workbenchPath||''),
  requiredTests:Array.isArray(adapter?.testPaths)?[...adapter.testPaths]:[],
  mutationScope:mutationScopeFor(cell.kind),
  requestedAction:action,
  status,
  baseSha:baseBound?String(baseSha):null,
  baseBound,
  evidenceLocatorBound:locatorBound,
  adapterRegistered,
  reviewReady,
  independentReplicationRequired,
  domainAdapterRecompileRequired:true,
  reviewRequired:true,
  sourceMutationAuthority:false,
  truthMutationAuthority:false,
  productionAuthority:false,
  canonicalAdmission:false,
  canonAdmissionAuthority:'R125'
 };
 return{...core,proposalFingerprint:fingerprint(core)};
}

export function compileProofAdmissionR295({proofReturn=activeProofReturnSnapshotR294(),baseSha=''}={}){
 const domainId=String(proofReturn?.domainId||'UNBOUND'),claimId=String(proofReturn?.claimId||'UNBOUND'),adapter=proofDomainAdapterR295(domainId,claimId),pending=Array.isArray(proofReturn?.pendingAdmission)?proofReturn.pendingAdmission:[];
 const proposals=pending.map(row=>proposalFor(row,proofReturn,adapter,baseSha)).sort((a,b)=>String(a.workCellId).localeCompare(String(b.workCellId))||String(a.proposalFingerprint).localeCompare(String(b.proposalFingerprint)));
 const actionable=proposals.filter(x=>x.requestedAction!=='RETURN_ARCHIVE_ONLY'),reviewReady=proposals.filter(x=>x.reviewReady),blocked=actionable.filter(x=>!x.reviewReady),archiveOnly=proposals.filter(x=>x.requestedAction==='RETURN_ARCHIVE_ONLY');
 const core={
  schema:PROOF_ADMISSION_SCHEMA_R295,
  revision:'R295',
  bound:Boolean(proofReturn?.bound),
  domainId,
  claimId,
  claimLabel:String(proofReturn?.claimLabel||'No active proof context'),
  claimStatus:String(proofReturn?.claimStatus||'UNBOUND'),
  proofFingerprint:String(proofReturn?.proofFingerprint||'R292-UNBOUND'),
  evolutionFingerprint:String(proofReturn?.evolutionFingerprint||'R293-UNBOUND'),
  returnFingerprint:String(proofReturn?.fingerprint||'R294-UNBOUND'),
  baseSha:SHA40.test(String(baseSha||''))?String(baseSha):null,
  baseBound:SHA40.test(String(baseSha||'')),
  adapterRegistered:Boolean(adapter),
  adapter:adapter?{domainId:adapter.domainId,claimId:adapter.claimId,adapterPath:adapter.adapterPath,workbenchPath:adapter.workbenchPath,testPaths:[...adapter.testPaths],admissionMode:adapter.admissionMode,publicTruthBoundary:adapter.publicTruthBoundary}:null,
  proposalCount:proposals.length,
  actionableCount:actionable.length,
  reviewReadyCount:reviewReady.length,
  blockedCount:blocked.length,
  archiveOnlyCount:archiveOnly.length,
  truthClosureCount:0,
  proposals,
  reviewReady,
  blocked,
  archiveOnly,
  authority:{compiler:'R295_PROPOSAL_ONLY',sourceMutation:'R240/R245_GOVERNED_PATH_ONLY',productionWriter:'.github/workflows/ci.yml',truthClosure:'DOMAIN_ADAPTER_SOURCE_RECOMPILE_PLUS_INHERITED_TESTS',canonAdmission:'R125'},
  boundary:PROOF_ADMISSION_BOUNDARY_R295
 };
 return{...core,fingerprint:fingerprint({domainId,claimId,proof:core.proofFingerprint,evolution:core.evolutionFingerprint,returns:core.returnFingerprint,base:core.baseSha,proposals:proposals.map(x=>x.proposalFingerprint)})};
}

export function activeProofAdmissionSnapshotR295(){return compileProofAdmissionR295({proofReturn:activeProofReturnSnapshotR294(),baseSha:''})}
