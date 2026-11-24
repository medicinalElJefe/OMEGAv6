import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const evidence=JSON.parse(readFileSync('audit/omega-b043-module-test-evidence-r949.json','utf8'));
const source=JSON.parse(readFileSync('audit/omega-b043-full-source-byte-acceptance-r948.json','utf8'));
const active=JSON.parse(readFileSync('audit/omega-active-full-build-ledger-r937.json','utf8'));
assert.equal(evidence.schema,'OMEGA_B043_PER_MODULE_HISTORICAL_EXECUTION_R949');
assert.equal(evidence.sourceMasterSha256,source.masterObservedSha256);
assert.equal(evidence.testModuleCount,34);
assert.equal(evidence.modules.length,34);
assert.equal(evidence.allModulesPassedIndividually,true);
assert.equal(evidence.passedTestsAcrossPerModuleExecutions,62);
assert.equal(new Set(evidence.modules.map(m=>m.file)).size,34);
assert.equal(evidence.modules.reduce((a,m)=>a+m.observedPassed,0),62);
for(const item of evidence.modules){
 assert.ok(item.file.startsWith('tests/test_')&&item.file.endsWith('.py'));
 assert.equal(item.state,'PASS_IN_ISOLATED_PROCESS');
 assert.ok(item.observedPassed>=1);
}
assert.equal(evidence.extendedRetestModule,'test_total_control_regression.py');
assert.equal(evidence.extendedRetestResult,'1_PASSED');
assert.ok(evidence.extendedRetestObservedSeconds>15);
assert.equal(evidence.combinedSuite.collectedTests,62);
assert.equal(evidence.combinedSuite.state,'TIMED_OUT');
assert.equal(evidence.combinedSuite.acceptanceProven,false);
assert.equal(evidence.nativeWindowsDeviceProof,false);
assert.equal(evidence.originalApplicationProductionProof,false);
assert.equal(evidence.canonicalWrites,0);
assert.equal(active.isolatedB043ModuleProof,'audit/omega-b043-module-test-evidence-r949.json');
for(const id of ['FAMILY_PARITY','UI_PARITY','NATIVE_PC','RELEASE']){
 assert.ok(active.blockers.some(b=>b.id===id&&b.state==='OPEN'),'critical blocker erased '+id);
}
const ui=readFileSync('src/DriveHistoricalRecoveryR936.tsx','utf8');
assert.ok(ui.includes('moduleProof.passedTestsAcrossPerModuleExecutions'));
assert.ok(ui.includes('All other parts remain unverified'));
assert.ok(ui.includes('The combined 62-case suite timed out'));
console.log('R949 PASS: 34 isolated test modules, all 62 historical cases pass separately, combined-suite timeout remains held; no false runtime parity.');
