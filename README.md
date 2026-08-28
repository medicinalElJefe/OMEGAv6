# OMEGAv6 Sovereign Cloud Runtime

Cloudflare-compatible public runtime bridge for the OMEGA sovereign lineage.

Canonical authority remains in Google Drive. This repository is the deployable public bridge and must never silently promote itself over Drive release authority.

Current deployment lineage target: OMEGA B015 sovereign chain, with R7 contextual continuity as the latest accepted sovereign descendant available to the deployment pipeline.

## Architecture

- Google Drive: canonical source, release pointer, accepted build artifacts, ledgers, rollback evidence.
- GitHub: deployable Cloudflare source bridge.
- Cloudflare Worker + static assets: stable public runtime surface.
- PC/Desktop Link: native/local sovereign execution remains device-side; the public Worker must not claim native execution without device proof.

## Truth boundaries

- `/api/health` is public liveness only.
- `/api/status` reports deployment/runtime truth, including external or device-proof requirements.
- `/api/route-preview` performs bounded deterministic routing only; it does not invoke a model.
- `/api/chat` does not fabricate model output when no provider binding is configured.
- Hybrid Link and native PC control are never reported as live without a verified device heartbeat.
- 12/144/1728/20736 are representational resolution scales, not physical dimensions.

## Cloudflare

This repository is designed for Cloudflare Workers with static assets. Cloudflare Git integration should deploy `main` automatically after accepted updates.

Do not use AppDeploy for this runtime.
