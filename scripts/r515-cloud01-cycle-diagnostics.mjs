import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const candidate=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-candidate.json','utf8'));
const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
const worker=fs.readFileSync('src/workerR116.js','utf8');
const facts={
 schema:'OMEGA_CLOUD01_DIAGNOSTIC_RECEIPT_R515',
 checkedAt:new Date().toISOString(),
 sourceSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 machineId:candidate.machineId,
 candidateRevision:candidate.revision,
 candidateItemId:candidate.item?.id??null,
 candidateGeneratorContract:candidate.generatorContract,
 stateActive:state.active===true,
 stateGeneration:state.generation??null,
 maxAutonomousGenerations:state.maxAutonomousGenerations??null,
 admittedSourceCount:state.admittedSourceCapsules?.length??0,
 pendingCapsuleId:state.currentCapsuleId??null,
 githubR170ManualDispatch:/workflow_dispatch:/.test(workflow),
 githubR170Scheduled:/^\s+schedule:/m.test(workflow),
 githubR170ProductionProofGate:workflow.includes('Require successful canonical production proof for this exact main SHA'),
 cloudflareProductionEntry:/"main"\s*:\s*"src\/workerR116\.js"/.test(wrangler),
 cloudflareProductionScheduledExport:/async\s+scheduled\s*\(/.test(worker),
 externalCloudflareCronEvidence:'NOT_OBSERVED',
 externalCloudflareInvocationEvidence:'NOT_OBSERVED',
 githubHandoffEvidence:'NOT_OBSERVED',
 canonicalMutation:false,
 productionMutation:false
};
assert.equal(facts.machineId,'CLOUD-01','unexpected candidate machine identity');
assert.equal(facts.githubR170ManualDispatch,true,'R170 dispatch contract changed');
assert.equal(facts.githubR170ProductionProofGate,true,'R170 production proof gate missing');
assert.equal(facts.cloudflareProductionEntry,true,'production Worker entry changed');
assert.equal(facts.canonicalMutation,false);
assert.equal(facts.productionMutation,false);
const output=JSON.stringify(facts,null,2)+'\n';
if(process.env.OMEGA_R515_RECEIPT_PATH)fs.writeFileSync(process.env.OMEGA_R515_RECEIPT_PATH,output);
process.stdout.write(output);
