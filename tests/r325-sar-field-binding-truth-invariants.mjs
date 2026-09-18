import assert from'node:assert/strict';
import fs from'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const live=read('src/SARLiveTruthR285.tsx');
const ui=read('src/SARTruthInstrumentR280.tsx');
const truth=read('src/sarTruthR280.ts');
const plan=read('src/sarFieldPlanR325.ts');
const probe=read('src/sarAssetProbeR325.js');
const worker=read('src/workerR8.js');

for(const token of ['NATIVE_DATA_UNBOUND','CALIBRATION_UNBOUND','DERIVED_FIELD_UNBOUND','PAIR_REQUIRED','PROCESSING_REQUIRED'])assert.ok(truth.includes(token),`R325 missing typed missingness ${token}`);
assert.ok(live.includes("missingness:['NATIVE_DATA_UNBOUND','CALIBRATION_UNBOUND']"),'real catalogue acquisition must not be labeled NO_SOURCE');
assert.ok(live.includes('assetPrefixBound={probe?.nativeByteEvidenceBound===true}'),'byte-prefix evidence must flow into analytical field planner');
assert.ok(live.includes('Probe native asset'),'operator must be able to retry exact native asset proof');

for(const token of ['SOURCE','AMPLITUDE','PHASE','COHERENCE','INTERFEROGRAM','DEFORMATION','ELEVATION','POLARIMETRY','MULTI_BAND','TIME_STACK','SCAR_UNCERTAINTY','PROOF'])assert.ok(plan.includes(token),`R325 field plan missing ${token}`);
for(const token of ['GRD intensity cannot be promoted into phase','Coherence is a pair-derived measurement','unwrapped interferometric phase','authoritative DEM','dual/quad polarization','physically distinct radar bands','multiple acquisitions','uncertainty'])assert.ok(plan.includes(token),`R325 prerequisite truth missing ${token}`);
assert.ok(ui.includes('data-r325-state'),'lens cards must expose per-field planned state');
assert.ok(ui.includes('currentPlan?.next'),'empty analytical surfaces must explain the next admissible binding step');
assert.ok(ui.includes('Requires: {currentPlan.requires.join'),'current lens must disclose exact prerequisites');

for(const token of ['SAR_ASSET_PROBE_SCHEMA_R325','stac.dataspace.copernicus.eu/v1','UNTRUSTED_ASSET_ORIGIN','AUTH_REQUIRED','NATIVE_CONTAINER_PREFIX_BOUND','nativeByteEvidenceBound','nativeDataBound:false','derivedFieldBound:false','prefixHash','tiffProbe'])assert.ok(probe.includes(token),`R325 asset probe missing ${token}`);
assert.ok(probe.includes("range:`bytes=0-${MAX_PREFIX-1}`"),'native probe must use a bounded byte range');
assert.ok(probe.includes("return h==='copernicus.eu'||h.endsWith('.copernicus.eu')"),'native probe must refuse arbitrary remote origins');
assert.ok(worker.includes("url.pathname==='/api/earth/sar/asset-probe'"),'canonical Earth worker must expose R325 probe');
assert.ok(!probe.includes('nativeDataBound:true'),'prefix/container evidence must never be upgraded into decoded native pixels');

console.log('R325 SAR FIELD BINDING TRUTH PASS · real catalogue source ≠ byte-prefix evidence ≠ decoded native field ≠ derived lens · every analytical lens exposes lawful prerequisites and next step');
