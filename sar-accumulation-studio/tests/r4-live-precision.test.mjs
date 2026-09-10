import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAge, precisionTruth } from '../src/r4-live-precision.mjs';

test('live precision age is explicit elapsed time and never negative',()=>{
  const now=Date.parse('2026-09-10T00:00:00Z');
  assert.equal(formatAge('2026-09-09T23:59:30Z',now),'30s');
  assert.equal(formatAge('2026-09-09T23:00:00Z',now),'1.0h');
  assert.equal(formatAge('2026-09-08T00:00:00Z',now),'2.0d');
  assert.equal(formatAge('2026-09-10T01:00:00Z',now),'0s');
});

test('precision surface never upgrades browse or reconstructed cells into measurement',()=>{
  const source=precisionTruth({sourceFrame:{src:'quicklook.png'},field:{cells:[{value:1}]}});
  assert.equal(source.surface,'SOURCE SAR');
  assert.equal(source.measured,false);
  assert.equal(source.measurementPromotion,false);
  const reconstructed=precisionTruth({field:{cells:[{value:1}]}});
  assert.equal(reconstructed.surface,'Ω RECONSTRUCTION');
  assert.equal(reconstructed.measured,false);
  assert.equal(reconstructed.inferred,false);
});

test('precision surface admits measured state only from explicit measured overlay proof',()=>{
  const measured=precisionTruth({overlay:{measurement:true},sourceFrame:{src:'quicklook.png'},field:{cells:[{value:1}]}});
  assert.equal(measured.surface,'CALIBRATED SAR');
  assert.equal(measured.measured,true);
  assert.equal(measured.measurementPromotion,true);
});
