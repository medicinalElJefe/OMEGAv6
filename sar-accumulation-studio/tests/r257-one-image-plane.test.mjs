import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const surface=await readFile(new URL('../src/data-native-surface-runtime.mjs',import.meta.url),'utf8');
test('the shaped measured surface dominates raw regional and support canvases',()=>{assert.match(surface,/REGIONAL_SHAPED_SAR/);assert.match(surface,/\.012/);assert.match(surface,/\.004/);});
