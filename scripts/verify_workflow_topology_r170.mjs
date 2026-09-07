import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const activeDir='.github/workflows';
const archiveDir='.github/workflows-archive';
const requiredCore=[
  'ci.yml',
  'r168-1-rcwa-byte-diagnostic.yml',
  'r168-genesis-r192-attestation.yml',
  'r169-federation-attestation-world-lens.yml',
  'r170-current-convergence.yml',
  'r170-governed-selfbuild.yml',
  'r170-post-r168-regression-diagnostic.yml',
];
const requiredSuccessors=[
  'r171-federation-receipt-world-reconciler.yml',
  'r172-federation-ledger-world-binding.yml',
  'r173-federation-ledger-world-observer.yml',
  'r174-living-world-pulse.yml',
];
const active=fs.readdirSync(activeDir).filter(x=>/\.ya?ml$/i.test(x)).sort();
for(const required of [...requiredCore,...requiredSuccessors])assert.ok(active.includes(required),`required active workflow missing: ${required}`);
assert.ok(active.length<=16,`active workflow topology exceeded bounded limit: ${active.length}`);
const allowedFixed=new Set(requiredCore);
for(const name of active){
  if(allowedFixed.has(name))continue;
  assert.match(name,/^r17[1-9]-[a-z0-9-]+\.ya?ml$/i,`unexpected active workflow outside governed R171-R179 successor lane: ${name}`);
}

assert.equal(fs.existsSync(archiveDir),true,'historical workflow archive missing');
const archived=fs.readdirSync(archiveDir).filter(x=>/\.ya?ml$/i.test(x));
assert.ok(archived.length>=40,`historical archive unexpectedly small: ${archived.length}`);
for(const required of ['r124-self-contained-continuous-build.yml','r124-selfbuild-gate.yml'])assert.ok(archived.includes(required),`dangerous historical self-build workflow not archived: ${required}`);

const contents=new Map(active.map(name=>[name,fs.readFileSync(path.join(activeDir,name),'utf8')]));
for(const [name,text] of contents){
  assert.ok(!/^\s*workflow_run\s*:/m.test(text),`${name} reintroduced workflow_run`);
  assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(text),`${name} directly mutates main`);
  assert.ok(!/gh\s+pr\s+merge/i.test(text),`${name} auto-merges`);
  if(name!=='r170-governed-selfbuild.yml')assert.ok(!/contents:\s*write/i.test(text),`${name} has unexpected write authority`);
  if(/^r17[1-9]-/.test(name))assert.match(text,/permissions:\s*\n\s*contents:\s*read/i,`${name} successor workflow must be explicitly read-only`);
}

const selfbuild=contents.get('r170-governed-selfbuild.yml');
assert.match(selfbuild,/schedule:/);
assert.match(selfbuild,/workflow_dispatch:/);
assert.ok(!/^\s*push\s*:/m.test(selfbuild));
assert.ok(!/^\s*pull_request\s*:/m.test(selfbuild));
assert.match(selfbuild,/gh\s+pr\s+create/);
assert.match(selfbuild,/gh run list/);
assert.match(selfbuild,/production_ready/);
assert.match(selfbuild,/OBSERVE_ONLY/);

const ci=contents.get('ci.yml');
assert.match(ci,/Promoted main commit must be an exact two-parent merge commit/);
assert.match(ci,/verify_federation_live_r1681\.mjs/,'canonical CI must delegate live Federation/Optical identity proof to the propagation-safe verifier');

const convergence=contents.get('r170-current-convergence.yml');
for(const needle of ['r167-active-optical-r1532-convergence-invariants.mjs','r1532-adaptive-external-search-invariants.mjs','wrangler.optical-machine-r1532.jsonc'])assert.ok(convergence.includes(needle),`current convergence missing explicit Optical R153.2 proof: ${needle}`);

const diagnostic=contents.get('r170-post-r168-regression-diagnostic.yml');
for(const needle of ['r118-browser-operational-e2e.mjs','r164-reflex-autonomic-browser-e2e.mjs','r174-living-world-pulse-invariants.mjs'])assert.ok(diagnostic.includes(needle),`R170 promotion diagnostic missing current full proof: ${needle}`);

const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
assert.equal(governor.historicalWorkflowArchive.historicalExecutionAuthority,false);
assert.equal(governor.selfBuild.exactProductionHeadRequired,true);
assert.equal(governor.selfBuild.autoMerge,false);
assert.equal(governor.selfBuild.directMainMutation,false);

console.log(JSON.stringify({
  schema:'OMEGA_WORKFLOW_TOPOLOGY_R170_2',
  activeCount:active.length,
  boundedActiveLimit:16,
  active,
  archivedCount:archived.length,
  requiredCurrentSuccessors:requiredSuccessors,
  futureSuccessorLane:'R175-R179_ALLOWED_ONLY_WHEN_READ_ONLY_AND_GOVERNED',
  directMainCandidateMutation:false,
  recursiveWorkflowRunFanout:false,
  productionProofRequired:true,
  desktopMobileBrowserAdmission:true,
  opticalProofDelegation:'ci->verify_federation_live_r1681 + current-convergence->R153.2 suites',
  canonicalAdmissionAuthority:'R125',
  result:'PASS'
},null,2));
