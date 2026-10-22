import assert from'node:assert/strict';
import fs from'node:fs';
import{initCorpusPack}from'../src/corpusRuntime';
import{compileLiveSceneCorrelationR348}from'../src/system/liveSceneCorrelationR348';

await initCorpusPack();

const empty=compileLiveSceneCorrelationR348(4242,null,null,null,null);
assert.equal(empty.exactTraversal.verified,true);
assert.equal(empty.exactTraversal.exactAddress.index0,4242);
assert.equal(empty.query.exactAddress.index0,4242);
assert.equal(empty.query.provenance,'DER');
assert.equal(empty.query.physicalEarthCoordinateClaimed,false);
assert.equal(empty.query.observationClaimed,false);
assert.equal(empty.exactTraversal.evidenceSummary.sourceObservationCount,0);
assert.equal(empty.exactTraversal.evidenceSummary.sourceGapCount,4);
assert.equal(empty.exactTraversal.claims.canonicalMutation,false);
assert.equal(empty.exactTraversal.claims.productionAuthorityChanged,false);

const earth={
 verifiedAt:'2026-10-06T23:04:00Z',
 evidenceHash:'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
 sources:{
  openMeteo:{source:'Open-Meteo',verifiedAt:'2026-10-06T23:00:00Z'},
  swpc:{source:'NOAA SWPC',verifiedAt:'2026-10-06T23:01:00Z'},
  usgs:{source:'USGS',verifiedAt:'2026-10-06T23:02:00Z'},
  eonet:{source:'NASA EONET',verifiedAt:'2026-10-06T23:03:00Z'},
 },
 localConditions:{time:'2026-10-06T23:00:00Z',temperatureC:31,windKph:14},
 spaceWeather:{observationTime:'2026-10-06T23:01:00Z',kp:3},
 seismic:{count:7},
};
const bound=compileLiveSceneCorrelationR348(4242,earth,{state:'LIVE'},{state:'DEVICE_PROOF_REQUIRED'},null);
assert.equal(bound.exactTraversal.verified,true);
assert.equal(bound.exactTraversal.evidenceSummary.sourceObservationCount,4);
assert.equal(bound.exactTraversal.evidenceSummary.sourceGapCount,0);
assert.equal(bound.clocks.length,4);
assert.ok(bound.clocks.every((x:any)=>x.provenance==='OBS'&&x.bound));
assert.ok(bound.physicalObservations.length>=3);
assert.equal(bound.query.lat,bound.exactTraversal.earthQuery.lat);
assert.equal(bound.query.lon,bound.exactTraversal.earthQuery.lon);

const live=fs.readFileSync('src/system/liveSceneCorrelationR348.ts','utf8');
for(const token of[
 "compileExactTraversalEnvelopeR500({address,earth})",
 'verifyExactTraversalEnvelopeR500(exactTraversal)',
 'const target=exactTraversal.earthQuery',
 'const clocks=exactTraversal.sourceEvidence',
 'exactTraversal:{...exactTraversal,verified:exactTraversalVerified}'
])assert.ok(live.includes(token),`R501 live-scene binding missing ${token}`);
assert.ok(!live.includes('const target=modelMappedWgs84R347(address)'),'R501 live scene must not retain a parallel Earth query mapping');
assert.ok(!live.includes('const clocks=sourceClocksR347(earth)'),'R501 live scene must not retain a parallel source-clock computation');

const ui=fs.readFileSync('src/OmegaUnifiedConvergenceR348.tsx','utf8');
for(const token of[
 "data-r501-exact-traversal='true'",
 "data-r501-verified={exact.verified?'true':'false'}",
 'R501 · LIVE EXACT TRAVERSAL BINDING',
 'R500 envelope is now consumed by Convergence',
 'SOURCE CLOCK EVIDENCE',
 'canonical mutation NO · production authority changed NO · observation from model claimed NO'
])assert.ok(ui.includes(token),`R501 visible Convergence binding missing ${token}`);

const r202=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');
assert.ok(r202.includes('r501-live-exact-traversal-browser-e2e.mjs'),'R501 live browser proof must remain inside post-promotion R202 authority');

console.log('R501 LIVE EXACT TRAVERSAL BINDING PASS · R348 consumes verified R500 envelope · no parallel query/clock derivation · OBS/GAP source truth preserved · visible Convergence proof panel · no canonical/production authority inflation');
