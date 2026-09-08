import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('src/App.tsx','utf8');
const surface=fs.readFileSync('src/LivingTerrainSurfaceR225.tsx','utf8');
assert.ok(app.includes("import LivingTerrainSurfaceR225 from './LivingTerrainSurfaceR225'"),'R225 surface import missing');
assert.ok(app.includes('<LivingTerrainSurfaceR225/>'),'R225 surface not mounted in canonical App');
for(const required of ["readGeospatialSceneFieldR218","assembleLivingTerrainExperienceR224","readLivingTerrainExperienceR224","LIVING_SOURCE_BACKED_TERRAIN_MATERIALIZED","recordProjectOperationR87","Materialize terrain","<svg","R86/R87 scar continuity","computedPhotorealRealityProved:false","solverValidityProved:false","nativeExecutionClaimed:false","federationClosureProved:false","canonicalMutation:false"]){assert.ok(surface.includes(required),`R225 missing ${required}`)}
assert.ok(surface.includes("if(current?.state!=='GEOSPATIAL_SCENE_FIELD_COMPUTED')"),'R225 must fail closed without R218 field');
assert.ok(surface.includes("receipt?.state!=='LIVING_SOURCE_BACKED_TERRAIN_READY'"),'R225 must fail closed without R224 terrain receipt');
assert.ok(surface.includes("origin:window.location.origin,persist:true"),'R225 must use canonical-origin R224 path and existing persistence');
for(const forbidden of ['computedPhotorealRealityProved:true','solverValidityProved:true','nativeExecutionClaimed:true','federationClosureProved:true','canonicalMutation:true'])assert.ok(!surface.includes(forbidden),`R225 forbidden overclaim ${forbidden}`);
console.log('R225 Living World terrain surface invariants PASS');
