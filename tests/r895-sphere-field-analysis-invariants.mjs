import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SIZE,agentId,createFabric,getAgent,stateValue,nestedId} from '../src/sphereAgentFabricR887.mjs';
import {analyzeCollectiveFieldR895,analyzeCollectiveRelationsR895,R895_FIELD_MAX_AGENTS,R895_FIELD_EVIDENCE} from '../src/sphereFieldAnalysisR895.mjs';
assert.equal(R895_FIELD_MAX_AGENTS,12);
assert.equal(R895_FIELD_EVIDENCE,'INTERNALLY_TESTED_SYNTHETIC_LOGICAL_MODEL');
const fresh=createFabric(),id=agentId(0,0);
const empty=analyzeCollectiveFieldR895(fresh,[id]);
assert.equal(empty.count,SIZE);
assert.equal(empty.memberCount,1);
assert.equal(empty.fullScan,true);
assert.equal(empty.modifiedValues,0);
assert.equal(fresh.active.size,0,'read-only analysis cannot activate agents');
assert.equal(fresh.tick,0,'analysis cannot schedule work');
assert.equal(empty.minAddress,nestedId(id,empty.minAddress));
assert.equal(empty.maxAddress,nestedId(id,empty.maxAddress));
const sample=createFabric(),a=getAgent(sample,id);
for(let i=0;i<SIZE;i++)a.values.set(i,.5);
const stable=analyzeCollectiveFieldR895(sample,[id]);
assert.equal(stable.mean,.5);
assert.equal(stable.variance,0);
assert.equal(stable.stdDev,0);
assert.equal(stable.min,.5);
assert.equal(stable.max,.5);
assert.equal(stable.minAddress,0);
assert.equal(stable.maxAddress,0);
assert.equal(stable.modifiedValues,SIZE);
assert.equal(sample.active.get(id).values.size,SIZE,'scan cannot change stored state');
const members=Array.from({length:12},(_,i)=>agentId(0,i));
const start=Date.now(),complete=analyzeCollectiveFieldR895(fresh,members);
assert.equal(complete.count,12*SIZE);
assert.equal(complete.agents.length,12);
assert.ok(complete.variance>=0&&complete.mean>=0&&complete.mean<=1);
assert.ok(complete.minAddress>=0&&complete.maxAddress<12*SIZE);
assert.equal(fresh.active.size,0,'full 248,832-value analysis remains lazy');
assert.deepEqual(analyzeCollectiveFieldR895(fresh,members),complete,'deterministic independent repeat');
for(const bad of [[],[id,id],[id,-1],[id,248832],Array.from({length:13},(_,i)=>i)])assert.throws(()=>analyzeCollectiveFieldR895(fresh,bad),RangeError);
assert.equal(stateValue(sample,id,500),.5);
// R895 RELATIONAL FIELD: 12×12 pair symmetry is represented by 66 unique pairs,
// each computed across every matching inner coordinate (not fitted AI inference).
const relations=analyzeCollectiveRelationsR895(fresh,members);
assert.equal(relations.pairCount,66);
assert.equal(relations.sharedInnerCoordinates,SIZE);
assert.equal(relations.pairs.length,66);
assert.equal(relations.cloudDispatch,false);
assert.equal(relations.canonMutated,false);
assert.equal(relations.physicalCausalityClaimed,false);
assert.equal(fresh.active.size,0,'pair comparison must not allocate synthetic agents');
assert.deepEqual(analyzeCollectiveRelationsR895(fresh,members),relations,'pairwise results must be reproducible');
assert.deepEqual(analyzeCollectiveRelationsR895(fresh,[id]).pairs,[]);
for(const bad of [[],[id,id],[id,-1],[id,248832],Array.from({length:13},(_,i)=>i)])
 assert.throws(()=>analyzeCollectiveRelationsR895(fresh,bad),RangeError);
const related=createFabric();
const first=getAgent(related,id),secondId=agentId(0,1),thirdId=agentId(0,2);
const second=getAgent(related,secondId),third=getAgent(related,thirdId);
for(let i=0;i<SIZE;i++){
 const x=i/(SIZE-1);
 first.values.set(i,x);second.values.set(i,x);third.values.set(i,1-x);
}
const positive=analyzeCollectiveRelationsR895(related,[id,secondId,thirdId]);
assert.equal(positive.pairCount,3);
assert.ok(Math.abs(positive.pairs[0].correlation-1)<1e-11,'identical linear fields correlate +1');
assert.ok(Math.abs(positive.pairs[1].correlation+1)<1e-11,'inverted linear fields correlate -1');
assert.ok(Math.abs(positive.pairs[2].correlation+1)<1e-11,'inverted pair correlates -1');
assert.equal(first.values.size,SIZE);
const constant=createFabric();const constantA=getAgent(constant,id),constantB=getAgent(constant,secondId);
for(let i=0;i<SIZE;i++){constantA.values.set(i,.5);constantB.values.set(i,.5)}
const zero=analyzeCollectiveRelationsR895(constant,[id,secondId]).pairs[0];
assert.equal(zero.correlation,null,'zero-variance Pearson correlation is undefined');
assert.equal(zero.undefinedReason,'ZERO_VARIANCE');
const ui=readFileSync('src/SphereAgentInstrumentR887.tsx','utf8');
for(const token of ['Analyze full collective field','data-r895-field-analysis','data-r895-field-result','analyzeCollectiveFieldR895(fabric.current,collectiveIds)','fieldAnalysis.version===version','Complete agent relationship matrix','Export complete pairwise relations CSV','data-r895-pairwise-relations'])
 assert.ok(ui.includes(token),'R895 collective analysis UI contract missing: '+token);
console.log('R895 FIELD PASS: 12 agents × 20,736 complete exact logical reads; repeatable variance/extrema; no state, cloud or Canon mutation. elapsed ms '+(Date.now()-start));
