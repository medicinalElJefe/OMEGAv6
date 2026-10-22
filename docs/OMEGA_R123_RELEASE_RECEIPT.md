# OMEGA R123 Release Receipt — Candidate

Base production lineage: R121 swarm merge `8520dfe3fbae779a67f33e2d281c5611bf8c0705`.
Candidate branch: `r123-organism-swarm-max`.

## Candidate additions

- three new SQLite Durable Object classes: `OmegaSwarmBranch`, `OmegaSwarmOrgan`, `OmegaSwarmOrganismCoordinator`;
- persistent 1→12→144→1,728 hierarchy over the promoted R121 cell fabric;
- branch Merkle receipts and organism Merkle reconvergence;
- durable organ execution/failure ledgers;
- mission deadlines, bounded concurrency, deterministic retries, pause/resume/cancel/replay;
- evidence identity/hash carry with explicit source authority labels;
- mission-wide Workers AI budget that includes final reconvergence;
- R123 operator console while retaining R121 direct swarm and prior convergence instruments;
- R123 invariant suite, full inherited regression, Wrangler migration dry-run, and post-deployment hierarchical live proof.

## Canonical authority

No R123 Durable Object has direct CanonState mutation authority. Model, Genesis, Optical, cell, branch, organ, and organism outputs remain result/candidate packets. `RETURNED_NOT_ADMITTED` is intentional: OMEGAv6's inherited proof/admission path remains canonical authority.

## Promotion gate

Promotion requires all of the following:

1. `tests/r123-organism-swarm-invariants.mjs` passes;
2. R123 JS syntax checks pass;
3. complete inherited `npm run check` passes;
4. Wrangler dry-run accepts all R121 + R123 Durable Object migrations;
5. existing Cloudflare production authorization probe passes on the pull request;
6. merge is an exact two-parent merge into `main` so existing release lineage binding remains valid;
7. governed `deploy-main` succeeds;
8. live R123 workflow observes the 1/12/144/1,728/20,736 manifest and closes a deterministic hierarchical mission with a valid organism Merkle root and `RETURNED_NOT_ADMITTED`.

Until those gates complete, the currently deployed R121 runtime remains production authority.
