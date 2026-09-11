import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/sar-primary-workstation-runtime.mjs',import.meta.url),'utf8');

test('R258 primary controls stay bounded to the reserved command strip',()=>{
  assert.match(source,/\.omega-sar-primary-controls\{[^}]*height:28px!important;[^}]*max-height:28px!important;[^}]*flex-wrap:nowrap!important;/s);
  assert.match(source,/\.omega-sar-primary-controls button\{[^}]*height:28px!important;[^}]*max-height:28px!important;/s);
  assert.match(source,/\.place-dock\{[^}]*height:36px!important;[^}]*box-sizing:border-box!important/s);
});

test('compact geometry changes presentation only, not SAR evidence authority',()=>{
  assert.doesNotMatch(source,/evidence\.measured\s*=|measurementPromotion\s*=|CALIBRATED_SENTINEL1_TARGET_PATCH\s*=/);
  assert.match(source,/currentExact\(\).*CALIBRATED_SENTINEL1_TARGET_PATCH/s);
  assert.match(source,/currentRegional\(\).*CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT/s);
});
