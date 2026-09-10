import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const wrapper=read('public/omega-hybrid-agent-r141.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const ui=read('src/HybridHostIntelligenceR238.tsx');
const link=read('src/HybridLinkR32.tsx');
const app=read('src/App.tsx');
const snapshot=read('src/HybridRuntimeSnapshotR238.tsx');
const workflow=read('.github/workflows/r238-hybrid-host-intelligence-proof.yml');
const windowsProof=read('tests/r238-windows-host-runtime-proof.py');
const browserProof=read('tests/r238-host-intelligence-browser-e2e.mjs');
const liveVerifier=read('scripts/verify_live_hybrid_host_intelligence_r238.mjs');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');

for(const token of ["HOST_INTELLIGENCE_EXTENSION='R238'","BRIDGE_CALCULUS_EXTENSION='R240'","HOST_PROFILE_SCHEMA='OMEGA_HYBRID_HOST_PROFILE_R238'","MACRO_INVENTORY_SCHEMA='OMEGA_LOCAL_MACRO_INVENTORY_R238'","MACRO_PREFLIGHT_SCHEMA='OMEGA_MACRO_PREFLIGHT_R238'","EXPECTED_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'","SERVER_VALIDATOR_COMPATIBILITY_R207_1=\"BASE_PATH='/omega-hybrid-agent.py'\"","FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'"])must(wrapper.includes(token),`R238/R240 wrapper missing preserved/proof token ${token}`);
must(liveVerifier.includes("fetch(base+'/omega-hybrid-agent-r141.py'"),'R238 live verifier must inspect the R141/R238/R240 proof wrapper');
must(!liveVerifier.includes("fetch(base+'/omega-hybrid-agent.py'"),'R238 live verifier must not require proof-wrapper tokens from the older canonical R207 download asset');
for(const token of ["HOST_INTELLIGENCE_EXTENSION='R238'","BRIDGE_CALCULUS_EXTENSION='R240'","HOST_PROFILE_SCHEMA='OMEGA_HYBRID_HOST_PROFILE_R238'","MACRO_PREFLIGHT_SCHEMA='OMEGA_MACRO_PREFLIGHT_R238'"])must(liveVerifier.includes(token),`R238/R240 live verifier missing wrapper token ${token}`);
must(liveVerifier.includes("readFileSync('public/omega-hybrid-agent-r141.py','utf8')")&&liveVerifier.includes('wrapper!==expectedWrapper'),'R239.1/R240 must byte-bind the live R141 wrapper to repository source');
must(liveVerifier.includes("readFileSync('public/omega-hybrid-agent-base-r205.py','utf8')")&&liveVerifier.includes('baseAgent!==expectedBase'),'R239.1/R240 must byte-bind the live immutable R205 base to repository source');
for(const token of ["RETURNED_HOST_PROOF","AWAITING_RETURNED_PROFILE","intelligenceState==='RETURNED_HOST_PROOF'","R141 exact return closure","Proof source: selected authenticated Hybrid device","NOT YET RETURNED",'data-r238-snapshot-epoch','R141 exact-payload fingerprint','Run “Prove host + tree”'])must(liveVerifier.includes(token),`R239.3/R240 live verifier missing conditional host-proof truth token ${token}`);
must(liveVerifier.includes("intelligenceState!=='AWAITING_RETURNED_PROFILE'"),'R239.3/R240 no-device live state must require awaiting-returned-profile rather than returned proof');
must(liveVerifier.includes("text.includes('Proof source: selected authenticated Hybrid device')||text.includes('R141 exact return closure')"),'R239.3/R240 awaiting state must reject returned-proof provenance and exact-return closure claims');
const returnedBranch=liveVerifier.indexOf("if(intelligenceState==='RETURNED_HOST_PROOF'){");
const closureCheck=liveVerifier.indexOf("'R141 exact return closure'",returnedBranch);
const awaitingElse=liveVerifier.indexOf("}else{",returnedBranch);
must(returnedBranch>=0&&closureCheck>returnedBranch&&awaitingElse>closureCheck,'R239.3/R240 R141 returned-proof footer check must remain scoped inside RETURNED_HOST_PROOF before the awaiting branch');
must(liveVerifier.includes("if(!Number.isFinite(epoch)||epoch<1)throw new Error"),'R240 live host-intelligence verifier must require a completed shared snapshot epoch');

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
must(!wrapper.includes('shell=True'),'R238/R240 wrapper must not introduce arbitrary shell execution');
for(const hardwareLiteral of ['Ryzen 7 3700X','RTX 2070 SUPER','32.0 GB','19045.6456'])must(!wrapper.includes(hardwareLiteral)&&!ui.includes(hardwareLiteral),`R238 must not hard-code screenshot hardware literal ${hardwareLiteral}`);

must(base.includes("CAPABILITY_REVISION='R132'")&&base.includes("R205_PROOF_EXTENSION='R205'")&&base.includes('shell=False'),'immutable R205 executor authority must remain unchanged and root-confined');
must(wrapper.includes('base_execute=base.execute_job')&&wrapper.includes('base.execute_job=execute_job_r141'),'R238/R240 must remain a wrapper over the established executor');
must(wrapper.includes("'stepProofs'")&&wrapper.includes("'resultFingerprintR141':digest"),'R238 host facts and R240 bridge return carry must stay inside R141 exact returned step-proof continuity');
must(wrapper.includes('bridge_by_step=validate_bridge_calculus_r240(job)')&&wrapper.includes("proof['calculusBridgeR240Return']=returned"),'R240 bridge calculus must validate before execution and enter returned step proof before R141 hashing');

for(const token of ['useHybridRuntimeSnapshotR238','selectedDeviceJobs','selectedDeviceId',"String(s?.op||'').toUpperCase()==='DESKTOP_HEALTH'",'s?.result?.hostProfileR238','RETURNED_HOST_PROOF','RCWA PYTHON DEPENDENCY','LOCAL MACRO STORE','Hardware presence does not prove CUDA runtime','data-r238-selected-device','data-r238-snapshot-epoch','Refresh shared snapshot','physicalCores','gpuAdapters','nvidiaSmi'])must(ui.includes(token),`R238 Hybrid UI missing truth-bound/shared-frame token ${token}`);
must(!ui.includes("api.get<any>('/api/hybrid/status')")&&!ui.includes('setInterval(()=>void refresh(),2500)'),'R238 host intelligence must consume the shared polling reality');
must(ui.includes('Run “Prove host + tree”')&&ui.includes('R141 exact return closure'),'R238 UI must direct returned resource proof through the existing R237/R141 path');
must(ui.includes("data-r238-host-intelligence={p?'RETURNED_HOST_PROOF':'AWAITING_RETURNED_PROFILE'}"),'R239.3 UI truth identity must distinguish returned proof from awaiting proof');
must(ui.includes('{proof&&<footer>'),'R239.3 R141 returned-proof footer must remain conditional on an actual returned proof');
for(const token of ["Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')])",'omega:hybrid:selectedDeviceId','selectedDeviceJobs'])must(snapshot.includes(token),`R238 shared snapshot prerequisite missing ${token}`);
must(link.includes("import HybridHostIntelligenceR238 from './HybridHostIntelligenceR238'")&&link.includes('<HybridHostIntelligenceR238/>'),'Hybrid Link must mount the R238 host intelligence surface');
must(app.includes("import {HybridRuntimeSnapshotProviderR238} from './HybridRuntimeSnapshotR238'")&&app.includes('<HybridRuntimeSnapshotProviderR238><OmegaWorkstation/></HybridRuntimeSnapshotProviderR238>'),'R270 host intelligence must live beneath the sole workstation-scoped R238 provider');
must(!link.includes('<HybridRuntimeSnapshotProviderR238>'),'R270 Hybrid Link must not mount a second R238 provider');
must(link.indexOf('<SovereignConnectionR117/>')<link.indexOf('<HybridHostIntelligenceR238/>')&&link.indexOf('<HybridHostIntelligenceR238/>')<link.indexOf('<HybridCommandDeckR237/>'),'R238 resource truth must appear after connection proof and before native command admission');

must(workflow.includes('actions/checkout@v7')&&workflow.includes('actions/setup-node@v7'),'R238 proof workflow must preserve the R221.1 Node-24-capable v7 Actions hygiene floor');
must(!workflow.includes('actions/checkout@v4')&&!workflow.includes('actions/setup-node@v4'),'R238 proof workflow must not regress to the old v4 checkout/setup-node generation');
must(workflow.includes('windows-host-runtime-proof:')&&workflow.includes('runs-on: windows-latest')&&workflow.includes('python tests/r238-windows-host-runtime-proof.py'),'R238 must execute Windows-specific host telemetry on an actual Windows CI runner');
must(workflow.includes('playwright@1.63.0')&&workflow.includes('tests/r238-host-intelligence-browser-e2e.mjs'),'R238 must execute a focused built-browser proof for selected-host isolation');
for(const token of ["memory.get('totalBytes')","memory.get('availableBytes')",'logicalProcessors','profileSha256','verify_macro_replay','tampered macro hash was not rejected'])must(windowsProof.includes(token),`R238 Windows runtime proof missing ${token}`);
for(const token of ['CPU-A-ONLY','CPU-B-ONLY','proof_job_a','proof_job_b','Authenticated compute host','data-r238-selected-device','leaked host A proof','leaked host B proof'])must(browserProof.includes(token),`R238 browser host-isolation proof missing ${token}`);

console.log('OMEGA R238/R239.1/R239.3/R240/R270 HYBRID HOST INTELLIGENCE PASS · immutable R205 SHA preserved · one workstation-scoped R238 provider · R141 exact-return proof + R240 bridge calculus preserved · no duplicate polling · returned host evidence remains selected-device/epoch bound');
