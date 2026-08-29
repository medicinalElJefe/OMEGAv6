import fs from 'node:fs';
import assert from 'node:assert/strict';

const panel=fs.readFileSync('src/ForecastSovereignPanel.tsx','utf8');
const runtime=fs.readFileSync('src/forecastRuntime.ts','utf8');
assert(panel.includes('Dominant motion trace · human-readable state traversal'),'forecast UI must expose a human-readable motion trace');
for(const token of ['edge {x.edge}','decision {x.allModes.mode188Decision}','temporal {fmt(x.temporal.score)}','directional {fmt(x.temporal.directional)}','jerk {fmt(x.temporal.jerk)}','proof {fmt(x.proof)}'])assert(panel.includes(token),`forecast trace missing ${token}`);
assert(panel.includes('Each row is one legal model transition, not an invented minute/hour interval.'),'forecast trace must disclose relative-transition clock authority');
assert(runtime.includes("'relative transition units'"),'runtime must retain relative transition units for CANON_PHASE');
assert(runtime.includes('Clock duration is not inferred without timestamp intervals'),'runtime must retain no-fake-clock boundary');
assert(!panel.includes('@appdeploy/client')&&!runtime.includes('@appdeploy/client'),'forecast path must remain portable and AppDeploy-free');
console.log('PASS forecast-motion-r13-invariants');
