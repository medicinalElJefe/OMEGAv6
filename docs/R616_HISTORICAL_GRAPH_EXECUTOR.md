# R616 — Historical typed graph execution (source-gated)

`scripts/r616_historical_graph.py` adds an actual executable traversal over the **416 original typed RH graph records**. It accepts a canonical zero-based address, runs the complete R615 source SHA/SQLite/graph validation first, then returns outgoing historical edges translated from one-based workbook row IDs to zero-based runtime addresses.

```sh
python scripts/r616_historical_graph.py OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip 0
python scripts/r616_historical_graph.py OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip 0 antipode_state
```

Each returned edge retains `source_concept`, `target_concept`, `kind`, `weight`, original `source_row`/`target_row`, translated `source_address`/`target_address`, and exact `node_XXXXXX` SQLite IDs. Only `antipode_state` and `prereq` are accepted; unsupported edge types, out-of-range addresses, invalid source hash or malformed donor records fail closed.

**Boundary:** This is a runnable **Python source-gated executor**, not yet a browser-side OMEGA runtime integration. It requires the original donor ZIP and `openpyxl` and does not package historical data into the frontend. The conceptual RH graph is distinct from the Time Mandala's seven-star semantics. No 10,368-edge coupling dataset or physical matter simulation is implied.

**Admission still required:** exercise source-backed traversal with known expected outputs, expose an authenticated and bounded runtime route if appropriate, add desktop/mobile integration tests, merge, deploy exact SHA and verify live behavior.
