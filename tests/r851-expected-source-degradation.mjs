import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyR313RateLimitR851} from '../src/system/r313ExpectedSourceDegradationR851.js';
const origin='http://127.0.0.1:4173';
const classify=(url,resourceType='image',method='GET',status=429)=>classifyR313RateLimitR851({url,resourceType,method,status},origin);
test('only enumerated rate-limited Earth observation resources can degrade R313',()=>{
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD'),'NOAA_SOURCE_IMAGE_DEGRADED');
 assert.equal(classify('https://tile.openstreetmap.org/6/10/20.png'),'OSM_BASEMAP_TILE_DEGRADED');
 assert.equal(classify('https://cdn.rainviewer.com/v2/radar/123/256/6/10/20/2/1_1.png'),'RAINVIEWER_RADAR_TILE_DEGRADED');
 assert.equal(classify('https://api.rainviewer.com/public/weather-maps.json','fetch'),'RAINVIEWER_CATALOG_DEGRADED');
});
test('first-party failures, mutation requests, untrusted external hosts and other codes remain blocking',()=>{
 for(const url of [origin+'/api/earth/weather?lat=1',origin+'/api/earth/noaa/catalog',origin+'/api/status','https://evil-rainviewer.com/v2/radar/1','https://example.com/image.png',origin+'/assets/index.js']){
  assert.equal(classify(url),'BLOCKING',url);
 }
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage='),'BLOCKING');
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD&mode=privileged'),'BLOCKING');
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD','fetch'),'BLOCKING');
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD','image','POST'),'BLOCKING');
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD','image','GET',500),'BLOCKING');
 assert.equal(classify('https://tile.openstreetmap.org/6/10/20.png','image','GET',404),'BLOCKING');
});
