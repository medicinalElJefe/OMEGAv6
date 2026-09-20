import assert from'node:assert/strict';
import fs from'node:fs';
import{R337_TESTABLE}from'../src/sarMeasurementRasterR337.js';

const read=p=>fs.readFileSync(p,'utf8');
const measurement=read('src/sarMeasurementRasterR337.js'),native=read('src/sarNativeRasterR326.js'),raster=read('src/sarRasterR283.ts'),worker=read('src/workerR8.js'),live=read('src/SARLiveTruthR285.tsx'),pair=read('src/sarPairPlannerR337.ts'),catalog=read('src/sarLiveCatalogR285.js'),probe=read('src/sarAssetProbeR325.js');

const bytes=new Uint8Array(4),dv=new DataView(bytes.buffer);dv.setInt16(0,-3,true);dv.setInt16(2,4,true);
const z=R337_TESTABLE.complexAt(bytes,0,true);
assert.equal(z.i,-3);assert.equal(z.q,4);assert.equal(z.amplitude,5);assert.ok(Math.abs(z.phaseRad-Math.atan2(4,-3))<1e-12);

for(const token of ['SAR_MEASUREMENT_RASTER_SCHEMA_R337','sentinel-1-slc','meta.bits!==32','meta.sampleFormat!==5','complexI:I','complexQ:Q','phaseRad:phase','Math.hypot(i,q)','Math.atan2(q,i)','COMPLEX_SAMPLES_BOUND','I16_Q16_INTERLEAVED'])
 assert.ok(measurement.includes(token),`R337 complex ingress missing ${token}`);
assert.ok(measurement.includes("meta.compression!==1"),'SLC ingress must fail closed on non-standard compression');
assert.ok(measurement.includes('does not establish radiometric calibration, co-registration, coherence, interferometric phase between acquisitions'),'complex source truth boundary missing');
assert.ok(native.includes('export const R326_INTERNAL'),'R337 must reuse the bounded proven TIFF primitives instead of creating an unrestricted fetch path');
for(const source of [catalog,probe]){assert.ok(source.includes('alternate?.https?.href'),'R337 must resolve the STAC-declared alternate HTTPS measurement location');assert.ok(source.includes('STAC_ALTERNATE_HTTPS'),'alternate transport authority must remain explicit')}
assert.ok(live.includes('assetRank')&&live.includes('/tiff|geotiff/i'),'live source selection must prioritize measurement TIFFs over whole-product archives');
for(const token of ['complexI?:number[]','complexQ?:number[]','phaseRad?:number[]'])assert.ok(raster.includes(token),`R337 raster contract missing ${token}`);
assert.ok(worker.includes("import {sarMeasurementRasterR337} from './sarMeasurementRasterR337.js'")&&worker.includes("url.pathname==='/api/earth/sar/measurement-raster'"),'canonical Earth worker must expose unified R337 measurement route');

for(const token of ['COMMON_INSTRUMENT_MODE_REQUIRED','COMMON_ORBIT_DIRECTION_REQUIRED','COMMON_RELATIVE_ORBIT_REQUIRED','COMMON_POLARIZATION_REQUIRED','FOOTPRINT_OVERLAP_REQUIRED','metadata compatibility is necessary but not sufficient'])assert.ok(pair.includes(token),`R337 pair truth missing ${token}`);

for(const token of ["'/api/earth/sar/measurement-raster'","complexDataBound:complexBound",'COMPLEX I/Q','R337 repeat-pass pair planner','sarPairCandidatesR337','planSarPairR337'])
 assert.ok(live.includes(token),`R337 live integration missing ${token}`);
assert.ok(live.includes("mode==='SLC'?'Decode complex SLC':'Decode native raster'"),'SLC decode action must be available only through the same exact measurement evidence path');

console.log('R337 SAR COMPLEX + PAIR RUNTIME PASS · exact bounded SLC I/Q decode · wrapped phase from atan2 only · strict metadata pair compatibility · no co-registration/coherence/deformation promotion without their own proof');
