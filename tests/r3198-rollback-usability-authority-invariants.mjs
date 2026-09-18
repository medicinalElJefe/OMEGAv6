import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const release=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');
for(const token of ['BASELINE_USABLE=0','ROLLBACK USABILITY UNPROVED','UNUSABLE PRODUCTION BASELINE','ROLLBACK REFUSED','probe_live_usability_r3199.mjs']) assert.ok(release.includes(token),`missing rollback usability guard: ${token}`);
assert.ok(release.includes('if [[ -n "$PREVIOUS_VERSION_ID" && "${BASELINE_USABLE:-0}" == "1" ]]'),'rollback must require positive proved-usable baseline state');
assert.ok(!release.includes('Staged release failed; restoring previous production version $PREVIOUS_VERSION_ID to 100% traffic.'),'traffic percentage alone must never be called last-known-good');
console.log('R319.8/R319.9 ROLLBACK USABILITY AUTHORITY PASS · traffic ownership and unreadable state cannot become last-known-good');
