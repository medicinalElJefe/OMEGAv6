# R612 v21 archive donor inspection — negative control

The archived `OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip` was retrieved directly from connected Drive, file ID `1yDFcTO9_f2sdmGC-INRpV-LMQb1n4E_v`.

- Archive size: **162,687,526 bytes**
- SHA-256: `e2493bfee552322adf29a79a80a86d3a46aba84a4ccde01aa56b7e4e9c518c8c`
- ZIP members: **352**
- Present: `atlas_runtime.db`, `data/workbooks/Mode188_Unified_Runtime_20736D.xlsx`, `data/workbooks/UET_v1_IBL_v3_full_atlas_final.xlsx`, `data/canon_sources/Math_Atlas_20736D_FullCanon_GraphEdges.xlsx`, and five additional canon workbooks.
- `data/seeds/{atlas_nodes,entity_bindings,initial_runtime_state,neighbor_edges,shell_edges}.csv` each has a **12-byte** ZIP member. These are not evidence of populated historical geometry datasets.
- **Absent as exact archive member names or paths:** `coupling_edges.csv`, `state_coordinates.csv`, `simplex_projection.csv`, `144D_spectral_table.csv`.

## Recovery consequence

This specific v21 donor cannot supply the four claimed original CSVs directly. Do **not** synthesize 10,368 coupling edges, import empty seed files as topology, or infer coordinate records from historical count metadata. The included graph-edge workbook and runtime database are legitimate candidates for further schema/row inspection, but their contents and relationship to the four missing CSVs remain unproven.

This is an archive-membership negative control, **not** proof that the datasets never existed elsewhere. Retain both Time Mandala and Mode188 lineage identities and do not equate their address vocabularies.

**Truth class:** ZIP BYTES HASHED + MEMBER LIST VERIFIED; COUPLING DATASET RECOVERY STILL OPEN; PRODUCTION DEPLOYMENT UNVERIFIED.
