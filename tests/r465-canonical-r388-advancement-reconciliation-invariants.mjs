import assert from'node:assert/strict';
import fs from'node:fs';

const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));

assert.match(machine,/export function canonicalAdvancedItemIdsR465/);
assert.match(machine,/row\?\.status==='RELEASE_CLEAN'/);
assert.match(machine,/\^\[0-9a-f\]\{40\}\$/);
assert.match(machine,/row\?\.canonicalAdmission===false/);
assert.match(machine,/reconciledAdvancedItemIds=\[\.\.\.new Set\(\[\.\.\.\(state\.r388AdvancedItemIds\|\|\[\]\),\.\.\.canonicalAdvancedItemIds\]\)\]/);
assert.match(machine,/advancedItemIds:reconciledAdvancedItemIds/);
assert.ok(machine.includes('observedCanonicalAdvancedItemIdsR465'),'R465 must recover release-clean R388 items from repository evidence when the durable ledger missed them');
assert.ok(machine.includes('observedRepositoryAdvancedItemIdsR465'),'R465 must reconcile recent merged R388 PRs against exact successful main-push production proof');
assert.ok(machine.includes("run?.event==='push'&&"),'observed advancement requires a push event');
assert.ok(machine.includes("run?.head_branch==='main'&&"),'observed advancement requires canonical main');
assert.ok(machine.includes("run?.status==='completed'&&run?.conclusion==='success'"),'observed advancement requires completed successful production proof');
assert.ok(machine.includes('/compare/${mergeSha}...${mainSha}'),'observed advancement must prove the merged release remains an ancestor of current main');

const b02=(state.r388CanonicalAdvancements||[]).find(x=>x.itemId==='R388-B-02');
assert.ok(b02,'R465 must record canonical R464 advancement for B-02');
assert.equal(b02.status,'RELEASE_CLEAN');
assert.equal(b02.sourceRevision,'R464');
assert.equal(b02.candidateHead,'854ebc20eb2049c32194ea106b9296cc6b4e2caa');
assert.equal(b02.mergeSha,'7a3531b9ab8a84c5be2a98dc3a6a1212993f3430');
assert.equal(b02.productionRunId,37239405261);
assert.equal(b02.historicalMarkdownMutated,false);
assert.equal(b02.canonicalAdmission,false);
assert.equal(b02.directProductionMutation,false);

const c01=(state.r388CanonicalAdvancements||[]).find(x=>x.itemId==='R388-C-01');
assert.ok(c01,'R465 reconciliation must retain the already promoted C-01 advancement so CLOUD-01 cannot replay it');
assert.equal(c01.status,'RELEASE_CLEAN');
assert.equal(c01.candidateHead,'0bf3f967068df40682f4c6cfcdc8c8574cf00cf1');
assert.equal(c01.mergeSha,'b59a00baa70f9b4faeb2b75114aff576b68b004e');
assert.equal(c01.productionRunId,37258201690);
assert.equal(c01.historicalMarkdownMutated,false);
assert.equal(c01.canonicalAdmission,false);
assert.equal(c01.directProductionMutation,false);

console.log('R465 CANONICAL R388 ADVANCEMENT RECONCILIATION PASS · independently proven release-clean convergence may enter advancedItemIds only through canonical proof-bound receipts · historical markdown remains immutable · declines/observe-only states do not self-advance');
