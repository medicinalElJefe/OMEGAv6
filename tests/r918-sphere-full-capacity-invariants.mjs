import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 AXES,SIZE,SHELLS,AGENTS,NESTED,R918_CAPACITY,R918_SCHEMA,
 agentId,agentAddress,nestedId,expandedAddressR918,expandedCoordinatesR918,
 axes4,fromAxes4,createFabric,phaseSampleR918,stateValue,
 neighbors,submitTask,stepFabric,serializeFabricR888,restoreFabricR888
} from '../src/sphereAgentFabricR887.mjs';

assert.equal(AXES,12);
assert.equal(SIZE,20736);
assert.equal(AGENTS,248832);
assert.equal(NESTED,5159780352);
assert.equal(R918_CAPACITY,61917364224);
assert.equal(R918_CAPACITY,12**10);
assert.ok(Number.isSafeInteger(R918_CAPACITY-1));
const boundaries=[0,1,11,12,20735,20736,20737,12*SIZE,12*NESTED-1,R918_CAPACITY-1];
for(const value of boundaries){
 const coord=expandedCoordinatesR918(value);
 assert.equal(coord.schema,R918_SCHEMA);
 assert.equal(coord.address,value);
 assert.equal(expandedAddressR918(coord.shell,coord.outer,coord.inner,coord.phase),value);
 assert.equal(coord.agent,agentId(coord.shell,coord.outer));
 assert.equal(coord.nested,nestedId(coord.agent,coord.inner));
}
let sampleCount=0;
for(let shell=0;shell<SHELLS;shell++){
 for(const outer of [0,1,1727,20735]){
  for(const inner of [0,1,144,20735]){
   for(let phase=0;phase<12;phase++){
    const id=expandedAddressR918(shell,outer,inner,phase);
    const coords=expandedCoordinatesR918(id);
    assert.deepEqual([coords.shell,coords.outer,coords.inner,coords.phase],[shell,outer,inner,phase]);
    sampleCount++;
   }
  }
 }
}
assert.equal(sampleCount,2304);
for(const bad of [-1,R918_CAPACITY,1.1,NaN,Infinity,Number.MAX_SAFE_INTEGER])assert.throws(()=>expandedCoordinatesR918(bad),RangeError);
for(const bad of [-1,12,1.5,NaN])assert.throws(()=>expandedAddressR918(0,0,0,bad),RangeError);
for(const bad of [-1,12])assert.throws(()=>expandedAddressR918(bad,0,0,0),RangeError);
for(const bad of [-1,SIZE])assert.throws(()=>expandedAddressR918(0,bad,0,0),RangeError);
for(const bad of [-1,SIZE])assert.throws(()=>expandedAddressR918(0,0,bad,0),RangeError);

const fabric=createFabric(),agent=agentId(5,1077),inner=1444,priorSize=fabric.active.size;
const original=stateValue(fabric,agent,inner);
for(let phase=0;phase<AXES;phase++){
 const projection=phaseSampleR918(fabric,agent,inner,phase);
 assert.equal(projection.schema,R918_SCHEMA);
 assert.equal(projection.expandedAddress,expandedAddressR918(5,1077,inner,phase));
 assert.equal(projection.agent,agent);
 assert.equal(projection.inner,inner);
 assert.equal(projection.phase,phase);
 assert.equal(projection.originalValue,original);
 assert.equal(projection.axis,phase%4);
 assert.equal(projection.turn,Math.floor(phase/4)-1);
 const digits=axes4(inner);
 digits[phase%4]=(digits[phase%4]+projection.turn+AXES)%AXES;
 assert.equal(projection.neighbor,fromAxes4(digits));
 assert.equal(projection.sampledValue,stateValue(fabric,agent,projection.neighbor));
 assert.ok(Math.abs(projection.delta)<=1);
 assert.equal(projection.gradientMagnitude,Math.abs(projection.delta));
 assert.equal(projection.createsIndependentPhaseState,false);
 assert.equal(projection.canonicalWrites,0);
 if(phase>=4&&phase<8){assert.equal(projection.gradientMagnitude,0);assert.equal(projection.neighbor,inner)}
}
assert.equal(fabric.active.size,priorSize,'state projection must not instantiate agents');
assert.equal(fabric.queue.length,0);
const counterpart=neighbors(agent)[0];
submitTask(fabric,{agent,kind:'EXCHANGE',target:counterpart,inner,weight:.25});
const receipt=stepFabric(fabric,1)[0];
assert.equal(receipt.kind,'EXCHANGE');
assert.ok(Math.abs(receipt.conservationResidual)<1e-12);
assert.notEqual(stateValue(fabric,agent,inner),original,'actual computation must change state');
const phaseAfter=phaseSampleR918(fabric,agent,inner,0);
assert.equal(phaseAfter.originalValue,stateValue(fabric,agent,inner));
const checkpoint=serializeFabricR888(fabric);
const restored=restoreFabricR888(checkpoint);
assert.deepEqual(phaseSampleR918(restored,agent,inner,0),phaseAfter,'projection must be replayable from exact checkpoint');
assert.equal(stateValue(restored,agent,inner),stateValue(fabric,agent,inner));

const ui=readFileSync('src/SphereAgentInstrumentR887.tsx','utf8');
for(const token of ['expandedAddressR918','expandedCoordinatesR918','phaseSampleR918','PHASE_GRADIENT','data-r918-expanded-address','Full 12 power 10 address','Go to 12^10 state projection'])
 assert.ok(ui.includes(token),'R918 instrument binding missing '+token);
assert.ok(!ui.includes('Math.sin((x+y)*.09'),'Pixel field must not invent animated wave data');
console.log('R918 PASS · 12^10 exact reversible address hierarchy · phase-neighbor projection · read-only geometry · state conservation · checkpoint replay · bound SPHERE instrument');
