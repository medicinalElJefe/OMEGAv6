# OMEGA R506 — Result-Conditioned Source Reconciliation

R506 closes the first live post-R505 failure discovered by the canonical CLOUD-01 cycle.

## Observed production result

After R505 deployed successfully, the immediate R388 cycle correctly produced an applied-calculus TURN for R388-C-03. The source patch was still rejected by the unchanged R314 membrane because the model supplied a replacement preimage that occurred zero times in the exact current source:

`FILE_1_REPLACEMENT_1_PREIMAGE_OCCURRENCES_0`

The important conclusion is not to weaken R314. The rejection itself must change the next computation.

## R506 consequence transport

For a zero-occurrence preimage rejection:

1. exact current source remains authoritative;
2. the runtime derives unique exact anchors from the current blob using the rejected intent plus residual/stage semantics;
3. the correction worker selects an `anchorId` or is accepted only when a unique token-based anchor can be resolved;
4. the runtime, not the model, binds the exact current `before` text and current blob SHA;
5. the unchanged R314 validator then checks the resulting patch;
6. R505 applied-calculus binding and unchanged R503/R504 gates still run afterward.

Thus:

`REJECTION -> CURRENT-SOURCE REANCHOR -> CORRECTION -> R314 -> R505 -> R503 -> R504 -> PROOF`

R506 adds no Canon, deployment, source-promotion, or execution authority. Ambiguous re-anchoring fails closed.
