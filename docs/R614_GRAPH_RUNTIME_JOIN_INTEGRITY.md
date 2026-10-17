# R614 — Full-source join and graph identity integrity

**Inspected original bytes:** Drive v21 donor `1yDFcTO9_f2sdmGC-INRpV-LMQb1n4E_v` (archive SHA-256 `e2493bfee552322adf29a79a80a86d3a46aba84a4ccde01aa56b7e4e9c518c8c`). Direct read of embedded `atlas_runtime.db` and `data/canon_sources/Math_Atlas_20736D_FullCanon_GraphEdges.xlsx`; graph workbook member SHA-256 `1daa73b90ab07453141056e74db1a5488232ef871eef83033f1aa0f5d45631a5`.

## SQLite complete-record integrity

- `atlas_nodes`: 20,736 rows, primary key `node_id`, no duplicate node IDs.
- `runtime_state`: 20,736 rows, primary key `node_id`.
- Both left-anti-joins are empty: **0 atlas nodes without runtime state**, **0 runtime states without atlas nodes**.
- All 20,736 simplex triples satisfy sum in `[0.9999999999999996,1.0000000000000002]`; each individual lambda has positive minimum (~`2.85e-10` or higher).
- Source coordinate ranges: x `[-0.12499999920297095,1.173205079930852]`, y `[-0.16999999975325863,0.9482978160627951]`, z `[-0.8461538461538461,0.8461538461538461]`. Do not impose an invented unit-ball constraint.
- Historical decision-state distribution is **20,707 ESCALATE**, **29 TURN**, **0 STAY**. This is a source snapshot, not evidence that the runtime currently recomputes those decisions.

## Graph-edge semantics: important correction

The graph workbook's `Graph_Edges` sheet contains **416 distinct typed edges**: **320 `antipode_state` records** (weight `0.2`) and **96 `prereq` records** (weight `1`). No edge has missing ID, source, destination or type; no duplicate `(FromNodeID,ToNodeID,EdgeType)` triples.

**The graph endpoints are `RH0001`-style conceptual nodes, not SQLite `node_000001`-style runtime nodes.** The 320 `antipode_state` records are self-referential in their conceptual `FromNodeID/ToNodeID` columns, while their `FromRowID/ToRowID` columns carry distinct state-address references. They are not 320 conventional self-loops in the 20,736-state topology.

The graph workbook has an `RH_Index` table with 320 conceptual nodes and columns `NodeID`, `RowID_20736`, `Anti_RowID`, and `PrereqIDs`; `Seed_Index` separately contains 200 seed concepts. **Do not join graph `RH0001` endpoints directly to SQLite `node_000001` by suffix.** A validated translation must first reconcile workbook RowID_20736 semantics with database `base_state_id/d/p/r/shell` and the separate Time Mandala 0-based address convention.

## Remaining proof gates

1. Verify all 416 graph endpoints against `RH_Index.NodeID`, and compare edge row IDs to `RH_Index.RowID_20736` and `Anti_RowID` with type-aware rules.
2. Verify whether `RowID_20736` maps to SQLite `node_id` and/or its `base_state_id`; do not assume identity from numerical suffix.
3. Build a source-backed, typed translation table with explicit failure for missing/mismatched references before using these records in rendering or traversal.
4. Preserve the missing 10,368 coupling-edge dataset as unresolved. Enforce exact deployed SHA, browser behavior and historical visual-fidelity proof separately.

**Truth class:** FULL DATABASE JOIN CHECK + NUMERIC RANGE CHECK + GRAPH TYPE/IDENTITY AUDIT; CROSS-LINEAGE GRAPH→RUNTIME ADDRESS MAPPING UNPROVEN; DEPLOYMENT UNVERIFIED.
