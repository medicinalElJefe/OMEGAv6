import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertOperationalConvergenceR249,compileOperationalConvergenceR249,metricsFromResidualGraphR249,sequenceGovernedStepsR249} from '../src/system/operationalConvergenceR249.js';

assert.equal(assertOperationalConvergenceR249(),true);

const healthy=compileOperationalConvergenceR249({metrics:{continuity:.94,plasticity:.88,contradiction:.05,burden:.08,evidence:.96,uncertainty:.04,scar:.02},configuredParallel:12,effectiveCpuWorkers:8,executionRequested:true});
assert.equal(healthy.schema,'OMEGA_OPERATIONAL_CONVERGENCE_R249');
assert.equal(healthy.decision,'STAY');
assert.ok(healthy.policy.frontierWidth>=2&&healthy.policy.frontierWidth<=8);
assert.equal(healthy.authority.dispatch,'R147');
assert.equal(healthy.authority.returnProof,'R141');
assert.equal(healthy.authority.history,'R146');
assert.equal(healthy.authority.sourcePromotion,'R240');
assert.equal(healthy.authority.canonAdmission,'R125');

const turn=compileOperationalConvergenceR249({metrics:{continuity:.62,plasticity:.72,contradiction:.31,burden:.39,evidence:.78,uncertainty:.22,scar:.21},configuredParallel:12,effectiveCpuWorkers:8});
assert.equal(turn.decision,'TURN');
assert.ok(turn.policy.frontierWidth>=1&&turn.policy.frontierWidth<=5);

const escalate=compileOperationalConvergenceR249({metrics:{continuity:.18,plasticity:.31,contradiction:.82,burden:.79,evidence:.42,uncertainty:.58,scar:.75},configuredParallel:12,effectiveCpuWorkers:12});
assert.equal(escalate.decision,'ESCALATE');
assert.equal(escalate.policy.frontierWidth,1);
assert.equal(escalate.policy.maxMissionCycles,4);

const steps=[
 {id:'01',op:'INDEX'},
 {id:'02',op:'APPLY_PATCH'},
 {id:'03',op:'HASH_TREE'},
 {id:'04',op:'BUILD'},
 {id:'05',op:'TEST'},
 {id:'06',op:'PACKAGE'}
];
const staySteps=sequenceGovernedStepsR249(steps,healthy);
assert.deepEqual(staySteps.steps.map(x=>x.op),steps.map(x=>x.op));
const turnSteps=sequenceGovernedStepsR249(steps,turn);
assert.deepEqual(turnSteps.steps.slice(0,2).map(x=>x.op),['INDEX','HASH_TREE']);
assert.ok(turnSteps.steps.indexOf(turnSteps.steps.find(x=>x.op==='APPLY_PATCH'))<turnSteps.steps.indexOf(turnSteps.steps.find(x=>x.op==='BUILD')));
const escalateSteps=sequenceGovernedStepsR249(steps,escalate);
assert.deepEqual(escalateSteps.steps.map(x=>x.op),['INDEX','HASH_TREE']);
assert.ok(escalateSteps.omitted.some(x=>x.op==='APPLY_PATCH'));
assert.ok(escalateSteps.omitted.some(x=>x.op==='BUILD'));

const residualMetrics=metricsFromResidualGraphR249({schema:'OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164',state:'RESIDUALS_PRESENT',summary:{total:2,blocking:0,review:1},residuals:[{id:'A',severity:'HIGH',mode:'QUEUE_FOR_REVIEW'},{id:'B',severity:'MEDIUM',mode:'OBSERVE_ONLY'}]},[{severity:'HIGH'}]);
assert.ok(residualMetrics.contradiction>0);
assert.ok(residualMetrics.scar>0);
assert.ok(residualMetrics.continuity<1);

const governor=fs.readFileSync('src/system/operationalConvergenceR249.js','utf8');
const selection=fs.readFileSync('scripts/lib/r245-governed-selfbuild-selection.mjs','utf8');
const hybrid=fs.readFileSync('src/HybridActionRuntimeR247.tsx','utf8');
const r240=fs.readFileSync('scripts/lib/r240-recursive-selfbuild-fabric.mjs','utf8');
const r243=fs.readFileSync('scripts/lib/r243-woven-selfbuild-fabric.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');

for(const token of ['PARTITION → EXCHANGE/TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/REPARTITION','futurePlasticity','invariantCarry','residualPressure','orientation','frontierWidth','maxMissionCycles','EVIDENCE_ONLY_FIRST_CYCLE','R153_PREIMAGE_BOUND_ONLY','R147','R141','R146','R240','R125'])assert.ok(governor.includes(token),`R249 governor missing ${token}`);
for(const forbidden of ['api.post(','api.put(','api.delete(','wrangler deploy','CanonState admission granted','sourceMutationAuthorized:true'])assert.ok(!governor.includes(forbidden),`R249 governor acquired forbidden authority ${forbidden}`);

for(const token of ['compileOperationalConvergenceR249','configuredMax','operational.policy.frontierWidth','planParallelFrontierR240({roadmap,admitted,maxParallel','planWovenBuildFabricR243({roadmap,admitted,maxParallel','operationalConvergenceR249:r249','R240 authority'])assert.ok(selection.includes(token),`R170/CLOUD-01 shared selection is not R249 governed: ${token}`);
assert.ok(r240.includes("authority:'SCHEDULING_ONLY'"));
assert.ok(r243.includes("parallelSourceMutation:false"));

for(const token of ['compileOperationalConvergenceR249','sequenceGovernedStepsR249','operationalConvergenceR249:convergence','r249FirstCycle','steps:sequence.steps','Math.min(operational.policy.maxCycles,convergence.policy.maxMissionCycles)','data-r249-step-mode'])assert.ok(hybrid.includes(token),`real Hybrid mission path is not R249 governed: ${token}`);
assert.ok(hybrid.includes("api.post<any>('/api/missions'"),'R153 mission path disappeared');
assert.ok(hybrid.includes('allowedOps:R153_ALLOWED'),'R153 allowlist boundary disappeared');

assert.ok(workflow.includes('r249-operational-convergence-invariants.mjs'),'R249 proof must converge into existing R241 workflow plane');
assert.ok(!workflow.includes('push:\n    branches: [main]'),'R241 proof plane must not become a main-push deployment writer');

console.log('R249 operational convergence invariants PASS');
