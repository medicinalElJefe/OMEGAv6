import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CORTEX_HIERARCHY,CORTEX_LAWS,CORTEX_RUNTIME,planCortexMissionR130,publicCortexPlanR130,synapticNeighborsR130} from '../src/swarm/swarmCortexR130.js';

const high={novelty:1,uncertainty:1,contradiction:1,proofUrgency:1,motion:1,observerRelevance:1,expectedInformationGain:1,cost:0};
assert.equal(CORTEX_RUNTIME,'OMEGA_R130_MAX_CAPACITY_ORGANISM');
assert.deepEqual(CORTEX_HIERARCHY,{seed:1,organs:12,branches:144,cells:1728,lanes:20736});

const full=planCortexMissionR130({intent:'execute full proof bounded body',mode:'FULL',scope:{type:'BODY'},providerBudget:99,dispatchWidth:99,metrics:high});
assert.equal(full.selectedCellCount,1728);
assert.equal(full.totalBranchChecks,144);
assert.equal(full.totalOrganSyntheses,12);
assert.equal(full.totalInterorganExchanges,12);
assert.equal(full.totalTaskCount,1899);
assert.equal(full.dispatchWidth,48);
assert.equal(full.budgets.providerTotal,12);
assert.ok(full.budgets.providerOrgan+full.budgets.providerExchange+full.budgets.providerReconvergence<=12);
assert.equal(full.tasks.filter(x=>x.kind==='CELL').length,1728);
assert.equal(new Set(full.tasks.filter(x=>x.kind==='CELL').map(x=>x.cellId)).size,1728);
assert.equal(full.tasks.filter(x=>x.kind==='BRANCH_CROSSCHECK').every(x=>x.dependencies.length===1&&x.dependencies[0]==='mesh:barrier'),true);
assert.equal(full.tasks.filter(x=>x.kind==='ORGAN_SYNTHESIS').every(x=>x.dependencies.length===12),true);
assert.equal(full.tasks.filter(x=>x.kind==='INTERORGAN_EXCHANGE').every(x=>x.dependencies.length===12),true);
assert.equal(full.tasks.find(x=>x.id==='proof:return')?.dependencies.length,12);
assert.equal(full.waves.length,7);
assert.deepEqual(full.waves.map(x=>x.name),['FRAME','PARALLEL_CELL_WORK','MESH_BARRIER','BRANCH_CROSSCHECK','ORGAN_SYNTHESIS','INTERORGAN_EXCHANGE','PROOF_RETURN']);

const adaptive=planCortexMissionR130({intent:'adaptive pressure',mode:'ADAPTIVE',scope:{type:'BODY'},providerBudget:0,metrics:high});
assert.equal(adaptive.selectedCellCount,288,'adaptive high pressure must stop at 288 without explicit full-auto');
const adaptiveFull=planCortexMissionR130({intent:'explicit adaptive full body',mode:'ADAPTIVE',scope:{type:'BODY'},allowFullAuto:true,providerBudget:0,metrics:high});
assert.equal(adaptiveFull.selectedCellCount,1728);
assert.equal(planCortexMissionR130({intent:'branch scale',mode:'BRANCH'}).selectedCellCount,12);
assert.equal(planCortexMissionR130({intent:'organ scale',mode:'ORGAN'}).selectedCellCount,144);
assert.equal(planCortexMissionR130({intent:'organ scope full',mode:'FULL',scope:{type:'ORGAN',domain:4}}).selectedCellCount,144);
assert.equal(planCortexMissionR130({intent:'branch scope full',mode:'FULL',scope:{type:'BRANCH',domain:4,phase:3}}).selectedCellCount,12);
assert.equal(planCortexMissionR130({intent:'cell scope full',mode:'FULL',scope:{type:'CELL',domain:10,phase:11,regulation:3}}).selectedCellCount,1);

for(const index of [0,1,143,144,1440,1584,1727]){
 const n=synapticNeighborsR130(index);
 assert.equal(n.length,8,`cell ${index} must expose eight unique bounded synapses`);
 assert.equal(new Set(n.map(x=>x.index)).size,8);
 assert.ok(n.every(x=>x.index>=0&&x.index<1728&&x.index!==index));
}
const zero=synapticNeighborsR130(0);
assert.ok(zero.some(x=>x.address.domain===10),'proof synapse missing');
assert.ok(zero.some(x=>x.address.domain===11),'coordination synapse missing');

const publicFull=publicCortexPlanR130(full);
assert.equal(publicFull.tasks,undefined);
assert.equal(publicFull.selectedIndices,undefined);
assert.equal(publicFull.taskSample.length,36);
assert.equal(publicFull.selectedSample.length,36);
assert.equal(publicFull.evidenceCount,0);

const optical=planCortexMissionR130({intent:'screen optical candidates',mode:'FULL',projection:'OPTICAL',providerBudget:0,opticalBudget:1});
assert.equal(optical.tasks.filter(x=>x.executor==='OPTICAL_CHAIN').length,1);
const build=planCortexMissionR130({intent:'build software candidate',mode:'FULL',projection:'BUILD',providerBudget:0,genesisBudget:1});
assert.equal(build.tasks.filter(x=>x.executor==='GENESIS').length,1);
for(const law of ['GLOBAL_CELL_BARRIER_PRECEDES_CROSS_BRANCH_SYNTHESIS','INTERORGAN_EXCHANGE_PRECEDES_WHOLE_BODY_RETURN','EXECUTION_QUORUM_IS_NOT_TRUTH','SYNTHETIC_OR_INTERNAL_EXECUTION_HAS_ZERO_R128_EXTERNAL_VALIDATION_CREDIT'])assert.ok(CORTEX_LAWS.includes(law));

const core=fs.readFileSync('src/swarm/swarmCortexR130.js','utf8');
const api=fs.readFileSync('src/swarm/swarmCortexApiR130.js','utf8');
const worker=fs.readFileSync('src/workerR130.js','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const ui=fs.readFileSync('src/OmegaCortexR130.tsx','utf8');
const css=fs.readFileSync('src/omegaCortexR130.css','utf8');
const proof=fs.readFileSync('src/proof/evidenceExecutionProofFabricR127.ts','utf8');
const validation=fs.readFileSync('src/validation/empiricalCalibrationReplayR128.ts','utf8');
const experiment=fs.readFileSync('scripts/r129-empirical-experiment.mjs','utf8');
for(const term of ['CORTEX_CANDIDATE_MEMORY_NOT_CANON','EXECUTION_QUORUM_NOT_TRUTH','R130_EXECUTION_RECEIPT_NOT_CANON','CORTEX_RECEIPT_RETURNED_NOT_ADMITTED','r128ExternalValidationCredit:0','canonicalMutation:false'])assert.ok(core.includes(term),`missing R130 authority boundary ${term}`);
assert.ok(core.includes('Promise.all(active.map'),'cell dispatch must be bounded-concurrent rather than serial');
assert.ok(core.includes("clamp(input.dispatchWidth??24,1,48)"),'dispatch hard cap missing');
assert.ok(core.includes('cellMemoryKey')&&core.includes('synapticReadCellIds'),'synaptic candidate memory must be operational, not display-only');
for(const route of ['/api/swarm/cortex/manifest','/api/swarm/cortex/plan','/api/swarm/cortex/status','/api/swarm/cortex/missions'])assert.ok(api.includes(route),`missing cortex API ${route}`);
for(const action of ['advance','pause','resume','cancel','checkpoint','memory','events','evidence','rejoin'])assert.ok(api.includes(action),`missing cortex action ${action}`);
assert.ok(worker.includes('OmegaSwarmCortexR130')&&worker.includes("startsWith('/api/swarm/cortex/')"));
assert.ok(wrangler.includes('"main": "src/workerR130.js"')&&wrangler.includes('OMEGA_SWARM_CORTEX')&&wrangler.includes('r130-max-capacity-organism'));
assert.ok(suite.includes('OmegaCortexR130'));
assert.ok(ui.includes('Independent cells, synchronized branches, interacting organs, one bounded body.'));
assert.ok(ui.includes('CONCURRENT DISPATCH · 1–48')&&ui.includes('INTER-ORGAN'));
assert.ok(css.includes('@media(max-width:780px)')&&css.includes('@media(max-width:470px)'));
assert.ok(proof.includes('EXECUTION_RECEIPT_IS_NOT_TRUTH'));
assert.ok(validation.includes('SYNTHETIC_DATA_NEVER_COUNTS_AS_EXTERNAL_VALIDATION'));
assert.ok(experiment.includes('R129_EXPERIMENT_LEDGER_NOT_CANON'));
console.log('R130 MAX CAPACITY ORGANISM invariants PASS · 1 seed · 12 organs · 144 branches · 1,728 real stateful cells · 20,736 lanes · 1,899 full-body tasks · 48 max concurrent dispatch · 12 max model calls · R127/R128/R129 boundaries preserved');
