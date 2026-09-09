import assert from 'node:assert/strict';
import fs from 'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');

assert.ok(ci.includes('npm audit --audit-level=high'),'canonical CI must continue enforcing the locked dependency audit at high severity');
assert.ok(!ci.includes('locked application dependency audit fails at high severity'),'deployment receipt must not claim a successful audit failed');
assert.ok(ci.includes('locked application dependency audit enforced at high severity; current run result is reported by the audit step'),'deployment receipt must describe enforcement without fabricating the run result');
assert.equal((ci.match(/branches: \[main, full-restore\]/g)||[]).length,1,'ci.yml remains the existing canonical main-push workflow');
assert.ok(ci.includes("if: github.ref == 'refs/heads/main' && (github.event_name == 'push' || github.event_name == 'workflow_dispatch')"),'existing deploy-main authority must remain main-bound');
assert.ok(ci.includes('R125 admission preserved')||ci.includes('R125'),'R125 authority proof must remain represented in canonical CI');

console.log('R248.1 DEPLOYMENT RECEIPT AUDIT TRUTH PASS · high-severity audit enforcement retained · false failure prose removed · canonical production writer unchanged');
