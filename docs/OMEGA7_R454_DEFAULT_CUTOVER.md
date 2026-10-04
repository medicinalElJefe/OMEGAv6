# R454 · OMEGA7 Default Product Cutover

R454 is the default-startup transition after accepted full-product parity.

It does not delete OMEGAv6.

## Default behavior

A clean session now opens OMEGA7.

Explicit overrides remain available:

- `?omega7=1` forces OMEGA7
- `?omega6=1` forces OMEGAv6

The persistent shell preference is stored as:

`omega.product.shell = OMEGA7 | OMEGA6`

OMEGA7 remains the default whenever no explicit OMEGA6 preference exists.

## Rollback

The existing OMEGA7 **OMEGA6** control remains the explicit rollback path.

Rollback:

- stores `OMEGA6` as the product-shell preference;
- clears the historical `omega7.enabled` opt-in key;
- leaves the accepted canonical address untouched;
- returns to the accepted OMEGAv6 product.

OMEGAv6 exposes a compact **Return to OMEGA7** control.

Re-entry stores `OMEGA7` as the preference and returns to the OMEGA7 shell without rewriting canonical state.

## Canonical continuity

The product-shell preference is presentation/runtime-shell state only.

The canonical address remains:

`omega.v6.address`

Switching product shells must not change it.

No R454 action gains CanonState admission authority. R125 remains the admission authority.

## Browser proof

The governed Cloud Bridge OMEGA7 parity job now additionally proves on desktop and phone:

1. a clean session starts in OMEGA7;
2. a known canonical address is installed;
3. the explicit OMEGA6 rollback is used;
4. the accepted OMEGAv6 product becomes visible;
5. the canonical address is unchanged;
6. the explicit Return to OMEGA7 control is used;
7. OMEGA7 returns;
8. the canonical address is still unchanged;
9. persisted OMEGA6 preference survives reload;
10. `?omega7=1` overrides that preference;
11. `?omega6=1` explicitly selects rollback.

## Retirement boundary

R454 changes the default product shell only.

It does not retire or delete OMEGAv6 surfaces.

Accepted R453 inheritance remains 44/44 parity-proved with rollback available and `legacyRetired:false`.

The next release may only advance after the complete governed matrix and R454 browser proof are green on the exact candidate head.
