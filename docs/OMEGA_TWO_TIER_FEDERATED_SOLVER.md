# OMEGA Two-Tier Federated Solver R1

## Governing rule

OMEGA uses one canonical state authority. Worker clouds may propose, screen, solve, render, or measure, but may not silently fork CanonState.

Master transition:

`partition -> transform -> invariant carry -> scar carry -> re-contextualize`

The 12 -> 144 -> 1,728 -> 20,736 hierarchy is an address/resolution hierarchy. It is not a claim of literal physical dimensions.

## Corpus axes

The synced runtime provides four 12-state axes used by the optical compiler:

1. Domain: Structure through Continuity.
2. Phase: Initiation through Integration.
3. Regulation: Observe through Reseed.
4. Seed: Seed through Reseeding.

Together these give 12^4 = 20,736 canonical addresses.

## Tier 1: fast screening

Tier 1 runs a scalar-wave / reduced-order optical screen across thousands of compiled candidates.

Candidate packet fields include geometry, orientation theta, target phase, wavelength, sigma orientation, estimated efficiency, scalar focus, phase error, crosstalk, continuity, burden, contradiction, scar, Mode-188 score, and lineage.

Tier 1 is intended for ranking and pruning. It is not a substitute for full Maxwell validation.

### Gate

Candidate status is derived from the Mode-188 stability ratio used by the synced runtime. Screening results are ranked by a composite objective, but a high composite score cannot bypass the proof gate.

## Tier 2: full-wave validation queue

Only the highest-ranked Tier-1 candidates are promoted.

Preferred routing:

- RCWA for periodic / locally periodic metasurface cells, spectral sweeps, polarization response, and geometry optimization.
- FDTD for near-field effects, finite arrays, strong neighbor coupling, broadband transients, edge effects, and final high-value validation.

Tier-2 jobs use schema `OMEGA_FULLWAVE_QUEUE_v1` and carry full lineage back to the originating atlas state.

No browser visualization may be labeled RCWA or FDTD unless a real solver produced the result.

## Federation

### OMEGAv6
Canonical state, proof admission, operator cockpit, Hybrid Link, result ledger.

### Genesis
Proposal generation and exploratory search. Outputs candidate/proposal packets only.

### Optical Cloud
Optical compiler, Tier-1 screening, promotion ranking, Tier-2 queue, visualization.

### Sovereign compute node
High-compute executor for RCWA/FDTD/FEM-compatible jobs and measured-data ingestion.

## Packet contract

`OMEGA_PACKET_v1` requires:

- state_id
- atlas_address
- source_node
- source_sha
- geometry
- wavelength_nm
- sigma
- target_phase_deg
- scalar_metrics
- proof
- scar
- requested_solver
- lineage

Worker result packets add solver version, mesh/harmonic settings, material model, convergence metrics, spectra/Jones or S-parameters, field artifacts, runtime, and measurement comparison when available.

## Closed loop

`Atlas -> compile -> Tier 1 -> Mode-188 gate -> promote -> RCWA/FDTD -> result packet -> canonical admission -> fabricate/measure -> residual/scar -> recompile`

## Hard scientific boundary

Conceptual OMEGA scores and corpus recurrence are not independent experimental evidence. Duplicate lattice workbooks are views of the same model family. Fabrication claims require full-wave convergence plus measurement against independently obtained physical data.
