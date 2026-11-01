# R752 · Reversible Pell Thread / Dewey Continuity (research candidate)

An exact, previously known infinite family of adjacent-row binomial collisions is represented by a reversible integer affine map. R752 does not add a new mathematical theorem to the literature or close the sharp Singmaster conjecture.

- Q(n,k) = n² -(3k+2)n+k(k+1).
- T(n,k) = (8n-3k-1, 3n-k-1).
- T^-1(n,k) = (-n+3k+2,-3n+8k+5).
- Q(T(n,k))=Q(n,k) identically, including points outside the binomial domain.
- Starting at (2,0) gives (15,5), (104,39), (714,272), (4895,1869), ... .
- Each admissible orbit point satisfies C(n,k)=C(n-1,k+1).
- In Pell coordinates x=5k+4,y=2n-3k-2, the form x²-5y²=-4 is preserved. This is a hyperbolic number-theoretic symmetry, not a physical Euclidean rotation.

**Proof mechanism:** the exact difference Q(T(n,k))-Q(n,k) is quadratic in n,k, so evaluating it at the six unisolvent points (0,0),(1,0),(-1,0),(0,1),(0,-1),(1,1) proves the polynomial is identically zero. R752 runs this certificate rather than trusting a caller-supplied PASS flag; negative tests mutate affine offsets and require failure.

**OMEGA bridge:** R292 tracks the exact certificate and existing unresolved G09/G10/G13 proof obligations; R293 derives research cells without changing CanonState, proof admission, deployment or Auto-Ping. No R295 domain is registered. The V14 external 20,376-cell crosswalk is a separate local research artifact and requires independent source-digest ingestion before it can be treated as live OMEGA data.

**Atlas result:** 142 of V13's 3,249 open chart regions contain an infinite Pell-pair subfamily with first row gap 1 and k1>=501. These cases do not assert additional representations, do not close any fourfold region, and do not prove a global theorem.

Known family: David Singmaster, *Repeated Binomial Coefficients and Fibonacci Numbers*, Fibonacci Quarterly 13 (1975), 295–298. https://www.fq.math.ca/Scanned/13-4/singmaster.pdf

Execution: node tests/r752-pell-thread-invariants.mjs. All other existing R290-R751 authority and CI boundaries are preserved. Production evidence requires the canonical eight-workflow exact-head and live-SHA gates.
