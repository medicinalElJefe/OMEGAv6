import assert from 'node:assert/strict';
import fs from 'node:fs';
import {YEAR_CORPUS_EXECUTION_R473,YEAR_CORPUS_EXECUTION_SUMMARY_R473,auditYearCorpusExecutionR473,compileCorpusExecutionPlanR473} from '../src/yearCorpusExecutionR473.ts';
import {OMEGA_NAVIGATION} from '../src/navigationRegistry.ts';

const routeSet=new Set(OMEGA_NAVIGATION.map(x=>x.name));
const audit=auditYearCorpusExecutionR473();
assert.equal(audit.pass,true,JSON.stringify(audit));
assert.equal(audit.unroutable.length,0);
assert.equal(audit.shadowArchive.length,0);
assert.equal(audit.duplicateIds.length,0);
for(const binding of YEAR_CORPUS_EXECUTION_R473){const plan=compileCorpusExecutionPlanR473(binding);assert.equal(plan.routable,true,`R473 unroutable ${binding.id}`);assert.equal(plan.receiptAuthority,'R142');assert.equal(plan.admissionAuthority,'R125');assert.equal(plan.canonicalMutation,false);}
assert.ok(YEAR_CORPUS_EXECUTION_R473.length>=45,'R473 must preserve the broad year-corpus, not a token shortlist');
assert.equal(new Set(YEAR_CORPUS_EXECUTION_R473.map(x=>x.id)).size,YEAR_CORPUS_EXECUTION_R473.length,'R473 binding ids must be unique');
assert.ok(YEAR_CORPUS_EXECUTION_R473.every(x=>routeSet.has(x.route as any)),'Every R473 contribution must bind to a current canonical route');
assert.ok(YEAR_CORPUS_EXECUTION_R473.every(x=>x.route!=='Archive Operators'||x.id==='ARCHIVE'),'Historical contribution may not be dumped into Archive Operators; only the archive/recovery subsystem itself belongs there');
assert.ok(YEAR_CORPUS_EXECUTION_R473.every(x=>x.contribution.length>20&&x.operation.length>4&&x.truth.length>10),'Every R473 lineage needs an operational contribution, action and truth boundary');
assert.ok(YEAR_CORPUS_EXECUTION_SUMMARY_R473.canonicalMutation===false,'R473 is a routing/execution binding fabric, never a second CanonState writer');
assert.ok(YEAR_CORPUS_EXECUTION_SUMMARY_R473.executesNow>20,'R473 must bind substantial capability directly to current executors');
assert.ok(YEAR_CORPUS_EXECUTION_SUMMARY_R473.adapters>10,'R473 must operationalize distinct historical developments as current adapters rather than hiding them');
assert.ok(YEAR_CORPUS_EXECUTION_SUMMARY_R473.truthGated>=3,'Provider/device/native dependencies must remain truth-gated instead of fictionalized');

const aliases=YEAR_CORPUS_EXECUTION_R473.flatMap(x=>x.aliases);
for(const required of[
 'omega-os','OmegaUniversalOS','ultimate-os','ΩCK-144','Mode 188','DIMENSIONAL188','PCWD','FULL SPHERE',
 'omega_cube_engine','OmegaInfinity','OMEGA Temporal Field','GPUFieldMaster','SOMA','Earthandweather','SAR',
 'Heavy Bio','NervousSystem','CanonForge','OMEGA Genesis','Hybrid Link','Micro Build','Continuous Convergence Runtime',
 'JST','DAY','QTI G1-G10','675-row Implementation Canon','B059 SAI','native GPU v12.1','symbolic optics','Dynamic Evolution','R278','Optical R153.2','R191 Universal Surface Fabric','OMEGA-Clean','CryioCar','Update-iPhone-13','horoscopeEngine.js','The-Temple'
])assert.ok(aliases.some(x=>x.includes(required)),`R473 missing year-corpus lineage alias: ${required}`);

const ui=fs.readFileSync('src/YearCorpusConvergenceR473.tsx','utf8');
const convergence=fs.readFileSync('src/OmegaConvergenceSurfaceR416.tsx','utf8');
const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const intentUi=fs.readFileSync('src/CorpusExecutionIntentR473.tsx','utf8');
const adapter=fs.readFileSync('src/CorpusAdapterWorkbenchR473.tsx','utf8');
const operationBus=fs.readFileSync('src/omegaOperationBusR86.ts','utf8');
const soma=fs.readFileSync('src/SomaAudioEngine.tsx','utf8');
for(const token of[
 'omega.r473.corpusExecutionIntent','omega:r473-corpus-execution','Run through {x.route}','capabilityId:plan.capabilityId','executionDomain:plan.executionDomain','capabilityReality:plan.capabilityReality',
 'CURRENT EXECUTOR','CURRENT ADAPTER','TRUTH GATED','R473_LOCAL_HANDOFF_REQUIRES_R142_PROOF','R142 execution proof required','R125 CanonState admission unchanged'
])assert.ok(ui.includes(token),`R473 execution UI missing ${token}`);
assert.ok(convergence.includes("import YearCorpusConvergenceR473 from './YearCorpusConvergenceR473'"));
assert.ok(convergence.includes('<YearCorpusConvergenceR473 onNavigate={onNavigate}/>'),'R473 must be directly mounted in canonical Convergence, not hidden behind a disclosure');
for(const token of ['ACTIVE YEAR-CORPUS EXECUTION','yearCorpusExecution:corpusIntent','CorpusExecutionIntentR473 intent={corpusIntent}','omega:r473-corpus-execution'])assert.ok(workstation.includes(token),`R473 workstation handoff missing ${token}`);
for(const token of ['OMEGA_CORPUS_EXECUTION_INTENT_R473','CURRENT EXECUTOR ACTIVE','omega:r473-corpus-execution-cleared',"receiptAuthority:'R142'","admissionAuthority:'R125'",'capabilityReality:string'])assert.ok(intentUi.includes(token),`R473 active intent surface missing ${token}`);
for(const token of ['CorpusAdapterWorkbenchR473 intent={corpusIntent}',"corpusIntent.state==='EXECUTES_AS_ADAPTER'",'record={record}','address={address}'])assert.ok(workstation.includes(token),`R473 operational adapter mount missing ${token}`);
for(const token of ['1779033703','3432918353','0x6D2B79F5','STABLE FIELD','SURGE VECTOR','RESET VECTOR','CONTRAST FIELD','ASCENT ARC','DESCENT ARC','Omega Core','Collections / JST · Easy Desk','Compliance gate / HOLD','EASY_DESK','CALL_LOG','ACCOUNT_QUEUE','ONENOTE_HYBRID_GATE','0.30 z(Prod % excluding OT)+0.30 z(T2B % to Goal)+0.20 z_neg(ZK Complaint Rate)+0.20 z(Q5 Success Rate)','any RED OR 2+ YELLOW OR Overall Score < ','Offline Canon Q&A','Standard_Model_Lagrangian_20736D_Pi_Motion_AutoPing.xlsx','ULTIMATE_1728D_LINGUISTICS_ATLAS.xlsx','Standard scalar Fresnel-number adapter only','CORPUS_ADAPTER_EXECUTED','function HoroscopeAdapter','body<4','mind>6','emotion<4','boundaries<4','will<4','Nothing here is fate or prediction','function HyperstackAdapter','magnitude*100','HIGH_AUGMENTATION','MEDIUM_AUGMENTATION','LOW_MAINTENANCE','function TempleAdapter','OMEGA_TEMPLE_SOMA_PRESET_R473','188','Shadow','Energy','Ocean','Trees','Cycles','Water Power','Metal Power','Reassurance'])assert.ok(adapter.includes(token),`R473 operational adapter missing recovered behavior: ${token}`);
assert.ok(operationBus.includes("|'CORPUS_ADAPTER_EXECUTED'"),'R473 adapter execution must be a first-class R86 operation receipt');
for(const token of ["omega:r473-soma-preset","omega.r473.templeSomaPreset","max='188'","Safety auto-stop","sessionDeadline","explicit Start still required"])assert.ok(soma.includes(token),`Temple successor must reach the real SOMA engine: ${token}`);
console.log('R473 YEAR-CORPUS EXECUTION PASS · broad lineages preserved · historical contribution bound to current executors/adapters · only real external/native dependencies gated · no shadow CanonState');
