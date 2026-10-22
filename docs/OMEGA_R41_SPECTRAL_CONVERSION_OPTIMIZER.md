# OMEGA R41 Spectral Conversion Optimizer

R41 optimizes the already PB-qualified 12-state anisotropic primitive for broader converted-helicity efficiency. It does **not** relax the R38/R39 Pancharatnam-Berry phase gate.

## Search architecture

**Tier 1 — bounded real-RCWA screening**
- geometry variables: pitch, width, length, height;
- default neighborhood: 3×3×3×3 = 81 candidates around the current 330/90/260/550 nm primitive;
- wavelengths: 470, 532, 650 nm;
- one orientation (theta=0) using the real complex transmitted-field solver;
- conservative conversion score protects the weakest wavelength and explicitly values red conversion;
- invalid rotated-cell geometries are rejected before solving.

**Tier 2 — full proof promotion**
- baseline is always promoted for an honest comparison;
- top Tier-1 candidates are promoted;
- validation grid: 96×96, established by R40 convergence testing;
- each finalist runs 12 orientations × 2 helicity channels × 3 wavelengths;
- every wavelength must retain the R38 PB phase verdict;
- only PB-admitted finalists receive a final conversion objective.

## Final objective

Among candidates that pass the PB hard gate:

`objective = 0.50 * minimum_conversion + 0.30 * mean_conversion + 0.20 * red_mean_conversion`

The score is intentionally conversion-focused because PB phase fidelity is not a soft tradeoff; it is an admission requirement.

## Truth boundary

This optimizer uses genuine grcwa full-wave calculations and dispersion-aware design material models, but the output remains numerical design evidence. It does not constitute process-specific material calibration, FDTD agreement, fabrication tolerance validation, or measured device performance. A candidate that improves the objective but fails the PB gate is rejected rather than normalized into success.
