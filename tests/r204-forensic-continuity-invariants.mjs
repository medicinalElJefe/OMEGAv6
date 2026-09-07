import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildForensicContinuityLedgerR204,driveObservationR204,verifyForensicContinuityLedgerR204,R204_AUTHORITY_FILES,R204_LAWS} from '../scripts/forensicContinuityR204.mjs';

const observation=driveObservationR204();
assert.equal(observation.state,'PARTIAL_BYTE_BOUND_CONNECTED_DRIVE_OBSERVATION');
assert.equal(observation.exhaustive,false);assert.equal(observation.liveDriveAuthority,false);assert.equal(observation.externalFilesIncludedInRuntime,false);assert.equal(observation.repositorySnapshotAuthority,'R48');
assert.equal(observation.rawByteBound.length,3);assert.equal(observation.metadataObserved.length,8);
const expectedDrive=new Map([
 ['OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx',[89860,'32bd230a02040d3d283e561bc44a136ab0a0738c96206a866ea41ecba84275b4']],
 ['OMEGA_ONE_SYSTEM_J_DRIVE_1728D_AUTOPING_LEDGER.xlsx',[251241,'6cf5ca001a962f98f8f97aa4e772716518dde473722d36bfd80706e6e4d95ea6']],
 ['OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx',[4808795,'688f85cc8f64cc8cf6cc9effd694d0bb46342e05f04598868e20de0dad4afe97']]
]);
for(const item of observation.rawByteBound){const expected=expectedDrive.get(item.title);assert.ok(expected,`unexpected Drive byte binding ${item.title}`);assert.equal(item.bytes,expected[0]);assert.equal(item.sha256,expected[1]);assert.equal(item.retrieval,'GOOGLE_DRIVE_RAW_STORED_XLSX')}
const observationText=fs.readFileSync('public/omega-drive-observation-r204.json','utf8');assert.doesNotMatch(observationText,/docs\.google\.com|drive\.google\.com|sediment:\/\/|"id"\s*:/i,'R204 repository observation must not persist connector URLs or file IDs');assert.match(observationText,/not asserted here as literal physical dimensions/);

for(const [path] of R204_AUTHORITY_FILES)assert.equal(fs.existsSync(path),true,`R204 authority file missing ${path}`);
for(const law of ['HASH_IDENTITY_IS_NOT_INDEPENDENT_EMPIRICAL_CORROBORATION','DESCENDANT_ARTIFACTS_MAY_NOT_SELF_CONFIRM_ANCESTOR_TRUTH','AT09_REQUIRES_HOST_HEALTH_RECEIPT_AND_IS_NOT_CLOSED_BY_HEARTBEAT_ALONE','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R204_LAWS.includes(law),`R204 law missing ${law}`);
const shaA='a'.repeat(40),shaB='b'.repeat(40),shaC='c'.repeat(40);
const ledger=buildForensicContinuityLedgerR204({GITHUB_ACTIONS:'true',GITHUB_SHA:shaA,GITHUB_REF_NAME:'main',OMEGA_PROMOTED_SHA:shaA,OMEGA_CANDIDATE_SHA:shaB,OMEGA_ROLLBACK_SHA:shaC});
assert.equal(verifyForensicContinuityLedgerR204(ledger,{againstRepository:true}),true);assert.equal(ledger.state,'PRODUCTION_BOUND_FORENSIC_CONTINUITY');assert.equal(ledger.source.sha,shaA);assert.equal(ledger.lineage.promotedMergeSha,shaA);assert.equal(ledger.archiveResiduals.AT09.closed,false);assert.equal(ledger.archiveResiduals.AT09.state,'HOST_HEALTH_RECEIPT_REQUIRED');assert.equal(ledger.archiveResiduals.AT10.closed,true);assert.equal(ledger.archiveResiduals.AT10.externalArchiveFullyHashed,false);assert.equal(ledger.executionClaimed,false);assert.equal(ledger.independentEmpiricalEvidenceClaimed,false);assert.equal(ledger.canonicalMutation,false);assert.equal(ledger.canonicalAdmissionAuthority,'R125');assert.equal(ledger.livingWorldDispatchAuthority,'R180/R147');assert.equal(ledger.driveBinding.rawByteBoundCount,3);

const vite=fs.readFileSync('vite.config.ts','utf8'),governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8')),r202=fs.readFileSync('public/omega-operational-source-authority-r202.js','utf8'),r202core=fs.readFileSync('public/omega-operational-source-authority-r202-core.js','utf8'),r202html=fs.readFileSync('public/omega-operational-source-authority-r202.html','utf8'),workflow=fs.readFileSync('.github/workflows/r204-forensic-continuity-ledger.yml','utf8'),wrangler=fs.readFileSync('wrangler.jsonc','utf8');
assert.ok(vite.includes("from './scripts/forensicContinuityR204.mjs'")&&vite.includes('forensicContinuityPluginR204()'),'R204 Vite forensic compiler not wired');assert.equal(governor.currentCapabilityFloor,'R204');assert.deepEqual(governor.postR180ProofContinuity,['R200','R200.1','R202','R202.1','R204']);assert.equal(governor.selfBuild.latestExplicitSuccessorProof,'tests/r204-forensic-continuity-invariants.mjs');assert.equal(governor.preservedRuntime.livingWorldExecutionDispatch,'R180_EXPLICIT_DISPATCH_R147_AUTHORITY');assert.equal(governor.selfBuild.canonicalAdmissionAuthority,'R125');
assert.match(workflow,/permissions:\s*\n\s+contents:\s*read/i);assert.doesNotMatch(workflow,/\bschedule\s*:|contents:\s*write|gh\s+pr\s+merge|gh\s+workflow\s+run|git\s+push\s+origin\s+HEAD:main/i);assert.ok(workflow.includes('actions/checkout@v7')&&workflow.includes('actions/setup-node@v7'));
assert.ok(r202.includes("get('/omega-forensic-continuity-r204.json')"),'R202 workstation does not read R204 forensic ledger');assert.ok(r202core.includes('reconcileForensicContinuityR204'),'R202 core does not expose R204 forensic projection');assert.ok(r202html.includes('AT10 · R204'),'R202 HTML does not surface R204 forensic residual state');
for(const retired of ['OmegaMissionLedgerR201','OmegaHybridMissionLedgerR203']){assert.ok(wrangler.includes(`"${retired}": {"type": "durable-object", "state": "deleted"}`));assert.ok(!wrangler.includes(`"class_name": "${retired}"`))}
if(fs.existsSync('dist/omega-forensic-continuity-r204.json')){const emitted=JSON.parse(fs.readFileSync('dist/omega-forensic-continuity-r204.json','utf8'));assert.equal(verifyForensicContinuityLedgerR204(emitted,{againstRepository:true}),true)}
console.log(`R204 FORENSIC CONTINUITY PASS · ${ledger.entries.length} repository authority hashes · 3 raw Drive donor hashes · AT10 repository ledger implemented · AT09 remains host-health gated · R180/R147 + R125 preserved`);
