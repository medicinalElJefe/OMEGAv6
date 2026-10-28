# OMEGA Archive Capability Intake — proof-bound integration

This candidate is a **pure audit compiler**, not an archive uploader, deployment agent, canonical-state writer or automatic recovery mechanism.

## Interface

`compileArchiveCapabilityIntake(index, inventory, exceptions)` expects a recovery index with `proofs[]`, `originalFiles`, `originalBytes`; optional full inventory and explicit exception records. It emits a deterministic fingerprint; sorted, typed rows of cloud-indexed originals; pending and exception records; integrity problems; and a hard `DENY_EXECUTION_AND_RELEASE` admission state.

Proof admission is restricted to `DRIVE_FULL_READBACK_VERIFIED`, `DRIVE_SEGMENTED_FULL_READBACK_VERIFIED`, and `DRIVE_RECOVERED_MANIFEST_FULL_READBACK_VERIFIED` records. A malformed or incomplete index records problems and must not be presented as fully recovered. The compiler **does not download archival bytes or independently reverify Drive**, so `DRIVE_READBACK_INDEXED` describes evidence declared by the index, not fresh independent proof. Every executable donor must still undergo source, license, formula, schema, compatibility, test, deployment and live-return review through current OMEGA authorities.

Run: `node --test tests/archive-capability-intake.test.mjs`.

## Non-goals / constraints

- Never import third-party executables automatically or infer authorship from file names.
- Never promote user-described dimensions/address ladders to physical dimensional claims.
- Never admit biological or medical source datasets as diagnostic authority.
- Never modify canonical state, deployment pointers, worker routing or Hybrid device authority.
- Never count inaccessible originals as backed up.
- Never commit private archival source inventories or user-owned document contents to this public repository.
- The GitHub PR/CI and production/Cloudflare R2 verification remain independent acceptance gates.

Historical references: `docs/R288_ARCHIVE_GENOME_PROMOTION_LEDGER.md`, `docs/R289_FULL_ARCHIVE_NATIVE_CONVERGENCE.md`.

## R607 deployment-lineage repair

The R606 PR #1130 source and candidate CI were accepted, but squash merging produced a single-parent main commit `c25b7b798d32bf443909f65f2255a8f362882954`. Production `deploy-main` explicitly requires a **two-parent merge commit** so rollback and candidate identity derive from distinct parents. Its `Bind promoted merge lineage` job failed before deployment. This corrective PR MUST be merged using the normal **merge** method (not squash or rebase), with the exact PR head SHA checked at merge. Do not weaken that existing workflow guard; verify the resulting main commit has exactly two parents, rerun post-merge CI and require Cloudflare and browser proof independently. An accepted PR or successful compile alone never establishes deployment.
