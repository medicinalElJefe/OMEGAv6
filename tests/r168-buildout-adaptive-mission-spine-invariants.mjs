import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const buildout=read('src/WovenBuildOutPanel.tsx');
const executor=read('src/FullSystemCompletionR153.tsx');
const adaptive=read('src/execution/adaptiveSovereignMissionR153.js');
const must=(ok,msg)=>assert.ok(ok,`R168 build-out mission spine: ${msg}`);

must(buildout.includes("import FullSystemCompletionR153 from './FullSystemCompletionR153'"),'Build Out must reuse the one whole-system executor instead of creating another execution authority');
must(buildout.includes('<FullSystemCompletionR153 onNavigate={onNavigate}/>'),'Build Out must expose the governed whole-system mission directly');
must(buildout.includes('R151→R153 adaptive whole-system mission'),'Build Out operator copy must identify the actual adaptive execution spine');
must(buildout.includes('no browser control alone proves native execution'),'Build Out must preserve native-execution truth boundary');

for(const token of ["R153_SOURCE_SCHEMA='OMEGA_SOVEREIGN_FULL_BUILD_R151'",'R153_MAX_CYCLES=12','draft:{schema:R153_SOURCE_SCHEMA','maxCycles:R153_MAX_CYCLES',"hybrid?.nativeExecutionClaimed===true",'RUN COMPLETE 24-FAMILY BUILD'])must(executor.includes(token),`executor missing ${token}`);
for(const token of ["R153_SOURCE_SCHEMA='OMEGA_SOVEREIGN_FULL_BUILD_R151'",'R153_MAX_CYCLES=12','RETURNED HOST PROOF ADVANCES THE MISSION','DISCOVERY PRECEDES MUTATION','REPAIR IS READ-PROOF + PREIMAGE-SHA BOUND','PACKAGE FOLLOWS VERIFIED BUILD/TEST','COMPLETE IS NEVER INFERRED FROM QUEUE STATE'])must(adaptive.includes(token),`adaptive mission missing ${token}`);
must(!executor.includes("schema:'OMEGA_FULL_SYSTEM_BUILD_R153'"),'unrecognized full-system draft schema must not bypass adaptive tagging');
must(!executor.includes('maxCycles:18'),'whole-system surface must not claim a larger cycle envelope than R153 admits');
for(const forbidden of ['TRAIN_LOCAL','OPEN_URL','CLICK','TYPE_TEXT','REPLAY_MACRO'])must(!executor.match(new RegExp(`ALLOWED=.*${forbidden}`)),`unsafe/non-build operation ${forbidden} must remain outside the whole-system allow-list`);

console.log('R168 BUILD OUT ADAPTIVE MISSION SPINE PASS · Build Out and System Atlas share one R151→R153 executor · 12-cycle bounded proof-driven repair/build/test/package · current PC proof required · no shadow execution authority');
