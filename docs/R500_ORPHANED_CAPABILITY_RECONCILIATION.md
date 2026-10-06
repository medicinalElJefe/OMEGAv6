# R500 — Orphaned capability reconciliation

R500 is a continuity repair over the production-proven R499 baseline. It does not reopen stale branch ancestry. It classifies the remaining open historical pull requests by capability identity and replays only the still-valid residual behavior onto current main.

## Recovered residuals

From R409 / PR #824:
- exact Canon v3 address identity is carried into the existing Atlas→WGS84 query mapping;
- the mapping is explicitly `DER`, never an observed or physical Earth coordinate;
- the live-scene query carries exact address/provenance/non-observation flags;
- a read-only exact traversal envelope joins Exact-v3 identity, Atlas360 deterministic geometry and returned source clocks;
- returned source clocks remain `OBS` only when actually bound, otherwise `GAP`.

From R428 / PR #853:
- Forecast mounts the current runtime-derived Atlas360 surface;
- PCWD→R356 carries the packet's exact address when no explicit Atlas360 context is supplied;
- the default theta=0 frame is labeled `NEUTRAL_REFERENCE_FRAME_NOT_MEASUREMENT`;
- explicit caller Atlas360 context continues to override the neutral fallback.

## Superseded branches

PR #769 and PR #777 are superseded by the later R370/R372 exact-production Earth/SAR chain already executed by R202. They are not replayed.

## Preserved current authority

R499 sequential production continuity remains unchanged:

`receipt → entry assets → exact OMEGA7 browser edge → live capability proof → bridge dependency graph → exact bridge assets → reversible OMEGA7↔OMEGA6 transition → downstream deep-route proof`

R500 adds no physical primitive, no CanonState writer, no source authority, no production writer, no deployment shortcut and no new claim that 20,736 is a physical dimension. Atlas360 remains representational/derived unless independently bound to real measurement evidence.
