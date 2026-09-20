import fs from 'node:fs';

const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const requireInvariant=(condition,message)=>{if(!condition)throw new Error(message)};

requireInvariant(
 workflow.includes('gh pr list --repo "$GITHUB_REPOSITORY" --state open --base main --limit 100 --json number,headRefName'),
 'R245 must inspect actually open main-targeted PRs before autonomous generation'
);
requireInvariant(
 workflow.includes("prefixes.includes('selfbuild/r170-')")&&workflow.includes("prefixes.includes('cloud/evolution-')"),
 'R245 cross-machine fence must cover both R170 and CLOUD-01 autonomous candidate prefixes'
);
requireInvariant(
 workflow.includes("const held=prs.filter(pr=>prefixes.some(prefix=>String(pr.headRefName||'').startsWith(prefix)))"),
 'R245 must derive held autonomous candidates from the canonical branch-prefix policy'
);
requireInvariant(
 workflow.includes("steps.open_pr.outputs.count == '0'"),
 'R240 generation must remain gated on zero open autonomous candidate PRs'
);
requireInvariant(
 !/^\s*schedule\s*:/m.test(workflow)&&/^\s*workflow_dispatch\s*:/m.test(workflow),
 'R330 autonomous source build must be event-driven, not hourly scheduled'
);
requireInvariant(
 !/gh\s+pr\s+create/.test(workflow)&&!workflow.includes('POLICY_BLOCKED_BRANCH_REMOVED'),
 'R330 must not depend on GitHub Actions PR-creation permission'
);
requireInvariant(
 workflow.includes('git commit-tree "$TREE" -p "$BASE" -p "$CANDIDATE_SHA"'),
 'R240.2 must construct an exact two-parent promotion commit from the proved candidate tree'
);
requireInvariant(
 workflow.includes('git push origin "$MERGE_SHA:refs/heads/main" --force-with-lease="refs/heads/main:$BASE"'),
 'R240.2 promotion must be an unchanged-base atomic lease, never an unconstrained main push'
);
requireInvariant(
 workflow.includes('test "$1" = "$BASE"')&&workflow.includes('test "$2" = "$CANDIDATE_SHA"')&&workflow.includes('test "$(git rev-parse "$MERGE_SHA^{tree}")" = "$TREE"'),
 'R240.2 must prove parent identity and exact candidate-tree identity before source promotion'
);
requireInvariant(
 workflow.includes("x.event==='push'")&&
 workflow.includes('gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref main')&&
 workflow.includes('--event workflow_dispatch')&&
 workflow.includes("['push','workflow_dispatch'].includes(r.event)")&&
 workflow.includes('gh run watch "$RUN_ID" --repo "$GITHUB_REPOSITORY" --exit-status'),
 'R240.2 must require canonical ci.yml success for the exact promoted merge through observed push or explicit canonical main dispatch'
);
requireInvariant(
 workflow.includes("steps.deployment.outputs.status == 'PRODUCTION_PROVEN'"),
 'candidate cleanup may occur only after exact canonical production proof'
);
requireInvariant(
 workflow.includes('actions/checkout@v7')&&workflow.includes('actions/setup-node@v7')&&!workflow.includes('actions/checkout@v4')&&!workflow.includes('actions/setup-node@v4'),
 'R240.2 must preserve current Node-24-capable v7 GitHub actions'
);
requireInvariant(
 workflow.includes('CanonState admission authority: R125'),
 'R125 sole CanonState admission authority must remain explicit'
);
requireInvariant(
 workflow.includes('Generator direct push to main: forbidden; only governed exact two-parent promotion may update main under unchanged-base lease'),
 'direct generator mutation of main must remain forbidden'
);
requireInvariant(
 ci.includes('continue-governed-selfbuild:')&&ci.includes('actions/workflows/r170-governed-selfbuild.yml/dispatches'),
 'canonical production success must dispatch the next governed R170 cycle'
);

console.log('R330.1 AUTONOMY FAIL-CLOSE PASS · event-driven continuation · no PR-permission dependency · isolated proved candidate · exact two-parent tree identity · unchanged-base lease · canonical production proof · R125 authority preserved');
