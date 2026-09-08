# OMEGA SAR Accumulation Studio

Standalone measured-first SAR acquisition chronology and accumulation instrument.

## What it does

- Queries the ASF Search API with `dataset`, UTC time bounds, product level, maturity, orbit direction, polarization, relative orbit, and optional WKT AOI.
- Accepts imported GeoJSON for reproducible/offline playback.
- Normalizes acquisition metadata into a stable evidence contract and de-duplicates by product identity.
- Animates exact acquisition chronology in **single-acquisition** or **accumulation** mode.
- Draws Polygon/MultiPolygon footprint geometry with dateline-aware unwrapping.
- Computes point-based hit count and revisit intervals from actual acquisition timestamps.
- Grades evidence: **A** only when precise-orbit evidence is declared in source metadata, **B** for authoritative ASF geometry/time without separately bound precise ephemeris, **C** for unverified imports/missing authority.
- Exports a deterministic proof manifest with a SHA-256 digest over canonicalized acquisition content.
- Warns when NISAR BETA and PROVISIONAL maturity are mixed.

## Scientific semantics

1. A catalog/product footprint is **coverage geometry**, not a calibrated SAR pixel array.
2. An animation frame is **display state**, not a new observation.
3. Interpolation is never added to the evidence ledger.
4. InSAR displacement is not claimed unless a future processing layer supplies an actual interferometric product and provenance.
5. NISAR PROVISIONAL data are calibrated but partially validated; mixing them with earlier BETA products is explicitly flagged.

## Run

```bash
npm test
npm run check
python -m http.server 8765
```

Then open `http://localhost:8765`.

Because browser security/CORS policy can change, the app also supports direct import of ASF GeoJSON. The exact ASF query URL is always shown and exported in provenance.

## ASF references

- Search API: https://docs.asf.alaska.edu/api/keywords/
- NISAR availability: https://nisar-docs.asf.alaska.edu/availability-overview/
- NISAR products: https://nisar-docs.asf.alaska.edu/products-overview/
- NISAR provisional known issues: https://nisar-docs.asf.alaska.edu/provisional-known-issues/
- NISAR orbit ephemeris: https://nisar-docs.asf.alaska.edu/orbit-ephemeris/

## Next processing boundary

This package is intentionally the acquisition/evidence animation layer. A later raster processor can bind calibrated GCOV/RTC/GSLC/RSLC assets, pixel-value legends, DEM/geocoding metadata, and real InSAR pair products while preserving this evidence contract.
