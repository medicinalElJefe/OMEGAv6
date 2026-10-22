import assert from 'node:assert/strict';
import {projectSourceBackedTerrainR222,manifestR222,R222_BOUNDARY} from '../src/world/sourceBackedTerrainProjectionR222.js';

const h=c=>String(c).repeat(64).slice(0,64).replace(/[^a-f0-9]/g,'a');
const side=5,samples=[];
for(let r=0;r<side;r++)for(let c=0;c<side;c++){const i=r*side+c;samples.push({i,eastM:(c-2)*8,northM:(r-2)*8,lat:32.2+r*.00001,lon:-110.8+c*.00001,elevationM:700+i,elevationSourceId:`USGS_3DEP:${i}`,elevationUncertaintyM:null,depthM:null,radiometry:null,material:null});}
const mesh={schema:'OMEGA_ELEVATION_SCENE_MESH_R219',revision:'R219',state:'SOURCE_BACKED_ELEVATION_MESH_COMPUTED',side,spacingM:8,samples,meshSha256:h('a'),receiptSha256:h('b'),missionId:'m',projectId:'p',r218FieldSha256:h('c'),r217ReceiptSha256:h('d'),r216RequestSha256:h('e'),r214AnchorSha256:h('f'),r213AttemptSha256:h('1'),r211LineageSha256:h('2'),r208WorldBindingOperationSha256:h('3'),previousWorldHeadSha256:h('4'),earthHash:h('5'),groundHash:h('6'),evidenceDigest:h('7'),verticalDatum:'UNSPECIFIED_BY_EPQS_RESPONSE',sampleCount:25,minElevationM:700,maxElevationM:724,reliefM:24,meshComputed:true,elevationEvidenceAccepted:true,sourceBackedVerticalField:true};
const ready={schema:'OMEGA_CANONICAL_ELEVATION_RUNTIME_BRIDGE_R221',revision:'R221',state:'CANONICAL_ELEVATION_MESH_READY',meshComputed:true,elevationEvidenceAccepted:true,mesh};
const a=await projectSourceBackedTerrainR222(ready),b=await projectSourceBackedTerrainR222(ready);
assert.equal(a.state,'SOURCE_BACKED_TERRAIN_VISUAL_READY');
assert.equal(a.terrainProjected,true);assert.equal(a.vertexCount,25);assert.equal(a.triangleCount,32);assert.equal(a.vertices[0].yM,0);assert.equal(a.vertices[24].yM,24);
assert.equal(a.geometrySha256,b.geometrySha256);assert.equal(a.receiptSha256,b.receiptSha256);
assert.equal(a.r219MeshSha256,mesh.meshSha256);assert.equal(a.lineage.r208WorldBindingOperationSha256,mesh.r208WorldBindingOperationSha256);
assert.equal(a.depthReconstruction,false);assert.equal(a.materialReconstruction,false);assert.equal(a.radiometricReconstruction,false);assert.equal(a.computedPhotorealRealityProved,false);assert.equal(a.solverValidityProved,false);assert.equal(a.nativeExecutionClaimed,false);assert.equal(a.federationClosureProved,false);assert.equal(a.canonicalMutation,false);
const broken=structuredClone(ready);broken.mesh.samples[3].elevationM=null;
const held=await projectSourceBackedTerrainR222(broken);assert.equal(held.state,'HELD_FOR_SOURCE_BACKED_TERRAIN');assert.equal(held.terrainProjected,false);
const m=manifestR222();assert.equal(m.revision,'R222');assert.match(R222_BOUNDARY,/does not invent depth/);
console.log('R222 source-backed terrain visual invariants: PASS');
