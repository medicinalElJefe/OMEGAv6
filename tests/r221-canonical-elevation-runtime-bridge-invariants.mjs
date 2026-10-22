import assert from 'node:assert/strict';
import {acquireCanonicalElevationMeshR221,manifestR221,R221_BOUNDARY} from '../src/world/canonicalElevationRuntimeBridgeR221.js';

const h=n=>String(n).repeat(64).slice(0,64);
const samples=Array.from({length:25},(_,i)=>({i,lat:32.220000+(i*0.00001),lon:-110.930000+(i*0.00001),eastM:(i%5-2)*8,northM:(Math.floor(i/5)-2)*8,elevationM:null,depthM:null,radiometry:null,material:null}));
const field={schema:'OMEGA_GEOSPATIAL_SCENE_FIELD_R218',revision:'R218',state:'GEOSPATIAL_SCENE_FIELD_COMPUTED',fieldComputed:true,crs:'WGS84 / EPSG:4326',fieldSha256:h('a'),receiptSha256:h('b'),sampleCount:samples.length,samples,profile:'CONSERVATIVE',side:5,spacingM:8,missionId:'mission-r221',projectId:'project-r221',r217ReceiptSha256:h('c'),r216RequestSha256:h('d'),r214AnchorSha256:h('e'),r213AttemptSha256:h('f'),r211LineageSha256:h('1'),r208WorldBindingOperationSha256:h('2'),previousWorldHeadSha256:h('3'),earthHash:h('4'),groundHash:h('5'),evidenceDigest:h('6')};

const seen=[];
const fetcher=async url=>{
 const u=new URL(url);seen.push(u);
 assert.equal(u.origin,'https://omegav6.jeffdeweyeljefe.workers.dev');
 assert.equal(u.pathname,'/api/earth/ground/evidence');
 assert.equal(u.searchParams.get('radius'),'250');
 const lat=Number(u.searchParams.get('lat')),lon=Number(u.searchParams.get('lon'));
 return new Response(JSON.stringify({levels:{GROUND:{state:'RETURNED_USGS_ELEVATION',elevationM:500+(lat-32.22)*10000+(lon+110.93)*1000,source:'USGS_3DEP_EPQS'}}}),{status:200,headers:{'content-type':'application/json'}});
};

const ready=await acquireCanonicalElevationMeshR221({field,fetcher,origin:'https://omegav6.jeffdeweyeljefe.workers.dev',concurrency:3,retries:0,retryDelayMs:0});
assert.equal(ready.state,'CANONICAL_ELEVATION_MESH_READY');
assert.equal(ready.canonicalWorkerMediated,true);
assert.equal(ready.groundEvidenceAuthority,'R9/R121_EXISTING_CANONICAL_WORKER');
assert.equal(ready.sampleCount,25);
assert.equal(seen.length,25);
assert.ok(seen.every(u=>u.hostname==='omegav6.jeffdeweyeljefe.workers.dev'&&u.hostname!=='epqs.nationalmap.gov'));
assert.match(ready.elevationEvidenceSha256,/^[a-f0-9]{64}$/);
assert.match(ready.meshSha256,/^[a-f0-9]{64}$/);
assert.match(ready.receiptSha256,/^[a-f0-9]{64}$/);
assert.equal(ready.mesh.samples.every(s=>Number.isFinite(s.elevationM)&&s.depthM===null&&s.radiometry===null&&s.material===null),true);
assert.equal(ready.computedPhotorealRealityProved,false);
assert.equal(ready.solverValidityProved,false);
assert.equal(ready.nativeExecutionClaimed,false);
assert.equal(ready.federationClosureProved,false);
assert.equal(ready.canonicalMutation,false);

let calls=0;
const incomplete=await acquireCanonicalElevationMeshR221({field,origin:'https://omegav6.jeffdeweyeljefe.workers.dev',retries:0,retryDelayMs:0,fetcher:async url=>{calls++;const u=new URL(url);const lat=Number(u.searchParams.get('lat'));return new Response(JSON.stringify({levels:{GROUND:lat===samples[7].lat?{state:'NO_SOURCE_ELEVATION'}:{state:'RETURNED_USGS_ELEVATION',elevationM:500,source:'USGS_3DEP_EPQS'}}}),{status:200,headers:{'content-type':'application/json'}})}});
assert.equal(calls,25);
assert.equal(incomplete.state,'HELD_FOR_COMPLETE_CANONICAL_ELEVATION_EVIDENCE');
assert.equal(incomplete.meshComputed,false);
assert.equal(incomplete.evidence.state,'HELD_FOR_COMPLETE_SOURCE_EVIDENCE');
assert.equal(incomplete.evidence.failures.length,1);
assert.equal(incomplete.computedPhotorealRealityProved,false);

const manifest=manifestR221();
assert.equal(manifest.authority.groundEvidence,'R9/R121 existing canonical Worker');
assert.equal(manifest.authority.acquisition,'R220');
assert.equal(manifest.authority.elevationMesh,'R219');
assert.equal(manifest.authority.canonicalAdmission,'R125');
assert.match(R221_BOUNDARY,/does not call USGS directly from the browser/i);
assert.match(R221_BOUNDARY,/does not.*prove computed photoreal reality/i);
console.log('R221 canonical elevation runtime bridge invariants passed');
