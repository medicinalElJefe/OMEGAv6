import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const s=readFileSync(new URL('../src/WeatherRadarMapR580.tsx',import.meta.url),'utf8');
assert.match(s,/left:\(x\+0\.5-pos\.x\)\*256/);
assert.match(s,/top:\(y\+0\.5-pos\.y\)\*256/);
assert.match(s,/\/256\/.*\/2\/1_1\.png/);
assert.match(s,/Radar observation timeline/);
assert.match(s,/api\.rainviewer\.com\/public\/weather-maps\.json/);
console.log('R581 map tile center, radar overlay and timeline source contract PASS');
