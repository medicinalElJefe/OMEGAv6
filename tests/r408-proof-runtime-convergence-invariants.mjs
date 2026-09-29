import assert from'node:assert/strict';
import fs from'node:fs';
import{
 R408_PROOF_CLASSES,R408_PROOF_WORKLOAD_SCHEMA,R408_EWMA_ALPHA,
 emptyProofWorkloadScarR408,estimateProofShardsR408,recordProofShardObservationR408,auditProofWorkloadScarR408,
}from'../src/system/r408ProofWorkloadEstimator.js';

const navigation=fs.readFileSync('src/navigationRegistry.ts','utf8');
const block=navigation.slice(navigation.indexOf('export const OMEGA_NAVIGATION=['),navigation.indexOf('export const OMEGA_NAV_GROUPS'));
const surfaces=[...block.matchAll(/name:'([^']+)'/g)].map(m=>m[1]);
assert.equal(surfaces.length,44);
assert.equal(new Set(surfaces).size,44);
assert.deepEqual(R408_PROOF_CLASSES,['disclosure','interaction','no_dead_control']);
assert.equal(R408_EWMA_ALPHA,.35);

let scar=emptyProofWorkloadScarR408();
assert.equal(scar.schema,R408_PROOF_WORKLOAD_SCHEMA);

for(const proofClass of R408_PROOF_CLASSES){
 const plan=estimateProofShardsR408({surfaces,shardCount:16,proofClass,scar});
 assert.equal(plan.length,16);
 assert.equal(new Set(plan.map(x=>x.index)).size,16);
 const cases=plan.flatMap(x=>x.cases);
 assert.equal(cases.length,88);
 assert.equal(new Set(cases.map(x=>x.key)).size,88);
 assert.ok(plan.every(x=>x.predictedMs>=x.baselineMs&&x.baselineMs>0));
 for(let i=1;i<plan.length;i++)assert.ok(plan[i-1].predictedMs>=plan[i].predictedMs);
}

scar=recordProofShardObservationR408({scar,proofClass:'interaction',shardCount:16,shardIndex:3,predictedMs:65000,observedMs:120000,runId:'r1',sha:'abc'});
let audit=auditProofWorkloadScarR408(scar);
assert.equal(audit.preservesHistory,true);
assert.equal(audit.separateClassNamespaces,true);
assert.equal(audit.classes.find(x=>x.proofClass==='interaction').historyCount,1);
assert.equal(audit.classes.find(x=>x.proofClass==='disclosure').historyCount,0);
assert.equal(audit.classes.find(x=>x.proofClass==='no_dead_control').historyCount,0);

const learned1=scar.classes.interaction.ewmaByShard['16:3'].ewmaMs;
assert.equal(learned1,120000);
scar=recordProofShardObservationR408({scar,proofClass:'interaction',shardCount:16,shardIndex:3,predictedMs:120000,observedMs:80000,runId:'r2',sha:'def'});
const learned2=scar.classes.interaction.ewmaByShard['16:3'].ewmaMs;
assert.ok(learned2<120000&&learned2>80000);
assert.equal(scar.classes.interaction.history.length,2);
assert.deepEqual(scar.classes.interaction.history.map(x=>x.observedMs),[120000,80000]);
const beforeFailedEwma=scar.classes.interaction.ewmaByShard['16:3'].ewmaMs;
scar=recordProofShardObservationR408({scar,proofClass:'interaction',shardCount:16,shardIndex:3,predictedMs:beforeFailedEwma,observedMs:17000,success:false,runId:'r3',sha:'ghi'});
assert.equal(scar.classes.interaction.history.length,3);
assert.equal(scar.classes.interaction.history.at(-1).success,false);
assert.equal(scar.classes.interaction.ewmaByShard['16:3'].ewmaMs,beforeFailedEwma);

const interactionPlan=estimateProofShardsR408({surfaces,shardCount:16,proofClass:'interaction',scar});
const learnedShard=interactionPlan.find(x=>x.index===3);
assert.ok(learnedShard.predictedMs>=learned2);
const disclosurePlan=estimateProofShardsR408({surfaces,shardCount:16,proofClass:'disclosure',scar});
assert.equal(disclosurePlan.find(x=>x.index===3).predictedMs,disclosurePlan.find(x=>x.index===3).baselineMs);

const scheduler=fs.readFileSync('scripts/run_work_conserving_shards_r408.mjs','utf8');
assert.ok(scheduler.includes('Promise.race([...running.values()])'));
assert.ok(scheduler.includes('running.size<maxParallel'));
assert.ok(scheduler.includes('activeResourceCost()+shardResourceCost')&&scheduler.includes('resourceCapacity'));
assert.ok(scheduler.includes('launch(queue[next++])'));
assert.ok(!scheduler.includes('wave_start'));
assert.ok(scheduler.includes("spawn('timeout'"));
assert.ok(scheduler.includes("'--kill-after=15s'"));
assert.ok(scheduler.includes('results.length!==shardCount||unique.size!==shardCount'));
assert.ok(scheduler.includes('if(failed)process.exit(1)'));

for(const [file,proofClass,cost] of[
 ['scripts/run_r313_control_shards.sh','interaction',2],
 ['scripts/run_r313_disclosure_shards.sh','disclosure',2],
 ['scripts/run_r286_control_shards.sh','no_dead_control',1],
]){
 const src=fs.readFileSync(file,'utf8');
 assert.ok(src.includes('run_work_conserving_shards_r408.mjs'));
 assert.ok(src.includes('R408_PROOF_CLASS='+proofClass));
 assert.ok(src.includes('R408_RESOURCE_CAPACITY=4'));
 assert.ok(src.includes('R408_SHARD_RESOURCE_COST='+cost));
 assert.ok(!src.includes('wave_start'));
}

const workflow=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');
assert.ok(workflow.includes('R313_PROOF_SHARDS=16 R313_SHARD_MAX_PARALLEL=4 R313_SHARD_TIMEOUT_SEC=480'));
assert.ok(workflow.includes('R313_DISCLOSURE_SHARDS=16 R313_DISCLOSURE_MAX_PARALLEL=4 R313_DISCLOSURE_SHARD_TIMEOUT_SEC=360'));
assert.ok(workflow.includes('R286_PROOF_SHARDS=8 R286_SHARD_MAX_PARALLEL=4 R286_SHARD_TIMEOUT_SEC=360'));
assert.ok(workflow.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC=1500'));
assert.ok(workflow.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC=1320'));
assert.ok(workflow.includes('OMEGA_BROWSER_PROOF_TIMEOUT_SEC=780'));
assert.ok(workflow.includes('Restore R408 interaction workload scar'));
assert.ok(workflow.includes('Restore R408 main proof workload scar'));
assert.ok(workflow.includes('Retain R408 interaction workload scar'));
assert.ok(workflow.includes('Retain R408 main browser workload scar'));

console.log('R408 PROOF RUNTIME CONVERGENCE PASS · 88 route/viewport cases remain complete and unique · disclosure/interaction/no-dead-control estimators are isolated · failed transport samples remain in scar history but do not train timing EWMA · longest predicted shards launch first · scheduler refills capacity on first completion with no wave barrier · heavy browser shards consume 2/4 resource units while lighter no-dead-control shards consume 1/4 · all child/parent ceilings and fail-closed recombination remain intact');
