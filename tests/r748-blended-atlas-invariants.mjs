import assert from 'node:assert/strict';
import {computeConstrainedAtlasJourneyR744} from '../src/constrainedAtlasJourneyR744.mjs';
import {computeAtlasTradeoffR747} from '../src/atlasTradeoffR747.mjs';
import {computeBlendedAtlasJourneyR748,verifyBlendedAtlasJourneyR748} from '../src/blendedAtlasJourneyR748.mjs';
import {piAxisNeighborsR742} from '../src/piAtlasTraversalR742.mjs';
const COUNT=20736,field={count:COUNT,C:new Float32Array(COUNT),q:new Float32Array(COUNT)};
field.C[1]=100;
const primary=computeConstrainedAtlasJourneyR744(field,0,2,'C',[],[]);
const tradeoff=computeAtlasTradeoffR747(field,primary,'q');
const low=computeBlendedAtlasJourneyR748(field,tradeoff,0);
const high=computeBlendedAtlasJourneyR748(field,tradeoff,1);
assert.deepEqual(low.addresses,tradeoff.secondary.addresses);
assert.deepEqual(high.addresses,tradeoff.primary.addresses);
assert.ok(Math.abs(low.blendedCost-tradeoff.secondary.weightedCost)<1e-8);
assert.ok(Math.abs(high.blendedCost-tradeoff.primary.weightedCost)<1e-8);
for(const alpha of [0,0.1,0.25,0.5,0.75,0.9,1]){
 const value=computeBlendedAtlasJourneyR748(field,tradeoff,alpha);
 assert.equal(value.alpha,alpha);
 assert.equal(value.steps,value.addresses.length-1);
 assert.ok(value.blendedCost<=value.bestEndpointBlendCost+1e-8);
 assert.ok(value.improvement>=0);
 let pc=0,sc=0;
 for(let i=1;i<value.addresses.length;i++){
  const a=value.addresses[i-1],b=value.addresses[i];
  assert.ok(piAxisNeighborsR742(a).includes(b));
  pc+=1+Math.abs(field.C[a]-field.C[b]);
  sc+=1+Math.abs(field.q[a]-field.q[b]);
 }
 assert.ok(Math.abs(pc-value.primaryCost)<1e-8);
 assert.ok(Math.abs(sc-value.secondaryCost)<1e-8);
 assert.deepEqual(verifyBlendedAtlasJourneyR748(JSON.stringify(value),field),value);
 assert.throws(()=>verifyBlendedAtlasJourneyR748(JSON.stringify({...value,improvement:999}),field),/differs/);
}
// Independent relaxation oracle: prove the blended optimum, not just a plausible route.
const oracle=new Float64Array(COUNT).fill(Infinity);oracle[0]=0;
for(let pass=0;pass<30;pass++){
 let changed=false;
 for(let address=0;address<COUNT;address++){
  if(!Number.isFinite(oracle[address]))continue;
  for(const next of piAxisNeighborsR742(address)){
   const p=1+Math.abs(field.C[address]-field.C[next]);
   const q=1+Math.abs(field.q[address]-field.q[next]);
   const candidate=oracle[address]+0.5*p+0.5*q;
   if(candidate<oracle[next]){oracle[next]=candidate;changed=true}
  }
 }
 if(!changed)break;
}
const middle=computeBlendedAtlasJourneyR748(field,tradeoff,0.5);
assert.ok(Math.abs(middle.blendedCost-oracle[2])<1e-8,'R748 A* equals independent source-cost relaxation');
const constrained=computeConstrainedAtlasJourneyR744(field,0,2,'C',[1728],[12]);
const constrainedTradeoff=computeAtlasTradeoffR747(field,constrained,'q');
const via=computeBlendedAtlasJourneyR748(field,constrainedTradeoff,0.5);
assert.deepEqual(via.waypoints,[1728]);
assert.deepEqual(via.blocked,[12]);
assert.ok(via.addresses.includes(1728)&&!via.addresses.includes(12));
assert.deepEqual(verifyBlendedAtlasJourneyR748(JSON.stringify(via),field),via);
for(const invalid of [-0.01,1.01,NaN,Infinity,'0.5'])assert.throws(()=>computeBlendedAtlasJourneyR748(field,tradeoff,invalid),/weight/);
assert.throws(()=>verifyBlendedAtlasJourneyR748('{broken',field),/invalid JSON/);
assert.throws(()=>verifyBlendedAtlasJourneyR748('x'.repeat(4194305),field),/size refused/);
const modified={...field,C:new Float32Array(field.C)};modified.C[1]=0;
assert.throws(()=>verifyBlendedAtlasJourneyR748(JSON.stringify(via),modified),/differs|R747 tradeoff differs|R744 journey differs/);
const ui=(await import('node:fs')).readFileSync(new URL('../src7/workspaces/RouteBasinInstrumentR732.tsx',import.meta.url),'utf8');
for(const marker of ['data-r748-alpha','data-r748-run','data-r748-summary','data-r748-path','data-r748-step','data-r748-export','data-r748-import','data-r748-recovery'])
 assert.ok(ui.includes(marker),'R748 UI missing '+marker);
console.log('R748 constrained two-channel scalarized A* optimum, endpoint bounds, exact source costs, export recovery and tamper refusal PASS');
