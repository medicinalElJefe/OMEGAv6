# R756 · Dewey V20 exact logarithmic-window central cutoff

For a declared fixed nontrivial binomial coefficient A=C(n,k) with n>=4 and 2<=k<=n/2, define b=bit_length(A) and B=bit_length((2n+1)A).

**Theorem:**
L0=floor((b-1)/2) is a guaranteed possible column (C(2L0,L0)<=A).
U0=ceil(B/2) is an impossible column (C(2U0,U0)>A).
The exact LAST POSSIBLE column L is unique in [L0,U0-1], identifiable with O(log log n) exact central-binomial evaluations after constructing A. The *arithmetic cost* of each evaluation is not constant.

Proof: 4^l/(2l+1)<=C(2l,l)<=4^l; the central coefficient is the maximum term in row 2l. 2^(b-1)<=A<2^b and (2n+1)A<2^B yield the two inequalities. For n>=4, U0<=n, permitting the denominator 2U0+1<=2n+1. Central binomial values are strictly increasing with l. R756 does final exact BigInt endpoint comparisons; no numeric estimates can override them.

**Known infinite Pell sequence asymptotic:** as t grows, k_t/n_t->alpha=(3-sqrt(5))/2; Stirling then gives L(A_t)/n_t->H(alpha)/ln4 ~0.4797093641113721, where H(x)=-x ln x-(1-x) ln(1-x). Standard entropy mathematics, not novel theorem priority or physical dimensionality.

**Research certificate:** The external V20 archive independently rechecks exact column cutoffs for eight Pell values (t=1..8). Last possible columns:
6, 49, 342, 2347, 16094, 110318, 756136, **5182637**.
The eighth value has n=10803704,k=4126647 and a coefficient of 10365264 bits; only five EXACT central tests were needed to locate its cutoff. These are **not** complete coefficient-fiber enumerations for t=6,7,8. Original V19 fully classified the first five fixed coefficient fibers separately.

**Repo tests:** src/proof/centralCutoffBitBoundR756.js, tests/r756-central-bit-cutoff-invariants.mjs, chained into tests/r110-runtime-aware-working-set-invariants.mjs. Tests cover t=1..5 only; large offline C++/GMP cases t=6..8 are external, not source-ingested or claimed tested by GitHub.

**Critical merge-order issue:** R755 PR #1219 independently modifies R110 and contains the R752–R754 and V19 instruments. Before any R756 merge, reconcile ALL R755 imports against the exact mainline and rerun eight exact-head workflow families. Never overwrite or lose verified functions on merge. No R295 source promotion, CanonState mutation, production route, live Auto-Ping, physical universality claim, or global Singmaster closure is authorized. 17,127 closed and 3,249 open Atlas symbolic fourfold regions remain unchanged, and G09/G10/G13 remain OPEN.

Independent V20 ZIP SHA-256: 0776ddbf90b9a2b5067eee9b4a8b37870644cc13de08189bf8cbc2968b41241c. Full previous V1–V19 archive preserved by SHA-256 3153dd56c16fc3829c7c7c8f1ec8915917f071ed3e8ee8212fdbb31fed16bce2.
