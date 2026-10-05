import fs from 'node:fs';
import assert from 'node:assert/strict';

const workflow=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');

assert.match(workflow,/permissions:\n  contents: read\n  actions: read/,'R469 must grant read-only Actions visibility for exact-base proof lookup');
assert.ok(workflow.includes("inherit: ${{ steps.inherit.outputs.inherit }}"),'R469 preflight must expose inheritance decision');
assert.ok(workflow.includes("file.startsWith('docs/')&&file.endsWith('.md')"),'R469 inheritance must be restricted to docs/*.md-only diffs');
assert.ok(workflow.includes("run.name==='R241 Archive Convergence Visual Intelligence'"),'R469 must bind inheritance to the same R241 proof authority');
assert.ok(workflow.includes("run.status==='completed'&&")&&workflow.includes("run.conclusion==='success'&&"),'R469 must require completed successful base proof');
assert.ok(workflow.includes("String(run.head_sha||'')===base"),'R469 must require proof for the exact base SHA');
assert.ok(workflow.includes("manual dispatch requires direct exact-head proof"),'R469 manual dispatch must never inherit');
assert.ok(workflow.includes("needs.stale-head-preflight.outputs.inherit == 'true'"),'R469 must have an explicit inherited-proof job');
assert.equal((workflow.match(/needs\.stale-head-preflight\.outputs\.inherit != 'true'/g)||[]).length,2,'Both expensive R241 jobs must execute unless inheritance is explicitly valid');
assert.ok(workflow.includes('Any runtime, workflow, test, script, package, configuration or other non-documentation change forces the unchanged direct R241 proof jobs.'),'R469 summary must state the fail-closed boundary');

console.log('R469 PROOF INHERITANCE PASS · exact-base successful R241 required · docs-only successor only · all runtime/proof changes remain direct-proof · manual dispatch remains direct-proof');
