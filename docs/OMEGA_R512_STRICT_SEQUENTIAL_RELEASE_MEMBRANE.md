# OMEGA R512 — Strict Sequential Release Membrane

R512 changes the release law from “merge after source/browser CI, then discover production-only asset regressions” to one exact sequence:

1. **Production-proven base** — R210 waits for the current main SHA to have a successful canonical `deploy-main` job before admitting a successor PR.
2. **Exact candidate head** — Cloud Bridge checks out `github.event.pull_request.head.sha`, not a synthetic merge ref, for the remote candidate proof.
3. **Isolated Cloudflare Preview** — the exact candidate is deployed with candidate-owned static assets and isolated Durable Object state before merge. The Preview may call declared production service bindings, but it has no production traffic or Canon authority.
4. **Visual/executor proof before merge** — candidate receipt identity, R510 visual HOME, R486 recovered capability fabric, R499 reversible OMEGA7↔OMEGA6 bridge, desktop/mobile geometry, asset loading and runtime health are proved on that Preview.
5. **Canonical merge/deploy** — only an already-proved exact candidate may proceed through the existing two-parent merge and serialized `deploy-main` path.
6. **Live production closure** — R200/R510/R202/R237/R238 and Hybrid closure remain required after promotion.
7. **Next development turn** — continuation re-checks that `main` is still the exact deployed SHA before dispatching R170 or CLOUD-01. A superseded run exits without starting stale work.

This does not claim that a Preview is production. It adds an earlier production-like proof surface specifically to remove the asset-binding blind spot that caused R510 to pass PR checks and then fail after promotion.

Cloudflare production remains owned only by `.github/workflows/ci.yml`; R125 remains the sole CanonState admission authority.
