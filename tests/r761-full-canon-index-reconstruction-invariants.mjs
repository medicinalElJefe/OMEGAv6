import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {reconstructCanonIndexR761,R761_TRUTH} from '../src/proof/canonIndexReconstructionR761.js';

const first=reconstructCanonIndexR761(1,1,1,1,1);
assert.deepEqual([first.index,first.key,first.mode188,first.C,first.q,first.lambda,first.Phi,first.score,first.decision],
 [1,'D01-S01-R01-M01-P01',40,'0.0833','0.1176','0.4167','0.3889','0.0605','ESCALATE']);
const last=reconstructCanonIndexR761(12,12,12,12,12);
assert.deepEqual([last.index,last.key,last.C,last.q,last.lambda,last.Phi,last.score,last.decision],
 [248832,'D12-S12-R12-M12-P12','1.0000','0.2647','0.0833','0.6944','1.9896','STAY']);
const h=createHash('sha256');
let n=0,stay=0,turn=0,escalate=0;
for(let D=1;D<=12;D++)for(let S=1;S<=12;S++)for(let R=1;R<=12;R++)for(let M=1;M<=12;M++)for(let P=1;P<=12;P++){
 const x=reconstructCanonIndexR761(D,S,R,M,P);
 h.update([x.index,x.key,x.mode188,x.C,x.q,x.lambda,x.Phi,x.score,x.decision].join('\t')+'\n');
 assert.equal(x.index,++n);
 assert.equal(x.liveDecisionAuthority,false);
 assert.equal(x.historicalGeneratorAuthenticated,false);
 if(x.decision==='STAY')stay++;else if(x.decision==='TURN')turn++;else escalate++;
}
assert.equal(n,248832);
assert.deepEqual([stay,turn,escalate],[73214,111786,63832]);
const digest=h.digest('hex');
assert.equal(digest,R761_TRUTH.normalizedNumericDigestSha256,
 'Full 248832-row independent source SHA256 mismatch');
assert.equal(R761_TRUTH.canonicalDecisionMutation,false);
assert.equal(R761_TRUTH.historicalOriginalGeneratorRecovered,false);
assert.equal(R761_TRUTH.globalSharpSingmaster,'OPEN');
assert.throws(()=>reconstructCanonIndexR761(0,1,1,1,1));
assert.throws(()=>reconstructCanonIndexR761(1,13,1,1,1));
assert.throws(()=>reconstructCanonIndexR761(1.5,1,1,1,1));
assert.throws(()=>reconstructCanonIndexR761('1',1,1,1,1));
console.log('R761 FULL 248832 CANON INDEX-ONLY RECONSTRUCTION SHA256 PASS '+digest+
 ' · 92 formerly HOLD labels reproduced · historical generator authority NOT ASSERTED');
