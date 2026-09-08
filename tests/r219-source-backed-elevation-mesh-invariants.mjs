import assert from 'node:assert/strict';
import {computeElevationSceneMeshR219,manifestR219} from '../src/world/elevationSceneMeshR219.js';

const h='a'.repeat(64),b='b'.repeat(64),c='c'.repeat(64),d='d'.repeat(64),e='e'.repeat(64),f='f'.repeat(64),g='1'.repeat(64),j='2'.repeat(64),k='3'.repeat(64);
const field={state:'GEOSPATIAL_SCENE_FIELD_COMPUTED',fieldComputed:true,crs:'WGS84 / EPSG:4326',fieldSha256:h,receiptSha256:b,missionId:'mission-r219',projectId:'project-r219',r217ReceiptSha256:c,r216RequestSha256:d,r214AnchorSha256:e,r213AttemptSha256:f,r211LineageSha256:g,r208WorldBindingOperationSha256:j,previousWorldHeadSha256:k,earthHash:'earth-r219',groundHash:'ground-r219',evidenceDigest:'evidence-r219',profile:'CONSERVATIVE',side:2,spacingM:8,sampleCount:4,samples:[
 {i:0,x:0,y:0,eastM:-4,northM:4,lat:32.222636,lon:-110.974743,elevationM:null,depthM:null,radiometry:null,material:null},
 {i:1,x:1,y:0,eastM:4,northM:4,lat:32.222636,lon:-110.974657,elevationM:null,depthM:null,radiometry:null,material:null},
 {i:2,x:0,y:1,eastM:-4,northM:-4,lat:32.222564,lon:-110.974743,elevationM:null,depthM:null,radiometry:null,material:null},
 {i:3,x:1,y:1,eastM:4,northM:-4,lat:32.222564,lon:-110.974657,elevationM:null,depthM:null,radiometry:null,material:null}
]};
const evidence={schema:'OMEGA_SOURCE_ELEVATION_EVIDENCE_V1',sourceFamily:'USGS_3DEP',sourceUrl:'https://api.usgs.gov/example/3dep',retrievedAt:'2026-09-08T10:00:00Z',crs:'WGS84 / EPSG:4326',verticalDatum:'NAVD88',samples:field.samples.map((s,i)=>({i:s.i,lat:s.lat,lon:s.lon,elevationM:730+i*.5,sourceId:`3dep-${i}`,uncertaintyM:.53}))};

const a=await computeElevationSceneMeshR219({field,evidence});
const again=await computeElevationSceneMeshR219({field,evidence});
assert.equal(a.state,'SOURCE_BACKED_ELEVATION_MESH_COMPUTED');
assert.equal(a.meshComputed,true);
assert.equal(a.elevationEvidenceAccepted,true);
assert.equal(a.sampleCount,4);
assert.equal(a.samples[0].elevationM,730);
assert.equal(a.samples[3].elevationM,731.5);
assert.equal(a.samples[0].depthM,null);
assert.equal(a.samples[0].radiometry,null);
assert.equal(a.samples[0].material,null);
assert.equal(a.verticalDatum,'NAVD88');
assert.equal(a.reliefM,1.5);
assert.match(a.elevationEvidenceSha256,/^[a-f0-9]{64}$/);
assert.match(a.meshSha256,/^[a-f0-9]{64}$/);
assert.match(a.receiptSha256,/^[a-f0-9]{64}$/);
assert.equal(a.elevationEvidenceSha256,again.elevationEvidenceSha256);
assert.equal(a.meshSha256,again.meshSha256);
assert.equal(a.receiptSha256,again.receiptSha256);
assert.equal(a.r218FieldSha256,h);
assert.equal(a.r218ReceiptSha256,b);
assert.equal(a.r217ReceiptSha256,c);
assert.equal(a.r208WorldBindingOperationSha256,j);
assert.equal(a.computedRealityAuthority,'R122_EXISTING_COMPUTED_REALITY');
assert.equal(a.adaptivePerformanceAuthority,'R185_EXISTING_PERFORMANCE_LAYER');
assert.equal(a.computedPhotorealRealityProved,false);
assert.equal(a.solverValidityProved,false);
assert.equal(a.nativeExecutionClaimed,false);
assert.equal(a.federationClosureProved,false);
assert.equal(a.canonicalMutation,false);

const badSource=await computeElevationSceneMeshR219({field,evidence:{...evidence,sourceFamily:'UNKNOWN'}});
assert.equal(badSource.state,'HELD_FOR_SOURCE_EVIDENCE');
assert.equal(badSource.meshComputed,false);
const mismatch=await computeElevationSceneMeshR219({field,evidence:{...evidence,samples:evidence.samples.map((x,i)=>i===2?{...x,lat:x.lat+.01}:x)}});
assert.equal(mismatch.state,'HELD_FOR_SOURCE_EVIDENCE');
assert.equal(mismatch.reason,'SAMPLE_ID_OR_COORDINATE_MISMATCH');
const missing=await computeElevationSceneMeshR219({field,evidence:{...evidence,samples:evidence.samples.map((x,i)=>i===1?{...x,elevationM:null}:x)}});
assert.equal(missing.state,'HELD_FOR_SOURCE_EVIDENCE');

const manifest=manifestR219();
assert.equal(manifest.authority.computedReality,'R122 existing authority');
assert.equal(manifest.authority.canonicalAdmission,'R125');
assert.match(manifest.truthBoundary,/does not synthesize missing elevations/i);
assert.match(manifest.truthBoundary,/does not .*prove computed photoreal reality/i);
console.log('R219 source-backed elevation mesh invariants: PASS');
