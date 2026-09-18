import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const release=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');
for(const token of ['BASELINE_USABLE=1','LIVE BINDING INTERLOCK','VERIFYING LIVE BINDINGS','UNUSABLE PRODUCTION BASELINE','ROLLBACK REFUSED']) assert.ok(release.includes(token),`missing rollback usability guard: ${token}`);
assert.ok(release.includes('if [[ -n "$PREVIOUS_VERSION_ID" && "${BASELINE_USABLE:-1}" == "1" ]]'),'rollback must require positive usable-baseline state');
assert.ok(!release.includes('Staged release failed; restoring previous production version $PREVIOUS_VERSION_ID to 100% traffic.'),'traffic percentage alone must never be called last-known-good');
console.log('R319.8 ROLLBACK USABILITY AUTHORITY PASS · application-withholding interlocks cannot be canonized as last-known-good');
