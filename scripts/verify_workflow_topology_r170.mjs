import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const activeDir='.github/workflows';
const archiveDir='.github/workflows-archive';
const expectedActive=['ci.yml','r168-1-rcwa-byte-diagnostic.yml','r168-genesis-r192-attestation.yml','r169-federation-attestation-world-lens.yml','r170-current-convergence.yml','r170-governed-selfbuild.yml'].sort();
const active=fs.readdirSync(activeDir).filter(x=>/\.ya?ml$/i.test(x)).sort();
assert.deepEqual(active,expectedActive,`active workflow set drifted: ${JSON.stringify(active)}`);
assert.equal(fs.existsSync(archiveDir),true,'historical workflow archive missing');
const archived=fs.readdirSync(archiveDir).filter(x=>/\.ya?ml$/i.test(x));
assert.ok(archived.length>=40,`historical archive unexpectedly small: ${archived.length}`);
for(const required of ['r124-self-contained-continuous-build.yml','r124-selfbuild-gate.yml'])assert.ok(archived.includes(required),`dangerous historical self-build workflow not archived: ${required}`);
const contents=new Map(active.map(name=>[name,fs.readFileSync(path.join(activeDir,name),'utf8')]));
for(const [name,text] of contents){assert.ok(!/^\s*workflow_run\s*:/m.test(text),`${name} reintroduced workflow_run`);assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(text),`${name} directly mutates main`);assert.ok(!/gh\s+pr\s+merge/i.test(text),`${name} auto-merges`);if(name!=='r170-governed-selfbuild.yml')assert.ok(!/contents:\s*write/i.test(text),`${name} has unexpected write authority`)}
const selfbuild=contents.get('r170-governed-selfbuild.yml');assert.match(selfbuild,/schedule:/);assert.match(selfbuild,/workflow_dispatch:/);assert.ok(!/^\s*push\s*:/m.test(selfbuild));assert.ok(!/^\s*pull_request\s*:/m.test(selfbuild));assert.match(selfbuild,/gh\s+pr\s+create/);assert.match(selfbuild,/gh run list/);assert.match(selfbuild,/production_ready/);assert.match(selfbuild,/OBSERVE_ONLY/);
const ci=contents.get('ci.yml');assert.match(ci,/Promoted main commit must be an exact two-parent merge commit/);assert.match(ci,/verify_federation_live_r1681\.mjs/,'canonical CI must delegate live Federation/Optical identity proof to the propagation-safe verifier');
const convergence=contents.get('r170-current-convergence.yml');for(const needle of ['r167-active-optical-r1532-convergence-invariants.mjs','r1532-adaptive-external-search-invariants.mjs','wrangler.optical-machine-r1532.jsonc'])assert.ok(convergence.includes(needle),`current convergence missing explicit Optical R153.2 proof: ${needle}`);
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));assert.equal(governor.historicalWorkflowArchive.historicalExecutionAuthority,false);assert.equal(governor.selfBuild.exactProductionHeadRequired,true);assert.equal(governor.selfBuild.autoMerge,false);assert.equal(governor.selfBuild.directMainMutation,false);
console.log(JSON.stringify({schema:'OMEGA_WORKFLOW_TOPOLOGY_R170_1',activeCount:active.length,active,archivedCount:archived.length,directMainCandidateMutation:false,recursiveWorkflowRunFanout:false,productionProofRequired:true,opticalProofDelegation:'ci->verify_federation_live_r1681 + current-convergence->R153.2 suites',canonicalAdmissionAuthority:'R125',result:'PASS'},null,2));
