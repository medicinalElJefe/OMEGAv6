import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R153_FAMILY_SUCCESSOR,R153_FULL_SYSTEM_CONTRACT,R153_COMPLETION_STAGES,buildFullSystemMissionObjectiveR153} from '../src/fullSystemCompletionR153.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(value,message)=>assert.ok(value,'R153 '+message);
const active=new Set(['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE']);
const gated=new Set(['EVIDENCE_GATED','DEVICE_GATED']);

const familyEntries=Object.entries(R153_FAMILY_SUCCESSOR);
must(familyEntries.length===24,'must account for exactly 24 current successor families');
must(familyEntries.filter(([,v])=>active.has(v)).length===19,'must expose exactly 19 implemented web/source/local successors');
must(familyEntries.filter(([,v])=>gated.has(v)).length===5,'must expose exactly 5 explicit evidence/device gates');
must(!familyEntries.some(([,v])=>['DONOR_ONLY','NATIVE_TARGET','RESTORATION_DEBT'].includes(v)),'current successor reality may not retain stale donor/target/debt labels');
must(R153_COMPLETION_STAGES.length===12&&new Set(R153_COMPLETION_STAGES.map(x=>x.menu)).size===12,'must bind exactly 12 one-system completion stages/master menus');
for(const [key,value] of Object.entries({systems:100,families:24,masterMenus:12,menuOptions:36,capabilities:18,routes:44,sourceModes:179,canonLenses:62,packetStates:20736,logicalCells:1728,logicalLanes:20736,addressCapacity:61917364224}))must(R153_FULL_SYSTEM_CONTRACT.inventory[key]===value,`inventory ${key} must equal ${value}`);
must(R153_FULL_SYSTEM_CONTRACT.successor.implemented===19&&R153_FULL_SYSTEM_CONTRACT.successor.truthGated===5&&R153_FULL_SYSTEM_CONTRACT.successor.restorationDebt===0,'completion totals must be 19 implemented / 5 truth-gated / 0 successor debt');
must(R153_FULL_SYSTEM_CONTRACT.nativeRootPolicy.includes('J:\\ is the preferred established root'),'contract missing preferred established J:\\ root');
must(R153_FULL_SYSTEM_CONTRACT.nativeRootPolicy.includes('Never silently fall back to C:\\'),'contract missing no-C:\\ fallback');
for(const token of ['Inventory and hash before mutation','No silent delete/move/rename/flattening'])must(R153_FULL_SYSTEM_CONTRACT.mutationPolicy.includes(token),'contract missing '+token);
must(R153_FULL_SYSTEM_CONTRACT.completionDefinition.includes('R141/R142'),'contract missing R141/R142 execution-proof boundary');
must(R153_FULL_SYSTEM_CONTRACT.completionDefinition.includes('R125-only'),'contract missing R125-only CanonState admission boundary');

const objective=buildFullSystemMissionObjectiveR153('.');
for(const token of ['100-system / 24-family / 12-master-menu / 36-control / 18-capability / 44-route','179 source-mode + 62 canon-lens','First inventory the approved root','hash candidate trees before any mutation','R127 zero-drift connector','R34.1/R132 execution plane','RETURNED is not VERIFIED','KEEP/MERGE/DONOR/QUARANTINE','No no-op controls','overlapping mobile/desktop navigation','Run the declared static regression','Return an exact machine-readable proof packet'])must(objective.includes(token),'whole-system mission objective missing '+token);

const historical=read('src/systemAtlasRuntime.ts');
for(const token of ["F('S10','Biological Traversal Engine','BIO_SCALE_TRAVERSAL','DOMAIN','RESTORATION_DEBT'","F('S12','Omega Micro Build','COMPRESSED_SOVEREIGN_SEED','DOMAIN','DONOR_ONLY'","F('S16','Workbook / Excel Atlas Runtime','SPREADSHEET_CONTROL_PLANE','SUPPORT','DONOR_ONLY'","F('S21','Cinematic Field Renderer','IMAGE_SNAPSHOT_OF_SUBSTRATE','DOMAIN','NATIVE_TARGET'"])must(historical.includes(token),'historical V24 predecessor evidence must remain preserved: '+token);

const successor=read('src/completionRuntimeR48.ts');
for(const token of [
 "S10:{successor:'SOURCE_ACTIVE'",
 "S12:{successor:'LOCAL_ACTIVE'",
 "S16:{successor:'LOCAL_ACTIVE'",
 "real first-sheet XLSX parsing + bounded XLSX round-trip writer",
 "S18:{successor:'LOCAL_ACTIVE'",
 "S21:{successor:'LOCAL_ACTIVE'",
 "S22:{successor:'LOCAL_ACTIVE'",
 'R127 zero-drift one-click Windows connector generation',
 "S23:{successor:'WEB_ACTIVE'",
 'canonical Worker API + durable runtime transport'
])must(successor.includes(token),'current successor ledger missing/corrupt '+token);

const convergence=read('src/fullSystemConvergenceR95.ts'),panel=read('src/FullSystemConvergencePanelR95.tsx');
must(convergence.includes("from './completionRuntimeR48'")&&convergence.includes("from './fullSystemCompletionR153.js'"),'one-system convergence must consume R48 successor and R153 completion authorities');
must(convergence.includes('historicalStatus:f.historical')&&convergence.includes('status:f.successor'),'historical and current successor states must remain distinct');
must(convergence.includes("schema:'OMEGA_FULL_SYSTEM_CONVERGENCE_R153'")&&convergence.includes('nextProof:gated.map'),'convergence must expose R153 schema and explicit proof backlog');
must(panel.includes("import FullSystemCompletionR153 from './FullSystemCompletionR153'")&&panel.includes('<FullSystemCompletionR153 onNavigate={onNavigate}/>'),'System Atlas must mount the direct R153 completion executor');
for(const token of ['24/24 SUCCESSORS ACCOUNTED · 0 RESTORATION DEBT','IMPLEMENTED SUCCESSORS','TRUTH GATED · NOT BROKEN','Connect / verify PC + RCWA'])must(panel.includes(token),'System Atlas completion UI missing '+token);

const executor=read('src/FullSystemCompletionR153.tsx');
for(const token of [
 "hybrid?.nativeExecutionClaimed===true",
 "if(!online||!device)",
 "defaultCommandPlan('BUILD','AUTO_BUILD',root)",
 'validateCommandPlan(initial,root,[])',
 "api.post<any>('/api/missions'",
 'targetDeviceId:device.id',
 'confirmedMission:true',
 'maxCycles:18',
 "'INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT'",
 'RUN COMPLETE 24-FAMILY BUILD',
 'R141/R142 return fingerprint pending'
])must(executor.includes(token),'whole-system executor missing '+token);
for(const forbidden of ['TRAIN_LOCAL','OPEN_URL','CLICK','TYPE_TEXT','REPLAY_MACRO'])must(!executor.match(new RegExp(`ALLOWED=.*${forbidden}`)),'whole-system build allow-list must not include '+forbidden);

const control=read('src/system/operationalControlPlaneR130.js');
must(control.includes("import {R153_FULL_SYSTEM_CONTRACT,R153_REVISION} from '../fullSystemCompletionR153.js'"),'operational control plane must import R153 authority');
must(control.includes("id:'FULL_SYSTEM_COMPLETION'")&&control.includes('fullSystemCompletion:R153_FULL_SYSTEM_CONTRACT'),'machine-readable system manifest must expose R153 completion contract');
must(control.includes('fullSystemSuccessorDebtCleared'),'operational health matrix must expose successor-debt proof boundary');

const xlsx=read('src/xlsxLiteR153.ts'),data=read('src/OmegaDataLexiconR46.tsx');
for(const token of ["from 'fflate'",'unzipSync','zipSync','readXlsxLite','writeXlsxLite','xl/workbook.xml','xl/worksheets/sheet1.xml'])must(xlsx.includes(token),'XLSX runtime missing '+token);
for(const token of ["import {downloadXlsxLite,readXlsxLite} from './xlsxLiteR153'",'readXlsxLite(buffer,1000,128)','Round-trip bounded data to XLSX','stored formula values','Excel recalculation/macros are not executed'])must(data.includes(token),'data/workbook bridge missing '+token);
must(!data.includes('formula recalculation is active')&&!data.includes('macros executed'),'workbook bridge may not fake Excel recalculation/macro execution');

const r127=read('src/sovereignLauncherR117.ts'),r151=read('src/SovereignConnectionR117.tsx'),r142=read('src/capabilityExecutionReceiptsR142.ts');
must(r127.includes('R127_ZERO_DRIFT_SHA256')&&r127.includes('x-omega-agent-sha256')&&r127.includes('import numpy,grcwa'),'R127 Hybrid/RCWA zero-drift connector must remain intact');
must(r151.includes("R151_EXECUTION_SPINE='CURRENT HEARTBEAT -> INDEX -> HASH_TREE -> PROOF-CONDITIONED REPAIR -> BUILD -> TEST -> PACKAGE -> R141 CLOSURE'"),'R151 proven native build spine must remain intact');
for(const token of ['DISCOVERED_IS_NOT_AUTHORIZED','AVAILABLE_IS_NOT_INVOKED','RETURNED_IS_NOT_VERIFIED','OUTPUT_CANNOT_MUTATE_CANONSTATE_WITHOUT_R125_ADMISSION'])must(r142.includes(token),'R142 execution truth law missing '+token);

console.log('R153 FULL SYSTEM COMPLETION PASS · 24/24 current successors accounted · 19 implemented + 5 explicit gates + 0 successor restoration debt · 100 systems / 12 menus / 36 controls / 18 capabilities / 44 routes preserved · direct proof-gated PC whole-build mission · real bounded XLSX read/write bridge · R127/R151/R142/R125 truth chain intact');
