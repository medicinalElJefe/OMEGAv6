# OMEGA R38 — Circular Basis and PB Phase Gate

R38 is the next truth layer after R37 complex-field basis verification. It does not broaden the atlas. It asks one narrow question: does the converted-helicity complex transmission phase of the canonical anisotropic geometry follow the Pancharatnam-Berry ±2θ law across the 12 orientation states?

## Upstream prerequisites

R38 depends on the R37 Cartesian complex transmission convention:

- columns = x/y input polarization,
- rows = transmitted zero-order Ex/Ey,
- basis admission requires the 0°↔90° rotational swap proof.

If that basis proof fails, R38 cannot admit a PB phase result.

## Circular convention

R38 declares an explicit convention rather than hiding handedness in code:

- exp(-iωt)
- R = (x - i y)/sqrt(2)
- L = (x + i y)/sqrt(2)

For the resulting circular matrix, rows are output [R,L] and columns are input [R,L]. Under this convention an ideal rotated half-wave anisotropy gives:

- R→L converted component: relative phase = -2θ
- L→R converted component: relative phase = +2θ

All phase comparisons are relative to θ=0 so common dynamic phase is removed.

## Qualification before phase fitting

A phase angle is numerically meaningless when the converted component is nearly zero. R38 therefore requires a minimum converted-power fraction before a state is included in PB fitting. Low-conversion states are retained in the proof packet but marked unqualified.

The default gate requires:

- R37 basis proof passed,
- converted-power fraction >= 0.05,
- at least 10 of 12 qualified states for each converted-helicity channel,
- RMS relative phase error <= 12 degrees for each channel.

These are engineering admission thresholds, not physical constants. They must later be calibrated against design goals and measurement.

## What success means

`pb_phase_verified=true` means the current full-wave RCWA model, under the declared basis convention and numerical/material assumptions, exhibits the expected geometric-phase relationship with sufficient converted amplitude and bounded phase error.

It does **not** mean:

- the device has been fabricated,
- FDTD independently agrees,
- the material tables match a real fabrication run,
- broadband behavior is validated,
- efficiency is sufficient for a final display.

## Next gate

Only after R38 passes on a candidate geometry should OMEGA spend higher-cost compute on an independent finite-domain solver (FDTD/FEM) for selected states and then prepare a fabrication/measurement packet. The 144/1728/20736 composition layers remain address hierarchies and are not promoted as experimentally grounded physical states until the primitive alphabet is validated.
