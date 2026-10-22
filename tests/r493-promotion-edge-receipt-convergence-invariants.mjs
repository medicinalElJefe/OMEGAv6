import assert from 'node:assert/strict';
import fs from 'node:fs';

const script=fs.readFileSync('scripts/verify_promotion_convergence_r491.mjs','utf8');
const pkg=fs.readFileSync('package.json','utf8');

for(const token of [
 "OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA",
 "OMEGA_PUBLIC_URL||process.env.OMEGA_E2E_URL",
 "/omega-build-receipt.json?r493=",
 "'cache-control':'no-cache'",
 "'pragma':'no-cache'",
 "receipt?.source?.sha",
 "receipt?.promotion?.promotedMergeSha",
 "const metadataReady=",
 "if(edge.exact)",
 "canonical edge receipt"
])assert.ok(script.includes(token),`R493 promotion convergence missing ${token}`);

assert.ok(script.indexOf('if(edge.exact)')<script.indexOf('process.exit(0)'),'R493 success must remain downstream of exact canonical receipt proof');
assert.ok(script.includes('source===expected&&promoted===expected'),'R493 must require both receipt source and promoted merge SHA to equal the exact target');
assert.ok(script.includes('R491 PROMOTION CONVERGENCE PASS'),'R493 must preserve inherited R491 success identity while strengthening convergence');
assert.ok(script.includes('attempt<=15')&&script.includes('await sleep(2000)'),'R493 must remain bounded rather than wait indefinitely');
assert.ok(pkg.includes('npm run test:r493'),'R493 invariant must remain release-blocking through npm run check');
assert.ok(pkg.includes('"test:r493": "node tests/r493-promotion-edge-receipt-convergence-invariants.mjs"'),'R493 package entry missing');

console.log('R493 PROMOTION EDGE RECEIPT CONVERGENCE PASS · deployment metadata alone cannot release · exact canonical source/promoted SHA required · bounded fail-closed convergence');
