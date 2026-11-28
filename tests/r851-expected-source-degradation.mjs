import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyR313RateLimitR851,matchOptionalConsoleFailureR1030} from '../src/system/r313ExpectedSourceDegradationR851.js';
const origin='http://127.0.0.1:4173';
const classify=(url,resourceType='image',method='GET',status=429)=>classifyR313RateLimitR851({url,resourceType,method,status},origin);
test('only enumerated rate-limited Earth observation resources can degrade R313',()=>{
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD'),'NOAA_SOURCE_IMAGE_DEGRADED');
 assert.equal(classify('https://tile.openstreetmap.org/6/10/20.png'),'OSM_BASEMAP_TILE_DEGRADED');
 assert.equal(classify('https://cdn.rainviewer.com/v2/radar/123/256/6/10/20/2/1_1.png'),'RAINVIEWER_RADAR_TILE_DEGRADED');
 assert.equal(classify('https://api.rainviewer.com/public/weather-maps.json','fetch'),'RAINVIEWER_CATALOG_DEGRADED');
});
const lats=[-75,-55,-35,-15,5,25,45,65].flatMap(v=>Array(12).fill(v)).join(',');
const lons=Array.from({length:8},()=>[-165,-135,-105,-75,-45,-15,15,45,75,105,135,165]).flat().join(',');
const gridUrl='https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:lats,longitude:lons,current:'temperature_2m,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m',timezone:'UTC',forecast_days:'1'});
test('only exact optional R278 global-grid 429 is degraded, never an arbitrary forecast failure',()=>{
 assert.equal(classify(gridUrl,'fetch'),'OPEN_METEO_GLOBAL_GRID_DEGRADED');
 assert.equal(classify(gridUrl+'&unexpected=1','fetch'),'BLOCKING');
 assert.equal(classify(gridUrl.replace('forecast_days=1','forecast_days=7'),'fetch'),'BLOCKING');
 assert.equal(classify(gridUrl,'fetch','POST'),'BLOCKING');
 assert.equal(classify(gridUrl,'fetch','GET',500),'BLOCKING');
 assert.equal(classify(gridUrl,'image'),'BLOCKING');
});
test('first-party failures, mutation requests, untrusted external hosts and other codes remain blocking',()=>{
 for(const url of [origin+'/api/earth/weather?lat=1',origin+'/api/earth/noaa/catalog',origin+'/api/status','https://evil-rainviewer.com/v2/radar/1','https://example.com/image.png',origin+'/assets/index.js']){
  assert.equal(classify(url),'BLOCKING',url);
 }
 for(const url of [
  'http://tile.openstreetmap.org/6/10/20.png',
  'https://tile.openstreetmap.org/6/10/20.png?unexpected=1',
  'https://cdn.rainviewer.com/v2/radar/123/256/6/10/20/2/1_1.png?extra=1',
  'http://cdn.rainviewer.com/v2/radar/123/256/6/10/20/2/1_1.png',
  'https://cdn.rainviewer.com/v2/radar/123/unrelated',
  'https://api.rainviewer.com/public/weather-maps.json?unexpected=1',
  'http://api.rainviewer.com/public/weather-maps.json'
 ])assert.equal(classify(url,url.includes('weather-maps.json')?'fetch':'image'),'BLOCKING',url);
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage='),'BLOCKING');
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD&mode=privileged'),'BLOCKING');
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD','fetch'),'BLOCKING');
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD','image','POST'),'BLOCKING');
 assert.equal(classify(origin+'/api/earth/noaa/image?coverage=G19-FD','image','GET',500),'BLOCKING');
 assert.equal(classify('https://tile.openstreetmap.org/6/10/20.png','image','GET',404),'BLOCKING');
});

test('R1030 exact external 503 degrades optional observations, not first-party services',()=>{
 assert.equal(classify(gridUrl,'fetch','GET',503),'OPEN_METEO_GLOBAL_GRID_DEGRADED');
 assert.equal(classify('https://tile.openstreetmap.org/6/10/20.png','image','GET',503),'OSM_BASEMAP_TILE_DEGRADED');
 assert.equal(classify('https://api.rainviewer.com/public/weather-maps.json','fetch','GET',503),'RAINVIEWER_CATALOG_DEGRADED');
 for(const url of [origin+'/api/status',origin+'/api/earth/noaa/image?coverage=G19-FD',origin+'/assets/main.js','https://example.com/image.png',gridUrl+'&extra=1'])assert.equal(classify(url,url===gridUrl+'&extra=1'?'fetch':'image','GET',503),'BLOCKING',url);
 const response={status:503,url:new URL(gridUrl).href,method:'GET',resourceType:'fetch'};
 const rows=[response];
 const msg={text:'Failed to load resource: the server responded with a status of 503 (Service Unavailable)',url:response.url};
 assert.equal(matchOptionalConsoleFailureR1030({...msg,url:''},rows,origin),false);
 assert.equal(matchOptionalConsoleFailureR1030({...msg,url:origin+'/api/status'},rows,origin),false);
 assert.equal(matchOptionalConsoleFailureR1030({...msg,text:msg.text.replace('503','429')},rows,origin),false);
 assert.equal(matchOptionalConsoleFailureR1030(msg,rows,origin),true);
 assert.equal(matchOptionalConsoleFailureR1030(msg,rows,origin),false);
});
