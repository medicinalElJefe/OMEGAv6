import test from 'node:test';
import assert from 'node:assert/strict';
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
