import fs from'node:fs';import assert from'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');const must=(ok,msg)=>assert.ok(ok,'R283 SAR '+msg);
const earth=read('src/EarthObservatoryR8.tsx'),ui=read('src/SARTruthInstrumentR280.tsx'),truth=read('src/sarTruthR280.ts'),math=read('src/sarMathR280.ts'),modes=read('src/sarModesR283.ts'),caps=read('src/sarCapabilityMapR283.ts'),raster=read('src/sarRasterR283.ts'),lex=read('src/sarLexiconGraphR283.ts'),bench=read('src/sarBenchmarkR283.ts'),foundry=read('src/sarFoundryR283.ts'),stac=read('src/sarCdseStacR283.ts'),external=read('src/sarExternalR283.ts'),format=read('src/sarFormatR283.ts'),ml=read('src/sarMLR283.ts'),cal=read('src/sarCalibrationR283.ts'),lineage=read('src/sarProcessingLineageR283.ts'),fusion=read('src/sarFusionR280.ts'),cube=read('src/sarDataCubeR280.ts'),forecast=read('src/sarForecastTruthR280.ts'),planner=read('src/sarSourcePlannerR280.ts'),pol=read('src/sarPolInSARR280.ts'),stack=read('src/sarAccumulationR280.ts'),terrain=read('src/sarTerrainR280.ts'),visual=read('src/sarVisualMathR280.ts');

// Earth integration and all 12 analytical lenses.
must(earth.includes("|'SAR'")&&earth.includes("id:'SAR'")&&earth.includes("data-earth-view='SAR'")&&earth.includes('SARTruthInstrumentR280'),'Earth workspace must own integrated SAR Truth view');
for(const v of ['SOURCE','AMPLITUDE','PHASE','COHERENCE','INTERFEROGRAM','DEFORMATION','ELEVATION','POLARIMETRY','MULTI_BAND','TIME_STACK','SCAR_UNCERTAINTY','PROOF'])must(ui.includes(`'${v}'`),'missing visual lens '+v);
must(ui.includes("truth:'VISUAL_ENHANCED'")&&ui.includes("missingness:['NO_SOURCE']")&&ui.includes('nativeDataBound:false')&&ui.includes('sourceEvidenceBound:false'),'fallback visualization must remain explicitly non-source');
must(ui.includes('MEASUREMENT-LINKED RENDERING')&&ui.includes('SOURCE BOUND · THIS FIELD NOT BOUND')&&ui.includes('NO SOURCE PIXELS CLAIMED'),'per-view measurement truth disclosure missing');
must(ui.includes('rasterVisualValueR283')&&ui.includes('rasterCoverageR283'),'instrument must accept actual source-bound raster values');

// Measurement truth classes, missingness and complex fields.
for(const t of ['OBSERVED_NATIVE','OBSERVED_CALIBRATED','CORRECTED','GEOCODED','FUSED','ASSIMILATED','SIMULATED','FORECAST','DERIVED_MODEL','VISUAL_ENHANCED'])must(truth.includes(t),'truth class missing '+t);
for(const t of ['NO_SOURCE','OUT_OF_SWATH','RADAR_SHADOW','LAYOVER','NO_COHERENCE','CLOUD_MASKED','ATMOSPHERICALLY_DEGRADED','INTERPOLATED_ONLY'])must(truth.includes(t),'missingness class missing '+t);
for(const t of ['amplitude:number','phaseRad:number','sigma0Db?:number','coherence?:number','incidenceDeg','losUnit','baselineM','temporalBaselineDays'])must(truth.includes(t),'typed SAR measurement missing '+t);

// Standard SAR math remains explicit and independent of Canon lenses.
for(const t of ['C0=299_792_458','interferogramPixelR280','coherenceR280','sigma0LinearToDbR280','slantRangeFromTimeR280','dopplerVelocityR280','decomposeInterferometricPhaseR280','multiBandDifferenceR280'])must(math.includes(t),'math kernel missing '+t);
must(math.includes('(C0*twoWaySeconds)/2'),'range must retain two-way propagation relation');
must(math.includes('-(dopplerHz*wavelengthM)/2'),'Doppler velocity relation missing');
must(math.includes('4*Math.PI'),'phase/LOS relation missing');
must(pol.includes('POLARIMETRIC_CALIBRATION_REQUIRED')&&pol.includes('coherenceByChannel'),'Pol-InSAR calibration/coherence gate missing');

// All 53 modes must be present and explicitly non-physical-authority.
const modeRows=[...modes.matchAll(/M\((\d+),/g)].map(x=>Number(x[1]));must(modeRows.length===53,'expected 53 mode bindings, got '+modeRows.length);must(new Set(modeRows).size===53&&Math.min(...modeRows)===1&&Math.max(...modeRows)===53,'mode numbering must be complete 1..53');
must(modes.includes('physicalAuthority:false')&&modes.includes('do not create new empirical laws'),'mode stack must not override empirical SAR physics');
for(const t of ['OVERALL CANON','Unified Coherence','Mode 188','Deep Mother','High Father','FULL SPHERE','Dimensional Relativity','HEAVY SCIENCE REVIEW','No-Nothing Truth','Γ Reality Admission','Dewey Calculus','HEAVY BIO','Color Algebra','Future Plasticity','Dispatch Law'])must(modes.includes(t),'mode binding missing '+t);

// All 30 FE-derived capability contributions must be encoded.
const priorities=[...caps.matchAll(/priority:(\d+)/g)].map(x=>Number(x[1]));must(priorities.length===30,'expected 30 capability rows, got '+priorities.length);for(let i=1;i<=30;i++)must(priorities.includes(i),'capability priority missing '+i);
for(const t of ['eo.observation.contract','sar.complex.measurement','sar.interferometry.stack','sar.band.physics','sar.polarimetry','sar.backscatter.calibrated','earth.datacube','earth.digital.twin.truthclasses','source.compatibility.planner','lexicon.knowledge.graph','proof.external.benchmark','sar.accumulated.animation'])must(caps.includes(t),'capability missing '+t);

// FE-Lexikon source facts and OMEGA derivations remain different graph edge types.
for(const t of ['indexRows:2031','uniqueUrls:1949','directArticleReviewed:58','SOURCE_LINK','EXTRACTED_FACT','OMEGA_DERIVATION','INDEX_ONLY'])must(lex.includes(t),'lexicon graph boundary missing '+t);
must(lex.includes('cannot be used as article-fact evidence'),'index-only rows must not be promoted to article evidence');

// Actual raster fields are independently bound per analytical view.
for(const t of ['amplitudeDb?:number[]','phaseRad?:number[]','coherence?:number[]','losDisplacementM?:number[]','elevationM?:number[]','polarimetricPower?:number[]','multiBandRelative?:number[]','uncertainty?:number[]','quality?:number[]'])must(raster.includes(t),'raster field missing '+t);
must(raster.includes('Missing arrays/pixels remain missing'),'raster truth boundary missing');
must(visual.includes('max===min ? .5 :'),'visual normalization constant-field guard missing');
must(visual.includes('display transform only'),'visual normalization must be non-authoritative');

// Current public catalog discovery is not source measurement proof.
must(stac.includes("https://stac.dataspace.copernicus.eu/v1")&&stac.includes("GRD:'sentinel-1-grd'")&&stac.includes("SLC:'sentinel-1-slc'")&&stac.includes("SLC_WV:'sentinel-1-slc-wv'"),'current CDSE STAC contract missing');
for(const t of ['catalogOnly:true','sourceEvidenceBound:false','nativeDataBound:false','complexDataBound:false','bind exact product/asset bytes','CDSE STAC results are catalogue discovery/provenance records only'])must(stac.includes(t),'catalog/evidence boundary missing '+t);
must(external.includes('SUCCESS_RECEIPT_REQUIRED')&&external.includes('live exact product'),'external execution/data proof boundary missing');

// Processing/calibration/format/ML provenance.
for(const t of ['CALIBRATION_RECORD_REQUIRED','CALIBRATION_OUTSIDE_VALIDITY','CALIBRATED_UNITS_REQUIRED'])must(cal.includes(t),'calibration gate missing '+t);
for(const t of ['PROCESSOR_VERSION_REQUIRED','IO_IDENTITY_REQUIRED','recoverable step'])must(lineage.includes(t),'processing lineage missing '+t);
for(const t of ['SAFE','CEOS','GEOREFERENCE_REQUIRED','ACQUISITION_TIME_REQUIRED','SENSOR_METADATA_REQUIRED'])must(format.includes(t),'format ingest boundary missing '+t);
for(const t of ['TRAINING_CORPUS_REQUIRED','VALIDATION_METRICS_REQUIRED','DERIVED_MODEL','super-resolution/denoise output never becomes native'])must(ml.includes(t),'ML provenance boundary missing '+t);

// Fusion/cube/forecast/planner/terrain/time stack remain semantically distinct.
must(fusion.includes('provenance-preserving-fusion')&&fusion.includes('cannot claim direct-observation truth'),'fusion truth boundary missing');
must(cube.includes('lazy:true')&&cube.includes('never overwrites native geometry'),'lazy cube/native truth boundary missing');
must(forecast.includes('never inherits direct-observation truth'),'forecast/model truth boundary missing');
must(planner.includes('recommendationOnly:true')&&planner.includes('does not prove a current acquisition'),'source planner capability/availability boundary missing');
must(stack.includes('SYNTHETIC_FRAMES_CANNOT_BE_OBSERVATION_EVIDENCE'),'time-stack synthetic-frame boundary missing');
must(terrain.includes('are not interchangeable'),'terrain surface semantics missing');

// Benchmark and Foundry authority closure.
must(bench.includes('AUTHORITATIVE_REFERENCE_REQUIRED')&&bench.includes('COMMON_REFERENCE_REQUIRED')&&bench.includes('not admitted from visual quality'),'external benchmark gate missing');
must(foundry.includes("from'./systemFoundryR268'")&&foundry.includes("genomeByIdR268('sar.lab')")&&foundry.includes('does not create another CanonState, dispatch, deployment, runtime or evidence authority'),'R283 must extend existing Foundry/authority, not fork it');
console.log(`R283 SAR FULL STACK PASS · ${modeRows.length} modes · ${priorities.length} capabilities · Earth-integrated source-first instrument`);
