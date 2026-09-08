# OMEGA Advancement Ledger

The canonical human-readable advancement ledger is maintained as GitHub issue **#435**:

https://github.com/medicinalElJefe/OMEGAv6/issues/435

The live runtime index for this ledger is deployed as:

https://omegav6.jeffdeweyeljefe.workers.dev/omega-advancement-ledger.json

## Mandatory completion contract

Every completed OMEGA advancement must publish, in order:

1. revision and purpose;
2. exact candidate and canonical merge SHA;
3. pull request link;
4. CI and production workflow link;
5. deployed Worker version when applicable;
6. live runtime and proof links;
7. concise description of what changed;
8. explicit list of what was proven;
9. every remaining residual or failed post-deployment check;
10. the next governed build boundary.

`DEPLOYED` is not equivalent to `RELEASE_CLEAN`. A required red post-deployment proof must remain visible in the ledger until repaired and independently re-proven.

The advancement ledger is an operational provenance surface. It does **not** grant execution authority, prove current PC presence, establish scientific truth, mutate CanonState, or replace R125 admission.

## Current lineage

- R207: native R141 proof wrapper over frozen R205 executor; deployed, post-deploy R117/R141 compatibility defect discovered and repaired forward.
- R207.1: compatibility repair deployed; all primary runtime gates passed; strengthened R202 verifier exposed its own string-versus-Buffer comparison defect while independently confirming the live R205 SHA matched the expected immutable SHA.
- R207.2: active candidate; repairs the verifier to compare raw bytes with `Buffer.equals()` while retaining SHA-256 equality and exact-byte enforcement.

See issue #435 for the append-only human completion record and final release links.