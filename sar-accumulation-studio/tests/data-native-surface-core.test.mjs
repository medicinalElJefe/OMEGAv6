import test from 'node:test';
import assert from 'node:assert/strict';
import { bilinearGrid, meshGeoAtSource, terrainLight, buildTerrainReliefSurface, buildTerrainShapedSarSurface } from '../src/data-native-surface-core.mjs';

test('bilinear terrain sampling preserves corners and center',()=>{
  const g=Float64Array.from([0,10,20,30]);
  assert.equal(bilinearGrid(g,2,2,0,0),0);
  assert.equal(bilinearGrid(g,2,2,1,1),30);
  assert.equal(bilinearGrid(g,2,2,.5,.5),15);
});

test('registered mesh maps source pixels into geodetic position without creating new coordinates',()=>{
  const mesh={segments:1,sourceWindow:[100,200,200,300],nodes:[[{pixel:100,line:200,lon:-111,lat:33},{pixel:200,line:200,lon:-110,lat:33}],[{pixel:100,line:300,lon:-111,lat:32},{pixel:200,line:300,lon:-110,lat:32}]]};
  const g=meshGeoAtSource(mesh,150,250);
  assert.ok(Math.abs(g.lon+110.5)<1e-9);
  assert.ok(Math.abs(g.lat-32.5)<1e-9);
});

test('terrain light responds to actual slope orientation',()=>{
  const toward=terrainLight(1,315*Math.PI/180,{azimuthDeg:315,elevationDeg:43});
  const away=terrainLight(1,135*Math.PI/180,{azimuthDeg:315,elevationDeg:43});
  assert.ok(toward>away);
  assert.ok(toward<=1&&away>=-1);
});

test('relief surface is image data derived from DEM rather than line geometry',()=>{
  const terrain={width:3,height:3,elevation:Float64Array.from([100,110,120,95,105,115,90,100,110]),rawDem:true};
  const water={geometry:{slope:Float32Array.from([.1,.1,.1,.1,.1,.1,.1,.1,.1]),aspect:Float32Array.from([0,0,0,0,0,0,0,0,0]),curvature:new Float32Array(9),conveyance:Float32Array.from([0,0,0,0,.8,0,0,0,0])}};
  const out=buildTerrainReliefSurface(terrain,water);
  assert.equal(out.rgba.length,3*3*4);
  assert.match(out.semantics,/DEM-derived shaded relief/i);
  assert.ok(out.rgba.some(v=>v>0));
});

test('terrain-shaped SAR preserves source dB array and keeps display derivation explicit',()=>{
  const db=Float32Array.from([-20,-15,-10,-5]);
  const before=Array.from(db);
  const patch={width:2,height:2,db,stats:{p02:-20,p98:-5},sourceWindow:[0,0,2,2],geoMesh:{segments:1,sourceWindow:[0,0,2,2],validNodeCount:4,nodes:[[{pixel:0,line:0,lon:0,lat:1},{pixel:2,line:0,lon:1,lat:1}],[{pixel:0,line:2,lon:0,lat:0},{pixel:2,line:2,lon:1,lat:0}]]}};
  const terrain={bbox:[0,0,1,1],width:2,height:2,elevation:Float64Array.from([10,20,5,15]),rawDem:true};
  const water={geometry:{slope:Float32Array.from([.1,.2,.1,.2]),aspect:Float32Array.from([0,.5,1,1.5]),curvature:new Float32Array(4),conveyance:Float32Array.from([0,.7,0,.9])}};
  const out=buildTerrainShapedSarSurface(patch,terrain,water);
  assert.deepEqual(Array.from(db),before,'display shaping mutated measured dB samples');
  assert.equal(out.evidence.sarMeasured,true);
  assert.equal(out.evidence.displayDerived,true);
  assert.equal(out.evidence.waterObserved,false);
  assert.ok(out.stats.terrainCoverage>.9);
  assert.match(out.boundary,/Original SAR dB\/power arrays are unchanged/i);
  assert.equal(out.rgba.length,16);
});
