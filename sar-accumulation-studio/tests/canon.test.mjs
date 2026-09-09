import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import {
  CHARTED_CALIBRATION_CONTRACT,
  omegaViability,
  memoryUpdate,
  burdenUpdate,
  phaseTurn,
  compressionUpdate,
  dispatchOmega,
  shellSimplex,
  empiricalTurnDecision,
  calibrationProofPacket
} from '../src/calibration.mjs';
import { sarHostVariableAdapter } from '../src/sar-host.mjs';
import { measuredSpatialShell } from '../src/sar-shell.mjs';
import {
  decodeEarthGridPayload,
  nearestEarthProxyCell,
  EARTH_GRID_PARTS,
  EARTH_GRID_SOURCE_SHA256
} from '../src/earth-grid.mjs';
import { calibrationLutAt, geolocateToPixel } from '../src/sentinel1-calibration.mjs';

const here = dirname(fileURLToPath(import.meta.url));

test('charted Fold-Scale operators remain exact and host threshold is never invented', () => {
  assert.equal(omegaViability(0.75, 0.2, 0.1), 0.75 / 1.3);
  assert.equal(memoryUpdate(0.2, 0.8, 0.1), 0.26);
  assert.equal(burdenUpdate(0.2, 0.3, 0.1), 0.4);
  assert.equal(phaseTurn(3 * Math.PI / 2, Math.PI), Math.PI / 2);
  assert.equal(compressionUpdate(2, 0.5), 1);
  assert.equal(dispatchOmega(1.02), 'UNRESOLVED_HOST_THRESHOLD');
  assert.equal(dispatchOmega(1.02, 0.05), 'TURN');
  assert.equal(dispatchOmega(1.2, 0.05), 'STAY');
  assert.equal(dispatchOmega(0.8, 0.05), 'ESCALATE');
});

test('1+6 shell uses the stored opposite-pair contrasts and simplex reduction', () => {
  const shell = shellSimplex([100, 10, 20, 30, 4, 5, 6]);
  assert.deepEqual(shell.contrasts, [6, 15, 24]);
  assert.ok(Math.abs(shell.lambda[0] - 6 / 45) < 1e-9);
  assert.ok(Math.abs(shell.lambda[1] - 15 / 45) < 1e-9);
  assert.ok(Math.abs(shell.lambda[2] - 24 / 45) < 1e-9);
  assert.equal(shell.dominantAxis, 3);
  assert.ok(Math.abs(shell.lambdaSum - 1) < 1e-8);
});

test('stored empirical TURN references are preserved as references, not SAR truth labels', () => {
  const canonical = CHARTED_CALIBRATION_CONTRACT.empiricalTurnProfiles.canonicalS;
  assert.equal(canonical.threshold, 0.8293400791736596);
  assert.equal(canonical.orientation, 'higher=TURN');
  assert.equal(canonical.auc, 0.9176136363636364);
  const omegaTurn = empiricalTurnDecision('omega', 0.5);
  assert.equal(omegaTurn.state, 'TURN');
  assert.equal(omegaTurn.role, 'PRIOR_EMPIRICAL_REFERENCE');
  assert.equal(empiricalTurnDecision('decisionPressure', 0.8).state, 'TURN');
});

test('SAR host adapter consumes only measured rows and keeps formal dispatch unresolved without SAR tau', () => {
  const samples = [
    { id:'a', time:'2026-01-01T00:00:00Z', value:-12, measured:true },
    { id:'b', time:'2026-01-02T00:00:00Z', value:-11.4, measured:true },
    { id:'c', time:'2026-01-03T00:00:00Z', value:-10.8, measured:true },
    { id:'d', time:'2026-01-04T00:00:00Z', value:-11.1, measured:true },
    { id:'e', time:'2026-01-05T00:00:00Z', value:-10.9, measured:true },
    { id:'fake', time:'2026-01-06T00:00:00Z', value:999, measured:false }
  ];
  const host = sarHostVariableAdapter(samples);
  assert.equal(host.state, 'SAR_HOST_VARIABLES_DERIVED_FROM_MEASURED_STACK');
  assert.equal(host.rows.length, 5);
  assert.ok(host.rows.every(row => row.formalDispatch === 'UNRESOLVED_HOST_THRESHOLD'));
  for (const row of host.rows) {
    assert.ok(Number.isFinite(row.Omega));
    assert.ok(Math.abs(row.Omega - omegaViability(row.E_continuity_capacity, row.Lambda_burden, row.q_contradiction)) < 1e-12);
  }
});

test('measured spatial shell refuses missing sectors and solves a complete measured 1+6 observer', () => {
  const lon = 0, lat = 0, radius = 0.001;
  const samples = [{ lon, lat, value:10, measured:true }];
  for (let i=0;i<6;i++) {
    const angle=i*Math.PI/3;
    samples.push({ lon:lon+radius*Math.cos(angle), lat:lat+radius*Math.sin(angle), value:i+1, measured:true });
  }
  const shell = measuredSpatialShell(samples, lon, lat);
  assert.equal(shell.state, 'MEASURED_1_PLUS_6_HOST_SHELL');
  assert.equal(shell.proof.syntheticSamples, 0);
  assert.equal(shell.proof.sourceSamples, 7);
  const broken = measuredSpatialShell(samples.slice(0,6), lon, lat);
  assert.equal(broken.state, 'SHELL_UNRESOLVED');
});

test('full embedded Earth chart reconstructs exactly to 2664 rows and the stored source digest', async () => {
  const pieces=[];
  for (const relative of EARTH_GRID_PARTS) {
    const basename=relative.split('/').at(-1);
    pieces.push(await readFile(resolve(here, '..', 'data', basename), 'utf8'));
  }
  const grid = await decodeEarthGridPayload(pieces.join(''));
  assert.equal(grid.rows.length, 2664);
  assert.equal(grid.sourceSha256, EARTH_GRID_SOURCE_SHA256);
  assert.deepEqual(grid.grid, [-90,90,5,-180,175,5,37,72,2664]);
  const tucson = nearestEarthProxyCell(grid, -110.9747, 32.2226);
  assert.equal(tucson.latitude_deg, 30);
  assert.equal(tucson.longitude_deg, -110);
  assert.equal(tucson.evidenceKind, 'EARTH_PROXY_CONTEXT');
  assert.equal(tucson.measuredSar, false);
  assert.equal(tucson.rawDem, false);
  assert.ok(Number.isFinite(tucson.thread_score));
  assert.ok(tucson.nearestGridDistanceKm > 0);
});

test('Sentinel-1 calibration LUT interpolation is bilinear in range and azimuth', () => {
  const calibration={vectors:[
    {line:0,pixel:[0,10],sigmaNought:[1,3],betaNought:[2,4],gamma:[4,6],dn:[1,1]},
    {line:10,pixel:[0,10],sigmaNought:[3,5],betaNought:[4,6],gamma:[6,8],dn:[1,1]}
  ]};
  assert.equal(calibrationLutAt(calibration,5,5,'sigmaNought'),3);
  assert.equal(calibrationLutAt(calibration,5,5,'betaNought'),4);
  assert.equal(calibrationLutAt(calibration,5,5,'gamma'),6);
});

test('Sentinel product geolocation grid inversion resolves a synthetic bilinear GCP cell', () => {
  const product={points:[
    {line:0,pixel:0,longitude:0,latitude:1},
    {line:0,pixel:10,longitude:1,latitude:1},
    {line:10,pixel:0,longitude:0,latitude:0},
    {line:10,pixel:10,longitude:1,latitude:0}
  ]};
  const result=geolocateToPixel(product,0.25,0.75);
  assert.equal(result.state,'GEOLOCATED_BILINEAR_GCP');
  assert.ok(Math.abs(result.pixel-2.5)<1e-7);
  assert.ok(Math.abs(result.line-2.5)<1e-7);
  assert.ok(result.residualDeg<1e-9);
});

test('calibration proof packet forbids prior/proxy/inferred rows from becoming SAR observations', () => {
  const packet=calibrationProofPacket({state:'TEST'});
  assert.equal(packet.authority.measuredSarRequired,true);
  assert.equal(packet.authority.priorBenchmarksCountAsSarObservations,false);
  assert.equal(packet.authority.proxyEarthChartCountsAsRawTerrain,false);
  assert.equal(packet.authority.inferredValuesCountAsObservations,false);
});
