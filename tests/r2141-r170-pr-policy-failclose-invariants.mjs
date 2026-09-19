import fs from 'node:fs';

const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
const requireInvariant=(condition,message)=>{if(!condition)throw new Error(message)};

requireInvariant(workflow.includes('gh pr list --repo "$GITHUB_REPOSITORY" --state open --base main --limit 100 --json number,headRefName'),'R245 must still fence already-open autonomous candidate PRs from legacy/CLOUD-01 paths');
requireInvariant(workflow.includes("prefixes.includes('selfbuild/r170-')")&&workflow.includes("prefixes.includes('cloud/evolution-')"),'cross-machine autonomous candidate fence must remain');
requireInvariant(!workflow.includes('gh pr create'),'R330 must not depend on repository policy permitting Actions-created PRs');
requireInvariant(!workflow.includes('GitHub Actions is not permitted to create or approve pull requests'),'obsolete Actions PR-policy fallback must be removed');
requireInvariant(workflow.includes('git commit-tree "$TREE" -p "$BASE" -p "$CANDIDATE_SHA"'),'promotion must construct an exact two-parent merge commit');
requireInvariant(workflow.includes('--force-with-lease="refs/heads/main:$BASE"'),'promotion must fail closed if main moved');
requireInvariant(workflow.includes('test "$(git rev-parse "$MERGE_SHA^{tree}")" = "$TREE"'),'merge tree must equal the exact proved candidate tree');
requireInvariant(workflow.includes("--event push"),'production proof must bind the push-triggered canonical CI run for the promoted merge');
requireInvariant(!/^\s*schedule\s*:/m.test(workflow),'R330 governed self-build must not use an hourly schedule');
requireInvariant(workflow.includes('workflow_dispatch:'),'R330 governed self-build must remain explicitly dispatchable');
requireInvariant(ci.includes('continue-governed-selfbuild:'),'canonical CI must own continuation after production success');
requireInvariant(ci.includes('actions/workflows/r170-governed-selfbuild.yml/dispatches'),'canonical CI must dispatch the next governed cycle');
requireInvariant(ci.includes('needs: deploy-main'),'continuation must require successful canonical deployment/live proof');
requireInvariant(governor.selfBuild.eventDrivenContinuation===true,'governor must declare event-driven continuation');
requireInvariant(governor.selfPromotion.repositoryPrCreationRequired===false,'governor must record independence from Actions PR-creation policy');
requireInvariant(governor.selfPromotion.exactTwoParentMainUpdate===true,'governor must preserve exact two-parent promotion authority');
requireInvariant(workflow.includes('R125 remains sole CanonState admission authority')||governor.selfPromotion.canonicalAdmissionAuthority==='R125','R125 admission authority must remain unchanged');

console.log('R330 AUTONOMOUS PROMOTION POLICY PASS · no hourly polling · no Actions-created-PR dependency · exact candidate tree · two-parent lease-bound promotion · canonical production proof · production-success continuation · R125 unchanged');
