import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/sar-browser-transport-resilience.mjs',import.meta.url),'utf8');

test('R260.6 retries transient source terrain tile transport without broadening semantics',()=>{
  assert.match(source,/TRANSIENT=new Set\(\[429,500,502,503,504\]\)/);
  assert.match(source,/DELAYS=\[0,180,520,1250\]/);
  assert.match(source,/\(\?:raster\|source\|terrain\|stac\\\/item\)/);
  assert.match(source,/same-origin Sentinel source\/raster\/STAC item and source terrain tile transport/);
  assert.match(source,/never converts failed evidence into measurement/);
  assert.match(source,/does not|never.*substitutes terrain/i);
  assert.match(source,/!\['GET','HEAD'\]\.includes\(method\)/);
});

test('R260.6 still leaves semantic 4xx and exhausted failures explicit',()=>{
  assert.match(source,/if\(!TRANSIENT\.has\(response\.status\)\)/);
  assert.match(source,/if\(i===DELAYS\.length-1\)\{state\.failed\+\+/);
  assert.match(source,/recovered:i>0/);
});
