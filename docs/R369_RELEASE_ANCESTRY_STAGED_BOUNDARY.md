# R369 · Release Ancestry Integrity and Staged/Promoted Boundary

R368 correctly pinned the deployment checkout to the exact workflow SHA and serialized production ownership, but its first post-merge production run exposed one more Git-level interaction.

The deploy job checked out the exact two-parent merge with full history, then the current-main ownership step executed:

`git fetch origin main --depth=1`

against that same repository. That shallow fetch marked the checked-out main tip as a shallow boundary. The immediately following merge-lineage step therefore could no longer observe the two parent commits through:

`git show -s --format=%P "$GITHUB_SHA"`

and truthfully failed with **LINEAGE REQUIRED**, even though GitHub's commit object has exactly two parents.

## R369 repair

The ownership proof no longer mutates the local Git graph.

It queries the remote ref directly:

`git ls-remote origin refs/heads/main`

and compares that first-hand SHA with `GITHUB_SHA`.

This preserves all three requirements simultaneously:

1. exact checkout remains pinned to `github.sha`;
2. current-main ownership remains first-hand and fail-closed;
3. the full merge ancestry remains intact for exact two-parent lineage binding.

The staged release already uses the same non-mutating `ls-remote` ownership law.

## Staged/promoted authority separation

R369 also carries forward the staged-boundary hardening discovered in the parallel R366 proof lane.

Both child proof processes launched against a 0%-traffic version override now explicitly receive:

- `OMEGA_PROMOTED_SHA=''`
- `OMEGA_STAGED_READ_ONLY='1'`

This prevents any promoted-only source/runtime proof from inheriting ambient production lineage while the candidate is still being addressed through a read-only version override.

R199, R202 stateful continuation, R237 and R238 remain mandatory after the exact candidate is promoted to canonical production.

## Invariant

`tests/r369-release-ancestry-staged-boundary-invariants.mjs` proves:

- exact checkout precedes ownership and lineage binding;
- current-main proof uses non-mutating `ls-remote`;
- no shallow fetch occurs before lineage binding;
- exact two-parent merge law remains mandatory;
- staged release ownership remains non-mutating;
- both staged child proof paths clear promoted-only SHA authority;
- R168.1 still runs R199 only in promoted-live authority.
