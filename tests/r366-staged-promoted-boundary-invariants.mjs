import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const staged=readFileSync('scripts/verify_staged_release.mjs','utf8');
const federation=readFileSync('scripts/verify_federation_live_r1681.mjs','utf8');

const stagedR168Call="['scripts/verify_federation_live_r1681.mjs'],{\n  stdio:'inherit',\n  env:{...childEnv,OMEGA_PROMOTED_SHA:'',OMEGA_STAGED_READ_ONLY:'1'}";
const stagedR202Call="['scripts/verify_live_operational_source_authority_r202.mjs'],{\n  stdio:'inherit',\n  env:{...childEnv,OMEGA_PROMOTED_SHA:'',OMEGA_STAGED_READ_ONLY:'1'}";

assert.ok(staged.includes(stagedR168Call),'R366 staged R168.1 child must suppress promoted-only R199 proof');
assert.ok(staged.includes(stagedR202Call),'R366 staged R202 child must remain read-only and promoted-sha suppressed');
assert.ok(federation.includes("if(String(process.env.OMEGA_PROMOTED_SHA||'').trim())"),'R366 requires R168.1 promoted-only R199 gate to remain explicit');
assert.ok(federation.includes("await import('./verify_live_execution_control_r199.mjs')"),'R366 requires R199 to remain present for true promoted-live execution');
assert.ok(staged.includes('Worker-internal ASSETS fetches can still'),'R366 staged proof boundary rationale must remain documented next to the suppression');
assert.ok(staged.includes('Exact R199 source binding is therefore'),'R366 must document that exact R199 source binding moves to post-promotion canonical proof');

console.log('R366 STAGED/PROMOTED BOUNDARY PASS · candidate semantic proof remains version-overridden/read-only · promoted-only R199 is suppressed before traffic promotion and retained after promotion');
