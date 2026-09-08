import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFeatureCollection } from '../src/normalize.mjs';
import { dedupeAndSort, frameState, maturityWarnings, revisitStats, knownMissionWarnings } from '../src/engine.mjs';
import { geometryContainsPoint } from '../src/geometry.mjs';
import { buildAsfQuery } from '../src/asf.mjs';

const fc = {
  type:'FeatureCollection', features:[
    {type:'Feature',geometry:{type:'Polygon',coordinates:[[[0,0],[2,0],[2,2],[0,2],[0,0]]]},properties:{fileID:'B',platform:'Sentinel-1A',startTime:'2026-01-02T00:00:00Z'}},
    {type:'Feature',geometry:{type:'Polygon',coordinates:[[[0,0],[2,0],[2,2],[0,2],[0,0]]]},properties:{fileID:'A',platform:'Sentinel-1A',startTime:'2026-01-01T00:00:00Z'}},
    {type:'Feature',geometry:{type:'Polygon',coordinates:[[[0,0],[2,0],[2,2],[0,2],[0,0]]]},properties:{fileID:'A',platform:'Sentinel-1A',startTime:'2026-01-01T00:00:00Z',orbitQuality:'PRECISE'}}
  ]
};

test('normalizes, de-duplicates by stable ID and prefers stronger evidence',()=>{
  const {records}=normalizeFeatureCollection(fc,{authority:'ASF DAAC'});
  const sorted=dedupeAndSort(records);
  assert.equal(sorted.length,2);
  assert.equal(sorted[0].id,'A');
  assert.equal(sorted[0].evidence.grade,'A');
  assert.equal(sorted[1].id,'B');
});

test('frame accumulation never invents observations',()=>{
  const {records}=normalizeFeatureCollection(fc,{authority:'ASF DAAC'});
  const sorted=dedupeAndSort(records);
  assert.equal(frameState(sorted,0,'accumulate').visible.length,1);
  assert.equal(frameState(sorted,1,'accumulate').visible.length,2);
  assert.equal(frameState(sorted,1,'single').visible.length,1);
  assert.ok(frameState(sorted,1).visible.every(r=>r.measured && !r.inferred));
});

test('point coverage and revisit statistics use actual acquisition timestamps',()=>{
  const {records}=normalizeFeatureCollection(fc,{authority:'ASF DAAC'});
  const sorted=dedupeAndSort(records);
  const stats=revisitStats(sorted,1,1);
  assert.equal(stats.hitCount,2);
  assert.equal(stats.meanHours,24);
});

test('dateline-crossing polygon containment is handled',()=>{
  const geom={type:'Polygon',coordinates:[[[179,-2],[-179,-2],[-179,2],[179,2],[179,-2]]]};
  assert.equal(geometryContainsPoint(geom,179.5,0),true);
  assert.equal(geometryContainsPoint(geom,-179.5,0),true);
  assert.equal(geometryContainsPoint(geom,0,0),false);
});

test('mixed maturity is explicitly warned',()=>{
  const records=[{platform:'NISAR',maturity:'BETA',evidence:{grade:'B'}},{platform:'NISAR',maturity:'PROVISIONAL',evidence:{grade:'B'}}];
  assert.ok(maturityWarnings(records).some(w=>w.includes('Mixed NISAR BETA + PROVISIONAL')));
});

test('ASF query uses preferred dataset + geojson and exact UTC boundaries',()=>{
  const url=new URL(buildAsfQuery({dataset:'NISAR',start:'2026-08-01',end:'2026-08-02',dataMaturity:'PROVISIONAL',processingLevel:'GCOV',maxResults:5}));
  assert.equal(url.searchParams.get('dataset'),'NISAR');
  assert.equal(url.searchParams.get('output'),'geojson');
  assert.equal(url.searchParams.get('dataMaturity'),'PROVISIONAL');
  assert.equal(url.searchParams.get('maxResults'),'5');
  assert.match(url.searchParams.get('start'),/^2026-08-01T00:00:00.000Z$/);
});

test('known NISAR instrument gap is surfaced when a query overlaps it',()=>{
  const warnings=knownMissionWarnings({dataset:'NISAR',start:'2026-07-20T00:00:00Z',end:'2026-08-15T00:00:00Z'});
  assert.equal(warnings.length,1);
  assert.match(warnings[0],/2026-07-27T22:03:25Z/);
  assert.equal(knownMissionWarnings({dataset:'NISAR',start:'2026-08-15T00:00:00Z',end:'2026-09-01T00:00:00Z'}).length,0);
});
