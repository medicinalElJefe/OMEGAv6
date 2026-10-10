import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R525_SPHERE_SCHEMA,R525_DODECA_VERTICES,R525_DODECA_EDGES,R525_ARCHIVE_GRAMMAR,selectSphereAddressR525,fullSphereProjectionR525} from '../src/fullSphereRecoveryR525.ts';
import {exactAtlasAddressV3,fullSphereAntipodeCoordinateV3,fullSphereRowIdV3,verifyExactAtlasAddressV3} from '../src/system/omegaExactCanonV3.ts';
assert.equal(R525_SPHERE_SCHEMA,'OMEGA_FULL_SPHERE_ARCHIVE_GRAMMAR_R525');
assert.equal(R525_DODECA_VERTICES.length,20,'full geometric dodecahedron requires 20 vertices');
assert.equal(new Set(R525_DODECA_VERTICES.map(v=>v.join(','))).size,20);
assert.equal(R525_DODECA_EDGES.length,30,'full dodecahedron requires 30 physical graph edges per projected shell');
for(const [a,b] of R525_DODECA_EDGES)assert.ok(a>=0&&b<20&&a<b,'no dummy or duplicate geometry edges');
const payload={continuity:.72,plasticity:.44,scar:.3,contradiction:.18,yaw:17,fold:.65,lens:'SCAR' as const};
for(const address of [0,1,11,12,143,144,1727,1728,11498,20734,20735]){
 const actual=fullSphereProjectionR525({address,...payload}),original=exactAtlasAddressV3(address);
 assert.equal(actual.address,address);
 assert.equal(actual.antipodeIndex0,original.antipodeIndex0);
 assert.equal(verifyExactAtlasAddressV3(original),true);
 assert.equal(fullSphereRowIdV3(fullSphereAntipodeCoordinateV3(original.antipodeCoordinate))-1,address,'exact inverse antipode must be involutive');
 assert.equal(actual.shells.length,3,'three nested complete shells');
 for(const shell of actual.shells){
  assert.equal(shell.points.length,20);
  assert.equal(shell.edges.length,30);
  assert.ok(shell.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)));
 }
 assert.deepEqual(fullSphereProjectionR525({address,...payload}),actual,'same state+lens+camera must give same frame without animation drift');
 assert.equal(actual.physicalDimensionsClaimed,false);
 assert.equal(actual.observationClaimed,false);
 assert.equal(actual.canonicalMutation,false);
}
const now=selectSphereAddressR525(11498,'NOW',144),past=selectSphereAddressR525(11498,'HISTORY',144),future=selectSphereAddressR525(11498,'FORECAST',144);
assert.equal(now,11498);assert.equal(past,11497);assert.equal(future,144);
assert.equal(selectSphereAddressR525(0,'HISTORY',5),20735);
assert.equal(selectSphereAddressR525(400,'FORECAST',Infinity),0,'unproved forecasts must not silently select a random branch');
for(const state of [0,1728,11498,20735])for(const yaw of [-180,-90,0,90,180])for(const fold of [0,.5,1]){
 const mesh=fullSphereProjectionR525({address:state,...payload,yaw,fold,contradiction:1});
 for(const shell of mesh.shells)for(const p of shell.points)assert.ok(p.x>=0&&p.x<=960&&p.y>=0&&p.y<=620,'full chamber geometry must remain inside the visual stage: '+JSON.stringify({state,yaw,fold,p}));
}
const frame=fullSphereProjectionR525({address:11498,...payload});
assert.notDeepEqual(frame.shells[0].points,fullSphereProjectionR525({address:11498,...payload,yaw:72}).shells[0].points,'camera rotation must really alter geometry');
assert.notDeepEqual(frame.shells[0].points,fullSphereProjectionR525({address:11498,...payload,fold:0}).shells[0].points,'fold control must really alter projected geometry');
assert.notDeepEqual(frame.shells[0].points,fullSphereProjectionR525({address:11499,...payload}).shells[0].points,'new exact state must alter geometry');
assert.ok(R525_ARCHIVE_GRAMMAR.stillMissing.length>=4,'archive fidelity debt must remain recorded');
assert.ok(R525_ARCHIVE_GRAMMAR.truthBoundary.includes('not a physical primitive'));
const source=fs.readFileSync('src7/workspaces/ScienceWorkspaceR441.tsx','utf8');
const component=fs.readFileSync('src/FullSphereInstrumentR525.tsx','utf8');
const browser=fs.readFileSync('tests/r525-full-sphere-browser-e2e.mjs','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
assert.ok(source.includes('<FullSphereInstrumentR525 address={address} onAddress={commit}/>'),'must use current Atlas executor and address state');
assert.ok(source.includes('<AtlasViewport state={state}'),'strongest prior AtlasViewport must remain operational');
for(const token of ["data-r525-shell={shell.shell}","data-r525-edge={shell.shell","data-r525-action='antipode'","data-r525-action='select-preview'","data-r525-motion={playing?'playing':'paused'}","NOT an observation of historical time","autoPing successor projected"])assert.ok(component.includes(token),'missing real source/interaction: '+token);
assert.ok(browser.includes("await prove(browser,'desktop'")&&browser.includes("await prove(browser,'mobile'"),'desktop and mobile proof is mandatory');
assert.ok(ci.includes('tests/r525-full-sphere-browser-e2e.mjs'),'actual browser test must be required by candidate parity');
console.log('R525 SOURCE AND MATH PASS · 20 vertices / 30 edges × 3 exact state-bound shells · antipode involution · deterministic projection · honest history/forecast semantics · prior Atlas preserved');
