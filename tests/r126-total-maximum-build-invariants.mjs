import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planAutonomicMissionR125} from '../src/swarm/swarmAutonomicR125.js';

const max=fs.readFileSync('src/omegaMaximumRuntimeR126.ts','utf8');
const cockpit=fs.readFileSync('src/OmegaMaximumCockpitR126.tsx','utf8');
const css=fs.readFileSync('src/omegaMaximumCockpitR126.css','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const source=fs.readFileSync('src/sourceBackedModeRuntimeR21.ts','utf8');
const canon=fs.readFileSync('src/allModesAuthority.ts','utf8');
const worker=fs.readFileSync('src/workerR116.js','utf8');
const api=fs.readFileSync('src/swarm/swarmApiR121.js','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
const selfBuild=fs.readFileSync('src/selfBuildRuntimeR124.ts','utf8');
const accuracy=fs.readFileSync('src/accuracyResidualEngineR125.ts','utf8');

assert.match(max,/OMEGA_R126_TOTAL_MAXIMUM_BUILD/);
for(const n of ['20736','248832','61917364224'])assert.ok(max.includes(n),`maximum scale authority missing ${n}`);
assert.match(max,/physicalDimensionClaim:false/);
assert.match(max,/sourceCatalog:R21_MODE_AUTHORITY\.catalogCount/);
assert.match(max,/canonLenses:CANON_AUTHORITY_COUNT/);
assert.match(source,/catalogCount:179/);
assert.match(canon,/canonAuthorities:62/);
for(const projection of ['FIELD','MATTER','TRAVERSAL','FORECAST','RELATIVITY','INFINITY','SCALE','CONVERGENCE','EARTH','OPTICAL','PROOF','BUILD'])assert.ok(max.includes(`'${projection}'`),`projection missing ${projection}`);
for(const family of ['CANONICAL_RUNTIME','MODE_CALCULUS','FIELD_VISUALIZATION','MATTER_TRAVERSAL','DIMENSIONAL_RELATIVITY','FORECAST_TRAJECTORY','EARTH_EVIDENCE','OPTICAL_MATERIAL','SOVEREIGN_COMPUTE','HYBRID_LINK','FEDERATION','GENESIS_PROPOSAL','PROOF_GOVERNANCE','EVIDENCE_MEMORY','ARCHIVE_DONOR_MEMORY','SELF_BUILD','ACCURACY_RESIDUAL','AUTONOMIC_SWARM','ORGANISM_SWARM','DIRECT_SWARM','UNIVERSAL_DATA','AUDIO_LIGHT_SPECTRUM','ECO_BIO_LIFE','OPERATOR_INTERFACE'])assert.ok(max.includes(`'${family}'`),`system family missing ${family}`);
assert.match(max,/providerBudget.*0,12/s);
assert.match(max,/allCatalogEntriesInformRouting:modePolicy==='ALL'/);
for(const boundary of ['EXECUTION_QUORUM_NOT_TRUTH','SWARM_RECEIPT_RETURNED_NOT_ADMITTED','SELF_BUILD_CANDIDATE_NOT_ADMITTED','CATALOG_MEMBERSHIP_NOT_EXECUTION'])assert.ok(max.includes(boundary),`R126 authority boundary missing ${boundary}`);
assert.match(max,/OMEGAv6 proof\/admission remains the only canonical authority/);

const full=planAutonomicMissionR125({intent:'R126 explicit maximum body pass',mode:'FULL',providerBudget:99});
assert.equal(full.totalCells,1728);
assert.equal(full.budgets.providerTotal,12);
const bounded=planAutonomicMissionR125({intent:'R126 automatic escalation',metrics:{continuity:.02,burden:.95,contradiction:.95},providerBudget:12});
assert.equal(bounded.totalCells,288);
const fullAuto=planAutonomicMissionR125({intent:'R126 operator explicitly permits full automatic body',metrics:{continuity:.02,burden:.95,contradiction:.95},allowFullAuto:true,providerBudget:0});
assert.equal(fullAuto.totalCells,1728);

assert.ok(worker.includes('OmegaSwarmAutonomicCoordinator'));
for(const route of ['/api/swarm/autonomic/manifest','/api/swarm/autonomic/status','/api/swarm/autonomic/plan','/api/swarm/autonomic/missions'])assert.ok(api.includes(route),`runtime route missing ${route}`);
assert.ok(wrangler.includes('OMEGA_SWARM_AUTONOMIC'));
assert.ok(wrangler.includes('r125-autonomic-swarm'),'R126 must preserve the historical R125 Durable Object migration tag instead of renaming an already-introduced class');
assert.ok(wrangler.includes('"main": "src/workerR116.js"'));

for(const layer of ['OmegaMaximumCockpitR126','OmegaAutonomicR125','OmegaOrganismR123','OmegaSwarmR121','OmegaFieldMotionConvergenceR28'])assert.ok(suite.includes(layer),`convergence layer missing ${layer}`);
assert.ok(suite.indexOf('OmegaMaximumCockpitR126')<suite.indexOf("<details className='r121-legacy-convergence' open"),'maximum cockpit must remain top-level before lower execution layers');
assert.ok(cockpit.includes('R126 · TOTAL MAXIMUM BUILD'));
assert.ok(cockpit.includes('ALL MODES AVAILABLE'));
assert.ok(cockpit.includes('61,917,364,224'));
assert.ok(cockpit.includes('EXECUTE PROOF-BOUND ROUTE'));
assert.ok(cockpit.includes("net.hybrid?.nativeExecutionClaimed===true")&&cockpit.includes("d?.online&&!d?.revoked"),'PC LIVE status must require authenticated live-device evidence');
assert.ok(cockpit.includes('Unproven')||cockpit.includes('UNPROVEN'));
assert.ok(css.includes('@media(max-width:760px)')&&css.includes('@media(max-width:470px)'),'mobile breakpoints missing');

assert.match(selfBuild,/NO_SILENT_MAIN_MUTATION/);
assert.match(selfBuild,/FAILED_CANDIDATES_ARE_REJECTED_NOT_PATCHED_INTO_MAIN/);
assert.match(accuracy,/UNVERIFIED_EVIDENCE_CANNOT_AUTHORIZE_MUTATION/);
assert.match(accuracy,/TRUTH_BOUNDARY_RISK_ALWAYS_BLOCKS_AUTONOMOUS_MUTATION/);

console.log('R126 TOTAL MAXIMUM BUILD invariants PASS · 179 source catalog · 62 canon lenses · 12 projections · 24 system families · 1→12→144→1728→20736 hierarchy · proof-bounded autonomy retained');
