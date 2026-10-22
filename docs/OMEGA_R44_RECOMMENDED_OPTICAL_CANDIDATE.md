# OMEGA R44 — Recommended Optical Design Candidate

## Status

`RECOMMENDED_NUMERICAL_CANDIDATE`

R44 does not declare a fabricated device, measured optical performance, or a new physical law. It records the strongest **numerically validated compromise** found by the R43 RCWA Pareto search under a 10° maximum worst-wavelength RMS PB phase-error margin.

## Recommended geometry

| Parameter | Value |
| --- | ---: |
| Pitch | 330 nm |
| Width | 105 nm |
| Length | 290 nm |
| Height | 575 nm |
| Orientation states | 12 |
| Orientation law | θ_k = 15° k, k=0…11 |

Material stack used by the numerical model:

- incident: air
- feature: `tio2_design`
- background: air
- substrate: `sio2_fused`

The material names above resolve through the OMEGA R35 dispersion library. Those design models are not a replacement for process-specific measured dispersion.

## Why this candidate

The original 330/90/260/550 nm primitive retains the strongest phase-error headroom, but its red conversion is materially lower. The unconstrained R41 winner improves conversion further but spends too much phase margin for a robust default.

R43 mapped the tradeoff rather than hiding it. At a 10° margin, the 330/105/290/575 nm candidate provides the strongest validated objective in the tested neighborhood while remaining below that margin at every tested wavelength.

Aggregate result:

- minimum converted-helicity fraction: **0.453743**
- mean converted-helicity fraction: **0.827495**
- red mean conversion: **0.563902**
- worst tested RMS PB phase error: **8.961217°**
- R43 objective: **0.587900**

## Wavelength evidence

### 470 nm

- PB verified: yes
- qualified states: 12/12 LR and 12/12 RL
- RMS phase error: 8.728983°
- maximum absolute phase error: 11.597843°
- conversion range: 0.920457–0.985916
- mean conversion: 0.965116

### 532 nm

- PB verified: yes
- qualified states: 12/12 LR and 12/12 RL
- RMS phase error: 6.299805°
- maximum absolute phase error: 8.976470°
- conversion range: 0.916295–0.998159
- mean conversion: 0.953467

### 650 nm

- PB verified: yes
- qualified states: 12/12 LR and 12/12 RL
- RMS phase error: 8.961217°
- maximum absolute phase error: 12.248140°
- conversion range: 0.453743–0.732409
- mean conversion: 0.563902

## Evidence lineage

- R43 source commit: `181b2b71753fe615f03667b0b814fa70fc5137bc`
- R41–R43 main merge: `02015a5f51cb31dbf748b41d96bcda36ac3d4f1b`
- R43 proof SHA-256: `c49c18d9f0b79f1ad7a05daafb3a303adf81acedff360dcae58cf73092f6bfea`
- R43 workflow artifact SHA-256: `0249c3e74fb91be894c4bad3cd97fe0bdc4d2198a63b0555817bc6f711a36837`

The machine-readable companion is `public/omega-optical-design-candidate.json`.

## Canonical interpretation

The 12 orientations are a validated **addressable optical primitive set in this numerical model**, not twelve new physical dimensions. The PB relationship is tested as an optical transform:

- R→L target phase: `−2θ`
- L→R target phase: `+2θ`

The result supports the OMEGA hierarchy as an address/composition grammar only after its lower-level primitives remain independently validated.

## Next gates

R44 is intentionally not the end of validation. Promotion beyond `RECOMMENDED_NUMERICAL_CANDIDATE` requires:

1. selected-case independent full-wave cross-check with a non-RCWA backend;
2. process-specific material dispersion / ellipsometry data;
3. fabrication-tolerance sensitivity analysis;
4. physical measurement;
5. measurement residuals returned to the scar/history ledger before any higher atlas composition is admitted as physically grounded.

The next strongest engineering move is therefore **independent solver cross-validation**, not another geometry search.
