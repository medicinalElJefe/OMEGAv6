import assert from 'node:assert/strict';
import fs from 'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const cloud=fs.readFileSync('.github/workflows/r223-cloudflare-evolution.yml','utf8');
const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
const r170=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');

for(const token of [
  'STATIC_EXHAUSTED=true',
  'public/omega-r170-selfbuild-state.json?ref=$GITHUB_SHA',
  'contents/$TARGET?ref=$GITHUB_SHA',
  'gh workflow run r223-cloudflare-evolution.yml --repo "$GITHUB_REPOSITORY" --ref main -f immediate_cycle=true',
  'actions/workflows/r170-governed-selfbuild.yml/dispatches',
  'SG001–SG005 source targets are all present'
])assert.ok(ci.includes(token),`R391 canonical continuation missing ${token}`);

assert.ok(ci.includes('needs: deploy-main'),'R391 continuation must remain downstream of successful canonical deployment');
assert.ok(!/continue-governed-selfbuild:[\s\S]*?contents:\s*write/.test(ci),'R391 continuation may not gain source-write authority');

for(const token of [
  'immediate_cycle:',
  'Run one governed CLOUD-01 cycle immediately after provisioning',
  'id: deploy_cloud01',
  'echo "::add-mask::$CRON_SECRET"',
  'authorization: Bearer $CRON_SECRET',
  '$URL?mode=cycle',
  'R391 immediate CLOUD-01 convergence cycle returned successfully.'
])assert.ok(cloud.includes(token),`R391 CLOUD-01 handoff missing ${token}`);

assert.match(cloud,/workflow_dispatch:/);
assert.doesNotMatch(cloud,/^\s*push\s*:/m,'CLOUD-01 must remain ancillary and never become a push-triggered production writer');
assert.ok(cloud.includes('Canonical OMEGA production remains exclusively deployed by ci.yml deploy-main.'),'R391 must preserve canonical production authority');

for(const token of ['ensureNoCompetingCandidate','runAutonomousCycle','maxOpenCandidatePrs','R388_BACKLOG_AI_BUILD'])assert.ok(machine.includes(token),`R391 must reuse existing governed CLOUD-01 candidate fence/policy: ${token}`);
assert.ok(!r170.includes('gh workflow run r223-cloudflare-evolution.yml'),'R391 must not widen R170 workflow-dispatch authority; canonical ci.yml owns the phase handoff');

console.log('R391 EVENT-DRIVEN HYPER-CONVERGENCE PASS · exact production success chooses unfinished R170 static roadmap or immediate R388/CLOUD-01 continuation · one-candidate fence preserved · ci.yml remains sole production writer');
