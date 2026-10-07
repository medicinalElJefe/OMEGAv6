# R509 · Contract Epochs and B-04 Responsive Parity Proof

R509 advances one finite convergence frontier after R508 proved a zero-mutation production state.

## Why a new epoch is necessary

R508 correctly classified uncontracted work as contract debt and stopped autonomous mutation when no acceptance-contracted item was eligible.

B-04 already had a historical decline scar from before it had an explicit acceptance contract. Treating that legacy scar as permanently binding would make a newly defined proof obligation impossible to evaluate. Ignoring scars entirely would reopen retry loops.

R509 therefore binds decline holds to the acceptance-contract revision that produced them.

## Contract-epoch law

For one convergence item:

- a decline with the same acceptance-contract revision holds another attempt;
- a decline from an older explicit revision is historical evidence but does not veto a newer explicit revision;
- a legacy decline with no contract revision remains active by default;
- a new contract may explicitly set `supersedesLegacyDeclines:true` to create exactly one new bounded evidence epoch;
- every new decline emitted during that epoch records the current acceptance-contract revision.

History is preserved. Only its scheduling authority is scoped.

## B-04

B-04 is:

> Mobile + desktop parity for every route, submenu, disclosure, overlay and visual layer.

R509 gives B-04 acceptance revision `R509` and explicitly supersedes its pre-contract legacy decline.

Before proposing any UI mutation, OMEGA must evaluate exact current source across four authorities:

1. `src/OmegaWorkstationFullV2.tsx`
   - persisted AUTO / DESKTOP / MOBILE UI mode;
   - shared `ResponsiveRuntimeShell` binding.

2. `src/InstrumentOSShellR62.tsx`
   - media-query resolution;
   - one actual `document.documentElement.dataset.omegaFrame` authority.

3. `src/omegaSideNavigatorR88.css`
   - desktop navigation reserves rail + panel width instead of covering the application;
   - mobile media authority remains explicit.

4. `src/omegaNavigationShellR411.css`
   - mobile usable-viewport ownership;
   - full-width bounded navigator above the command dock;
   - bounded vertical scroll owner and scroll padding.

The current source contains all required tokens. Therefore the preferred successor is a proof-only state candidate, not a product-source mutation.

## Independent closure

Exact-source token satisfaction is necessary but not sufficient. Final B-04 advancement still requires the governed exact-head workflow stack, especially R241 browser proof, to exercise canonical routes, submenus, disclosures, overlays, controls and visual surfaces.

No source-only proof may claim:
- rendered parity without browser proof;
- external/device state;
- CanonState admission;
- production deployment.

R125 remains sole CanonState admission authority. `ci.yml` remains sole canonical production writer. R507 finite convergence and R508 contract-readiness remain active.
