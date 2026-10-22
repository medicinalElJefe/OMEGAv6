# OMEGA R121 — Sovereign 1728 Swarm Runtime

R121 converts the existing OMEGA federation into a stateful execution fabric without creating 1,728 separate Worker scripts and without adding another canonical authority.

## Runtime hierarchy

- 1 operator seed / canonical OMEGAv6 authority
- 12 organ domains
- 144 domain×phase branches
- 1,728 independently addressable `OmegaSwarmCell` Durable Object instances (`12^3`)
- 20,736 internal execution lanes (`12^4`; 12 lanes per cell)

These values are address/execution-resolution levels, not literal physical dimensions.

## Execution modes

`SOLO`, `FLOCK`, `TREE`, `PIPELINE`, `CONSENSUS`, `MIRROR`, and `FULL` are scheduling topologies. A mission can activate one cell, a small specialist group, a 144-cell tree, or the complete 1,728-cell body. `FULL` materializes the complete deterministic address set, not 1,728 separate cloud applications.

## Stateful cloud body

`OmegaSwarmCell` owns bounded local state: current status, address, capability profile, heartbeat, completed/failed counts, scar carry, last receipt and result preview. A cell cannot mutate CanonState.

`OmegaSwarmCoordinator` owns mission plans and asynchronous fan-out/fan-in. Durable Object alarms continue bounded batches after the initiating HTTP request returns. PIPELINE runs one cell at a time; other modes use bounded parallel batches.

## Capacity governor

A mission can use all 1,728 cells while keeping model inference bounded. The R121 planner allows at most 12 Workers AI synthesis cells per mission. All other selected cells perform deterministic partition/routing/carry work or an explicitly routed specialist-machine operation. This prevents swarm size from becoming an uncontrolled provider bill.

The existing Workers AI model binding remains synthesis-only. Genesis remains PROPOSE-only. Optical remains reduced-order SCREEN-only. Sovereign native execution still requires the existing authenticated Hybrid host proof.

## Woven Continuity execution law

`partition -> exchange/transform -> invariant carry -> scar/residual carry -> re-contextualize/repartition`

R121 applies this as mission decomposition, per-cell transformation, lineage/invariant carry, persistent local failure scar, and coordinator reconvergence.

## API

- `GET /api/swarm/manifest`
- `GET /api/swarm/status`
- `GET /api/swarm/cells?offset=0&limit=24`
- `GET /api/swarm/cells/:cellId`
- `POST /api/swarm/cells/:cellId/task`
- `POST /api/swarm/missions`
- `GET /api/swarm/missions/:missionId`
- `POST /api/swarm/missions/:missionId/tick`

Normal mission advancement uses Durable Object alarms. `tick` exists for manual recovery/testing.

## UI

The existing **Convergence** destination becomes the Swarm Body instrument, preserving the prior continuity/convergence field under a retained expandable section. No historical route is deleted and no route-count primitive is introduced.

The body renders all 1,728 addresses, mission progress by twelve organ domains, returned receipts, provider-vs-deterministic execution, cell inspector state, capacity governor, and final bounded synthesis.

## Authority boundary

R121 adds execution capacity, not a second brain. Cell state, machine-service output and model synthesis are result packets. Canonical admission remains OMEGAv6's existing proof-governed authority.
