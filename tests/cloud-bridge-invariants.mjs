import assert from 'node:assert/strict';
import fs from 'node:fs';
const workflow=fs.readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const wrangler=fs.readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8');
assert.match(workflow,/npx wrangler deploy --dry-run/);
assert.match(workflow,/deploy-main:/);
assert.match(workflow,/github\.ref == 'refs\/heads\/main'/);
assert.match(workflow,/CLOUDFLARE_API_TOKEN/);
assert.match(workflow,/npx wrangler deploy\n/);
assert.match(workflow,/omegav6\.jeffdeweyeljefe\.workers\.dev/);
assert.match(workflow,/\/api\/health/);
assert.match(workflow,/\/api\/status/);
assert.match(workflow,/\/api\/restoration/);
assert.match(workflow,/AUTH REQUIRED/);
assert.doesNotMatch(workflow,/@appdeploy|appdeploy\.ai/i);
assert.match(wrangler,/"name"\s*:\s*"omegav6"/);
assert.match(wrangler,/"workers_dev"\s*:\s*true/);
for(const activeClass of ['OmegaRuntime','OmegaSwarmCell','OmegaSwarmCoordinator','OmegaSwarmBranch','OmegaSwarmOrgan','OmegaSwarmOrganismCoordinator','OmegaSwarmAutonomicCoordinator']){
  assert.match(wrangler,new RegExp(`"${activeClass}"\\s*:\\s*\\{`),`active Durable Object export missing: ${activeClass}`);
}
assert.doesNotMatch(wrangler,/OmegaMissionLedgerR201|OmegaHybridMissionLedgerR203/,'retired R201/R203 Durable Object classes must remain absent after completed Cloudflare namespace retirement');
console.log('cloud bridge invariants PASS · R231 retired R201/R203 exports absent');
