import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_SCENARIO_R706,normalizeScenarioR706,parseScenarioR706,exportScenarioR706,replayScenarioR706} from '../src/relationalScenarioWorkbenchR706.mjs';
const clone=()=>JSON.parse(JSON.stringify(DEFAULT_SCENARIO_R706));
test('R706 executes three source frames with identity, scar, and Heightened derivatives',()=>{
 const result=replayScenarioR706(clone());
 assert.equal(result.canonicalHistory.length,4);
 assert.equal(result.developmental.velocity.length,3);
 assert.equal(result.developmental.acceleration.length,2);
 assert.equal(result.developmental.jerk.length,1);
 assert.equal(result.canonicalHistory[0][0].scar,0.15);
 assert.equal(result.proof.liveRuntimeVerified,false);
 assert.equal(result.proof.historicalParityVerified,false);
 assert.equal(result.summary.changes[0].id,'A');
});
test('R706 portable scenario replays from inputs and not saved output claims',()=>{
 const scenario=clone();scenario.nodes[0].continuity=0.6;
 scenario.edgeFrames[0][0].kind='BLOCKED';
 const text=exportScenarioR706(scenario);
 const restored=parseScenarioR706(text);
 assert.deepEqual(restored,normalizeScenarioR706(scenario));
 assert.deepEqual(replayScenarioR706(restored).canonicalHistory,replayScenarioR706(scenario).canonicalHistory);
 assert.notDeepEqual(replayScenarioR706(restored).canonicalHistory,replayScenarioR706(clone()).canonicalHistory);
});
test('R706 rejects forged authority, unknown endpoints, nonfinite states, and excessive inputs',()=>{
 const a=clone();a.proof={liveRuntimeVerified:true};assert.throws(()=>normalizeScenarioR706(a),/invalid scenario fields/);
 const b=clone();b.edgeFrames[1][0].to='UNKNOWN';assert.throws(()=>normalizeScenarioR706(b),/invalid edge/);
 const c=clone();c.nodes[0].continuity=Infinity;assert.throws(()=>normalizeScenarioR706(c),/invalid continuity/);
 const d=clone();d.nodes.push({...d.nodes[0]});assert.throws(()=>normalizeScenarioR706(d),/duplicate/);
 const e=clone();e.edgeFrames=[e.edgeFrames[0]];assert.throws(()=>normalizeScenarioR706(e),/3..12/);
 assert.throws(()=>parseScenarioR706(' '.repeat(131073)),/bounded/);
});
test('R706 blocked conductance and mode lenses preserve state authority',()=>{
 const a=clone();a.edgeFrames=a.edgeFrames.map(edges=>edges.map(e=>({...e,kind:'BLOCKED'})));
 const blocked=replayScenarioR706(a);
 assert.equal(blocked.canonicalHistory.at(-1)[0].continuity,a.nodes[0].continuity);
 assert.equal(blocked.canonicalHistory.at(-1)[1].continuity,a.nodes[1].continuity);
 const b=clone();b.mode='EXPLORE';
 assert.deepEqual(replayScenarioR706(b).canonicalHistory,replayScenarioR706(clone()).canonicalHistory);
});
