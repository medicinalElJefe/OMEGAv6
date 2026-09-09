import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARTED_CALIBRATION_CONTRACT,
  omegaViability,
  memoryUpdate,
  burdenUpdate,
  phaseTurn,
  compressionUpdate,
  dispatchOmega,
  shellSimplex,
  empiricalTurnDecision,
  leaveOneOutAtlasCalibration,
  calibrationProofPacket
} from '../src/calibration.mjs';
import { sarHostVariableAdapter } from '../src/sar-host.mjs';

test('charted empirical TURN constants are preserved exactly',()=>{
  const p=CHARTED_CALIBRATION_CONTRACT.empiricalTurnProfiles;
  assert.equal(p.canonicalS.threshold,0.8293400791736596);
  assert.equal(p.canonicalS.auc,0.9176136363636364);
  assert.equal(p.wovenS.threshold,0.3686657561111039);
  assert.equal(p.masterField.threshold,0.0374083197246837);
  assert.equal(p.omega.threshold,0.442882);
  assert.equal(p.decisionPressure.threshold,0.879964);
  assert.equal(p.decisionPressure.orientation,'lower=TURN');
});

test('Fold-Scale formal operators execute the charted equations',()=>{
  assert.equal(omegaViability(.8,.2,.3),.8/1.5);
  assert.equal(memoryUpdate(.4,.5,.1),.3);
  assert.ok(Math.abs(burdenUpdate(.5,.4,.7)-.2)<1e-12);
  assert.ok(Math.abs(phaseTurn(0,Math.PI/2)-Math.PI/2)<1e-12);
  assert.equal(compressionUpdate(4,.5),2);
});

test('formal Omega dispatch refuses an invented host threshold',()=>{
  assert.equal(dispatchOmega(.9),'UNRESOLVED_HOST_THRESHOLD');
  assert.equal(dispatchOmega(1,.05),'TURN');
  assert.equal(dispatchOmega(1.2,.05),'STAY');
  assert.equal(dispatchOmega(.8,.05),'ESCALATE');
});

test('1+6 shell uses exact opposite-pair contrasts and bounded simplex',()=>{
  const s=shellSimplex([0,1,2,3,4,6,8]);
  assert.deepEqual(s.contrasts,[-3,-4,-5]);
  assert.equal(s.dominantAxis,3);
  assert.ok(s.lambda.every(v=>v>=0&&v<=1));
  assert.ok(Math.abs(s.lambdaSum-1)<1e-8);
});

test('prior empirical profile remains reference-only for SAR',()=>{
  const r=empiricalTurnDecision('omega',.5);
  assert.equal(r.state,'TURN');
  assert.equal(r.role,'PRIOR_EMPIRICAL_REFERENCE');
});

test('SAR host adapter derives Canon variables only from measured stack',()=>{
  const samples=Array.from({length:8},(_,i)=>({id:String(i),time:new Date(Date.UTC(2026,8,1+i)).toISOString(),value:100+i*2,lon:-110.97,lat:32.22,measured:true}));
  samples.push({id:'inferred',time:'2026-09-20T00:00:00Z',value:9999,lon:-110.97,lat:32.22,measured:false});
  const a=sarHostVariableAdapter(samples);
  assert.equal(a.summary.count,8);
  assert.equal(a.measuredOnly,true);
  assert.equal(a.rows.at(-1).formalDispatch,'UNRESOLVED_HOST_THRESHOLD');
  assert.ok(Number.isFinite(a.rows.at(-1).Omega));
  assert.equal(a.boundaries.priorReleaseRangesAreNotForcedOntoSar,true);
});

test('SAR benchmark gate requires at least 30 measured observations',()=>{
  const samples=Array.from({length:8},(_,i)=>({id:String(i),time:new Date(Date.UTC(2026,8,1+i)).toISOString(),value:10+Math.sin(i/2),lon:-110.97,lat:32.22,measured:true}));
  const result=leaveOneOutAtlasCalibration(samples);
  assert.equal(result.gate.minimumMeasuredObservations,30);
  assert.equal(result.gate.meetsChartedSampleGate,false);
  assert.notEqual(result.state,'SAR_HOST_BENCHMARK_PASS');
  assert.equal(result.claim,'NO_SAR_CALIBRATION_CLAIM');
});

test('proof packet never promotes prior workbooks or inferred values to SAR observations',()=>{
  const packet=calibrationProofPacket(null);
  assert.equal(packet.authority.measuredSarRequired,true);
  assert.equal(packet.authority.priorBenchmarksCountAsSarObservations,false);
  assert.equal(packet.authority.proxyEarthChartCountsAsRawTerrain,false);
  assert.equal(packet.authority.inferredValuesCountAsObservations,false);
});

test('Earth proxy chart carries original warning and strong relationships',()=>{
  const e=CHARTED_CALIBRATION_CONTRACT.earthProxyChart;
  assert.equal(e.cells,2664);
  assert.equal(e.summary.strongCells,869);
  assert.equal(e.summary.usefulPlusCells,1741);
  assert.equal(e.correlations.depthMotionVsElevation,-0.8904);
  assert.equal(e.correlations.waterBathyVsElevation,-0.8752);
  assert.equal(e.correlations.orogenicScarVsElevation,0.5982);
  assert.match(e.warning,/not meter-accurate/i);
});
