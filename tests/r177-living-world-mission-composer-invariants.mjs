import assert from 'node:assert/strict';
import fs from 'node:fs';
import {composeLivingWorldMissionR177,manifestR177} from '../src/world/livingWorldMissionComposerR177.js';

const rejected=composeLivingWorldMissionR177({revision:'R175',eventAccepted:false});
assert.equal(rejected.accepted,false);assert.equal(rejected.dispatchAuthorized,false);assert.equal(rejected.canonicalAdmissionAuthority,'R125');

const world={revision:'R175',eventAccepted:true,canonicalMutation:false,worldId:'OMEGA_CANONICAL_WORLD',operationRef:{operationId:'op-r177',headSha256:'world-head'},truthBands:{mission:'NONE',earth:'UNPROVED',federation:'RETURNED_EVIDENCE_NOT_CANON',hybrid:'DEVICE_PROOF_REQUIRED',render:'NONE'},activeDomains:['FEDERATION'],nextFederationStage:'SCREEN',scarCount:4,lod:1728,sampleBudget:1728,routingTarget:'OMEGA_OPTICAL',claims:{federationClosedProved:false}};
const preview=composeLivingWorldMissionR177(world,{selectedStepIndexes:[0,2],note:'Review current membrane and current device proof.'});
assert.equal(preview.accepted,true);assert.equal(preview.state,'PREVIEW_NOT_STAGED');assert.equal(preview.staging.operatorStaged,false);assert.equal(preview.dispatchAuthorized,false);assert.equal(preview.executionInvoked,false);assert.equal(preview.canonicalMutation,false);assert.equal(preview.canonicalAdmissionAuthority,'R125');assert.equal(preview.worldId,'OMEGA_CANONICAL_WORLD');assert.equal(preview.scarCount,4);assert.equal(preview.adaptiveContext.lod,1728);assert.equal(preview.mission.steps.length,2);assert.equal(preview.mission.routingTarget,'OMEGA_OPTICAL');assert.equal(preview.claims.pcOnlineProved,false);assert.equal(preview.claims.solverValidityProved,false);assert.equal(preview.claims.computedPhotorealRealityProved,false);assert.equal(preview.claims.federationClosedProved,false);
const staged=composeLivingWorldMissionR177(world,{operatorStaged:true,selectedStepIndexes:[0,1,2,3,4]});
assert.equal(staged.state,'OPERATOR_STAGED_NOT_AUTHORIZED');assert.equal(staged.staging.authorizationRequired,true);assert.equal(staged.dispatchAuthorized,false);assert.equal(staged.nextAuthority,'EXISTING_GOVERNED_EXECUTION_AUTHORIZATION_PATH');

const source=fs.readFileSync(new URL('../src/world/livingWorldMissionComposerR177.js',import.meta.url),'utf8');
assert.doesNotMatch(source,/transitionRunR146\s*\(/);assert.doesNotMatch(source,/dispatchRunR147\s*\(/);assert.doesNotMatch(source,/authorizeAndDispatchReflexMissionR162\s*\(/);assert.doesNotMatch(source,/createRunR146\s*\(/);
const manifest=manifestR177();assert.equal(manifest.inputAuthority,'R176');assert.equal(manifest.visualWorldAuthority,'R136/R134');assert.equal(manifest.canonicalAdmissionAuthority,'R125');assert.equal(manifest.operatorStagingOnly,true);assert.equal(manifest.dispatchAuthorized,false);
console.log('R177 LIVING WORLD MISSION COMPOSER INVARIANTS PASS');
