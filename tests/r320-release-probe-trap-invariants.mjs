import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const release=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');
const probeCall='node scripts/probe_live_usability_r3199.mjs "$OMEGA_PUBLIC_URL" "$GITHUB_SHA" > "$BASELINE_PROBE_JSON"';

assert.ok(release.includes('trap restore_previous_on_error ERR'),'global release ERR trap must remain active for real failures');
assert.ok(release.includes('if '+probeCall+'; then'),'expected probe exit states must execute in an if-condition so ERR trap does not fire');
assert.ok(release.includes('BASELINE_PROBE_RC=0'),'clean probe state must remain explicit');
assert.ok(release.includes('BASELINE_PROBE_RC=$?'),'nonzero probe state must be captured without aborting release');
const window=release.slice(Math.max(0,release.indexOf(probeCall)-160),release.indexOf(probeCall)+probeCall.length+160);
assert.ok(!window.includes('set +e'),'probe handling must not depend on disabling errexit while ERR trap remains armed');
assert.ok(release.includes('elif [[ "$BASELINE_PROBE_RC" == "42" ]]'),'known interlock must continue into candidate recovery rather than aborting before upload');

console.log('R320 RELEASE PROBE TRAP PASS · expected interlock/indeterminate states no longer trigger rollback/error trap before candidate upload');
