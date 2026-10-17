# R620 — First actual original-donor R619 admission PASS

At 2026-10-17T20:43:13.104269Z, the original archived v21 donor (162,687,526 bytes; SHA-256 `e2493bfee552322adf29a79a80a86d3a46aba84a4ccde01aa56b7e4e9c518c8c`) was available in the isolated execution environment. The source-gated R619 admission logic was executed using local copies of the repository's R615/R616/R617/R618/R619 Python modules, reconstructed from the exact GitHub source contents previously retrieved through the GitHub connector.

**Observed stdout:**
```
R617 PASS: source E00001, typed filtering, translated addresses, invalid input controls
```

The resulting `omega.historical-rh-graph-admission.v1` receipt is committed at `docs/evidence/R620_V21_HISTORICAL_GRAPH_LOCAL_ADMISSION.json`. It reports `status=PASS`, 320 RH nodes, 320 antipode edges, 96 prerequisite edges, 20,736 SQLite nodes, 20,736 runtime states and all three named golden/batch regression categories.

**Proven:** the original archived donor passes source integrity and the executable graph traversal/regression logic in a local Python runtime.

**Not proven:** production deployment, server/backend integration, browser behavior, a production executor reading the donor, recovery of the separately claimed 10,368 coupling edges, or an independently fetched main deployment receipt. The admission receipt explicitly sets `production_deployment_verified=false`.

**Follow-on:** make source admission a governed deployable capability with immutable source artifact provenance and a deployment proof receipt; do not silently bundle the 162 MB donor into the client or equate conceptual RH graph semantics with Time Mandala semantics.
