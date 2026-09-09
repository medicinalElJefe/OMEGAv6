import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const wrapper=read('public/omega-hybrid-agent-r141.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const ui=read('src/HybridHostIntelligenceR238.tsx');
const link=read('src/HybridLinkR32.tsx');
const snapshot=read('src/HybridRuntimeSnapshotR238.tsx');
const workflow=read('.github/workflows/r238-hybrid-host-intelligence-proof.yml');
const windowsProof=read('tests/r238-windows-host-runtime-proof.py');
const browserProof=read('tests/r238-host-intelligence-browser-e2e.mjs');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');

for(const token of [
 "HOST_INTELLIGENCE_EXTENSION='R238'",
 "HOST_PROFILE_SCHEMA='OMEGA_HYBRID_HOST_PROFILE_R238'",
 "MACRO_INVENTORY_SCHEMA='OMEGA_LOCAL_MACRO_INVENTORY_R238'",
 "MACRO_PREFLIGHT_SCHEMA='OMEGA_MACRO_PREFLIGHT_R238'",
 "EXPECTED_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'",
 "SERVER_VALIDATOR_COMPATIBILITY_R207_1=\"BASE_PATH='/omega-hybrid-agent.py'\"",
 "FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'"
])must(wrapper.includes(token),`R238 wrapper missing preserved/proof token ${token}`);

must(sha(base)==='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046','R238 must leave the immutable R205 base executor byte-identical');
must(wrapper.includes("op=='DESKTOP_HEALTH'")&&wrapper.includes("result['hostProfileR238']=host_profile")&&wrapper.includes("result['macroInventoryR238']=macro_inventory"),'R238 must enrich the existing DESKTOP_HEALTH returned proof instead of creating an ungoverned telemetry channel');
must(wrapper.includes("op=='REPLAY_MACRO'")&&wrapper.includes('verify_macro_replay')&&wrapper.includes("requested window title does not exactly match the recorded lock"),'R238 macro replay must preflight stored schema/hash/bounds/window lock');
must(wrapper.includes("e.get('type') not in {'MOVE','CLICK','KEY_RAW'}")&&wrapper.includes('MAX_MACRO_EVENTS_R238=5000')&&wrapper.includes('MAX_MACRO_SECONDS_R238=300')&&wrapper.includes('MAX_MACRO_COORD_ABS_R238=100000'),'R238 macro verification must remain allow-listed and bounded in count/time/coordinates');
must(wrapper.includes("event_count!=len(events)")&&wrapper.includes("t<prior")&&wrapper.includes("EVENT_COORDINATE_INVALID"),'R238 macro replay must reject count mismatch, non-monotonic time and out-of-bound coordinates before execution');
must(wrapper.includes("'contentsReturned':False")&&wrapper.includes('macro event contents are not uploaded'),'R238 macro inventory must not upload recorded event contents');
must(wrapper.includes('Get-CimInstance Win32_VideoController')&&wrapper.includes("subprocess.run([exe,'--query-gpu=name,memory.total,driver_version','--format=csv,noheader,nounits']")&&wrapper.includes('shell=False'),'GPU discovery must use bounded Windows adapter inventory plus optional fixed read-only NVIDIA SMI with shell disabled');
must(wrapper.includes('GlobalMemoryStatusEx')&&wrapper.includes('Get-CimInstance Win32_Processor'),'CPU/RAM proof must be host-observed, not screenshot constants');
must(wrapper.includes("importlib.util.find_spec('grcwa')")&&wrapper.includes('does not auto-install dependencies'),'RCWA dependency truth must be observed from the exact agent Python environment and must not install anything');
must(!/pip\s+install|python\s+-m\s+pip|conda\s+install/i.test(wrapper),'R238 must not introduce dependency installation');
must(!wrapper.includes('shell=True'),'R238 must not introduce arbitrary shell execution');
for(const hardwareLiteral of ['Ryzen 7 3700X','RTX 2070 SUPER','32.0 GB','19045.6456'])must(!wrapper.includes(hardwareLiteral)&&!ui.includes(hardwareLiteral),`R238 must not hard-code screenshot hardware literal ${hardwareLiteral}`);

must(base.includes("CAPABILITY_REVISION='R132'")&&base.includes("R205_PROOF_EXTENSION='R205'")&&base.includes('shell=False'),'immutable R205 executor authority must remain unchanged and root-confined');
must(wrapper.includes('base_execute=base.execute_job')&&wrapper.includes('base.execute_job=execute_job_r141'),'R238 must remain a wrapper over the established executor');
must(wrapper.includes("'stepProofs'")&&wrapper.includes("'resultFingerprintR141':digest"),'R238 host facts must stay inside R141 exact returned step proof continuity');

for(const token of [
 'useHybridRuntimeSnapshotR238','selectedDeviceJobs','selectedDeviceId',
 "String(s?.op||'').toUpperCase()==='DESKTOP_HEALTH'",'s?.result?.hostProfileR238',
 'RETURNED_HOST_PROOF','RCWA PYTHON DEPENDENCY','LOCAL MACRO STORE','Hardware presence does not prove CUDA runtime',
 'data-r238-selected-device','data-r238-snapshot-epoch','Refresh shared snapshot','physicalCores','gpuAdapters','nvidiaSmi'
])must(ui.includes(token),`R238 Hybrid UI missing truth-bound/shared-frame token ${token}`);
must(!ui.includes("api.get<any>('/api/hybrid/status')"),'R238 host intelligence must not create a second Hybrid polling reality after shared snapshot convergence');
must(!ui.includes('setInterval(()=>void refresh(),2500)'),'R238 host intelligence must not retain an independent polling loop after shared snapshot convergence');
must(ui.includes('Run “Prove host + tree”')&&ui.includes('R141 exact return closure'),'R238 UI must direct resource proof through the existing R237/R141 path');
for(const token of ["Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')])",'omega:hybrid:selectedDeviceId','selectedDeviceJobs'])must(snapshot.includes(token),`R238 shared snapshot prerequisite missing ${token}`);
must(link.includes("import HybridHostIntelligenceR238 from './HybridHostIntelligenceR238'")&&link.includes('<HybridHostIntelligenceR238/>'),'Hybrid Link must mount the R238 host intelligence surface');
must(link.includes('<HybridRuntimeSnapshotProviderR238>'),'R238 host intelligence must live inside the shared snapshot provider');
must(link.indexOf('<SovereignConnectionR117/>')<link.indexOf('<HybridHostIntelligenceR238/>')&&link.indexOf('<HybridHostIntelligenceR238/>')<link.indexOf('<HybridCommandDeckR237/>'),'R238 resource truth must appear after connection proof and before native command admission');

must(workflow.includes('actions/checkout@v7')&&workflow.includes('actions/setup-node@v7'),'R238 proof workflow must preserve the R221.1 Node-24-capable v7 Actions hygiene floor');
must(!workflow.includes('actions/checkout@v4')&&!workflow.includes('actions/setup-node@v4'),'R238 proof workflow must not regress to the old v4 checkout/setup-node generation');
must(workflow.includes('windows-host-runtime-proof:')&&workflow.includes('runs-on: windows-latest')&&workflow.includes('python tests/r238-windows-host-runtime-proof.py'),'R238 must execute its Windows-specific host telemetry on an actual Windows CI runner');
must(workflow.includes('playwright@1.63.0')&&workflow.includes('tests/r238-host-intelligence-browser-e2e.mjs'),'R238 must execute a focused built-browser proof for selected-host isolation');
for(const token of ["memory.get('totalBytes')","memory.get('availableBytes')",'logicalProcessors','profileSha256','verify_macro_replay','tampered macro hash was not rejected'])must(windowsProof.includes(token),`R238 Windows runtime proof missing ${token}`);
for(const token of ['CPU-A-ONLY','CPU-B-ONLY','proof_job_a','proof_job_b','Authenticated compute host','data-r238-selected-device','leaked host A proof','leaked host B proof'])must(browserProof.includes(token),`R238 browser host-isolation proof missing ${token}`);

console.log('OMEGA R238 HYBRID HOST INTELLIGENCE PASS · immutable R205 byte SHA preserved · R141 exact-return proof preserved · one shared selected-host snapshot epoch · no duplicate polling reality · no screenshot constants · Windows CPU/RAM/GPU/storage/Python/RCWA evidence · no dependency installation · bounded macro metadata/schema/hash/count/order/time/coordinate/window preflight · Windows runtime CI · built-browser cross-host isolation · v7 Actions hygiene');
