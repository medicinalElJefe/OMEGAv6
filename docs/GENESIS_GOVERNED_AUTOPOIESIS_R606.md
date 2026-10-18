# Genesis R606 — governed autopoietic kernel
Genesis extends OMEGA's canonical developmental system; it is not a competing authority or replacement UI.
## Current implementation
Pure deterministic TypeScript module `genesis/kernelR606.ts` implements source-backed observations, bounded proposal admission, human-approval checks, append-only hash-linked receipts, and contradiction/scar carry. `tests/r606-genesis-governance.mts` supplies negative controls.
## Security and truth boundary
This is an in-process decision-support kernel, **not** an independently enforced security boundary. A caller can modify inputs; signatures, trusted identity, external policy enforcement, persistence, physical telemetry, real consent, and production deployment remain unimplemented. SHA-256 chaining detects tampering against a separately trusted head; it does not make storage immutable or authenticate authors.
## Next integration gates
1. Run `npx tsx tests/r606-genesis-governance.mts` and project regression tests on exact head.
2. Integrate read-only observations through existing source-backed ingestion and ledger, with retention/privacy controls.
3. Attach real human approval identity and revocable execution leases via independent enforcement.
4. Link to the existing capability graph and canonical release controller; require deployed behavior proof.
5. Expose proposal/alternatives/uncertainty in existing OMEGA UI, without substituting a new dashboard.
6. Permit only opt-in, reversible, measured pilot interventions. Keep infrastructure control out of scope until independently governed.
## Woven continuity
Partition → exchange/transform → invariant carry → scar/history carry → re-contextualize/repartition. Atlas addresses are representational, not physical dimensions.
