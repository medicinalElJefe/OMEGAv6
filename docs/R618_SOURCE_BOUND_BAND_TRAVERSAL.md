# R618 — bounded, reversible source-band address traversal

This increment adds a **real, deterministic arithmetic executor** over the 12^10 historical *representational address space*. It does not execute historical Substrate/Traversal/Observer/Renderer modules, recover a physical spacetime simulation, instantiate 61,917,364,224 states, or mutate Canon.

- `traverseCorpusBandR618({address, offset, wrap})` performs exact safe-integer input validation, BigInt addition/modulo, base-12 decode, 12x12 band identification, crossing detection and SHA-256 receipt construction. Out-of-capacity movement is rejected unless `wrap:true` is explicitly authorized. Negative offsets and multi-turn wraps are supported.
- `verifyCorpusBandTraversalR618` re-executes the same input and checks the deterministic receipt, refusing tampered or mismatched results.
- `traverseOriginalSourceBandR618({engineeringRecords, address, offset, wrap})` requires the **full original 144-row engineering record set** to pass R617S's independently pinned ledger before it produces a source-bound receipt. Its public receipt carries only the ledger fingerprint and source/destination module labels; it does not expose original Notes, Build Interpretation, rows, or source bytes.
- `verifyOriginalSourceBandTraversalR618` re-executes the source-bound transition to reject altered receipts.

CI tests exact boundary crossings, reverse traversal, unauthorized overflow/underflow refusal, explicit wrap, multi-turn wrap, invalid unsafe inputs, deterministic receipt verification, and missing-source refusal. The tests do **not** include the private workbook. Local arithmetic tests were executed with dependency-compatible stubs; canonical CI must test the exact repository modules. Original-byte execution of the source-bound path remains a separate private-data gate.

This is a small operational step from source-only atlas descriptions toward typed, proof-carrying traversal. OMEGA 7 presentation binding, full developmental continuity calculus, actual historical executors, live deployment, and native-host proof remain separate acceptance gates. Do not claim these are restored by this increment.
