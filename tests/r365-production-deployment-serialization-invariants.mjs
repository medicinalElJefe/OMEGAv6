import assert from'node:assert/strict';
import fs from'node:fs';
import{classifyDeploymentOwnership}from'../scripts/deployment-ownership-r365.mjs';

const candidate='candidate-v1',previous='previous-v1',newer='newer-v2';
const wrap=(rows)=>({deployments:[{versions:rows.map(([version_id,percentage])=>({version_id,percentage}))}]});

assert.equal(classifyDeploymentOwnership(wrap([[previous,100]]),candidate,previous),'ALREADY_PREVIOUS');
assert.equal(classifyDeploymentOwnership(wrap([[previous,100],[candidate,0]]),candidate,previous),'ALREADY_PREVIOUS');
assert.equal(classifyDeploymentOwnership(wrap([[candidate,100]]),candidate,previous),'ROLLBACK_CANDIDATE');
assert.equal(classifyDeploymentOwnership(wrap([[newer,100]]),candidate,previous),'NEWER_OR_FOREIGN');
assert.equal(classifyDeploymentOwnership(wrap([[previous,50],[candidate,50]]),candidate,previous),'AMBIGUOUS_DEPLOYMENT');
assert.equal(classifyDeploymentOwnership({a:{versionId:candidate,trafficPercentage:100},b:{version_id:candidate,percentage:100}},candidate,previous),'ROLLBACK_CANDIDATE');

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const guarded=fs.readFileSync('scripts/guarded-cloudflare-rollback.sh','utf8');

assert.ok(ci.includes('group: omega-production-deploy-main'),'R365 production deploy concurrency group missing');
assert.ok(ci.includes('cancel-in-progress: false'),'R365 must serialize rather than cancel an in-flight production deployment');
assert.ok(ci.includes('bash scripts/guarded-cloudflare-rollback.sh'),'R365 post-promotion rollback is not ownership-guarded');
assert.ok(!ci.includes('run: npx wrangler rollback'),'R365 CI must not perform an unguarded post-promotion rollback');
assert.ok(staged.includes('bash scripts/guarded-cloudflare-rollback.sh'),'R365 staged-release ERR trap must use the ownership guard');
assert.ok(!staged.includes('npx wrangler versions deploy "${PREVIOUS_VERSION_ID}@100%" --name "$WORKER_NAME" --message "OMEGA fail-closed staged release restore'),'R365 staged-release trap still contains the old unconditional rollback');
for(const token of['ROLLBACK_CANDIDATE','NEWER_OR_FOREIGN','AMBIGUOUS_DEPLOYMENT','STALE ROLLBACK BLOCKED','ROLLBACK OWNERSHIP UNPROVED'])assert.ok(guarded.includes(token),`R365 rollback guard missing ${token}`);

console.log('R365 DEPLOYMENT SERIALIZATION PASS · one production deploy job at a time · stale workflow rollback blocked · ambiguous ownership refuses mutation · staged and post-promotion rollback share the same ownership guard');
