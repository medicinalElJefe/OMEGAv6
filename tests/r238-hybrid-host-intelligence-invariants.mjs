import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const wrapper=read('public/omega-hybrid-agent-r141.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const ui=read('src/HybridHostIntelligenceR238.tsx');
const link=read('src/HybridLinkR32.tsx');

for(const token of [
 "HOST_INTELLIGENCE_EXTENSION='R238'",
 "HOST_PROFILE_SCHEMA='OMEGA_HYBRID_HOST_PROFILE_R238'",
 "MACRO_INVENTORY_SCHEMA='OMEGA_LOCAL_MACRO_INVENTORY_R238'",
 "MACRO_PREFLIGHT_SCHEMA='OMEGA_MACRO_PREFLIGHT_R238'",
 "EXPECTED_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'",
 "SERVER_VALIDATOR_COMPATIBILITY_R207_1=\"BASE_PATH='/omega-hybrid-agent.py'\"",
 "FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'"
])must(wrapper.includes(token),`R238 wrapper missing preserved/proof token ${token}`);

must(wrapper.includes("op=='DESKTOP_HEALTH'")&&wrapper.includes("result['hostProfileR238']=host_profile")&&wrapper.includes("result['macroInventoryR238']=macro_inventory"),'R238 must enrich the existing DESKTOP_HEALTH returned proof instead of creating an ungoverned telemetry channel');
must(wrapper.includes("op=='REPLAY_MACRO'")&&wrapper.includes('verify_macro_replay')&&wrapper.includes("requested window title does not exactly match the recorded lock"),'R238 macro replay must preflight stored schema/hash/bounds/window lock');
must(wrapper.includes("e.get('type') not in {'MOVE','CLICK','KEY_RAW'}")&&wrapper.includes('MAX_MACRO_EVENTS_R238=5000'),'R238 macro verification must remain allow-listed and bounded');
must(wrapper.includes("'contentsReturned':False")&&wrapper.includes('macro event contents are not uploaded'),'R238 macro inventory must not upload recorded event contents');
must(wrapper.includes("subprocess.run([exe,'--query-gpu=name,memory.total,driver_version','--format=csv,noheader,nounits']")&&wrapper.includes('shell=False'),'GPU discovery must use a fixed read-only command with shell disabled');
must(wrapper.includes('GlobalMemoryStatusEx')&&wrapper.includes('Get-CimInstance Win32_Processor'),'CPU/RAM proof must be host-observed, not screenshot constants');
must(wrapper.includes("importlib.util.find_spec('grcwa')")&&wrapper.includes('does not auto-install dependencies'),'RCWA dependency truth must be observed from the exact agent Python environment and must not install anything');
must(!/pip\s+install|python\s+-m\s+pip|conda\s+install/i.test(wrapper),'R238 must not introduce dependency installation');
must(!wrapper.includes('shell=True'),'R238 must not introduce arbitrary shell execution');
for(const hardwareLiteral of ['Ryzen 7 3700X','RTX 2070 SUPER','32.0 GB','19045.6456'])must(!wrapper.includes(hardwareLiteral)&&!ui.includes(hardwareLiteral),`R238 must not hard-code screenshot hardware literal ${hardwareLiteral}`);

must(base.includes("CAPABILITY_REVISION='R132'")&&base.includes("R205_PROOF_EXTENSION='R205'")&&base.includes('shell=False'),'immutable R205 executor authority must remain unchanged and root-confined');
must(wrapper.includes('base_execute=base.execute_job')&&wrapper.includes('base.execute_job=execute_job_r141'),'R238 must remain a wrapper over the established executor');
must(wrapper.includes("'stepProofs'")&&wrapper.includes("'resultFingerprintR141':digest"),'R238 host facts must stay inside R141 exact returned step proof continuity');

for(const token of ["api.get<any>('/api/hybrid/status')","String(s?.op||'').toUpperCase()==='DESKTOP_HEALTH'",'s?.result?.hostProfileR238','RETURNED_HOST_PROOF','RCWA PYTHON DEPENDENCY','LOCAL MACRO STORE','Hardware presence does not prove CUDA runtime'])must(ui.includes(token),`R238 Hybrid UI missing truth-bound token ${token}`);
must(ui.includes('Run “Prove host + tree”')&&ui.includes('R141 exact return closure'),'R238 UI must direct resource proof through the existing R237/R141 path');
must(link.includes("import HybridHostIntelligenceR238 from './HybridHostIntelligenceR238'")&&link.includes('<HybridHostIntelligenceR238/>'),'Hybrid Link must mount the R238 host intelligence surface');
must(link.indexOf('<SovereignConnectionR117/>')<link.indexOf('<HybridHostIntelligenceR238/>')&&link.indexOf('<HybridHostIntelligenceR238/>')<link.indexOf('<HybridCommandDeckR237/>'),'R238 resource truth must appear after connection proof and before native command admission');

console.log('OMEGA R238 HYBRID HOST INTELLIGENCE PASS · immutable R205 executor preserved · R141 exact-return proof preserved · no screenshot constants · bounded CPU/RAM/GPU/storage/Python/RCWA evidence · no dependency installation · macro metadata-only inventory + schema/hash/event/window-lock preflight · Hybrid UI mounted on existing R237 command path');
