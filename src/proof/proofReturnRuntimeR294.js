import {activeProofEvolutionSnapshotR293} from './proofEvolutionRuntimeR293.js';

const RETURN_LEDGER_KEY_R294='omega.v6.proofReturns.r294.ledger';
export const PROOF_RETURN_SCHEMA_R294='OMEGA_PROOF_RETURN_RECONCILIATION_R294';
export const PROOF_RETURN_RECEIPT_SCHEMA_R294='OMEGA_PROOF_WORK_RETURN_R294';
export const PROOF_RETURN_BOUNDARY_R294='R294 reconciles returned research artifacts against the exact R293 work identity. A matched return may pause duplicate investigation and become a closure candidate, but it does not alter the underlying R292 proof packet, close a theorem gate, authorize source promotion, write production, or mutate CanonState. Semantic proof closure occurs only when the domain proof adapter/source is updated and recompiled.';

const EVIDENCE_CLASSES=new Set(['EXACT_COMPUTATION','SOURCE_ARTIFACT','FORMAL_CERTIFICATE','PEER_REVIEWED_EXTERNAL','INDEPENDENT_OBSERVATION']);
const VERIFIER_STATES=new Set(['EXACT_REPLAY_PASS','SOURCE_PROVENANCE_PASS','FORMAL_CERTIFICATE_PASS','INDEPENDENT_REVIEW_PASS']);
const OUTCOMES=new Set(['RETURNED','COUNTEREXAMPLE','NO_CLOSURE','RESOLUTION_CANDIDATE']);
const stable=value=>{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`};
const hash32=value=>{const text=String(value);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const fingerprint=value=>`r294-${hash32(stable(value)).toString(16).padStart(8,'0')}`;
const digestOk=value=>/^sha256:[0-9a-f]{64}$/i.test(String(value||''));

export function buildProofReturnReceiptR294(cell,evolution,input={}){
 if(!cell||cell.schema!=='OMEGA_PROOF_WORK_CELL_R293')throw new Error('R294 requires an R293 proof work cell');
 if(!evolution||!evolution.fingerprint)throw new Error('R294 requires an R293 evolution packet');
 const body={
  schema:PROOF_RETURN_RECEIPT_SCHEMA_R294,
  revision:'R294',
  receiptId:String(input.receiptId||`R294-${Date.now()}-${String(cell.id).slice(-12)}`),
  returnedAt:String(input.returnedAt||new Date().toISOString()),
  claimId:String(cell.claimId),
  workCellId:String(cell.id),
  scarId:String(cell.scarId||cell.id),
  scarFingerprint:String(cell.scarFingerprint||''),
  proofFingerprint:String(cell.proofFingerprint||evolution.proofFingerprint||''),
  evolutionFingerprint:String(evolution.fingerprint),
  operation:String(cell.operation),
  outcome:OUTCOMES.has(String(input.outcome))?String(input.outcome):'RETURNED',
  evidenceClass:String(input.evidenceClass||'UNSPECIFIED'),
  evidenceDigest:String(input.evidenceDigest||''),
  evidenceLocator:String(input.evidenceLocator||''),
  verifierState:String(input.verifierState||'UNVERIFIED'),
  reproducible:input.reproducible===true,
  notes:String(input.notes||''),
  canonicalMutation:false,
  sourcePromotionAuthority:false,
  productionAuthority:false,
  canonAdmissionAuthority:'R125'
 };
 return{...body,receiptFingerprint:fingerprint(body)};
}

export function validateProofReturnR294(evolution,receipt){
 const cells=Array.isArray(evolution?.cells)?evolution.cells:[];
 const cell=cells.find(x=>String(x.id)===String(receipt?.workCellId));
 if(!receipt||receipt.schema!==PROOF_RETURN_RECEIPT_SCHEMA_R294)return{status:'REJECTED_SCHEMA',accepted:false,closureCandidate:false,reason:'R294 receipt schema required',cell:null};
 if(String(receipt.claimId)!==String(evolution?.claimId))return{status:'REJECTED_IDENTITY',accepted:false,closureCandidate:false,reason:'claim identity mismatch',cell:null};
 if(!cell)return{status:'STALE_OR_RECOMPILED',accepted:false,closureCandidate:false,reason:'work cell no longer exists in the active proof evolution',cell:null};
 if(String(receipt.proofFingerprint)!==String(evolution?.proofFingerprint)||String(receipt.evolutionFingerprint)!==String(evolution?.fingerprint)||String(receipt.scarFingerprint)!==String(cell.scarFingerprint))return{status:'STALE_FINGERPRINT',accepted:false,closureCandidate:false,reason:'proof/evolution/scar fingerprint mismatch',cell};
 if(String(receipt.operation)!==String(cell.operation))return{status:'REJECTED_OPERATION',accepted:false,closureCandidate:false,reason:'returned operation does not match scheduled work',cell};
 if(!OUTCOMES.has(String(receipt.outcome)))return{status:'RETURNED_UNVERIFIED',accepted:false,closureCandidate:false,reason:'unsupported outcome class',cell};
 if(!EVIDENCE_CLASSES.has(String(receipt.evidenceClass)))return{status:'RETURNED_UNVERIFIED',accepted:false,closureCandidate:false,reason:'recognized evidence class required',cell};
 if(!digestOk(receipt.evidenceDigest))return{status:'RETURNED_UNVERIFIED',accepted:false,closureCandidate:false,reason:'sha256 evidence digest required',cell};
 if(receipt.reproducible!==true)return{status:'RETURNED_UNVERIFIED',accepted:false,closureCandidate:false,reason:'reproducibility declaration required',cell};
 if(!VERIFIER_STATES.has(String(receipt.verifierState)))return{status:'RETURNED_UNVERIFIED',accepted:false,closureCandidate:false,reason:'recognized verification state required',cell};
 const closureCandidate=String(receipt.outcome)==='RESOLUTION_CANDIDATE';
 return{status:'RETURNED_PENDING_SOURCE_ADMISSION',accepted:true,closureCandidate,reason:closureCandidate?'identity/provenance checks passed; domain adapter must still admit the result':'verified return recorded without a closure claim',cell};
}

export function compileProofReturnR294({evolution=activeProofEvolutionSnapshotR293(),receipts=[]}={}){
 const rows=(Array.isArray(receipts)?receipts:[]).map(receipt=>({receipt,validation:validateProofReturnR294(evolution,receipt)}));
 const accepted=rows.filter(x=>x.validation.accepted);
 const acceptedByCell=new Map();
 for(const row of accepted){const id=String(row.receipt.workCellId),prior=acceptedByCell.get(id);if(!prior||String(row.receipt.returnedAt)>String(prior.receipt.returnedAt))acceptedByCell.set(id,row)}
 const pendingAdmission=[...acceptedByCell.values()];
 const cells=Array.isArray(evolution?.cells)?evolution.cells:[];
 const readyCells=cells.filter(cell=>!acceptedByCell.has(String(cell.id)));
 const waitingCells=cells.filter(cell=>acceptedByCell.has(String(cell.id)));
 const unverified=rows.filter(x=>x.validation.status==='RETURNED_UNVERIFIED');
 const stale=rows.filter(x=>String(x.validation.status).startsWith('STALE'));
 const rejected=rows.filter(x=>String(x.validation.status).startsWith('REJECTED'));
 const core={
  schema:PROOF_RETURN_SCHEMA_R294,
  revision:'R294',
  bound:Boolean(evolution?.bound),
  claimId:String(evolution?.claimId||'UNBOUND'),
  claimLabel:String(evolution?.claimLabel||'No active proof context'),
  claimStatus:String(evolution?.claimStatus||'UNBOUND'),
  proofFingerprint:String(evolution?.proofFingerprint||'R292-UNBOUND'),
  evolutionFingerprint:String(evolution?.fingerprint||'R293-UNBOUND'),
  underlyingUnresolvedCount:Number(evolution?.unresolvedCount||0),
  returnedPendingAdmission:pendingAdmission.length,
  closureCandidates:pendingAdmission.filter(x=>x.validation.closureCandidate).length,
  truthClosureCount:0,
  readyCount:readyCells.length,
  waitingCount:waitingCells.length,
  unverifiedCount:unverified.length,
  staleCount:stale.length,
  rejectedCount:rejected.length,
  readyCells,
  readyFrontier:readyCells.slice(0,12),
  waitingCells,
  pendingAdmission:pendingAdmission.map(x=>({receipt:x.receipt,cell:x.validation.cell,status:x.validation.status,closureCandidate:x.validation.closureCandidate,reason:x.validation.reason})),
  unverified:unverified.map(x=>({receipt:x.receipt,status:x.validation.status,reason:x.validation.reason})),
  stale:stale.map(x=>({receipt:x.receipt,status:x.validation.status,reason:x.validation.reason})),
  rejected:rejected.map(x=>({receipt:x.receipt,status:x.validation.status,reason:x.validation.reason})),
  promotionEligible:Boolean(evolution?.promotionEligible),
  authority:{researchReturnLedger:'R294_BROWSER_LOCAL_OR_EXPLICIT_PACKET',proofClosure:'DOMAIN_ADAPTER_RECOMPILE_REQUIRED',sourcePromotion:'R240/R245_GOVERNED_PATH',productionWriter:'.github/workflows/ci.yml',canonAdmission:'R125'},
  boundary:PROOF_RETURN_BOUNDARY_R294
 };
 return{...core,fingerprint:fingerprint({proof:core.proofFingerprint,evolution:core.evolutionFingerprint,pending:core.pendingAdmission.map(x=>x.receipt.receiptFingerprint),ready:readyCells.map(x=>x.id)})};
}

export function readProofReturnLedgerR294(){
 try{const raw=localStorage.getItem(RETURN_LEDGER_KEY_R294);const rows=raw?JSON.parse(raw):[];return Array.isArray(rows)?rows:[]}catch{return[]}
}
export function recordProofReturnR294(receipt){
 if(!receipt||receipt.schema!==PROOF_RETURN_RECEIPT_SCHEMA_R294)throw new Error('R294 receipt required');
 const rows=readProofReturnLedgerR294(),next=[...rows.filter(x=>String(x.receiptId)!==String(receipt.receiptId)),receipt].slice(-256);
 try{localStorage.setItem(RETURN_LEDGER_KEY_R294,JSON.stringify(next));window.dispatchEvent(new CustomEvent('omega-r294-proof-return-changed',{detail:receipt}))}catch{}
 return receipt;
}
export function clearProofReturnLedgerR294(){try{localStorage.removeItem(RETURN_LEDGER_KEY_R294);window.dispatchEvent(new CustomEvent('omega-r294-proof-return-changed',{detail:null}))}catch{}}
export function activeProofReturnSnapshotR294(){const evolution=activeProofEvolutionSnapshotR293(),receipts=readProofReturnLedgerR294().filter(x=>String(x.claimId)===String(evolution.claimId));return compileProofReturnR294({evolution,receipts})}
