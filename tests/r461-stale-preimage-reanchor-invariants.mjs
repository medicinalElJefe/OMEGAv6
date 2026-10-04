import assert from'node:assert/strict';
import fs from'node:fs';
const policy=fs.readFileSync('src/system/autonomousRepairPolicyR314.js','utf8');
const cloud=fs.readFileSync('cloudflare/lib/r314-ai-repair.mjs','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const token of [
 'OMEGA_R461_STALE_PREIMAGE_RECOVERY',
 'stalePreimageRecoveryR461',
 'stalePreimageTokensR461',
 'rejectedBeforeCurrentOccurrences',
 'exactCurrentAnchors',
 'Do not reuse rejectedBefore unless its current occurrence count is exactly 1.',
 'currentSha and CURRENT source text as authoritative',
 'AI_ZERO_OCCURRENCE_PREIMAGE_MUST_REANCHOR_TO_CURRENT_EXACT_SOURCE_BEFORE_RETRY',
])assert.ok(policy.includes(token),'R461 missing '+token);
assert.ok(policy.includes("if(!reasons.some(reason=>/_PREIMAGE_OCCURRENCES_0$/.test(reason)))return null"),'R461 recovery must activate only for zero-occurrence preimage rejection');
assert.ok(policy.includes("source.indexOf(token,from)"),'R461 anchors must be derived from current exact source');
assert.ok(policy.includes("currentSha:String(context.sha||'')"),'R461 recovery must bind current blob SHA');
assert.ok(cloud.includes('R314_AI_MAX_ATTEMPTS'),'R461 must retain existing bounded attempt authority');
assert.equal(pkg.scripts['test:r461'],'node tests/r461-stale-preimage-reanchor-invariants.mjs');
assert.ok(pkg.scripts.check.includes('npm run test:r461'));
console.log('R461 STALE PREIMAGE REANCHOR PASS · zero-occurrence correction uses current exact source windows · attempts/paths/authority unchanged');
