import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileProofCarryR292} from '../src/proof/proofCarryRuntimeR292.js';
import {compileProofEvolutionR293} from '../src/proof/proofEvolutionRuntimeR293.js';
import {buildProofReturnReceiptR294,compileProofReturnR294} from '../src/proof/proofReturnRuntimeR294.js';
import {compileProofAdmissionR295,PROOF_ADMISSION_BOUNDARY_R295,PROOF_ADMISSION_SCHEMA_R295} from '../src/proof/proofAdmissionRuntimeR295.js';
import {proofDomainAdapterR295,PROOF_DOMAIN_REGISTRY_R295} from '../src/proof/proofDomainRegistryR295.js';

const domainId='NUMBER_THEORY/PASCAL/SINGMASTER',claimId='SHARP_SINGMASTER_N_LE_8';
const packet=compileProofCarryR292({
 domainId,claimId,claimLabel:'Sharp Singmaster Bound N(a) <= 8',claimStatus:'OPEN',
 requirements:{exhaustivePartition:true,sourceLineage:true,invariantCarry:true,exactChecks:true},
 gates:[{id:'G01',status:'PASS'},{id:'G09',status:'OPEN',detail:'small-k four-column family exhaustion remains open'}],
 partitions:[{id:'MIXED-BOUNDARY',terminal:true,exhaustive:false,scope:'small-k/boundary family'}],
 transforms:[{id:'T1',preservesInvariant:true,domainMapVerified:true}],
 sources:[{id:'S1',authority:'PEER_REVIEWED'}],
 exactChecks:[{id:'E1',pass:true}]
});
const bound={...packet,bound:true,supportScore:packet.metrics.supportScore,scarPressure:packet.metrics.scarPressure,routingSupport:.35+.65*packet.metrics.supportScore};
const evolution=compileProofEvolutionR293(bound);
assert.equal(evolution.domainId,domainId);
const target=evolution.cells.find(x=>x.kind==='PARTITION')||evolution.cells[0];
const digest='sha256:'+'b'.repeat(64),baseSha='0123456789abcdef0123456789abcdef01234567';
const resolution=buildProofReturnReceiptR294(target,evolution,{receiptId:'R295-RESOLUTION',returnedAt:'2026-09-12T05:00:00.000Z',outcome:'RESOLUTION_CANDIDATE',evidenceClass:'FORMAL_CERTIFICATE',evidenceDigest:digest,evidenceLocator:'artifact://r295/resolution',verifierState:'FORMAL_CERTIFICATE_PASS',reproducible:true});
const proofReturn=compileProofReturnR294({evolution,receipts:[resolution]});
assert.equal(proofReturn.domainId,domainId);
assert.equal(proofReturn.returnedPendingAdmission,1);

const adapter=proofDomainAdapterR295(domainId,claimId);
assert(adapter,'Singmaster domain must be registered for R295 admission');
assert.equal(adapter.adapterPath,'src/proof/singmasterProofAtlasR290.ts');
assert(PROOF_DOMAIN_REGISTRY_R295[domainId].testPaths.includes('tests/r294-returned-evidence-closure-invariants.mjs'));
assert.equal(proofDomainAdapterR295(domainId,'WRONG'),null,'claim mismatch must not resolve a domain adapter');

const unboundBase=compileProofAdmissionR295({proofReturn,baseSha:''});
assert.equal(unboundBase.schema,PROOF_ADMISSION_SCHEMA_R295);
assert.equal(unboundBase.domainId,domainId);
assert.equal(unboundBase.adapterRegistered,true);
assert.equal(unboundBase.proposalCount,1);
assert.equal(unboundBase.reviewReadyCount,0);
assert.equal(unboundBase.blockedCount,1);
assert.equal(unboundBase.proposals[0].status,'BLOCKED_BASE_SHA');
assert.equal(unboundBase.truthClosureCount,0);

const admission=compileProofAdmissionR295({proofReturn,baseSha});
assert.equal(admission.baseBound,true);
assert.equal(admission.reviewReadyCount,1);
assert.equal(admission.blockedCount,0);
assert.equal(admission.truthClosureCount,0,'source-admission compilation must never auto-close theorem truth');
const proposal=admission.reviewReady[0];
assert.equal(proposal.status,'SOURCE_ADMISSION_CANDIDATE');
assert.equal(proposal.requestedAction,'SOURCE_ADMISSION_CANDIDATE');
assert.equal(proposal.domainId,domainId);
assert.equal(proposal.claimId,claimId);
assert.equal(proposal.baseSha,baseSha);
assert.equal(proposal.evidenceDigest,digest);
assert.equal(proposal.adapterPath,'src/proof/singmasterProofAtlasR290.ts');
assert.equal(proposal.mutationScope,'PARTITION_EXHAUSTIVENESS_OR_REFINEMENT');
assert.equal(proposal.reviewRequired,true);
assert.equal(proposal.domainAdapterRecompileRequired,true);
assert.equal(proposal.sourceMutationAuthority,false);
assert.equal(proposal.truthMutationAuthority,false);
assert.equal(proposal.productionAuthority,false);
assert.equal(proposal.canonicalAdmission,false);
assert.equal(proposal.canonAdmissionAuthority,'R125');
assert.match(PROOF_ADMISSION_BOUNDARY_R295,/never edits source/);

const noLocator=buildProofReturnReceiptR294(target,evolution,{receiptId:'R295-NO-LOCATOR',returnedAt:'2026-09-12T05:01:00.000Z',outcome:'RESOLUTION_CANDIDATE',evidenceClass:'EXACT_COMPUTATION',evidenceDigest:digest,verifierState:'EXACT_REPLAY_PASS',reproducible:true});
const noLocatorReturn=compileProofReturnR294({evolution,receipts:[noLocator]});
assert.equal(compileProofAdmissionR295({proofReturn:noLocatorReturn,baseSha}).proposals[0].status,'BLOCKED_EVIDENCE_LOCATOR','review needs a resolvable evidence artifact, not only a digest');

const counterexample=buildProofReturnReceiptR294(target,evolution,{receiptId:'R295-COUNTEREXAMPLE',returnedAt:'2026-09-12T05:02:00.000Z',outcome:'COUNTEREXAMPLE',evidenceClass:'EXACT_COMPUTATION',evidenceDigest:digest,evidenceLocator:'artifact://r295/counterexample',verifierState:'EXACT_REPLAY_PASS',reproducible:true});
const counterReturn=compileProofReturnR294({evolution,receipts:[counterexample]});
const counterAdmission=compileProofAdmissionR295({proofReturn:counterReturn,baseSha});
assert.equal(counterAdmission.reviewReady[0].status,'COUNTEREXAMPLE_ESCALATION');
assert.equal(counterAdmission.reviewReady[0].independentReplicationRequired,true);
assert.equal(counterAdmission.reviewReady[0].truthMutationAuthority,false);

const archiveReceipt=buildProofReturnReceiptR294(target,evolution,{receiptId:'R295-ARCHIVE',returnedAt:'2026-09-12T05:03:00.000Z',outcome:'NO_CLOSURE',evidenceClass:'EXACT_COMPUTATION',evidenceDigest:digest,evidenceLocator:'artifact://r295/archive',verifierState:'EXACT_REPLAY_PASS',reproducible:true});
const archiveReturn=compileProofReturnR294({evolution,receipts:[archiveReceipt]});
const archiveAdmission=compileProofAdmissionR295({proofReturn:archiveReturn,baseSha});
assert.equal(archiveAdmission.archiveOnlyCount,1);
assert.equal(archiveAdmission.reviewReadyCount,0);
assert.equal(archiveAdmission.proposals[0].status,'RETURN_ARCHIVE_ONLY');

const unknownReturn={...proofReturn,domainId:'UNREGISTERED/DOMAIN'};
const unknownAdmission=compileProofAdmissionR295({proofReturn:unknownReturn,baseSha});
assert.equal(unknownAdmission.adapterRegistered,false);
assert.equal(unknownAdmission.proposals[0].status,'ADAPTER_UNREGISTERED');
assert.equal(unknownAdmission.reviewReadyCount,0);

const bridge=fs.readFileSync('scripts/r295-proof-admission-compile.mjs','utf8');
for(const token of ['OMEGA_R295_RETURN_RECONCILIATION','OMEGA_R295_BASE_SHA','compileProofAdmissionR295','OMEGA_PROOF_ADMISSION_DIRECTIVE_R295','R295 never'])assert(bridge.includes(token),`R295 headless admission bridge missing ${token}`);
const modes=fs.readFileSync('src/fullModeConvergenceRuntime.ts','utf8');
const woven=fs.readFileSync('src/wovenContinuityRuntimeR77.ts','utf8');
const selfBuild=fs.readFileSync('src/RecursiveSelfBuildR240.tsx','utf8');
const workbench=fs.readFileSync('src/SingmasterProofWorkbenchR290.tsx','utf8');
for(const token of ['activeProofAdmissionSnapshotR295','proofAdmission:{','reviewReadyCount'])assert(modes.includes(token),`ALL MODES missing R295 token ${token}`);
for(const token of ['activeProofAdmissionSnapshotR295','proofAdmission:{','source-admission proposals'])assert(woven.includes(token),`Woven continuity missing R295 token ${token}`);
for(const token of ['activeProofAdmissionSnapshotR295','R295 PROOF SOURCE ADMISSION','source mutation authority remains false'])assert(selfBuild.includes(token),`recursive self-build missing R295 token ${token}`);
for(const token of ['compileProofAdmissionR295','R295 SOURCE ADMISSION','reviewReadyCount','truthClosureCount'])assert(workbench.includes(token),`Singmaster workbench missing R295 token ${token}`);

console.log('R295 PROOF ADMISSION COMPILER PASS');
console.log(JSON.stringify({domainId,proposalCount:admission.proposalCount,reviewReadyCount:admission.reviewReadyCount,truthClosureCount:admission.truthClosureCount,fingerprint:admission.fingerprint}));
