# R753 — Pell arithmetic skin: gcd asymmetry, forced divisibility, Kummer sieve

## Mathematically precise, established prior art
For the known complete adjacent-row/adjacent-column Fibonacci family (Singmaster 1975), put m>=4 even; a=F_(m-2), b=F_(m-1), c=F_m, d=F_(m+1), n=cd and k=ad. Cassini and the Fibonacci determinant imply k=cb-1 and n-k=bd=c²+1.

**Universal within this family**:
- gcd(n,k)=d=F_(m+1).
- gcd(n-1,k+1)=gcd(b,2), either 1 or 2.
- gcd(c,n-1)=1.
- L=c*(n-1)/gcd(b,2) divides the common coefficient A=C(n,k)=C(n-1,k+1).
- Every odd prime dividing d is 1 mod 4, since c²=-1 mod d and -1 is a quadratic residue only at primes 1 mod 4 (or 2).
- For EVERY other representation C(r,l)=A, the number of Kummer base-p carries in l+(r-l) must be at least v_p(L) for every prime p.

The divisibility proof uses k*C(n,k)=n*C(n-1,k-1), implying n/gcd(n,k) divides C(n,k); apply to both representations, then use gcd(c,n-1)=1. Full derivation in the downloadable local V16 research archive.

### Exact witness
At m=12, (n,k)=(33552,12815), gcd(n,k)=233, gcd(n-1,k+1)=1, and L=144*33551=4,831,344 divides A. The interior-square identity gives n-k-1=20736. The equality with OMEGA's historical Atlas cardinality is numeric only.

## Bounded scan, not a global proof
Local V16 independently verifies 129 Fibonacci states, 3,225 exact p-adic valuations for 25 primes up to 97, and 138,001 *additional-representation candidates* restricted to t=2,3,4,5, 15 additional columns per state and rows 2*l<=r<=n-2. Of those candidates, 44,658 fail at least one compulsory small-prime valuation; 93,343 survive THIS NECESSARY test only. No survivor is claimed equal.

The V15 20,376-cell chart and its 20,736 original source address lineage remain unchanged: 17,127 fourfold-excluded, 3,249 OPEN. Exactly ZERO new global fourfold closures are justified.

## Code and truth boundary
- src/proof/singmasterPellSkinR753.js: independent exact Fibonacci/gcd/Kummer kernel with prime validation, bounded thread index and source-scope refusal.
- tests/r753-pell-arithmetic-skin-invariants.mjs: 129 states x 25 primes (3,225) compared against independent BigInt Legendre valuation, negative-control regression, fixed candidate sieve.
- Canonical R110 static test gate chains the R753 regression, preserving existing CI/release authority.
- R752 remains a separate draft prior to acceptance; R753 imports no R752 code. No new proof-domain authority, production writer, user-facing route or scheduled Auto-Ping is installed.
- CSV evidence is an independently verified offline research archive and has NOT been source-byte ingested into OMEGA production. R292–R295 certificate-completeness/proof-admission and G09/G10/G13 OPEN status remain unchanged.

Prior art:
- David Singmaster, Repeated Binomial Coefficients and Fibonacci Numbers, Fibonacci Quarterly 13(4), 1975, 295–298.
- Kummer's 1852 prime-valuation/carry theorem; Fibonacci Cassini identities and Euclidean gcd identities.

The intended contribution is a rigorously scoped, independently replayable *evidence instrument* for the OMEGA research architecture, not mathematical discovery priority or the universal Singmaster proof.
