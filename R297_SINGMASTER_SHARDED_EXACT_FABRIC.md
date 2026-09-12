# R297 · Singmaster Sharded Exact Fabric

R297 scales the R296 exact finite-box kernel without weakening its arithmetic guarantees. Its canonical parent is promoted R296 main `07fffd8745a3d936e9c76087299b0d637d6442aa`. The computation is partitioned by nontrivial Pascal columns, but equality is reconstructed globally by deterministic buckets computed from the **exact integer coefficient value**. This preserves cross-shard collisions.

## Baseline exact domain

The R297 baseline covers:

- `2 <= k <= 100`
- `2k <= n <= 1000`
- **89,001** exact Pascal cells
- 33 deterministic column shards of width 3
- 64 exact-value coordinator buckets

The baseline contains 88,992 distinct integer values and exactly eight repeated nontrivial fibers:

`120, 210, 1540, 3003, 7140, 11628, 24310, 61218182743304701891431482520`.

The final value is the first large Fibonacci-family collision in this box:

`C(104,39) = C(103,40) = 61218182743304701891431482520`.

The maximum nontrivial left-half multiplicity remains 3. No fourfold nontrivial fiber occurs inside the declared baseline box.

## Why sharding is exact

A naive distributed search can lose a collision when equal values are produced by different workers. R297 does not compare only inside shards. Each shard emits every exact value and its `(n,k)` address to a coordinator bucket determined solely by that exact value:

`bucket = H(exact integer value) mod bucketCount`.

Therefore two identical binomial coefficients are guaranteed to arrive in the same coordinator bucket regardless of which column shard generated them. The coordinator then compares the complete exact decimal integer key, not the hash. Hash collisions merely place unrelated values in the same bucket; they cannot create or erase equality.

The baseline deliberately uses width-3 shards. Three known equalities cross shard boundaries — `3003`, `11628`, and `24310` — and the invariant suite verifies that all three are reconstructed correctly. The suite also re-runs the R296 `n <= 300, k <= 30` domain through R297 and requires semantic identity with the monolithic R296 result. It then changes shard width and bucket count and requires the same collision semantics again.

## Exact arithmetic carry

Each composed collision fiber is independently verified with exact BigInt coefficient evaluation, a complete prime-valuation signature through the declared row bound, and Kummer base-p carry equality. The composition fabric therefore preserves the same arithmetic invariant as R296; it only changes the computational partition.

In Woven Continuity terms, the partition is allowed to change while the invariant carry survives the transform. The shard identity is history/provenance. The exact integer and complete valuation signature are the carried invariant. The unresolved exterior is retained as a scar rather than silently promoted away.

## Proof scope

The proof scope is `EXACT_BOUNDED_SHARDED_COMPOSITION`.

The baseline certificate proves only:

> No exact coefficient with `2 <= k <= 100` and `2k <= n <= 1000` has four distinct nontrivial left-half representations.

That is a substantially larger exact bounded closure than R296, but the public global theorem status remains **OPEN**. R297 does not close `G09`, `G10`, or `G13`. The regions `n > 1000` and `k > 100`, together with every global arithmetic-geometry family not otherwise proved, remain explicit exterior obligations.

The No-Go atlas entry is therefore `PRUNE_EXACT_COMPOSED`, `exhaustiveWithinDeclaredBox: true`, and `terminalForGlobalClaim: false`.

## Headless execution

Run the baseline with:

`node scripts/r297-singmaster-sharded-exact.mjs`

Optional controls:

- `OMEGA_R297_MAX_N`
- `OMEGA_R297_MAX_K`
- `OMEGA_R297_SHARD_WIDTH`
- `OMEGA_R297_BUCKET_COUNT`
- `OMEGA_R297_MAX_CELLS`
- `OMEGA_R297_OUTPUT`

The artifact includes shard receipts, bucket receipts, collision fibers, complete carry signatures, bounded No-Go state and a SHA-256 evidence digest. A bounded clean result maps to R294 `NO_CLOSURE`, never global theorem closure. A fourfold exact fiber maps to `COUNTEREXAMPLE` escalation and must be independently replicated before any source-level theorem change is considered.
