import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706,exportScenarioR706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {projectWovenTopologyR707,exportWovenTopologySvgR707} from '../src/wovenTopologyProjectionR707.mjs';
const clone=()=>JSON.parse(exportScenarioR706(DEFAULT_SCENARIO_R706));
test('R707 uses actual inherited source frame state, typed edges and deterministic export',()=>{
 const scenario=clone(),p=projectWovenTopologyR707(scenario,0);
 assert.equal(p.truthClass,'LOCAL_COMPUTED_VECTOR_MODEL_ONLY');
 assert.equal(p.nodes.length,2);assert.equal(p.edges.length,2);
 assert.equal(p.topology.returns,1);assert.ok(p.topology.directedCycles>=1);
 assert.deepEqual(p,projectWovenTopologyR707(scenario,0));
 assert.notEqual(p.nodes[0].continuity,scenario.nodes[0].continuity);
 assert.equal(p.edges[0].kind,'INGRESS');assert.equal(p.edges[1].kind,'RETURN');
 const svg=exportWovenTopologySvgR707(scenario,0);
 assert.ok(svg.includes('<svg '));assert.ok(svg.includes('MODEL ONLY'));
 assert.ok(svg.includes('data-kind="INGRESS"'));assert.ok(svg.includes('data-kind="RETURN"'));
 assert.ok(!/<script|onload=|onclick=|javascript:/i.test(svg));
 assert.equal(svg,exportWovenTopologySvgR707(scenario,0));
});
test('R707 mirror is a coordinate-frame reflection, not a state mutation',()=>{
 const s=clone(),a=projectWovenTopologyR707(s,1,false),b=projectWovenTopologyR707(s,1,true);
 for(let i=0;i<a.nodes.length;i++){
  assert.equal(Math.round((a.nodes[i].x+b.nodes[i].x)*100)/100,640);
  assert.equal(a.nodes[i].y,b.nodes[i].y);
  assert.equal(a.nodes[i].continuity,b.nodes[i].continuity);
  assert.equal(a.nodes[i].scar,b.nodes[i].scar);
 }
 assert.notEqual(a.edges[0].path,b.edges[0].path);
 assert.deepEqual(s,clone());
});
test('R707 preserves blocked conductance, multi-parent, self-loops and returning cycles',()=>{
 const s=clone();s.nodes.push({id:'C',continuity:0.5,scar:0,contradiction:0,plasticity:1});
 s.edgeFrames=s.edgeFrames.map(()=>[
  {from:'A',to:'C',kind:'INGRESS',weight:0.4},
  {from:'B',to:'C',kind:'EGRESS',weight:0.2},
  {from:'C',to:'A',kind:'RETURN',weight:0.3},
  {from:'C',to:'C',kind:'RESIDUE',weight:0.1},
  {from:'B',to:'A',kind:'BLOCKED',weight:1}
 ]);
 const p=projectWovenTopologyR707(s,0);
 assert.equal(p.topology.multiParentNodes,1);assert.equal(p.topology.blocked,1);
 assert.equal(p.topology.returns,1);assert.ok(p.topology.directedCycles>=1);
 assert.equal(p.edges.find(e=>e.kind==='BLOCKED').dash,'7 5');
 assert.ok(p.edges.find(e=>e.from==='C'&&e.to==='C').path.includes(' C '));
 const q=clone();q.edgeFrames=q.edgeFrames.map(edges=>edges.map(e=>({...e,kind:'BLOCKED'})));
 assert.equal(projectWovenTopologyR707(q,0).topology.directedCycles,0);
});
test('R707 rejects forged authority, out-of-range frames and unvalidated endpoints',()=>{
 const a=clone();a.liveRuntimeVerified=true;
 assert.throws(()=>projectWovenTopologyR707(a),/invalid scenario fields/);
 assert.throws(()=>projectWovenTopologyR707(clone(),-1),/frame out of bounds/);
 assert.throws(()=>projectWovenTopologyR707(clone(),1.5),/frame out of bounds/);
 assert.throws(()=>projectWovenTopologyR707(clone(),0,'yes'),/mirror must be boolean/);
 const b=clone();b.edgeFrames[0][0].to='UNKNOWN';
 assert.throws(()=>exportWovenTopologySvgR707(b),/invalid edge/);
});
test('R707 OMEGA7 integration retains execution, portable source and fail-closed UI boundaries',()=>{
 const ui=readFileSync(new URL('../src7/CapabilityRecoveryAuditR705.tsx',import.meta.url),'utf8');
 const vector=readFileSync(new URL('../src7/WovenTopologyR707.tsx',import.meta.url),'utf8');
 for(const x of ['setVectorScenario(scenario)','setVectorScenario(null)','<WovenTopologyR707 scenario={vectorScenario}/>','replayScenarioR706'])assert.ok(ui.includes(x),x);
 for(const x of ['data-r707-svg','data-r707-frame','data-r707-mirror','data-r707-export','data-r707-truth-boundary','projectWovenTopologyR707'])assert.ok(vector.includes(x),x);
 assert.ok(vector.includes('Historical AG-009 SVG parity is not yet proved'));
});
