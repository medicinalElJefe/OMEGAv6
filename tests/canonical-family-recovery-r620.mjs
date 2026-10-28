import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {auditCanonicalFamiliesR620} from '../scripts/canonical-family-recovery-r620.mjs';
test('R650 family recovery is conservative and preserves all current identities',async()=>{
 const r=await auditCanonicalFamiliesR620();
 assert.equal(r.authority,'OMEGA_YEAR_CORPUS_CAPABILITY_CONSERVATION_R650');
 assert.equal(r.familyCount,12);
 assert.deepEqual(r.duplicateIds,[]);
 assert.equal(r.productionVerifiedByThisReport,0);
 assert.equal(r.unresolved,12);
 for(const f of r.families)assert.equal(f.status,'RECOVERY_INCOMPLETE');
});

test('forged in-ledger production flags cannot resolve a family or prove source presence',async()=>{
 const ledger=JSON.parse(await readFile(new URL('../canon/year-corpus-capability-conservation-r650.json',import.meta.url),'utf8'));
 ledger.families[0].productionProved=true;
 ledger.families[0].missingEvidence=[];
 const r=await auditCanonicalFamiliesR620(ledger);
 assert.equal(r.familyCount,12);
 assert.equal(r.unresolved,12,'source-only attestations cannot reduce unresolved count');
 assert.equal(r.productionVerifiedByThisReport,0);
 assert.equal(r.families[0].status,'UNVERIFIED_ATTESTATION');
 assert.equal(r.families[0].claimedProductionProof,true);
 assert.equal(r.families[0].sourcePresent,false,'a source hint is not a file readback');
});
