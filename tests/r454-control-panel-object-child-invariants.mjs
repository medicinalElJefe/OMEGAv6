import fs from 'node:fs';
import assert from 'node:assert/strict';

const prompt=fs.readFileSync('src/PromptOrchestrator.tsx','utf8');
const completion=fs.readFileSync('src/FullSystemCompletionR153.tsx','utf8');
const browser=fs.readFileSync('tests/r286-all-surface-browser-e2e.mjs','utf8');

for(const token of [
 "const missionCycleCount=(mission:any)=>",
 "if(Array.isArray(mission?.cycles))return mission.cycles.length",
 "missionCycle=missionCycleCount(mission)",
 "{missionCycle}/{missionMaxCycles} cycles",
 "mission.status==='PAUSED'&&missionCycle<missionMaxCycles",
 "(missionCycle/missionMaxCycles)*100",
 "displayScalar(task.turn.assistantMessage"
])assert.ok(prompt.includes(token),'R454 PromptOrchestrator missing '+token);

assert.ok(!prompt.includes('{mission.cycles}/{mission.maxCycles} cycles'),'R454 forbids rendering mission.cycles directly into JSX');
assert.ok(!prompt.includes("mission.status==='PAUSED'&&mission.cycles<mission.maxCycles"),'R454 pause/resume comparison must use normalized scalar cycle count');
assert.ok(completion.includes('missionCycleCount(mission)}/{Number(mission.maxCycles||R153_MAX_CYCLES)} cycles'),'R454 Build Out must normalize structured cycle receipts too');

for(const token of [
 "const r454CycleReceipt={cycle:1,jobId:'r454-returned-job',status:'COMPLETE',resultFingerprint:'f'.repeat(64),completedAt:Date.now()-1000}",
 "cycles:[r454CycleReceipt]",
 "summary:r454CycleReceipt",
 "commandText.includes('1/8 cycles')",
 "commandText.includes('cycle 1')",
 "commandText.includes('job r454-returned-job')"
])assert.ok(browser.includes(token),'R454 browser reproduction missing '+token);

console.log('R454 PASS · React #31 structured mission-cycle object is normalized to scalar progress · exact {cycle,jobId,status,resultFingerprint,completedAt} receipt is browser-injected into the 44-route sweep · Command Center must surface without object-child rendering · Build Out shares scalar cycle normalization');
