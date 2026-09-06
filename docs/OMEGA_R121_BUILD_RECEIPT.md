# OMEGA R121 Build Receipt

Candidate branch: `r121-sovereign-swarm`
Base authority: R120 `d227e9e93fced1402f585e50424f2e8fdbf46257`

## Added

- deterministic 12×12×12 swarm address core
- 1,728 `OmegaSwarmCell` Durable Object identities
- 20,736 execution lanes
- persistent `OmegaSwarmCoordinator`
- SOLO / FLOCK / TREE / PIPELINE / CONSENSUS / MIRROR / FULL scheduling
- bounded Workers AI capacity governor (0–12 model cells per mission)
- Genesis PROPOSE and Optical SCREEN specialist routes
- cell result SHA-256 receipts, lineage and scar carry
- public `/api/swarm/*` instrumentation and mission APIs
- live 1,728-cell Swarm Body UI in the existing Convergence destination
- retained legacy convergence instrument
- R121 focused CI, Wrangler dry-run and post-deployment deterministic mission proof

## Preserved authority

R121 does not create a second canonical state authority. Cell, Genesis, Optical, and Workers AI results remain candidate/result packets. Mission closure is `RETURNED_NOT_ADMITTED`; existing OMEGAv6 proof/admission remains the only path to CanonState mutation.

## Release gate

The candidate must pass the focused R121 invariants, the complete inherited OMEGA check, a Wrangler dry-run including both new SQLite Durable Object classes, the existing Cloudflare authorization probe, and the canonical main deployment/live verification before it can be described as production-live.
