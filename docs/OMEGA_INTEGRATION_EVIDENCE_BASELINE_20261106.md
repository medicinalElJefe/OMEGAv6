# OMEGA integration evidence baseline (2026-11-06)

This is an **initial, targeted dependency audit with complete 44-route native registry coverage**, not a completed full-tree implementation audit and **not** proof of R790 production acceptance. It records concrete source/test leads and explicitly preserves gaps. Source search, inspection of OMEGA7 contracts, the canonical mode contract, package scripts, Hybrid host proof contract and Seven-Star recovery gate informed the entries in `audit/integration-evidence-baseline.v1.json`.

## Engineering decision
Build one progressively integrated OMEGA7 system from demonstrably executable components; keep research/operator models as typed, provenance-bearing experiments rather than silently elevating them to established physical law. No replacement of CanonState admission, no donor parity by analogy, no unauthenticated host command, and no production bypass.

## Evidence semantics
- **SOURCE PRESENT:** file/route or referenced contract; not evidence that it executes successfully.
- **TEST REGISTERED:** test file or package script present; this audit has not executed it.
- **CI PASS:** only exact-head successful checks, independently obtained.
- **PRODUCTION PASS:** exact main SHA + actual Worker promotion + live desktop/mobile behavior + R223 closure + rollback eligibility.
- **DEVICE PASS:** fresh authenticated non-revoked host/device attestation, actual operation and return proof; never inferred from cloud route health.
- **HISTORICAL PARITY:** original donor byte identity and golden output comparison; never inferred from having an analogous UI.

## R791 route census and executable audit gate
- `audit/omega7-route-evidence.v1.json` maps all **44** declared OMEGA7 native routes to the **8** declared family owners and their actual lazy-loaded workspace modules. This is a complete census of the native route **registry**, not complete dependency analysis, proof of feature behavior or donor parity.
- `scripts/validate_integration_evidence_baseline.mjs` checks unique routes and family ownership against source registries, validates workspace lazy-import paths and audited source/test path existence, and refuses unearned route/production claims.
- `npm run test:integration-audit` is now the first step of `npm run check:static`; future registered routes or changed module paths must update the evidence baseline or fail CI. These tests are structural, not live production proof.

## Confirmed architectural anchor points
- `src7/Omega7Root.tsx` connects route selection to the OMEGA7 state provider and native workspace registry. `src7/familyParityR452.ts` declares **8** current family contracts and checks inherited route coverage, not execution of each route.
- `canon/OMEGA_ALL_MODES_EXECUTION_CONTRACT_R674.json` declares **179** source catalog members but only **20** implemented contracts. Its Relational Skin Calculus classification is **PARTIAL_EXECUTION** and Full Sphere is **PRESERVED_ROUTE_NEEDS_OWN_PROOF**. It explicitly forbids treating 20,736 finite addresses as physical dimensions.
- `src/SomaAudioEngine.tsx` and `src/templeSomaPresetR784.js` are Sound Temple/SOMA leads; R785 merged but complete live playback acceptance is a separate claim.
- `src/EarthNowInstrument.tsx`, `src/EarthWeatherR375.tsx`, and `src7/workspaces/EarthWorkspaceR438.tsx` are Earth leads. R789's release record identifies actual NASA observed source and derived optical-proxy SAR; neither should be mislabeled native measured SAR.
- `public/omega-hybrid-agent.py` and `R207_NATIVE_HOST_PROOF_CONTRACT.md` separate cloud-side command authority from native host proof. No authenticated PC/GPU execution is established here.
- `docs/R602_SEVEN_STAR_HISTORICAL_RECOVERY.md` expressly rejects treating successor projections as original seven-star historical parity.
- `.github/workflows/ci.yml` requires release ownership, deployment/rollback handling, exact-SHA R223 post-deploy closure and governed continuation.

## Release distinction
The R790 source merge is `287a6238a820a2b3b85de2f7c9f592e2ac9da3db`. The R789 release record states success for production run `42144657822` and Worker `5f29b1b6-4704-4b2e-8306-67ebab8ebcaf`. **R790's exact-SHA production acceptance remains unconfirmed in this audit**; the connector's pull-request-run query is not an exhaustive push-workflow lookup. Verify Actions and Worker receipts before promotion.

## Next integration gates (not yet completed)
1. Expand the 44-route/8-family registry census to route-specific executor→state→tests dependency edges, including dynamic and indirect imports; flag missing or circular paths.
2. Validate `npm run test:integration-audit` through mandatory exact-head CI. The validator is wired into `check:static` but does not alone claim actual CI success.
3. Run complete source tests and browser journey tests across family transitions, shared Canon address, recovery and export, including failures.
4. Verify R790's exact SHA in push Actions and Cloudflare Worker, with post-deploy R223 and rollback.
5. Admit capabilities to the user-facing live availability surface only after corresponding evidence receipts. Keep research and missing-proof states visible.
6. Separately obtain native Windows build/test/package, one-launcher/GPU and live Hybrid proof on the actual host.
7. Continue source-level historical donor comparison and full functional/visual fidelity work without overwriting originals.

**Scope boundary:** This branch only adds an audit ledger and read-only validator. It neither claims complete system assembly nor mutates production.
