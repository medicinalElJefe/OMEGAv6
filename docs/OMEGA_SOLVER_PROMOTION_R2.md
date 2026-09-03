# OMEGA Solver Promotion R2

Tier 1 is intentionally cheap and broad. It may evaluate the complete 20,736-address candidate lattice or expanded geometry variants. Tier 1 outputs are rankings, not fabrication proof.

## Admission
A candidate can enter Tier 2 only when its proof gate is STAY, Mode-188 stability is at least 1.05, and contradiction remains below the configured ceiling. Composite ranking cannot override this gate.

## Routing
- RCWA: preferred for periodic or locally periodic unit-cell response, phase/amplitude libraries, wavelength/polarization sweeps, and rapid geometry optimization.
- FDTD: preferred for strong neighbor coupling, finite-array effects, edges, defects, broadband transient behavior, difficult/high-scar states, and final high-value checks.
- FEM: optional specialized route when geometry/material/boundary conditions favor it.

The first runtime router uses scalar crosstalk, phase error and scar as conservative escalation signals. These are engineering routing heuristics and must be calibrated against actual full-wave outcomes.

## Return/admission
A worker result must identify solver/version, numerical settings or convergence metadata, observables, runtime and lineage. A successful process exit is not equivalent to physical validation. Fabrication claims require converged full-wave results and independent measurement comparison.

## Scaling
Tier 1 may fan out across browser/GPU/cloud workers. Tier 2 should use bounded queues, deduplication by geometry/material/wavelength/polarization hash, caching, priority, retries, timeouts and cost budgets. High-fidelity solves are reserved for candidates whose expected information gain justifies their compute cost.
