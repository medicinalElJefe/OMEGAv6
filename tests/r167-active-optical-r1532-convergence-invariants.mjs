import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R1532_MACHINE_VERSION,R1532_MACHINE_AUTHORITY} from '../services/opticalMachineR1532.js';
import {R1532_TOOL_VERSION,R1532_TOOL_AUTHORITY} from '../services/opticalExternalToolR1532.js';

const read=p=>fs.readFileSync(p,'utf8');
const exists=p=>fs.existsSync(p);
const wrangler=read('wrangler.jsonc');
const surface=JSON.parse(read('public/omega-surface-fabric-r120.json'));
const manifest=JSON.parse(read('public/omega-active-federation-r167.json'));

assert.match(wrangler,/"main"\s*:\s*"src\/workerR116\.js"/,'R167 must preserve the proven R116 Worker entrypoint');
assert.match(wrangler,/"binding"\s*:\s*"OMEGA_OPTICAL_MACHINE"\s*,\s*"service"\s*:\s*"omega-optical-machine-r1532"/,'active Optical binding must target R153.2');
assert.doesNotMatch(wrangler,/"binding"\s*:\s*"OMEGA_OPTICAL_MACHINE"\s*,\s*"service"\s*:\s*"omega-optical-machine-r115"/,'active Optical binding must not remain on R115');
assert.match(wrangler,/"binding"\s*:\s*"OMEGA_GENESIS"\s*,\s*"service"\s*:\s*"omega-genesis-v1"/,'Genesis surface binding must remain intact');
assert.match(wrangler,/"binding"\s*:\s*"OMEGA_GENESIS_MACHINE"\s*,\s*"service"\s*:\s*"omega-genesis-machine-r115"/,'existing Genesis machine binding must remain intact until independently superseded');

for(const name of ['OMEGA_RUNTIME','OMEGA_SWARM_CELL','OMEGA_SWARM_COORDINATOR','OMEGA_SWARM_BRANCH','OMEGA_SWARM_ORGAN','OMEGA_SWARM_ORGANISM','OMEGA_SWARM_AUTONOMIC']){
  assert.match(wrangler,new RegExp(`"name"\\s*:\\s*"${name}"`),`R167 lost durable object ${name}`);
}

for(const path of [
  'services/opticalMachineR115.js',
  'services/opticalMachineR152.js',
  'services/opticalMachineR1531.js',
  'services/opticalMachineR1532.js',
  'services/opticalExternalToolR1531.js',
  'services/opticalExternalToolR1532.js',
  'tests/r115-machine-adapters-invariants.mjs',
  'tests/r152-optical-operational-convergence-invariants.mjs',
  'tests/r1531-external-ai-tool-push-invariants.mjs',
  'tests/r1532-adaptive-external-search-invariants.mjs'
]) assert.equal(exists(path),true,`R167 must preserve optical lineage evidence: ${path}`);

assert.equal(R1532_MACHINE_VERSION,'R153.2');
assert.equal(R1532_MACHINE_AUTHORITY,'SCREEN_ONLY');
assert.equal(R1532_TOOL_VERSION,'R153.2');
assert.equal(R1532_TOOL_AUTHORITY,'SCREEN_ONLY');
const r1532Machine=read('services/opticalMachineR1532.js');
const r1532Tool=read('services/opticalExternalToolR1532.js');
assert.match(r1532Machine,/adaptiveCycle:true/,'R153.2 health must expose adaptive cycle support');
assert.match(r1532Machine,/canonicalMutation:false/,'R153.2 health must deny canonical mutation');
assert.match(r1532Tool,/full_wave_result_not_implied/,'R153.2 must preserve full-wave truth boundary');
assert.match(r1532Tool,/fabrication_not_implied/,'R153.2 must preserve fabrication truth boundary');
assert.match(r1532Tool,/physical_measurement_not_implied/,'R153.2 must preserve measurement truth boundary');
assert.match(r1532Tool,/canonical_admission_not_implied/,'R153.2 must preserve Canon admission boundary');
assert.match(r1532Tool,/PREPARED_NOT_SOLVED/,'R153.2 full-wave handoff must remain prepared-not-solved');

const optical=surface.surfaces.find(x=>x.id==='omega-optical');
assert.ok(optical,'active Optical surface entry missing');
assert.equal(optical.machineService,'omega-optical-machine-r1532');
assert.equal(optical.machineGeneration,'R153.2');
assert.equal(optical.machineAuthority,'SCREEN_ONLY');
assert.equal(optical.adaptiveCycle,true);
assert.equal(optical.canonicalMutation,false);
assert.equal(optical.sameUrlPromotionAuthorized,false);
assert.equal(optical.mayMutateGlobalCanonState,false);
assert.match(optical.truth,/not RCWA\/FDTD\/FEM/i);
assert.match(optical.truth,/not claimed writable/i);

assert.equal(manifest.schema,'OMEGA_ACTIVE_FEDERATION_R167');
assert.equal(manifest.revision,'R167');
assert.equal(manifest.canonicalAuthority,'OMEGAv6');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.runtimeEntrypoint,'src/workerR116.js');
assert.deepEqual(manifest.executionLaw,['PROPOSE','SCREEN','SOLVE','ADMIT']);
assert.equal(manifest.truthLaw,'reachable != writable != executed != verified != promoted');
assert.equal(manifest.active.optical.machineService,'omega-optical-machine-r1532');
assert.equal(manifest.active.optical.machineVersion,'R153.2');
assert.equal(manifest.active.optical.toolVersion,'R153.2');
assert.equal(manifest.active.optical.authority,'SCREEN_ONLY');
assert.equal(manifest.active.optical.adaptiveCycle,true);
assert.equal(manifest.active.optical.canonicalMutation,false);
assert.equal(manifest.active.optical.fullwaveExecutionClaimed,false);
assert.equal(manifest.active.optical.fabricationValidationClaimed,false);
assert.equal(manifest.active.optical.physicalMeasurementClaimed,false);
assert.equal(manifest.active.optical.sameUrlPromotionAuthorized,false);
assert.equal(manifest.active.sovereign.pcOnlineClaimedWithoutHeartbeat,false);
assert.equal(manifest.active.sovereign.fullwaveValidClaimedWithoutReturnReceipt,false);
assert.deepEqual(manifest.atlas.addressLevels,[12,144,1728,20736,248832,61917364224]);
assert.equal(manifest.atlas.physicalDimensionsClaimed,false);
assert.deepEqual(manifest.orientation.sigma,[-1,0,1]);
assert.equal(manifest.orientation.structureFactoredFromOrientation,true);
assert.deepEqual(manifest.referenceKernel.values,[37,73]);
assert.equal(manifest.referenceKernel.hardCodedSymmetryAsymmetryMeaning,false);
assert.equal(manifest.preserves.residualWorldLens,'R166');
assert.match(manifest.truthBoundary,/does not prove a PC online/i);
assert.match(manifest.truthBoundary,/does not create RCWA\/FDTD\/FEM/i);
assert.match(manifest.truthBoundary,/does not grant CanonState admission authority outside R125/i);

console.log('R167 ACTIVE OPTICAL R153.2 CONVERGENCE PASS');
