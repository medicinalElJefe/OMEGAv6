# OMEGAv6 Full Restore Manifest

Status: IN PROGRESS — PARALLEL MIGRATION. Do not call FULL RESTORE or SUPERSEDE until the build and inheritance gates pass.

Canonical release authority remains Google Drive `LATEST_OMEGA_UPDATE.json` -> B015 R1. `main` remains the runnable rollback/public compatibility surface. `full-restore` is the exact hosted-runtime migration branch.

## Completion gate

A menu count is not restoration. Completion requires: React/Vite build PASS; Worker syntax PASS; fixed route regression PASS; responsive desktop/mobile PASS; no provider/native/live-feed false claims; actual migrated functionality for donor surfaces; regression-by-omission comparison against B058/V90; preserved newer R7-R12 cloud/route/auth-continuity updates; Cloudflare preview/live verification after merge.

## Donor application structure to restore

The donor snapshot is hosted B058 / V90. The migration target includes the real dashboard/control surface, responsive shell, command/orchestrator, traversal/rendering modules, Earth, Forecast, Relativity, Atlas, Hybrid Link, SAI, governance, proof/memory, projects/jobs/assets, validation/system surfaces, corpus/state-space runtimes and original CSS hierarchy.

## Migration states

Use only: `MIGRATED_EXACT`, `MIGRATED_ADAPTED`, `PARALLEL`, `BLOCKED_BY_EXTERNAL`, `NOT_YET_MIGRATED`.

### MIGRATED_EXACT

- `src/main.tsx`
- `src/index.css`
- `src/ResponsiveRuntimeShell.tsx` — exact B058/V90 responsive runtime component, including AUTO/DESKTOP/MOBILE mode control, 24-family registry, 6 operational layers, microstructure pipeline, source glyph, canonical packet metrics, mobile runtime tabs, Mode188/proof display, and primary mobile navigation.
- `src/responsiveShell.css` — exact donor responsive hierarchy, including desktop inspector rail, 1499px intermediate layout, <=760px mobile runtime conversion, explicit MOBILE layout, overflow containment, field/canvas constraints, and reduced-motion behavior.

### MIGRATED_ADAPTED

- `src/App.tsx` — deployment wording only; still awaits real donor dashboard dependency.
- `src/runtimeIdentity.ts` — provider lineage made donor-only; Drive/Cloudflare authority distinction retained.
- `src/platformAdapter.ts` — Cloudflare-compatible HTTP/local-continuity boundary replacing the donor `@appdeploy/client` assumption for future module migration. It includes bounded request timeout, structured provider failure, local storage continuity, and explicit unbound auth/realtime/device states.
- `src/worker.js` — B020 route-before-generation preserved; `/api/restoration` added; false completed-restore language removed.
- `package.json` — Vite/Wrangler toolchain plus route and restore-invariant checks.
- `vite.config.ts`
- `wrangler.jsonc` — custom Vite build -> `dist`, workers.dev retained.
- `.github/workflows/ci.yml` — verifies both `main` and `full-restore` pushes; full-restore failures are evidence and block merge rather than being hidden.
- `tests/restore-invariants.mjs` — verifies truth boundaries, adapter independence, and exact responsive donor inheritance.

### BLOCKED_BY_EXTERNAL

- Native PC execution / screen control — `DEVICE_PROOF_REQUIRED`.
- External synthesis provider — `NOT_CONFIGURED` until a provider binding exists.
- Earth live external feeds — `EXTERNAL_DEGRADED` until verified source binding exists.
- Cross-client realtime transport — not yet bound on Cloudflare migration branch.

### NOT_YET_MIGRATED

The remaining B058/V90 components and runtime modules, including the real `OmegaDashboard.tsx`, Prompt Orchestrator, Workspace/Cockpit, Immersive/Matter/Extreme Traversal, Visual Instrument, Relativity, Earth Now, Forecast, Atlas/Traversal, Reality Lab, Atlas Calculator, Infinity, Convergence, Quality Compiler, Build Out, Projects/Render Queue/Assets, Modes, Kernel Intelligence, Evidence & Proof, Memory, Archive Census/Operators, Development/Canon Evolution, SAI Lab, Governance/Consolidation, Instructions, Plugins/Settings/System/Validation/System Atlas/Scale Compiler/Control Matrix, corpus/runtime/calculus/render modules, and their supporting CSS/runtime files.

## Current build state

The branch is intentionally **not merge-ready**. The React build remains blocked by missing donor modules beginning with `src/OmegaDashboard.tsx`; a generic replacement is prohibited because it would repeat the shell downgrade. The real responsive shell slice is now present and independently guarded by migration invariants, but it is not counted as integrated runtime behavior until the real dashboard imports and renders it. Static Worker/routing/restoration invariants can pass independently, but full `npm run build` must remain FAIL/NOT_READY until the real dependency graph is migrated.

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
