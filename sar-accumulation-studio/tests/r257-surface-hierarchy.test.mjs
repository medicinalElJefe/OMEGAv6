import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/data-native-surface-runtime.mjs',import.meta.url),'utf8');

test('R257 suppresses support overlays once shaped measured SAR owns the image',()=>{
  assert.match(source,/forceOpacity\('\.omega-regional-sar-layer canvas',surface==='REGIONAL_SHAPED_SAR'\?\.012:null\)/);assert.match(source,/forceOpacity\('\.omega-global-sar-fabric canvas',shaped\?\.004:null\)/);assert.match(source,/forceOpacity\('#map',exact\?\.012:null\)/);
});
