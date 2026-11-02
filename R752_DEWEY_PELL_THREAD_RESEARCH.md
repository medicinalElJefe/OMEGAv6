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

## V15: complete classification, not merely one generated sequence

For every nontrivial left-half coefficient equality with *both* row and column differences exactly one,

    C(n,k)=C(n-1,k+1), k>=2, n-1>=2(k+1),

there exists a unique t>=1 with m=2t+2 such that

    n=F_m F_(m+1), k=F_m F_(m-1)-1,
    n-k-1=F_m².

This is an **if and only if** classification. Its proof is a globally valid integer-affine descent under the exact inverse P^-1(n,k)=(-n+3k+2,-3n+8k+5). For k>=5 on Q(n,k)=0 the resulting (N,K) satisfies K>=0, N>=2(K+1), K<k. The three inequalities are certified by discriminant identities:

    (7k+4)²-9D(k)=4(k-5)(k+1)>=0;
    25D(k)-(11k+10)²=4k(k-5)>=0;
    9D(k)-(5k+4)²=20k²+32k+20>0,

where D(k)=5k²+8k+4. k=1..4 have nonsquare discriminants, and k=5 gives the base (15,5) descending to (2,0). Strictly decreasing k proves no other orbit exists. Cassini's identity at even m proves the Fibonacci formulas satisfy Q=0. Hence ALL admissible adjacent-row-and-column equalities belong to the known Pell/Fibonacci family.

Exact instance: t=5, m=12, F_12=144, (n,k)=(33552,12815), and n-k-1=144²=20736=12⁴. This is a number-theory equality with the OMEGA 20,736-address count, not evidence of shared physical dimensions or equivalent mathematical domain semantics.

Files: src/proof/singmasterPellClassificationR752.js, tests/r752-pell-complete-classification-invariants.mjs. The stand-alone V15 research package includes an independently recomputed 20,376-cell crosswalk and a k<=200,000 discriminant scan. Its CSV bytes are not source-ingested by this PR.

**Truth gate:** this classification covers first column step one and first row step one ONLY. Pairs of row gap 1 and larger column step remain independent. Global fourfold exclusion count gained is **zero**; all 3,249 unresolved V13/V14 chart regions and global G09/G10/G13 remain OPEN. It is not a newly claimed theorem of historical priority, and no CanonState, production, or self-scheduling authority is conferred.
