# OMEGA R115 — Machine-grade PROPOSE + SCREEN adapters

R115 closes the cloud-side federation gap without replacing existing human-facing Genesis or Optical sites and without creating new global authorities.

## Authority remains four-node

1. Genesis — PROPOSE only.
2. Optical — SCREEN only.
3. Sovereign — SOLVE only after current authenticated host proof.
4. OMEGAv6 — sole ADMIT / CanonState / durable proof authority.

## New machine services

- `omega-genesis-machine-r115`: deterministic bounded candidate generation from intent. Output is `OMEGA_PACKET_v1`. It does not claim Maxwell validation.
- `omega-optical-machine-r115`: reduced-order scalar screening, ranking metrics, Mode-188 proof projection and an admissible `OMEGA_FULLWAVE_QUEUE_v1` RCWA request when the candidate passes. Its refractive indices are explicit nominal assumptions, not measured dispersion.

Both services are deployed and live-probed before the canonical R115 worker is allowed to promote.

## Strict closure path

`INTENT → Genesis machine PROPOSE → Optical machine SCREEN → R114 durable receipt chain → current authenticated Sovereign RCWA queue → fresh grcwa result → OMEGAv6 ADMIT → durable replay`

The inherited R114 ceremony remains authoritative for receipts. R115 only supplies service-observed upstream packets through Cloudflare service bindings.

## Non-regression boundary

R114/R113/R112/R111 remain inherited. Existing modes, ledgers, archive continuity, Hybrid proof rules, Workers AI, Earth/NOAA evidence, navigation, rendering, vector carry, scalar/full-wave queue and downloadable Sovereign workers are preserved.

Production remains on the last green release during branch development. A successor is promoted only after syntax checks, executable adapter tests, inherited R114 tests, production build, three Wrangler dry-runs, live machine-worker deployment/probes, PR gates, canonical Cloud Bridge deployment and post-deploy public verification.

## Remaining empirical boundary

Even with both machine services live, `FULL_FEDERATION_PROVED` still requires the user's current paired Sovereign host to heartbeat, claim a newly issued RCWA job, execute `grcwa`, return `OMEGA_RESULT_v1`, and allow OMEGAv6 to admit the chained receipt. Historical pairing, CI RCWA smoke tests and deduplicated old results do not satisfy this condition.
