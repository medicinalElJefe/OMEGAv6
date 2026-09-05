# OMEGA R103 — Task-First Capability Router

## Product law
The operator states the outcome. OMEGA resolves the smallest required capability graph, exposes the first real gate, preserves one packet/proof lineage, and does not invoke specialist infrastructure merely because it exists.

`intent → minimal capability graph → visible gate → execution → evidence → OMEGAv6 admission`

This is a UX and systems rule, not just a Federation Run widget.

## Minimal-routing examples

- Inspect proof, history, current state, or forecast from admitted evidence → **OMEGAv6 only**.
- Explore alternatives / generate candidate families → **Genesis → OMEGAv6**.
- Screen an already-defined optical structure → **Optical → OMEGAv6**; Genesis and Sovereign remain optional.
- Generate optical candidates and run full-wave validation → **Genesis → Optical → Sovereign → OMEGAv6**.
- Run bounded native software/build/test work → **Sovereign → OMEGAv6**.

The full four-node path is a capability, not a mandatory ceremony.

## Truth behavior
Routing is deterministic from operator intent plus current federation health. The router does not claim a node executed; it only determines which nodes are required and reports their current availability. A required unavailable node becomes the visible gate.

Current state labels retain the existing semantics: LIVE/ready, working, access-gated, HOLD, offline/unreachable, historical proof, planned.

## Continuity membrane
Every invoked handoff should preserve the shared context established in R102: project ID, packet ID, state/address, observer frame, evidence class, proof gate, scar/history, orientation, solver identity where applicable, and lineage.

## Performance lane introduced in R103
The production build is partitioned into cache-oriented capability chunks for React/vendor, Earth/Forecast, Explore/Traversal, runtime/intelligence, evidence/system, and specialist families. This improves cache stability and parallel-load boundaries and makes heavy subsystems independently visible in build output.

This is **not** represented as true route-level deferred loading. Static imports still cause required dependency chunks to load when the workstation module loads. The next measurable performance step is to migrate specialist route bodies to dynamic imports / React.lazy while preserving the 44-route reachability and non-regression contract.

## UX intent
Infrastructure remains inspectable underneath, but ordinary operation should increasingly look like:

1. describe the outcome;
2. see the active object/state;
3. see OMEGA's minimal path only when useful;
4. act;
5. inspect proof/evidence if desired.

The operator should not need to understand Cloudflare service bindings, Vercel protection, Durable Object namespaces, solver queues, or bridge/session IDs to perform ordinary work.
