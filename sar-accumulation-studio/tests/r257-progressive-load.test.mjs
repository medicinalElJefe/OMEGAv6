import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const surface=await readFile(new URL('../src/data-native-surface-runtime.mjs',import.meta.url),'utf8');
const regional=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');

test('regional and exact display assets are retained while their higher-detail reads are in flight',()=>{
  assert.match(surface,/OMEGA_SAR_REGIONAL_MEASUREMENT\?\.state!=='LOADING'/);assert.match(surface,/OMEGA_SAR_R257_DETAIL\?\.state!=='DEEP_SOURCE_READ'/);assert.doesNotMatch(regional,/state\.state='LOADING'.*patch=null/s);
});
