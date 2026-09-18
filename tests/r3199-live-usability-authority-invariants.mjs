import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const probe=readFileSync(new URL('../scripts/probe_live_usability_r3199.mjs',import.meta.url),'utf8');
const release=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');

for(const token of [
  'OMEGA_LIVE_USABILITY_PROBE_R3199',
  'BLOCKED_BY_APPLICATION_WITHHOLDING_INTERLOCK',
  'ROLLBACK_USABILITY_NOT_PROVED',
  'ROLLBACK_SURFACE_PROVISIONALLY_USABLE',
  'LIVE BINDING INTERLOCK',
  'VERIFYING LIVE BINDINGS',
  'R211 provenance',
  'R205 whole-system health'
]) assert.ok(probe.includes(token),`missing R319.9 probe token: ${token}`);

assert.ok(probe.includes("fetchedScripts<1||failures.length"),'rollback usability must fail closed when the deployed bundle graph cannot be inspected');
assert.ok(probe.includes("process.exit(42)"),'positive interlock detection must have a distinct nonzero state');
assert.ok(release.includes('BASELINE_USABLE=0'),'rollback authority must start unproved');
assert.ok(release.includes('BASELINE_PROBE_RC'),'release membrane must consume the bundle-level usability probe');
assert.ok(release.includes('if [[ "$BASELINE_PROBE_RC" == "0" ]]'),'only a clean probe may grant rollback authority');
assert.ok(release.includes('elif [[ "$BASELINE_PROBE_RC" == "42" ]]'),'known interlock state must be handled explicitly');
assert.ok(!release.includes('preserving normal rollback semantics unless the exact interlock is positively identified'),'unreadable surfaces must not silently inherit rollback authority');

console.log('R319.9 LIVE USABILITY AUTHORITY PASS · client-rendered interlocks and indeterminate deployed bundles cannot be treated as last-known-good');
