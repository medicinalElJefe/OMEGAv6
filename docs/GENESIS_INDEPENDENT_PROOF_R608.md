# Genesis R608 independent-proof boundary
R608 adds Ed25519 signature verification for externally issued human decisions, including principal identity, scope, validity window, key revocation flag, nonce replay check, and a deterministic signed payload. It also adds an evidence-envelope continuity check.
## Critical constraints
- The verifier's key registry, revoked-key status, and used-nonce set MUST be trusted, persistent, and enforced outside any self-modifying Genesis worker.
- Successful signature verification does not authorize a physical action, modify production state, or prove a human is the private-key holder. Identity enrollment and human intent need independent verification.
- Evidence envelopes contain hashes and metadata, not independent proof that their source claims are true.
- No server API, storage, browser interface, production integration, or deployment claim is made.
## Exact-head test
Run `npx tsx tests/r606-genesis-governance.mts && npx tsx tests/r607-genesis-cycle.mts && npx tsx tests/r608-genesis-independent-proof.mts`.
Then execute the existing full project CI, deploy through the real target, and verify production behavior before admission.
