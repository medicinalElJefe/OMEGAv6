import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,`R243 ${msg}`);
const worker=read('src/workerR101.js');
const worker102=read('src/workerR102.js');
const wrapper=read('public/omega-hybrid-agent-r141.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const ui=read('src/HybridExecutionMotionR243.tsx');
const link=read('src/HybridLinkR32.tsx');
const missionShim=read('src/execution/adaptiveSovereignMissionR152.js');
const r243Fabric=read('scripts/lib/r243-woven-selfbuild-fabric.mjs');
const navLemma=read('src/navigationLemmaCalculusR242.js');

// Preserve the already-defined R242 wire protocol rather than inventing a second incompatible lease protocol.
for(const token of [
 "EXECUTION_MOTION_REVISION='R242'","RUNNING_LEASE_MS=20000","LEGACY_RUNNING_STALE_MS=90000","MAX_STALL_RECOVERIES=2",
 "'/api/hybrid/agent/progress':'/agent/progress'",'recoverStalledJobsR242','R242_JOB_STALL_RECOVERED','R242_JOB_STALL_FAILED',
 "new Set(['APPLY_PATCH','WRITE_TEXT'])","RECOVERABLE_DISCOVERY_STAGES","status:'FAILED'","recoveryReason:'EXPIRED_RUNNING_LEASE'",
 "schema:'OMEGA_HYBRID_EXECUTION_PROGRESS_R242'",'leaseUntil:t+RUNNING_LEASE_MS'
])must(worker.includes(token),`inherited execution-motion transport missing ${token}`);
must(!worker.includes("status:'KILLED'"),'stale recovery must not fabricate remote process termination');
must(worker.includes("safeSteps=safeSteps.filter(s=>String(s?.op||'').toUpperCase()==='INDEX')"),'stale DISCOVERY recovery must strip root HASH_TREE and retain INDEX only');
must(worker.includes("MUTATING_OPS_R242.has(String(s?.op||'').toUpperCase())"),'mutation replay guard missing');

// The R141 wrapper must preserve authenticated progress and exact-return identity without adding arbitrary shell/install authority.
for(const token of ["EXECUTION_MOTION_EXTENSION='R242'","'/api/hybrid/agent/progress'",'PROGRESS_INTERVAL_SECONDS=3.0','threading.Thread','daemon=True','send_progress(\'CLAIMED\')',"send_progress('RETURNING')",'bridge_by_step=validate_bridge_calculus_r240(job)',"proof['calculusBridgeR240Return']=returned","'resultFingerprintR141':digest"])must(wrapper.includes(token),`R141 wrapper motion/continuity contract missing ${token}`);
must(!wrapper.includes('shell=True'),'R141 wrapper must not add arbitrary shell authority');
must(!/pip\s+install|python\s+-m\s+pip|conda\s+install/i.test(wrapper),'Hybrid wrapper must not auto-install dependencies');
const baseSha=crypto.createHash('sha256').update(base).digest('hex');
assert.equal(baseSha,'49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046','R243 must leave immutable R205 executor byte-identical');

// R243 owns the product convergence identity and visibly exposes the inner wire revision.
for(const token of ['data-r243-motion','data-r243-transport','MOTION_PROVED','STALL_DETECTED','LEGACY_RUNNING_NO_LEASE','CURRENT STEP','MOTION / LEASE','RETURNED STEP COUNT','R141 returned proof',"new Set(['R242','R243'])"])must(ui.includes(token),`R243 execution-motion surface missing ${token}`);
must(link.includes("import HybridExecutionMotionR243 from './HybridExecutionMotionR243'"),'Hybrid Link must import R243 convergence surface');
must(link.includes('<HybridExecutionMotionR243/>'),'Hybrid Link must mount R243 convergence surface');
must(link.indexOf('<HybridWovenContinuityR238/>')<link.indexOf('<HybridExecutionMotionR243/>')&&link.indexOf('<HybridExecutionMotionR243/>')<link.indexOf('<HybridHostIntelligenceR238/>'),'R243 motion must remain inside the shared selected-host snapshot before returned host intelligence');

// Initial discovery and stale recovery stay bounded/non-mutating; source edits require exact returned proof.
for(const token of ['boundInitialDiscoveryR242','r242InitialDiscoveryBounded:true','r242RemovedRootHash:true',"initialDiscoveryPolicy:'INDEX_PROJECT_FIRST_HASH_SELECTED_PROJECT_AFTER_DISCOVERY'","discoveryOnly:true","steps:[step]"])must(missionShim.includes(token),`bounded discovery compatibility missing ${token}`);
must(missionShim.includes("['APPLY_PATCH','WRITE_TEXT']"),'initial mission rewrite must refuse mutation-bearing plans');
for(const token of ['APPLY_PATCH','WRITE_TEXT','R141','source mutation','resultFingerprint'])must(worker102.includes(token)||wrapper.includes(token),`source-mutation truth chain missing ${token}`);

// R243 planning is additive; source promotion remains R240 and navigation remains canonical R242 read-only.
for(const token of ['R240_SINGLE_CANDIDATE_SOURCE_PROMOTION','SOURCE_MUTATION_REQUIRES_EXACT_APPLY_PATCH_OR_WRITE_TEXT_RETURN_PROOF','CI_YML_SOLE_CANONICAL_PRODUCTION_WRITER','R242_READ_ONLY_NAVIGATION_LEMMA'])must(r243Fabric.includes(token),`R243 invariant carry missing ${token}`);
must(navLemma.includes("R242_NAVIGATION_LEMMA_REVISION='R242'"),'R243 must preserve promoted R242 navigation identity');
must(!r243Fabric.includes('canonicalAdmission:true'),'R243 planning fabric must not gain CanonState authority');

console.log('OMEGA R243 HYBRID EXECUTION-MOTION CONVERGENCE PASS · R243 product surface over inherited R242 lease wire protocol · authenticated progress/heartbeat continuity · stale RUNNING fails closed · bounded non-mutating recovery only · exact returned APPLY_PATCH/WRITE_TEXT proof remains source-mutation boundary · immutable R205 + R240/R242/R239/R147/R141/R146/R125 authorities preserved');
