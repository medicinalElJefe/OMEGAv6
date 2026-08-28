# OMEGA Auto-Update Contract

This repository is the public Cloudflare deployment bridge. It is not release authority.

Every automated development cycle must:

1. Read Google Drive `.OMEGA_HYBRID_HUB/00_CONTROL/LATEST_OMEGA_UPDATE.json` first. That pointer alone controls release promotion; HOLD never stops development.
2. Reconstruct the Build Identity Packet and reconcile current accepted sovereign descendants, rollback targets, ledgers, tests, Hybrid Link, Earth, contextual assistant, Macro Studio, rendering/vector donors, and relevant canon state.
3. Perform only evidence-backed bounded TURNs. Never invent provider/device/live-link success.
4. Run applicable static, canonical, interaction, semantic, performance, and regression-by-omission tests before acceptance.
5. Preserve Google Drive as canonical source/ledger/rollback authority.
6. When a software TURN is accepted and is compatible with the public Cloudflare runtime, update `medicinalElJefe/OMEGAv6` on `main` with the deployable source delta and lineage metadata. Cloudflare Git integration is expected to deploy accepted `main` changes automatically after the initial human Cloudflare repository selection/deploy setup.
7. Never push a change to `OMEGAv6` that falsely claims native PC execution, Hybrid Link heartbeat, model-provider availability, Earth live-feed validity, or any external state without first-hand evidence.
8. The Cloudflare bridge must retain a public liveness endpoint, truthful runtime status, route-before-generation semantics, responsive desktop/mobile behavior, and bounded failure states.
9. If the cloud/public adapter cannot inherit a local capability safely, classify it as `DEVICE_PROOF_REQUIRED`, `AUTH_REQUIRED`, `EXTERNAL_DEGRADED`, or `NOT_TESTABLE` rather than simulating it.
10. Do not use AppDeploy.
11. Keep previous verified rollback artifacts and record Git commit SHA, Drive parent, tests, deployment-link verification evidence when available, and rollback target.
12. Do not claim a public Cloudflare URL is live until it is directly verified.
13. The production Cloudflare route must stay explicit in `wrangler.jsonc`: Worker name `omegav6`, `workers_dev: true`, and `preview_urls: true`, unless a verified custom-domain replacement is intentionally promoted. Do not rely on dashboard-only routing state because Git deployments may overwrite remote settings.
14. A Cloudflare build marked successful is not sufficient evidence of public reachability. Require DNS/HTTP verification of the actual production URL and `/api/health`; otherwise classify the link as `LINK_VERIFICATION_FAIL` or `NOT_TESTABLE`.

Current bridge bootstrap: OMEGAv6 Cloudflare Worker + static assets.
Canonical lineage target at bootstrap: OMEGA B015 sovereign chain / R7 contextual continuity descendant, while Drive remains the release authority.

## 2026-08-28 routing repair

Observed evidence: Cloudflare completed the Git deployment, but the user-facing production URL returned `server can't be found`. The build log also showed `workers_dev`/preview routing warnings. Bounded repair: align the Wrangler Worker name with the deployed Worker (`omegav6`) and explicitly enable `workers_dev` and `preview_urls`. Rollback target is commit immediately preceding `897660b07ea87a0fe4e270302771302c7a0153b3`.
