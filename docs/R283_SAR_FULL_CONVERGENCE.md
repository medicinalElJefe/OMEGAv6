# R283 · OMEGA SAR Full Convergence

R283 converges the FE-Lexikon remote-sensing corpus, OMEGA's accepted Woven Continuity software mechanics, the complete 53-mode registry, standard SAR measurement mathematics, current Earth source/proof contracts, and a high-detail SAR instrument into one governed subsystem.

The goal is not to make a radar image look more dramatic. The goal is to make every visual state recoverable to a declared observation, transform, uncertainty state, and proof class.

## 1. Authority and scientific boundary

R283 extends the existing R268 `sar.lab` genome and the current Earth workspace. It does not create another CanonState, deployment, dispatch, runtime, device or evidence-admission authority.

Standard SAR physics, geodesy, mission metadata, calibration, source products and external benchmarks remain the authority for physical/quantitative claims. OMEGA modes and Woven Continuity organize computation, state, proof and visualization; they do not create new empirical laws.

Accepted authority remains inherited, including R125 CanonState admission, R141 exact-return closure, R146 durable history, R147 dispatch, R205 executor semantics, R239 resource governance, R240 exact-head promotion and R243 plan/execution-motion truth separation.

## 2. Evidence corpus

The FE-Lexikon working corpus contributes 2,031 index nodes / 1,949 unique URLs. The R2 extraction currently contains 58 directly article-reviewed high-value EO/SAR nodes; all other nodes remain explicitly `INDEX_ONLY`. The knowledge graph preserves three edge classes:

- `SOURCE_LINK`
- `EXTRACTED_FACT`
- `OMEGA_DERIVATION`

Index membership is never promoted into an article fact.

## 3. Core observation object

`SarObservationR280` preserves:

- mission, platform/sensor and exact product identity;
- source/provenance and acquisition time;
- product level;
- frequency band, center frequency/wavelength and polarization;
- coordinate reference / datum / measurement-surface semantics;
- orbit direction, look direction, incidence, azimuth, LOS and interferometric baseline;
- calibration record;
- native-data / complex-data / evidence-bound states;
- truth class and typed missingness;
- residual/scar ledger.

A renderer consumes this object. It does not redefine it.

## 4. Complex SAR mathematics

R283 retains standard measurement relations explicitly in `sarMathR280.ts`.

### Propagation and range

`R = c Δt / 2`

where the timing interval is two-way propagation time.

### Frequency and wavelength

`λ = c / f`

### Complex sample

For amplitude `A` and phase `φ`:

`z = A (cos φ + i sin φ)`

### Interferometric phase

The complex interferogram is formed from one complex observation and the conjugate of the paired observation. Wrapped phase remains cyclic; metric displacement requires declared unwrapping/sign convention.

### LOS phase/displacement relation

`d_LOS = - λ Δφ / (4π)`

under the declared R283 sign convention.

### Coherence

R283 implements normalized complex cross-correlation over valid paired samples. Missing samples are excluded instead of synthesized.

### Backscatter

Linear and decibel forms remain separately typed:

`σ0_dB = 10 log10(σ0)`

Display brightness never becomes calibrated backscatter by visual normalization.

### Doppler radial velocity

`v_r = - f_D λ / 2`

under the declared sign convention.

## 5. Interferometric residual calculus

R283 represents the observed interferometric phase conceptually as:

`φ_observed = φ_deformation + φ_topography + φ_orbit + φ_atmosphere + φ_noise`

The residual ledger keeps these contributors separate. The system does not promote complete observed phase into deformation.

Deformation admission can require:

- source-bound complex acquisitions;
- co-registration / baseline identity;
- sufficient coherence;
- phase unwrapping for metric displacement;
- topographic treatment;
- orbit treatment;
- atmospheric treatment;
- characterized noise;
- retained processor/provenance lineage.

## 6. Woven Continuity as executable SAR mechanics

R283 applies the accepted operator chain:

`partition -> transform/exchange -> invariant carry -> scar/history carry -> re-contextualize`

### Partition

Mission, product, acquisition, band, polarization, geometry, epoch, processing level and target region are explicit partitions.

### Transform/exchange

Examples include calibration, focusing, geocoding, terrain correction, co-registration, interferometry, phase unwrapping, denoising, resampling, fusion and display normalization.

### Invariant carry

Source identity, acquisition time, band/wavelength, polarization, processing level, coordinate frame, measurement surface, calibration, native resolution and truth class remain recoverable.

### Scar/history carry

Atmosphere, orbit residual, topographic residual, noise, decorrelation, speckle burden, shadow, layover, source gaps and interpolation burden are never silently erased.

### Re-contextualize

The same retained state can be viewed as amplitude, phase, coherence, interferogram, LOS deformation, elevation, polarimetry, multi-band comparison, time stack, uncertainty or proof without changing source truth.

## 7. Dimensional relativity in R283

Dimensional relativity is used as measurement-frame relativity, not extra physical dimensions.

A geographic coordinate is not one universal sensor value. A measurement address includes, at minimum:

`location × epoch × wavelength/band × polarization × incidence/look × measurement surface × product level × truth class`

X, C, S, L and P bands may interact with different effective scattering surfaces/volumes. Multi-band comparison therefore preserves band and measurement-surface identity instead of treating all pixels at a coordinate as equivalent observations.

The 12/144/1,728/20,736/248,832 structures remain software/atlas addressing and resolution lenses.

## 8. Full 53-mode application

`src/sarModesR283.ts` binds all 53 established modes to typed software roles: COMPUTE, OBSERVATION, RELATION, MEMORY, INTELLIGENCE, VISUAL, PROOF, ACTION, GOVERNANCE or DORMANT.

Every binding carries `physicalAuthority:false`.

Modes without a sufficiently defined SAR operator remain dormant rather than receiving invented mathematics. Other modes are applied to concrete functions such as evidence admission, source planning, residual decomposition, frame transformation, LOD rendering, ontology normalization, packaging/recovery or governance.

This applies the full mode inventory without allowing internal terminology to override source evidence or standard SAR equations.

## 9. Thirty FE-derived capability contributions

`src/sarCapabilityMapR283.ts` encodes all 30 prioritized contributions from the R2 FE-Lexikon/Omega review. They include:

1. unified EO observation contract;
2. complex SAR measurement state;
3. acquisition geometry;
4. InSAR/DInSAR;
5. wavelength/band scattering frame;
6. polarimetry;
7. calibrated backscatter;
8. residual/uncertainty ledger;
9. missingness;
10. mission registry;
11. revisit/latency/freshness;
12. processing lineage;
13. registered fusion;
14. lazy EO data cube;
15. observation/assimilation/forecast truth classes;
16. multitemporal change;
17. DEM/DTM/DSM surface semantics;
18. native vs inferred reconstruction;
19. ML provenance;
20. EO format adapters;
21. external EO connector contract;
22. Pol-InSAR;
23. multi-band relative scattering;
24. Doppler motion;
25. question-to-source planning;
26. FE-Lexikon knowledge graph;
27. external benchmark harness;
28. Foundry compilation;
29. source/measurement inspector;
30. evidence-bound accumulated SAR animation.

## 10. Visual instrument

SAR Truth is integrated directly into `EarthObservatoryR8` as an additional Earth view, rather than becoming a detached app.

The instrument exposes twelve synchronized lenses:

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

The screen also carries acquisition geometry, band/polarization, native resolution, source identity, product/truth class, residual ledger and interferometry gate.

### Source-bound raster contract

`SarRasterFieldR283` can carry real arrays for:

- amplitude dB;
- phase radians;
- coherence;
- LOS displacement meters;
- elevation meters;
- polarimetric power;
- multi-band relative values;
- uncertainty;
- quality.

Each visual lens binds independently. A source-bound observation with no phase raster cannot display a generated phase field as source evidence. The UI instead states `SOURCE BOUND · THIS FIELD NOT BOUND`.

If there is no bound source, R283 renders a deterministic demonstration field that is explicitly `VISUAL_ENHANCED`, `NO_SOURCE`, `nativeDataBound:false`, and `sourceEvidenceBound:false`.

## 11. Missingness and visual truth

Typed missingness includes NO_SOURCE, OUT_OF_SWATH, RADAR_SHADOW, LAYOVER, NO_COHERENCE, CLOUD_MASKED, ATMOSPHERICALLY_DEGRADED and INTERPOLATED_ONLY.

R283 continues the Earth source-first principle: missing source pixels remain missing as evidence. A visual fill, interpolation, denoise or synthetic transition can exist only under its own truth class.

## 12. Mission and source selection

The mission registry includes Sentinel-1, NISAR, TerraSAR-X, TanDEM-X, RADARSAT-family, Biomass and SRTM capability envelopes. The source planner can rank candidate mission families by band, revisit, resolution, wide swath, interferometric/deformation suitability and vegetation/urban goals.

Planner output is recommendation only. It does not prove that a matching acquisition exists or is accessible.

## 13. Current Copernicus source discovery

R283 targets the current Copernicus Data Space STAC root:

`https://stac.dataspace.copernicus.eu/v1`

The prior legacy STAC path is not used.

Known SAR discovery collections include Sentinel-1 GRD, Sentinel-1 SLC, Sentinel-1 SLC-WV, Sentinel-1 global mosaics and CCM SAR.

Sentinel-1 SLC is the important complex-measurement path because SLC retains complex I/Q amplitude and phase; GRD is detected and does not retain the original phase information.

The STAC connector only discovers and normalizes catalog products. A catalog item remains `catalogOnly:true`, `sourceEvidenceBound:false`, `nativeDataBound:false`, `complexDataBound:false` until exact assets and required metadata are actually bound and verified.

## 14. Format and processing lineage

EO format contracts cover GeoTIFF, HDF, NetCDF, JPEG2000, NITF, SAFE and CEOS. Quantitative admission requires adequate geometry, time and sensor metadata.

Processing lineage stores source product, processor, version, parameters, inputs/outputs, product-level transition, truth transition, time and receipt. A filename or renderer cannot silently promote a product.

## 15. Polarimetry / Pol-InSAR

R283 preserves HH, VV, HV and VH complex channels separately. Polarimetric admission requires calibration. Pol-InSAR additionally requires interferometric coherence and can retain relative vertical phase-center state by channel.

## 16. Data cube and fusion

The EO data cube is lazy. A common address space never overwrites native resolution, CRS, surface semantics, product level, truth class or source identity.

Fusion requires donor identity and registration/provenance state. The result truth class is `FUSED`; it does not become direct observation merely because its donors are observations.

## 17. Observation, model and forecast separation

Observed, corrected, fused, assimilated, simulated and forecast Earth states remain distinct. A digital-twin/forecast state may be constrained by SAR observations but cannot inherit direct-observation truth.

## 18. ML and reconstruction

ML outputs remain `DERIVED_MODEL`. Model/version, training corpus, sensor/band domain and validation metrics are part of provenance.

Denoise or super-resolution outputs do not become native sensor pixels. The visual instrument retains source resolution and reconstruction truth class.

## 19. Benchmark requirement

R283 does not claim that OMEGA is more accurate than established processors because it looks better, because internal modes agree, or because Canon scores are high.

`src/sarBenchmarkR283.ts` requires an authoritative external reference, algorithm/version identity, paired values and retained residual metrics. Comparative superiority requires a common reference.

## 20. Foundry integration

`compileSarSystemR283()` compiles the detailed SAR capability layer over the existing R268 `sar.lab` genome.

It keeps features blocked where evidence is absent. Examples:

- complex processing requires a bound complex product;
- interferometry requires at least two bound complex acquisitions;
- external source operations require the external binding;
- benchmark claims require an authoritative benchmark.

## 21. Release proof

`tests/r283-sar-full-stack-invariants.mjs` checks the entire convergence together:

- Earth integration;
- 12 views;
- source/demo truth boundary;
- complex measurement fields;
- standard SAR math;
- all 53 mode bindings;
- all 30 capability contributions;
- FE-Lexikon graph boundaries;
- real-raster per-view gating;
- current Copernicus STAC boundary;
- processing/calibration/format/ML provenance;
- fusion/data-cube/model/source-planner semantics;
- external benchmark admission;
- Foundry authority preservation.

A release is not promoted from architecture alone. It must pass repository build/tests and governed release/deployment proof before it can be called production.
