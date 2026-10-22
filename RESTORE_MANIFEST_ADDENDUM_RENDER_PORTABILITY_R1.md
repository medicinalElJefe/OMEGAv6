# OMEGA Restore Manifest Addendum — Render Portability R1

## Donor authority
Connected Drive contains preserved QtSvg, QtSvgWidgets and svgLib donor directories. Exact Drive folder IDs retained in `src/renderPortabilityRuntime.ts` include QtSvg `11i6qdBfycfmUklESHDNHZ3nLR40-KA8L`, QtSvgWidgets `1CTNqmaNsYtqcSrGn0qrrM6xg4WQipxY3`, second QtSvg `1pgOTQaScm3fwEele8tkBgOF5DUfgd2L8`, and three svgLib directories `1UA1vx2A0dayGMRZTks4S-AUornaQMHZT`, `14m9oNeykDrUCNLwQyFlDy6oaDvod6gBu`, `1pX-qbyw4dv68bAmOOJKeuwfR3if9HDwJ`.

Drive exposes PySide6 QtSvg/QtSvgWidgets header evidence in the Qt donor directories. These artifacts are classified as native donor evidence, not as hosted Worker execution.

## Exact/adapted restoration
- Browser vector renderer remains the portable active SVG renderer.
- SVG export now runs namespace, viewBox, state-marker and DOM parser round-trip checks before download.
- Each successful/held validation compiles an `OMEGA_RENDER_PORTABILITY_QTSVG_R1` receipt.
- The receipt carries the six exact donor directory identities and `nativeQtExecutionVerified=false`.
- Native Qt rendering is never represented as executed from the Worker without a separately verified native runtime.

## Surpass delta
Prior hosted SVG export downloaded the DOM serialization directly. R1 adds an explicit round-trip validation gate, donor lineage receipt and regression lock while preserving standard browser SVG portability and avoiding any Qt/AppDeploy runtime dependency.

## Boundary
The 20,736 vector field is a representational/runtime state instrument. QtSvg/svgLib donor presence does not establish a new physical dimension count or prove native Qt/Windows execution.
