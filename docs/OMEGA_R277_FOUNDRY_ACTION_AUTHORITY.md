# OMEGA R277 — Foundry action-authority closure

R277 closes a fail-open classification gap in the planning-only System Foundry.

Before R277, `AUTH_REQUIRED` was a declared evidence-gate type but the compiler never enforced it. The side-effectful `action.dispatch` capability declared `NONE`, used `SOURCE` as its authority, and could therefore appear `ACTIVE` with a Cloud executor even though the Foundry explicitly has no authorization or dispatch authority.

R277 makes the boundary executable:

- every capability declaring `AUTH_REQUIRED`, and every capability declaring a side effect, compiles `BLOCKED`;
- blocked action capabilities have no admitted executor and expose the exact `AUTH_REQUIRED` blocker;
- `action.dispatch` now names existing `R147_DISPATCH` authority instead of source authority;
- the visible Foundry surface labels its frontier as planning and states that it cannot self-authorize or dispatch;
- R179 explicit authorization and R147 dispatch remain separate existing authorities outside the Foundry adapter;
- device and external evidence cannot accidentally clear the action gate;
- read-only and computational dependencies remain independently active when their own evidence is satisfied.
- the visible genome fingerprint advances to `r277-*` and now binds capability evidence, side-effect, authority, executor and dependency semantics so an authority change cannot retain an old structural identity.

R277 adds no endpoint, poller, executor, mutation path, deployment writer, physical primitive, or CanonState authority. R125 remains sole CanonState admission authority; R141 exact-return closure, R146 durable history, R179 explicit authorization, R147 dispatch, R205 executor semantics, R239 resource governance, R240 exact-head promotion, R243 planning/execution-motion truth separation, and `.github/workflows/ci.yml` as the sole production writer remain unchanged.

Proof is bound into `npm run test:system-atlas` through `tests/r277-foundry-action-authority-invariants.mjs`. The executable test evaluates every registered genome across all device/external truth permutations, proves that every side effect remains blocked with no executor, and proves that an otherwise satisfied read/compute dependency remains independently active.
