# R365 · Production Deployment Serialization and Rollback Ownership

R365 fixes a production race exposed only after the full R359–R364 PCWD stack was merged.

Two consecutive main commits were allowed to run the canonical production deployment job concurrently. The newer deployment could promote and begin its exact live proof while the older workflow was still active. When the older workflow later failed, its unconditional rollback restored its own previous Worker version and overwrote the newer deployment in the middle of proof.

That produced an apparently contradictory trace:

- the newer R200 browser proof observed the newer promoted SHA;
- seconds later R207.4/R238 observed the older restored SHA;
- the newer job then failed exact-SHA closure even though its own candidate had already passed staged proof.

This was a deployment-writer race, not a PCWD mathematical failure.

## R365 controls

### One production writer at a time

The `deploy-main` job now uses the GitHub Actions concurrency group:

`omega-production-deploy-main`

with:

`cancel-in-progress: false`

A newer main deployment waits for the current production deployment to finish rather than cancelling it mid-release or running beside it.

### Rollback compare-and-swap boundary

Rollback is no longer unconditional.

Before restoring the previous Worker version, R365 reads the current Cloudflare deployment and classifies ownership:

- `ALREADY_PREVIOUS` — no mutation required;
- `ROLLBACK_CANDIDATE` — this run still owns 100% traffic, so its verified previous version may be restored;
- `NEWER_OR_FOREIGN` — rollback is blocked because another deployment now owns production;
- `AMBIGUOUS_DEPLOYMENT` — rollback is blocked because ownership is not provable.

The same guard is used by:

1. the staged-release ERR trap;
2. the post-promotion proof-failure rollback step.

Thus an older workflow cannot clobber a newer production deployment even if workflow serialization is accidentally weakened later.

## Truth boundary

R365 does not weaken any deployment proof.

Candidate staging, exact promoted-SHA proof, R200 browser proof, R202, R237, R238, rollback usability proof, and the existing R240/R322 release laws remain required.

It changes only production-writer coordination and rollback ownership.

## Canonical invariant

`tests/r365-production-deployment-serialization-invariants.mjs` proves both the ownership classifier and the CI/staged-release wiring, including the refusal to mutate ambiguous or newer deployments.
