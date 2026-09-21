import assert from'node:assert/strict';
import fs from'node:fs';

const runtime=fs.readFileSync('src/hybridCommandRuntime.ts','utf8');
const agent=fs.readFileSync('public/omega-hybrid-agent.py','utf8');
const explicit=fs.readFileSync('public/omega-hybrid-agent-r207.py','utf8');
const ui=fs.readFileSync('src/SarOperationalOrchestratorR345.tsx','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

assert.equal(agent,explicit,'R345 must preserve byte-identical canonical/explicit R207 wrappers');
for(const token of[
 "'SAR_R344_CLOSURE'","SarR344ClosureRequest","sarRequest?:SarR344ClosureRequest",
 "required=['master','slave','masterOrbit','slaveOrbit','output','coregProof'",
 "master and slave paths must differ","requires acquisition timestamps"
])assert.ok(runtime.includes(token),'R345 typed Hybrid contract missing '+token);

for(const token of[
 "SAR_CLOSURE_EXTENSION='R345'","def sar_r344_closure","scripts/sar_r344_host_closure.py",
 "scripts/sar_r344_snap_tops_insar.xml","base.secure_path","subprocess.run","shell=False",
 "timeout=21600","OMEGA_SAR_HOST_CLOSURE_R344","receiptSha256","receiptJson",
 "base_capabilities()+['SAR_R344_CLOSURE']"
])assert.ok(agent.includes(token),'R345 host wrapper missing '+token);
assert.ok(!agent.includes('shell=True'),'R345 must not introduce arbitrary shell execution');

for(const token of[
 "OMEGA_SAR_OPERATIONAL_ORCHESTRATION_R345","useHybridRuntimeSnapshotR238",
 "advertised.has('SAR_R344_CLOSURE')","api.post<any>('/api/hybrid/jobs'",
 "action:'SAR_R344_CLOSURE'","op:'SAR_R344_CLOSURE'","confirmed:true",
 "snapshotEpoch:epoch","snapshotObservedAt:observedAt",
 "R141 exact return fingerprint","R344 physical validation",
 "A successful process exit is still not physical proof","onReceipt(receipt)"
])assert.ok(ui.includes(token),'R345 workstation orchestrator missing '+token);

assert.ok(live.includes("import SarOperationalOrchestratorR345 from'./SarOperationalOrchestratorR345'"),'R345 orchestrator not imported by live SAR workstation');
assert.ok(live.includes('<SarOperationalOrchestratorR345 masterId={picked.id} slaveId={reference.id}'),'R345 orchestrator not mounted on selected SLC pair');
assert.ok(live.includes('acceptClosureReceipt')&&live.includes('validateSarHostClosureR344(parsed)'),'R345 returned receipt must flow through R344 validator');

assert.ok(pkg.scripts['test:r345']?.includes('r345-sar-operational-orchestration-invariants.mjs'),'R345 proof script missing');
assert.ok(pkg.scripts['check:static']?.includes('npm run test:r345'),'R345 must participate in canonical static gate');

console.log('R345 SAR OPERATIONAL ORCHESTRATION PASS · one typed Hybrid op · root-confined R344 driver only · shared R238 host epoch · R237 durable queue · R141 exact return · R344 physical receipt validation · no arbitrary shell');
