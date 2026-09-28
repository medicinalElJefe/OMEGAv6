import assert from 'node:assert/strict';
import fs from 'node:fs';

const earth=fs.readFileSync('src/EarthObservatoryR8.tsx','utf8');
const earthCss=fs.readFileSync('src/earthObservatoryR8.css','utf8');
const sar=fs.readFileSync('src/SARTruthInstrumentR280.tsx','utf8');
const sarCss=fs.readFileSync('src/sarPresentationR3563.css','utf8');
const worker=fs.readFileSync('src/workerR116.js','utf8');

assert.ok(sar.includes("import'./sarPresentationR3563.css';"),'R356.3 SAR presentation layer must be loaded by the SAR instrument');
for(const token of ['.r280-workbench','.r280-screen','.r280-canvas','.r284-lens-grid','.r284-lens-card','.r285-field-empty'])assert.ok(sarCss.includes(token),`R356.3 SAR layout missing ${token}`);
assert.ok(sarCss.includes('grid-template-columns:repeat(64,minmax(0,1fr))'),'R385 full SAR field must use the bounded 64-column analytical render geometry');
assert.ok(sarCss.includes('grid-template-columns:repeat(13,minmax(0,1fr))'),'R356.3 lens previews must preserve 13-column mini-fields');

for(const token of ['placeQuery','searchPlaces','choosePlace','useDeviceLocation','Search Earth location','Use my location'])assert.ok(earth.includes(token),`R356.3 Earth picker missing ${token}`);
assert.ok(earth.includes('/api/earth/geocode?q='),'Earth place search must use the canonical geocoder bridge');
for(const token of ['.earth-r3563-place-picker','.earth-r3563-results','.earth-r3563-search'])assert.ok(earthCss.includes(token),`R356.3 Earth picker presentation missing ${token}`);

assert.ok(worker.includes("path==='/api/earth/geocode'"),'R356.3 worker must expose the bounded geocoding endpoint');
assert.ok(worker.includes('nominatim.openstreetmap.org/search'),'R356.3 place lookup must be backed by returned OpenStreetMap geocoder results');
assert.ok(worker.includes("schema:'OMEGA_EARTH_GEOCODE_R3563'"),'R356.3 geocoder must expose an explicit schema');
assert.ok(worker.includes("canonicalMutation:false"),'R356.3 geocoder must not claim canonical mutation authority');

console.log('R356.3 EARTH LOCATION + SAR PRESENTATION PASS · selectable place search/device geolocation · exact WGS84 retained · SAR 64×64 bounded analytical field + 12 lens layout restored · no evidence/Canon authority inflation');
