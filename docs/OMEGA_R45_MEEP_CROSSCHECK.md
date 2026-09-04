# OMEGA R45 — Independent Meep Cross-Check

## Purpose

R45 is the first OMEGA optical validation layer whose primary field solve is **not RCWA**.

It uses MIT Meep to solve Maxwell's equations with finite-difference time-domain propagation in a 3D periodic unit cell. The R44 geometry is not re-optimized here. R45 asks a narrower falsification question:

> Does an independent finite-difference solver recover compatible complex transmitted-field behavior for selected states of the R44 candidate?

## Selected first gate

- wavelength: 532 nm
- orientations: 0°, 45°, 90°
- two independent linear excitations: x and y
- unit-cell x/y boundaries: Bloch-periodic, k=0
- z boundaries: PML
- geometry representation: native rotated Meep block with subpixel averaging
- FDTD resolution: 100 pixels/µm

A blank-substrate run is used to normalize each linear input column. The spatial average of the complex DFT field over the transmitted unit-cell plane is treated as the zero-order transmitted field.

From the x/y runs R45 constructs

```
Jlin = [[t_xx, t_xy],
        [t_yx, t_yy]]
```

and transforms it into the same declared circular basis used by R38:

```
R = (x - i y)/sqrt(2)
L = (x + i y)/sqrt(2)
```

The selected states are compared against:

- the geometric-phase targets R→L: −2θ and L→R: +2θ;
- the independently computed R44/R38 RCWA relative phases;
- a 0°↔90° rotational-symmetry basis check.

## Truth policy

The workflow does **not** require `crosscheck_passed=true` in order for CI to succeed. CI requires that the genuine Meep solve executes, that all selected complex-field results are finite, that the comparison is complete, and that the verdict is explicit.

This is intentional. An independent-solver disagreement is valuable evidence and must remain visible rather than being hidden by relaxed thresholds.

The initial engineering comparison thresholds are:

- basis swap error ≤ 0.20;
- cross-coupling ratio ≤ 0.30;
- selected converted-helicity fraction ≥ 0.05;
- selected PB / cross-method relative-phase discrepancy ≤ 20°.

These are validation thresholds, not physical constants.

## Interpretation

A pass provides cross-solver numerical support for the selected R44 states. It does not establish fabrication performance. A fail routes back to numerical-convergence, source/normalization, material-model, or geometry-representation diagnosis before any design claim is promoted.

Only after this selected-state gate is understood should R45 expand across additional wavelengths or orientations.
