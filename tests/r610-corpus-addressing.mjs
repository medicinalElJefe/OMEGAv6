import assert from 'node:assert/strict';
import {CORPUS_AXES_R610,CORPUS_CAPACITY_R610,encodeCorpusAddressR610,decodeCorpusAddressR610,describeCorpusCoordinateR610,verifyCorpusCoordinateR610,corpusDomainBandR610} from '../src/continuity/corpusAddressR610.js';
assert.equal(CORPUS_CAPACITY_R610,61917364224);
assert.deepEqual(CORPUS_AXES_R610,['Domain','Phase','Regulation','Layer','Lens','Host','Operator','TimeBand','Evidence','Render']);
for(const address of [0,1,11,12,20735,20736,429981695,429981696,61917364223]){
 const digits=decodeCorpusAddressR610(address);
 assert.equal(encodeCorpusAddressR610(digits),address);
 const record=describeCorpusCoordinateR610(digits);
 assert.equal(record.address,address);
 assert.equal(verifyCorpusCoordinateR610(record),true);
 assert.equal(record.executionAuthority,false);
 assert.equal(record.empiricalDimensionsClaimed,false);
 const forged=structuredClone(record);forged.axes.Domain=(forged.axes.Domain+1)%12;assert.equal(verifyCorpusCoordinateR610(forged),false);
}
for(let d=0;d<12;d++){const band=corpusDomainBandR610(d);assert.equal(decodeCorpusAddressR610(band.start)[0],d);assert.equal(decodeCorpusAddressR610(band.end)[0],d);assert.equal(band.end-band.start+1,band.count);assert.equal(band.materialized,false)}
assert.equal(corpusDomainBandR610(11).end,CORPUS_CAPACITY_R610-1);
for(const invalid of [-1,CORPUS_CAPACITY_R610,1.5,NaN,Infinity])assert.throws(()=>decodeCorpusAddressR610(invalid));
for(const invalid of [[1,2],Array(10).fill(12),Array(10).fill(-1),Array(10).fill(0.2)])assert.throws(()=>encodeCorpusAddressR610(invalid));
console.log('R610 exact 12^10 historical corpus coordinate model PASS');
