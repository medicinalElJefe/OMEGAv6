import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/data-native-surface-runtime.mjs',import.meta.url),'utf8');

test('R257 suppresses support overlays atomically once shaped measured SAR owns the image',()=>{
  assert.match(source,/forceStyle\('\.omega-regional-sar-layer canvas','opacity',shaped\?\.012:null\)/);
  assert.match(source,/forceStyle\('\.omega-regional-sar-layer canvas','transition',shaped\?'none':null\)/);
  assert.match(source,/forceStyle\('\.omega-global-sar-fabric canvas','opacity',shaped\?\.004:null\)/);
  assert.match(source,/forceStyle\('\.omega-global-sar-fabric canvas','transition',shaped\?'none':null\)/);
  assert.match(source,/forceStyle\('#map','opacity',exact\?\.012:null\)/);
  assert.match(source,/atomicLegacyDemotion:shaped/);
});
