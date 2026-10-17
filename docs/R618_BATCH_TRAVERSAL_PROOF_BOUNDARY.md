# R618 — Bounded source-gated batch traversal

The historical R616 executor now supports `traverse_many(donor, addresses, kind=None)`, using **one complete R615 donor admission** per batch instead of rehashing and revalidating the 162 MB archive for each address.

The batch API rejects unsupported relationship types, non-integer/bool/out-of-range addresses, non-list inputs and batches exceeding 20,736 entries. It preserves duplicate input order and returns separate results for each requested address. No graph relationships are synthesized.

`scripts/r617_graph_regression.py` now covers original archive edges `E00001` (row `5991→16473`) and `E00002` (row `18087→7833`) as a multi-address query, plus duplicate-address and malformed batch tests.

**Deployment-first boundary:** the archive is not included in the browser build; this API remains Python-side until an authenticated governed backend can admit source bytes, publish versioned proof receipts and expose a bounded route. No live UI integration, 10,368 coupling-edge recovery or production deployment is claimed. CI success alone does not prove the donor-required regression ran; execute it with the original archive and retain its output before promotion.

Run: `python scripts/r617_graph_regression.py /path/to/OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip`.
