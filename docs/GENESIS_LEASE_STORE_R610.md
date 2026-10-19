# Genesis R610 — SQLite single-use lease store
The lease adapter relies on SQLite PRIMARY KEY uniqueness and INSERT OR IGNORE to provide an atomic winning insertion when backed by a real SQLite database. No execution occurs.
The contract test uses an in-memory mock; it does **not** prove concurrent multi-process SQLite behavior, disk durability, power-loss recovery, or independent issuer trust.
## Required production controls
1. Persist DB outside ephemeral worker memory; configure SQLite WAL/synchronous policy according to durability requirements.
2. Verify the independent issuer's signature and policy **before** passing validated=true; never let an untrusted agent set that flag.
3. Enforce OS-level sandbox and capability restrictions before executing anything.
4. Make the insertion and action dispatch recoverable; a consumed lease does not prove action completion.
5. Test simultaneous consumption with separate SQLite connections, restart, crash between consume and dispatch, replay, wrong worker, and expired authority.
6. Do not promote until exact-head CI and production execution receipts are proven.
