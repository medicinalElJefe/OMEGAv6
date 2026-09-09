import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFeatureCollection } from '../src/normalize.mjs';
import { dedupeAndSort, frameState, maturityWarnings, revisitStats, knownMissionWarnings } from '../src/engine.mjs';
import { geometryContainsPoint } from '../src/geometry.mjs';
import { buildAsfQuery } from '../src/asf.mjs';
import { buildStacBody, normalizeStacItem, s3ToHttps, wktBounds, wktPoint } from '../src/stac.mjs';
import { chronologyMetrics, temporalPosition } from '../src/analytics.mjs';
import { percentile, rasterStats, stretchByte } from '../src/raster.mjs';
import { atlasAddress, atlasHierarchy, deweyAtlasEstimate, nominalCellScaleKm } from '../src/atlas.mjs';
import { buildGibsWmsUrl, GIBS_LAYERS, gibsContextManifest } from '../src/gibs.mjs';

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

test('POINT WKT becomes a GeoJSON intersects query and never a zero-area bbox',()=>{
  assert.deepEqual(wktPoint('POINT(-110.9 32.2)'),{type:'Point',coordinates:[-110.9,32.2]});
  const body=buildStacBody({start:'2026-09-01T00:00:00Z',end:'2026-09-08T23:59:59Z',intersectsWith:'POINT(-110.9 32.2)',limit:50});
  assert.deepEqual(body.collections,['sentinel-1-grd']);
  assert.deepEqual(body.intersects,{type:'Point',coordinates:[-110.9,32.2]});
  assert.equal('bbox' in body,false);
  assert.equal(body.limit,50);
});

test('polygon WKT retains deterministic non-zero STAC bbox',()=>{
  assert.deepEqual(wktBounds('POLYGON((-112 31,-109 31,-109 34,-112 34,-112 31))'),[-112,31,-109,34]);
  const body=buildStacBody({intersectsWith:'POLYGON((-112 31,-109 31,-109 34,-112 34,-112 31))'});
  assert.deepEqual(body.bbox,[-112,31,-109,34]);
});

test('explicit zero-area STAC bbox is rejected rather than sent upstream',()=>{
  assert.throws(()=>buildStacBody({bbox:[-110.9,32.2,-110.9,32.2]}),/non-zero area/);
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

test('Atlas hierarchy uses address-resolution levels rather than physical dimensions',()=>{
  const hierarchy=atlasHierarchy(-110.9747,32.2226);
  assert.deepEqual(hierarchy.map(x=>x.level),[12,144,1728,20736]);
  assert.ok(hierarchy.every(x=>x.address.startsWith(`A${x.level}-F`)));
  assert.ok(nominalCellScaleKm(20736)<nominalCellScaleKm(12));
  const a=atlasAddress(-110.9747,32.2226,20736);
  assert.ok(a.index>=0&&a.index<20736);
});

test('Dewey Atlas fills only from measured anchors and remains explicitly inferred',()=>{
  const time='2026-09-08T12:00:00Z';
  const anchors=[
    {id:'a',lon:-111.01,lat:32.20,time,value:10,grade:'A',measured:true},
    {id:'b',lon:-110.94,lat:32.20,time,value:12,grade:'B',measured:true},
    {id:'c',lon:-110.97,lat:32.27,time,value:11,grade:'B',measured:true},
    {id:'fake',lon:-110.97,lat:32.22,time,value:999,grade:'A',measured:false}
  ];
  const result=deweyAtlasEstimate(anchors,{lon:-110.9747,lat:32.2226,time});
  assert.equal(result.state,'INFERRED_ATLAS');
  assert.equal(result.measured,false);
  assert.equal(result.inferred,true);
  assert.ok(result.value>9&&result.value<13);
  assert.ok(result.support.spatialLocations>=3);
  assert.ok(result.confidence>=0&&result.confidence<=1);
});

test('Dewey Atlas preserves an unresolved gap with no measured support',()=>{
  const result=deweyAtlasEstimate([{lon:0,lat:0,time:'2026-01-01T00:00:00Z',value:1,measured:false}],{lon:0,lat:0,time:'2026-01-01T00:00:00Z'});
  assert.equal(result.state,'GAP_UNRESOLVED');
  assert.equal(result.inferred,false);
});

test('NASA GIBS context is timestamped geospatial context and never promoted to SAR measurement',()=>{
  const url=new URL(buildGibsWmsUrl({bbox:[-112,31,-109,34],date:'2026-09-08',width:800,height:600,layers:[GIBS_LAYERS.trueColor,GIBS_LAYERS.fires]}));
  assert.equal(url.searchParams.get('SERVICE'),'WMS');
  assert.equal(url.searchParams.get('VERSION'),'1.1.1');
  assert.equal(url.searchParams.get('SRS'),'EPSG:4326');
  assert.equal(url.searchParams.get('TIME'),'2026-09-08');
  assert.match(url.searchParams.get('LAYERS'),/VIIRS_NOAA21_CorrectedReflectance_TrueColor/);
  const manifest=gibsContextManifest({bbox:[-112,31,-109,34],date:'2026-09-08',layers:[GIBS_LAYERS.trueColor],url:url.toString()});
  assert.equal(manifest.kind,'NEAR_REAL_TIME_CONTEXT');
  assert.equal(manifest.measurementPromotion,false);
});
