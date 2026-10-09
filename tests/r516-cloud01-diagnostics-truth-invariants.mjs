import assert from 'node:assert/strict';
import fs from 'node:fs';
const diag=fs.readFileSync('scripts/r515-cloud01-cycle-diagnostics.mjs','utf8');
assert.match(diag,/OMEGA_CLOUD01_DIAGNOSTIC_RECEIPT_R515/);
assert.match(diag,/externalCloudflareInvocationEvidence:'NOT_OBSERVED'/);
assert.match(diag,/githubHandoffEvidence:'NOT_OBSERVED'/);
console.log('R516 CLOUD-01 diagnostics truth boundary PASS');
