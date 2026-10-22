# Federation runtime

`omegaFederation.ts` is the application-side protocol primitive for OMEGA worker exchange. It intentionally contains no node-specific UI and no solver implementation. That separation lets OMEGAv6, Genesis, Optical Cloud and Sovereign Compute evolve independently.

Integration order:
1. Hybrid Link serializes/deserializes `OMEGA_PACKET_v1`.
2. Optical queues only `routeTier2(packet)` results that pass `mayPromote`.
3. Sovereign workers return `OMEGA_RESULT_v1` with convergence metadata.
4. OMEGAv6 proof admission decides whether returned results affect CanonState.
5. Every transition appends lineage; no worker directly overwrites canonical state.

Future protocol revisions should add v2 alongside v1 rather than replacing v1 until all active nodes advertise v2 compatibility.
