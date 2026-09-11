# R280 · SAR Truth Instrument

R280 upgrades OMEGA SAR from a visual/specialist surface into a source-first, measurement-aware, proof-bound Earth-observation instrument without replacing accepted R279 behavior or creating competing authority.

## Governing principle

The rendering plane is a lens over measurement state. It must never upgrade inferred, corrected, fused, simulated, or reconstructed data into direct observation.

## Canon / Woven mechanics

Woven Continuity is applied operationally as:

`partition -> transform/exchange -> invariant carry -> scar/history carry -> re-contextualize`

For SAR this means:

1. Partition by mission, acquisition, band, polarization, geometry, processing level, time and region.
2. Apply explicit transforms such as focusing, calibration, geocoding, co-registration, interferometry, fusion, denoising or resampling.
3. Carry source identity, acquisition time, orbit/frame, band/wavelength, polarization, calibration, native resolution and processing lineage.
4. Carry residuals/scars such as decorrelation, atmosphere, orbit error, topographic leakage, shadow, layover, speckle burden and interpolation burden.
5. Re-contextualize into amplitude, phase, coherence, interferogram, LOS deformation, terrain/elevation, polarimetry, multi-band comparison, time stack or proof views.

Atlas resolution levels remain software/addressing lenses, not literal physical dimensions. Dimensional relativity is used here as relative measurement-frame semantics: the same Earth coordinate can be observed differently by wavelength, polarization, incidence, epoch and processing state.

## R280 truth classes

- OBSERVED_NATIVE
- OBSERVED_CALIBRATED
- CORRECTED
- GEOCODED
- FUSED
- ASSIMILATED
- SIMULATED
- FORECAST
- DERIVED_MODEL
- VISUAL_ENHANCED

## R280 missingness classes

- NO_SOURCE
- OUT_OF_SWATH
- RADAR_SHADOW
- LAYOVER
- NO_COHERENCE
- CLOUD_MASKED
- ATMOSPHERICALLY_DEGRADED
- INTERPOLATED_ONLY

Missingness is carried as state. It is never silently converted into measured data.

## Scientific data model

R280 defines typed contracts for:

- observation identity and provenance
- mission/platform/sensor
- acquisition time / revisit / processing latency / scene age
- complex SAR amplitude + phase
- band/frequency/wavelength
- polarization
- geometry frame, LOS, incidence, azimuth and baseline
- calibration record and processing level
- coherence and interferometric residual decomposition
- terrain/surface semantics (DEM/DTM/DSM)
- quality and missingness masks
- processing lineage and proof obligations

## Interferometric decomposition

R280 treats observed interferometric phase conceptually as:

`phase_observed = deformation + topography + orbit + atmosphere + noise`

The system must not display the complete phase difference as physical deformation. Deformation admission requires explicit quality/coherence plus the declared handling of topographic, orbit, atmospheric and noise contributions.

## Band relativity

X/C/S/L/P measurements are not treated as interchangeable images. Band, wavelength and scattering-depth semantics remain explicit. Multi-band comparison is allowed only with an explicit relative measurement frame.

## Visual instrument views

The R280 SAR Truth Instrument provides these lenses over shared measurement/proof state:

1. SOURCE
2. AMPLITUDE
3. PHASE
4. COHERENCE
5. INTERFEROGRAM
6. DEFORMATION
7. ELEVATION
8. POLARIMETRY
9. MULTI_BAND
10. TIME_STACK
11. SCAR_UNCERTAINTY
12. PROOF

## Authority and non-regression

R280 does not create a second CanonState writer, dispatch authority, deployment authority, or evidence-admission path. It remains subordinate to the accepted R125/R141/R146/R147/R205/R239/R240/R243/R279 authority and truth contracts.

R280 must preserve the R279 source-first Earth rule that missing source pixels remain missing. It adds typed SAR missingness and measurement semantics underneath that rule.

## Initial implementation scope

- typed EO/SAR contracts
- mission/band registry
- complex SAR and interferometric state
- Woven continuity SAR compiler
- truth/missingness admission helpers
- visual instrument component with all 12 views
- source/proof inspector
- time-stack controls
- multi-band relative-frame panel
- deterministic demo/evidence-safe visualization when no live complex SAR source is bound
- invariants proving no source/inference conflation
