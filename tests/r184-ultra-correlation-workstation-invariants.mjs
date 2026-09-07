import fs from 'node:fs';
import assert from 'node:assert/strict';

const sar=fs.readFileSync('src/earthSarR184.js','utf8');
const earth=fs.readFileSync('src/EarthCorrelationWorkstationR184.tsx','utf8');
const earthCss=fs.readFileSync('src/earthCorrelationWorkstationR184.css','utf8');
const mesh=fs.readFileSync('src/OmegaCorrelationMeshR184.tsx','utf8');
const meshCss=fs.readFileSync('src/omegaCorrelationMeshR184.css','utf8');
const observatory=fs.readFileSync('src/EarthObservatoryR8.tsx','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const worker=fs.readFileSync('src/workerR8.js','utf8');

// Real public SAR discovery: active catalog queries, not mock scene generation.
for(const token of [
 'stac.dataspace.copernicus.eu/v1/search',
 'api.daac.asf.alaska.edu/services/search/param',
 "queryAsf('SENTINEL-1'",
 "queryAsf('NISAR'",
 "'/api/earth/sar/providers'",
 "'/api/earth/sar/search'",
 'OBSERVED_METADATA',
 'DERIVED_RELATIVE_FRAME_SCORE_ONLY'
])assert.ok(sar.includes(token),`R184 SAR runtime missing ${token}`);
assert.doesNotMatch(sar,/Math\.random\s*\(/,'R184 SAR identity must be deterministic');
assert.match(sar,/never invents backscatter, phase, deformation, moisture, elevation or missing SAR pixels/i);
assert.match(sar,/Pixel-level radiometry and InSAR require calibrated source products/i);

// The Earth surface correlates source, system, swarm, Hybrid and durable execution in one frame.
for(const endpoint of [
 '/api/earth/sar/search',
 '/api/system/convergence',
 '/api/swarm/autonomic/status',
 '/api/hybrid/status',
 '/api/execution/runs',
 '/api/swarm/autonomic/plan'
])assert.ok(earth.includes(endpoint),`Earth correlation workstation missing ${endpoint}`);
for(const phrase of [
 'LIVE PROVENANCE CORRELATION MAP',
 'RETURNED SIGNAL PLANE',
 'SAR ACQUISITION GEOMETRY',
 'OBSERVATION / EXECUTION TIMELINE',
 'BOUNDED COMPUTE PREVIEW',
 'Actual values; bar length is display normalization only.',
 'No synthetic radar pixels, no invented execution, no authority promotion.'
])assert.ok(earth.includes(phrase),`Earth operator surface missing ${phrase}`);
assert.match(earth,/providerBudget:0/);
assert.match(earth,/reconvergeWithAI:false/);
assert.match(earth,/corpusState\(address\)/,'Earth R184 must bind to the active source-backed corpus packet');
assert.match(earth,/No mission, host execution or CanonState mutation occurred/);
assert.ok(earthCss.includes('.earth-r184-graph'));
assert.ok(earthCss.includes('@media(max-width:560px)'));

// Whole-system mesh: current authorities remain separate while visible together.
for(const endpoint of [
 '/api/system/convergence',
 '/api/hybrid/status',
 '/api/federation/run/status',
 '/api/swarm/autonomic/status',
 '/api/swarm/organism/status',
 '/api/swarm/status',
 '/api/execution/runs',
 '/api/swarm/autonomic/plan'
])assert.ok(mesh.includes(endpoint),`Operational mesh missing ${endpoint}`);
for(const localKey of [
 'omega.r175.worldTruthSurface',
 'omega.r178.contractResolution',
 'omega.r179.authorizationReceipt',
 'omega.r180.executionReceipt'
])assert.ok(mesh.includes(localKey),`Operational mesh missing local receipt ${localKey}`);
for(const plane of ['CANON','WORLD','GENESIS','OPTICAL','DIRECT','ORGANISM','AUTONOMIC','FED','HYBRID','AUTH','DISPATCH','RUNS'])assert.ok(mesh.includes(`id:'${plane}'`),`Operational mesh missing ${plane} plane`);
assert.match(mesh,/R125 remains sole CanonState admission authority/);
assert.match(mesh,/R147 dispatch, R146 lifecycle, R134\/R182 world continuity/);
assert.match(mesh,/providerBudget:0/);
assert.match(mesh,/did not create, authorize or dispatch a mission/);
assert.ok(meshCss.includes('.r184-mesh-orbit'));
assert.ok(meshCss.includes('@media(max-width:520px)'));

// Mount on the real existing routes without deleting donor/specialist functionality.
assert.ok(observatory.includes("import EarthCorrelationWorkstationR184 from './EarthCorrelationWorkstationR184'"));
assert.ok(observatory.includes('<EarthCorrelationWorkstationR184'));
for(const retained of ['EarthNowInstrument','EarthLivingFieldR36','EarthGroundTraversalR9','NOAA STAR · GEOCOLOR'])assert.ok(observatory.includes(retained),`Earth retained surface missing ${retained}`);
assert.ok(suite.includes("import OmegaCorrelationMeshR184 from './OmegaCorrelationMeshR184'"));
const meshAt=suite.indexOf('<OmegaCorrelationMeshR184');
const maxAt=suite.indexOf('<OmegaMaximumCockpitR126');
assert.ok(meshAt>=0&&maxAt>meshAt,'R184 mesh must lead Convergence while retaining R126 below');
for(const retained of ['AppliedCalculusR168','FullRestorationConvergenceR168','OmegaMaximumCockpitR126','ReflexAutonomicR164','OmegaAutonomicR125','OmegaOrganismR123','OmegaSwarmR121','OmegaFieldMotionConvergenceR28'])assert.ok(suite.includes(retained),`Convergence retained tool missing ${retained}`);

// Wire SAR at the inherited Earth runtime while preserving its existing APIs.
assert.ok(worker.includes("import {earthSarApiR184} from './earthSarR184.js'"));
assert.ok(worker.includes('const sar=await earthSarApiR184(request,url);if(sar)return sar;'));
for(const retained of ['/api/earth/evidence','/api/earth/noaa/catalog','/api/earth/noaa/image','/api/hybrid/capabilities','/api/hybrid/plan','/api/hybrid/validate'])assert.ok(worker.includes(retained),`workerR8 retained route missing ${retained}`);

console.log('R184 ULTRA CORRELATION WORKSTATION PASS');
