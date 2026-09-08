import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml', 'utf8');
const requireInvariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

requireInvariant(
  workflow.includes('matching-refs/heads/selfbuild/r170-'),
  'R170 must detect held selfbuild candidate branches, not only open PRs',
);
requireInvariant(
  workflow.includes("steps.open_pr.outputs.count == '0'"),
  'R170 generation must remain gated on zero existing candidate PRs/branches',
);
requireInvariant(
  workflow.includes('POLICY_BLOCKED_BRANCH_HELD'),
  'R170 must explicitly represent repository-policy-blocked PR creation',
);
requireInvariant(
  workflow.includes('GitHub Actions is not permitted to create or approve pull requests'),
  'R170 policy fallback must be scoped to the known GitHub Actions PR-policy rejection',
);
requireInvariant(
  workflow.includes('exit "$RC"'),
  'R170 must continue failing for unexpected PR creation errors',
);
requireInvariant(
  workflow.includes('R125 remains sole CanonState admission authority'),
  'R125 sole CanonState admission authority must remain explicit',
);
requireInvariant(
  workflow.includes('Direct main mutation: forbidden') && workflow.includes('Auto merge: forbidden'),
  'R170 must preserve no-direct-main and no-auto-merge boundaries',
);

console.log('R214.1 R170 PR POLICY FAIL-CLOSE PASS · held candidate branches block regeneration · known repository-policy rejection becomes a truth-gated held state · unexpected PR errors still fail · R125/no-direct-main/no-auto-merge boundaries preserved');
