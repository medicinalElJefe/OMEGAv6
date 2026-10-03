# R446 · OMEGA7 User-Parity Browser Proof

R446 begins the retirement-prevention proof phase after R445 reaches 44/44 native-adapted route coverage.

It does not retire OMEGAv6.

## Exact built-product proof

R446 builds the candidate, serves the built output, installs the pinned Playwright 1.63.0 browser harness, and then exercises OMEGA7 as a user would.

The proof runs at:

- desktop 1440 × 960;
- mobile 390 × 844.

## Every registered route

The proof derives the canonical 44-route inventory from `navigationRegistry.ts`.

For every route on both viewports it:

1. opens the OMEGA7 command palette;
2. searches the exact registered route;
3. opens the capability through the OMEGA7 shell;
4. requires the OMEGA7 native host to bind that exact route;
5. waits for loading to resolve;
6. fails on a native failure surface;
7. fails on an effectively blank result;
8. returns through the OMEGA7 Back control.

No route is skipped because it is unfamiliar, advanced, or internal.

## Shell proof

R446 also verifies:

- exactly six primary human domains;
- Standard / Advanced / Canon depth switching;
- system-status drawer open / close;
- OMEGA7 shell identity;
- one main scroll owner;
- viewport-height shell containment;
- horizontal overflow within tolerance;
- zero unhandled page errors.

## Bounded transport fixtures

Browser parity uses explicit synthetic UI transport fixtures for selected status/Hybrid/catalog endpoints.

Those fixtures are marked as R446 browser transport evidence only.

They do not prove live provider or native-device execution.

Existing source, Hybrid, Earth, production and release workflows retain authority for those domains.

## Retirement remains forbidden

Passing R446 demonstrates route reachability and shell-level desktop/mobile containment.

It does not, by itself, satisfy the full retirement gate.

The remaining parity dimensions still include:

- deeper primary-control functional parity;
- intentional failure/recovery scenarios;
- performance budgets;
- rollback proof.

OMEGAv6 remains the rollback authority until those gates are separately proved.
