# OMEGA R102 — Federated Instrument Experience

## Product intent
OMEGA should feel like one advanced scientific/computational instrument even though it is deliberately implemented as specialized runtimes. The user should not need to understand hosting topology before they can use the system.

The ordinary interaction is:

`intent / object / project → OMEGA routes capabilities → visible handoff trace → result + proof`

The infrastructure trace remains inspectable, but infrastructure selection is normally automatic.

## Four specialized runtimes

### Genesis — PROPOSE
Purpose: exploration, alternatives, candidate families and search-space expansion.

Genesis may maintain a durable **node-local working state** for its own replay and proposal generation. That local state is not the global federation CanonState. Genesis returns proposal packets to OMEGAv6.

### Optical — SCREEN
Purpose: geometry compilation, reduced-order/scalar screening, ranking, optical visualization and Tier-2 routing.

Optical reduces large candidate populations before expensive numerical work. Its scalar/reduced-order results are routing evidence, not full-wave validation.

### Sovereign Compute — SOLVE
Purpose: bounded authenticated machine execution, RCWA now and later FDTD/FEM/GPU/measurement adapters.

The PC/Hybrid transport and the RCWA process are sublayers of one Sovereign node, not separate federation nodes. PC ONLINE requires current authenticated heartbeat proof. Solver ONLINE requires current solver-worker proof.

### OMEGAv6 — ADMIT
Purpose: global operator context, CanonState, proof admission/HOLD, durable project continuity, evidence/receipt correlation and result ledger.

OMEGAv6 is the only global federation CanonState mutation authority unless a governed release explicitly migrates that authority.

## Shared context membrane
Every cross-node handoff should preserve, when applicable:

- project identity
- packet identity
- state ID and atlas address
- observer/frame selection
- evidence class
- proof/admissibility gate
- scar/history carry
- signed orientation σ
- solver/material/numerical identity
- source SHA and lineage

A user moving from Traversal to Optical to full-wave validation should feel that the **same object** moved through deeper computation, not that three unrelated applications were opened.

## Instrument grammar
Shared across sites:

- one restrained status language
- one active/held/blocked/history visual semantics
- same control hierarchy: primary action, secondary action, quiet/advanced action
- same concept of project/state/address/proof context
- same mobile/desktop capability parity
- same no-fake-control and no-shadow-state rules

Not shared blindly:

- primary visual renderer
- specialist domain controls
- data density appropriate to the role
- solver-specific inspection
- exploration-specific interaction

Common grammar is for orientation and trust. Specialist identity is for capability.

## Screen architecture

### Persistent instrument rail
Thin, stable and non-covering. It answers: **where am I and where can I go?** It does not become a wall of status cards.

### Primary stage
Owns the screen. It answers: **what is the system currently expressing or computing?** No default telemetry panel covers it.

### Context strip
Compact project / packet / state / address / proof / node context. This should survive route changes and node handoffs.

### Inspector / evidence drawer
Progressive disclosure for parameters, receipts, logs, provenance, numerical convergence and history. It is opened deliberately and does not obscure the stage by default.

### Handoff trace
PROPOSE → SCREEN → SOLVE → ADMIT. This should appear whenever federation work is relevant and identify the active gate without requiring the user to manually visit every node.

## Capability routing
The user chooses an outcome such as:

- explore alternatives
- inspect current state
- traverse matter/scale
- forecast under a frozen prior
- generate optical candidates
- screen a candidate population
- validate a top optical structure
- inspect evidence/proof
- repair or build software

OMEGA resolves the minimal required capability graph. For example, optical validation can route:

`intent → Genesis candidate family (optional) → Optical compile/screen → Sovereign RCWA → OMEGAv6 admission`

A step that is already satisfied should not be repeated merely because the workflow template contains it.

## Status semantics
State labels must distinguish:

- LIVE / READY — current machine-readable service or authenticated device proof
- WORKING — active computation/handoff
- ACCESS_GATED — service exists but machine access is not authorized
- HOLD — result exists but proof/admission requirements are not met
- OFFLINE / UNREACHABLE — no current proof of availability
- HISTORICAL_PROOF — prior pairing/result exists without claiming current availability
- PLANNED — architecture target not yet implemented

Never collapse these into a generic green/red online indicator.

## Recovery behavior
Normal recovery should be automatic where safe:

1. reuse persisted bridge identity;
2. verify its credential;
3. reconnect the existing agent if it is live;
4. expose a repair action only when authentication actually fails;
5. require a fresh heartbeat after credential rotation;
6. preserve historical proof without claiming current machine state.

The user should not have to understand session IDs, Durable Object names, queue identities or Vercel protection mechanics during ordinary operation.

## Four-site URL continuity
The federation manifest is the registry of preferred and legacy service locations. Site URLs may evolve without changing role identity. A node is identified by its stable node ID and compatible protocol/capability manifest, not by one permanent hostname.

The current preferred Optical surface is `omega-living-light-etching-private-woven2.vercel.app`; the previous `omega-optical-cloud-woven2.vercel.app` remains a legacy recovery endpoint while compatibility is maintained.

## Performance intent
Preserving capability does not require shipping every specialist implementation in the first browser bundle. The next performance lane should use route-level code splitting and deferred specialist loading while preserving the 44-route reachability contract and same-state continuity.

The shell, canonical context, rail, current stage and proof/status membrane should load first. Heavy Earth, Matter, optical, archive, audio, restoration and developer surfaces should be loaded when used or prefetched from likely intent.

## Expansion intent
Sovereign Compute should become a worker family rather than a single solver process:

- RCWA: periodic/local-periodic electromagnetic validation
- FDTD: edges, coupling, high-scar/non-periodic structures
- FEM: specialized geometry/material cases
- GPU batch: high-throughput candidate validation
- measurement ingest: comparison against fabricated/observed data

New workers return compatible result packets. They do not gain CanonState authority simply because they are more computationally expensive.

## Acceptance condition
OMEGA is not "complete" because every route opens. It is successful when a user can begin with an intent, remain oriented, see the correct specialist representation, traverse required computation, recover from a broken dependency, inspect evidence and lineage, and receive one truthful result/admission state without duplicated authority or hidden capability.
