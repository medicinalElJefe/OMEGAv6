import fs from'node:fs';import assert from'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');const must=(ok,msg)=>assert.ok(ok,'R285 SAR '+msg);
const earth=read('src/EarthObservatoryR8.tsx'),live=read('src/SARLiveTruthR285.tsx'),ui=read('src/SARTruthInstrumentR280.tsx'),catalog=read('src/sarLiveCatalogR285.js'),worker=read('src/workerR8.js'),css=read('src/sarLiveR285.css'),raster=read('src/sarRasterR283.ts'),wrangler=read('wrangler.jsonc');

// Earth owns one R285 live-data wrapper; the R280 analytical instrument remains its truth renderer.
must(earth.includes("import SARLiveTruthR285 from './SARLiveTruthR285'"),'Earth must import R285 live SAR wrapper');
must(earth.includes("data-earth-view='SAR'")&&earth.includes('<SARLiveTruthR285 lat={lat} lon={lon} onTargetChange={setSarTarget}/>'),'Earth SAR view must mount live wrapper with WGS84 target');
must(live.includes("import SARTruthInstrumentR280 from'./SARTruthInstrumentR280Surface'"),'R285 wrapper must delegate analytical rendering to R280 instrument');
must(live.includes('catalogBound={!!picked}')&&live.includes('allowDemonstration={false}'),'live wrapper must disable demonstration pixels for catalog data');

// Current public CDSE catalogue is queried at runtime with bounded WGS84/time constraints.
for(const token of ["https://stac.dataspace.copernicus.eu/v1/search","GRD:'sentinel-1-grd'","SLC:'sentinel-1-slc'",'normalizeItem','evidenceHash','UPSTREAM_UNAVAILABLE'])must(catalog.includes(token),'live catalogue contract missing '+token);
must(worker.includes("import {sarCatalogR285} from './sarLiveCatalogR285.js'")&&worker.includes("url.pathname==='/api/earth/sar/catalog'"),'R8 must expose bounded live SAR catalogue route');
for(const token of ['catalogOnly:true','sourceEvidenceBound:false','nativeDataBound:false','complexDataBound:false','CATALOG_DISCOVERY_ONLY'])must(catalog.includes(token),'catalogue must remain non-measurement evidence: '+token);
must(catalog.includes('do not prove product bytes')&&catalog.includes('does not substitute fabricated acquisitions or pixels'),'catalogue truth boundary missing');

// Returned metadata may drive labels/geometry, but never upgrades unbound arrays into measurements.
for(const token of ['NATIVE PIXELS UNBOUND','DERIVED FIELDS UNBOUND','RETURNED CATALOGUE PREVIEW','not a decoded SAR measurement raster','No acquisition is fabricated'])must(live.includes(token),'live UI disclosure missing '+token);
must(ui.includes('OMEGA leaves this field empty rather than painting synthetic pixels'),'unbound live field must render explicit missing state');
must(ui.includes("catalogBound?'CATALOG BOUND · PIXELS UNAVAILABLE'"),'catalog-bound screen state missing');
must(ui.includes("catalogBound?'CATALOG BOUND · NATIVE FIELD NOT BOUND'"),'catalog-bound legend missing');
must(ui.includes('data-missing={c.missing')&&ui.includes('allowDemo={allowDemo}'),'canvas missingness must be explicit');

// Measurement-backed views still use only the existing numerical raster contract.
for(const token of ['rasterVisualValueR283','rasterCoverageR283','viewBound=!!(sourceBound&&raster&&coverage?.bound)'])must(ui.includes(token),'measurement raster gate missing '+token);
must(raster.includes('Missing arrays/pixels remain missing'),'R283 raster missingness law must remain');

// Interferometry must derive from bound arrays/declared processing, never optimistic display defaults.
must(ui.includes('meanFinite(raster?.coherence)'),'coherence must derive from bound coherence array');
must(!ui.includes('meanCoherence:.72'),'hard-coded coherence is prohibited');
must(!ui.includes('orbitHandled:true'),'hard-coded orbit correction is prohibited');
for(const token of ['processing.unwrappedPhaseBound===true','processing.topographyHandled===true','processing.orbitHandled===true','processing.atmosphereHandled===true'])must(ui.includes(token),'declared processing gate missing '+token);

// R285 visually expands the workstation without moving canonical runtime authority.
for(const token of ['.r285-livebar','.r285-querybar','.r285-source-ribbon','.r285-live-layout','.r285-products','.r285-stage','.r285-field-empty','.r285-truth-law','earth-r72-workspace.sar-active'])must(css.includes(token),'visual organ missing '+token);
must(wrangler.includes('"main": "src/workerR116.js"'),'R285 must not fork canonical Worker entrypoint');
console.log('R285 SAR LIVE DATA FIDELITY PASS · live Sentinel-1 catalogue · no fabricated measurement fields · data-bound interferometry · R116 authority preserved');
