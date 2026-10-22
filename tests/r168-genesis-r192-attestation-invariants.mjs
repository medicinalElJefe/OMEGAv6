import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assessGenesisR192Attestation,R168_ATTESTATION_STATES,R168_GENESIS_EXPECTATION} from '../src/federation/genesisAttestationR168.js';

const read=p=>fs.readFileSync(p,'utf8');
const manifest=JSON.parse(read('public/omega-genesis-attestation-r168.json'));
const wrangler=read('wrangler.jsonc');

assert.equal(R168_GENESIS_EXPECTATION.contract,'R192_SERVICE_BOUND_R1532_ATTESTED');
assert.equal(manifest.state,'READY_TO_ATTEST_NOT_LIVE_CLAIM');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.match(manifest.truthLaw,/reachable != writable != executed != verified != promoted/);
assert.match(manifest.truthBoundary,/does not claim Genesis R192 is deployed/i);
assert.match(manifest.truthBoundary,/does not replace the current omega-genesis-machine-r115 binding/i);

assert.match(wrangler,/"main"\s*:\s*"src\/workerR116\.js"/,'R168 must preserve the R116 Worker spine');
assert.match(wrangler,/"binding"\s*:\s*"OMEGA_GENESIS"\s*,\s*"service"\s*:\s*"omega-genesis-v1"/,'Genesis human surface binding changed');
assert.match(wrangler,/"binding"\s*:\s*"OMEGA_GENESIS_MACHINE"\s*,\s*"service"\s*:\s*"omega-genesis-machine-r115"/,'Genesis machine binding must not be superseded without independent proof');
assert.match(wrangler,/"binding"\s*:\s*"OMEGA_OPTICAL_MACHINE"\s*,\s*"service"\s*:\s*"omega-optical-machine-r1532"/,'Optical R153.2 binding regressed');
for(const name of ['OMEGA_RUNTIME','OMEGA_SWARM_CELL','OMEGA_SWARM_COORDINATOR','OMEGA_SWARM_BRANCH','OMEGA_SWARM_ORGAN','OMEGA_SWARM_ORGANISM','OMEGA_SWARM_AUTONOMIC']) assert.match(wrangler,new RegExp(`"name"\\s*:\\s*"${name}"`),`R168 lost durable object ${name}`);

const baseline={
  contract:'R192_SERVICE_BOUND_R1532_ATTESTED',
  expectedWorkerVersion:'worker-version-192',
  runtimeWorkerVersion:'worker-version-192',
  services:{OMEGA_V6:'omegav6',OMEGA_OPTICAL:'omega-optical-machine-r1532'},
  optical:{machineVersion:'R153.2',authority:'SCREEN_ONLY',canonicalMutation:false,adaptiveCycle:true},
  genesis:{role:'PROPOSE',mayMutateGlobalCanonState:false}
};

assert.equal(assessGenesisR192Attestation().state,R168_ATTESTATION_STATES.UNATTESTED);
assert.equal(assessGenesisR192Attestation({...baseline,contract:'R191'}).state,R168_ATTESTATION_STATES.CONTRACT_MISMATCH);
assert.equal(assessGenesisR192Attestation({...baseline,runtimeWorkerVersion:'predecessor-version'}).state,R168_ATTESTATION_STATES.VERSION_MISMATCH);
assert.equal(assessGenesisR192Attestation({...baseline,services:{...baseline.services,OMEGA_V6:'omega-v6-full-convergence'}}).state,R168_ATTESTATION_STATES.SERVICE_IDENTITY_MISMATCH);
assert.equal(assessGenesisR192Attestation({...baseline,services:{...baseline.services,OMEGA_OPTICAL:'omega-optical-machine-r115'}}).state,R168_ATTESTATION_STATES.SERVICE_IDENTITY_MISMATCH);
assert.equal(assessGenesisR192Attestation({...baseline,optical:{...baseline.optical,authority:'ADMIT'}}).state,R168_ATTESTATION_STATES.AUTHORITY_VIOLATION);
assert.equal(assessGenesisR192Attestation({...baseline,optical:{...baseline.optical,canonicalMutation:true}}).state,R168_ATTESTATION_STATES.AUTHORITY_VIOLATION);
assert.equal(assessGenesisR192Attestation({...baseline,genesis:{...baseline.genesis,mayMutateGlobalCanonState:true}}).state,R168_ATTESTATION_STATES.AUTHORITY_VIOLATION);

const attested=assessGenesisR192Attestation(baseline);
assert.equal(attested.state,R168_ATTESTATION_STATES.ATTESTED_NOT_LIVE_VERIFIED);
assert.equal(attested.liveVerified,false);
assert.equal(attested.promoted,false);

const live=assessGenesisR192Attestation({...baseline,liveVerified:true});
assert.equal(live.state,R168_ATTESTATION_STATES.LIVE_VERIFIED_NOT_PROMOTED);
assert.equal(live.ok,true);
assert.equal(live.liveVerified,true);
assert.equal(live.promoted,false);
assert.equal(live.canonicalAdmissionAuthority,'R125');

console.log('R168 GENESIS R192 ATTESTATION MEMBRANE PASS');
