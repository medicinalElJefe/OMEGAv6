import assert from 'node:assert/strict';
import {assembleLivingTerrainExperienceR224,manifestR224,R224_BOUNDARY} from '../src/world/livingTerrainExperienceR224.js';

const h=c=>String(c).repeat(64).slice(0,64).replace(/[^a-f0-9]/g,'a');
const side=5,samples=[];
for(let r=0;r<side;r++)for(let c=0;c<side;c++){const i=r*side+c;samples.push({i,x:c,y:r,eastM:(c-2)*8,northM:(2-r)*8,lat:32.2+r*.00001,lon:-110.8+c*.00001,elevationM:null,depthM:null,radiometry:null,material:null});}
const field={schema:'OMEGA_GEOSPATIAL_SCENE_FIELD_R218',revision:'R218',state:'GEOSPATIAL_SCENE_FIELD_COMPUTED',fieldComputed:true,crs:'WGS84 / EPSG:4326',target:{lat:32.2,lon:-110.8},profile:'CONSERVATIVE',side,spacingM:8,sampleCount:25,fieldSha256:h('a'),receiptSha256:h('b'),missionId:'mission-r224',projectId:'project-r224',r217ReceiptSha256:h('c'),r217FrameSha256:h('d'),r216RequestSha256:h('e'),r214AnchorSha256:h('f'),r213AttemptSha256:h('1'),r211LineageSha256:h('2'),r208WorldBindingOperationSha256:h('3'),previousWorldHeadSha256:h('4'),earthHash:'earth-r224',groundHash:'ground-r224',evidenceDigest:'evidence-r224',samples};
let calls=0;
const fetcher=async url=>{calls++;const u=new URL(url),lat=Number(u.searchParams.get('lat')),lon=Number(u.searchParams.get('lon'));return new Response(JSON.stringify({levels:{GROUND:{state:'RETURNED_USGS_ELEVATION',elevationM:700+calls,source:'USGS_3DEP_TEST'}}}),{status:200,headers:{'content-type':'application/json'}})};
const a=await assembleLivingTerrainExperienceR224({field,fetcher,origin:'https://omegav6.jeffdeweyeljefe.workers.dev'});
assert.equal(a.state,'LIVING_SOURCE_BACKED_TERRAIN_READY');assert.equal(a.experienceReady,true);assert.equal(a.canonicalWorkerMediated,true);assert.equal(a.vertexCount,25);assert.equal(a.triangleCount,32);assert.equal(a.visual.points.length,25);assert.ok(a.visual.segments.length>32);assert.equal(calls,25);
assert.match(a.visualSha256,/^[a-f0-9]{64}$/);assert.match(a.receiptSha256,/^[a-f0-9]{64}$/);assert.equal(a.lineage.r208WorldBindingOperationSha256,field.r208WorldBindingOperationSha256);
for(const key of ['depthReconstruction','materialReconstruction','radiometricReconstruction','empiricalPixelReconstruction','computedPhotorealRealityProved','solverValidityProved','nativeExecutionClaimed','federationClosureProved','canonicalMutation'])assert.equal(a[key],false,key);
let failAt=7,n=0;const incomplete=async url=>{n++;if(n===failAt)return new Response(JSON.stringify({levels:{GROUND:{state:'NO_SOURCE_ELEVATION'}}}),{status:200,headers:{'content-type':'application/json'}});return new Response(JSON.stringify({levels:{GROUND:{state:'RETURNED_USGS_ELEVATION',elevationM:710+n,source:'USGS_3DEP_TEST'}}}),{status:200,headers:{'content-type':'application/json'}})};
const held=await assembleLivingTerrainExperienceR224({field,fetcher:incomplete,origin:'https://omegav6.jeffdeweyeljefe.workers.dev'});assert.equal(held.state,'HELD_FOR_SOURCE_BACKED_TERRAIN_EXPERIENCE');assert.equal(held.experienceReady,false);assert.equal(held.reason,'R221_CANONICAL_ELEVATION_NOT_READY');
const bad={...field,fieldSha256:'bad'};assert.equal((await assembleLivingTerrainExperienceR224({field:bad,fetcher})).reason,'R218_FIELD_NOT_READY');
const m=manifestR224();assert.equal(m.revision,'R224');assert.match(R224_BOUNDARY,/does not infer depth/);
console.log('R224 living source-backed terrain experience invariants: PASS');
