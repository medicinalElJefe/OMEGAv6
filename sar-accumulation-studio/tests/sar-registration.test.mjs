import test from 'node:test';
import assert from 'node:assert/strict';
import { pixelToEarth, buildPatchGeoMesh } from '../src/sar-registration.mjs';

const product={points:[
  {line:0,pixel:0,longitude:-111,latitude:33},
  {line:0,pixel:100,longitude:-110,latitude:33.1},
  {line:100,pixel:0,longitude:-111.1,latitude:32},
  {line:100,pixel:100,longitude:-110.1,latitude:32.1},
  {line:50,pixel:50,longitude:-110.55,latitude:32.55}
]};

test('pixel-to-Earth registration is exact at a product GCP',()=>{
  const g=pixelToEarth(product,50,50);
  assert.equal(g.state,'PIXEL_GEOLOCATED_EXACT_GCP');
  assert.equal(g.lon,-110.55);
  assert.equal(g.lat,32.55);
});

test('pixel-to-Earth registration interpolates only inside local product GCP support',()=>{
  const g=pixelToEarth(product,25,25);
  assert.match(g.state,/PIXEL_GEOLOCATED_/);
  assert.ok(Number.isFinite(g.lon));
  assert.ok(Number.isFinite(g.lat));
  assert.ok(g.lon>-111.1&&g.lon<-110);
  assert.ok(g.lat>32&&g.lat<33.1);
});

test('patch mesh carries only geolocation, never alters source SAR values',()=>{
  const mesh=buildPatchGeoMesh(product,[20,20,80,80],4);
  assert.equal(mesh.segments,4);
  assert.equal(mesh.totalNodeCount,25);
  assert.equal(mesh.validNodeCount,25);
  assert.equal(mesh.state,'PATCH_GEOREGISTERED_GCP_MESH');
  assert.match(mesh.semantics,/does not alter SAR values/i);
});
