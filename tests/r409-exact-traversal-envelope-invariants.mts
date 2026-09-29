import assert from'node:assert/strict';
import fs from'node:fs';
import{compileExactTraversalEnvelopeR409,verifyExactTraversalEnvelopeR409,R409_EXACT_TRAVERSAL_BOUNDARY}from'../src/system/exactTraversalEnvelopeR409';
import{modelMappedWgs84R347}from'../src/visualTraversalContextR347';

for(let i=0;i<20736;i++){
 const env=compileExactTraversalEnvelopeR409({address:i,theta:i%360,earth:null});
 assert.equal(verifyExactTraversalEnvelopeR409(env),true,`R409 envelope verification failed at ${i}`);
 assert.equal(env.exactAddress.index0,i);
 assert.equal(env.atlas360.hierarchy.leafIndex,i);
 assert.deepEqual(
  env.atlas360.hierarchy.digits.map((d:number)=>d+1),
  [env.exactAddress.coordinate.D_domain,env.exactAddress.coordinate.P_phase,env.exactAddress.coordinate.R_reg,env.exactAddress.coordinate.L_lens],
  `R409 Atlas360/exact coordinate mismatch at ${i}`
 );
 assert.equal(env.earthQuery.provenance,'DER');
 assert.equal(env.earthQuery.observationClaimed,false);
 assert.equal(env.earthQuery.physicalEarthCoordinateClaimed,false);
 assert.equal(env.claims.canonicalMutation,false);
 assert.equal(env.claims.productionAuthorityChanged,false);
 assert.equal(env.evidenceSummary.sourceObservationCount,0);
 assert.equal(env.evidenceSummary.sourceGapCount,4);
}

const earth={
 sources:{
  openMeteo:{source:'Open-Meteo',verifiedAt:'2026-09-29T03:00:00Z'},
  swpc:{source:'NOAA SWPC',verifiedAt:'2026-09-29T03:01:00Z'},
  usgs:{source:'USGS',verifiedAt:'2026-09-29T03:02:00Z'},
  eonet:{source:'NASA EONET',verifiedAt:'2026-09-29T03:03:00Z'},
 },
 localConditions:{time:'2026-09-29T03:00:00Z'},
 spaceWeather:{observationTime:'2026-09-29T03:01:00Z'},
};
const bound=compileExactTraversalEnvelopeR409({address:4242,theta:137,earth});
assert.equal(verifyExactTraversalEnvelopeR409(bound),true);
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
assert.match(R409_EXACT_TRAVERSAL_BOUNDARY,/never becomes a physical Earth coordinate/i);

const liveScene=fs.readFileSync('src/system/liveSceneCorrelationR348.ts','utf8');
assert.ok(liveScene.includes("provenance:target.provenance")&&liveScene.includes("exactAddress:target.exactAddress"),'R409 live-scene query must carry exact address and DER provenance');
assert.ok(liveScene.includes("physicalEarthCoordinateClaimed:target.physicalEarthCoordinateClaimed")&&liveScene.includes("observationClaimed:target.observationClaimed"),'R409 live-scene query must carry explicit non-physical/non-observation claims');

const scheduler=fs.readFileSync('scripts/run_work_conserving_shards_r408.mjs','utf8');
assert.ok(scheduler.includes('activeResourceCost()+shardResourceCost'),'R409 must preserve R408 resource-aware proof scheduling');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert.ok(String(pkg.scripts.check||'').includes('npm run test:r408'),'R409 must preserve R408 proof-runtime gate');

console.log('R409 EXACT TRAVERSAL PASS · exhaustive 20,736 exact-v3↔Atlas360 address congruence · atlas→WGS84 remains DERIVED query mapping · returned source clocks remain OBS/GAP provenance · live scene carries exact address without model→observation promotion · CanonState/source/SAR/weather/deployment authority unchanged · R408 resource-aware proof scheduler preserved');
