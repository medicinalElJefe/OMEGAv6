import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {computeRouteBasinsR732,inspectRouteBasinR732,ROUTE_BASIN_SCHEMA_R732} from '../src/routeBasinR732.mjs';
const routes=[1,2,1,4,5,4,3,7,7];
const graph=computeRouteBasinsR732(routes);
assert.equal(graph.schema,ROUTE_BASIN_SCHEMA_R732);
assert.equal(graph.nodeCount,9);assert.equal(graph.basinCount,3);
assert.equal(graph.cyclicNodes,5);assert.equal(graph.transientNodes,4);
assert.deepEqual(graph.ranked.map(c=>c.size),[4,3,2]);
assert.deepEqual([graph.depth[0],graph.depth[3],graph.depth[6],graph.depth[8]],[1,1,2,1]);
assert.deepEqual(inspectRouteBasinR732(graph,routes,6).trace,[6,3,4,5]);
assert.equal(inspectRouteBasinR732(graph,routes,8).cycleEntry,7);
assert.equal(inspectRouteBasinR732(graph,routes,0).cycleLength,2);
assert.equal(graph.cycles.reduce((a,b)=>a+b.size,0),9);
for(let i=0;i<routes.length;i++){
 const s=inspectRouteBasinR732(graph,routes,i);
 let next=i;for(let j=0;j<s.distanceToCycle;j++)next=routes[next];
 assert.equal(next,s.cycleEntry,'cycle entry is exact for '+i);
 assert.equal(graph.basinOf[routes[i]],graph.basinOf[i],'source edge cannot leave basin');
}
for(const r of [[],[1],[0,2],Array(20737).fill(0)])assert.throws(()=>computeRouteBasinsR732(r),/refused|invalid/);
for(const address of [-1,9,1.5])assert.throws(()=>inspectRouteBasinR732(graph,routes,address),/invalid/);
const self=computeRouteBasinsR732([0,1,2]);assert.equal(self.basinCount,3);assert.equal(self.transientNodes,0);
const huge=new Uint32Array(20736);for(let i=0;i<huge.length;i++)huge[i]=(i+1)%huge.length;
const full=computeRouteBasinsR732(huge);assert.equal(full.basinCount,1);assert.equal(full.cycles[0].period,20736);assert.equal(full.transientNodes,0);
assert.equal(inspectRouteBasinR732(full,huge,0,48).truncated,true);
const chain=new Uint32Array(20736);for(let i=0;i<chain.length-1;i++)chain[i]=i+1;chain[chain.length-1]=chain.length-1;
const tree=computeRouteBasinsR732(chain);assert.equal(tree.basinCount,1);assert.equal(tree.maxDepth,20735);assert.equal(tree.cycles[0].size,20736);
const ui=readFileSync(new URL('../src7/workspaces/RouteBasinInstrumentR732.tsx',import.meta.url),'utf8');
const science=readFileSync(new URL('../src7/workspaces/ScienceWorkspaceR441.tsx',import.meta.url),'utf8');
for(const token of ['getMandala20736Field','data-r732-run','data-r732-summary','data-r732-selected','data-r732-entry','data-r732-ranked','data-r732-boundary'])
 assert.ok(ui.includes(token),'missing UI '+token);
assert.ok(science.includes('<RouteBasinInstrumentR732 address={address} onAddress={commit}/>'),'R732 Science Atlas integration missing');
console.log('R732 exact functional graph decomposition, 20,736-state conservation, deep chain, cycle witness, source validation and UI PASS');
