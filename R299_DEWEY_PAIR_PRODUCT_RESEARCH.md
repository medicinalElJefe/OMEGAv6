# R299 research candidate — Dewey exact pair-product obstruction V6

This is a nonpromotional generalization of the V5 adjacent-diagonal defect to arbitrary ordered left-half pairs. For integers `2 <= k < l`, `n > m >= 2l` and `n >= 2k`, put `d=n-m`, `e=l-k`, `r=n-k`, `s=m-l`.

Then

`C(n,k)/C(m,l) = [product(j=m+1..n) j * product(j=k+1..l) j] / product(j=s+1..r) j`.

Thus the **integer product defect** (numerator minus denominator) is zero if and only if the two exact binomial coefficients are equal. A nonzero defect is an exact exclusion certificate. The complement displacement `r-s=d+e` is a useful coordinate identity, but not an additional independent obstruction.

This avoids floating-point approximation, works for nonadjacent column pairs, and can be extended with modular and p-adic rejection. It is a reformulation of factorial cancellation and **not a new proof of the sharp Singmaster conjecture**.

Run `node tests/r299-dewey-pair-product-invariants.mjs`. The test file checks known sporadic and Fibonacci collisions, near misses, displacement bookkeeping, and rejects inadmissible coordinates.

**Claim boundary:** G09, G10, G13 remain OPEN. The finite R296/R297 exact scans and R298 labeled pair-star criterion remain the separate existing sources of bounded evidence. This candidate adds a reusable fixed-pair certificate but no family-exhaustiveness argument, no authoritative theorem promotion, and no production deployment claim.
