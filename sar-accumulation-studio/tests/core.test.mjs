import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFeatureCollection } from '../src/normalize.mjs';
import { dedupeAndSort, frameState, maturityWarnings, revisitStats, knownMissionWarnings } from '../src/engine.mjs';
import { geometryContainsPoint } from '../src/geometry.mjs';
import { buildAsfQuery } from '../src/asf.mjs';
import { buildStacBody, normalizeStacItem, s3ToHttps, wktBounds } from '../src/stac.mjs';
import { chronologyMetrics, temporalPosition } from '../src/analytics.mjs';
import { percentile, rasterStats, stretchByte } from '../src/raster.mjs';

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

test('WKT is reduced to a deterministic STAC bbox and request body',()=>{
  assert.deepEqual(wktBounds('POLYGON((-112 31,-109 31,-109 34,-112 34,-112 31))'),[-112,31,-109,34]);
  const body=buildStacBody({start:'2026-09-01T00:00:00Z',end:'2026-09-08T23:59:59Z',intersectsWith:'POINT(-110.9 32.2)',limit:50});
  assert.deepEqual(body.collections,['sentinel-1-grd']);
  assert.deepEqual(body.bbox,[-110.9,32.2,-110.9,32.2]);
  assert.equal(body.limit,50);
});

test('STAC Sentinel-1 data assets are preserved as actual COG measurements',()=>{
  const item={type:'Feature',id:'S1A_TEST',geometry:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,1],[0,0]]]},bbox:[0,0,1,1],properties:{platform:'sentinel-1a',start_datetime:'2026-09-01T00:00:00Z',end_datetime:'2026-09-01T00:00:25Z','sar:product_type':'GRD','sar:instrument_mode':'IW','sar:polarizations':['VV','VH'],'sat:orbit_state':'ascending','sat:absolute_orbit':100,'sat:relative_orbit':27,'proj:epsg':4326},assets:{vv:{href:'s3://sentinel-s1-l1c/GRD/a.tiff',type:'image/tiff; application=geotiff; profile=cloud-optimized',roles:['data'],title:'VV Data'},metadata:{href:'x',type:'application/xml',roles:['metadata']}},links:[{rel:'thumbnail',href:'https://example.test/thumb'}]};
  const r=normalizeStacItem(item,'2026-09-08T00:00:00Z');
  assert.equal(r.measurement.actualPixelsAvailable,true);
  assert.equal(r.measurement.radiometricCalibrationClaimed,false);
  assert.match(r.dataAssets.vv.href,/https:\/\/sentinel-s1-l1c\.s3\.amazonaws\.com\/GRD\/a\.tiff/);
  assert.equal(r.projection.epsg,4326);
  assert.equal(r.evidence.grade,'B');
});

test('S3 URLs are converted without changing object identity',()=>{
  assert.equal(s3ToHttps('s3://bucket/a/b c.tif'),'https://bucket.s3.amazonaws.com/a/b%20c.tif');
});

test('chronology metrics expose cadence and robust long gaps',()=>{
  const records=[0,24,48,240].map((h,i)=>({id:String(i),startTime:new Date(Date.UTC(2026,0,1)+h*3600000).toISOString(),platform:'S1',relativeOrbit:1,evidence:{grade:'B'},dataAssets:i?{vv:{}}:{}}));
  const m=chronologyMetrics(records);
  assert.equal(m.count,4);
  assert.equal(m.cadence.median,24);
  assert.equal(m.pixelReady,3);
  assert.ok(m.anomalousGaps.length>=1);
  assert.equal(temporalPosition(records,new Date(records[1].startTime).getTime()+1),1);
});

test('raster display statistics are deterministic and do not imply calibration',()=>{
  assert.equal(percentile([1,2,3,4,5],.5),3);
  const s=rasterStats(new Uint16Array([0,10,20,30,40]),0);
  assert.equal(s.sampledCount,4);
  assert.equal(s.mean,25);
  assert.equal(stretchByte(5,10,20),0);
  assert.equal(stretchByte(25,10,20),255);
});
