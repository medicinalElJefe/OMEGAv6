import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const terrain=await readFile(new URL('../src/data-native-terrain-runtime.mjs',import.meta.url),'utf8');
test('terrain detail refreshes at camera settlement rather than every animation frame',()=>{assert.match(terrain,/omega-camera-motion-settled/);assert.match(terrain,/schedule\(90\)/);});
