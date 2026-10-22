# R447 · OMEGA7 Failure / Recovery / Performance Proof

R447 proves product conditions that 44-route reachability alone cannot establish.

## Failure containment

The exact built browser proof injects a real lazy JavaScript chunk failure after the OMEGA7 shell is already running. The capability must fail inside `Omega7Boundary`, the shell must remain alive, the user must be told that their OMEGA state was not discarded, and another capability must still open afterward.

A separate mobile proof aborts API requests while opening Hybrid Link. The interface must fail closed: API loss may show degraded, held, offline, proof-required, or unavailable state, but it may never fabricate `PC ONLINE`.

## Performance budgets

The existing 500 KiB uncompressed initial-entry budget remains mandatory. R447 adds exact-built browser budgets:

- shell ready ≤ 4000 ms;
- representative route ≤ 8000 ms;
- representative route p95 ≤ 6000 ms.

Representative routes span Command, Earth, Traversal, Relativity, Forecast, Workspace, Hybrid, and Evidence.

These are controlled CI budgets, not public-network latency claims.

## Workflow authority

R447 adds a job to the existing **OMEGA Cloud Bridge CI** workflow. It does not create a new active workflow authority.

## Retirement

Passing R447 proves the failure/recovery and performance gates at the product-shell level. OMEGAv6 remains rollback until reversibility is separately proved.
