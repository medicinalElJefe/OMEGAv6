import assert from'node:assert/strict';
import fs from'node:fs';
import{
 compileExactTraversalEnvelopeR500,
 verifyExactTraversalEnvelopeR500,
 R500_EXACT_TRAVERSAL_BOUNDARY,
 R500_NEUTRAL_BEARING_SOURCE,
 R500_CALLER_BEARING_SOURCE,
}from'../src/system/exactTraversalEnvelopeR500';
import{modelMappedWgs84R347}from'../src/visualTraversalContextR347';

for(let i=0;i<20736;i++){
 const env=compileExactTraversalEnvelopeR500({address:i,earth:null});
 assert.equal(verifyExactTraversalEnvelopeR500(env),true,`R500 envelope verification failed at ${i}`);
 assert.equal(env.exactAddress.index0,i);
 assert.equal(env.atlas360.hierarchy.leafIndex,i);
 assert.deepEqual(
  env.atlas360.hierarchy.digits.map((d:number)=>d+1),
  [env.exactAddress.coordinate.D_domain,env.exactAddress.coordinate.P_phase,env.exactAddress.coordinate.R_reg,env.exactAddress.coordinate.L_lens],
  `R500 Atlas360/exact coordinate mismatch at ${i}`
 );
 assert.equal(env.atlas360.bearingSource,R500_NEUTRAL_BEARING_SOURCE);
 assert.equal(env.earthQuery.provenance,'DER');
 assert.equal(env.earthQuery.observationClaimed,false);
 assert.equal(env.earthQuery.physicalEarthCoordinateClaimed,false);
 assert.equal(env.claims.modelBearingClaimedAsMeasurement,false);
 assert.equal(env.claims.canonicalMutation,false);
 assert.equal(env.claims.productionAuthorityChanged,false);
 assert.equal(env.evidenceSummary.sourceObservationCount,0);
 assert.equal(env.evidenceSummary.sourceGapCount,4);
}

const caller=compileExactTraversalEnvelopeR500({address:4242,theta:137,earth:null});
assert.equal(caller.atlas360.bearingSource,R500_CALLER_BEARING_SOURCE);
assert.equal(caller.atlas360.bearing.theta,137);
assert.equal(caller.atlas360.physicalVectorClaimed,false);

const earth={
 sources:{
  openMeteo:{source:'Open-Meteo',verifiedAt:'2026-10-06T23:00:00Z'},
  swpc:{source:'NOAA SWPC',verifiedAt:'2026-10-06T23:01:00Z'},
  usgs:{source:'USGS',verifiedAt:'2026-10-06T23:02:00Z'},
  eonet:{source:'NASA EONET',verifiedAt:'2026-10-06T23:03:00Z'},
 },
 localConditions:{time:'2026-10-06T23:00:00Z'},
 spaceWeather:{observationTime:'2026-10-06T23:01:00Z'},
};
const bound=compileExactTraversalEnvelopeR500({address:4242,theta:137,earth});
assert.equal(verifyExactTraversalEnvelopeR500(bound),true);
assert.equal(bound.evidenceSummary.sourceObservationCount,4);
assert.equal(bound.evidenceSummary.sourceGapCount,0);
assert.ok(bound.sourceEvidence.every(x=>x.provenance==='OBS'&&x.bound));
assert.equal(bound.sourceEvidence.find(x=>x.id==='weather')?.claimClass,'SOURCE_OBSERVATION_CLOCK');
assert.equal(bound.sourceEvidence.find(x=>x.id==='seismic')?.claimClass,'SOURCE_SNAPSHOT_VERIFICATION_CLOCK');

const target=modelMappedWgs84R347(4242);
assert.equal(target.exactAddress.index0,4242);
assert.equal(target.provenance,'DER');
assert.equal(target.observationClaimed,false);
assert.equal(target.physicalEarthCoordinateClaimed,false);
assert.match(target.boundary,/query mapping only/i);
assert.match(R500_EXACT_TRAVERSAL_BOUNDARY,/read-only envelope/i);

const forecast=fs.readFileSync('src/ForecastSovereignPanel.tsx','utf8');
assert.ok(forecast.includes("import OmegaAtlas360R356 from './OmegaAtlas360R356';"),'R500 must recover Atlas360 Forecast surface');
assert.ok(forecast.includes('<OmegaAtlas360R356 address={address} compact/>'),'R500 Forecast must render current runtime-derived Atlas360 surface');

const bridge=fs.readFileSync('src/system/proofCarryingConvergenceBridge.ts','utf8');
assert.ok(bridge.includes('identity.atlas360||'),'explicit caller Atlas360 context must remain authoritative');
assert.ok(bridge.includes('leafIndex:packet.A_t.address'),'PCWD fallback must carry exact packet address');
assert.ok(bridge.includes("observerBearingSource:'NEUTRAL_REFERENCE_FRAME_NOT_MEASUREMENT'"),'PCWD fallback theta=0 must be explicitly non-measurement');

const liveScene=fs.readFileSync('src/system/liveSceneCorrelationR348.ts','utf8');
for(const token of ['provenance:target.provenance','exactAddress:target.exactAddress','physicalEarthCoordinateClaimed:target.physicalEarthCoordinateClaimed','observationClaimed:target.observationClaimed'])
 assert.ok(liveScene.includes(token),`R500 live-scene query missing ${token}`);

const atlas=fs.readFileSync('src/system/atlas360TriangulationR356.js','utf8');
for(const token of ['NO_NEW_PHYSICAL_PRIMITIVE','REAL_ANCHORS_REQUIRED_FOR_MEASUREMENT_DEPENDENT_RESULTS','ACTIVE_SLICE_COMPUTE_PRECEDES_FULL_TENSOR_MATERIALIZATION','measurementFabricated:false','canonicalMutation:false','productionAuthorityChanged:false'])
 assert.ok(atlas.includes(token),`R500 Atlas360 law missing ${token}`);

const r286=fs.readFileSync('scripts/run_r286_control_shards.sh','utf8');
assert.ok(r286.includes('R408_SHARD_RESOURCE_COST=2'),'R500 must retain R409.1 contention correction inherited by current main');

const r202=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');
assert.ok(r202.includes('r370-live-earth-sar-closure-browser-e2e.mjs')&&r202.includes('r372-live-earth-total-interaction-browser-e2e.mjs'),'R500 must retain the later Earth/SAR authority that superseded stale #769/#777');

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert.ok(String(pkg.scripts.check||'').includes('npm run test:r499'),'R500 must preserve R499 sequential bridge continuity');
assert.ok(String(pkg.scripts.check||'').includes('npm run test:r500'),'R500 must bind this reconciliation into canonical check');

console.log('R500 ORPHANED CAPABILITY RECONCILIATION PASS · #824 R409 exact-v3 Atlas/Earth identity + #853 R428 Forecast/PCWD Atlas360 propagation recovered on current R499 lineage · #769/#777 remain superseded by R370/R372 · 20,736 exhaustive address congruence · neutral bearing explicitly non-measurement · source OBS/GAP truth preserved · no authority inflation');
