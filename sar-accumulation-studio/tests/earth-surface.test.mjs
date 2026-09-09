import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildGibsWmsUrl, fallbackDates, gibsContextManifest, GIBS_LAYERS } from '../src/gibs.mjs';

const here=dirname(fileURLToPath(import.meta.url));

test('NASA GIBS world surface request stays georegistered in EPSG:4326',()=>{
  const url=new URL(buildGibsWmsUrl({bbox:[-180,-90,180,90],date:'2026-09-08',width:1200,height:600,layers:[GIBS_LAYERS.trueColor]}));
  assert.equal(url.hostname,'gibs.earthdata.nasa.gov');
  assert.equal(url.searchParams.get('SRS'),'EPSG:4326');
  assert.equal(url.searchParams.get('BBOX'),'-180,-90,180,90');
  assert.equal(url.searchParams.get('TIME'),'2026-09-08');
  assert.equal(url.searchParams.get('LAYERS'),GIBS_LAYERS.trueColor);
});

test('Earth surface fallback walks backward in UTC without inventing imagery dates',()=>{
  assert.deepEqual(fallbackDates('2026-09-08',3),['2026-09-08','2026-09-07','2026-09-06','2026-09-05']);
});

test('GIBS manifest never promotes Earth context into SAR measurement',()=>{
  const manifest=gibsContextManifest({bbox:[-10,-5,10,5],date:'2026-09-07',requestedDate:'2026-09-08',fallbackDays:1,layers:[GIBS_LAYERS.trueColor],url:'https://gibs.earthdata.nasa.gov/example'});
  assert.equal(manifest.authority,'NASA EOSDIS GIBS');
  assert.equal(manifest.measurementPromotion,false);
  assert.equal(manifest.fallbackDays,1);
  assert.match(manifest.semantics,/does not replace SAR measurement pixels/i);
});

test('R3 primary instrument defaults to Earth plus SAR evidence, not footprint graphics',async()=>{
  const app=await readFile(resolve(here,'..','src','app.mjs'),'utf8');
  const html=await readFile(resolve(here,'..','index.html'),'utf8');
  assert.match(app,/visual:\s*'earth'/);
  assert.match(html,/<option value="earth" selected>Earth \+ SAR evidence<\/option>/);
  assert.match(html,/<h2>SAR Earth surface<\/h2>/);
  assert.match(html,/footprints\/proofs are overlays/i);
});
