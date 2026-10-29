import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_SCENARIO_R706,exportScenarioR706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {projectWovenTopologyR707,exportWovenTopologySvgR707} from '../src/wovenTopologyProjectionR707.mjs';
import {inspectWovenRouteR708} from '../src/wovenRouteInspectorR708.mjs';
import {traceWovenRouteR709} from '../src/wovenRouteContinuityR709.mjs';
import {inspectWovenEdgeResilienceR710} from '../src/wovenEdgeResilienceR710.mjs';
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
test('R708 computes shortest-hop typed route witnesses from executed R707 frames without state mutation',()=>{
 const scenario=clone(),original=JSON.stringify(scenario);
 const p=projectWovenTopologyR707(scenario,0),w=inspectWovenRouteR708(p,'A','B');
 assert.equal(w.truthClass,'LOCAL_GRAPH_REACHABILITY_ONLY');
 assert.equal(w.reachable,true);assert.deepEqual(w.pathNodes,['A','B']);
 assert.equal(w.hops,1);assert.equal(w.bottleneckDeclaredWeight,0.5);
 assert.equal(w.pathEdges[0].kind,'INGRESS');
 assert.deepEqual(w,inspectWovenRouteR708(p,'A','B'));
 assert.deepEqual(inspectWovenRouteR708(projectWovenTopologyR707(scenario,0,true),'A','B').pathNodes,w.pathNodes);
 assert.equal(JSON.stringify(scenario),original);
 const self=inspectWovenRouteR708(p,'A','A');
 assert.equal(self.reachable,true);assert.equal(self.hops,0);assert.equal(self.bottleneckDeclaredWeight,null);
});
test('R708 preserves positive-weight residue topology while rejecting blocked and zero-weight conductance',()=>{
 const s=clone();s.nodes.push({id:'C',continuity:0.5,scar:0,contradiction:0,plasticity:1});
 s.edgeFrames=s.edgeFrames.map(()=>[
  {from:'A',to:'B',kind:'INGRESS',weight:0.8},
  {from:'B',to:'C',kind:'RETURN',weight:0.3},
  {from:'A',to:'C',kind:'BLOCKED',weight:1},
  {from:'C',to:'A',kind:'RESIDUE',weight:1},
  {from:'C',to:'C',kind:'EGRESS',weight:0}
 ]);
 const p=projectWovenTopologyR707(s,0);
 const w=inspectWovenRouteR708(p,'A','C');
 assert.deepEqual(w.pathNodes,['A','B','C']);assert.equal(w.bottleneckDeclaredWeight,0.3);
 assert.deepEqual(w.excludedEdges.map(e=>e.reason),['BLOCKED','ZERO_DECLARED_WEIGHT']);
 const reverse=inspectWovenRouteR708(p,'C','A');
 assert.equal(reverse.reachable,true);assert.deepEqual(reverse.pathNodes,['C','A']);
 assert.equal(reverse.pathEdges[0].kind,'RESIDUE');
 const zero=structuredClone(s);zero.edgeFrames=zero.edgeFrames.map(es=>es.map(e=>e.kind==='RESIDUE'?{...e,weight:0}:e));
 const refused=inspectWovenRouteR708(projectWovenTopologyR707(zero,0),'C','A');
 assert.equal(refused.reachable,false);assert.equal(refused.excludedFrontier.length,1);
 const blocked=clone();blocked.edgeFrames=blocked.edgeFrames.map(es=>es.map(e=>({...e,kind:'BLOCKED'})));
 assert.equal(inspectWovenRouteR708(projectWovenTopologyR707(blocked,0),'A','B').reachable,false);
});
test('R708 refuses forged projection authority and malformed graph identities',()=>{
 const p=projectWovenTopologyR707(clone(),0);
 assert.throws(()=>inspectWovenRouteR708({...p,truthClass:'PRODUCTION_VERIFIED'},'A','B'),/computed R707 frame/);
 assert.throws(()=>inspectWovenRouteR708(p,'A','MISSING'),/endpoints/);
 assert.throws(()=>inspectWovenRouteR708({...p,edges:[{...p.edges[0],to:'MISSING'}]},'A','B'),/invalid computed edge/);
 assert.throws(()=>inspectWovenRouteR708({...p,edges:[{...p.edges[0],weight:Infinity}]},'A','B'),/invalid computed edge/);
});
test('R709 recomputes each frame and detects loss and recovery without changing source state',()=>{
 const s=clone(),original=JSON.stringify(s);
 s.edgeFrames[1][0]={...s.edgeFrames[1][0],kind:'BLOCKED'};
 s.edgeFrames[2][0]={...s.edgeFrames[2][0],kind:'RESIDUE',weight:0.4};
 const before=JSON.stringify(s);
 const timeline=traceWovenRouteR709(s,'A','B');
 assert.equal(timeline.truthClass,'LOCAL_RECOMPUTED_GRAPH_TIMELINE_ONLY');
 assert.equal(timeline.frameCount,3);assert.equal(timeline.reachableFrames,2);
 assert.deepEqual(timeline.frames.map(f=>f.event),['INITIAL','PATH_LOST','PATH_RECOVERED']);
 assert.deepEqual(timeline.frames.map(f=>f.reachable),[true,false,true]);
 assert.equal(timeline.firstLossFrame,1);assert.equal(timeline.firstRecoveryFrame,2);
 assert.equal(timeline.frames[1].excludedFrontier[0].reason,'BLOCKED');
 assert.equal(timeline.frames[2].bottleneckDeclaredWeight,0.4);
 assert.deepEqual(traceWovenRouteR709(s,'A','B',true),timeline);
 assert.equal(JSON.stringify(s),before);assert.notEqual(original,before);
});
test('R709 distinguishes path rewiring from declared-weight changes and retains multi-parent routes',()=>{
 const s=clone();s.nodes.push({id:'C',continuity:0.5,scar:0,contradiction:0,plasticity:1});
 s.edgeFrames=[
  [{from:'A',to:'B',kind:'INGRESS',weight:0.8}],
  [{from:'A',to:'C',kind:'EGRESS',weight:0.7},{from:'C',to:'B',kind:'RETURN',weight:0.6}],
  [{from:'A',to:'C',kind:'EGRESS',weight:0.7},{from:'C',to:'B',kind:'RETURN',weight:0.2}]
 ];
 const t=traceWovenRouteR709(s,'A','B');
 assert.deepEqual(t.frames.map(f=>f.event),['INITIAL','PATH_CHANGED','DECLARED_WEIGHT_CHANGED']);
 assert.equal(t.routeChanges,1);assert.equal(t.weightChanges,2);
 assert.deepEqual(t.frames[1].pathNodes,['A','C','B']);
 assert.equal(t.frames[2].bottleneckDeclaredWeight,0.2);
 assert.equal(t.firstLossFrame,null);assert.equal(t.firstRecoveryFrame,null);
});
test('R709 refuses forged authority, unknown endpoints and non-boolean observer frame',()=>{
 const s=clone();
 assert.throws(()=>traceWovenRouteR709({...s,productionVerified:true},'A','B'),/invalid scenario fields/);
 assert.throws(()=>traceWovenRouteR709(s,'A','UNKNOWN'),/endpoints/);
 assert.throws(()=>traceWovenRouteR709(s,'A','B','yes'),/reflection must be boolean/);
});
test('R707 OMEGA7 integration retains execution, portable source and fail-closed UI boundaries',()=>{
 const ui=readFileSync(new URL('../src7/CapabilityRecoveryAuditR705.tsx',import.meta.url),'utf8');
 const vector=readFileSync(new URL('../src7/WovenTopologyR707.tsx',import.meta.url),'utf8');
 for(const x of ['setVectorScenario(scenario)','setVectorScenario(null)','replayScenarioR706'])assert.ok(ui.includes(x),x);
 assert.ok(ui.includes('scenario={vectorScenario}'), 'R707 vector must bind computed source scenario');
 for(const x of ['data-r707-svg','data-r707-frame','data-r707-mirror','data-r707-export','data-r707-truth-boundary','projectWovenTopologyR707'])assert.ok(vector.includes(x),x);
 assert.ok(vector.includes('Historical AG-009 SVG parity is not yet proved'));
 for(const x of ['inspectWovenRouteR708','data-r708-origin','data-r708-target','data-r708-path-status','data-r708-exclusions','data-r708-on-path','data-r708-boundary'])assert.ok(vector.includes(x),x);
 for(const x of ['traceWovenRouteR709','data-r709-timeline','data-r709-summary','data-r709-frame-choice','data-r709-boundary'])assert.ok(vector.includes(x),x);
 for(const x of ['inspectWovenEdgeResilienceR710','data-r710-resilience','data-r710-summary','data-r710-failure','data-r710-status','data-r710-trials','data-r710-boundary'])assert.ok(vector.includes(x),x);
});

test('R710 computes critical directed single-edge cuts without mutating source or claiming empirical resilience',()=>{
 const s=clone(),before=JSON.stringify(s),p=projectWovenTopologyR707(s,0);
 const r=inspectWovenEdgeResilienceR710(p,'A','B');
 assert.equal(r.truthClass,'LOCAL_SINGLE_EDGE_COUNTERFACTUAL_ONLY');
 assert.equal(r.eligibleEdges,2);assert.deepEqual(r.criticalEdgeIds,['edge-0']);
 assert.equal(r.singleEdgeTolerant,false);
 assert.equal(r.trials[0].outcome,'PATH_LOST');assert.equal(r.trials[0].reachable,false);
 assert.equal(r.trials[1].outcome,'PATH_PRESERVED');
 assert.deepEqual(r,inspectWovenEdgeResilienceR710(projectWovenTopologyR707(s,0,true),'A','B'));
 assert.equal(JSON.stringify(s),before);
 assert.equal(inspectWovenEdgeResilienceR710(p,'A','A').criticalEdgeCount,0);
});
test('R710 reroutes through alternate multi-parent paths, respects RESIDUE and refuses zero/BLOCKED',()=>{
 const s=clone();s.nodes.push({id:'C',continuity:0.5,scar:0,contradiction:0,plasticity:1});
 s.edgeFrames=s.edgeFrames.map(()=>[
  {from:'A',to:'B',kind:'INGRESS',weight:0.8},
  {from:'A',to:'C',kind:'RESIDUE',weight:0.7},
  {from:'C',to:'B',kind:'RETURN',weight:0.4},
  {from:'B',to:'A',kind:'BLOCKED',weight:1},
  {from:'C',to:'A',kind:'EGRESS',weight:0}
 ]);
 const p=projectWovenTopologyR707(s,0),r=inspectWovenEdgeResilienceR710(p,'A','B');
 assert.equal(r.eligibleEdges,3);assert.equal(r.criticalEdgeCount,0);assert.equal(r.singleEdgeTolerant,true);
 assert.equal(r.trials[0].outcome,'REROUTED');assert.deepEqual(r.trials[0].pathNodes,['A','C','B']);
 assert.deepEqual(r.trials[0].pathEdgeIds,['edge-1','edge-2']);
 assert.equal(r.trials[1].outcome,'PATH_PRESERVED');
 const blocked=clone();blocked.edgeFrames=blocked.edgeFrames.map(es=>es.map(e=>({...e,kind:'BLOCKED'})));
 const noRoute=inspectWovenEdgeResilienceR710(projectWovenTopologyR707(blocked,0),'A','B');
 assert.equal(noRoute.baselineReachable,false);assert.equal(noRoute.singleEdgeTolerant,null);
 assert.equal(noRoute.eligibleEdges,0);assert.deepEqual(noRoute.criticalEdgeIds,[]);
});
test('R710 rejects forged projections and invalid endpoints',()=>{
 const p=projectWovenTopologyR707(clone(),0);
 assert.throws(()=>inspectWovenEdgeResilienceR710({...p,truthClass:'PRODUCTION_VERIFIED'},'A','B'),/computed R707 frame/);
 assert.throws(()=>inspectWovenEdgeResilienceR710(p,'A','MISSING'),/endpoints/);
});
