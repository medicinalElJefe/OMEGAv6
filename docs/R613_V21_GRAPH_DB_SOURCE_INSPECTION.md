# R613 — Direct inspection of v21 historical graph and runtime database

**Source:** Drive donor `OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip`, file ID `1yDFcTO9_f2sdmGC-INRpV-LMQb1n4E_v`, SHA-256 `e2493bfee552322adf29a79a80a86d3a46aba84a4ccde01aa56b7e4e9c518c8c`. This report examines archive member bytes, not just source-contract metadata.

## Graph-edge workbook
`data/canon_sources/Math_Atlas_20736D_FullCanon_GraphEdges.xlsx` is **2,150,619 uncompressed bytes** and has nine sheets. The `Graph_Edges` sheet is `A1:H417`, comprising **416 edge records** plus a header. Its eight columns are `EdgeID, FromNodeID, ToNodeID, EdgeType, Weight, Note, FromRowID, ToRowID`. `RH_Index` spans `A1:O321` (320 data rows); `Seed_Index` spans `A1:M201` (200 data rows); `States_20736D` spans `A1:CN20737` (20,736 data rows).

This confirms that the 416-edge figure in `src/driveCanonSource.ts` corresponds to a **real, recoverable graph table**. It does **not** establish equivalence to the separate 10,368 coupling edges claimed by the source contract.

## Runtime SQLite database
The archive-root `atlas_runtime.db` is **5,623,808 uncompressed bytes**. SQLite table row counts, read directly:

| Table | Rows |
|---|---:|
| hosts | 3 |
| entities | 1 |
| entity_lineage_events | 0 |
| atlas_nodes | 20,736 |
| runtime_state | 20,736 |

`atlas_nodes` contains `node_id, base_state_id, d, p, r, shell, x, y, z, lambda1, lambda2, lambda3, is_active`. The first record is `node_000001`, `base_state_id=1`, `d=p=r=shell=1`, coordinates `(0.5319064356973796, 0.2712362306399766, -0.8461538461538461)`, and simplex weights `(0.3464952535286505, 0.3403081249234096, 0.3131966215479399)`.

`runtime_state` contains `node_id, continuity, ledger, contradiction, historical_stability, scar, stability_ratio, turn_pressure, decision_state, volatility, provenance_score, last_transition_id, updated_at`. First row `node_000001`: continuity `0.6206886915054738`, ledger `0.11422840183728485`, contradiction `0.3423253989506493`, scar `0.4696908634515498`, stability ratio `0.9043235382278066`, decision `TURN`.

## What is now recoverable
The v21 donor supplies **actual** 20,736-node coordinate/simplex and continuity/contradiction state records and **416 explicit graph edges**, despite lacking the four separately named CSVs. Their values are source-backed archive records. They must be kept under v21/Mode188 lineage and cannot automatically be substituted for the distinct Time Mandala workbook or 10,368 coupling edges.

## Next admission requirements
1. Extract graph records with source row IDs, edge types, weights and endpoints; validate uniqueness, orphan endpoints and duplicate relationships against the workbook's RH/Seed indexes.
2. Verify node/row address semantics, coordinate ranges, simplex normalization and state-to-node joins across all 20,736 records.
3. Establish whether historical motion channels or coupling datasets are actually present in a different donor before enabling cross-lineage visualization.
4. Add bounded, versioned source-backed executor and browser tests without weakening existing production receipt or visual-fidelity gates.

**Truth class:** VERIFIED SOURCE BYTES + TABLE SCHEMA/COUNTS + SAMPLE ROWS. No assertion of production execution, 10,368 coupling-edge recovery or empirical physical dimensions.
