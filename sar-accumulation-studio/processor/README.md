# OMEGA NISAR Native Processor

This processor is the native HDF5 measurement layer for the standalone SAR Accumulation Studio. It does not turn catalog footprints, Earth proxy cells, browser imagery, or synthetic test fixtures into SAR measurements.

## Current native product support

### NISAR L2 GCOV

`processor.nisar_gcov` reads the mission HDF5 covariance grids directly from `/science/LSAR/GCOV/grids/frequency[A|B]`.

Supported diagonal intensity terms: `HHHH`, `HVHV`, `VVVV`, `VHVH`, `RHRH`, `RVRV`.

Supported off-diagonal complex terms: `HHHV`, `HHVH`, `HHVV`, `HVVH`, `HVVV`, `VHVV`, `RHRV`.

The diagonal terms remain source NISAR radiometrically terrain-corrected gamma-naught power. A sigma-naught layer is emitted only when the source `rtcGammaToSigmaFactor` exists. The processor also preserves/exports `numberOfLooks`, `mask`, and the derived QA-valid layer.

For current PROVISIONAL polarimetric products, the documented 59-degree relative-phase correction is applied only to the affected off-diagonal terms. Diagonal GCOV intensity terms are not phase-adjusted. Frequency B is explicitly warned because its current systematic radiometric residuals are larger than Frequency A.

### Registered temporal accumulation

`processor.nisar_stack` compiles multiple processed measurement manifests only when every input raster has exactly the same CRS, affine transform, width and height. It performs **no silent resampling**. Grid mismatch is a hard refusal.

Valid registered-stack outputs are:

- observation count;
- temporal mean;
- temporal standard deviation;
- first-to-last measured change;
- latest z-score.

All products are marked derived from a registered measured stack, not new observations, and every source/output carries a SHA-256 binding in the stack manifest.

## CLI

```bash
python -m processor.cli list scene.h5 --frequency A
python -m processor.cli extract scene.h5 output --frequency A --term HHHH
python -m processor.cli stack stack-output output1/*_manifest.json output2/*_manifest.json --product gamma0_db
```

The browser `NISAR native accumulation` panel accepts the generated JSON manifests and GeoTIFF companions for chronological playback and derived-stack inspection.

## Proof boundary

Synthetic HDF5 files under the test suite are unit-test fixtures only. They validate pathing, calibration-layer handling, CRS/grid behavior, phase-correction rules, export semantics and hard refusal behavior. They are never runtime evidence and cannot satisfy a mission-data proof gate.

GCOV amplitude change is not InSAR displacement. Actual interferometric phase/coherence/displacement belongs to NISAR pair products such as GUNW and remains a distinct evidence channel.
