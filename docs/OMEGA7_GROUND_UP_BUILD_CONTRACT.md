# OMEGA7 Ground-Up Build Contract

OMEGA7 is a controlled successor reconstruction over the proven OMEGAv6 lineage. It is **not** a rewrite of the accepted engines and it does not retire an OMEGAv6 capability simply because a cleaner presentation exists.

Baseline lineage: `8667f86ca954a1ff8092a4fd1c3aaf79ef0bfe19` (R436 merged main).

## Permanent architecture

```
OMEGAv6 proven engines / authorities
        ↓
OMEGA7 compatibility adapters
        ↓
one capability registry
        ↓
one application/session state authority
        ↓
one task runtime + one shell compositor
        ↓
Standard / Advanced / Canon presentation projections
```

Presentation never becomes a second state authority.

## Inheritance gate

The existing 44 registered OMEGAv6 routes are a frozen inheritance set for the first OMEGA7 reconstruction. The number 44 is an inventory checkpoint, not an architectural ceiling.

Every inherited capability receives a persistent OMEGA7 ID. A legacy surface may be retired only when all of the following are true:

- adapter status is PROVED;
- functional parity is proved;
- desktop behavior is proved;
- mobile/touch behavior is proved;
- failure/recovery behavior is proved;
- performance budget is proved.

Until then, the OMEGAv6 surface remains available.

## User-facing navigation

OMEGA7 presents six stable human domains:

1. Home
2. Work
3. Explore
4. Create
5. Develop
6. System

This presentation is a projection over the complete inherited capability registry. It does not delete or rename the underlying legacy identity.

Universal search/command access remains the complete capability entry point.

## Workspace law

OMEGA7 owns one shell and four layout classes:

- DOCUMENT
- CANVAS
- ANALYSIS
- CONTROL

Capabilities mount inside the shell through adapters. They do not own global navigation, global drawers, global z-index policy, or page scrolling.

The main workspace is the single page-scroll owner. Nested scrolling is reserved for explicit inspectors, tables, logs, or code panes.

## State law

Global application state contains:

- current human domain;
- current capability identity;
- current legacy route binding;
- project;
- task lifecycle;
- health;
- command palette state;
- inspector/diagnostics state;
- presentation depth.

UI state has `canonicalMutation:false`.

R125 remains the CanonState admission authority. R436 remains the canonical domain-resolution spine inherited from OMEGAv6.

## Reliability law

Every capability lifecycle must resolve to one of:

`READY | BUSY | DEGRADED | HELD | OFFLINE | FAILED`

OMEGA7 forbids:

- shell crashes caused by one capability;
- blank failure screens;
- silent button failures;
- infinite spinners;
- lost last-good state on transient provider failure when safe;
- device-offline state being reported as a whole-system failure;
- presentation state mutating CanonState.

Each capability mount sits behind a failure boundary. Failure offers a reason and recovery path.

## Human translation

OMEGA7 may translate technical resolution state into contemporary language while retaining the complete R436 packet.

Examples:

- `RESOLVED / ACTIVE` → supported result;
- `BOUNDED` → multiple possibilities remain;
- `OBSERVE_ONLY` → more evidence needed;
- physical/canon rejection → path rejected, reason retained;
- `INCONSISTENT` → current data/model do not reconcile.

Advanced and Canon views expose the exact proof class, authority, branch state, scars, ledger hash, and internal calculus.

## Build phases

### Phase A — Freeze
Capture capability identity, authority, route, engine, provider/device boundary, accepted proof, and current inheritance state.

### Phase B — Kernel
Build the OMEGA7 capability registry, state reducer, health model, compatibility adapters, one shell, one command palette, one inspector, one diagnostics surface, and design tokens.

### Phase C — First vertical slice
Migrate a complete family through the new shell. Earth/weather is the preferred first slice because it exercises source data, live refresh, visualization, degraded states, mobile behavior, evidence, and R436.

### Phase D — Family migration
Move coherent families rather than random screens:

- Earth/weather;
- motion/traversal;
- science/spectral/atomic;
- creation/rendering;
- software/build/evolution;
- Hybrid/device/cloud;
- memory/evidence/governance;
- system/archive/plugins/settings.

### Phase E — Parity
No legacy surface retires before the inheritance matrix proves parity.

### Phase F — Product polish
Only after parity: onboarding, animation, visual refinement, additional human-language translation, and optional research visualization.

## Release gate

An OMEGA7 release cannot promote unless all exposed primary experiences prove:

- build/type/runtime integrity;
- no broken primary controls;
- no unhandled runtime exceptions;
- no inaccessible inherited capability;
- mobile and desktop containment;
- failure/retry behavior;
- source/execution/proof authority separation;
- no silent capability regression;
- bounded performance budget.

OMEGA7 exists to make the accumulated OMEGA capability corpus understandable, enjoyable, and reliable without reducing its computational or research depth.
