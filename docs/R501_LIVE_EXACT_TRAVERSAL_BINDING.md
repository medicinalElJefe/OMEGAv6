# R501 — Live exact traversal binding

R501 closes the R500 residual where the exact traversal envelope existed in source/test truth but was not consumed by a live executor.

## Runtime binding

- `compileLiveSceneCorrelationR348` consumes `compileExactTraversalEnvelopeR500({address, earth})`.
- The R500 envelope is the single live source for the derived Earth query context and the four source-clock evidence records.
- R348 does not recompute a parallel WGS84 query or a parallel live clock set.
- Existing physical observations remain separately admitted through value + unit + source + source-time + evidence-hash requirements.

## User-visible surface

The native OMEGA7 **Convergence** executor exposes a read-only R501 panel containing:

- exact Canon v3 address identity;
- Atlas360 model bearing with an explicit non-measurement source label;
- DER Earth query context with no physical-coordinate claim;
- the complete four-clock OBS/GAP partition;
- explicit `canonical mutation NO`, `production authority changed NO`, and `observation from model claimed NO` boundaries.

Standard depth remains task-first: the browser proof opens the full Convergence instrument before asserting the deep proof panel.

## Acceptance

R501 is not accepted from source presence alone.

Canonical check must prove the live binding invariant, and post-promotion R202 must execute `tests/r501-live-exact-traversal-browser-e2e.mjs` against the exact promoted SHA on desktop and mobile. That proof requires the exact governed build receipt, OMEGA7 default entry, the Convergence native executor, verified R500 envelope state, DER query provenance, a complete four-clock OBS/GAP partition, no authority inflation, no page errors, no failed JS/CSS assets, and no horizontal overflow.

No new physical primitive, CanonState writer, source authority, execution authority, or production writer is introduced.
