# R408 · Work-conserving proof-runtime convergence

R408 changes proof orchestration, not proof meaning.

## Problem

R241/R313 used deterministic shards but executed them in fixed four-shard waves. Three completed workers could sit idle behind one slow shard until the entire wave finished. The workload partition was also seeded from one R355/R286 timing census and reused across disclosure, full-control interaction and no-dead-control proofs even though those proof classes exercise different browser behavior.

## R408 law

Preserve the complete deterministic partition and every child assertion, but schedule unresolved proof burden work-conservingly:

1. order shards by predicted remaining work;
2. launch up to the existing bounded concurrency limit **and** the proof-class resource budget;
3. when any child finishes, immediately launch the next unresolved shard that fits the remaining resource budget;
4. never exceed the existing worker cap;
5. fail closed if any shard fails, times out, is missing, or is duplicated;
6. append observed runtime into a class-scoped scar ledger.

No acceptance criterion is removed or weakened.

## Separate workload state

R408 separates runtime estimators into:

- `disclosure`
- `interaction`
- `no_dead_control`

All three begin from the inherited R355 measured route/viewport census. They do not pretend to have distinct empirical priors until observations exist. Each class appends its own observed shard runtimes and updates a bounded EWMA with alpha=0.35 while retaining the full observation history. Failed transport/browser samples remain in that history as scar evidence but do **not** train the timing EWMA.

GitHub Actions cache restores the latest job-scoped scar ledger when available. Updated scar ledgers are also retained as diagnostic artifacts. The scar ledger is scheduling evidence only; it has no CanonState, source, deployment, promotion or observation authority.

## Preserved proof boundaries

- R313 full interaction remains 16 deterministic shards, hard cap 4, resource cost 2/4 per heavy browser shard (effective at most 2 simultaneously), 480s child ceiling, 1500s parent ceiling.
- R313 disclosure remains 16 deterministic shards, hard cap 4, resource cost 2/4 per heavy browser shard (effective at most 2 simultaneously), 360s child ceiling, 1320s parent ceiling, followed by the unchanged R318 viewport/reload proof.
- R286 no-dead-control remains 8 deterministic shards, hard cap 4, resource cost 2/4 per browser shard (effective at most 2 simultaneously), 360s child ceiling, 780s parent ceiling.
- The complete 44-route × desktop/mobile address space remains 88 unique cases.
- Existing browser assertions, route/state checks, accessibility, overflow, page-error, guard and mutation boundaries remain unchanged.
- No source authority, CanonState, Worker deployment, proof-return or physical-claim boundary changes.

## Expected effect

The scheduler removes artificial wave barriers. If one shard is slower than its peers, completed capacity is reused immediately rather than remaining idle. Longest predicted shards start first, and future scheduling can incorporate retained proof-runtime scar evidence without deleting the prior census.

R408 is intentionally limited to proof-runtime convergence. The preserved Exact-v3 Atlas360/Earth propagation remains the next additive integration after this runtime repair proves clean.

## R408.1 evidence correction

The first real R408 browser run proved the wave-barrier removal but also exposed a separate contention scar: four heavy disclosure shards concurrently hitting one preview caused Playwright click timeouts on controls that were already reported visible, enabled and stable. The correction is resource-aware rather than a retreat to fixed waves. Heavy browser proof classes now consume two units of a four-unit preview/browser budget, so the scheduler remains work-conserving while preventing overload-induced false red outcomes. The initial R408 proof allowed no-dead-control at 1/4 cost. R409 exact-head evidence later showed the same shared-preview contention class there: a navigator click completed but timed out waiting for scheduled navigation while four R286 shards were active. The inherited correction therefore assigns no-dead-control the same 2/4 browser-resource cost, preserving work conservation with at most two browser shards concurrently.
