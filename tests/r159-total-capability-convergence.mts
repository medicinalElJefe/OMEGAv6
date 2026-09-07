import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R159_CAPABILITY_ROWS,R159_LAWS,totalCapabilityConvergenceR159} from '../src/totalCapabilityConvergenceR159';

const result=totalCapabilityConvergenceR159();
assert.equal(result.schema,'OMEGA_TOTAL_CAPABILITY_CONVERGENCE_R159');
assert.equal(result.canonicalMutation,false);
assert.equal(result.admissionAuthority,'R125');
for(const law of [
 'PRESERVE_EXISTING_CAPABILITY_AND_OUTPUT',
 'PROMOTE_ONLY_WITH_PROOF',
 'CURRENT_HEARTBEAT_PROVES_DEVICE_AVAILABILITY_NOT_JOB_SUCCESS',
 'QUEUED_IS_NOT_INVOKED',
 'RUNNING_IS_NOT_RETURNED',
 'RETURNED_IS_NOT_VERIFIED',
 'R141_EXACT_PAYLOAD_CLOSURE_REQUIRED_FOR_VERIFIED_HYBRID_EXECUTION',
 'ATLAS_RESOLUTION_IS_NOT_LITERAL_PHYSICAL_DIMENSION'
])assert.ok(R159_LAWS.includes(law),`missing R159 law ${law}`);

const ids=new Set(R159_CAPABILITY_ROWS.map(x=>x.id));
for(const id of ['CANON_AND_ADMISSION','EXECUTION_TRUTH','ALL_MODES_TRUTH_FUSION','CAUSAL_NOW_AND_CAPACITY','WHOLE_SYSTEM_FAMILIES','DIMENSIONAL_RELATIVITY','REFLEX_LIVING_WORLD','CAPABILITY_UNIVERSE','ADAPTIVE_INSTRUMENT_SURFACE','FULLWAVE_ADMISSIBLE_ROBUSTNESS','PHYSICAL_PC_AND_RCWA'])assert.ok(ids.has(id),`missing capability family ${id}`);
assert.equal(R159_CAPABILITY_ROWS.find(x=>x.id==='PHYSICAL_PC_AND_RCWA')?.status,'EXTERNAL_PROOF_REQUIRED');
assert.equal(R159_CAPABILITY_ROWS.find(x=>x.id==='ADAPTIVE_INSTRUMENT_SURFACE')?.status,'INTEGRATED_CANDIDATE');
assert.equal(R159_CAPABILITY_ROWS.find(x=>x.id==='FULLWAVE_ADMISSIBLE_ROBUSTNESS')?.status,'INTEGRATED_CANDIDATE');

const requiredFiles=[
 'src/CapabilityUniverseR158.tsx','src/OrganismReflexFabricR158.tsx','src/interactionViewGuardR158.css','src/liveHybridExecutionTruthR158.ts',
 'src/adaptiveNavigationR156.ts','src/liveNavigationR156.ts','src/omegaSideNavigatorR156.css','src/navigationExperienceR156.css',
 'services/opticalExternalToolR1533.js','services/opticalMachineR1533.js','sovereign/omega_fullwave_manifold_r1533.py','wrangler.optical-machine-r1533.jsonc'
];
for(const file of requiredFiles)assert.ok(fs.existsSync(file),`R159 integration missing ${file}`);

const nav=fs.readFileSync('src/OmegaSideNavigatorR88.tsx','utf8');
for(const token of ['useLiveNavigationR156','adaptiveNextRoutes','R156_MISSION_STACKS','r156-global-nav'])assert.ok(nav.includes(token),`adaptive navigator donor missing ${token}`);
const shell=fs.readFileSync('src/SingleFrameRuntimeShellR27.tsx','utf8');
assert.ok(shell.includes('navigationExperienceR156.css'),'adaptive experience layer is not mounted');
const optical=fs.readFileSync('services/opticalExternalToolR1533.js','utf8');
for(const token of ['fullwave_admissibility','prepare_robust_fullwave','FULLWAVE_GEOMETRY_REFINEMENT_REQUIRED','PREPARED_NOT_SOLVED'])assert.ok(optical.includes(token),`R153.3 donor missing ${token}`);
const hybrid=fs.readFileSync('src/liveHybridExecutionTruthR158.ts','utf8');
for(const token of ['QUEUED_IS_NOT_INVOKED','RUNNING_IS_INVOKED_NOT_RETURNED','RETURNED_IS_NOT_VERIFIED','VERIFIED_REQUIRES_R141_EXACT_PAYLOAD_CLOSURE'])assert.ok(hybrid.includes(token),`execution truth regression ${token}`);

console.log(`R159 TOTAL CAPABILITY CONVERGENCE PASS · ${R159_CAPABILITY_ROWS.length} promoted/integrated/external-proof families · adaptive instrument restored · R153.3 full-wave manifold donor integrated · R158 visual and Hybrid truth retained · no capability deletion authority introduced`);
