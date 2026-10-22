import fs from 'node:fs';
import assert from 'node:assert/strict';
const src=fs.readFileSync('src/sovereignLauncherR117.ts','utf8');
assert.ok(src.includes('set "OMEGA_RCWA_ROOT=!OMEGA_ROOT!OMEGA_RCWA"'), 'RCWA must use a dedicated root');
assert.ok(src.includes('--root "!OMEGA_RCWA_ROOT!"'), 'RCWA must not receive the trailing-backslash Hybrid root');
assert.ok(!src.includes('--root "!OMEGA_ROOT!"\\r\\ngoto :connect'), 'RCWA must not reuse the Hybrid root argument');
console.log('R647 RCWA root quoting invariants PASS');
