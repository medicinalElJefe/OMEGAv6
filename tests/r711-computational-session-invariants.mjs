import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {executeComputationalSessionR711,restoreComputationalSessionR711} from '../src/computationalSessionR711.mjs';
const a=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'A',target:'B'});
assert.equal(a.schema,'OMEGA_COMPUTATIONAL_SESSION_R711');
assert.equal(a.frames.length,DEFAULT_SCENARIO_R706.edgeFrames.length);
assert.equal(a.continuity.frameCount,a.frames.length);
for(const f of a.frames){
 assert.equal(f.projection.frameIndex,f.frameIndex);
 assert.equal(f.resilience.sourceFrame,f.frameIndex);
 assert.ok(f.svg.includes('<svg'));
}
const b=restoreComputationalSessionR711(a.sourceJson,{origin:'A',target:'B'});
assert.deepEqual(b,a);
const mirrored=executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'A',target:'B',mirrored:true});
assert.notDeepEqual(mirrored.frames[0].projection.nodes.map(n=>n.x),a.frames[0].projection.nodes.map(n=>n.x));
assert.deepEqual(mirrored.replay.canonicalHistory,a.replay.canonicalHistory);
assert.throws(()=>executeComputationalSessionR711(DEFAULT_SCENARIO_R706,{origin:'FORGED'}),/endpoints/);
assert.throws(()=>restoreComputationalSessionR711('{}'),/R706/);
const ui=readFileSync(new URL('../src7/WovenTopologyR707.tsx',import.meta.url),'utf8');
for(const token of ['executeComputationalSessionR711','data-r711-session','data-r711-summary','data-r711-export'])assert.ok(ui.includes(token),token);
console.log('R711 integrated source session invariants PASS');
