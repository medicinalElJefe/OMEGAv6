# R290 · Singmaster / Woven Continuity Proof Atlas

## Purpose

R290 integrates the refined Sharp Singmaster research program into OMEGAv6 **without creating a second routing, proof, or deployment authority**. The workbench is mounted inside the existing **Evidence & Proof** specialist surface and uses the existing R86 proof-operation bus.

This release is a proof-audit and exact-arithmetic research instrument. It **does not claim** that the global bound `N(a) <= 8` has been proved. Current public status is retained as `OPEN` until the remaining global arithmetic obligations are closed by reproducible certificates.

## Correct theorem kernel

For an integer `a > 1`, let `L(a)` count left-half representations and let `M(a)` count the nontrivial left-half representations with `2 <= k <= n/2`.

Because `C(a,1)=a` is automatic,

- `N(a) <= 8`
- `L(a) <= 4`
- `M(a) <= 3`
- no four distinct nontrivial columns share one admissible integer fiber

are the equivalent target forms used by the workbench.

The former real-versus-complex terminal inference is not used. The terminal arithmetic invariant is the complete prime-valuation signature. By Kummer's theorem, `v_p(C(n,k))` is the number of base-`p` carries in `k + (n-k)`. A candidate collision can therefore be pruned by an exact separating-prime certificate, but a global proof still requires exhaustive family coverage.

## OMEGA integration

- `src/proof/singmasterProofAtlasR290.ts`
  - truth boundary and public status
  - theorem equivalences
  - proof gates
  - source authority registry
  - four-tuple counterexample registry
  - exact BigInt binomial arithmetic
  - `p`-adic valuation and Kummer carry routines
  - known collision-fiber regression set
- `src/SingmasterProofWorkbenchR290.tsx`
  - exact audit action
  - 3003 witness panel
  - known collision/family ledger
  - Kummer carry signature display
  - Mode 188 claim-promotion gates
  - four-tuple registry
  - external source authority display
  - SHA-256 proof-audit packet export
- `src/singmasterProofWorkbenchR290.css`
  - responsive visual layer for the existing Evidence & Proof surface
- `src/OmegaSpecialistSuite.tsx`
  - mounts R290 only under the existing `Evidence & Proof` destination
  - preserves Memory and every other specialist route unchanged
- `tests/r290-singmaster-proof-atlas-invariants.mjs`
  - exact regression identities
  - first three large Fibonacci-family collisions by digit length
  - 3003 Kummer carry equality
  - route and truth-boundary invariants
- `tests/r110-runtime-aware-working-set-invariants.mjs`
  - chains R290 into the existing canonical static invariant gate; no parallel CI/deployment workflow is introduced

## Exact regression set

R290 verifies the following known fibers with exact integer arithmetic:

- `120 = C(16,2) = C(10,3)`
- `210 = C(21,2) = C(10,4)`
- `1540 = C(56,2) = C(22,3)`
- `3003 = C(78,2) = C(15,5) = C(14,6)`
- `7140 = C(120,2) = C(36,3)`
- `11628 = C(153,2) = C(19,5)`
- `24310 = C(221,2) = C(17,8)`
- Fibonacci-family collision `C(104,39) = C(103,40)` (29 digits)
- Fibonacci-family collision `C(714,272) = C(713,273)` (205 digits)
- Fibonacci-family collision `C(4895,1869) = C(4894,1870)` (1412 digits)

The existence of the infinite pair-collision family is explicitly retained. R290 therefore does not attempt to prove the sharp bound by eliminating all pair collisions; the correct counterexample object is a **four-nontrivial-column common fiber**.

## Promotion gates

The Sharp Singmaster result can be promoted from `OPEN` only when all of the following are certified:

1. every possible small-`k` / mixed four-column counterexample family is included in an exhaustive partition;
2. every pruned family has a reproducible theorem, congruence, valuation, Kummer, or `p`-adic certificate;
3. every residual arithmetic curve/variety has a complete admissible integral/rational point determination;
4. every transformed solution is proven to map back to the Pascal integer domain;
5. any external formal-proof claim relied upon contains a concrete, reproducible theorem/proof term;
6. the global assembly proves `M(a) <= 3` for every integer `a > 1`.

Until then, OMEGA must display `OPEN` and preserve the missing-source / unresolved-family scars rather than converting them into PASS.

## Preserved authority boundaries

R290 does **not**:

- add a new OMEGA route;
- change the historical 44-route inventory;
- create a new state authority;
- create a new deployment workflow;
- give symbolic Woven/Water/Violet modes external theorem authority;
- treat finite search as a global proof;
- treat complex continuation as an integrality certificate.

The canonical build/release workflow remains the only deployment writer. R290 is additive proof instrumentation inside the existing Evidence & Proof route.
