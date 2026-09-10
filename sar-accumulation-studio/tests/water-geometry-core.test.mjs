import test from 'node:test';
import assert from 'node:assert/strict';
import { terrariumElevation, deriveWaterGeometry, traceDrainage, waterGeometrySummary } from '../src/water-geometry-core.mjs';

test('Terrarium RGB decoding preserves signed elevation',()=>{
  assert.equal(terrariumElevation(128,0,0),0);
  assert.equal(terrariumElevation(128,1,0),1);
  assert.equal(terrariumElevation(127,255,0),-1);
  assert.equal(terrariumElevation(128,0,128),.5);
});

test('synthetic valley drains toward its low outlet without inventing uphill flow',()=>{
  const w=7,h=7,e=new Float64Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const valley=Math.abs(x-3)*18;
    e[y*w+x]=300-y*12+valley;
  }
  const g=deriveWaterGeometry(e,w,h,{lonSpanDeg:.01,latSpanDeg:.01,centerLat:32});
  const start=0*w+3,path=traceDrainage(g,start);
  assert.ok(path.length>=5);
  for(let k=1;k<path.length;k++)assert.ok(e[path[k]]<e[path[k-1]],`step ${k} did not descend`);
  const outlet=path.at(-1),outletY=Math.floor(outlet/w);assert.equal(outletY,h-1);
  assert.ok(g.accumulation[outlet]>=h,'valley outlet did not accumulate upstream cells');
  assert.match(g.boundary,/not observed water depth/i);
});

test('flat DEM remains sinks instead of fabricating channels',()=>{
  const w=5,h=5,e=new Float64Array(w*h).fill(100);
  const g=deriveWaterGeometry(e,w,h,{lonSpanDeg:.01,latSpanDeg:.01,centerLat:0});
  assert.equal([...g.flowTo].filter(x=>x>=0).length,0);
  assert.equal(g.sinks.length,w*h);
  assert.equal(waterGeometrySummary(g).channelPotentialCells,0);
});
