import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('workers/builder/index.js', 'utf8');
const configText = fs.readFileSync('wrangler.builder.jsonc', 'utf8');
const config = JSON.parse(configText);
const ci = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
const contract = fs.readFileSync('R318_CLOUDFLARE_BUILDER_CONTROL_PLANE.md', 'utf8');

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
  "const REVISION = 'R318'",
  'OMEGA_R318_OBSERVATION_V1',
  'OMEGA_R318_BUILD_DECISION_V1',
  'OMEGA_R318_BUILD_RECEIPT_V1',
  'OMEGA_R318_LEDGER_STATE_V1',
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
  assert.ok(source.includes(marker), `missing Builder authority marker: ${marker}`);
}

for (const retired of ["const REVISION = 'R314'", "const REVISION = 'R316'", "const REVISION = 'R317'"]) {
  assert.ok(!source.includes(retired), `Builder revision collision: ${retired}`);
}
assert.ok(source.includes("method: 'GET'"), 'GitHub observation must be read-only');
assert.ok(!source.includes("method: 'POST',\n      headers: {\n        accept: 'application/vnd.github+json"), 'Builder must not POST to GitHub');
assert.ok(!source.includes('api.github.com/repos/${repository}/git/refs'), 'Builder must not mutate Git refs');
assert.ok(!source.includes('/merge'), 'Builder must not merge source');
assert.ok(!source.includes('wrangler deploy'), 'runtime Builder must not self-deploy');

assert.ok(ci.startsWith('name: OMEGA Cloud Bridge CI'), 'canonical CI identity changed');
assert.ok(!fs.existsSync('.github/workflows/r318-builder-control-plane.yml'), 'R318 must not create a 25th GitHub workflow authority');
assert.ok(ci.includes('Prove R318 Builder control plane without new GitHub workflow authority'), 'canonical verify job must prove R318');
assert.ok(ci.includes('npx wrangler deploy --config wrangler.builder.jsonc --dry-run'), 'Builder must dry-run inside canonical CI');
assert.ok(ci.includes('Deploy auxiliary R318 Builder Worker'), 'Builder production deployment must remain inside canonical ci.yml');
assert.ok(ci.includes('npx wrangler deploy --config wrangler.builder.jsonc'), 'Builder deployment command missing');
assert.ok(ci.includes('https://omega-v6-builder.jeffdeweyeljefe.workers.dev'), 'Builder canonical URL missing');
assert.ok(ci.includes("+'/api/health'"), 'Builder live health path verification missing');
assert.ok(ci.includes('R318 Builder first-hand health/authority proof'), 'deployment receipt must record Builder proof');
assert.ok(ci.includes('one canonical ci.yml writer'), 'canonical deployment-writer boundary missing');

for (const marker of [
  'R125', 'R147', 'R146', 'R141', 'R170/R240', 'ci.yml',
  'advisory', 'SQLite-backed Durable Object', 'Cloudflare Workflow', 'R314', 'R315', 'R316', 'R317',
]) {
  assert.ok(contract.includes(marker), `R318 contract missing ${marker}`);
}

console.log('R318 CLOUDFLARE BUILDER CONTROL PLANE PASS');
