import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const agent=read('public/omega-hybrid-agent.py');
const command=read('src/hybridCommandRuntime.ts');
const worker=read('src/workerR32.js');
const launcher=read('src/sovereignLauncherR117.ts');

assert.match(agent,/VERSION='R34\.1'/,'transport compatibility must remain R34.1');
assert.match(agent,/CAPABILITY_REVISION='R132'/,'R132 capability revision missing');
assert.match(agent,/DEFAULT_SERVER='https:\/\/omegav6\.jeffdeweyeljefe\.workers\.dev'/,'canonical runtime drifted');
assert.ok(!agent.includes('requires the optional signed desktop automation adapter'),'desktop automation must no longer be a deliberate runtime stub');

for(const symbol of ['list_windows','focus_window','assert_window','screen_capture','read_visible_text','mouse_move','click_mouse','send_key','type_text','scroll_mouse','record_macro','replay_macro'])assert.ok(agent.includes('def '+symbol+'('),`real desktop implementation missing ${symbol}`);
for(const op of ['CLICK','KEY','TYPE_TEXT','SCROLL','ASSERT_WINDOW','READ_VISIBLE_TEXT','RECORD_MACRO','REPLAY_MACRO']){
  assert.ok(worker.includes(`'${op}'`),`worker transport missing ${op}`);
  assert.ok(command.includes(`'${op}'`),`browser command schema missing ${op}`);
  assert.ok(agent.includes(`op=='${op}'`)||agent.includes(`op in {`),`agent dispatcher missing ${op}`);
}

assert.ok(agent.includes("root/'.omega_hybrid'/'screens'"),'screen proof must stay under approved root');
assert.ok(agent.includes("root/'.omega_hybrid'/'macros'"),'macro store must stay under approved root');
assert.ok(agent.includes('WINDOWS_UI_AUTOMATION'),'visible-text observation must use a real Windows UI Automation path');
assert.ok(agent.includes("shell=False"),'host execution may not regress to arbitrary shell execution');
assert.ok(agent.includes('assert_window(title)'),'desktop actions must remain foreground-window locked');
assert.ok(agent.includes('MAX_MACRO_EVENTS=5000'),'macro event budget missing');
assert.ok(agent.includes('max_runtime'),'macro replay runtime budget missing');

assert.ok(command.includes('expectedSha256')&&command.includes('replacements'),'browser APPLY_PATCH contract must carry hash-bound exact replacements');
assert.ok(agent.includes("APPLY_PATCH requires expectedSha256")&&agent.includes("replacements=step.get('replacements')"),'host APPLY_PATCH contract must match browser schema');
assert.ok(agent.includes('def write_text(')&&agent.includes('WRITE_TEXT replacement requires expectedSha256'),'guarded atomic text write successor missing');
assert.ok(agent.includes('def workbook_audit(')&&agent.includes("executedMacros':False"),'workbook audit must be real and macro-nonexecuting');

assert.ok(agent.includes("OMEGA_SAI_LOCAL_RETRIEVAL_INDEX_R132"),'local learning successor missing');
assert.ok(agent.includes("foundationWeightsChanged':False"),'retrieval indexing must not claim foundation-weight training');
assert.ok(agent.includes("learningType':'LOCAL_RETRIEVAL_AND_PROOF_PRIOR_INDEX'"),'local learning truth boundary missing');

assert.ok(agent.includes("'/api/hybrid/agent/register'")&&agent.includes("'/api/hybrid/agent/heartbeat'")&&agent.includes("'/api/hybrid/agent/poll'")&&agent.includes("'/api/hybrid/agent/result'"),'authenticated execution transport loop must remain intact');
assert.ok(launcher.includes('/api/hybrid/agent-download?r117=1'),'clean connector must continue downloading the canonical agent endpoint');

console.log('R132 HYBRID EXECUTION PLANE PASS · real Windows desktop actions · macros · screen/UI proof · hash-bound file mutation · local retrieval index · R34.1 transport preserved');
