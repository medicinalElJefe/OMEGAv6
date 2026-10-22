import assert from 'node:assert/strict';
import fs from 'node:fs';

const must=(value,message)=>assert.ok(value,'R151 '+message);
const source=fs.readFileSync('src/SovereignConnectionR117.tsx','utf8');
const css=fs.readFileSync('src/sovereignConnectionR112.css','utf8');
const runtime=fs.readFileSync('src/hybridCommandRuntime.ts','utf8');
const closure=fs.readFileSync('src/HybridProofClosureR141.tsx','utf8');

for(const token of [
  "R151_EXECUTION_SPINE='CURRENT HEARTBEAT -> INDEX -> HASH_TREE -> PROOF-CONDITIONED REPAIR -> BUILD -> TEST -> PACKAGE -> R141 CLOSURE'",
  "defaultCommandPlan('BUILD','AUTO_BUILD',buildRoot)",
  'validateCommandPlan(initial,buildRoot,[])',
  "api.post<any>('/api/missions'",
  'targetDeviceId:activeDevice.id',
  'confirmedMission:true',
  "if(!mission?.id)throw new Error('The Worker did not return a durable mission identity. Nothing is treated as queued.')",
  'RUN FULL SOVEREIGN BUILD',
  'R141/R142 below remains the authority for returned/verified execution truth.',
  "api.post<any>(`/api/missions/${encodeURIComponent(buildMission.id)}/${action}`,{})"
]) must(source.includes(token),'connected execution surface missing '+token);

must(source.includes("if(!online||!activeDevice){setBuildError('A current authenticated PC heartbeat is required before any build mission can queue.')"),'mission admission must require current authenticated device proof');
must(source.includes("const broadRoot=buildRoot==='.'"),'broad-root discovery branch must remain explicit');
must(source.includes('First inventory the approved root and hash candidate project trees.'),'broad-root mission must discover before mutation');
must(source.includes('preimage-bound patches'),'repair must remain evidence/preimage bound');
must(source.includes('never use C: as OMEGA runtime state'),'C drive runtime prohibition must remain in the build objective');
must(source.includes('never claim execution without the paired host return packet'),'host return must remain execution truth boundary');
must(!source.includes('omega:hybrid:workload:v2'),'R151 connected execution must not regress to donor localStorage workload simulation');

const allowBlock=(source.match(/const FULL_BUILD_ALLOWED_OPS=\[([^\]]+)\]/)||[])[1]||'';
for(const op of ['INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT'])must(allowBlock.includes(`'${op}'`),'full-build allow-list missing '+op);
for(const forbidden of ['TRAIN_LOCAL','OPEN_URL','CLICK','TYPE_TEXT','REPLAY_MACRO'])must(!allowBlock.includes(`'${forbidden}'`),'full-build allow-list must exclude '+forbidden);

must(runtime.includes("case'BUILD':return path==='.'?[{id:'S01',op:'INDEX'"),'existing BUILD plan must still use INDEX first at broad root');
must(runtime.includes("{id:'S02',op:'HASH_TREE'"),'existing BUILD plan must still hash candidate roots before mission continuation');
for(const token of ['R141 remains the exact-payload Hybrid proof authority','RETURNED is not VERIFIED','No returned bounded workload is available yet.'])must(closure.includes(token),'R141 proof truth boundary regressed: '+token);

for(const token of ['.r151-build-spine','.r151-build-facts','.r151-build-actions','@media(max-width:560px)'])must(css.includes(token),'responsive R151 surface missing '+token);

console.log('R151 SOVEREIGN BUILD EXECUTION SPINE PASS · current heartbeat gates durable mission admission · broad root discovers/hashes before mutation · build/test/package repair envelope excludes training and UI automation · only returned R141/R142 proof closes execution truth');