import assert from'node:assert/strict';
import{compileB0StandardR348,compileB3CanonicalStateR348,compileB4MotionR348,compileB5ParentR348,compileB6GateR348,compileGravityMotionAddressR348,DEWEY_REFERENCE_SOURCE_SHA256_R348,executeDeweyReferenceKernelR348}from'../src/system/deweyReferenceKernelR348';

const fit={
 anchor:[2,3,5],
 scale:[1,2,3],
 axes:[
  [.6728777347972567,.5075150336436425,.5382044636007817],
  [.739749314461836,-.46413993988358304,-.4871807343872575],
  [.0025506405776594718,.7259494519803403,-.6877433295947604]
 ]
};
const query=[0,1,2],parentVector=[1,2,3],near=(a:number,b:number,t=1e-12)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);

assert.equal(DEWEY_REFERENCE_SOURCE_SHA256_R348,'9c0701b81fcd5d83444c5e8b2da362c01bab3067d6efec9cfd9ea775db1349ae');
assert.deepEqual(compileB0StandardR348(query,fit),[-2,-1,-1]);

const g=compileB3CanonicalStateR348(query,fit);
near(g.projected[0],-2.3914749668389375);near(g.projected[1],-.5281779546528315);near(g.projected[2],-.0433074035408989);
near(g.continuity,.6359070956799168);near(g.contradiction,.7301370354852174);near(g.burden,.9876534416775559);
near(g.plasticity,.3724496412124939);near(g.score,.08714555872523173);near(g.symmetry,.5031058126289922);near(g.asymmetry,.49689418737100777);

const p=compileB3CanonicalStateR348(parentVector,fit),m=compileB4MotionR348(g,p);
near(m.norm,1.1666666666666667);near(m.energy,.20325925925925928);near(m.unifiedCost,.013303719824132672);
const parent=compileB5ParentR348(g,m);near(parent.gateSupport,.028054659627891162);
const gate=compileB6GateR348(g,m,parent);assert.equal(gate.decision,'ESCALATE');assert.deepEqual([gate.stay,gate.turn,gate.escalate],[0,0,1]);
const gravity=compileGravityMotionAddressR348(g,m);assert.deepEqual(gravity.digits,[8,7,6,6]);assert.equal(gravity.index0,11324);assert.equal(gravity.index1,11325);
assert.match(gravity.truthBoundary,/not joules/i);

const gated=executeDeweyReferenceKernelR348({vector:query,fit,parentVector,requestedStage:'B6',validatedStages:['B6'],parentReceipt:'fixture'});
assert.equal(gated.state,'COMPUTED');assert.equal(gated.selectedStage,'B6');assert.equal((gated as any).gate.decision,'ESCALATE');
const fallback=executeDeweyReferenceKernelR348({vector:query,fit,parentVector,requestedStage:'B6',validatedStages:[]});
assert.equal(fallback.state,'COMPUTED');assert.equal(fallback.selectedStage,'B3');assert.equal(fallback.requestedHeld,'B6');
const held=executeDeweyReferenceKernelR348(null);assert.equal(held.state,'HELD');assert.equal(held.reason,'REFERENCE_PACKET_REQUIRED');

console.log('R348 DEWEY REFERENCE KERNEL PASS · exact supplied v2 equations reproduced on sealed fixture · B0/B3 executable · B4-B6 validation+parent gated · gate=ESCALATE · gravity-motion address 11324 diagnostic only');
