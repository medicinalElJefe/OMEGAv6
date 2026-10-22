# R372 proof review and experience recovery

Review date: 2026-09-27. This is a source/evidence inventory and acceptance contract, not a new runtime or promotion authority.

## Exact source and promotion findings

- PR #788 was reviewed at `42c3e2c06ad11403a0c08495955698455fbc7576`, targeting main `d14b35f14da12ce0ff847b3cdaa31b37244311e2`. No submitted reviews or inline review threads were returned. R241 was still running when the repair was prepared; green results on the old head cannot attest this successor.
- PR #776 is already merged. Its final candidate is `dfc5b051c0ae759be4a3e3e25a9d99048acd8442`; merge is `14da3f481b11eb43527f49fe6305da3d7371a081` at 2026-09-27 14:17:41 UTC. No submitted reviews or inline threads were returned.
- The recorded R210 candidate-fence failure for #776 occurred at 14:20:30 UTC, after merge, because that check requires an **open** PR. Preserve that record; do not relabel it as green or rerun it against a closed PR.
- Main `d14b35f14da12ce0ff847b3cdaa31b37244311e2` is a descendant of the #776 merge (51 commits ahead, zero behind at review). R366 reasserts the accumulated PCWD and route repairs.
- Successful canonical CI run `36334556736` deployed that main SHA with staged Worker version `2e7945db-a5e5-4ca3-9941-abdc11e93d48` and completed R200, R356.5/R370 Earth/SAR and R237/R238 live closure. This is a historical deployment receipt, not a claim that another head is already live.
- Branch metadata reported protection disabled and no required status-check contexts; the repository ruleset list was empty. Continue to enforce the existing workflow/proof promotion path anyway. GitHub mergeability alone is not completion.

## What the original R372 browser test did and did not prove

| Area | Original R372 test | Inherited / remaining requirement |
| --- | --- | --- |
| Earth place | Tucson lookup and click, desktop only | Bind returned geocoder coordinates to returned Earth target and displayed evidence hash on both viewports |
| Address | No street-address query | Exercise a real public street address on desktop and mobile |
| Earth device | Emulated location click, mobile only; checked any bound evidence | Check the selected coordinates and the response for those coordinates on both viewports; this does not prove a user's physical GPS |
| Satellite | Checked loaded image dimensions once | Wait for actual NOAA image completion; keep source imagery distinct from derived fields |
| Motion | Two pause/resume clicks; refresh button presence | Verify toggled states and a returned global refresh |
| Ground | Click only | Await the requested target response and matching displayed hash |
| SAR | Place/device controls present; 12 cards counted | R370 actuated targeting, all 12 lenses and GRD/SLC; successor R372 also binds selected lens identity and target outcomes |
| Overflow | Measured only after ending in SAR | Check every Earth view and every selected SAR lens at desktop/mobile sizes |
| Page errors | Collected throughout | Remains blocking throughout |
| Source identity | Accepted source SHA **or** promoted SHA | Require both source and promoted SHA plus merge-parent authority, before and after the run |

R202 calls R284/R356.5, then R370, then R372 after promotion. R372 is not automatically executed by `npm run check`. The additional R241 candidate regression uses clearly synthetic transport responses to prove stale-response and mismatched-target rejection. It does not produce a live-source receipt.

The targeting repair clears the prior evidence while a new query is pending, accepts only the latest request, checks the returned target, and invalidates outstanding requests on unmount. It neither mutates CanonState nor replaces any evidence source.

Promotion remains: successor exact-head checks and review state → current-base merge → canonical `ci.yml` → staged release proof → exact promoted live proof → deployment receipt. Do not add a competing deploy path, bypass a red check, or reinterpret a synthetic regression as provider availability.

## PCWD boundaries retained

The R359 ledger explicitly contains **7 competent-reference matches, 1 tradeoff, 1 preserved legacy failure, and 1 fix**. Reference cases pass 10/10; PCWD passes 9/10 because the legacy Kalman process-noise failure remains recorded. A MATCH is parity, not numerical superiority or novelty.

R360 preserves domain-semantic separation. R361/R362 retain semantic non-transfer, authority non-transfer and unmodeled loss, monotone loss composition, and source-domain end-to-end error measurement without adding unlike units. R363 keeps the semantic scar while explicitly leaving `physicalHolonomyClaimed:false`. No mathematical layer was changed in this repair.

## Recovered experience map

The existing 44-route / 24-family inventory is not evidence that every historical experience has been restored. Recovery must map features and user actions, not merely count routes.

| Experience | Evidence actually found | Current gap | Smallest useful restoration contract |
| --- | --- | --- | --- |
| Horoscope | Recovered `horoscopeEngine.js`: month/day sun-sign mapping plus a reflection from an earlier `chatEngine.getVector()` input. The source explicitly disclaims fate/prediction. | No named horoscope component or route was found in current source. The old vector is not a biometric measurement and must not be silently replaced by Canon metrics. | Add a discoverable, browser-local reflection tool using explicit user inputs, validated calendar dates and retained source attribution. Recover the input adapter before claiming equivalence; separately verify any astronomical ephemeris added later. Never claim biometric authentication from an ordinary browser form. |
| Sound Healing Temple / Temple Garden | Historical design describes rooms Shadow, Energy, Ocean, Trees, Cycles, Water Power, Metal Power and Reassurance; 188 Hz anchor; D1–D12/R1–R12; 12-step journey; breath timer; later JSON/preset intake, silence gates, WAV export and local history. The original final package was not recovered in this review. | `SomaAudioEngine.tsx` already provides local Web Audio, 12 oscillator/gain/pan lanes, compressor/master, packet sync and explicit Start/Stop. It appears only after selecting S17 in `SystemAtlasControl.tsx`. It is not the complete Temple Garden; its current carrier control is 36–144 Hz. | First expose the existing S17 instrument clearly; then recover/adapt the Temple room/preset/journey layer without replacing S17. Retain explicit start, bounded gain, Stop and unmount cleanup. Prove sequencing, pause/resume, exports and mobile layout. Preserve listening/sonification semantics without claiming treatment effects. |
| Dodecahedron shell / space | `CalculusTraversal.tsx` contains dodecahedral geometry and seven-shell construction. `MatterTraversal.tsx` and `motionDomainRuntime.ts` retain eight scale lenses, including planetary, stellar and galactic. `EarthNowInstrument.tsx` offers solar geometry/near-space. R288 identifies Full Sphere visual-grammar recovery as partial. | Controls are dispersed; representational scale labels and solar context do not constitute a measured astronomical reconstruction. Historical Full Sphere camera/lens/fold/temporal grammar is not fully mapped into a single experience. | Build a coherent space workspace over these existing engines: shared observer, scale, shell, time and provenance controls. Preserve camera and selected source across lens changes. Bind any actual sky/orbit layer to its own dated reference data; keep it distinct from the shell representation. |
| Hybrid Link | Existing planning, pairing, command, durable execution and verification authorities are present. The inspected production deployment reports `DEVICE_PROOF_REQUIRED`, zero public current devices, `nativeExecutionClaimed:false`. | An established bridge architecture does not establish that the user's PC is currently connected or a job has returned verified output. | Keep one visible task → device → run → returned artifact → R141 verification trail. Integrate compute-heavy audio/space work only through existing authorized job types and returned receipts. |

## Experience integration rule

Use the existing canonical navigator and source packet. Make each capability discoverable by the user's name for it, with a clear primary action and a visible result. Persist only the relevant local view/session controls. Keep source observation, model computation, local creative output and host execution distinguishable through concise provenance details.

Do not satisfy recovery by adding placeholder routes, marking historical prototypes complete, changing R125 admission authority, relabeling optical proxy fields as native SAR measurements, or assuming a heartbeat proves a completed computation.

The next feature increment after Earth closure should recover the S17 entry point and Temple controls, then the horoscope input adapter, then the unified space observer controls. Each increment needs a real end-to-end desktop/mobile action proof and an exact promotion receipt.
