import test from 'node:test';
import assert from 'node:assert/strict';
import { isGlobalFabricSearchBody } from '../src/sar-global-fabric-coherence-transport.mjs';

test('R258.2 identifies only descending bbox searches as global-fabric sector queries',()=>{
  assert.equal(isGlobalFabricSearchBody({collections:['sentinel-1-grd'],bbox:[-180,-85,-120,-28.3],limit:24,sortby:[{field:'properties.datetime',direction:'desc'}]}),true);
  assert.equal(isGlobalFabricSearchBody({collections:['sentinel-1-grd'],bbox:[-111,32,-110,33],limit:24,sortby:[{field:'properties.datetime',direction:'asc'}]}),false);
  assert.equal(isGlobalFabricSearchBody({collections:['sentinel-1-grd'],intersects:{type:'Point',coordinates:[-111,32]},sortby:[{field:'properties.datetime',direction:'desc'}]}),false);
});

test('R258.2 does not classify unrelated STAC collections as fabric transport',()=>{
  assert.equal(isGlobalFabricSearchBody({collections:['landsat-c2-l2'],bbox:[-10,-10,10,10],sortby:[{field:'properties.datetime',direction:'desc'}]}),false);
  assert.equal(isGlobalFabricSearchBody(null),false);
});
