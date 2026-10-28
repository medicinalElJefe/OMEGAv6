# Genesis R609 — content-bound approval and execution hold
The R608 signature covers the proposalId string. R609 binds that signed identifier to an exact hash of the proposal content, rejecting approvals reused after changing actions, scope, risks, alternatives, evidence or observations.
The separate execution-lease verifier checks target worker, proposal hash, scope, time window, and single-use intent. **It is not an execution authorization** because the lease is not yet signed by an independent issuer, consumed atomically in durable storage, or enforced by a host sandbox.
`EXECUTION_GATE=HOLD_UNTIL_EXTERNAL_ISSUER_AND_ATOMIC_CONSUME` is a deliberate hard stop.
Next gates: authenticated issuer, durable nonce/lease consumption, OS-enforced capability restrictions, recovery across worker restart, end-to-end action receipts, exact-head tests, deployment and production proof. Preserve existing OMEGA canonical state and capability lineage.
