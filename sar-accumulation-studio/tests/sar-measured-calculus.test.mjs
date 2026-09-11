import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMeasuredSpatialCalculus, renderMeasuredSpatialSurface, analyzeMeasuredTemporalSamples } from '../src/sar-measured-calculus-core.mjs';

function plane(w,h){const db=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)db[y*w+x]=2*x+3*y;return {state:'CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT',id:'S1-test',startTime:'2026-09-01T00:00:00Z',width:w,height:h,db,stats:{p02:0,p98:40},product:{rangePixelSpacing:2,azimuthPixelSpacing:3},quantity:'sigmaNought',polarization:'VV',evidence:{measured:true,inferred:false}};}

test('measured spatial calculus recovers physical gradient from a calibrated plane',()=>{
  const c=buildMeasuredSpatialCalculus(plane(9,9)),i=4*9+4;assert.equal(c.state,'MEASURED_SPATIAL_CALCULUS_READY');assert.ok(Math.abs(c.arrays.gradient[i]-Math.SQRT2)<1e-5,`gradient ${c.arrays.gradient[i]}`);assert.ok(Math.abs(c.arrays.curvature[i])<1e-6);assert.equal(c.stats.validCount,81);assert.equal(c.metric.source,'SAFE_PRODUCT_PIXEL_SPACING');assert.equal(c.derivativeUnits.gradient,'dB/m');assert.match(c.boundary,/not new measurements/i);
});

test('regional downsampling scales the physical derivative metric by source-window sampling',()=>{
  const p=plane(10,10);p.sourceWindow=[100,200,1100,2200];const c=buildMeasuredSpatialCalculus(p);assert.equal(c.metric.sourcePixelsPerDisplaySample.x,100);assert.equal(c.metric.sourcePixelsPerDisplaySample.y,200);assert.equal(c.metric.x,200);assert.equal(c.metric.y,600);assert.equal(c.spacingMeters.range,200);assert.equal(c.spacingMeters.azimuth,600);
});

test('calculus refuses to invent meter spacing when no physical source metric exists',()=>{
  const p=plane(7,7);p.product={};delete p.spacing;const c=buildMeasuredSpatialCalculus(p);assert.equal(c.metric.units,'SOURCE_PIXEL_PER_DISPLAY_SAMPLE');assert.equal(c.metric.source,'NO_PHYSICAL_SPACING_DECLARED');assert.equal(c.spacingMeters,null);assert.equal(c.derivativeUnits.gradient,'dB/source-pixel');assert.match(c.boundary,/physical meter spacing is unresolved/i);
});

test('derived spatial render remains explicitly non-promoting',()=>{
  const c=buildMeasuredSpatialCalculus(plane(7,7)),surface=renderMeasuredSpatialSurface(c,'gradient');assert.equal(surface.width,7);assert.equal(surface.height,7);assert.equal(surface.rgba.length,7*7*4);assert.equal(surface.evidence.sourceMeasured,true);assert.equal(surface.evidence.displayDerived,true);assert.equal(surface.evidence.measurementPromotion,false);
});

test('temporal calculus uses acquisition time and calibrated dB without velocity claims',()=>{
  const t=analyzeMeasuredTemporalSamples([{startTime:'2026-09-01T00:00:00Z',db:-12,measured:true},{startTime:'2026-09-03T00:00:00Z',db:-10,measured:true},{startTime:'2026-09-05T00:00:00Z',db:-11,measured:true}]);assert.equal(t.state,'MEASURED_TEMPORAL_CALCULUS_READY');assert.equal(t.observations,3);assert.equal(t.deltaDb,-1);assert.ok(Math.abs(t.rateDbPerDay+.5)<1e-12);assert.equal(t.evidence.measurementPromotion,false);assert.match(t.boundary,/not ground velocity/i);
});
