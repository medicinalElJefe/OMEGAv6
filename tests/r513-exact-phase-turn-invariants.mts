import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodeAddress,encodeAddress} from '../src/corpusRuntime.ts';
import {R513_ATLAS_SIZE,R513_PHASE_SCHEMA,phaseOfAddressR513,phaseClassR513,quarterTurnAddressR513,inverseTurnR513,phaseOrbitR513,verifyQuarterTurnR513} from '../src/phaseGeometryR513.ts';

assert.equal(R513_ATLAS_SIZE,12**4);
assert.equal(inverseTurnR513('011'),'01-1');
assert.equal(inverseTurnR513('01-1'),'011');
assert.throws(()=>quarterTurnAddressR513(-1,'011'),RangeError);
assert.throws(()=>quarterTurnAddressR513(20736,'011'),RangeError);
assert.throws(()=>quarterTurnAddressR513(1.5,'011'),RangeError);
assert.throws(()=>quarterTurnAddressR513(NaN,'011'),RangeError);
assert.throws(()=>quarterTurnAddressR513(0,'BAD' as never),RangeError);
let preserved=0,returned=0,closed=0;
const orbitKeys=new Set<string>(),classCounts=[0,0,0],allOutputs=new Set<number>();
for(let address=0;address<R513_ATLAS_SIZE;address++){
  const before=decodeAddress(address),p=phaseOfAddressR513(address);
  assert.equal(p,before.p);
  const plus=quarterTurnAddressR513(address,'011'),minus=quarterTurnAddressR513(address,'01-1');
  const cp=decodeAddress(plus),cm=decodeAddress(minus);
  assert.equal(cp.p,(before.p+3)%12);
  assert.equal(cm.p,(before.p+9)%12);
  for(const c of [cp,cm]){
    assert.equal(c.d,before.d);
    assert.equal(c.r,before.r);
    assert.equal(c.l,before.l);
  }
  assert.equal(encodeAddress(cp.d,cp.p,cp.r,cp.l),plus);
  assert.equal(encodeAddress(cm.d,cm.p,cm.r,cm.l),minus);
  const phaseClass=phaseClassR513(address);
  assert.equal(phaseClass,before.p%3);
  classCounts[phaseClass]++;
  assert.equal(quarterTurnAddressR513(plus,'01-1'),address);
  assert.equal(quarterTurnAddressR513(minus,'011'),address);
  const orbit=phaseOrbitR513(address);
  assert.equal(new Set(orbit).size,4);
  assert.equal(orbit[0],address);
  assert.deepEqual(orbit.map(phaseClassR513),[phaseClass,phaseClass,phaseClass,phaseClass]);
  orbitKeys.add([...orbit].sort((a,b)=>a-b).join(','));
  allOutputs.add(plus);
  const proof=verifyQuarterTurnR513(address);
  assert.equal(proof.schema,R513_PHASE_SCHEMA);
  assert.equal(proof.inverseRecovered,true);
  assert.equal(proof.fourCycle,true);
  assert.equal(proof.nonPhaseAxesPreserved,true);
  preserved++;returned++;closed++;
}
assert.deepEqual(classCounts,[6912,6912,6912]);
assert.equal(allOutputs.size,20736,'quarter turn must be a bijection');
assert.equal(orbitKeys.size,5184,'the phase-only C4 group has 5184 distinct size-4 orbits');
const surface=readFileSync('src/CalculusTraversal.tsx','utf8');
assert.ok(surface.includes("quarterTurnAddressR513(cursorRef.current,'011')"));
assert.ok(surface.includes("quarterTurnAddressR513(cursorRef.current,'01-1')"));
assert.ok(surface.includes("setPlaying(false);move(quarterTurnAddressR513"));
assert.ok(surface.includes("phaseOperatorContract:'011=+3 and 01-1=-3"));
console.log('R513 SOURCE-RELATIVE DISCRETE PHASE PASS');
console.log(JSON.stringify({checked:R513_ATLAS_SIZE,axisPreserved:preserved,inversePairs:returned,fourCycle:closed,orbitCount:orbitKeys.size,classCounts,bijectiveOutputs:allOutputs.size,physicalClaim:'none',canonicalMutation:'user-controlled navigation only'}));
