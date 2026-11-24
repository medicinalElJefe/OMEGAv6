import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const get=(p)=>JSON.parse(readFileSync(p,'utf8'));
const a=get('audit/omega-active-full-build-ledger-r937.json');
const h=get('audit/omega-full-historical-software-ledger-r926.json');
const ar=get('audit/omega-drive-historical-archive-source-index-r936.json');
const donor=get('audit/omega-historical-donor-conservation-r922.json');
assert.equal(a.schema,'OMEGA_ACTIVE_FULL_BUILD_LEDGER_R937');
const releaseClean=a.releaseState==='RELEASE_CLEAN_PRODUCTION_PROVEN';
assert.ok(releaseClean||a.releaseState==='UNMERGED_CANDIDATE_NOT_RELEASE_CLEAN','unsupported release state');
assert.equal(a.sourceBaselineSha.length,40);
assert.equal(a.canonicalAdvancementIssue,'https://github.com/medicinalElJefe/OMEGAv6/issues/435');
const required={systems:h.software.length,menus:h.menus.length,controls:h.settings.length,capabilities:h.capabilities.length,stages:h.sequences.length,gates:h.gates.length,nativeRoutes:44,bins:24,outverse:12,inverse:12,outerAddresses:20736,innerAddressesPerCell:20736,addressPairs:20736*20736,archivedSplitFamilies:ar.groups.length,archivedNamedParts:ar.counts.discoveredParts,archivedCompanionZips:ar.counts.companionZipArchives,otherChatArchiveMetadata:donor.sourceInventory.chatGptArchiveFilesIndexed};
assert.deepEqual(a.invariants,required,'R937 active ledger must reconcile all historical source counts');
const requiredCounts={systems:100,menus:12,controls:36,capabilities:18,stages:144,gates:12,nativeRoutes:44,bins:24,outverse:12,inverse:12,outerAddresses:20736,innerAddressesPerCell:20736,addressPairs:429981696,archivedSplitFamilies:6,archivedNamedParts:156,archivedCompanionZips:18};
for(const [key,value] of Object.entries(requiredCounts))assert.equal(required[key],value,'historical scope lost '+key);
const routes=readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const match=/OMEGA7_NATIVE_ROUTES=Object\.freeze\(\[([\s\S]*?)\] as const/.exec(routes);
assert.ok(match,'native routes absent');
const native=new Set([...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
assert.equal(native.size,44);
assert.equal(a.workstreams.length,12,'missing one of 12 canonical workstreams');
assert.equal(a.releaseGates.length,12,'release proof gate omitted');
assert.equal(new Set(a.releaseGates).size,12);
assert.ok(a.laws.includes('NO_STAGE_PROMOTED_BEYOND_EVIDENCE'));
assert.ok(a.laws.includes('NO_SECOND_SHADOW_RUNTIME'));
assert.equal(new Set(a.workstreams.map(x=>x.id)).size,12);
for(const w of a.workstreams){
 assert.ok(existsSync(w.primarySource),'source missing for '+w.id+': '+w.primarySource);
 assert.ok(native.has(w.route),'not a native workspace '+w.id+': '+w.route);
 assert.ok(typeof w.complete==='boolean','workstream completion must be explicit '+w.id);
 assert.ok(['PARTIAL','HELD','DEVICE_HELD','RELEASE_HELD','VERIFIED'].includes(w.evidenceState),'unsupported state '+w.id);
 if(w.complete){
  assert.equal(w.evidenceState,'VERIFIED','completed workstream not independently verified '+w.id);
  assert.ok(w.acceptanceProof&&typeof w.acceptanceProof==='object','missing exact workstream proof '+w.id);
  assert.match(w.acceptanceProof.sourceSha||'',/^[a-f0-9]{40}$/,'missing exact source SHA '+w.id);
  assert.ok(Array.isArray(w.acceptanceProof.proofUrls)&&w.acceptanceProof.proofUrls.length>=1,'missing proof evidence URLs '+w.id);
  for(const url of w.acceptanceProof.proofUrls)assert.match(url,/^https:\/\/github\.com\/medicinalElJefe\/OMEGAv6\/(?:actions\/runs\/\d+|commit\/[a-f0-9]{40}|pull\/\d+)(?:\/|$)/,'unverifiable workstream proof link '+w.id);
  assert.equal(w.acceptanceProof.accepted,true,'missing independent acceptance '+w.id);
 }else assert.notEqual(w.evidenceState,'VERIFIED','workstream promoted without complete proof '+w.id);
}
assert.ok(a.blockers.length>=9,'open historical issues silently dropped');
assert.equal(new Set(a.blockers.map(x=>x.id)).size,a.blockers.length);
for(const b of a.blockers){
 assert.ok(native.has(b.route),'blocker owner route absent '+b.id);
 assert.ok(['OPEN','RESOLVED'].includes(b.state),'unknown blocker state '+b.id);
 if(b.state==='RESOLVED'){
  assert.ok(b.resolutionReceipt&&typeof b.resolutionReceipt==='object','blocker closed without immutable receipt '+b.id);
  assert.match(b.resolutionReceipt.sourceSha||'',/^[a-f0-9]{40}$/,'blocker missing exact candidate commit '+b.id);
  assert.match(b.resolutionReceipt.observedSha256||'',/^[a-f0-9]{64}$/,'blocker missing observed artifact digest '+b.id);
  assert.match(b.resolutionReceipt.proofUrl||'',/^https:\/\/github\.com\/medicinalElJefe\/OMEGAv6\/actions\/runs\/\d+$/,'blocker without exact CI proof URL '+b.id);
  assert.equal(b.resolutionReceipt.accepted,true,'blocker evidence not independently accepted '+b.id);
 }else assert.ok(!b.resolutionReceipt,'unproven issue has resolution receipt '+b.id);
}
const requiredBlockers=['HISTORY','ZIP_BYTES','V61','BIN_PARITY','FAMILY_PARITY','MODE_PARITY','NATIVE_PC','UI_PARITY','RELEASE'];
for(const id of requiredBlockers)assert.ok(a.blockers.some(b=>b.id===id),'missing critical restoration debt '+id);
assert.equal(a.gateReceipts.length,a.releaseGates.length,'each release gate must have an explicit receipt state');
assert.deepEqual(a.gateReceipts.map(g=>g.id),a.releaseGates,'release proof gate reordered or dropped');
for(const g of a.gateReceipts){
 assert.ok(['HELD','PROVEN'].includes(g.state),'unsupported acceptance gate state '+g.id);
 if(g.state==='PROVEN'){
  assert.ok(g.proof&&typeof g.proof==='object','gate promoted without proof '+g.id);
  assert.match(g.proof.candidateSha||'',/^[a-f0-9]{40}$/,'gate lacks exact source candidate '+g.id);
  assert.match(g.proof.observedSha256||'',/^[a-f0-9]{64}$/,'gate lacks observed evidence hash '+g.id);
  assert.match(g.proof.workflowUrl||'',/^https:\/\/github\.com\/medicinalElJefe\/OMEGAv6\/actions\/runs\/\d+$/,'gate lacks exact workflow receipt '+g.id);
  assert.equal(g.proof.accepted,true,'gate not independently accepted '+g.id);
 }else assert.equal(g.proof,null,'HELD gate cannot store false PASS '+g.id);
}
if(releaseClean){
 assert.equal(a.blockers.filter(b=>b.state==='OPEN').length,0,'release has open blocker');
 assert.equal(a.workstreams.filter(w=>!w.complete).length,0,'release has unproven workstream');
 assert.equal(a.gateReceipts.filter(g=>g.state!=='PROVEN').length,0,'release has held proof gates');
 assert.match(a.releaseAcceptance?.mergeSha||'',/^[a-f0-9]{40}$/,'release lacks canonical merge proof');
 assert.match(a.releaseAcceptance?.workerVersion||'',/^[a-f0-9-]{36}$/,'release lacks deployed Worker version');
 assert.equal(a.releaseAcceptance?.postDeployVerified,true,'release lacks post-deployment acceptance');
 assert.equal(a.releaseAcceptance?.rollbackEligible,true,'release lacks rollback-eligible baseline');
}else assert.equal(a.releaseAcceptance,undefined,'candidate cannot claim a production receipt');
assert.ok(a.transitionRules&&a.completionRule,'build completion transition laws absent');
assert.ok(a.buildHistory.length>=19,'historical advancement history dropped');
for(const id of Array.from({length:19},(_,i)=>'R'+(936+i)))assert.ok(a.buildHistory.some(h=>h.revision===id),'governed repair disappeared '+id);
assert.equal(a.isolatedB043ModuleProof,'audit/omega-b043-module-test-evidence-r949.json');
assert.equal(a.reconstructedB053R7SourceEvidence,'audit/omega-b053-r7-full-source-acceptance-r950.json');
assert.equal(a.originalB053R7ModuleEvidence,'audit/omega-b053-r7-isolated-module-parity-r951.json');
assert.equal(a.recoveredV35SourceEvidence,'audit/omega-v35-full-source-acceptance-r953.json');
assert.equal(a.v35OriginalAtlasSqliteEvidence,'audit/omega-v35-original-atlas-db-r954.json');
assert.deepEqual(a.archiveReleaseIds,ar.groups.map(x=>x.id));
assert.ok(a.sourceTruth.includes('METADATA_IS_NOT_ZIP_BYTES'));
assert.ok(a.sourceTruth.includes('CI_IS_NOT_NATIVE_DEVICE_PROOF'));
const ui=readFileSync('src7/OmegaOneSystemLedgerR926.tsx','utf8');
for(const flag of ['data-r937-governing-build-ledger','data-r937-workstream','data-r937-blocker','activeBuild.gateReceipts',"setTab('BUILD')"])assert.ok(ui.includes(flag),'active ledger inaccessible '+flag);
const docs=readFileSync('docs/OMEGA_ADVANCEMENT_LEDGER.md','utf8');
assert.ok(docs.includes('omega-active-full-build-ledger-r937.json'),'canonical advancement index missing active ledger');
console.log('R946 LEDGER TRANSITION PASS · 12 workstreams, 12 evidence-gated release receipts, 9 carried blockers, 10 revision history entries; evidence-based completion possible without false promotion.');
