import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ADDRESS_CAPACITY_R623,BAND_WIDTH_R623,traverseAddressR623 as portable,decodeAddressR623} from '../src/continuity/corpusTraversalKernelR623.js';
import {traverseCorpusBandR618 as original} from '../src/continuity/sourceBoundBandTraversalR618.js';
assert.equal(ADDRESS_CAPACITY_R623,12**10);assert.equal(BAND_WIDTH_R623,12**8);
for(const address of [0,1,BAND_WIDTH_R623-1,BAND_WIDTH_R623,ADDRESS_CAPACITY_R623-2,ADDRESS_CAPACITY_R623-1]){
 for(const offset of [-ADDRESS_CAPACITY_R623*2-7,-1,0,1,19,ADDRESS_CAPACITY_R623*2+7]){
  for(const wrap of [false,true]){
   let expected,actual,error;
   try{expected=original({address,offset,wrap})}catch(e){error=e}
   if(error){assert.throws(()=>portable({address,offset,wrap}),/without wrap authority/);continue}
   actual=portable({address,offset,wrap});
   for(const key of ['fromAddress','toAddress','offset','wrapAuthorized','wrapped','fromBand','toBand','crossedBand','endpointBandChanged','fromDigits','toDigits'])assert.deepEqual(actual[key],expected[key],key);
   assert.equal(decodeAddressR623(actual.toAddress).length,10);
   assert.equal(actual.sourceBytesVerified,false);
   assert.equal(actual.canonicalMutation,false);
  }
 }
}
for(const value of [Number.NaN,Infinity,-1,.5,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>portable({address:value,offset:0}));
for(const value of [Number.NaN,Infinity,.5,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>portable({address:0,offset:value}));
assert.throws(()=>portable({address:0,offset:0,wrap:'yes'}),/boolean/);
// R624: the receipt is an immutable evidence snapshot, not merely a shallow-frozen wrapper.
for(const {address,offset,wrap} of [
 {address:0,offset:0,wrap:false},
 {address:BAND_WIDTH_R623-1,offset:1,wrap:false},
 {address:0,offset:-1,wrap:true},
 {address:ADDRESS_CAPACITY_R623-1,offset:ADDRESS_CAPACITY_R623*2+1,wrap:true}
]){
 const receipt=portable({address,offset,wrap});
 assert.equal(Object.isFrozen(receipt),true,'receipt object frozen');
 assert.equal(Object.isFrozen(receipt.fromDigits),true,'origin digits frozen');
 assert.equal(Object.isFrozen(receipt.toDigits),true,'target digits frozen');
 const originalFrom=[...receipt.fromDigits],originalTo=[...receipt.toDigits];
 assert.throws(()=>{receipt.fromDigits[0]=(receipt.fromDigits[0]+1)%12},TypeError,'origin cannot be forged');
 assert.throws(()=>{receipt.toDigits[9]=(receipt.toDigits[9]+1)%12},TypeError,'target cannot be forged');
 assert.deepEqual(receipt.fromDigits,originalFrom);
 assert.deepEqual(receipt.toDigits,originalTo);
 assert.deepEqual(receipt.fromDigits,decodeAddressR623(receipt.fromAddress));
 assert.deepEqual(receipt.toDigits,decodeAddressR623(receipt.toAddress));
 assert.equal(receipt.sourceBytesVerified,false);
 assert.equal(receipt.canonicalMutation,false);
}
const root=readFileSync('src7/Omega7Root.tsx','utf8'),ui=readFileSync('src7/CorpusTraversalR623.tsx','utf8');
assert.match(root,/CorpusTraversalR623=lazy/);
assert.match(root,/state.domain==='SYSTEM'&&<Suspense[^\n]*CorpusTraversalR623/);
for(const phrase of ['data-r623-execute','data-r623-refusal','data-r623-receipt','sourceBytesVerified','No workbook bytes','traverseAddressR623'])assert.ok((root+ui+readFileSync('src/continuity/corpusTraversalKernelR623.js','utf8')).includes(phrase),phrase);
console.log('R623 portable 12^10 traversal parity, strict refusal and OMEGA7 wiring PASS');
