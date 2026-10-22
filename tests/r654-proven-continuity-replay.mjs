import assert from 'node:assert/strict';import {executeProvenFrameR654,verifyProvenFrameR654,sha256R654} from '../src/continuity/provenFrameR654.js';
const input={nodes:[{id:'A',continuity:0.8},{id:'B',continuity:0.1}],edges:[{from:'A',to:'B',kind:'INGRESS',weight:0.5}],mode:'HEIGHTENED',step:0.2};
const record=executeProvenFrameR654(input);assert.equal(verifyProvenFrameR654(record).valid,true);assert.equal(sha256R654({a:1,b:2}),sha256R654({b:2,a:1}));
const altered=structuredClone(record);altered.output.canonicalState[0].continuity=0.1;assert.equal(verifyProvenFrameR654(altered).valid,false);
const alteredInput=structuredClone(record);alteredInput.input.nodes[0].continuity=0.3;assert.equal(verifyProvenFrameR654(alteredInput).valid,false);
const alteredLens=structuredClone(record);alteredLens.output.projection.nodes[0].projectedStability=0;assert.equal(verifyProvenFrameR654(alteredLens).valid,false);
const replay=executeProvenFrameR654(structuredClone(input));assert.deepEqual(record.proof,replay.proof);
console.log('R654 canonical replay and tamper evidence PASS');
