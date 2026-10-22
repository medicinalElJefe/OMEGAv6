# OMEGA R37 — Complex Field Basis Verification

R37 closes the next epistemic gap in the optical stack: power-only RCWA results are insufficient for geometric-phase or Jones characterization. The solver must expose complex transmitted electric-field amplitudes and verify the basis convention before those quantities are promoted.

## Method
At normal incidence with azimuth phi=0, grcwa is excited independently with p and s inputs. R37 treats those initially as candidate Cartesian x and y inputs, extracts the zero-order Ex/Ey Fourier components in the transmitted substrate layer, and constructs a candidate 2x2 complex transmission matrix.

The matrix is explicitly **not called a Jones matrix** until the basis passes a rotational-symmetry test. For an anisotropic rectangular element, rotating the element by 90 degrees should exchange the principal co-polar transmission responses while keeping cross-polar response bounded. R37 records normalized swap error and cross-coupling ratio and hashes the complete proof packet.

## Truth ladder
1. R/T power — real RCWA, already active.
2. Complex zero-order transmitted field — R37.
3. Basis verification by rotational symmetry — R37 gate.
4. Jones/PB characterization — only after R37 passes.
5. Independent full-wave cross-check — later FDTD or equivalent on selected states.
6. Fabrication/measurement — required for physical validation.

## Canonical 12-state implication
Only after the complex basis is verified should the 12 orientations theta_k=15 degrees*k be tested against the intended geometric-phase relation Phi=plus/minus 2theta under circular polarization. Agreement is an outcome to test, not a value to assume.

## Scientific boundary
Internal basis consistency does not prove the material model, fabrication process, PB behavior, or physical device performance. Those require further numerical convergence/cross-solver checks and measurement.
