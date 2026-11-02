# R758 / V23 — Canon conditional precision-interval authority gate

## Proven source-derived formula, conditional input assumption
Original corrected 248,832-row Canon workbook Formula_Map defines
S=(CΩ × Φ)/(q+Λ+0.001); STAY S>=0.42, TURN 0.22<=S<0.42, ESCALATE S<0.22.

This research code does NOT know how the original metrics were rounded. Under the explicit **CONDITIONAL nearest-four-decimal** assumption, each component x is enclosed by x±0.00005; exact integer/rational arithmetic produces bounds on S and returns STAY/TURN/ESCALATE only if the *entire* interval is on one side of both thresholds. Otherwise return PRECISION_HOLD. The assumption is not itself externally validated, so **no gate result authorizes a live decision**.

The independent V23 offline audit of 248,832 original Canon states found 248,664 stable conditional decisions, 168 precision HOLDS, zero stable contradictions with stored source decisions. Of the V22 47 rounded-S boundary differences, 45 remain HOLDS; two, D02-S07-R08-M06-P06 and D04-S04-R02-M05-P12, are conditionally ESCALATE, matching stored labels although S displays exactly 0.2200. A separately implemented integer cross-multiplication verifier replayed the entire workbook and both exact address sets; neither procedure changed the source workbook.

## Executable scope
- src/proof/canonPrecisionIntervalR758.js: exact four-decimal string -> BigInt rational lower/upper, strict conditional governance, refusal.
- tests/r758-canon-precision-interval-invariants.mjs: resolved/uncertain examples, invalid inputs, no live source-authority and no theorem promotion.
- tests/r110-runtime-aware-working-set-invariants.mjs imports R758 alongside **all seven** conserved R752–R757 test suites.
- src/TypedProvenanceWorkbenchR757.tsx: visualizes a separate *conditional* gate while retaining the original modeled decision and source/recovery controls.
- tests/dewey-temporal-workbench-v9-browser-e2e.mjs: desktop/mobile interaction test for PRECISION_HOLD, conditional ESCALATE and unchanged live-authority boundary.

## Source and release boundaries
The complete external V23 ZIP retains V22 and V1–V21, 168-row hold ledger, all 47 pre-existing boundary cases, independently resolved two, primary generator and wholly different integer verifier. The full private XLSX is not published in GitHub. Original workbook SHA-256 e1ccb57cdfbc78955dd6e86be110cdb91cb15a0cc78a869b74dca7e4ffa55af3; exact original generator rounding rule and original unrounded values are not attached.

This PR is **stacked on draft R757 #1221**, which is itself based on merged R755 #1219. Do NOT merge directly against old main, supersede the existing test imports, or treat R757's older workflows as applicable to this changed head. If R757 passes and merges, re-target/reconcile this PR on the *new* main and require all eight exact-head workflow families plus specific browser execution proof. Every production and R295 proof-admission gate remains separately governed.

PSC Primary/Unified modeled decisions (4,390 disagreements) remain separate; the fourfold Singmaster conjecture and its 3,249 open symbolic Atlas regions remain OPEN. No physical-dimension proof, AutoPing scheduling, source promotion, CanonState mutation or autonomous decision is asserted.

## Mainline reconciliation (after R757 governed merge)
R757 #1221 merged at 5ff1045f9d7e2a49bf0bf2f14a86d78bd8677b8d after eight exact-head workflow families passed. This branch was reconstructed directly on that merged mainline. Before preserving the three shared file revisions, src/TypedProvenanceWorkbenchR757.tsx, tests/dewey-temporal-workbench-v9-browser-e2e.mjs and tests/r110-runtime-aware-working-set-invariants.mjs were compared byte-for-byte against the premerge R757 branch and found identical. The older stacked R758 PR #1222 is superseded and MUST NOT be merged; only the current-main candidate can be reviewed after fresh exact-head CI. The original workbook is not committed or publicly source-ingested.
