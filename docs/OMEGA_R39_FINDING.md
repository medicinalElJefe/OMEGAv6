# OMEGA R39 — First Complete 12-State PB Finding

At 532 nm, for the current nominal primitive (pitch 330 nm, width 90 nm, length 260 nm, height 550 nm), the full real-grcwa 12-state ledger produced:

- Cartesian basis verified: true
- qualified converted-helicity states: LR 12/12, RL 12/12
- converted-power fraction: ~0.9315 to ~0.9756, mean ~0.9424
- PB gate: false under the current 12 degree RMS threshold
- RMS phase error: LR 13.0195 degrees, RL 13.0195 degrees
- maximum absolute phase error: ~21.2189 degrees at 45/135 degree orientations
- 0/90 degree orientations are essentially exact

The angular error pattern is symmetric and strongly correlated with rotated-grid orientation. Before changing physical geometry, the next required falsification test is spatial-grid convergence of the rotated epsilon mask. If the 45/135 degree error decreases materially as nx/ny increase while geometry is held fixed, the R39 miss is primarily numerical discretization rather than a physical meta-atom failure.

Truth boundary: this is numerical design evidence only; no fabrication performance is claimed.
