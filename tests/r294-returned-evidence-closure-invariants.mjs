import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileProofCarryR292} from '../src/proof/proofCarryRuntimeR292.js';
import {compileProofEvolutionR293} from '../src/proof/proofEvolutionRuntimeR293.js';
import {buildProofReturnReceiptR294,clearProofReturnLedgerR294,compileProofReturnR294,PROOF_RETURN_BOUNDARY_R294,PROOF_RETURN_RECEIPT_SCHEMA_R294,recordProofReturnR294,readProofReturnLedgerR294,validateProofReturnR294} from '../src/proof/proofReturnRuntimeR294.js';

const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
globalThis.window={dispatchEvent:()=>true};
globalThis.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail}};

const packet=compileProofCarryR292({
 domainId:'TEST/R294',claimId:'R294_TEST',claimLabel:'R294 returned evidence test',claimStatus:'OPEN',
 requirements:{exhaustivePartition:true,sourceLineage:true,invariantCarry:true,exactChecks:true},
 gates:[{id:'G1',status:'PASS'},{id:'G2',status:'OPEN',detail:'global closure missing'}],
 partitions:[{id:'P1',terminal:true,exhaustive:false,scope:'unclosed family'}],
 transforms:[{id:'T1',preservesInvariant:true,domainMapVerified:true}],
 sources:[{id:'S1',authority:'PEER_REVIEWED'},{id:'S2',status:'SOURCE_MISSING',label:'missing source'}],
 exactChecks:[{id:'E1',pass:false,detail:'exact replay required'}]
});
const bound={...packet,bound:true,supportScore:packet.metrics.supportScore,scarPressure:packet.metrics.scarPressure,routingSupport:.35+.65*packet.metrics.supportScore};
const evolution=compileProofEvolutionR293(bound);
assert(evolution.cells.length>=4,'R294 test requires multiple unresolved R293 cells');
for(const cell of evolution.cells){
 assert.match(cell.id,/^R293-/,'R293 work identity must be explicit');
 assert.match(cell.scarFingerprint,/^r293-scar-[0-9a-f]{8}$/,'R293 scar fingerprint must be stable and addressable');
 assert.equal(cell.proofFingerprint,evolution.proofFingerprint,'each work cell must bind the exact proof fingerprint');
}

const target=evolution.cells[0];
const digest='sha256:'+'a'.repeat(64);
const receipt=buildProofReturnReceiptR294(target,evolution,{receiptId:'RETURN-1',returnedAt:'2026-09-12T04:00:00.000Z',outcome:'RESOLUTION_CANDIDATE',evidenceClass:'EXACT_COMPUTATION',evidenceDigest:digest,evidenceLocator:'artifact://r294/test',verifierState:'EXACT_REPLAY_PASS',reproducible:true,notes:'synthetic invariant-test return'});
assert.equal(receipt.schema,PROOF_RETURN_RECEIPT_SCHEMA_R294);
const validation=validateProofReturnR294(evolution,receipt);
assert.equal(validation.status,'RETURNED_PENDING_SOURCE_ADMISSION');
assert.equal(validation.accepted,true);
assert.equal(validation.closureCandidate,true);

const reconciliation=compileProofReturnR294({evolution,receipts:[receipt]});
assert.equal(reconciliation.underlyingUnresolvedCount,evolution.unresolvedCount,'returned evidence must not erase underlying proof scars');
assert.equal(reconciliation.returnedPendingAdmission,1);
assert.equal(reconciliation.closureCandidates,1);
assert.equal(reconciliation.truthClosureCount,0,'R294 may not auto-close theorem truth');
assert.equal(reconciliation.waitingCount,1);
assert.equal(reconciliation.readyCount,evolution.cells.length-1);
assert.equal(reconciliation.promotionEligible,evolution.promotionEligible,'R294 return reconciliation must not inflate promotion eligibility');
assert(!reconciliation.readyCells.some(x=>x.id===target.id),'matched returned work must pause duplicate research scheduling');
assert(reconciliation.waitingCells.some(x=>x.id===target.id),'matched returned work must remain visible pending source admission');
assert.equal(reconciliation.authority.canonAdmission,'R125');
assert.equal(reconciliation.authority.productionWriter,'.github/workflows/ci.yml');
assert.match(PROOF_RETURN_BOUNDARY_R294,/does not alter the underlying R292 proof packet/);

const unverified={...receipt,receiptId:'RETURN-2',evidenceDigest:''};
assert.equal(validateProofReturnR294(evolution,unverified).status,'RETURNED_UNVERIFIED');
const stale={...receipt,receiptId:'RETURN-3',proofFingerprint:'r292-stale'};
assert.equal(validateProofReturnR294(evolution,stale).status,'STALE_FINGERPRINT');
const wrongClaim={...receipt,receiptId:'RETURN-4',claimId:'OTHER'};
assert.equal(validateProofReturnR294(evolution,wrongClaim).status,'REJECTED_IDENTITY');
const mixed=compileProofReturnR294({evolution,receipts:[receipt,unverified,stale,wrongClaim]});
assert.equal(mixed.returnedPendingAdmission,1);
assert.equal(mixed.unverifiedCount,1);
assert.equal(mixed.staleCount,1);
assert.equal(mixed.rejectedCount,1);
assert.equal(mixed.truthClosureCount,0);

clearProofReturnLedgerR294();
assert.equal(readProofReturnLedgerR294().length,0);
recordProofReturnR294(receipt);
assert.equal(readProofReturnLedgerR294().length,1);
recordProofReturnR294({...receipt,notes:'replacement with same receipt id'});
assert.equal(readProofReturnLedgerR294().length,1,'same receipt id must replace rather than duplicate');
clearProofReturnLedgerR294();

const modes=fs.readFileSync('src/fullModeConvergenceRuntime.ts','utf8');
const woven=fs.readFileSync('src/wovenContinuityRuntimeR77.ts','utf8');
const selfBuild=fs.readFileSync('src/RecursiveSelfBuildR240.tsx','utf8');
const workbench=fs.readFileSync('src/SingmasterProofWorkbenchR290.tsx','utf8');
const bridge=fs.readFileSync('scripts/r294-proof-return-reconcile.mjs','utf8');
for(const token of ['activeProofReturnSnapshotR294',"proofReturn:{",'proofReturn.fingerprint','never raises theorem support'])assert(modes.includes(token),`ALL MODES missing R294 token ${token}`);
for(const token of ['activeProofReturnSnapshotR294','proofReturn:{','returned-work identity','pending-admission status'])assert(woven.includes(token),`Woven continuity missing R294 token ${token}`);
for(const token of ['activeProofReturnSnapshotR294','R294 RETURN RECONCILIATION','0 theorem gates auto-closed','domain proof adapter must admit and recompile'])assert(selfBuild.includes(token),`recursive self-build missing R294 token ${token}`);
for(const token of ['compileProofReturnR294','PROOF_RETURN_RECEIPT_SCHEMA_R294','R294 RETURN RECONCILIATION','truthClosureCount','proofReturnFingerprint'])assert(workbench.includes(token),`Singmaster workbench missing R294 token ${token}`);
for(const token of ['OMEGA_R294_PROOF_PACKET','OMEGA_R294_RETURN_PACKET','compileProofReturnR294','truthClosureCount','R294 never invents proof or returned evidence'])assert(bridge.includes(token),`headless R294 bridge missing ${token}`);

console.log('R294 RETURNED EVIDENCE CLOSURE PASS');
console.log(JSON.stringify({underlying:evolution.unresolvedCount,ready:reconciliation.readyCount,waiting:reconciliation.waitingCount,closureCandidates:reconciliation.closureCandidates,truthClosureCount:reconciliation.truthClosureCount,fingerprint:reconciliation.fingerprint}));
