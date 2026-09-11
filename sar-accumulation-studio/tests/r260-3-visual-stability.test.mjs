import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../src/',import.meta.url);
const [runtime,visual,experience,compositor,nativeSurface,app,woven]=await Promise.all([
  readFile(new URL('r4-runtime.mjs',root),'utf8'),
  readFile(new URL('sar-visual-stability-runtime.mjs',root),'utf8'),
  readFile(new URL('sar-experience-runtime.mjs',root),'utf8'),
  readFile(new URL('earth-canon-compositor-runtime.mjs',root),'utf8'),
  readFile(new URL('data-native-surface-runtime.mjs',root),'utf8'),
  readFile(new URL('app.mjs',root),'utf8'),
  readFile(new URL('sar-woven-motion-runtime.mjs',root),'utf8')
]);

test('R260.3 installs one final visual contract after the image formation runtimes',()=>{
  assert.match(runtime,/patchRelease:'R260\.3'/);
  assert.match(runtime,/RESPONSIVE_TWO_ZONE_COMMAND_BAR_WITH_COMPACT_TWO_ROW_PHONE_LAYOUT/);
  assert.match(runtime,/NO_CANVAS_SIZE_TRANSITIONS/);
  const detail=runtime.indexOf("import './earth-canon-r260-detail-runtime.mjs'");
  const stability=runtime.indexOf("import './sar-visual-stability-runtime.mjs'");
  assert.ok(detail>=0&&stability>detail,'visual stability contract must be imported last');
  assert.match(visual,/R260\.3_VISUAL_CONTRACT/);
  assert.match(visual,/globalThis\.OMEGA_SAR_VISUAL_STABILITY=state/);
});

test('R260.3 keeps world context crisp and subordinate to measured SAR',()=>{
  assert.match(visual,/world_relief[^}]+opacity:\.16!important/);
  assert.match(visual,/regional_shaped_sar[^}]+opacity:1!important/);
  assert.match(visual,/omega-global-sar-fabric canvas\{filter:none!important;transform:none!important/);
  assert.match(visual,/shaped\?\.004:\.075/);
  assert.match(visual,/shaped\?\.012:\.055/);
  assert.match(visual,/exact_shaped_sar'\?\.012:surface==='regional_shaped_sar'\?\.001:1/);
  assert.match(experience,/omega-global-sar-fabric canvas\{opacity:\.075!important;filter:none/);
  assert.match(experience,/omega-woven-motion canvas\{opacity:\.055!important;filter:none/);
  assert.doesNotMatch(experience,/blur\(7px\)|scale\(1\.012\)/);
  assert.match(compositor,/Math\.min\(\.075,p\.contextCeiling\*\.12\)/);
  assert.match(compositor,/Math\.min\(\.055,p\.reconstructionWeight\)/);
  assert.match(nativeSurface,/omega-jrc-water-layer canvas\{opacity:\.055!important/);
  assert.doesNotMatch(visual,/blur\(7px\)/);
  assert.doesNotMatch(visual,/scale\(1\.012\)/);
});

test('R260.3 binds command and drawer geometry without animated canvas resizing',()=>{
  assert.match(visual,/data-drawer=mission\] \.place-dock,[\s\S]*data-drawer=mission\] \.map-wrap/);
  assert.match(visual,/data-drawer=evidence\] \.place-dock,[\s\S]*data-drawer=evidence\] \.map-wrap/);
  assert.match(visual,/transition:none!important/);
  assert.match(visual,/overflow-x:hidden!important/);
  assert.match(visual,/scrollbar-gutter:stable/);
  assert.match(visual,/omega-drawer-close/);
  assert.match(visual,/panel\.inert=!open/);
  assert.match(visual,/aria-hidden/);
  assert.match(visual,/geometryKey!==lastGeometryKey/);
  assert.match(visual,/observe\(map\.closest\('\.map-wrap'\),\{childList:true,subtree:true\}\)/);
  assert.doesNotMatch(visual,/function settleCanvases\(\)[\s\S]*OMEGA_DATA_NATIVE_SURFACE\?\.redraw/);
});

test('R260.3 gives phones a contained two-row command bar and full sheet drawers',()=>{
  assert.match(visual,/@media\(max-width:760px\)/);
  assert.match(visual,/grid-template-rows:32px 32px!important/);
  assert.match(visual,/grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(visual,/left:4px!important;right:4px!important/);
  assert.match(visual,/data-drawer=mission\] \.mission-rail[\s\S]*transform:translateY\(0\)!important/);
  assert.match(visual,/env\(safe-area-inset-bottom\)/);
});

test('motion paint is evidence-bound and throttled for desktop and compact screens',()=>{
  assert.match(app,/const motionFrameMs = matchMedia\('\(max-width:760px\)'\)\.matches \? 100 : 50/);
  assert.match(app,/const hasAnimatedEvidence = state\.records\.length > 0 \|\| Boolean\(renderer\.point\)/);
  assert.match(app,/!document\.hidden && hasAnimatedEvidence/);
  assert.doesNotMatch(app,/function motionLoop\(now\) \{[^\n]+drawMap\(\); requestAnimationFrame/);
  assert.match(woven,/fpsTarget:matchMedia\('\(max-width:760px\)'\)\.matches\?10:18/);
});
