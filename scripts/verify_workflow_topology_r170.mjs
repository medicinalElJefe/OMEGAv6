import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const activeDir='.github/workflows';
const archiveDir='.github/workflows-archive';
const coreRequired=[
  'ci.yml',
  'r168-1-rcwa-byte-diagnostic.yml',
  'r168-genesis-r192-attestation.yml',
  'r169-federation-attestation-world-lens.yml',
  'r170-current-convergence.yml',
  'r170-governed-selfbuild.yml'
].sort();
const active=fs.readdirSync(activeDir).filter(x=>/\.ya?ml$/i.test(x)).sort();
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
const successorPolicy=governor.successorWorkflowPolicy||{};
const maxActive=Number(successorPolicy.maxActiveWorkflowAuthorities||24);
const minimumSuccessorRevision=Number(successorPolicy.minimumSuccessorRevision||171);

for(const required of coreRequired)assert.ok(active.includes(required),`required current workflow missing: ${required}`);
assert.ok(active.length<=maxActive,`active workflow authority count ${active.length} exceeds governed bound ${maxActive}`);
assert.equal(fs.existsSync(archiveDir),true,'historical workflow archive missing');
const archived=fs.readdirSync(archiveDir).filter(x=>/\.ya?ml$/i.test(x));
assert.ok(archived.length>=40,`historical archive unexpectedly small: ${archived.length}`);
for(const required of ['r124-self-contained-continuous-build.yml','r124-selfbuild-gate.yml'])assert.ok(archived.includes(required),`dangerous historical self-build workflow not archived: ${required}`);

const contents=new Map(active.map(name=>[name,fs.readFileSync(path.join(activeDir,name),'utf8')]));
function triggerBlock(text,trigger){
  const lines=text.split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const m=lines[i].match(/^(\s*)([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if(!m||m[1].length!==2||m[2]!==trigger)continue;
    const block=[lines[i]];
    for(let j=i+1;j<lines.length;j++){
      if(!lines[j].trim()){block.push(lines[j]);continue}
      const indent=(lines[j].match(/^\s*/)?.[0].length)||0;
      if(indent<=2)break;
      block.push(lines[j]);
    }
    return block.join('\n');
  }
  return '';
}

const successors=[];
for(const [name,text] of contents){
  assert.ok(!/^\s*workflow_run\s*:/m.test(text),`${name} reintroduced workflow_run`);
  assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(text),`${name} directly mutates main`);
  assert.ok(!/gh\s+pr\s+merge/i.test(text),`${name} auto-merges`);
  assert.ok(!/gh\s+workflow\s+run/i.test(text),`${name} recursively dispatches workflows`);
  if(name==='r170-governed-selfbuild.yml')continue;
  assert.ok(!/contents:\s*write/i.test(text),`${name} has unexpected contents write authority`);
  if(coreRequired.includes(name))continue;

  const match=name.match(/^r(\d+)(?:[-.].*)?\.ya?ml$/i);
  assert.ok(match,`unregistered non-successor workflow authority: ${name}`);
  const revision=Number(match[1]);
  assert.ok(revision>=minimumSuccessorRevision,`${name} is not a post-R170 successor workflow`);
  assert.match(text,/permissions:\s*\n\s+contents:\s*read/i,`${name} must declare read-only contents authority`);
  assert.ok(!/\b(contents|pull-requests|actions|deployments|checks|statuses|issues|packages|id-token|security-events):\s*write\b/i.test(text),`${name} successor workflow has write authority`);
  const push=triggerBlock(text,'push');
  if(push)assert.ok(!/\bmain\b/i.test(push),`${name} successor workflow may not push-trigger on main`);
  assert.equal(triggerBlock(text,'schedule'),'',`${name} successor workflow may not schedule recurring execution`);
  successors.push({name,revision});
}

const selfbuild=contents.get('r170-governed-selfbuild.yml');
assert.match(selfbuild,/schedule:/);assert.match(selfbuild,/workflow_dispatch:/);assert.ok(!/^\s*push\s*:/m.test(selfbuild));assert.ok(!/^\s*pull_request\s*:/m.test(selfbuild));assert.match(selfbuild,/gh\s+pr\s+create/);assert.match(selfbuild,/gh run list/);assert.match(selfbuild,/production_ready/);assert.match(selfbuild,/OBSERVE_ONLY/);assert.match(selfbuild,/prove_successor_workflow_invariants_r175\.mjs/);assert.match(selfbuild,/cron: '17 \* \* \* \*'/);
const ci=contents.get('ci.yml');assert.match(ci,/Promoted main commit must be an exact two-parent merge commit/);assert.match(ci,/verify_federation_live_r1681\.mjs/,'canonical CI must delegate live Federation/Optical identity proof to the propagation-safe verifier');
const convergence=contents.get('r170-current-convergence.yml');
for(const needle of [
  'r180-current-authority-convergence-invariants.mjs',
  'r179-living-world-durable-authorization-invariants.mjs',
  'r178-living-world-contract-resolution-invariants.mjs',
  'r177-living-world-mission-composer-invariants.mjs',
  'r176-living-world-intent-proposal-invariants.mjs',
  'r176-r164-mobile-containment-invariants.mjs',
  'r175-multidomain-living-world-truth-invariants.mjs',
  'prove_successor_workflow_invariants_r175.mjs',
  'r167-active-optical-r1532-convergence-invariants.mjs',
  'r1532-adaptive-external-search-invariants.mjs',
  'wrangler.optical-machine-r1532.jsonc'
])assert.ok(convergence.includes(needle),`current convergence missing proof: ${needle}`);
assert.equal(governor.historicalWorkflowArchive.historicalExecutionAuthority,false);assert.equal(governor.selfBuild.exactProductionHeadRequired,true);assert.equal(governor.selfBuild.autoMerge,false);assert.equal(governor.selfBuild.directMainMutation,false);assert.equal(governor.selfBuild.schedule,'17 * * * *');assert.equal(governor.selfBuild.observationCadence,'HOURLY');assert.equal(governor.selfBuild.expensiveProofMode,'PROPOSE_ONLY');assert.equal(successorPolicy.readOnly,true);assert.equal(successorPolicy.mainPushAllowed,false);assert.equal(successorPolicy.recurringScheduleAllowed,false);
const floorMatch=String(governor.currentCapabilityFloor||'').match(/^R(\d+)$/);
assert.ok(floorMatch,'currentCapabilityFloor must be an R-number');
const floorRevision=Number(floorMatch[1]);
const highestSuccessorRevision=successors.reduce((max,x)=>Math.max(max,x.revision),170);
assert.ok(floorRevision<=highestSuccessorRevision,`currentCapabilityFloor R${floorRevision} cannot exceed highest active successor proof workflow R${highestSuccessorRevision}`);
assert.ok(successors.some(x=>x.revision===floorRevision),`currentCapabilityFloor R${floorRevision} must retain at least one active proof workflow at the admitted floor`);
console.log(JSON.stringify({schema:'OMEGA_WORKFLOW_TOPOLOGY_R170_3',activeCount:active.length,coreCount:coreRequired.length,successorCount:successors.length,successors,archivedCount:archived.length,maxActive,currentCapabilityFloor:governor.currentCapabilityFloor,highestActiveSuccessorProofWorkflow:`R${highestSuccessorRevision}`,observationCadence:governor.selfBuild.observationCadence,expensiveProofMode:governor.selfBuild.expensiveProofMode,directMainCandidateMutation:false,recursiveWorkflowRunFanout:false,productionProofRequired:true,successorPolicy:'READ_ONLY_BRANCH_OR_PR_PROOF_AUTHORITIES_DO_NOT_IMPLY_PROMOTION',canonicalAdmissionAuthority:'R125',result:'PASS'},null,2));
