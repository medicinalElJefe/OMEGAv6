# OMEGA R109 — Route-Deferred Specialist Fabric

R109 converts the R103 cache-oriented application partition into actual route-deferred specialist loading while preserving the same application, route registry, canonical state and specialist behavior.

## Why this upgrade exists

R108 production verification succeeded, but the build still reported circular application chunks created by manual cross-import groupings such as `omega-runtime-intelligence`, `omega-evidence-system`, `omega-specialists`, `omega-explore` and `omega-earth-forecast`. Those groups improved cache identity but did not make statically imported specialist code truly route-deferred.

R109 removes application-level manual chunk ownership and lets dynamic imports define the specialist boundaries. Manual Rollup chunking now controls vendor families only.

## Authority that stays eager

R109 keeps the following eagerly available because they are product/state authorities rather than optional specialist views:

- canonical corpus/state/calculus and source-backed mode summaries;
- `OMEGA_SURFACES`, `normalizePanel` and workstation `go()` route/state authority;
- responsive runtime shell and navigation context;
- Surface Integrity / error containment;
- R85 workflow and R108 capability continuity;
- operation-proof bus and durable project continuity;
- command instrumentation and phase/timing context.

The specialist loader is explicitly not a router and cannot mutate CanonState.

## What becomes route-deferred

Heavy specialist UI modules now use `React.lazy` + dynamic `import()` through `specialistLoaderR109.tsx`, including:

- Earth and Forecast;
- Matter, Visual, Traversal and Extreme Traversal;
- Relativity, Atlas, Infinity, Scale and Reality Lab;
- Hybrid, Workspace/Cockpit, SAI/Intelligence;
- Archive, Quality/Validation, System Atlas/Control Matrix;
- Build Out, Plugins, Modes and the general Specialist Suite.

Deep donor modules `OmegaVisualInstrument`, `OmegaTraversalStudio` and `MatterTraversal` remain recoverable through deferred donor loaders rather than forcing them into the eager workstation bundle.

## Bounded prefetch

When an operator selects a route, OMEGA may begin fetching that specialist module before React renders it. An active workflow may also prefetch the bounded next workflow route and up to two routes from the R108 capability plan.

Prefetch means **module bytes only**. It does not:

- invoke a capability;
- contact Optical, Genesis, Sovereign Compute or another external backend;
- claim PC/native execution;
- mutate CanonState;
- create evidence or satisfy proof;
- admit a result.

## Loading experience

A specialist that is still arriving renders through a normal-flow `Suspense` fallback showing the current route, state and address. The fallback is responsive and intentionally does not use fixed or absolute container positioning, so it cannot cover the primary instrument as an opaque global overlay.

## Build topology

`vite.config.ts` keeps vendor-only manual groups for React, icons and other dependencies. Application modules are no longer forced into cross-import manual chunks. Dynamic import boundaries now determine specialist packaging.

The governed build receipt reports `R109_ROUTE_DEFERRED_SPECIALISTS` and explicitly separates code-byte readiness from execution truth.

## Acceptance

R109 is acceptable only if the entire existing test chain remains green, all registered surfaces retain one mount owner, deep donors remain reachable, the R108 capability membrane remains intact, no route/state authority is duplicated, the production build succeeds and the resulting build removes the previous manual application circular-chunk warnings.
