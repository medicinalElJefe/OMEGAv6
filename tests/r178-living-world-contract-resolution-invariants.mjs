import assert from 'node:assert/strict';
import {resolveLivingWorldMissionContractsR178,manifestR178} from '../src/world/livingWorldMissionContractResolverR178.js';

const contract=(route,state='AVAILABLE',executionDomain='LOCAL')=>({schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:`route:${route.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,route,workspaceId:'workspace:test',capabilityId:`capability:${route.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,executionDomain,state,capabilityReality:state==='AVAILABLE'?'LOCAL_ACTIVE':'RESTORATION_DEBT',receiptAuthority:'R142',receiptSchema:'OMEGA_CAPABILITY_EXECUTION_RECEIPT_R142',executionProofRequired:true,canonicalMutation:false,admissionAuthority:'R125',truthBoundary:'test fixture matching R143 authority shape'});
const contracts=[contract('Convergence'),contract('Hybrid Link','DISCOVERED','HYBRID'),contract('Earth Now'),contract('Render Queue','UNAVAILABLE','BUILD')];
const staged={revision:'R177',accepted:true,state:'OPERATOR_STAGED_NOT_AUTHORIZED',worldId:'OMEGA_CANONICAL_WORLD',sourceOperationRef:{operationId:'op-1'},scarCount:7,adaptiveContext:{lod:1728,sampleBudget:1728},mission:{missionId:'R177:test',steps:[{domain:'FEDERATION',action:'ADVANCE_SCREEN',reason:'NEXT_VERIFIED_MEMBRANE_REQUIRED'},{domain:'HYBRID',action:'PROVE_CURRENT_DEVICE_STATE',reason:'CURRENT_AUTHENTICATED_HEARTBEAT_OR_PROOF_REQUIRED'},{domain:'EARTH',action:'BIND_VERIFIED_EARTH_EVIDENCE',reason:'EARTH_STATE_UNPROVED'},{domain:'RENDER',action:'OBTAIN_DIRECT_RENDER_PROOF',reason:'RENDER_STATE_UNPROVED'}]},staging:{operatorStaged:true},dispatchAuthorized:false,executionInvoked:false};

const result=resolveLivingWorldMissionContractsR178(staged,contracts);
assert.equal(result.accepted,true);
assert.equal(result.dispatchAuthorized,false);
assert.equal(result.executionInvoked,false);
assert.equal(result.canonicalMutation,false);
assert.equal(result.canonicalAdmissionAuthority,'R125');
assert.equal(result.state,'CONTRACTS_RESOLVED_WITH_ROUTE_HOLDS');
assert.equal(result.resolvedSteps[0].route,'Convergence');
assert.equal(result.resolvedSteps[0].readiness,'CONTRACT_RESOLVED_NOT_AUTHORIZED');
assert.equal(result.resolvedSteps[1].route,'Hybrid Link');
assert.equal(result.resolvedSteps[1].readiness,'HOLD_ROUTE_DISCOVERED');
assert.equal(result.resolvedSteps[3].readiness,'HOLD_ROUTE_UNAVAILABLE');
assert.ok(result.resolvedSteps.every(x=>x.contract?.revision==='R143'));
assert.equal(result.claims.pcOnlineProved,false);
assert.equal(result.claims.solverValidityProved,false);
assert.equal(result.claims.computedPhotorealRealityProved,false);
assert.equal(result.claims.publicDeploymentProved,false);

const missing=resolveLivingWorldMissionContractsR178({...staged,mission:{...staged.mission,steps:[{domain:'UNKNOWN',action:'NOPE'}]}},contracts);
assert.equal(missing.state,'HELD_UNRESOLVED_CONTRACT');
assert.equal(missing.unresolvedCount,1);
assert.equal(missing.dispatchAuthorized,false);

const unstaged=resolveLivingWorldMissionContractsR178({...staged,state:'PREVIEW_NOT_STAGED',staging:{operatorStaged:false}},contracts);
assert.equal(unstaged.accepted,false);
assert.equal(unstaged.state,'R177_OPERATOR_STAGED_MISSION_REQUIRED');

const manifest=manifestR178();
assert.equal(manifest.operationContractAuthority,'R143');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.dispatchAuthorized,false);
console.log('R178 living-world contract resolution invariants PASS');
