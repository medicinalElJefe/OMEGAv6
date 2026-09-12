# R298 · Singmaster Labeled Pair-Star Compatibility

R298 corrects a subtle but important proof-architecture hazard: pairwise binomial collisions cannot be treated as an unlabeled graph.

If four nontrivial columns are to share one coefficient, all **six pair edges** must carry the **same exact value**. Six pairwise equalities involving different coefficient values do not compose into a four-column common fiber.

## Exact criterion

For each repeated coefficient in the R297 exact bounded atlas, R298 creates a hyperedge on the participating columns. It then derives ordinary pair edges, but every pair edge retains the full set of exact coefficient labels that generated it.

For a four-column tuple `{k1,k2,k3,k4}`, define the six label sets attached to

`(k1,k2), (k1,k3), (k1,k4), (k2,k3), (k2,k4), (k3,k4)`.

The tuple is a coherent four-column candidate exactly when the intersection of those six label sets is nonempty.

That is stronger than asking whether all six unlabeled edges merely exist.

## Why the criterion is equivalent inside the bounded atlas

The fixed-column uniqueness reduction is already proved: for fixed `k`, `n -> C(n,k)` is strictly increasing on the left-half domain `n >= 2k`. Therefore a given exact coefficient label selects at most one row in each participating column.

Consequently, if one label survives all six pair edges, the same exact integer coefficient has one representation in each of the four columns and therefore forms a coherent four-column fiber. Conversely, any four-column common fiber creates all six pair edges with that same label.

So inside a complete bounded collision atlas:

`coherent four-column fiber  <=>  one common exact label on all six pair edges`.

R298 checks this equivalence against the R297 source certificate.

## False-positive defense

The invariant suite includes a synthetic unlabeled `K4` in which every pair collides but every edge has a different value. A naive pairwise graph would incorrectly keep that configuration. R298 identifies it as a **false positive** because the six-way label intersection is empty.

A second synthetic case gives one value to all four columns. R298 correctly reconstructs the coherent tuple. A third adds unrelated extra pair labels and proves that they cannot erase the genuine common label.

## Baseline R297 application

The R297 exact box has no fourfold coefficient, so R298 has zero coherent four-column candidates and agrees exactly with the source fourfold-candidate count.

The graph still preserves multi-label structure. For example, the pair `(2,5)` carries both `3003` and `11628`, while `(2,6)` and `(5,6)` carry `3003`. This is precisely why labels cannot be discarded.

R298 also compiles pair stars: a center column with three neighboring columns records the intersection of the three arm-label sets. Arm compatibility is useful as an early filter, but it is not final closure until the three leaf-to-leaf edges preserve the same label as well.

## Truth boundary

The public Sharp Singmaster status remains **OPEN**. R298 is an exact compatibility reduction over the bounded R297 collision atlas. It does not establish global family exhaustiveness and does not close `G09`, `G10`, or `G13`.

The unresolved exterior remains explicit. No graph density, unlabeled clique, numerical proximity, real/complex intersection, or mode score can substitute for the identical exact integer label required by the arithmetic fiber.
