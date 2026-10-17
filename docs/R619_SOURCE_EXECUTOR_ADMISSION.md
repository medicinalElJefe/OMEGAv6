# R619 — Source + executor proof receipt

`scripts/r619_admit_historical_graph.py` is the mandatory, fail-closed admission entry point for the archived v21 RH graph executor.

```sh
python scripts/r619_admit_historical_graph.py /secure/path/OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip /tmp/omega-rh-graph-admission.json
```

The script requires the **actual original donor ZIP**, checks its pinned SHA-256, all 416 workbook graph edges and 20,736 SQLite node/state joins via R615, then executes R617/R618 golden traversal and invalid-input regressions. Only after both succeed does it atomically write a structured JSON PASS receipt with source hash, graph counts, regression identifiers, timestamp, and truth class. Existing receipt files are invalidated at the start; missing/corrupted donor or failing regressions produce **no PASS receipt**. It never writes to the donor path.

This is a **local source-and-executor receipt** only, with `production_deployment_verified=false`. It is not a replacement for a deploy-main exact-SHA promotion receipt, live browser verification, or recovery of 10,368 separate coupling edges. Repository CI without the original donor is **not** sufficient to assert R619 admission passed.

The original source was independently inspected for E00001 and E00002 row IDs and weights; the newly composed R619 admission CLI still requires its own explicit execution and receipt collection before claiming success.
