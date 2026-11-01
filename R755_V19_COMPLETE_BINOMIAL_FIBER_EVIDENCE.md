# R755 / V19 — Complete finite-value binomial fibers

For a **fixed** positive integer A, all nontrivial left-half binomial representations C(r,l)=A can be certified by a complete list of columns. This is classical binomial monotonicity instantiated as an exact, replayable OMEGA proof instrument. It is not a new general Singmaster theorem.

For each l>=2, the minimal eligible row is r=2l, and C(r,l) strictly increases with r. The central coefficient C(2l,l) strictly increases with l. Therefore:
1. When C(2l,l)>A, stop: every l'>=l is impossible.
2. Otherwise, compute the exact least R>=2l for which C(R,l)>=A.
3. The exact inequality C(R-1,l)<A<=C(R,l), or the central lower bound if R=2l, certifies all row indices for that column.
4. A representation is present **if and only if** C(R,l)=A.

The external, separately compiled GMP verifier independently rechecked all 18,833 certificates over the first five known Pell/Fibonacci coefficients, with 11 total nontrivial representations:

- (n,k)=(15,5): 3 representations, at (78,2), (15,5), (14,6).
- (104,39): 2; (104,39), (103,40).
- (714,272): 2; (714,272), (713,273).
- (4895,1869): 2; (4895,1869), (4894,1870).
- (33552,12815): 2; (33552,12815), (33551,12816). The exact coefficient has 9,688 decimal digits.

The last case has all 16,093 admissible columns checked; from l=16,095 upward the central coefficient is too large. Crossings for small columns may have thousands of decimal digits, so exact arbitrary-precision row indices are required.

**External research evidence** (NOT ingested by this PR):
- 01_COMPLETE_FIBER_CROSSING_CERTIFICATES.csv SHA-256: 499abb914df60ee9319b65b7ce693f5b8b443c5ea2bb6cd28e03d4e5b169311e.
- 02_COMPLETE_FIBER_SUMMARY.csv SHA-256: 38b4207726a42866310b9a2446022d75aadc71a27318e28b6f907b58f41a8f14.
- 03_ALL_EXACT_EQUALITIES.csv SHA-256: 8fc1b2f3453eeea3149cde7ae71da6791691d69de36287962fccab020e4a1a70.
- Independent compiled verifier output: FULL_INDEPENDENT_EXACT_AUDIT_PASS 18833 ROWS.

**In-repo implementation:** src/proof/singmasterCompleteFixedFiberV19.js and tests/r755-v19-complete-fixed-fiber-invariants.mjs. The JavaScript regression checks all admissible columns for t=1,2,3; it does NOT replay the large external t=4 and t=5 datasets in CI. A budget limit returns RESOURCE_HOLD_NO_INFERENCE, never a false mathematical exclusion. Integrated into the canonical R110 gate alongside preserved R752–R754 research regressions.

**Truth boundary:** This establishes exactly five finite coefficient fibers and **zero** new exclusions over the remaining infinite symbolic Atlas regions (17,127 previously closed / 3,249 open). All 20,736 original OMEGA addresses are preserved under the 20,376-region research coarsening. Singmaster G09/G10/G13, claims of mathematical historical priority, physical universal calculus, active Auto-Ping, full OMEGA production capability and deployment remain OPEN / NOT VERIFIED.

No CanonState write, R295 automatic proof admission, new production route, autonomous scheduler or feature-parity claim is authorized by this module.
