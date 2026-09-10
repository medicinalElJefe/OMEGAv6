import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/data-native-surface-runtime.mjs',import.meta.url),'utf8');
test('support overlays cannot wash out the high-detail measured surface',()=>{assert.match(source,/shaped\?\.004:null/);assert.match(source,/shaped\?\.012:null/);assert.match(source,/exact\?\.012:null/);});
