# OMEGAv6 Full Restore Manifest

Status: IN PROGRESS — PARALLEL MIGRATION. Do not call FULL RESTORE or SUPERSEDE until the build and inheritance gates pass.

Canonical release authority remains Google Drive `LATEST_OMEGA_UPDATE.json` -> B015 R1. `main` remains the runnable rollback/public compatibility surface. `full-restore` is the exact hosted-runtime migration branch.

## Completion gate
A menu count is not restoration. Completion requires: React/Vite build PASS; Worker syntax PASS; fixed route regression PASS; responsive desktop/mobile PASS; no provider/native/live-feed false claims; actual migrated functionality for donor surfaces; regression-by-omission comparison against B058/V90; preserved newer cloud/route/auth-continuity updates; Cloudflare preview/live verification after merge.

## Migration states
Use only: `MIGRATED_EXACT`, `MIGRATED_ADAPTED`, `PARALLEL`, `BLOCKED_BY_EXTERNAL`, `NOT_YET_MIGRATED`.

### MIGRATED_EXACT
- `src/main.tsx`
- `src/index.css`
- `src/ResponsiveRuntimeShell.tsx`
- `src/responsiveShell.css`
- `src/hybridCommandRuntime.ts` — exact donor allow-listed command-plan validation/runtime, including relative-root confinement, domain gating, file/automation operation envelopes, bounded macro replay and mission-op derivation.
- `src/OmegaCommandDeck.tsx` — real donor assistant-first Command Center surface with animated source field, source/model visual distinction, state metrics, quick prompts, proof strip and Prompt Orchestrator integration.
- `src/commandDeck.css` — real donor Command Center visual hierarchy and mobile breakpoints.
- `src/promptOrchestrator.css`
- `src/localTraining.css`

### MIGRATED_ADAPTED
- `src/App.tsx` — deployment wording only; still awaits real donor dashboard dependency.
- `src/runtimeIdentity.ts` — provider lineage made donor-only; Drive/Cloudflare authority distinction retained.
- `src/platformAdapter.ts` — Cloudflare HTTP/local-continuity boundary replacing provider-specific frontend transport.
- `src/PromptOrchestrator.tsx` — donor CONVERSE/ENACT, governed-plan review, mission control and proof interaction migrated through `platformAdapter`; unavailable provider/device paths fail truthfully rather than disappearing.
- `src/worker.js` — B020 route-before-generation preserved; `/api/restoration`, `/api/hybrid/status`, `/api/missions`, and `/api/orchestrator/thread` provide truthful migration-state adapters; write/execution routes remain DEVICE_PROOF_REQUIRED or provider-gated.
- `package.json`
- `vite.config.ts`
- `wrangler.jsonc`
- `.github/workflows/ci.yml`
- `tests/restore-invariants.mjs`

### BLOCKED_BY_EXTERNAL
- Native PC execution / screen control — `DEVICE_PROOF_REQUIRED`.
- External synthesis provider — `NOT_CONFIGURED` until a provider binding exists.
- Earth live external feeds — `EXTERNAL_DEGRADED` until verified source binding exists.
- Cross-client realtime transport — not yet bound on Cloudflare migration branch.

### NOT_YET_MIGRATED
The remaining B058/V90 components and runtime modules, beginning with the real `OmegaDashboard.tsx` dependency graph: Workspace/Cockpit, Immersive/Matter/Extreme Traversal, Visual Instrument, Relativity, Earth Now, Forecast, Atlas/Traversal, Reality Lab, Atlas Calculator, Infinity, Convergence, Quality Compiler, Build Out, Projects/Render Queue/Assets, Modes, Kernel Intelligence, Evidence & Proof, Memory, Archive Census/Operators, Development/Canon Evolution, SAI Lab, Governance/Consolidation, Instructions, Plugins/Settings/System/Validation/System Atlas/Scale Compiler/Control Matrix, corpus/runtime/calculus/render modules, and supporting CSS/runtime files.

## Current build state
The branch remains intentionally **not merge-ready**. The real assistant-first Command Center slice is now present as source, but the React application build is still blocked by the missing real `src/OmegaDashboard.tsx` and its dependency graph. No generic dashboard replacement is allowed. The new Command Center migration is therefore counted as source inheritance, not yet integrated live behavior.

## Newer accepted behavior that must survive donor restoration
- Google Drive pointer remains release authority.
- GitHub -> Cloudflare deployment bridge remains.
- `/api/health`, `/api/status`, `/api/restoration` remain truthful and public-safe.
- B020 route-before-generation remains.
- Explicit ALL MODES routes full; deterministic facts do not invoke synthesis.
- Provider absence returns bounded failure, never fabricated synthesis.
- Hybrid Link native execution remains `DEVICE_PROOF_REQUIRED` until verified heartbeat/proof.
- Earth external feeds remain degraded until verified.
- Local draft continuity and single-flight interactions remain.
- Mobile/desktop overflow containment remains.
- workers.dev route activation and preview URLs remain.

## Merge rule
Do not merge `full-restore` into `main` until `npm run build` passes and migration invariant checks show the targeted donor capability slice is genuinely inherited. Keep the previous `main` commit as rollback.
