import assert from 'node:assert/strict';
import fs from 'node:fs';

const forecast=fs.readFileSync('src/ForecastSovereignPanel.tsx','utf8');
const bridge=fs.readFileSync('src/system/proofCarryingConvergenceBridge.ts','utf8');
const atlas=fs.readFileSync('src/system/atlas360TriangulationR356.js','utf8');
const convergence=fs.readFileSync('src/OmegaConvergenceSurfaceR416.tsx','utf8');
const specialist=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');

assert.ok(forecast.includes("import OmegaAtlas360R356 from './OmegaAtlas360R356';"));
assert.ok(forecast.includes('<OmegaAtlas360R356 address={address} compact/>'));
assert.ok(convergence.includes('<OmegaAtlas360R356 address={address}/>'));
for(const token of ["panel==='Field'||panel==='Data Motion'","panel==='Evidence & Proof'","<OmegaAtlas360R356 address={address}"]){
  assert.ok(specialist.includes(token),`Atlas360 retained surface propagation missing ${token}`);
}
assert.ok(bridge.includes("leafIndex:packet.A_t.address"));
assert.ok(bridge.includes("activeAddresses:[packet.A_t.address]"));
assert.ok(bridge.includes("observerBearingSource:'NEUTRAL_REFERENCE_FRAME_NOT_MEASUREMENT'"));
assert.ok(bridge.includes("identity.atlas360||"),'explicit caller Atlas360 context must override neutral derived context');
for(const token of [
  'NO_NEW_PHYSICAL_PRIMITIVE',
  'REAL_ANCHORS_REQUIRED_FOR_MEASUREMENT_DEPENDENT_RESULTS',
  'ACTIVE_SLICE_COMPUTE_PRECEDES_FULL_TENSOR_MATERIALIZATION',
  'measurementFabricated:false',
  'canonicalMutation:false',
  'productionAuthorityChanged:false'
])assert.ok(atlas.includes(token),`Atlas360 boundary/performance law missing ${token}`);

console.log('R428 ATLAS360 CURRENT-MAIN PROPAGATION PASS · Forecast + Convergence + Field/Data Motion + Evidence/Proof + PCWD address carry · neutral bearing explicitly non-measurement · no authority inflation');
