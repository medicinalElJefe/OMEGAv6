import test from 'node:test';
import assert from 'node:assert/strict';
import { haversineKm, temporalPhase, synchronizeEarthEvents } from '../src/earth-temporal-core.mjs';

test('haversine distance is zero at one coordinate and finite between known points',()=>{
  assert.equal(haversineKm({lon:-110.9747,lat:32.2226},{lon:-110.9747,lat:32.2226}),0);
  const d=haversineKm({lon:-110.9747,lat:32.2226},{lon:-111.0,lat:32.3});
  assert.ok(d>8&&d<10);
});

test('temporal phase preserves direction around the SAR frame',()=>{
  assert.equal(temporalPhase(-30,24),'BEFORE_FRAME');
  assert.equal(temporalPhase(12,24),'NEAR_FRAME_24H');
  assert.equal(temporalPhase(30,24),'AFTER_FRAME');
  assert.equal(temporalPhase(null,24),'TIME_UNRESOLVED');
});

test('synchronization ranks relation without converting proximity into evidence',()=>{
  const frame='2026-09-09T12:00:00Z',target={lon:-110.9747,lat:32.2226},events=[
    {id:'a',authority:'USGS',lon:-110.98,lat:32.23,time:'2026-09-09T16:00:00Z',title:'near'},
    {id:'b',authority:'NASA_EONET',lon:-100,lat:40,time:'2026-09-09T12:30:00Z',title:'time-near-space-far'},
    {id:'c',authority:'USGS',lon:-110.99,lat:32.24,time:'2026-09-07T12:00:00Z',title:'space-near-time-far'}
  ];
  const s=synchronizeEarthEvents(events,frame,target,{nearHours:24,nearKm:250});
  assert.equal(s.state,'SYNCHRONIZED');
  assert.equal(s.nearestTemporal.id,'b');
  assert.equal(s.nearestSpatial.id,'a');
  assert.deepEqual(s.coincident.map(x=>x.id),['a']);
  assert.equal(s.coincident[0].relationOnly,true);
  assert.match(s.boundary,/does not establish causation/i);
});
