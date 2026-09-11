import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMeasuredSpatialCalculus, renderMeasuredSpatialSurface, analyzeMeasuredTemporalSamples } from '../src/sar-measured-calculus-core.mjs';

function plane(w,h){const db=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)db[y*w+x]=2*x+3*y;return {state:'CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT',id:'S1-test',startTime:'2026-09-01T00:00:00Z',width:w,height:h,db,stats:{p02:0,p98:40},product:{rangePixelSpacing:2,azimuthPixelSpacing:3},quantity:'sigmaNought',polarization:'VV',evidence:{measured:true,inferred:false}};}

test('measured spatial calculus recovers physical gradient from a calibrated plane',()=>{
  const c=buildMeasuredSpatialCalculus(plane(9,9)),i=4*9+4;
  assert.equal(c.state,'MEASURED_SPATIAL_CALCULUS_READY');
  assert.ok(Math.abs(c.arrays.gradient[i]-Math.SQRT2)<1e-5,`gradient ${c.arrays.gradient[i]}`);
  assert.ok(Math.abs(c.arrays.curvature[i])<1e-6);
  assert.equal(c.stats.validCount,81);
  assert.match(c.boundary,/not new measurements/i);
});

test('derived spatial render remains explicitly non-promoting',()=>{
  const c=buildMeasuredSpatialCalculus(plane(7,7)),surface=renderMeasuredSpatialSurface(c,'gradient');
  assert.equal(surface.width,7);assert.equal(surface.height,7);assert.equal(surface.rgba.length,7*7*4);
  assert.equal(surface.evidence.sourceMeasured,true);assert.equal(surface.evidence.displayDerived,true);assert.equal(surface.evidence.measurementPromotion,false);
});

test('temporal calculus uses acquisition time and calibrated dB without velocity claims',()=>{
  const t=analyzeMeasuredTemporalSamples([
    {startTime:'2026-09-01T00:00:00Z',db:-12,measured:true},
    {startTime:'2026-09-03T00:00:00Z',db:-10,measured:true},
    {startTime:'2026-09-05T00:00:00Z',db:-11,measured:true}
  ]);
  assert.equal(t.state,'MEASURED_TEMPORAL_CALCULUS_READY');assert.equal(t.observations,3);assert.equal(t.deltaDb,-1);assert.ok(Math.abs(t.rateDbPerDay+.5)<1e-12);assert.equal(t.evidence.measurementPromotion,false);assert.match(t.boundary,/not ground velocity/i);
});
