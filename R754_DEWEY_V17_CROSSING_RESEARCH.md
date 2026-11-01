# R754 / Dewey V17 — Exact higher-column crossing certificates

## Mathematical basis (standard monotonicity)
For each integer l>=1, C(r+1,l)/C(r,l)=(r+1)/(r+1-l)>1 when r>=l. Thus an exactly certified strict crossing C(s-1,l)<A<C(s,l) precludes any equality C(r,l)=A for all integer rows within a prescribed interval. If the lower endpoint is already larger than A, all rows are larger; if the upper endpoint is smaller, all rows are smaller. If equality occurs, the certificate explicitly reports it rather than reporting exclusion.

src/proof/singmasterColumnCrossingR754.js executes a fully **exact BigInt** binary search over row indices for one specified column l>k+1 and row window 2l<=r<=n-2 of a fixed known coefficient A=C(n,k). The function can also return a real equality if one exists. No floating-point comparison is accepted as proof.

## Finite V17 offline study
The separate downloadable V17 archive audits all columns k+2<=l<=floor((n-2)/2) for the first five positive Pell/Fibonacci pair states:
(15,5), (104,39), (714,272), (4895,1869), (33552,12815).
For each column, its exact crossing endpoints are checked with a separate Python verifier. This is a **finite** family and not a proof about all Pell orbit points. V17 does not exclude smaller columns l<k: 3003=C(78,2)=C(15,5)=C(14,6) is an explicit necessary negative control against false global claims.

Any resulting absence of higher-column equalities for the first five values establishes only that a *further* representation for those coefficients (if one exists) must use smaller columns. The canonical fourfold status stays unchanged: 17,127 previously excluded chart cells; 3,249 unresolved; no new global fourfold closures. All 20,736 source addresses remain under unchanged 20,376-cell coarsening.

The complete offline V17 dataset has its own SHA-256 manifest and independent reproduction script. Its CSV bytes are **not** ingested by this PR. The GitHub regression checks selected t<=5 cases and exact boundary refusals; it must not be represented as replaying all offline CSVs.

## Authority and release boundary
This branch adds no production route, theorem admission, R292/R295 source-authority bypass, automatic scheduler, physical-dimension claim, OMEGA7 feature or CanonState mutation. Global Sharp Singmaster remains OPEN. A draft PR requires exact-head canonical workflows and separate postmerge live production evidence.
