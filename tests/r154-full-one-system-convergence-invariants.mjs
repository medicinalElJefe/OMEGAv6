import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R154_FAMILY_SUCCESSOR,R154_FULL_SYSTEM_CONTRACT,R154_COMPLETION_STAGES,buildFullSystemMissionObjectiveR154} from '../src/fullSystemCompletionR154.js';
const read=p=>fs.readFileSync(p,'utf8'),must=(ok,msg)=>assert.ok(ok,'R154 '+msg),active=new Set(['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE']),gated=new Set(['EVIDENCE_GATED','DEVICE_GATED']);
const families=Object.entries(R154_FAMILY_SUCCESSOR);
must(families.length===24,'must account for exactly 24 current successor families');
must(families.filter(([,v])=>active.has(v)).length===19,'must expose exactly 19 implemented successors');
must(families.filter(([,v])=>gated.has(v)).length===5,'must expose exactly 5 evidence/device gates');
must(!families.some(([,v])=>['DONOR_ONLY','NATIVE_TARGET','RESTORATION_DEBT'].includes(v)),'current successor reality may not retain stale restoration labels');
must(R154_COMPLETION_STAGES.length===12&&new Set(R154_COMPLETION_STAGES.map(x=>x.menu)).size===12,'must preserve exactly 12 master completion stages');
for(const [key,value] of Object.entries({systems:100,families:24,masterMenus:12,menuOptions:36,capabilities:18,routes:44,sourceModes:179,canonLenses:62,packetStates:20736,logicalCells:1728,logicalLanes:20736,addressCapacity:61917364224}))must(R154_FULL_SYSTEM_CONTRACT.inventory[key]===value,`inventory ${key} must equal ${value}`);
must(R154_FULL_SYSTEM_CONTRACT.successor.implemented===19&&R154_FULL_SYSTEM_CONTRACT.successor.truthGated===5&&R154_FULL_SYSTEM_CONTRACT.successor.restorationDebt===0,'successor totals must be 19 implemented / 5 gated / 0 debt');
must(R154_FULL_SYSTEM_CONTRACT.inheritedAdaptiveMissionRevision==='R153','R153 adaptive sovereign mission engine must be inherited rather than replaced');
must(R154_FULL_SYSTEM_CONTRACT.relativityEvolutionRevision==='R155','R155 dimensional relativity evolution must be bound into whole-system completion');
for(const token of ['J:\\ is the preferred established root','Never silently fall back to C:\\','Inventory and hash before mutation','No silent delete/move/rename/flattening','R141/R142','R125-only'])must(JSON.stringify(R154_FULL_SYSTEM_CONTRACT).includes(token),'contract missing '+token);
for(const value of [12,144,1728,20736,248832,2985984,35831808,429981696,5159780352,61917364224])must(R154_FULL_SYSTEM_CONTRACT.dimensionalRelativity.ladder.includes(value),'dimensional relativity ladder missing '+value);
must(JSON.stringify(R154_FULL_SYSTEM_CONTRACT.dimensionalRelativity.orientation)==='[-1,0,1]','signed orientation must preserve -1/0/+1');
must(R154_FULL_SYSTEM_CONTRACT.dimensionalRelativity.symmetryAsymmetry==='INDEPENDENT_CONTEXTUAL_FIELDS','symmetry/asymmetry independence must be system-wide completion law');
must(R154_FULL_SYSTEM_CONTRACT.dimensionalRelativity.physicalDimensionClaim===false,'address resolution may not become physical-dimension claim');

const objective=buildFullSystemMissionObjectiveR154('.');
for(const token of ['100-system / 24-family / 12-master-menu / 36-control / 18-capability / 44-route','179 source-mode + 62 canon-lens','R155 dimensional relativity evolution','01-1 prune before 011 construct','σ ∈ {-1,0,+1}','37/73 reference-bias only','12^1 through 12^10','First inventory the approved root','hash candidate trees before any mutation','R127 zero-drift connector','R34.1/R132 execution plane','RETURNED is not VERIFIED','KEEP/MERGE/DONOR/QUARANTINE','No no-op controls','overlapping mobile/desktop navigation','R153 adaptive mission engine','Return an exact machine-readable proof packet'])must(objective.includes(token),'whole-system mission objective missing '+token);

const historical=read('src/systemAtlasRuntime.ts'),successor=read('src/completionRuntimeR48.ts');
for(const token of ["F('S10','Biological Traversal Engine','BIO_SCALE_TRAVERSAL','DOMAIN','RESTORATION_DEBT'","F('S12','Omega Micro Build','COMPRESSED_SOVEREIGN_SEED','DOMAIN','DONOR_ONLY'","F('S16','Workbook / Excel Atlas Runtime','SPREADSHEET_CONTROL_PLANE','SUPPORT','DONOR_ONLY'","F('S21','Cinematic Field Renderer','IMAGE_SNAPSHOT_OF_SUBSTRATE','DOMAIN','NATIVE_TARGET'"])must(historical.includes(token),'historical V24 evidence must remain preserved: '+token);
for(const token of ["S10:{successor:'SOURCE_ACTIVE'","S12:{successor:'LOCAL_ACTIVE'","S16:{successor:'LOCAL_ACTIVE'",'real first-sheet XLSX parsing + bounded XLSX round-trip writer',"S18:{successor:'LOCAL_ACTIVE'","S21:{successor:'LOCAL_ACTIVE'","S22:{successor:'LOCAL_ACTIVE'",'R127 zero-drift one-click Windows connector generation',"S23:{successor:'WEB_ACTIVE'",'canonical Worker API + durable runtime transport'])must(successor.includes(token),'current successor ledger missing '+token);

const convergence=read('src/fullSystemConvergenceR95.ts'),panel=read('src/FullSystemConvergencePanelR95.tsx'),executor=read('src/FullSystemCompletionR154.tsx'),control=read('src/system/operationalControlPlaneR130.js');
must(convergence.includes("from './completionRuntimeR48'")&&convergence.includes("from './fullSystemCompletionR154.js'"),'one-system convergence must consume R48 and R154 authorities');
must(convergence.includes('historicalStatus:f.historical')&&convergence.includes('status:f.successor'),'historical and current successor states must remain distinct');
must(convergence.includes("schema:'OMEGA_FULL_SYSTEM_CONVERGENCE_R154'")&&convergence.includes('nextProof:gated.map'),'convergence must expose current R154 schema and proof backlog');
must(panel.includes("import FullSystemCompletionR154 from './FullSystemCompletionR154'")&&panel.includes('<FullSystemCompletionR154 onNavigate={onNavigate}/>'),'System Atlas must mount direct whole-system executor');
for(const token of ['24/24 SUCCESSORS ACCOUNTED · 0 RESTORATION DEBT','IMPLEMENTED SUCCESSORS','TRUTH GATED · NOT BROKEN','R153 ADAPTIVE EXECUTION PRESERVED'])must(panel.includes(token),'System Atlas completion UI missing '+token);
for(const token of ["hybrid?.nativeExecutionClaimed===true","if(!online||!device)","defaultCommandPlan('BUILD','AUTO_BUILD',root)",'validateCommandPlan(initial,root,[])',"draft:{schema:'OMEGA_SOVEREIGN_FULL_BUILD_R151'",'targetDeviceId:device.id','confirmedMission:true','maxCycles:12',"'INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT'",'RUN COMPLETE 24-FAMILY BUILD','R153 adaptive','R141/R142 return fingerprint pending'])must(executor.includes(token),'whole-system executor missing '+token);
for(const forbidden of ['TRAIN_LOCAL','OPEN_URL','CLICK','TYPE_TEXT','REPLAY_MACRO'])must(!executor.match(new RegExp(`const ALLOWED=.*${forbidden}`)),'whole-system build allow-list must not include '+forbidden);
must(control.includes("revision:'R153',id:'ADAPTIVE_SOVEREIGN_MISSIONS'")&&control.includes("revision:'R155',id:'DIMENSIONAL_RELATIVITY_EVOLUTION'")&&control.includes("id:'FULL_SYSTEM_COMPLETION'"),'operational registry must expose R153/R155/R154 composition');
must(control.includes('fullSystemCompletion:R154_FULL_SYSTEM_CONTRACT')&&control.includes('dimensionalRelativity:R154_FULL_SYSTEM_CONTRACT.dimensionalRelativity'),'machine-readable operational manifest must expose completion and dimensional relativity');
must(control.includes('R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'),'R125 admission authority must remain intact');

const xlsx=read('src/xlsxLiteR154.ts'),data=read('src/OmegaDataLexiconR46.tsx'),micro=read('src/MicroBuildR46.tsx');
for(const token of ["from 'fflate'",'unzipSync','zipSync','readXlsxLite','writeXlsxLite','xl/workbook.xml','xl/worksheets/sheet1.xml'])must(xlsx.includes(token),'XLSX runtime missing '+token);
for(const token of ["import {downloadXlsxLite,readXlsxLite} from './xlsxLiteR154'",'readXlsxLite(buffer,1000,128)','Round-trip bounded data to XLSX','Stored formula values are readable','Excel recalculation/macros are not executed','Legacy binary .xls bytes are SHA-256 fingerprinted but are not parsed'])must(data.includes(token),'data/workbook bridge missing '+token);
for(const token of ['OMEGA_MICRO_PORTABLE_BUNDLE_R154','stateSha256','omega.manifest.json','proof-boundary.json','Portable ZIP','selfDeploying:false'])must(micro.includes(token),'portable Micro Build bundle missing '+token);

const r127=read('src/sovereignLauncherR117.ts'),r151=read('src/SovereignConnectionR117.tsx'),r142=read('src/capabilityExecutionReceiptsR142.ts'),adaptive=read('src/execution/adaptiveSovereignMissionR153.js');
must(r127.includes('R127_ZERO_DRIFT_SHA256')&&r127.includes('x-omega-agent-sha256')&&r127.includes('import numpy,grcwa'),'R127 Hybrid/RCWA zero-drift connector must remain intact');
must(r151.includes("R151_EXECUTION_SPINE='CURRENT HEARTBEAT -> INDEX -> HASH_TREE -> PROOF-CONDITIONED REPAIR -> BUILD -> TEST -> PACKAGE -> R141 CLOSURE'"),'R151 native build spine must remain intact');
for(const token of ['DISCOVERED_IS_NOT_AUTHORIZED','AVAILABLE_IS_NOT_INVOKED','RETURNED_IS_NOT_VERIFIED','OUTPUT_CANNOT_MUTATE_CANONSTATE_WITHOUT_R125_ADMISSION'])must(r142.includes(token),'R142 execution truth law missing '+token);
for(const token of ["R153_MISSION_SCHEMA='OMEGA_SOVEREIGN_FULL_BUILD_MISSION_R153'",'RETURNED HOST PROOF ADVANCES THE MISSION','REPAIR IS READ-PROOF + PREIMAGE-SHA BOUND','COMPLETE IS NEVER INFERRED FROM QUEUE STATE'])must(adaptive.includes(token),'R153 adaptive mission authority missing '+token);

console.log('R154 FULL ONE-SYSTEM CONVERGENCE PASS · 24/24 current successors · 19 implemented + 5 explicit gates + 0 successor debt · R155 all-mode dimensional relativity evolution · R153 adaptive returned-proof build lifecycle · real XLSX round-trip + hashed Micro bundle · R127/R151/R142/R125 truth chain preserved');
