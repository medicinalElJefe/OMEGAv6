# OMEGA R111 — Federated Capability Mesh

R111 turns the existing four-node federation into a scalable capability fabric while preserving one global CanonState/proof authority.

## Authority versus capacity

The federation still has exactly four governed authority nodes:

1. Genesis — **PROPOSE** — node-local exploration and candidate generation.
2. Optical — **SCREEN** — optical compilation, Tier-1 screening, ranking and Tier-2 request generation.
3. Sovereign Compute — **SOLVE** — authenticated high-compute worker family; RCWA is active when a real worker proves it, while FDTD/FEM/GPU/measurement remain planned until real backends exist.
4. OMEGAv6 — **ADMIT** — global CanonState, proof admission and durable continuity authority.

R111 adds scalable service capacity around those authorities. Hybrid transport, RCWA, Workers AI, Earth evidence, route-deferred specialist modules and the independent fabric sentinel are service capabilities, not additional CanonState owners.

## Live fabric API

OMEGAv6 now exposes:

- `GET /api/fabric/status` — current four-authority observations plus auxiliary service capability truth.
- `POST /api/fabric/route` — deterministic minimum-lawful path for an operator intent using current federation health.
- `GET /api/fabric/law` — machine-readable authority/scaling laws.

The API distinguishes current service probe, current authenticated heartbeat, access-gated service, configured binding and capability-contract status instead of collapsing them into one generic ONLINE flag.

## Every route has an output contract

All 44 registered workstation destinations are mapped across the eight system layers:

`STATE → INTELLIGENCE → MEMORY → RELATION → COMPUTATION → ACTION → OBSERVATION → PROOF`

Each route declares:

`INPUT → OPERATION → OUTPUT → PROOF`

The active route contract appears inside the existing expandable global navigator. It is not placed over the primary visual stage. This makes output semantics explicit without flattening specialists into identical dashboards.

## Hybrid one-touch continuity

Hybrid Mission Control now has one primary PC connection surface above the deep mission tools. The primary action chooses the smallest lawful transport repair path:

- no browser credential → create pairing;
- persisted credential → verify reconnect;
- stale/invalid credential → repair only after auth failure;
- current authenticated heartbeat → connected.

A single federation launcher validates and starts the general Hybrid agent and starts RCWA only when NumPy/grcwa are actually available. Missing RCWA dependencies degrade gracefully and display the explicit install command; the browser does not silently install local software.

Browser credential repair never makes the PC ONLINE. Native execution is claimed only after a fresh authenticated host heartbeat returns.

## Independent sentinel cloud

R111 adds `omega-fabric-sentinel`, an independent Cloudflare Worker whose only role is current health observation. It probes OMEGAv6, Genesis, Optical and the OMEGAv6 fabric view. It has no Durable Object, no CanonState, no native action authority and no browser/PC secrets.

Its expected production URL is:

`https://omega-fabric-sentinel.jeffdeweyeljefe.workers.dev`

The URL is not considered production-confirmed until the deployment workflow succeeds and its `/health` and `/fabric` contracts pass live verification.

## Learning loop

R111 formalizes the distributed learning boundary:

`OMEGA state → Genesis proposals → Optical screening → Sovereign evidence → OMEGAv6 admission → scar/history → improved future routing/proposals`

A failed solver result is not discarded as an opaque failure. It returns as structured scar/history evidence. A successful result becomes stronger evidence for admission. Genesis and Optical may use admitted history to improve future proposal/screening distributions, but they do not silently rewrite global truth.

## Scaling rule

More clouds are useful only when they provide a bounded capability, independent observation, isolated high-compute worker, regional transport, cache or queue that improves throughput/resilience without duplicating authority. R111 therefore permits service capacity to grow without turning OMEGA into hundreds of competing state owners.
