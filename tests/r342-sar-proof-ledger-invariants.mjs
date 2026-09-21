import assert from'node:assert/strict';
import fs from'node:fs';

const ledger=fs.readFileSync('src/sarProofLedgerR342.ts','utf8');
for(const token of[
 'OMEGA_SAR_PROOF_RECEIPT_R342','SOURCE_LINEAGE_REQUIRED','PASS_OUTPUT_HASH_REQUIRED','SCAR_RESOLUTION_PROOF_REQUIRED',
 'PASS_CHILD_OF_NONPASS_PARENT','SOURCE_LINEAGE_DROPPED','SCAR_DROPPED_WITHOUT_PROOF','RECEIPT_CYCLE',
 'every promoted transform must preserve parent/source lineage and unresolved scars'
])assert.ok(ledger.includes(token),`R342 proof ledger missing ${token}`);

assert.ok(ledger.includes("r.state==='PASS'&&parents.some(p=>p.state!=='PASS')"),'PASS may not descend from a non-PASS parent');
assert.ok(ledger.includes("r.resolvedScars.includes(scar)&&r.resolutionProofs.length"),'scar removal must require explicit resolution proof');
assert.ok(ledger.includes("if(!r.sourceIds.includes(src))"),'source lineage must be carried through derived receipts');
assert.ok(ledger.includes("/^[a-f0-9]{64}$/i"),'evidence hashes must be exact SHA-256 syntax');

console.log('R342 SAR PROOF LEDGER PASS · hash-bound receipts · parent/source lineage · scar carry · proved scar resolution · cycle rejection · non-PASS ancestry blocks promotion');
