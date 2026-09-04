# OMEGA R44 — Independent Meep FDTD Cross-Check

R44 introduces a second full-wave backend specifically to test whether the RCWA-selected optical primitive survives an independent numerical method.

## Backend

- Meep / PyMeep finite-difference time-domain (FDTD).
- 3D periodic unit cell in x/y with PML along z.
- real time stepping with a Gaussian source and complex DFT field accumulation.
- no grcwa call and no scalar/RCWA fallback.

## First cross-check

At 532 nm R44 compares:

1. baseline: 330 / 90 / 260 / 550 nm (pitch / width / length / height),
2. R43 10° engineering candidate: 330 / 105 / 290 / 575 nm.

Each geometry is evaluated at 0°, 45°, and 90° using circular input. The transmitted zero-order complex Ex/Ey field is obtained by spatially averaging the DFT fields over one complete periodic transmission plane. The field is projected into circular basis and the converted-helicity relative phase is compared with both ±2θ conventions. The lower-error sign is reported because propagation-direction and helicity naming conventions can reverse the sign without changing the geometric-phase mechanism.

## Admission discipline

The initial R44 CI establishes backend execution and reports agreement or disagreement; it does not force the FDTD result to agree with RCWA. The initial 60 px/μm run is a bounded independent sanity check, not an FDTD convergence claim.

If the orientation phase relationship is consistent, the next gate is an FDTD resolution study followed by 470/532/650 nm selected-state comparison. Only after convergence should FDTD agreement be used as evidence toward a fabrication candidate.

## Truth boundary

Meep agreement would strengthen numerical confidence but would still not constitute process-specific TiO2 calibration, fabrication-tolerance validation, or measurement. The current TiO2 dispersion remains a design table until replaced or calibrated with process-specific optical constants.
