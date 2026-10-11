import assert from 'node:assert/strict';
import {encodeUX20736,decodeUX20736,inspectUX20736,UX20736_TOTAL,UX20736_PILLARS,UX20736_STAGES,UX20736_INTERACTIONS,UX20736_EVIDENCE} from '../src/uxAddressAtlasR550.ts';
assert.equal(UX20736_TOTAL,20736);
for(const axis of [UX20736_PILLARS,UX20736_STAGES,UX20736_INTERACTIONS,UX20736_EVIDENCE])assert.equal(axis.length,12);
const seen=new Set();
for(let i=0;i<UX20736_TOTAL;i++){const c=decodeUX20736(i);assert.equal(encodeUX20736(c),i);seen.add(encodeUX20736(c))}
assert.equal(seen.size,20736);
assert.throws(()=>decodeUX20736(-1),RangeError);
assert.throws(()=>decodeUX20736(20736),RangeError);
assert.throws(()=>encodeUX20736({pillar:12,stage:0,interaction:0,evidence:0}),RangeError);
const address=encodeUX20736({pillar:0,stage:0,interaction:0,evidence:0});
const result=inspectUX20736(address);
assert.equal(result.schema,'OMEGA_UX_ADDRESS_ATLAS_R550');
assert.equal(result.executionProven,false);
assert.equal(result.liveBehaviorProven,false);
assert.equal(result.canonicalMutation,false);
assert.ok(Array.isArray(result.capabilities));
console.log('R550 reversible 20736 UX atlas and non-claim boundaries PASS');
