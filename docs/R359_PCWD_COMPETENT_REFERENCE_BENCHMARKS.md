# R359 · PCWD Competent Reference Benchmarks

R358 proved that PCWD could expose information that deliberately minimal baselines discarded. R359 raises the standard: compare PCWD against **competent, established reference methods for the same subproblem**.

This phase is intentionally capable of producing uncomfortable results.

## Truth rule

A PCWD result is not called superior when a conventional specialist method already preserves the same information or solves the same mathematics.

R359 classifies outcomes as:

- **MATCH** — PCWD and the competent reference agree on the tested property.
- **TRADEOFF** — both are correct, but PCWD pays a measurable cost.
- **FAIL** — the tested PCWD specialization omits behavior the reference includes.
- **FIXED** — a preserved failing benchmark drove a specific repair that now matches the reference.

A FIXED case does not delete the FAIL case. Both remain in the suite.

## Reference problems

| Case | Reference method | What is tested |
|---|---|---|
| HAAR_WAVELET_ROUND_TRIP | one-level orthonormal Haar transform | reversible multiresolution decomposition |
| LINEAR_COVARIANCE_REFERENCE | (F P F^T) | correlated linear uncertainty transport |
| KALMAN_PROCESS_NOISE_LEGACY | (F P F^T + Q) | whether additive process noise is represented |
| KALMAN_PROCESS_NOISE_R359 | (F P F^T + Q) | benchmark-driven repair of the covariance specialization |
| EVENT_SOURCING_PATH_HISTORY | append-only event sourcing | ordered path/history retention |
| HASH_CHAIN_INTEGRITY | SHA-256 append-only hash chain | tamper-evident history |
| PROBABILISTIC_BRANCH_RETENTION | full categorical distribution | preservation of all future hypotheses |
| LORENZ63_RK4_REFERENCE | RK4 on Lorenz-63 | numerical trajectory correspondence |
| QUBIT_UNITARY_REFERENCE | standard 2×2 unitary density-matrix evolution | ordinary quantum round-trip validity |
| ARNOLD_CAT_MAP_REVERSIBILITY | invertible finite-torus cat map | exact reversible discrete transport |

## Important R359 discovery

The original PCWD covariance specialization implemented

[
P' = FPF^T
]

but had no explicit additive process-noise term.

That is sufficient for a deterministic linear frame transform but incomplete for a standard Kalman prediction step,

[
oxed{
P_{k+1}=F P_k F^T + Q
}
]

when (Q
eq0).

The competent benchmark therefore records **KALMAN_PROCESS_NOISE_LEGACY = FAIL**.

R359 adds a separate affine covariance transport:

[
oxed{
operatorname{Cov}' = Joperatorname{Cov}J^T + Q
}
]

and preserves the legacy failure as evidence. The repaired case must then match the same reference exactly.

This is the intended development loop:

[
	ext{benchmark}
ightarrow
	ext{failure}
ightarrow
	ext{bounded repair}
ightarrow
	ext{same benchmark}
ightarrow
	ext{proof}
]

not:

[
	ext{benchmark}
ightarrow
	ext{rename failure as success}.
]

## What R359 is expected to show

The strongest specialized reference methods should often **match** PCWD.

That is valuable. It means:

- Haar already knows how to preserve transform detail efficiently.
- Kalman covariance propagation already preserves covariance correctly.
- event sourcing already preserves ordered history.
- hash chains already provide tamper evidence.
- full probability distributions already retain competing hypotheses.
- RK4 already computes the Lorenz trajectory.
- standard quantum mechanics already supplies the unitary evolution law.
- invertible maps are reversible because of their mathematics.

PCWD's claim is therefore narrower and more testable:

> Can one state-transport proof contract carry these very different kinds of correctness, residuals, evidence, recovery, path/history, and promotion semantics without changing the underlying domain mathematics?

R359 tests that proposition more seriously than a collection of weak baselines would.

## Advancement rule

R359 should not advance merely because it has many MATCH results.

It must retain:

1. the legacy covariance failure;
2. the benchmark-driven covariance repair;
3. the Haar efficiency tradeoff;
4. all competent reference comparisons;
5. the existing R358 cost and negative-control history.

The next continuation should focus on the **cross-domain invariant layer**: identifying exactly which receipt fields are genuinely common across these reference problems and which fields are domain-specific and should not be forced into a false universal semantics.
