import assert from 'node:assert/strict';import {symmetryProjectionR652,modeNamesR652} from '../src/continuity/modeSymmetryR652.js';
const nodes=['A','B','C'].map(id=>({id,continuity:0.5,plasticity:1}));
const edges=[{from:'A',to:'B',kind:'INGRESS',weight:0.8},{from:'B',to:'A',kind:'RETURN',weight:0.8},{from:'B',to:'C',kind:'EGRESS',weight:0.7},{from:'C',to:'A',kind:'BLOCKED',weight:1}];
const stabilize=symmetryProjectionR652({nodes,edges,mode:'STABILIZE'});const explore=symmetryProjectionR652({nodes,edges,mode:'EXPLORE'});
assert.equal(stabilize.totals.symmetricMass,0.8);assert.ok(Math.abs(stabilize.totals.asymmetricMass-0.7)<1e-10);assert.equal(stabilize.nodes[0].continuity,0.5);assert.ok(explore.nodes.some(x=>x.futureConductance>0));assert.ok(stabilize.nodes.every(x=>x.futureConductance===0));assert.equal(modeNamesR652.length,5);
assert.throws(()=>symmetryProjectionR652({nodes,edges,mode:'INVENTED'}));assert.throws(()=>symmetryProjectionR652({nodes,edges,alpha:NaN}));assert.throws(()=>symmetryProjectionR652({nodes,edges:[{from:'A',to:'X',kind:'INGRESS'}]}));
console.log('R652 symmetry/asymmetry mode lens PASS');
