# R447 · OMEGA7 Failure / Recovery / Performance Proof

R447 tests the product conditions that route coverage alone cannot prove.

## Failure containment

The built browser proof injects a real lazy JavaScript chunk failure after the OMEGA7 shell is already running.

The expected result is:

- the capability fails inside `Omega7Boundary`;
- the shell stays alive;
- the user is explicitly told that OMEGA state was not discarded;
- another capability can still be opened afterward.

R447 separately aborts API requests while opening Hybrid Link on mobile.

The expected result is fail-closed behavior. API loss may produce a degraded/held connection state, but it may never fabricate `PC ONLINE`.

## Performance budgets

R447 retains the existing hard initial-entry build budget:

- 500 KiB uncompressed entry code

and adds browser budgets on the exact built preview:

- shell visible: ≤ 4000 ms;
- representative route: ≤ 8000 ms;
- representative route p95: ≤ 6000 ms.

Representative routes span the major families:

- Command Center
- Earth Now
- Traversal
- Relativity
- Forecast
- Workspace
- Hybrid Link
- Evidence & Proof

These are CI budgets, not claims about public-network latency.

## Truth boundary

The proof uses bounded synthetic transport fixtures for selected API states.

Those fixtures test presentation and failure semantics only.

They do not establish live provider, device, GitHub, Drive, or production authority.

## Retirement

R447 still does not authorize OMEGAv6 retirement.

Rollback remains required and separate. Individual capabilities may advance toward parity only after the full proof ledger supports them.
