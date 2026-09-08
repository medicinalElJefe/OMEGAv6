import assert from 'node:assert/strict';
import {acquireElevationEvidenceR220,manifestR220} from '../src/world/elevationEvidenceAcquisitionR220.js';
import {computeElevationSceneMeshR219} from '../src/world/elevationSceneMeshR219.js';

const h='a'.repeat(64),b='b'.repeat(64);
const samples=Array.from({length:25},(_,i)=>({i,x:i%5,y:Math.floor(i/5),eastM:(i%5-2)*8,northM:(2-Math.floor(i/5))*8,lat:Number((32.2226+(2-Math.floor(i/5))*0.0000719).toFixed(9)),lon:Number((-110.9747+(i%5-2)*0.0000849).toFixed(9)),elevationM:null,depthM:null,radiometry:null,material:null}));
const field={state:'GEOSPATIAL_SCENE_FIELD_COMPUTED',fieldComputed:true,crs:'WGS84 / EPSG:4326',fieldSha256:h,receiptSha256:b,missionId:'mission-r220',projectId:'project-r220',r217ReceiptSha256:'c'.repeat(64),r216RequestSha256:'d'.repeat(64),r214AnchorSha256:'e'.repeat(64),r213AttemptSha256:'f'.repeat(64),r211LineageSha256:'1'.repeat(64),r208WorldBindingOperationSha256:'2'.repeat(64),previousWorldHeadSha256:'3'.repeat(64),earthHash:'earth-r220',groundHash:'ground-r220',evidenceDigest:'evidence-r220',profile:'CONSERVATIVE',side:5,spacingM:8,sampleCount:samples.length,samples};

let active=0,maxActive=0,calls=0;
const fetcher=async url=>{calls++;active++;maxActive=Math.max(maxActive,active);await new Promise(r=>setTimeout(r,2));const u=new URL(url);const x=Number(u.searchParams.get('x')),y=Number(u.searchParams.get('y'));active--;return{ok:true,status:200,json:async()=>({value:Number((700+(y-32.22)*10+(x+111)*2).toFixed(4)),rasterId:`raster-${calls}`})}};
const evidence=await acquireElevationEvidenceR220({field,fetcher,concurrency:3,retries:0,retryDelayMs:0});
assert.equal(evidence.schema,'OMEGA_SOURCE_ELEVATION_EVIDENCE_V1');
assert.equal(evidence.state,'RETURNED_COMPLETE_USGS_ELEVATION_EVIDENCE');
assert.equal(evidence.acquisitionComplete,true);
assert.equal(evidence.sourceFamily,'USGS_3DEP');
assert.equal(evidence.crs,'WGS84 / EPSG:4326');
assert.equal(evidence.verticalDatum,'UNSPECIFIED_BY_EPQS_RESPONSE');
assert.equal(evidence.samples.length,25);
assert.equal(calls,25);
assert.ok(maxActive<=3,'bounded concurrency exceeded');
for(let i=0;i<samples.length;i++){
 assert.equal(evidence.samples[i].i,samples[i].i);
 assert.equal(evidence.samples[i].lat,samples[i].lat);
 assert.equal(evidence.samples[i].lon,samples[i].lon);
 assert.equal(typeof evidence.samples[i].elevationM,'number');
 assert.equal(evidence.samples[i].uncertaintyM,null);
}
assert.equal(evidence.computedPhotorealRealityProved,false);
assert.equal(evidence.solverValidityProved,false);
assert.equal(evidence.nativeExecutionClaimed,false);
assert.equal(evidence.federationClosureProved,false);
assert.equal(evidence.canonicalMutation,false);

const mesh=await computeElevationSceneMeshR219({field,evidence});
assert.equal(mesh.state,'SOURCE_BACKED_ELEVATION_MESH_COMPUTED');
assert.equal(mesh.sampleCount,25);
assert.equal(mesh.verticalDatum,'UNSPECIFIED_BY_EPQS_RESPONSE');
assert.match(mesh.meshSha256,/^[a-f0-9]{64}$/);

let failureCalls=0;
const partialFetcher=async url=>{failureCalls++;const u=new URL(url),x=Number(u.searchParams.get('x'));return failureCalls===7?{ok:false,status:503,json:async()=>({})}:{ok:true,status:200,json:async()=>({value:710+x/100})}};
const held=await acquireElevationEvidenceR220({field,fetcher:partialFetcher,concurrency:4,retries:0,retryDelayMs:0});
assert.equal(held.state,'HELD_FOR_COMPLETE_SOURCE_EVIDENCE');
assert.equal(held.acquisitionComplete,false);
assert.equal(held.returnedSampleCount,24);
assert.equal(held.failures.length,1);
assert.equal(held.computedPhotorealRealityProved,false);

const nullFetcher=async()=>({ok:true,status:200,json:async()=>({value:null})});
const nullHeld=await acquireElevationEvidenceR220({field,fetcher:nullFetcher,concurrency:8,retries:0,retryDelayMs:0});
assert.equal(nullHeld.state,'HELD_FOR_COMPLETE_SOURCE_EVIDENCE');
assert.equal(nullHeld.returnedSampleCount,0);

const tooLarge={...field,sampleCount:82,samples:Array.from({length:82},(_,i)=>({i,lat:32,lon:-111}))};
const invalid=await acquireElevationEvidenceR220({field:tooLarge,fetcher});
assert.equal(invalid.state,'HELD_FOR_R218_FIELD');

const manifest=manifestR220();
assert.equal(manifest.authority.elevationMesh,'R219');
assert.equal(manifest.authority.canonicalAdmission,'R125');
assert.equal(manifest.limits.maxSamples,81);
assert.match(manifest.truthBoundary,/does not interpolate missing samples/i);
assert.match(manifest.truthBoundary,/does not .*prove computed photoreal reality/i);
console.log('R220 bounded USGS elevation acquisition invariants: PASS');
