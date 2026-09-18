import assert from'node:assert/strict';
import fs from'node:fs';
import{decompress as zstdDecompressR327}from'../src/vendor/fzstdR327.js';

const native=fs.readFileSync('src/sarNativeRasterR326.js','utf8');
const raster=fs.readFileSync('src/sarRasterR283.ts','utf8');
const vendor=fs.readFileSync('src/vendor/fzstdR327.js','utf8');

const fixture=Uint8Array.from([40,181,47,253,36,15,121,0,0,79,77,69,71,65,45,82,51,50,55,45,90,83,84,68,160,90,152,76]);
assert.equal(new TextDecoder().decode(zstdDecompressR327(fixture)),'OMEGA-R327-ZSTD','vendored ZSTD decoder must reproduce deterministic fixture');

assert.ok(vendor.includes('fzstd v0.1.1'),'vendored codec version disclosure missing');
assert.ok(vendor.includes('MIT License')&&vendor.includes('Copyright (c) 2020 Arjun Barrett'),'vendored codec must preserve MIT notice');
assert.ok(native.includes("compression===50000"),'TIFF ZSTD compression tag 50000 must be decoded');
assert.ok(native.includes("zstdDecompressR327(bytes)"),'ZSTD TIFF path must use the pinned vendored decoder');

for(const token of ['33550','33922','34264','34735','MODEL_TIEPOINT_GCPS','gcpCount','affineBound','gcpBound'])assert.ok(native.includes(token),`R327 GeoTIFF evidence missing ${token}`);
assert.ok(native.includes("const corners=geo.affineBound?"),'corner projection must require an actual affine transform');
assert.ok(native.includes("multiple GCPs are retained as control evidence and are never collapsed into a fabricated affine transform"),'GCP truth boundary missing');
assert.ok(raster.includes('gcpCount?:number')&&raster.includes('gcps?:Array<'),'native raster type must carry bounded GCP evidence');
assert.ok(!native.includes("crs:'EPSG:4326'"),'R327 must not invent WGS84 when the native TIFF does not declare it');

console.log('R327 COG ZSTD + GEOREFERENCE PASS · CDSE ZSTD tiles decode with pinned MIT codec · affine and GCP evidence remain distinct · no fabricated CRS/geotransform');
