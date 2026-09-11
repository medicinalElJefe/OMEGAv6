import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const ui=await readFile(new URL('../src/sar-r258-experience-runtime.mjs',import.meta.url),'utf8');
const calc=await readFile(new URL('../src/sar-r258-calculus-runtime.mjs',import.meta.url),'utf8');

test('R258 removes duplicate image layers once shaped measurement owns the camera',()=>{
  assert.match(ui,/regional_shaped_sar[^\n]*#map[^\n]*opacity:\.001!important/);
  assert.match(ui,/body\.omega-experience \.sar-source-browse-layer\{opacity:0!important;visibility:hidden!important\}/);
  assert.match(ui,/#omegaPrecisionStrip\{display:none!important/);
  assert.match(ui,/map-wrap:after\{display:none!important/);
  assert.match(ui,/DATA_PANEL_ONLY_NOT_MAIN_IMAGE/);
});

test('drawers and proof reserve geometry instead of covering SAR pixels',()=>{
  assert.match(ui,/data-drawer=evidence[^\n]*map-wrap[^\n]*width:calc/);
  assert.match(ui,/data-drawer=mission[^\n]*map-wrap[^\n]*margin-left/);
  assert.match(ui,/data-drawer=analysis[^\n]*map-wrap[^\n]*height:calc/);
  assert.match(ui,/data-mode=proof[^\n]*map-wrap[^\n]*width:calc/);
  assert.match(ui,/ONE_IMAGE_PLANE_WITH_RESERVED_TOOL_ZONES/);
});

test('measured calculus provides source-bound spatial and temporal views',()=>{
  for(const mode of ['detail','measured','gradient','curvature','texture','relief'])assert.match(calc,new RegExp(`'${mode}'`));
  assert.match(calc,/RESOLVE 6-SCENE TARGET STACK/);
  assert.match(calc,/measurementPromotion:false|never promoted/i);
});
