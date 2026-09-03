# OMEGA Sovereign RCWA R3

## What is real in R3

R3 introduces a genuine host-executed RCWA path backed by the open-source `grcwa` Maxwell solver. It does not substitute the browser scalar renderer for RCWA. If NumPy/grcwa are missing, the Sovereign worker returns a dependency failure and no RCWA success is claimed.

## Transport

The existing OMEGA Hybrid pairing credential is reused, but RCWA runs through a specialized worker process so optical solver development cannot destabilize the general Hybrid agent.

Canonical endpoints:

- `GET /api/federation/rcwa/agent-download`
- `GET /api/federation/rcwa/worker-download`
- `POST /api/federation/rcwa/register`
- `POST /api/federation/rcwa/heartbeat`
- `POST /api/federation/rcwa/poll`
- `POST /api/federation/rcwa/queue`
- `POST /api/federation/rcwa/result`
- `GET /api/federation/rcwa/status`
- `GET /api/federation/rcwa/result/:source_packet_id`

Every state-changing endpoint uses the existing paired bridge secret. Queue requests are rejected unless a proving RCWA worker is online.

## Admission

A job must be `OMEGA_FULLWAVE_QUEUE_v1`, request `rcwa`, carry valid geometry/material values, and pass the Mode-188 Tier-2 gate (`STAY`, score >= 1.05, contradiction < 0.75). Composite Tier-1 rank cannot bypass this admission check.

## Solver

`sovereign/omega_rcwa_worker.py` uses `grcwa` for a periodic 2-D rectangular dielectric feature. The feature can be rotated by `theta_deg`. The worker solves twice at increasing Fourier truncation orders and reports:

- total R/T,
- diffraction-order R/T,
- energy-balance residual,
- low/high harmonic counts,
- R/T convergence delta,
- solver/worker versions,
- input and worker fingerprints,
- runtime and lineage.

A job is marked converged only when the harmonic-order delta and energy-balance error both satisfy their configured tolerances.

## Material boundary

R3 intentionally requires numeric refractive-index inputs (`n_incident`, `n_feature`, `n_background`, `n_substrate`). A material label such as TiO2 is not enough. Production optical work should replace constant-index inputs with wavelength-dependent complex dispersion data before fabrication interpretation.

## Independent evolution

The RCWA transport agent is separate from `omega-hybrid-agent.py`. Later versions can add GPU RCWA, dispersion databases, FDTD or FEM without replacing general Hybrid Link behavior. Protocol compatibility remains `OMEGA_FULLWAVE_QUEUE_v1` -> `OMEGA_RESULT_v1`.

## Truth boundary

Successful CI proves the solver code can install `grcwa` and execute a bounded RCWA fixture. It does not prove that the user's Sovereign PC is online or has completed a job. The live system may claim Sovereign RCWA execution only after an authenticated host returns an actual result packet for a queued source packet. Fabrication claims additionally require independent physical measurement.
