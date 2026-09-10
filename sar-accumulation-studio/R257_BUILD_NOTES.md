# R257 High-Detail Measured Earth

R257 is a rendering, measurement-detail, loading-flow and workstation-layout promotion of the R256 data-native SAR surface.

- Regional rendering requests 448/640/768 bounded display samples from the actual Sentinel-1 measurement COG according to camera scale, then applies the existing product LUT and source georegistration.
- Exact target rendering starts with a 64-pixel radius real source read and promotes in the background to the existing 128-pixel maximum radius (up to 257×257 actual source samples).
- The exact patch cache includes source radius so an older low-detail patch cannot silently satisfy a higher-detail request.
- Exact source-window georegistration now scales from 6 to 12 blade-mesh segments instead of remaining fixed at four.
- Source terrain context increases to a 384-cell maximum grid and up to z12 Terrarium support, refreshed at camera settlement.
- Main-view dashed regional footprint geometry is removed. Footprint/source provenance remains available in DATA/PROOF.
- Redundant floating HUDs are consolidated into one bounded proof stack; the duplicate data-native badge and normal-mode cell inspector are removed from the main image.
- Loading is progressive: the current source-backed Earth surface remains visible while regional terrain/SAR and deep exact source reads resolve, with one compact stage status in the command strip.

The promotion does not create new SAR observations. Display shaping, DEM relief, Mode 188, Woven Continuity and Ω reconstruction remain provenance-bounded and cannot turn inferred/context values into measured Sentinel-1 pixels.
