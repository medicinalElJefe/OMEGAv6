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

console.log('R465 CANONICAL R388 ADVANCEMENT RECONCILIATION PASS · independently proven release-clean convergence may enter advancedItemIds only through canonical proof-bound receipts · historical markdown remains immutable · declines/observe-only states do not self-advance');
