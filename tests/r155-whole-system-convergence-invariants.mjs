import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R155_SCHEMA,R155_LAWS,R155_CAPABILITY_FAMILIES,wholeSystemConvergenceManifestR155,assertFamilyDependenciesR155} from '../src/system/wholeSystemConvergenceR155.js';
import {manifestR130} from '../src/system/operationalControlPlaneR130.js';
import {R153_FULL_SYSTEM_CONTRACT} from '../src/fullSystemCompletionR153.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R155 '+m);
const manifest=wholeSystemConvergenceManifestR155();
const families=Object.values(R155_CAPABILITY_FAMILIES);

assert.equal(manifest.schema,R155_SCHEMA);
assert.equal(families.length,11,'R155 must name the complete current capability-family union');
assert.equal(manifest.stateCounts.ADMITTED_MAIN,3);
assert.equal(manifest.stateCounts.INTEGRATED_CANDIDATE,5);
assert.equal(manifest.stateCounts.INTEGRATION_TARGET,3);
assert.equal(manifest.canonicalAdmission,'R125');
assert.equal(manifest.publicEntrypoint,'src/workerR116.js');
assert.equal(assertFamilyDependenciesR155().ok,true,'complete R155 family set must close all declared dependencies');
for(const law of ['REVISION_NUMBER_ALONE_NEVER_DETERMINES_AUTHORITY','CAPABILITY_FAMILY_PLUS_PROOF_PLUS_DEPENDENCY_DETERMINES_SUCCESSOR_AUTHORITY','CURRENT_MAIN_WINS_FOR_ALREADY_ADMITTED_EXECUTION_PATHS','OVERLAPPING_FILES_MUST_BE_RECONCILED_BY_OWNER_NOT_BLINDLY_COPIED','ONE_CANONSTATE_AUTHORITY_R125','ONE_PUBLIC_RUNTIME_ENTRYPOINT_WORKER_R116','RETURNED_IS_NOT_VERIFIED','ROUTE_IS_NOT_EXECUTION','PROJECTION_IS_NOT_ADMISSION','MODE_CONSENSUS_IS_NOT_EMPIRICAL_TRUTH','CAPACITY_PLAN_IS_NOT_EXECUTION','LOGICAL_FANOUT_IS_NOT_PHYSICAL_WORKER_PROOF','ATLAS_RESOLUTION_IS_NOT_LITERAL_PHYSICAL_DIMENSION','NUMERICAL_SOLVER_CONVERGENCE_IS_NOT_FABRICATION_VALIDATION','RUNTIME_CLOCK_IS_NOT_INDEPENDENT_METROLOGY'])must(R155_LAWS.includes(law),`law missing ${law}`);

for(const id of ['CANONICAL_RUNTIME','SOVEREIGN_BUILD','OPTICAL_OPERATION'])assert.equal(R155_CAPABILITY_FAMILIES[id].state,'ADMITTED_MAIN',`${id} must remain current-main owned`);
for(const id of ['ALL_MODES_TRUTH','UNIVERSAL_EVIDENCE','CAUSAL_NOW','RELATIVE_CAPACITY','SYSTEM_COMPLETION'])assert.equal(R155_CAPABILITY_FAMILIES[id].state,'INTEGRATED_CANDIDATE',`${id} must remain proof-gated candidate`);
for(const id of ['DURABLE_MISSION_GRAPH','FULLWAVE_COMPUTATION','INTERFACE_PRESERVATION'])assert.equal(R155_CAPABILITY_FAMILIES[id].state,'INTEGRATION_TARGET',`${id} may not be claimed integrated before its union proof exists`);

const r130=manifestR130();
assert.equal(r130.entrypoint,'src/workerR116.js');
assert.equal(r130.wholeSystemConvergence.schema,R155_SCHEMA);
assert.equal(r130.organization.canonicalAdmission,'R125');
assert.equal(r130.fullSystemCompletion.successor.implemented,19);
assert.equal(r130.fullSystemCompletion.successor.truthGated,5);
assert.equal(r130.fullSystemCompletion.successor.restorationDebt,0);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.systems,100);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.families,24);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.masterMenus,12);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.menuOptions,36);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.capabilities,18);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.routes,44);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.sourceModes,179);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.canonLenses,62);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.packetStates,20736);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.logicalCells,1728);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.logicalLanes,20736);
assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory.addressCapacity,61917364224);

const fusion=read('src/allModesTruthFusionR151.ts');
const swarm=read('src/allModesSwarmPartitionR151.ts');
const evidence=read('src/universalTruthEnvelopeR152.ts');
const now=read('src/lemmaMotionNowContinuityR153.ts');
const capacity=read('src/relativeCapacityFabricR154.ts');
const operation=read('src/unifiedOperationFabricR140.ts');
const field=read('src/OmegaCapabilityFieldR138.tsx');
const worker27=read('src/workerR27.js');
const worker116=read('src/workerR116.js');

must(fusion.includes('R151_CHANNEL_COUNT=179+CANON_AUTHORITY_COUNT'),'241-channel fusion implementation missing');
must(swarm.includes('cells:1728,lanes:20736')&&swarm.includes('totalReadings:STATE_COUNT*R151_CHANNEL_COUNT'),'exact 1,728-cell / 20,736-state partition missing');
must(evidence.includes('VERIFIED_EMPIRICAL_EVIDENCE_OUTWEIGHS_MODEL_AND_CANON_COHERENCE'),'external evidence precedence missing');
must(now.includes('TIME_BEFORE_INTERPRETATION')&&now.includes('MOTION_CONTINUES_FROM_PERSISTED_ANCHOR_INSTEAD_OF_RESETTING_ON_RENDER_START'),'causal NOW/motion continuity missing');
must(capacity.includes('ONE_CANONICAL_STATE_MANY_RELATIVE_OPERATIONAL_CAPACITY_PROJECTIONS')&&capacity.includes('SWARM_FANOUT_IS_LOGICAL_PLANNING_UNTIL_EXECUTION_RECEIPTS_EXIST'),'relative-capacity authority missing');
must(operation.includes('.90*baseScore+.06*modeTruth+.04*modeAgreement'),'R151 may refine but not replace inherited R140 priority');
must(field.includes("data-all-modes-fusion='R151'")&&field.includes("data-relative-capacity='R154'"),'operator field must expose integrated truth/capacity identity');
for(const boundary of ['MODE CONSENSUS ≠ EMPIRICAL TRUTH','PROJECTION ≠ ADMISSION','ROUTE ≠ EXECUTION','CAPACITY ≠ EXECUTION'])must(field.includes(boundary),`operator boundary missing ${boundary}`);
for(const endpoint of ['/api/runtime-now-r154','/api/relative-capacity-r154'])must(worker27.includes(endpoint),`read-only runtime endpoint missing ${endpoint}`);
must(worker27.includes('not claimed to be an independently calibrated UTC metrology source'),'runtime-clock metrology boundary missing');
must(worker116.includes("from './workerR115.js'")||worker116.includes('workerR115'),'R116 must remain the public successor Worker chain rather than a new R155 Worker');

must(manifest.truthBoundary.includes('does not make candidate families canonical'),'candidate/canonical non-promotion boundary must remain explicit');
must(manifest.truthBoundary.includes('Every family remains subject to its own focused proof'),'family promotion must remain proof-gated');

console.log('R155 WHOLE-SYSTEM CONVERGENCE PASS · 11 capability families · 3 admitted-main + 5 integrated-candidate + 3 integration-target · one R116 Worker · one R125 CanonState authority · R153 completion inventory + R151/R152/R153-NOW/R154 semantics reconciled without revision-number authority');
