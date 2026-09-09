import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml', 'utf8');
const requireInvariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

requireInvariant(
  workflow.includes("gh pr list --repo \"$GITHUB_REPOSITORY\" --state open --search 'head:selfbuild/r170-'"),
  'R240 must block parallel autonomous work on an actually open selfbuild PR',
);
requireInvariant(
  !workflow.includes('matching-refs/heads/selfbuild/r170-'),
  'historical orphan selfbuild refs must not permanently deadlock future R240 pulses',
);
requireInvariant(
  workflow.includes("steps.open_pr.outputs.count == '0'"),
  'R240 generation must remain gated on zero open autonomous candidate PRs',
);
requireInvariant(
  workflow.includes('POLICY_BLOCKED_BRANCH_REMOVED'),
  'R240 must explicitly represent repository-policy-blocked PR creation with orphan cleanup',
);
requireInvariant(
  workflow.includes('git push origin --delete "$BRANCH" || true'),
  'R240 must delete the just-created candidate branch when known PR policy blocks admission',
);
requireInvariant(
  workflow.includes('GitHub Actions is not permitted to create or approve pull requests'),
  'R240 policy fallback must remain scoped to the known GitHub Actions PR-policy rejection',
);
requireInvariant(
  workflow.includes('exit "$RC"'),
  'R240 must continue failing for unexpected PR creation errors',
);
requireInvariant(
  workflow.includes('actions/checkout@v7') && workflow.includes('actions/setup-node@v7'),
  'R240 must use the current Node-24-capable v7 GitHub action generation',
);
requireInvariant(
  !workflow.includes('actions/checkout@v4') && !workflow.includes('actions/setup-node@v4'),
  'R240 must not regress to Node-20-targeting v4 GitHub actions',
);
requireInvariant(
  workflow.includes('R125 remains sole CanonState admission authority'),
  'R125 sole CanonState admission authority must remain explicit in the candidate PR contract',
);
requireInvariant(
  workflow.includes('Direct generator push to main: forbidden') && workflow.includes('GitHub auto-merge feature: disabled'),
  'R240 must preserve no-direct-generator-main-push and no-GitHub-auto-merge boundaries',
);

console.log('R240 R170 PR POLICY FAIL-CLOSE PASS · open PR blocks parallel work · historical orphan refs do not deadlock · known Actions PR-policy rejection removes the fresh orphan branch · unexpected PR errors fail · v7 actions preserved · R125/no-direct-generator-push/no-auto-merge boundaries preserved');
