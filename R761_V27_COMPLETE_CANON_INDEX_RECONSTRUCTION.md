# R761 / V27 — Complete Canon index-only numerical reconstruction

## Verified source replay
A compact, inferred five-axis generator reproduces the original corrected Canon workbook's **248,832 Mode 188 indices, all five recorded metric/score fields, and all 248,832 STAY/TURN/ESCALATE decisions**, including the previously held 92 boundary cases. Zero recorded-field mismatches at four-decimal source precision. The independent source-ingestion/normalization and index-only BigInt generator share a complete ledger digest SHA256: **c5560df0a6967013a46d6eb5c286298b01961329427469568407cc8a6c65eb35**. Original XLSX SHA256: **e1ccb57cdfbc78955dd6e86be110cdb91cb15a0cc78a869b74dca7e4ffa55af3**.

Source label census reproduced: 73,214 STAY, 111,786 TURN, 63,832 ESCALATE.

## Exact reconstructed formulas
Let D,S,R,M,P be integers from 1 to 12, and d=D−1, s=S−1, r=R−1, m=M−1, p=P−1.

- Mode188 G = 1 + ((3D + 5S + 7R + 11M + 13P) mod 188).
- Contradiction q = (1 + ((G−1) mod 12) + |D−R| + |S−M|) / 34.
- Burden Λ = (1 + ((4 + d+s+r+m+p + d*s) mod 12)) / 12.
- Future plasticity Φ = (70−d−4s+2r+4m+4p)/180.
- Continuity CΩ = min(1, (105+20d+27s+17r+19m+22p)/1260 + (7/1000)*((s+r+m+p) mod 6)).
- Score S_coherence = CΩ Φ / (q+Λ+1/1000).
- Decision = STAY if S_coherence >= 0.42, TURN if >= 0.22, otherwise ESCALATE.

The system does NOT use the source rounded metrics or decisions to generate predictions. Exact rational arithmetic occurs before decimal export; source fields are rounded to four places only at the end. In a compact integer implementation with continuity numerator cN/63000 and future plasticity numerator phiN/180, S = (17 cN phiN)/(3780(1500 qN + 4250 lambdaN + 51)).

## Independent complete checks
The external V27 archive includes an index-only JavaScript BigInt generator, a separately written Python Fraction/Decimal verifier reading the original XLSX OOXML directly, a complete 248,832-row reconstructed CSV including exact score numerators/denominators, and a 92-row exact replay ledger. The source private workbook is NOT committed to GitHub.

## Correct proof and production boundaries
The original generator source code was NOT recovered, and this reconstruction is not logically unique based only on rounded observations. It is nevertheless an exact computational explanation and full reproducible recreation of this fixed source dataset. The V25/V26 two-world result assumed only rounded observations and is consistent: the new index-derived global structure is additional information. The original 92 decisions are now reproduced in the derived model, not newly observed physical facts.

There is no proof of a physical 5D manifold, equivalence with the PSC or other symbolic 12^4 atlases, novel fundamental interaction, unrestricted Singmaster theorem, or live canonical action. All 3,249 symbolic global fourfold regions remain OPEN. No R295 source admission, AutoPing activation, CanonState mutation, or production-route side effect.

R761 implementation is pure, bounded, source-conserving research code, with all 248,832 rows checked by the R110 test gate against the independently constructed source-data digest. R760 #1225 also touches R110; reconcile merge order and rerun eight exact-head workflows before promotion. Postmerge and live deployment evidence are separate requirements.
