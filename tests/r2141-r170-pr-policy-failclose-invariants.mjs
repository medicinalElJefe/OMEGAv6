import fs from 'node:fs';

const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const requireInvariant=(condition,message)=>{if(!condition)throw new Error(message)};

requireInvariant(workflow.includes('matching-refs/heads/selfbuild/r170-'),'R170 must retain historical candidate branch diagnostics');
requireInvariant(workflow.includes('echo "count=$PR_COUNT"'),'Only open governed PRs may block a future pulse; historical branch refs are diagnostic, not permanent authority');
requireInvariant(workflow.includes("steps.open_pr.outputs.count == '0'"),'R170 generation must remain gated on zero open self-build PRs');
requireInvariant(workflow.includes('POLICY_BLOCKED_BRANCH_REMOVED'),'Known PR-policy rejection must remove the newly orphaned autonomous branch rather than create permanent deadlock');
requireInvariant(workflow.includes("git push origin --delete '${{ steps.candidate.outputs.branch }}'"),'Policy-blocked and production-proven candidate branches must have bounded cleanup');
requireInvariant(workflow.includes('GitHub Actions is not permitted to create or approve pull requests'),'R170 policy fallback must remain scoped to the known GitHub Actions PR-policy rejection');
requireInvariant(workflow.includes('exit "$RC"'),'R170 must continue failing for unexpected PR creation errors');
requireInvariant(workflow.includes('actions/checkout@v7')&&workflow.includes('actions/setup-node@v7'),'R170 must use Node-24-capable v7 GitHub actions');
requireInvariant(!workflow.includes('actions/checkout@v4')&&!workflow.includes('actions/setup-node@v4'),'R170 must not regress to Node-20-targeting v4 actions');
requireInvariant(workflow.includes('R125 remains sole CanonState admission authority'),'R125 sole CanonState admission authority must remain explicit in autonomous PR metadata');
requireInvariant(workflow.includes('Direct production deployment by self-builder: forbidden')&&workflow.includes('GitHub auto-merge feature: disabled'),'R240 source promotion must remain distinct from direct production deployment and GitHub auto-merge');
requireInvariant(workflow.includes('R240 exact two-parent source promotion PASS')&&workflow.includes('actions/workflows/ci.yml/dispatches'),'R240 exact source promotion must hand deployment to sole canonical ci.yml');

console.log('R214.1/R240 R170 PR POLICY PASS · open PRs block parallel generations · historical refs do not deadlock evolution · policy-blocked orphan branch removed · unexpected PR errors fail · exact two-parent source promotion hands off to canonical ci.yml · GitHub auto-merge disabled · R125 unchanged');
