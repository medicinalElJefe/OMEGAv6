import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('public/omega-pc-proof-r205.js','utf8');
const line=source.split('\n').find(x=>x.includes("const rawHealth=rawStepResult('DESKTOP_HEALTH')"));
assert.ok(line,'R878 proof-selection source must exist');
const match=line.match(/health=verified\?closureStepResult\('DESKTOP_HEALTH'\):rawHealth,ledger=verified\?closureStepResult\('FORENSIC_HASH_LEDGER'\):rawLedger/);
assert.ok(match,'Verified AT09/AT10 must use closure-contained steps exclusively');
assert.ok(!line.includes("closureStepResult('DESKTOP_HEALTH')||rawHealth"),'Unverified raw AT09 fallback forbidden');
assert.ok(!line.includes("closureStepResult('FORENSIC_HASH_LEDGER')||rawLedger"),'Unverified raw AT10 fallback forbidden');

const expression="({health:verified?closureStepResult('DESKTOP_HEALTH'):rawHealth,ledger:verified?closureStepResult('FORENSIC_HASH_LEDGER'):rawLedger})";
for(const [label,verified,closure,expected] of [
 ['verified closure missing both',true,{},[null,null]],
 ['verified closure contains health only',true,{DESKTOP_HEALTH:{id:'closed-health'}},['closed-health',null]],
 ['verified closure contains both',true,{DESKTOP_HEALTH:{id:'closed-health'},FORENSIC_HASH_LEDGER:{id:'closed-ledger'}},['closed-health','closed-ledger']],
 ['unverified return retained for display',false,{},['raw-health','raw-ledger']]
]){
 const selected=vm.runInNewContext(expression,{
  verified,rawHealth:{id:'raw-health'},rawLedger:{id:'raw-ledger'},
  closureStepResult:op=>closure[op]||null
 });
 assert.deepEqual([selected.health?.id??null,selected.ledger?.id??null],expected,label);
}
assert.ok(source.includes("const healthPass=verified&&health?.schema==='OMEGA_DESKTOP_HEALTH_R205'"),'AT09 verified PASS gate preserved');
assert.ok(source.includes("const ledgerPass=verified&&ledger?.schema==='OMEGA_FORENSIC_HASH_LEDGER_RECEIPT_R205'"),'AT10 verified PASS gate preserved');
assert.ok(source.includes("state.closure?.fingerprint?.verified===true"),'R141 fingerprint gate preserved');
console.log('R878 closure-only AT09/AT10 selection PASS: no raw-result promotion; R141 and R125 boundaries retained');
