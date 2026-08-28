# OMEGAv6 Full Restore Manifest

Status: IN PROGRESS — PARALLEL MIGRATION. Do not call FULL RESTORE or SUPERSEDE until the build and inheritance gates pass.

Canonical release authority remains Google Drive `LATEST_OMEGA_UPDATE.json`. `main` remains the runnable rollback/public compatibility surface. `full-restore` is the exact hosted-runtime migration branch.

## Completion gate

A menu count is not restoration. Completion requires: React/Vite build PASS; Worker syntax PASS; fixed route regression PASS; responsive desktop/mobile PASS; no provider/native/live-feed false claims; actual migrated functionality for donor surfaces; regression-by-omission comparison against B058/V90; preserved newer R7-R11 cloud/route/auth-continuity updates; Cloudflare preview/live verification after merge.

## Donor application structure to restore

The donor snapshot is hosted B058 / V90. The migration target includes the real dashboard/control surface, responsive shell, command/orchestrator, traversal/rendering modules, Earth, Forecast, Relativity, Atlas, Hybrid Link, SAI, governance, proof/memory, projects/jobs/assets, validation/system surfaces, corpus/state-space runtimes and original CSS hierarchy.

## Migration states

Use only: `MIGRATED_EXACT`, `MIGRATED_ADAPTED`, `PARALLEL`, `BLOCKED_BY_EXTERNAL`, `NOT_YET_MIGRATED`.

Current exact/adapted foundation:

- `src/main.tsx` — MIGRATED_EXACT
- `src/App.tsx` — MIGRATED_ADAPTED (deployment wording only)
- `src/runtimeIdentity.ts` — MIGRATED_ADAPTED (AppDeploy lineage made donor-only; Drive/Cloudflare authority distinction added)
- `src/index.css` — MIGRATED_EXACT base workstation stylesheet
- `package.json` — MIGRATED_ADAPTED for sovereign Vite/Wrangler toolchain
- `vite.config.ts` — MIGRATED_ADAPTED
- `wrangler.jsonc` — MIGRATED_ADAPTED; custom Vite build -> `dist`, workers.dev retained

All remaining B058/V90 component/runtime/CSS files remain `NOT_YET_MIGRATED` unless a later commit explicitly records otherwise. Old `@appdeploy/client` assumptions must be replaced by a Cloudflare-compatible adapter; functionality must not be silently deleted.

## Newer accepted behavior that must survive donor restoration

- Google Drive pointer remains release authority.
- GitHub -> Cloudflare deployment bridge remains.
- `/api/health`, `/api/status`, `/api/restoration` remain truthful and public-safe.
- B020-style route-before-generation discipline remains.
- Explicit ALL MODES routes full; deterministic facts do not invoke synthesis.
- Provider absence returns a bounded failure, never fabricated synthesis.
- Hybrid Link native execution remains `DEVICE_PROOF_REQUIRED` until verified heartbeat/proof.
- Earth external feeds remain degraded until verified.
- Local draft continuity and single-flight interactions remain.
- Mobile/desktop overflow containment remains.
- workers.dev route activation and preview URLs remain.

## Merge rule

Do not merge `full-restore` into `main` until `npm run build` passes and migration invariant checks show the targeted donor capability slice is genuinely inherited. Keep the previous `main` commit as rollback.
