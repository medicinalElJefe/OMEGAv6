import assert from 'node:assert/strict';
import fs from 'node:fs';

const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const verifier=fs.readFileSync('scripts/verify_public_build_receipt_convergence_r493.mjs','utf8');
const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');

const versionGate='verify_promotion_convergence_r491.mjs';
const receiptGate='verify_public_build_receipt_convergence_r493.mjs';
const visibleGate='verify_omega7_asset_coherence_r491.mjs promoted';
for(const token of [versionGate,receiptGate,visibleGate])assert.ok(staged.includes(token),`R493 release sequence missing ${token}`);
assert.ok(staged.indexOf(versionGate)<staged.indexOf(receiptGate),'R493 exact Worker convergence must precede public build-receipt convergence');
assert.ok(staged.indexOf(receiptGate)<staged.indexOf(visibleGate),'R493 public build-receipt convergence must precede promoted visible/executor proof');

for(const token of [
 "OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA",
 "Cloudflare-Workers-Version-Key",
 "/omega-build-receipt.json?r493=",
 "cache:'no-store'",
 "receipt?.source?.sha",
 "receipt?.promotion?.promotedMergeSha",
 "schema==='OMEGA_GOVERNED_BUILD_RECEIPT_V1'",
 "source===expected&&promoted===expected",
 "for(let attempt=1;attempt<=45;attempt++)",
 "await sleep(2000)",
 "bounded 90s window"
])assert.ok(verifier.includes(token),`R493 bounded public receipt convergence missing ${token}`);

assert.ok(live.includes("receipt?.source?.sha!==expectedSha"),'R493 must preserve R489 exact source SHA rejection');
assert.ok(live.includes("receipt?.promotion?.promotedMergeSha!==expectedSha"),'R493 must preserve R489 exact promoted merge SHA rejection');
assert.ok(!staged.includes('sleep 90'),'R493 must poll exact evidence rather than replace convergence with a blind fixed delay');

console.log('R493 PUBLIC RECEIPT CONVERGENCE PASS · sole Worker proof precedes bounded exact static-receipt convergence · promoted visible/executor proof remains exact-SHA fail-closed');
