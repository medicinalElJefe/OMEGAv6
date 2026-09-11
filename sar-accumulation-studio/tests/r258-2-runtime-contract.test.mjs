import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');
const transport=await readFile(new URL('../src/sar-global-fabric-coherence-transport.mjs',import.meta.url),'utf8');

test('R258.2 Canon, Unified Coherence and Mode188 truth boundary survives later releases',()=>{
  assert.match(source,/canonMode:'FULL_OVERALL_CANON'/);
  assert.match(source,/coherenceMode:'UNIFIED_COHERENCE'/);
  assert.match(source,/EVIDENCE_ADMISSION_STATE_TRANSLATION_WITHOUT_PHYSICAL_PROMOTION/);
  assert.match(source,/chartedMode188:'S_EQUALS_C_DIVIDED_BY_LAMBDA_PLUS_Q_PLUS_LAMBDA_Q_WITH_STAY_TURN_ESCALATE_AND_ACCEPT_CONDITIONAL_PRUNE'/);
  assert.match(source,/unresolvedFabricSectorCreatesCoverage:false/);
  assert.match(source,/sar-global-fabric-coherence-transport\.mjs/);
  assert.match(transport,/measurementPromotion:false/);
  assert.match(transport,/features:\[\]/);
});