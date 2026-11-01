# R751 · Dewey / OMEGA V12 — Fixed-Column, Fixed-Row-Gap Exclusion

**Research candidate only.** Neither the Sharp Singmaster conjecture nor OMEGA's historical capability-conservation program is closed by this change.

## Global reduction under bounded *parameters*, not bounded rows

Let M(a) count distinct nontrivial left-half binomial representations, and suppose M(a)>=4 with columns k1<k2<k3<k4 and decreasing row indices n1>n2>n3>n4. The independently reproduced V12 offline study shows:

  M(a)>=4  ==>  k1>=101 OR n1-n2>=101.

The result quantifies over all row indices, including n>1000. Its restricted parameters are 2<=k1<=100 and 1<=n1-n2<=100.

The proof is based on the elementary and globally valid threshold:

  F(k,d,m) = C(m,k+1)/C(m+d,k)
           = (m-k)/(k+1) * product(j=0..k-1) [(m-j)/(m+d-j)].

For k>=2,d>=1, F strictly increases with m. Once F>1, all higher left-half columns l>=k+1 are impossible. The least crossing T(k,d) is finite and has an explicit rigorous upper bound. The complete finite search over m<T(k,d) for all 9,900 parameter pairs found eight pair equalities (six distinct values), and each such value has at most three total nontrivial left-half representations by an exact complete-value fiber computation.

The offline generator and independent Python verifier agree on all 9,900 thresholds, all eight equalities, 717,966 examined higher-column candidates and the complete 20,376-region coarsened chart.

## What the chart identifies

- Original V8 Atlas: 20,736 symbolic fourfold regions.
- V11 coarsening: 20,376 regions, preserving every original source region via 360 adjacent interval merges.
- V11 globally excluded: 14,013 chart regions.
- V12 globally excluded: 15,570 chart regions.
- Newly excluded by V12: 1,557 chart regions.
- Globally unresolved: 4,806 chart regions.
- 76.4% refers to a count of symbolic chart labels, **not** a probability, natural density, fraction of physical dimensions or proof of the universal theorem.

For this research branch, executable material is the fixed-pair BigInt kernel and exact selected-case regression. The full **offline** V12 certificate/Atlas archive is distributed as a separate research artifact and is NOT claimed present as production-imported source bytes in GitHub. Its identity for independent review:

- 9,900 family CSV SHA-256: 906c52177f24128ec98d5b02bfd54f28313382f790327d5be14e21b6c01cc12b
- 20,376-cell Atlas CSV SHA-256: bac4aef1161d7a257ace9a2226d70d3859d2a7e7b7b2e2b616e2f43249ac9473
- Independent audit report SHA-256: b7d3759ffdb46cd4f1857b247642e22ab9de9b66f4df876f4a0cfadaa6408e76

## Repo integration and authority

- Exact implementation: src/proof/singmasterFixedGapR751.js.
- Regressions: tests/r751-singmaster-fixed-gap-reduction-invariants.mjs.
- Existing canonical static gate imports the focused R751 regression. No separate deployment writer, source-authority change, or synthetic claim-proofs.
- V9 time/rotation observability remains a logically independent model, not an arithmetic proof of binomial equality.
- R292–R295 retain their existing proof-carry and source-admission authorities.
- No live Auto-Ping scheduling, OMEGA7 route change, native-device claim, merge, or production proof is asserted.

The offline mathematical theorem's numerical extension is independently reproducible but not claimed to be new mathematical priority. Global families outside the stated parameter ranges and final G09/G10/G13 remain OPEN.

## Public mathematical background

- https://doi.org/10.1093/qmath/haac006
- https://www.fq.math.ca/Scanned/13-4/singmaster.pdf
