import test from 'node:test';
import assert from 'node:assert/strict';
import { LEMMA_STATES, atlasLodForScale, continuityKernel, translateLemmaState, translateFabricCell } from '../src/lemma-state-calculus.mjs';

test('measured evidence remains fixed above derived/context states',()=>{
  const exact=translateLemmaState({exactMeasured:true,regionalMeasured:true,sourceCoverage:12,fieldConfidence:.99,gammaAdmission:'ADMIT_HIGH',contradictions:4});
  assert.equal(exact.state,LEMMA_STATES.EXACT);assert.equal(exact.proof.measured,true);assert.equal(exact.proof.inferred,false);assert.equal(exact.confidence,1);assert.equal(exact.mode188,'STAY');assert.equal(exact.render.measuredWeight,1);
  const regional=translateLemmaState({regionalMeasured:true,sourceCoverage:12});assert.equal(regional.state,LEMMA_STATES.REGIONAL);assert.equal(regional.proof.measured,true);assert.ok(regional.render.measuredWeight>.9);
});

test('Mode188 never upgrades source coverage into measured SAR pixels',()=>{
  const source=translateLemmaState({sourceCoverage:8,fieldConfidence:.95,gammaAdmission:'ADMIT_HIGH'});
  assert.equal(source.state,LEMMA_STATES.SOURCE);assert.equal(source.proof.measured,false);assert.equal(source.proof.sourceSupported,true);assert.equal(source.proof.inferred,false);assert.equal(source.render.measuredWeight,0);
  assert.match(source.semantics,/does not create missing SAR measurements/i);
});

test('derived continuity needs admitted bounded numeric support and remains inferred',()=>{
  const held=translateLemmaState({fieldConfidence:.8,gammaAdmission:'HOLD_LOW_CONFIDENCE',contextAvailable:true});assert.equal(held.state,LEMMA_STATES.CONTEXT);assert.equal(held.proof.inferred,false);
  const admitted=translateLemmaState({fieldConfidence:.72,gammaAdmission:'ADMIT_BOUNDED',spatialOverlap:.9,historyCarry:.8});assert.equal(admitted.state,LEMMA_STATES.WOVEN);assert.equal(admitted.proof.measured,false);assert.equal(admitted.proof.inferred,true);assert.ok(admitted.confidence>.4);
});

test('continuity kernel loses confidence with temporal gap and fast camera motion',()=>{
  const stable=continuityKernel({frameGapHours:1,spatialOverlap:.95,cameraVelocity:.2,historyCarry:.8});
  const broken=continuityKernel({frameGapHours:720,spatialOverlap:.1,cameraVelocity:20,historyCarry:0});
  assert.ok(stable.continuity>broken.continuity);assert.ok(stable.invariantCarry>broken.invariantCarry);
});

test('fabric cells encode coverage and recency without measurement promotion',()=>{
  const cell=translateFabricCell({coverage:5,newestAgeHours:12,meanAgeHours:80,orbitMix:.2});
  assert.equal(cell.state,LEMMA_STATES.SOURCE);assert.equal(cell.proof.measured,false);assert.ok(cell.temporalSupport>.5);assert.ok(cell.coverageSupport>.5);
});

test('atlas LOD is a render/address resolution and never a physical-dimension claim',()=>{
  const global=atlasLodForScale(1,{width:1200,height:700}),local=atlasLodForScale(1600,{width:1200,height:700});
  assert.ok(local.cols>global.cols);assert.equal(global.physicalDimensionClaim,false);assert.equal(local.physicalDimensionClaim,false);assert.equal(global.atlasAddress,'12');assert.equal(local.atlasAddress,'248832');
});
