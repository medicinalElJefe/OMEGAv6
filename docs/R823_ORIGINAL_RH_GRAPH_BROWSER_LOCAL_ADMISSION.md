# R823 — Original v21 RH graph into the existing Visual Instrument

## Source and authority

The current **R621 Historical RH Graph** panel is already mounted inside OMEGA7's existing Visual Instrument and can traverse two independently admitted original examples. The original v21 donor proves more: 320 distinct RH conceptual nodes and 416 typed edges, of which 320 are \`antipode_state\` and 96 are \`prereq\`.

This release adds **browser-local source-byte admission** without bundling historical source data into the public repository or creating a parallel backend, route, scene engine, or Canon authority. The user selects the original \`Math_Atlas_20736D_FullCanon_GraphEdges.xlsx\`. The browser checks its full 2,150,619-byte SHA-256 against the previously independently inspected R614 archive-member hash:

\`1daa73b90ab07453141056e74db1a5488232ef871eef83033f1aa0f5d45631a5\`

The authenticated historical ZIP's recorded SHA is \`e2493bfee552322adf29a79a80a86d3a46aba84a4ccde01aa56b7e4e9c518c8c\`. The browser verifies only the **XLSX** and does not pretend to have read \`atlas_runtime.db\` or authenticated current host actions. The ZIP and full workbook bytes are **never uploaded, bundled, persisted or sent to the Worker** by this instrument.

The existing \`readXlsxLite\` R153 OOXML parser now accepts an optional exact named sheet; its original first-sheet behavior remains unchanged. R823 reads \`RH_Index\` and \`Graph_Edges\` after exact SHA admission and enforces their complete original row/header contracts, coordinate/radix-12 mapping, concept identities, 416 unique typed relations and their separate source/target state row semantics.

## Source finding: 320 concepts map to 25 distinct Atlas addresses

The workbook contains **320 concept identities mapping to only 25 unique 1-based source rows**, with up to **45 distinct concepts sharing one source row**. These are legitimate many-to-one conceptual projections, not duplicate node identities. R823 preserves all 320 RH IDs and separately retains their 0-based canonical address translation. Conceptual \`antipode_state\` edges are self-referential at the RH concept layer, but **change state row**; they are not runtime self-loops. Prerequisite edges bind two different conceptual IDs and their corresponding state rows.

The validated R823 data is held in React state **only for the current browser session and while the panel is mounted**. After import the existing \`onAddress\` Visual Instrument authority navigates every source-recorded edge, with an optional typed edge filter. A rejected or subsequent changed import immediately removes prior full-graph status. Without the exact donor workbook, R621's two independently sourced golden examples remain available. Unmatched addresses in this limited R621 preview are **not** proof that the historical corpus has no edges.

## Verification

- \`npm run test:r823\` is added ahead of the inherited \`npm run check\` chain. It exercises full-size **explicitly synthetic** 320/416 fixtures including 320-to-25 many-to-one mapping, canonical radix, antipode and prerequisite row semantics, duplicate-ID/edge, forged source/target, invalid weight, and original-workbook exact-byte/SHA refusal. Synthetic fixtures are never claimed as historical donor proof.
- R622 desktop/mobile Playwright retains both original golden sample traversals and adds browser import refusal for wrong-length as well as **same-length forged XLSX**, ensuring synthetic data cannot gain v21 provenance.
- The actual original XLSX SHA is independently documented in R614; source parsing and full graph normalization must still be exercised with the actual original workbook before claiming complete R823 end-to-end positive import proof on a specific deployed client. A public CI run without private donor bytes cannot substitute for that last user-file import.
- Release eligibility remains source tests + inherited exact-head CI, build/dry-run, guarded merge, exact-SHA Worker promotion, live route/browser controls, sequential R223 and rollback eligibility. No automated release acceptance before proof.

**No new physical primitive.** 20,736 is an address-space cardinality; the separately claimed 10,368 coupling-edge graph, full historical native renderer, SQLite runtime execution, empirical dimensionality, original Time Mandala equivalence, physical Windows/GPU execution and R125 CanonState admission remain independently gated.
