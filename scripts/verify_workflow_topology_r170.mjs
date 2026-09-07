import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const activeDir='.github/workflows';
const archiveDir='.github/workflow-archive';
const expectedActive=[
  'ci.yml',
  'r168-1-rcwa-byte-diagnostic.yml',
  'r168-genesis-r192-attestation.yml',
  'r169-federation-attestation-world-lens.yml',
  'r170-current-convergence.yml',
  'r170-governed-selfbuild.yml'
].sort();

const active=fs.readdirSync(activeDir).filter(x=>/\.ya?ml$/i.test(x)).sort();
assert.deepEqual(active,expectedActive,`R170 active workflow set drifted: ${JSON.stringify(active)}`);
assert.ok(fs.existsSync(archiveDir),'R170 historical workflow archive is missing');
const archived=fs.readdirSync(archiveDir).filter(x=>/\.ya?ml$/i.test(x)).sort();
assert.ok(archived.length>=80,`R170 archive unexpectedly small: ${archived.length}`);
assert.ok(archived.includes('r124-self-contained-continuous-build.yml'),'R124 historical self-build workflow missing from archive');
assert.ok(archived.includes('r167-active-optical-convergence.yml'),'R167 historical proof workflow missing from archive');

const contents=new Map(active.map(name=>[name,fs.readFileSync(path.join(activeDir,name),'utf8')]));
for(const [name,text] of contents){
  assert.ok(!/^\s*workflow_run\s*:/m.test(text),`${name} reintroduced workflow_run fan-out`);
  assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(text),`${name} can push candidate source directly to main`);
  assert.ok(!/gh\s+pr\s+merge/i.test(text),`${name} can auto-merge a candidate PR`);
  if(name!=='r170-governed-selfbuild.yml')assert.ok(!/contents:\s*write/i.test(text),`${name} has unexpected repository write authority`);
}

const selfbuild=contents.get('r170-governed-selfbuild.yml');
assert.match(selfbuild,/schedule:/,'R170 self-build must have a bounded schedule');
assert.match(selfbuild,/workflow_dispatch:/,'R170 self-build must remain manually callable');
assert.ok(!/^\s*push\s*:/m.test(selfbuild),'R170 self-build must not recurse on push');
assert.ok(!/^\s*pull_request\s*:/m.test(selfbuild),'R170 self-build must not recurse on pull_request');
assert.match(selfbuild,/gh\s+pr\s+create/,'R170 self-build must propose candidates through PRs');
assert.match(selfbuild,/PROVED_PENDING_PR/,'R170 self-build must preserve pre-admission state');

const ci=contents.get('ci.yml');
assert.match(ci,/Promoted main commit must be an exact two-parent merge commit/,'canonical two-parent merge deployment law missing');
assert.match(ci,/verify_federation_live_r1681\.mjs/,'R168.1 propagation-safe federation verifier missing from canonical CI');
assert.match(ci,/OMEGA_OPTICAL_MACHINE|R153\.2|omega-optical-machine-r1532/,'canonical CI no longer carries active Optical truth');

const convergence=contents.get('r170-current-convergence.yml');
for(const needle of [
  'r169-federation-attestation-world-lens-invariants.mjs',
  'r168-genesis-r192-attestation-invariants.mjs',
  'r167-active-optical-r1532-convergence-invariants.mjs',
  'r166-development-residual-world-lens-invariants.mjs',
  'r164-development-residual-graph-invariants.mjs',
  'r163-canonical-core-health-truth-invariants.mjs',
  'npm run check',
  'wrangler.optical-machine-r1532.jsonc'
]) assert.ok(convergence.includes(needle),`R170 current convergence missing ${needle}`);

console.log(JSON.stringify({
  schema:'OMEGA_WORKFLOW_TOPOLOGY_R170',
  activeCount:active.length,
  archivedCount:archived.length,
  active,
  directMainCandidateMutation:false,
  recursiveWorkflowRunFanout:false,
  canonicalAdmissionAuthority:'R125',
  result:'PASS'
},null,2));
