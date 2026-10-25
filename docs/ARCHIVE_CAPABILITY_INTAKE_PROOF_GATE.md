# OMEGA Archive Capability Intake — proof-bound integration

This candidate is a **pure audit compiler**, not an archive uploader, deployment agent, canonical-state writer or automatic recovery mechanism.

## Interface

`compileArchiveCapabilityIntake(index, inventory, exceptions)` expects a recovery index with `proofs[]`, `originalFiles`, `originalBytes`; optional full inventory and explicit exception records. It emits a deterministic fingerprint; sorted, typed rows of cloud-indexed originals; pending and exception records; integrity problems; and a hard `DENY_EXECUTION_AND_RELEASE` admission state.

Proof admission is restricted to `DRIVE_FULL_READBACK_VERIFIED` and `DRIVE_SEGMENTED_FULL_READBACK_VERIFIED` records. A malformed or incomplete index records problems and must not be presented as fully recovered. The compiler **does not download archival bytes or independently reverify Drive**, so `DRIVE_READBACK_INDEXED` describes evidence declared by the index, not fresh independent proof. Every executable donor must still undergo source, license, formula, schema, compatibility, test, deployment and live-return review through current OMEGA authorities.

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
