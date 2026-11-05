import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('tests/r284-live-earth-browser-e2e.mjs','utf8');
const waits=[...source.matchAll(/page\.waitForFunction\([\s\S]*?\);/g)].map(x=>x[0]);
assert.ok(waits.length>=3,'Earth browser test lost waitForFunction coverage');
assert.ok(source.includes("},{},{timeout:45000});"),'R356.5 analytical field waits must pass timeout as Playwright third argument');
assert.ok(!/\},\{timeout:\d+\}\);/.test(source),'Playwright waitForFunction timeout passed as second argument (function arg)');
for(const token of ['DERIVED_TRIANGULATED','BOUND MEASUREMENT FIELD','cards.length===12','data-source-state'])assert.ok(source.includes(token),'live truth assertion removed '+token);
console.log('R786 LIVE EARTH PLAYWRIGHT TIMEOUT CONTRACT PASS · 45-second third-argument waits · analytical assertions retained');
