# R615 — Source-backed RH graph → SQLite address translation

Direct source validation of original Drive v21 ZIP (SHA-256 `e2493bfee552322adf29a79a80a86d3a46aba84a4ccde01aa56b7e4e9c518c8c`) established the precise **1-based radix-12** atlas row address:

`RowID_20736 = (((D-1)*12 + (P-1))*12 + (R-1))*12 + L`

This is **not** the zero-based Time Mandala address; conversion requires subtracting 1, and vocabulary identity is not implied.

## Verified against original graph and database

- All **320** RH conceptual nodes' `D,P,R,L` match their `RowID_20736`.
- All **416** graph edges have existing RH endpoints and no duplicate typed endpoint triples.
- All **320** `antipode_state` edges map `FromRowID = RH_Index.RowID_20736`, `ToRowID = RH_Index.Anti_RowID`, weight `0.2`.
- All **96** `prereq` edges map `FromRowID = source RH row`, `ToRowID = target RH row`, weight `1`.
- Every referenced source or antipode row maps to an existing SQLite `node_XXXXXX` whose `d,p,r,shell` reproduce the same radix-12 row ID. All 320 RH source nodes' four coordinates match their corresponding SQLite node coordinates.
- SQLite contains 20,736 nodes and 20,736 runtime states with no unmatched rows in either join direction.

The 320 `antipode_state` edges have the same conceptual RH node on both sides, **but different state row addresses**. Treating them as self-loops at the runtime state level is incorrect.

## Reproducible admission gate

`scripts/r615_validate_graph.py` is a fail-closed validator for the original ZIP. It checks source SHA-256, graph workbook schema, counts, RH radix semantics, typed edge endpoints and row mappings, SQLite joins and address alignment. Run with Python and `openpyxl` installed:

`python scripts/r615_validate_graph.py OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip`

The source archive is intentionally **not** committed into the repository. This validator was also exercised locally against the actual retrieved donor and passed. It does not establish current UI integration, live deployment, physical interpretation or recovery of the separate 10,368 coupling edges.

**Truth class:** ORIGINAL SOURCE VALIDATION PASSED; TYPED RH→STATE ROW MAPPING PROVEN; RUNTIME EXECUTION/PRODUCTION DEPLOYMENT NOT YET VERIFIED.
