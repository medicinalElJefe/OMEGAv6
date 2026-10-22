# R347 Human Visual Traversal Cockpit

## Purpose

R347 reorganizes existing OMEGA visual, temporal, Earth, proof and traversal data into one human-readable cockpit. It does not create new physical measurements, CanonState authority, execution authority, SAR authority, or deployment authority.

The primary design rule is **one visual variable = one stable meaning**.

## Visual grammar

| Visual channel | Source | Executed mapping | Human meaning | Hard boundary |
|---|---|---|---|---|
| Position | existing 20,736 source geometry | mandala20736Runtime x/y/z | relational structure | representational unless an external coordinate system is bound |
| Opacity / luminance | full-field calibrated evidence | alpha base = 0.05 + 0.70 E_c | evidentiary strength | opacity cannot upgrade truth class |
| Route line width | full-field calibrated continuity | w = 0.60 + 2.80 CΩ_c | continuity of the active path | not physical thickness |
| Geometric deformation | calibrated contradiction and burden | delta = 0.55 q_c + 0.45 Lambda_c | constraint / pressure | not measured force |
| Persistence | calibrated scar | p = 0.15 + 0.85 Sigma_c | retained history | not automatically external history |
| Motion | declared route derivative or source time delta | frame-declared only | change | model route motion is not physical velocity |
| Hue / line style | truth class / selection | categorical | observed vs computed vs forecast vs held | hue is not a continuous magnitude scale |
| Uncertainty | missingness + 1-evidence | explicit held / low-opacity state | what is not known | missing stays missing |

All continuous visual channels share the existing 20,736-state p02/p98 calibration.

## Human reading order

1. **Truth rail** — OBSERVED / COMPUTED / FORECAST / HELD.
2. **Central field** — structure and active route.
3. **Selected-state inspector** — exact channel values and equations.
4. **Time rails** — observed UTC and model-route time remain separate.
5. **Live correlation context** — read-only external values with unit/source/time admission.
6. **Why it looks this way** — direct mapping from data channel to visual channel.
7. **Visual registry** — full equations and truth boundaries.

The first frame must remain useful without opening secondary panels.

## Traversal semantics

- Drag changes observer yaw/pitch only.
- Wheel changes semantic zoom only.
- Click changes selected canonical address.
- Route playback advances through the existing autoPing route.
- Lens change changes declared projection weighting only.
- Reference-scale change changes formal display context only.
- None of these interactions changes source evidence or physical authority.

Semantic zoom:
- **CONTEXT** — global structure survives.
- **CORRIDOR** — active route and same-domain context dominate.
- **DETAIL** — selected state, route and local domain dominate.

## Time classes

### Observation time
Comes only from returned external source timestamps or returned source snapshot verification.

### Model-route time
"t+N" is ordered OMEGA route progression. It is not seconds, UTC, physical duration, or a prediction date.

### Forecast
Conditional route alternatives are visually distinct from observed history.

No time class may silently inherit the authority of another.

## Space classes

### Atlas/model space
The 20,736 address field is a computational relational space.

### Earth query space
Address -> WGS84 is a deterministic query mapping for correlating the current OMEGA state with returned Earth evidence. It does not assert that an atlas address physically occupies that Earth coordinate.

### Scale reference
Nuclear through galactic labels retain the existing FORMAL_REFERENCE_ONLY authority from motionDomainRuntime.ts.

## Physical scalar admission

A scalar may enter the OBSERVED layer only when all are present:

1. finite value;
2. explicit unit;
3. returned source identity;
4. source-specific observation or snapshot timestamp.

If any is absent, the scalar is HELD even if a numeric value exists.

This is the admission path for future physical quantities such as energy, force, power, physical velocity, radiation flux, temperature or field strength. Naming a quantity never creates a measurement.

## Correlation boundary

The cockpit may colocate and synchronize visual channels for inspection. Spatial or temporal proximity does not establish causation. Statistical or physical causal claims require a separate declared model and proof/evidence chain.

## Real-time inputs currently used

- /api/earth/evidence — returned weather, seismic and space-weather evidence;
- /api/status — current OMEGA runtime truth;
- /api/hybrid/status — returned Hybrid device/runtime state;
- embedded 20,736 corpus and visual calibration — computed canonical model field.

All are read-only from R347. There are no POST requests in the R347 cockpit.

## Performance contract

- Canvas renderer remains requestAnimationFrame driven.
- Device pixel ratio capped at 2.
- Full 20,736 field on capable desktop.
- Sampling stride 2 on medium surfaces and 4 on mobile / low-core devices.
- Hover uses refs so pointer movement does not recreate the field effect.
- Semantic zoom suppresses irrelevant background information rather than adding more panels.
- prefers-reduced-motion disables automatic field rotation.
- Responsive layout collapses the inspector and time rails without hiding truth class.

## Preservation contract

R347 replaces only the existing Cockpit surface.

Unchanged authorities/specialists include:
- Workspace;
- Matter Traversal;
- Calculus Traversal;
- Earth Now and SAR;
- Evidence & Proof;
- R342 establishment;
- R344 host-closure receipt validation;
- R345 governed Hybrid SAR closure;
- R346 dependency-closed SAR frontier;
- R125 CanonState admission;
- existing Hybrid command/runtime authority;
- canonical ci.yml deployment authority.

## Release condition

R347 is promotable only after:
- test:r347 passes;
- full check:static passes;
- production build passes;
- inherited browser/navigation/safe-control proofs remain green;
- no authority-preservation invariant regresses.


> Preserved from PR #747 as a donor contract. Canonical R347 traversal authority remains the human-correlated field; R348 may consume these calibration/live-context functions without creating a second state authority.


## Collision resolution

PR #747 is closed as a preserved donor after its strongest calibrated/live-context contracts were copied into the canonical R347/R348 path. This removes the duplicate R347 release identity without deleting the donor branch or its historical implementation.
