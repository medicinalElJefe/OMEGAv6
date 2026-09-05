# OMEGA R110 — Runtime-Aware Working Set

R110 advances the verified R109 route-deferred specialist fabric by making speculative specialist-byte preparation adapt to current-session runtime conditions without changing any capability, route, proof, CanonState, federation or execution authority.

## What changes

- Hidden documents suppress speculative specialist loading.
- Save-Data sessions suppress speculative specialist loading.
- 2G and slow-2G sessions suppress speculative loading.
- Low-power and 3G contexts reduce the speculative working set to one panel.
- Ordinary visible sessions use a bounded two-panel working set.
- Direct operator-selected route demand remains available even when speculative prefetch is suppressed.
- Speculative prefetch yields to active interaction using requestIdleCallback with a deterministic timeout fallback.
- Working-set telemetry is current-session module-byte state only: REQUESTED, LOADED, PARTIAL, FAILED or SUPPRESSED.

## Truth boundary

Working-set telemetry does not mean a capability executed, a solver ran, a cloud is healthy, a PC is online, evidence was created, a proof gate passed, or CanonState changed. It reports only code-module preparation state for the current session.

## Architecture preservation

R110 reuses the R109 module registry and the existing OMEGA workstation route authority. It introduces no new router, CanonState owner, execution bus, proof ledger or federation authority. The 44 registered destinations remain intact, specialist identity remains intact, and R109 dynamic-import boundaries remain the packaging authority.

## Why this matters

OMEGA now has enough specialist depth that performance must be governed as part of instrument behavior rather than treated as a generic bundle-size problem. R110 lets the runtime prepare likely next instruments when conditions support it while refusing wasteful speculative work when the user, browser or network context says not to.

## Acceptance

R110 is acceptable only when the full prior invariant chain, R109 deferred topology, the new deterministic working-set policy gate and production Vite/Wrangler verification all pass together.
