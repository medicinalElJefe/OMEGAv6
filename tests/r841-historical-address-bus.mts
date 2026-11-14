import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseModelAddressR841,coordinatesToAddressR841,addressToCoordinatesR841,OMEGA_ADDRESS_KEY_R841,OMEGA_ADDRESS_EVENT_R841} from '../src7/workspaces/historicalAddressBusR841.ts';
test('shared model address contract preserves existing workspace transport',()=>{
 assert.equal(OMEGA_ADDRESS_KEY_R841,'omega.v6.address');
 assert.equal(OMEGA_ADDRESS_EVENT_R841,'omega7-address-changed');
});
test('address transport accepts all valid bounds and rejects malformed or unsafe input',()=>{
 assert.equal(parseModelAddressR841('0'),0);
 assert.equal(parseModelAddressR841('20735'),20735);
 for(const raw of [null,'','-1','20736','1.5','NaN','Infinity','1e2',' 1','01','9007199254740992'])assert.equal(parseModelAddressR841(raw),null,String(raw));
});
test('all 12^4 coordinates round-trip through zero-based shared model address',()=>{
 const seen=new Set<number>();
 for(let d=1;d<=12;d++)for(let p=1;p<=12;p++)for(let r=1;r<=12;r++)for(let l=1;l<=12;l++){
  const n=coordinatesToAddressR841(d,p,r,l);
  seen.add(n);
  assert.deepEqual(addressToCoordinatesR841(n),{d,p,r,l});
  assert.equal(parseModelAddressR841(String(n)),n);
 }
 assert.equal(seen.size,20736);
 assert.equal(coordinatesToAddressR841(12,12,12,12),20735);
 assert.throws(()=>coordinatesToAddressR841(0,1,1,1),RangeError);
 assert.throws(()=>addressToCoordinatesR841(20736),RangeError);
});
