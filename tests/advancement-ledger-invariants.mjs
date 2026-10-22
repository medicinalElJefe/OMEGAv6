import assert from 'node:assert/strict';
import fs from 'node:fs';

const ledger=JSON.parse(fs.readFileSync('public/omega-advancement-ledger.json','utf8'));
const docs=fs.readFileSync('docs/OMEGA_ADVANCEMENT_LEDGER.md','utf8');
const verifier=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');
const must=(ok,msg)=>assert.ok(ok,msg);

assert.equal(ledger.schema,'OMEGA_ADVANCEMENT_LEDGER_INDEX_V1');
assert.equal(ledger.policyRevision,'R210');
assert.equal(ledger.recordType,'LIVE_LEDGER_INDEX_AND_COMPLETION_POLICY');
assert.equal(ledger.canonicalHumanLedger,'https://github.com/medicinalElJefe/OMEGAv6/issues/435');
assert.equal(ledger.productionBaselineAtPolicyCreation?.revision,'R207.2');
assert.equal(ledger.productionBaselineAtPolicyCreation?.state,'RELEASE_CLEAN_PRODUCTION_PROVEN');
assert.equal(ledger.productionBaselineAtPolicyCreation?.pr,'https://github.com/medicinalElJefe/OMEGAv6/pull/434');
assert.equal(ledger.productionBaselineAtPolicyCreation?.mergeSha,'3935eacd40297af8b365b6c8a371164da4ed21c3');
assert.equal(ledger.productionBaselineAtPolicyCreation?.workflow,'https://github.com/medicinalElJefe/OMEGAv6/actions/runs/34177695039');
assert.equal(ledger.productionBaselineAtPolicyCreation?.workerVersion,'a5a7fda4-376f-4749-9ad2-383a213b88e4');
assert.equal(ledger.productionBaselineAtPolicyCreation?.immutableR205BaseSha256,'49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046');
for(const key of ['coreHealth','hybridStatus','operationalSourceAuthority','buildReceipt'])must(/^https:\/\/omegav6\.jeffdeweyeljefe\.workers\.dev\//.test(ledger.proofLinks?.[key]||''),`missing canonical live proof link ${key}`);
for(const field of ['REVISION_AND_PURPOSE','CANDIDATE_SHA','CANONICAL_MERGE_SHA','PULL_REQUEST_LINK','CI_AND_PRODUCTION_WORKFLOW_LINK','WORKER_VERSION_WHEN_DEPLOYED','LIVE_RUNTIME_AND_PROOF_LINKS','WHAT_CHANGED','WHAT_WAS_PROVEN','RESIDUALS_OR_FAILED_POST_CHECKS','NEXT_GOVERNED_BOUNDARY'])must(ledger.completionFields.includes(field),`completion contract missing ${field}`);
assert.equal(ledger.stateLaw,'DEPLOYED_IS_NOT_RELEASE_CLEAN_UNLESS_ALL_REQUIRED_POST_DEPLOYMENT_PROOFS_PASS');
assert.equal(ledger.concurrencyLaw,'SUPERSEDED_OR_DIVERGED_CANDIDATES_ARE_RECORDED_AND_CLOSED_NOT_SILENTLY_OVERWRITTEN');
assert.equal(ledger.updateLaw,'THE_GITHUB_LEDGER_IS_UPDATED_AFTER_PRODUCTION_PROOF_WITHOUT_REQUIRING_A_SECOND_DEPLOYMENT');
assert.equal(ledger.forwardRepairLaw,'REPAIR_ADVANCES_FROM_CURRENT_CANONICAL_HEAD_AND_MUST_NOT_ROLL_BACK_TO_OLDER_DONOR_OR_UI_LINEAGE');
assert.equal(ledger.liveTruthFreshnessLaw,'TRANSIENT_RUNTIME_FAILURES_MUST_REPROBE_AND_RECOVER_WHILE_PERSISTENT_FAILURES_REMAIN_EXPLICIT_HOLD');
assert.equal(ledger.layerVisibilityLaw,'ADVANCED_LAYERS_REMAIN_ROUTABLE_VISIBLE_AND_TESTED_WHEN_REPAIRING_A_LOWER_LAYER');
for(const boundary of ['CURRENT_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_NON_REVOKED_HEARTBEAT','R146_IS_DURABLE_EXECUTION_HISTORY','R147_IS_EXECUTOR_SELECTION_AND_DISPATCH_AUTHORITY','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY','DERIVED_EVIDENCE_MAY_NOT_SELF_CONFIRM_INDEPENDENT_EMPIRICAL_EVIDENCE'])must(ledger.truthBoundaries.includes(boundary),`ledger truth boundary missing ${boundary}`);
for(const token of ['issue **#435**','Every completed OMEGA advancement must publish','`DEPLOYED` is not equivalent to `RELEASE_CLEAN`','concurrent or superseded candidate','R207.2 is production-proven'])must(docs.includes(token),`repository ledger policy missing ${token}`);
for(const token of ['R207.2 LIVE PASS','49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'])must(verifier.includes(token),`production-proven R207.2 verifier identity missing ${token}`);

console.log('OMEGA R210 ADVANCEMENT LEDGER PASS · issue #435 human ledger + deployed stable index + mandatory SHA/PR/CI/Worker/live-proof/residual/next-boundary completion contract · forward-only repair + live-truth recovery + advanced-layer visibility laws · no execution or Canon authority added');
await import('./r210-forward-live-truth-invariants.mjs');
