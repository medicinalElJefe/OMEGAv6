# R296 · Singmaster Exact Closure Kernel

R296 advances the Singmaster proof program from framework-only proof governance into an executable exact-arithmetic closure kernel while preserving the theorem truth boundary.

## What R296 proves

The baseline certificate performs a complete BigInt enumeration of the finite left-half box

- `2 <= k <= 30`
- `2k <= n <= 300`
- exactly **7,801** Pascal cells

Every coefficient in that box is computed exactly and grouped by exact integer value. The complete collision list is

`120, 210, 1540, 3003, 7140, 11628, 24310`.

The maximum nontrivial left-half multiplicity in this exact box is `3`, achieved by `3003` through

`C(78,2) = C(15,5) = C(14,6) = 3003`.

Therefore the baseline R296 certificate establishes the bounded statement:

> No exact coefficient with `2 <= k <= 30` and `2k <= n <= 300` has four distinct nontrivial left-half representations.

That is an exact finite theorem about the declared box.

## Arithmetic certificate

For every repeated coefficient, R296 computes the full prime-valuation signature through the declared row bound. Since every prime divisor of `C(n,k)` is at most `n`, primes through the box row bound are sufficient for a complete factor-valuation signature inside the box.

R296 also checks Kummer carry equality for every prime in that complete range:

`v_p(C(n,k)) = number of base-p carries in k + (n-k)`.

This is the Woven Continuity carry layer in exact arithmetic form: the invariant being carried is not a visual or real/complex surrogate but the complete integer prime-valuation signature.

The kernel also exposes a separating-prime certificate. If two exact binomial coefficients differ, R296 searches primes through the larger row index and returns the first prime at which their valuations differ. One separating prime is sufficient to certify that the two cells cannot occupy the same integer fiber.

## No-Go atlas contribution

R296 compiles the finite search into a No-Go entry with status `PRUNE_EXACT_BOUNDED`. The entry is exhaustive **within the declared box** and is explicitly marked `terminalForGlobalClaim: false`.

This distinction is mandatory. The finite certificate refines the unresolved `MIXED-BOUNDARY` region, but it does not exhaust that global family.

## Truth boundary

The public theorem status remains **OPEN**.

R296 does not close:

- `G09` — global small-k / four-column family exhaustion,
- `G10` — residual arithmetic-geometry closure,
- `G13` — final global `M(a) <= 3` theorem gate.

Rows `n > 300` and columns `k > 30` remain outside the baseline finite certificate. `EXACT_BOUNDED_ONLY` means exactly that: bounded exact proof, not extrapolation.

R296 also has no source mutation authority, production authority, or CanonState admission authority. If a future run finds a genuine fourfold exact fiber, the result must enter the R294/R295 evidence and independent-replication path as a counterexample candidate. If a future bounded run finds none, it remains a bounded `NO_CLOSURE` return unless a separate proof establishes exhaustive global coverage.

## Executable surface

Headless execution:

`node scripts/r296-singmaster-exact-closure.mjs`

Optional bounds and output artifact:

- `OMEGA_R296_MAX_N`
- `OMEGA_R296_MAX_K`
- `OMEGA_R296_MAX_CELLS`
- `OMEGA_R296_OUTPUT`

The output carries a deterministic SHA-256 evidence digest, exact scope, collision fibers, complete carry signatures, No-Go atlas entry, and suggested R294 outcome. The default baseline remains globally non-promotional even when every bounded check passes.
