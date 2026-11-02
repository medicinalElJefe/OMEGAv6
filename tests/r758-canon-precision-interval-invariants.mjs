import assert from 'node:assert/strict';
import {conditionalCanonGateR758,R758_TRUTH} from '../src/proof/canonPrecisionIntervalR758.js';
for(const sample of [
 {c:'0.5199',phi:'0.5500',q:'0.3824',lambda:'0.9167'},
 {c:'0.4681',phi:'0.6500',q:'0.3824',lambda:'1.0000'}
]){const x=conditionalCanonGateR758(sample);assert.equal(x.conditionalGate,'ESCALATE');assert.equal(x.stable,true);assert.equal(x.liveActionAdmissible,false);}
for(const sample of [
 {c:'0.2654',phi:'0.5444',q:'0.1765',lambda:'0.1667'},
 {c:'0.4100',phi:'0.6889',q:'0.5882',lambda:'0.0833'}
]){const x=conditionalCanonGateR758(sample);assert.equal(x.conditionalGate,'PRECISION_HOLD');assert.equal(x.stable,false);}
assert.equal(conditionalCanonGateR758({c:'0.1000',phi:'0.1000',q:'0.1000',lambda:'0.1000'}).conditionalGate,'ESCALATE');
assert.equal(conditionalCanonGateR758({c:'1',phi:'1',q:'0.1',lambda:'0.1'}).conditionalGate,'STAY');
for(const v of ['0.00000','-0.1','NaN','1e-2',.4,''])assert.throws(()=>conditionalCanonGateR758({c:v,phi:'0.2',q:'0.2',lambda:'0.2'}));
assert.equal(R758_TRUTH.originalGeneratorVerified,false);
assert.equal(R758_TRUTH.liveDecisionAuthority,false);
console.log('R758 conditional exact integer Canon interval, precision HOLD and negative controls PASS');