# OMEGA R36 — 12-State Vertical Optical Experiment

R36 intentionally compresses the optical program into one strong repeatable experiment instead of adding broad unvalidated machinery.

## Experiment
One anisotropic geometry family is evaluated at 12 orientations:

- theta_k = 15° k, k=0..11
- PB design target Phi_k = 30° k
- wavelengths: default 470, 532, 650 nm
- input polarization: s and p
- material dispersion: R35 provenance-aware material models
- solver: real grcwa RCWA through the existing Sovereign worker

The default full matrix contains 12 x 3 x 2 = 72 full-wave solves. Each wavelength preserves its own convergence packet, solver identity, material provenance and hash.

## What R36 can establish now
R36 can compare converged power response, diffraction orders, energy balance, spectral behavior and polarization-dependent transmission/reflection across all 12 orientations.

## What R36 must NOT claim yet
The current R3/R35 worker returns power observables, not a verified complex 2x2 Jones transmission matrix. Therefore R36 records the PB phase sequence as a design target only. It explicitly reports `phase_observable_available=false` and `jones_matrix_available=false`.

The next scientific step is complex transmitted-field extraction. grcwa exposes layer eigenvector amplitudes and Fourier-domain fields; those APIs can support a carefully validated phase/Jones extension, but the mapping must be tested against known analytic/reference structures before it is admitted into the OMEGA proof chain.

## Promotion rule
Do not expand from 12 to 144 contextual combinations merely because the 72 solves completed. First require:

1. numerical convergence across the selected wavelength/polarization set;
2. stable response under increased Fourier truncation and grid resolution;
3. verified complex phase extraction;
4. Jones-matrix reconstruction where meaningful;
5. comparison against an independent full-wave method for selected states;
6. later, fabrication and measurement residuals.

This preserves the governing principle: validated primitives first, recursive composition second.
