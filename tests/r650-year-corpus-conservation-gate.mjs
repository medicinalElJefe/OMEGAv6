import fs from 'node:fs';import assert from 'node:assert/strict';
const ledger=JSON.parse(fs.readFileSync('canon/year-corpus-capability-conservation-r650.json','utf8'));
assert.equal(ledger.schema,'OMEGA_YEAR_CORPUS_CAPABILITY_CONSERVATION_R650');
assert.equal(ledger.policy.admission,'SOURCE_AND_RUNTIME_AND_PRODUCTION_PROOF');
assert.equal(ledger.policy.no_synthetic_legacy_recovery,true);
assert.ok(ledger.families.length>=12);
const ids=new Set();let unresolved=0;
for(const family of ledger.families){
 assert.ok(!ids.has(family.id),'duplicate capability family: '+family.id);ids.add(family.id);
 assert.ok(family.description&&family.truthClass);
 assert.ok(Array.isArray(family.sourceHints)&&Array.isArray(family.missingEvidence));
 for(const hint of family.sourceHints){assert.ok(fs.existsSync(hint),'missing source hint '+hint)}
 if(family.productionProved){assert.ok(family.productionProof?.deploymentSha&&family.productionProof?.receipt&&family.productionProof?.observedAt,'production claims require exact SHA, receipt and timestamp: '+family.id)}
 else unresolved++;
}
for(const id of ['atlas-state','relational-continuity','developmental-continuity','native-runtime','renderer-traversal','observation','memory-intelligence','command-execution','federation','governance-proof','applications'])assert.ok(ids.has(id),'missing historical family '+id);
console.log('R650 year-corpus conservation gate PASS; '+ledger.families.length+' families; '+unresolved+' without production proof (not falsely admitted)');
