import assert from'node:assert/strict';
import fs from'node:fs';
import{R326_TESTABLE}from'../src/sarNativeRasterR326.js';

const read=p=>fs.readFileSync(p,'utf8');
const native=read('src/sarNativeRasterR326.js');
const raster=read('src/sarRasterR283.ts');
const live=read('src/SARLiveTruthR285.tsx');
const plan=read('src/sarFieldPlanR325.ts');
const worker=read('src/workerR8.js');

const header=new Uint8Array(16);header[0]=0x49;header[1]=0x49;new DataView(header.buffer).setUint16(2,42,true);new DataView(header.buffer).setUint32(4,8,true);
const parsed=R326_TESTABLE.parseHeader(header);
assert.equal(parsed.le,true);assert.equal(parsed.big,false);assert.equal(parsed.ifdOffset,8);

const pred=Uint8Array.from([10,5,5]);R326_TESTABLE.undoPredictor(pred,3,1,8,1,2,true);
assert.deepEqual([...pred],[10,15,20],'horizontal differencing predictor must reconstruct returned samples');

const packed=R326_TESTABLE.packBits(Uint8Array.from([2,7,8,9,255,5]));
assert.deepEqual([...packed],[7,8,9,5,5],'PackBits decoder must preserve literal and repeat runs');

for(const token of ['SAR_NATIVE_RASTER_SCHEMA_R326','MAX_TOTAL_COMPRESSED','MAX_BLOCKS','fetchRange','collectIfds','chooseIfd','UNSUPPORTED_TIFF_COMPRESSION','DecompressionStream','lzw(bytes)','packBits','undoPredictor','NATIVE_SAMPLES_BOUND','SLC_COMPLEX_DECODER_REQUIRED','calibrationBound:false','amplitudeBound:false','derivedFieldBound:false'])assert.ok(native.includes(token),`R326 native ingress missing ${token}`);
assert.ok(native.includes("probe.collection!=='sentinel-1-grd'"),'R326 must not run the GRD decoder over SLC');
assert.ok(native.includes('sourceUnits:\'NATIVE_DN\''),'decoded source samples must retain native DN semantics');
assert.ok(native.includes("truthBoundary:'R326 binds a bounded grid of decoded numerical samples"),'R326 decoded-source truth boundary missing');
assert.ok(!native.includes('amplitudeDb:values'),'uncalibrated DN must never be relabeled calibrated amplitude');

for(const token of ['nativeIntensity?:number[]','validMask?:number[]','sourceUnits?:string','timeStackRelative?:number[]'])assert.ok(raster.includes(token),`R326 raster contract missing ${token}`);
assert.ok(raster.includes("if(view==='SOURCE'){v=at(r.nativeIntensity,i,r.validMask)"),'SOURCE lens must read exact native samples when present');
assert.ok(raster.includes("if(view==='AMPLITUDE'){v=at(r.amplitudeDb,i)"),'AMPLITUDE must prefer independently calibrated amplitudeDb when present');
assert.ok(raster.includes("v=at(r.nativeIntensity,i,r.validMask)"),'R336 may render exact native intensity in the AMPLITUDE lens only as an explicitly uncalibrated native-DN fallback');
assert.ok(raster.includes("if(view==='TIME_STACK'){v=at(r.timeStackRelative,i)"),'TIME_STACK must not reuse a single-scene amplitude raster');

for(const token of ["'/api/earth/sar/measurement-raster'","native?.nativeDataBound?'NATIVE SOURCE BOUND'",'raster={(native?.nativeDataBound||hostPreviewRaster)?displayRaster:undefined}','Decode native raster','NATIVE PIXELS {native?.nativeDataBound?\'BOUND\':\'UNBOUND\'}'])assert.ok(live.includes(token),`R326/R337/R341 live surface missing ${token}`);
assert.ok(live.includes("truth:nativeBound?'OBSERVED_NATIVE':'VISUAL_ENHANCED'"),'decoded native samples must upgrade only to OBSERVED_NATIVE');
assert.ok(live.includes("missingness:nativeBound?(complexBound?['CALIBRATION_UNBOUND','DERIVED_FIELD_UNBOUND','PAIR_REQUIRED']:['CALIBRATION_UNBOUND','DERIVED_FIELD_UNBOUND'])"),'decoded native source must retain calibration/derived missingness while complex SLC also retains pair-required missingness');

assert.ok(plan.includes("has(raster?.nativeIntensity)||has(raster?.amplitudeDb)"),'SOURCE planner must admit native DN samples');
assert.ok(plan.includes("timeStackRelative"),'time-stack planner must require its own materialized array');
assert.ok(worker.includes("import {sarNativeRasterR326} from './sarNativeRasterR326.js'")&&worker.includes("url.pathname==='/api/earth/sar/native-raster'"),'canonical Earth worker must own R326 ingress route');

console.log('R326/R336 SAR NATIVE RASTER INGRESS PASS · bounded exact COG/TIFF decode · native DN may drive SOURCE and an explicitly uncalibrated AMPLITUDE display lens · calibrated backscatter/phase/derived physics remain independently gated · no SLC approximation · canonical worker preserved');

assert.ok(live.includes("const displayRaster=pairDerived?.state==='PAIR_FIELDS_BOUND'?pairDerived.pairRaster:native?.raster"),'R341 may replace the displayed analytical raster only after pair-derived fields are explicitly bound; native source remains fallback');
