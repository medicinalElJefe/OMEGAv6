import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('OMEGA7 renders all canonical R650 family restoration statuses without pretending production proof',async()=>{
 const source=await readFile(new URL('../src7/CapabilityRecoveryAuditR705.tsx',import.meta.url),'utf8');
 const ledger=JSON.parse(await readFile(new URL('../canon/year-corpus-capability-conservation-r650.json',import.meta.url),'utf8'));
 assert.equal(ledger.families.length,12);
 assert.match(source,/canonicalRecoveryR650\.families/);
 assert.match(source,/data-r620-canonical-family-report/);
 assert.match(source,/Missing evidence:/);
 assert.match(source,/Not production proven/);
 assert.ok(ledger.families.every(x=>!x.productionProved));
});
