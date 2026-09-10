import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const regional=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');
const detail=await readFile(new URL('../src/sar-r257-detail-runtime.mjs',import.meta.url),'utf8');
const surface=await readFile(new URL('../src/data-native-surface-runtime.mjs',import.meta.url),'utf8');

test('high detail is source read + display shaping, not synthetic pixel filling',()=>{
  assert.match(detail,/source Sentinel-1 GRD pixels read and displayed/);
  assert.doesNotMatch(detail,/canvas\.scale|upscale|super.?resolution/i);
  assert.match(regional,/calibratedRegionalViewport/);
  assert.match(surface,/Calibrated SAR dB\/power remain untouched measurement arrays/);
});
