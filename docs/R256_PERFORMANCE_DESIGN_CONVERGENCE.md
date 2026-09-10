# R256 Performance + Design Convergence

R256 is additive over production-green R255. It improves runtime efficiency, operator responsiveness, and Hybrid information density without changing execution, promotion, deployment, or Canon authority.

## Runtime performance
- R238 remains the single atomic Hybrid/Mission polling owner.
- Active jobs/missions use a 1.2 s observation cadence for more responsive execution motion.
- Stable/idle state backs off to 5 s, reducing unnecessary Worker/API/browser work.
- Browser focus and network-online events immediately refresh the shared snapshot after interruption.
- Mission/job correlation uses an indexed job map rather than repeated linear lookups.

## Rendering/design performance
- Heavy below-fold Hybrid surfaces use CSS `content-visibility:auto` with intrinsic sizing so layout remains stable while deferred sections avoid unnecessary paint/layout cost.
- Touch controls use manipulation semantics, mobile density is tightened, and reduced-motion users avoid expensive or distracting transitions/animations.

## R255 telemetry continuity
R255's authenticated Hybrid experience ledger remains intact and provides the longitudinal run corpus needed for later empirical performance calibration. R256 does not fabricate telemetry-driven tuning that is not yet wired; it establishes lower-overhead observation and rendering behavior on top of that ledger.

## Preserved truth boundaries
- One shared R238 epoch remains authoritative for R212/R237/R238/R239.
- Stale snapshots remain fail-closed.
- R147 dispatch, R141 return closure, R240 source promotion, ci.yml production deployment, and R125 CanonState admission are unchanged.
