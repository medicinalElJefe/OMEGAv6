import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseSourceWorkspaceR795,assertSourceWorkspaceProjectR795,createSourceWorkspaceImportGateR795} from '../src/sourceWorkspaceRecoveryR795.mjs';
import {ATLAS_FIELD_CHANNELS_R734} from '../src/atlasFieldRasterR734.mjs';
import {SOURCE_TESSELLATION_SIZES_R769} from '../src/sourceTessellationR769.mjs';
const parse=raw=>parseSourceWorkspaceR795(raw,ATLAS_FIELD_CHANNELS_R734,SOURCE_TESSELLATION_SIZES_R769);
const base={schema:'OMEGA_SOURCE_WORKSPACE_R795_V1',address:11498,
 tileSize:SOURCE_TESSELLATION_SIZES_R769[0],showEdges:true,
 lens:{mode:'woven',first:'C',second:'q',weightPercent:37},
 channelOverride:null,sourceAuthority:'SETTINGS_ONLY_RECOMPUTE_ON_RESTORE'};
const valid=parse(JSON.stringify(base));
assert.equal(valid.address,11498);
assert.deepEqual(valid.lens,base.lens);
assert.equal(valid.channelOverride,null);
for(const patch of [
 {address:20736},{address:-1},{tileSize:7},{showEdges:'yes'},
 {lens:null},{lens:{...base.lens,first:'INVALID'}},
 {lens:{...base.lens,weightPercent:101}},
 {channelOverride:'INVALID'},{sourceAuthority:'CANON'},
 {schema:'OTHER'}
]){
 const bad={...base,...patch};
 assert.throws(()=>parse(JSON.stringify(bad)),/invalid|incompatible/);
}
const noOverride={...base};delete noOverride.channelOverride;
assert.throws(()=>parse(JSON.stringify(noOverride)),/invalid|incompatible/);
assert.throws(()=>parse('not json'),/invalid/);
assert.throws(()=>parse('x'.repeat(8193)),/invalid/);
assert.throws(()=>parse('null'),/invalid/);
assert.throws(()=>parse('[]'),/invalid/);
const restored=parse(JSON.stringify(base));
assert.equal(Object.hasOwn(restored,'sourceField'),false);
assert.equal(Object.hasOwn(restored,'canon'),false);
const ui=readFileSync(new URL('../src7/workspaces/SourceTessellationR769.tsx',import.meta.url),'utf8');
for(const marker of ['data-r795-export-workspace','data-r795-import-workspace',
 'data-r795-clear-workspace','window.localStorage.removeItem(workspaceKey())',
 'parseSourceWorkspaceR795(raw,ATLAS_FIELD_CHANNELS_R734,SOURCE_TESSELLATION_SIZES_R769)',
 'if(file.size>8192)','onAddress(saved.address)',
 'const startingProject=activeProjectIdR87()',
 "useEffect(()=>()=>{importGate.current.cancel()},[])",
 'const request=importGate.current.begin()',
 'importGate.current.assertCurrent(request)',
 "if(importGate.current.isCurrent(request))setRecoveryStatus('IMPORT REFUSED",
 'assertSourceWorkspaceProjectR795(startingProject,activeProjectIdR87())',
 'source values excluded','Save to retain locally'])
 assert.ok(ui.includes(marker),'portable workspace control absent: '+marker);
const portable=JSON.stringify({...base,savedAt:'2026-11-07T00:00:00.000Z'});
assert.deepEqual(parse(portable),valid,'portable checkpoint must reconstruct settings only');
assert.equal(assertSourceWorkspaceProjectR795('project-A','project-A'),true);
assert.equal(assertSourceWorkspaceProjectR795(null,null),true);
assert.throws(()=>assertSourceWorkspaceProjectR795('project-A','project-B'),/active project changed/);
assert.throws(()=>assertSourceWorkspaceProjectR795(null,'project-A'),/active project changed/);
console.log('R795 PASS · executable workspace checkpoint validation and refusal; browser interaction unproved');

const gate=createSourceWorkspaceImportGateR795();
const first=gate.begin();
assert.equal(gate.isCurrent(first),true);
const second=gate.begin();
assert.equal(gate.isCurrent(first),false);
assert.throws(()=>gate.assertCurrent(first),/superseded/);
assert.equal(gate.assertCurrent(second),true);
gate.cancel();
assert.equal(gate.isCurrent(second),false);
assert.throws(()=>gate.assertCurrent(second),/superseded/);
// Simulate out-of-order file reads: only the most recently requested payload is admitted.
const asyncGate=createSourceWorkspaceImportGateR795();
let resolveOld,resolveNew;
const oldRead=new Promise(resolve=>{resolveOld=resolve});
const newRead=new Promise(resolve=>{resolveNew=resolve});
const applied=[];
async function simulateImport(read){const token=asyncGate.begin();const raw=await read;asyncGate.assertCurrent(token);applied.push(parse(raw).address)}
const old=simulateImport(oldRead).catch(e=>e.message);
const newer=simulateImport(newRead);
resolveNew(JSON.stringify({...base,address:17}));
await newer;
resolveOld(JSON.stringify({...base,address:42}));
assert.match(await old,/superseded/);
assert.deepEqual(applied,[17]);

// Scene JSON import must enforce the same async project and latest-request boundaries.
const sceneImport=ui.slice(ui.indexOf('const importScene=async('),ui.indexOf('return <section'));
assert.ok(sceneImport.includes('const startingProject=activeProjectIdR87()'));
assert.ok(sceneImport.includes('const request=importGate.current.begin()'));
assert.ok((sceneImport.match(/importGate\.current\.assertCurrent\(request\)/g)||[]).length>=2);
assert.ok((sceneImport.match(/assertSourceWorkspaceProjectR795\(startingProject,activeProjectIdR87\(\)\)/g)||[]).length>=2);

// R798 dedicated weather target must use a real geographic coordinate, not an Atlas address projection.
const weatherUi=readFileSync(new URL('../src/WeatherObservationStudioR563.tsx',import.meta.url),'utf8');
assert.ok(weatherUi.includes('data-r798-tucson-weather'));
assert.ok(weatherUi.includes('setTarget({lat:32.2226,lon:-110.9747})'));
assert.ok(weatherUi.includes('<WeatherRadarMapR580 lat={target.lat} lon={target.lon}/>'));

// R799: weather geocoding must refuse superseded responses and invalid coordinates.
assert.ok(weatherUi.includes('generation!==geocodeGeneration.current'));
assert.ok(weatherUi.includes('generation===geocodeGeneration.current'));
assert.ok(weatherUi.includes('cancelGeocode();setTarget({lat:32.2226,lon:-110.9747})'));
assert.ok(weatherUi.includes('Math.abs(Number(x.lat))<=90&&Math.abs(Number(x.lon))<=180'));
