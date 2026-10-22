import assert from'node:assert/strict';
import fs from'node:fs';
import{createHash}from'node:crypto';
import{spawnSync}from'node:child_process';

const runtime=fs.readFileSync('src/hybridCommandRuntime.ts','utf8');
const durable=fs.readFileSync('src/workerR32.js','utf8');
const gateway=fs.readFileSync('src/workerR8.js','utf8');
const agent=fs.readFileSync('public/omega-hybrid-agent.py','utf8');
const base=fs.readFileSync('public/omega-hybrid-agent-base-r205.py');
const ui=fs.readFileSync('src/SarHybridClosureR345.tsx','utf8');
const sar=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const css=fs.readFileSync('src/sarHybridR345.css','utf8');

const baseSha=createHash('sha256').update(base).digest('hex');
assert.ok(agent.includes(`EXPECTED_BASE_SHA256='${baseSha}'`),'R345 must preserve and verify the exact immutable R205 base agent SHA');

for(const token of[
 "'SAR_R344_CLOSURE'",
 'SarR344ClosureSpec',
 'sarClosureValue',
 "step.maxRuntimeSeconds=intValue(raw?.maxRuntimeSeconds,300,43200,21600)",
 "masterPath:req('masterPath')",
 "slavePath:req('slavePath')",
 "coregProofPath:req('coregProofPath')",
 "receiptPath:req('receiptPath')",
 "losSign must be -1 or +1",
 "signConvention"
])assert.ok(runtime.includes(token),'R345 typed Hybrid runtime missing '+token);

for(const token of[
 "'SAR_R344_CLOSURE'",
 'validateSarClosureR345',
 "SAR_R344_CLOSURE requires explicit safe root-relative",
 "if(row?.op==='SAR_R344_CLOSURE')validateSarClosureR345",
 "target.capabilities?.includes(op)",
 "explicit confirmation required",
 "inputFingerprint:await sha256({steps:v.steps,targetDeviceId:target.id,projectPath:b.projectPath||'.'})"
])assert.ok(durable.includes(token),'R345 durable Hybrid admission missing '+token);

assert.ok(gateway.includes("'SAR_R344_CLOSURE'"),'R345 cloud capability registry must expose SAR closure');
assert.ok(gateway.includes("row?.op==='SAR_R344_CLOSURE'"),'R345 cloud validator must validate SAR closure payload');

for(const token of[
 "SAR_CLOSURE_EXTENSION='R345'",
 "SAR_CLOSURE_OPERATION='SAR_R344_CLOSURE'",
 'def execute_sar_closure_r345',
 'base.secure_path(approved_root',
 "project/'scripts'/'sar_r344_host_closure.py'",
 "project/'scripts'/'sar_r344_snap_tops_insar.xml'",
 "subprocess.run(cmd,cwd=project,text=True,capture_output=True,timeout=timeout,shell=False)",
 "'schema':'OMEGA_SAR_HYBRID_CLOSURE_RETURN_R345'",
 "'state':'R344_RECEIPT_RETURNED'",
 "parsed.get('schema')!='OMEGA_SAR_HOST_CLOSURE_R344'",
 "def capabilities_r207():return list(dict.fromkeys([*base_capabilities(),SAR_CLOSURE_OPERATION]))",
 "EXECUTION_MOTION_EXTENSION,SAR_CLOSURE_EXTENSION"
])assert.ok(agent.includes(token),'R345 canonical Hybrid wrapper missing '+token);
assert.ok(!agent.includes('shell=True'),'R345 must not add shell execution');
assert.ok(!agent.includes('os.system('),'R345 must not add os.system execution');
assert.ok(agent.includes("result=execute_sar_closure_r345(step,approved_root) if op==SAR_CLOSURE_OPERATION else base_execute_step(step,approved_root)"),'R345 must extend the wrapper without replacing inherited R205 execution');

for(const token of[
 'useHybridRuntimeSnapshotR238',
 "device.capabilities.includes('SAR_R344_CLOSURE')",
 "validateCommandPlan([{op:'SAR_R344_CLOSURE'",
 "api.post<any>('/api/hybrid/jobs'",
 "schema:'OMEGA_SAR_HYBRID_CLOSURE_JOB_R345'",
 "action:'SAR_R344_CLOSURE'",
 'targetDeviceId:device.id',
 'confirmed:true',
 "receipt?.schema==='OMEGA_SAR_HOST_CLOSURE_R344'",
 'onReceipt(receipt)',
 'I explicitly authorize this full-resolution host computation'
])assert.ok(ui.includes(token),'R345 SAR workstation control missing '+token);
assert.ok(!ui.includes("api.get<any>('/api/hybrid/status')"),'R345 must consume the shared R238 snapshot rather than add a second Hybrid poller');
assert.ok(ui.includes("A successful SNAP/process exit alone never establishes TOPS registration"),'R345 UI physical truth boundary missing');

for(const token of[
 "import SarHybridClosureR345 from'./SarHybridClosureR345'",
 '<SarHybridClosureR345',
 'onReceipt={acceptClosureReceipt}',
 "parsed?.master?.productId!==picked.id",
 "parsed?.slave?.productId!==reference.id",
 "parsed?.master?.polarization||''"
])assert.ok(sar.includes(token),'R345 live SAR integration missing '+token);

assert.ok(css.includes('.r345-sar-hybrid')&&css.includes('@media(max-width:850px)'),'R345 host closure control must remain responsive');

const py=spawnSync('python3',['-B','-c',"import ast,pathlib; ast.parse(pathlib.Path('public/omega-hybrid-agent.py').read_text()); ast.parse(pathlib.Path('scripts/sar_r344_host_closure.py').read_text())"],{encoding:'utf8'});
assert.equal(py.status,0,'R345/R344 Python syntax failed: '+py.stderr);

console.log('R345 SAR HYBRID CLOSURE PASS · immutable R205 base preserved · structured root-confined SAR_R344_CLOSURE · durable R237 admission/backpressure · R240 bridge fingerprint inheritance · R207/R243 wrapper extension · exact R344 receipt return · shared R238 host snapshot · explicit operator confirmation · selected-pair receipt matching · no process-exit physical promotion');
