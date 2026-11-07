import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderAtlasFieldRasterR734} from '../src/atlasFieldRasterR734.mjs';
import {computeSourceFieldLensR770} from '../src/sourceFieldLensR770.mjs';
import {buildSourceSceneBundleR793,verifySourceSceneBundleR793,reconstructSceneRasterR793,SOURCE_SCENE_BUNDLE_SCHEMA_R793} from '../src/sourceSceneBundleR793.mjs';

const count=20736,fields=[
 'x','y','z','phase','C','Phi','q','Lambda','scar','evidence','rsc',
 'geometry','motion','symmetry','forecast','route','continuityGate',
 'motionDrive','velocity','acceleration'
];
const field={count,routeNext:new Uint32Array(count),domain:new Uint8Array(count)};
for(const name of fields)field[name]=new Float32Array(count);
for(let i=0;i<count;i++){
 field.routeNext[i]=(i+1)%count;
 field.domain[i]=Math.floor(i/1728);
 for(const name of fields)field[name][i]=name==='C'?i/count:name==='q'?1-i/count:(i%144)/144;
}
const sourceBefore=field.C.slice(),nextBefore=field.routeNext.slice();
const raster=renderAtlasFieldRasterR734(field,'C');
const settings={address:11498,tileSize:12,showEdges:true};
// R794: forged or stale raster bytes cannot be promoted into a source-bound scene.
const forgedValues={...raster,values:raster.values.slice()};
forgedValues.values[0]+=0.25;
await assert.rejects(()=>buildSourceSceneBundleR793(field,forgedValues,settings),/R794 raster does not match/);
const forgedPixels={...raster,rgba:raster.rgba.slice()};
forgedPixels.rgba[0]^=1;
await assert.rejects(()=>buildSourceSceneBundleR793(field,forgedPixels,settings),/R794 raster does not match/);
const staleField={...field,C:field.C.slice()};
staleField.C[0]+=0.5;
await assert.rejects(()=>buildSourceSceneBundleR793(staleField,raster,settings),/R794 raster does not match/);

const first=await buildSourceSceneBundleR793(field,raster,settings);
assert.equal(first.schema,SOURCE_SCENE_BUNDLE_SCHEMA_R793);
assert.equal(first.source.addressCount,20736);
assert.deepEqual(first.source.rasterDescriptor,{type:'R734_SOURCE_CHANNEL',channel:'C'});
assert.equal(first.scene.triangles,288);
assert.equal(first.scene.relation.address,settings.address);
assert.equal(first.scene.relation.successor,field.routeNext[settings.address]);
assert.equal(first.scene.relation.domain,field.domain[settings.address]);
assert.equal(first.scene.relation.continuity,field.C[settings.address]);
assert.equal(first.scene.relation.continuityDelta,field.C[field.routeNext[settings.address]]-field.C[settings.address]);
assert.equal(first.scene.relation.motion,field.motion[settings.address]);
assert.equal(first.scene.relation.forecastModelScore,field.forecast[settings.address]);
assert.ok(first.svg.startsWith('<svg'));
assert.match(first.sceneFingerprintSha256,/^[0-9a-f]{64}$/);
assert.equal(first.authority.canonicalMutation,false);
assert.equal(first.authority.physicalMeasurement,false);
assert.equal(first.authority.nativeHost,'DEVICE_PROOF_REQUIRED');
const replay=await verifySourceSceneBundleR793(field,null,first);
assert.deepEqual(replay,{ok:true,state:'RECOMPUTED_MATCH',reason:null,localRecomputationOnly:true,canonicalMutation:false});
const repeated=await buildSourceSceneBundleR793(field,raster,settings);
assert.deepEqual(repeated,first,'identical source must produce identical scene and proof');
const tampered={...first,svg:first.svg.replace('<svg','<svg data-fake="yes"')};
assert.equal((await verifySourceSceneBundleR793(field,raster,tampered)).ok,false);
const edited={...first,source:{...first.source,fieldSha256:'f'.repeat(64)}};
assert.equal((await verifySourceSceneBundleR793(field,raster,edited)).ok,false);
field.C[7]=0.9999;
assert.equal((await verifySourceSceneBundleR793(field,raster,first)).ok,false,'source mutation invalidates proof');
field.C[7]=sourceBefore[7];
const woven=computeSourceFieldLensR770(field,'C','q',37);
const wovenBundle=await buildSourceSceneBundleR793(field,woven,{...settings,showEdges:false,tileSize:6});
assert.equal(wovenBundle.scene.triangles,72);
assert.equal(wovenBundle.scene.edges,0);
assert.equal((await verifySourceSceneBundleR793(field,null,wovenBundle)).ok,true);
assert.equal(reconstructSceneRasterR793(field,wovenBundle.source).channel,woven.channel);
assert.deepEqual(wovenBundle.source.rasterDescriptor,{type:'R770_WOVEN_CHANNELS',first:'C',second:'q',secondWeightPercent:37});
assert.equal((await verifySourceSceneBundleR793(field,raster,wovenBundle)).ok,false,'wrong raster cannot verify woven scene');
const badDescriptor={...wovenBundle,source:{...wovenBundle.source,rasterDescriptor:{type:'R770_WOVEN_CHANNELS',first:'C',second:'INVALID',secondWeightPercent:37}}};
assert.equal((await verifySourceSceneBundleR793(field,null,badDescriptor)).ok,false,'replay must refuse fabricated source lens');
assert.rejects(()=>buildSourceSceneBundleR793(field,raster,{address:20736}),/address/);
assert.rejects(()=>buildSourceSceneBundleR793(field,raster,{address:0,tileSize:7}),/size/);
assert.rejects(()=>buildSourceSceneBundleR793({...field,domain:new Uint8Array(count).fill(12)},raster,{address:0}),/domain/);
assert.rejects(()=>buildSourceSceneBundleR793({...field,C:new Float32Array(4)},raster,{address:0}),/incomplete/);
assert.rejects(()=>buildSourceSceneBundleR793({...field,routeNext:new Uint32Array(count).fill(20736)},raster,{address:0}),/successor/);
assert.deepEqual(field.C,sourceBefore);
assert.deepEqual(field.routeNext,nextBefore);
const ui=readFileSync(new URL('../src7/workspaces/SourceTessellationR769.tsx',import.meta.url),'utf8');
assert.ok(ui.includes('verifySourceSceneBundleR793(field,null,bundle)'),'import must reconstruct the saved lens from current source');
for(const marker of ['data-r794-relational-view','data-r794-continuity','data-r794-relational-boundary','field.C[successor]-field.C[address]','field.motion[address]','field.symmetry[address]','field.scar[address]','field.evidence[address]','field.forecast[address]'])
 assert.ok(ui.includes(marker),'integrated relational source view missing: '+marker);
for(const marker of ['setTileSize(bundle.scene.tileSize)','setShowEdges(bundle.scene.showEdges)','onAddress(bundle.scene.address)','setSingleChannelOverride(saved.channel)','data-r793-reset-source'])assert.ok(ui.includes(marker),'import recovery action must be operational: '+marker);
for(const marker of ['buildSourceSceneBundleR793','verifySourceSceneBundleR793','data-r793-scene-export','data-r793-scene-import','data-r793-png-export','BROWSER_CANVAS_FROM_SOURCE_SVG','data-r793-scene-status','data-r793-truth-boundary','emitOperationR86','activeProjectIdR87','recordProjectOperationR87'])
 assert.ok(ui.includes(marker),'R793 user-facing source scene control missing: '+marker);
console.log('R793 PASS · 20,736 source-state channel fingerprint, two-channel lens, portable rendered scene, deterministic replay, tamper refusal, no Canon or native proof upgrade');
