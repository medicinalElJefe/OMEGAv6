import assert from 'node:assert/strict';
import {compileBioEmpiricalConvergenceR281,parseBioEmpiricalTextR281,type BioEmpiricalCaseR281} from '../src/bioEmpiricalConvergenceR281';

const rows:BioEmpiricalCaseR281[]=[
 {id:'f1',domain:1,layer:1,variable:'fixture',unit:'u',observed:3,predicted:1,baseline:0,partition:'FIT',verified:true},
 {id:'f2',domain:1,layer:2,variable:'fixture',unit:'u',observed:5,predicted:2,baseline:0,partition:'FIT',verified:true},
 {id:'f3',domain:2,layer:3,variable:'fixture',unit:'u',observed:7,predicted:3,baseline:0,partition:'FIT',verified:true},
 {id:'h1',domain:1,layer:1,variable:'fixture',unit:'u',observed:9,predicted:4,baseline:6,partition:'HOLDOUT',verified:true},
 {id:'h2',domain:2,layer:2,variable:'fixture',unit:'u',observed:11,predicted:5,baseline:7,partition:'HOLDOUT',verified:true},
 {id:'h3',domain:3,layer:3,variable:'fixture',unit:'u',observed:13,predicted:6,baseline:8,partition:'HOLDOUT',verified:true},
 {id:'h4',domain:4,layer:4,variable:'fixture',unit:'u',observed:15,predicted:7,baseline:9,partition:'HOLDOUT',verified:true},
 {id:'h5',domain:5,layer:5,variable:'fixture',unit:'u',observed:17,predicted:8,baseline:10,partition:'HOLDOUT',verified:true},
 {id:'p1',domain:6,layer:6,variable:'fixture',unit:'u',observed:19,predicted:9,baseline:11,partition:'PROSPECTIVE',verified:true},
 {id:'bad',domain:13,layer:1,variable:'fixture',unit:'u',observed:1,predicted:1,baseline:1,partition:'HOLDOUT',verified:true}
];

const frame=compileBioEmpiricalConvergenceR281(rows);
assert.equal(frame.measurementAuthority,0);
assert.equal(frame.accepted,9);
assert.equal(frame.rejected,1);
assert.equal(frame.summaries.fit.n,3);
assert.equal(frame.summaries.holdout.n,5);
assert.equal(frame.summaries.prospective.n,1);
assert.equal(frame.candidate.available,true);
assert.ok(Math.abs(frame.candidate.slope-2)<1e-12);
assert.ok(Math.abs(frame.candidate.offset-1)<1e-12);
assert.ok((frame.candidate.holdout.mae??1)<1e-12);
assert.ok((frame.candidate.holdout.liftVsCurrent??0)>0);
assert.ok((frame.candidate.holdout.liftVsBaseline??0)>0);
assert.equal(frame.candidate.promotable,true);
assert.equal(frame.atlas.domains.length,12);
assert.equal(frame.atlas.layers.length,12);
assert.equal(frame.wovenContinuity.invariantCarry.includes('observed reference'),true);
assert.equal(frame.wovenContinuity.scarCarry.includes('residual'),true);
assert.equal(frame.laws.includes('MODEL_AND_BASELINE_PREDICTIONS_NEVER_REWRITE_OBSERVATIONS'),true);

const before=rows.map(x=>x.observed);
compileBioEmpiricalConvergenceR281(rows);
assert.deepEqual(rows.map(x=>x.observed),before,'empirical compilation must not mutate observed reference values');

const parsed=parseBioEmpiricalTextR281('id,domain,layer,variable,unit,observed,predicted,baseline,partition,verified\nc1,1,12,x,mm,10,9,8,HOLDOUT,true','fixture.csv');
assert.equal(parsed.length,1);
assert.equal(parsed[0].partition,'HOLDOUT');
assert.equal(parsed[0].verified,true);
assert.equal(parsed[0].observed,10);

console.log('R281 BIO EMPIRICAL CONVERGENCE PASS · observed reference invariant · FIT proposes linear calibration · untouched 5-case HOLDOUT proves candidate improvement vs current model + baseline · PROSPECTIVE remains separate · 12 domain + 12 layer residual slices · measurement authority 0');
