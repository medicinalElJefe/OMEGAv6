# R455 · OMEGA7 repaired reversible default cutover

R455 rebuilds the R454 default-product cutover on current main after R454 exposed two independent proof-boundary defects.

## Preserved R454 intent

A clean session opens OMEGA7.

Explicit overrides remain:

- `?omega7=1` → OMEGA7
- `?omega6=1` → OMEGAv6
- `omega.product.shell=OMEGA7|OMEGA6` → persistent shell preference

OMEGAv6 remains available as rollback. No legacy surface is deleted.

The canonical address remains `omega.v6.address`. Shell selection is presentation/runtime state only and cannot mutate CanonState.

## Repair 1 · dependency lock parity

R454 exposed a clean-install defect:

`package.json overrides.undici = 7.29.1`

while `package-lock.json` still pinned `7.29.0`.

R455 synchronizes the lock to 7.29.1 rather than weakening or skipping `npm ci`.

## Repair 2 · legacy browser proof selection

R454 correctly made OMEGA7 the default. Two inherited proofs still assumed that a bare URL necessarily opened the OMEGAv6 shell:

- R118 all-route legacy operational proof
- R318 legacy viewport-ownership proof

Those are OMEGAv6-specific contracts, so R455 makes them explicitly request `?omega6=1`.

The tests are not weakened. They still prove the same OMEGAv6 shell geometry, route access, mobile containment, and legacy rollback surface; they now select the product they actually claim to test.

OMEGA7 default-startup, rollback, and re-entry remain independently browser-proved by the R454 cutover proof.

## Promotion boundary

R455 may merge only if the full governed matrix is green on the exact R455 head.

Required conditions include:

- default OMEGA7 startup proof;
- explicit OMEGA6 rollback and OMEGA7 re-entry;
- canonical address continuity;
- npm clean-install parity;
- legacy R118 and R318 contracts on explicit OMEGA6;
- all inherited release/Hybrid/archive/mobile authorities green;
- 44/44 accepted OMEGA7 parity retained;
- zero legacy retirement.
