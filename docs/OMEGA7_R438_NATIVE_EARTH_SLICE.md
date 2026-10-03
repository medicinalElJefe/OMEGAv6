# R438 · OMEGA7 Native Earth Vertical Slice

R438 is the first capability family that remains inside the OMEGA7 shell instead of dropping back to the OMEGAv6 presentation layer.

## Why Earth first

Earth/weather exercises the full product stack at once:

- live external provider data;
- source-vs-derived truth boundaries;
- location and evidence state;
- weather;
- satellite;
- motion;
- SAR;
- ground evidence;
- visualization;
- full-screen transitions;
- mobile layout;
- refresh/failure states;
- R436 domain-resolution lineage.

If OMEGA7 cannot host Earth cleanly, it is not ready to host the rest of OMEGA.

## Zero-loss inheritance

The native OMEGA7 Earth workspace mounts the accepted `EarthObservatoryR8` engine directly.

It does not clone or fork the Earth engine.

The current canonical address continues to come from `omega.v6.address`, so the native OMEGA7 presentation and the accepted OMEGAv6 runtime remain bound to the same address lineage during migration.

The original `Earth Now` OMEGAv6 route remains available as rollback.

## Native route contract

R438 introduces a native-capability registry. Current native set:

```
Earth Now
```

Every other OMEGAv6 capability remains `BRIDGED`.

Opening a native route keeps the user in the OMEGA7 shell. Opening a bridged route continues to invoke the accepted OMEGAv6 compatibility route.

This lets migration happen family by family without pretending incomplete work is finished.

## Scroll ownership

R438 makes the OMEGA7 shell a fixed viewport and the OMEGA7 main workspace the single page-scroll owner.

This is deliberate. Legacy nested inspectors may still own bounded internal scrolling, but global page scrolling belongs to one element.

Mobile follows the same rule: the top bar and six-domain bottom navigation remain outside the scrolling workspace.

## Inheritance ledger

Every current OMEGAv6 capability is represented in the OMEGA7 inheritance ledger.

Migration states are:

`BRIDGED -> ADAPTED -> PARITY_PROVED -> NATIVE -> LEGACY_RETIRED`

R438 marks Earth as `ADAPTED`, not `NATIVE` or `LEGACY_RETIRED`, because full parity, mobile, failure, and performance proof still have to complete.

No row may retire until:

- functional parity passes;
- desktop passes;
- mobile passes;
- failure/recovery passes;
- performance passes;
- rollback remains available.

## R436 human presentation

R438 adds a presentation adapter over the canonical R436 result packet.

It translates:

- `ACTIVE / RESOLVED` → supported;
- `BOUNDED` → multiple possibilities remain;
- `OBSERVE_ONLY` → more evidence needed;
- rejected branches → path rejected, reason retained;
- `INCONSISTENT` → current data/model do not reconcile.

The complete technical packet remains available: authority, proof class, branch status, ledger hash, score, and scars.

Human presentation has `canonicalMutation:false`.

## Frozen baseline

`src7/omega7.lock.json` records the R437 baseline used by the first native slice.

This lock is an inheritance checkpoint, not a physical or architectural law.

The 44-route count prevents silent loss during migration. It does not limit future OMEGA7 capabilities.
