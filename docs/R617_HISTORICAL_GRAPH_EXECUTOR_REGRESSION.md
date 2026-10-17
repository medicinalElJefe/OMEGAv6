# R617 — Historical graph executor regression

This release adds `scripts/r617_graph_regression.py`, a source-backed golden-record test for the R616 Python executor.

Original v21 graph record `E00001`:
- conceptual source and target `RH0001`
- type `antipode_state`, weight `0.2`
- original workbook row IDs `5991 → 16473`
- canonical zero-based addresses `5990 → 16472`
- runtime SQLite node IDs `node_005991 → node_016473`

The regression checks the exact returned record, type filtering, mixed-edge queries, and fail-closed behavior for out-of-range/noninteger addresses and unsupported `coupling` edge requests.

```sh
python scripts/r617_graph_regression.py OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip
```

This test **requires the actual donor archive** (source SHA pinned in R615) and `openpyxl`; no source-data substitutes or CI skips are silently counted as a source-backed PASS. The archive remains outside GitHub. The source workbook's E00001 record and all 416 edge-reference relationships were independently checked directly in the original archive before authoring this regression.

**Status:** test committed; full R617 test execution in an environment containing the original donor and deployment admission still require verification. This is a Python executor regression, not a claim of live OMEGA browser execution.
