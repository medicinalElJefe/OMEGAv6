import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ui=await readFile(new URL('../src/sar-r257-experience-orchestrator.mjs',import.meta.url),'utf8');

test('normal Explore removes redundant floating HUDs from the image',()=>{
  assert.match(ui,/body\.omega-experience #omegaDataNativeBadge\{display:none!important\}/);
  assert.match(ui,/body\.omega-experience:not\(\[data-mode=proof\]\) #omegaCellInspector\{display:none!important\}/);
});

test('proof telemetry is one reserved bounded stack and drawers take priority',()=>{
  assert.match(ui,/\.omega-r257-proof-stack\{position:absolute/);
  assert.match(ui,/body\.omega-experience\[data-mode=proof\] \.omega-r257-proof-stack\{display:grid!important/);
  assert.match(ui,/body\.omega-experience\[data-drawer\] \.omega-r257-proof-stack\{display:none!important\}/);
  assert.match(ui,/body\.omega-experience\[data-drawer\] \.omega-map-nav\{opacity:0!important/);
});

test('load state reports progressive real-source stages rather than blanking the surface',()=>{
  assert.match(ui,/MEASURED SAR/);assert.match(ui,/REGIONAL HD/);assert.match(ui,/EXACT HD/);assert.match(ui,/progressiveLoading:true/);
});
