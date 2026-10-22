# OMEGA R128 — Empirical Calibration & Deterministic Replay Ledger

R128 converts OMEGA's validation layer from an internal proof chain into a structure that can distinguish internal consistency from external empirical performance.

The governing chain is:

`EXTERNAL DATA → CALIBRATION SPLIT → FIXED THRESHOLD → UNTOUCHED HOLDOUT → METRICS → INDEPENDENT REPRODUCTION → VALIDATION RECEIPT → R127/R125 ADMISSION BOUNDARY`

## Why R128 exists

A deterministic program can perfectly reconstruct a rule that generated its own labels and still have zero evidence that the rule predicts the outside world. Likewise, synthetic benchmarks, internal simulations, model agreement, and a passing CI suite are useful engineering evidence but are not external scientific validation.

R128 therefore gives synthetic/internal data **zero external-validation credit**.

## Deterministic replay identity

The semantic replay hash covers the experiment identity, model identity, claim, semantic example contents, policy, upstream proof hashes and notes. Wall-clock observation metadata is intentionally excluded from semantic identity so the same experiment can be replayed later and produce the same hash.

Ordering does not change semantic identity. Changing any semantic evidence value does.

## Split discipline

Examples are explicitly classified as `TRAIN`, `CALIBRATION`, or `HOLDOUT` and as `EXTERNAL`, `SYNTHETIC`, or `INTERNAL_DERIVED`.

Threshold selection occurs only on calibration data. Holdout examples never participate in threshold fitting. Duplicate IDs crossing the fit/holdout boundary cause a hard leakage failure.

External holdout data are the only rows credited toward external validation status.

## Metrics

R128 records:

- confusion matrix;
- precision;
- recall;
- specificity;
- accuracy;
- F1;
- balanced accuracy;
- Brier score;
- expected calibration error.

All metrics are finite, deterministic, and attached to a replayable receipt.

## Validation state

R128 emits exactly one evidence state:

- `VALIDATED` — explicit policy thresholds pass on a sufficiently large external holdout and required independent reproduction passes;
- `NOT_VALIDATED` — a valid independent reproduction reports failure;
- `INCONCLUSIVE` — external data, holdout size, metrics, or independent reproduction are insufficient.

`VALIDATED` means **validated against the declared dataset, split and policy**. It is not a universal-truth claim.

## Default policy

Unless overridden explicitly, the current engineering defaults are:

- optimize threshold for F1;
- at least 20 external holdout examples;
- F1 ≥ 0.75;
- Brier ≤ 0.20;
- expected calibration error ≤ 0.15;
- independent reproduction required.

These are software validation defaults, not universal scientific constants. Domain-specific validation should replace them with preregistered criteria appropriate to the measurement problem.

## Independent reproduction

When required, validation needs at least two reproducible PASS receipts from two independent source families targeting the exact semantic replay hash. Any qualified FAIL receipt forces `NOT_VALIDATED`.

## Authority

R128 emits empirical-validation evidence, not CanonState. It carries `canonicalMutation:false` and authority `R128_EMPIRICAL_VALIDATION_EVIDENCE_NOT_CANON`.

R128 therefore strengthens the chain:

`R126 causal candidate → R127 evidence/execution proof → R128 external calibration/replay evidence → R125 governed admission`

No later layer is allowed to reinterpret an internal benchmark as external validation or use a validation receipt to bypass the canonical admission boundary.
