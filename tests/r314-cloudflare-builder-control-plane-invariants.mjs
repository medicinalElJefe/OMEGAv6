import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('workers/builder/index.js', 'utf8');
const configText = fs.readFileSync('wrangler.builder.jsonc', 'utf8');
const config = JSON.parse(configText);
const workflow = fs.readFileSync('.github/workflows/r314-builder-control-plane.yml', 'utf8');
const contract = fs.readFileSync('R314_CLOUDFLARE_BUILDER_CONTROL_PLANE.md', 'utf8');

assert.equal(config.name, 'omega-v6-builder');
assert.equal(config.main, 'workers/builder/index.js');
assert.equal(config.workers_dev, true);
assert.equal(config.preview_urls, true);
assert.equal(config.services?.find((x) => x.binding === 'OMEGA_CANONICAL')?.service, 'omegav6');
assert.equal(config.durable_objects?.bindings?.find((x) => x.name === 'BUILD_LEDGER')?.class_name, 'OmegaBuilderLedger');
assert.equal(config.exports?.OmegaBuilderLedger?.type, 'durable-object');
assert.equal(config.exports?.OmegaBuilderLedger?.storage, 'sqlite');
assert.equal(config.workflows?.find((x) => x.binding === 'BUILD_CYCLE')?.class_name, 'OmegaBuildWorkflow');
assert.ok(config.workflows?.find((x) => x.binding === 'BUILD_CYCLE')?.schedules?.includes('7 * * * *'));

for (const marker of [
  'OMEGA_CLOUDFLARE_BUILDER_CONTROL_PLANE_V1',
  'OBSERVE_CORRELATE_LEDGER_ADVISE',
  "canonicalAdmission: 'R125'",
  "dispatchSelection: 'R147'",
  "durableExecutionHistory: 'R146'",
  "hybridReturnProof: 'R141'",
  "sourceSelfBuild: 'R170/R240'",
  "productionDeploymentWriter: 'ci.yml'",
  'sourceMutationAuthorized: false',
  'canonAdmissionAuthorized: false',
  'productionPromotionAuthorized: false',
  'EXACT_MAIN_PRODUCTION_PROOF_REQUIRED',
  'AUTONOMOUS_CANDIDATE_FENCE_VIOLATION',
]) {
  assert.ok(source.includes(marker), `missing builder authority marker: ${marker}`);
}

assert.ok(source.includes("method: 'GET'"), 'GitHub observation must be read-only');
assert.ok(!source.includes("method: 'POST',\n      headers: {\n        accept: 'application/vnd.github+json"), 'builder must not POST to GitHub');
assert.ok(!source.includes('api.github.com/repos/${repository}/git/refs'), 'builder must not mutate Git refs');
assert.ok(!source.includes('/merge'), 'builder must not merge source');
assert.ok(!source.includes('wrangler deploy'), 'runtime builder must not self-deploy');

assert.ok(workflow.includes('workflow_run:'), 'builder deployment must follow canonical CI rather than replace it');
assert.ok(workflow.includes('OMEGA Cloud Bridge CI'), 'builder deployment must be downstream of canonical CI');
assert.ok(workflow.includes('npx wrangler deploy --config wrangler.builder.jsonc --dry-run'), 'builder must dry-run before deploy');
assert.ok(workflow.includes('npx wrangler deploy --config wrangler.builder.jsonc'), 'builder deployment step missing');
assert.ok(workflow.includes('https://omega-v6-builder.jeffdeweyeljefe.workers.dev/api/health'), 'builder live health verification missing');
assert.ok(!workflow.includes('npx wrangler deploy --config wrangler.jsonc'), 'builder workflow must never deploy canonical omegav6');

for (const marker of [
  'R125', 'R147', 'R146', 'R141', 'R170/R240', 'ci.yml',
  'advisory', 'SQLite-backed Durable Object', 'Cloudflare Workflow',
]) {
  assert.ok(contract.includes(marker), `R314 contract missing ${marker}`);
}

console.log('R314 CLOUDFLARE BUILDER CONTROL PLANE PASS');
