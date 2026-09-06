# R121 Release Plan

1. Run `tests/r121-swarm-runtime-invariants.mjs`.
2. Run `node --check src/workerR121.js`.
3. Run the complete inherited `npm run check` gate.
4. Run `wrangler deploy --dry-run` with the R121 Durable Object migration.
5. Require the existing production Cloudflare authorization probe on the pull request.
6. Merge to `main` only after required checks pass.
7. Allow the existing governed `deploy-main` workflow to deploy the exact two-parent merge commit.
8. Verify the canonical public runtime at `omegav6.jeffdeweyeljefe.workers.dev`.
9. Verify `/api/swarm/manifest` reports R121, 1,728 cells, and 20,736 lanes.
10. Launch one deterministic SOLO mission with zero Workers AI calls and require truthful closure as `RETURNED_NOT_ADMITTED`.

If any gate fails, keep R120 production authority unchanged and repair the R121 candidate branch rather than flattening or bypassing inherited safeguards.
