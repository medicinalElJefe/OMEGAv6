import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/sentinel-console.mjs',import.meta.url),'utf8');
test('larger source windows produce denser blade georegistration support',()=>{assert.match(source,/segments=Math\.min\(12,Math\.max\(6,Math\.ceil\(span\/24\)\)\)/);assert.match(source,/R257_ADAPTIVE_SOURCE_WINDOW_BLADE_MESH/);});
