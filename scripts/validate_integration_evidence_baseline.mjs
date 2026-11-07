#!/usr/bin/env node
/** Read-only, deterministic integration evidence inventory validation.
 * This validator proves manifest structure and path existence only.
 * It does NOT prove tests passed, live runtime, native host or physics.
 */
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const file=path.join(root,'audit/integration-evidence-baseline.v1.json');
const ledger=JSON.parse(fs.readFileSync(file,'utf8'));
const errors=[];
function assert(ok,msg){if(!ok)errors.push(msg)}
assert(ledger.schema==='OMEGA_INTEGRATION_EVIDENCE_BASELINE_V1','schema mismatch');
assert(ledger.snapshot?.coverage==='TARGETED_INITIAL_INVENTORY_NOT_COMPLETE_REPOSITORY_SCAN','scan scope misrepresented');
assert(ledger.snapshot?.inspectedMain?.length===40,'missing inspected SHA');
assert(ledger.modeDisclosure?.sourceImplementedContracts<=ledger.modeDisclosure?.catalog,'mode implementation cannot exceed catalog');
assert(ledger.modeDisclosure?.catalog===ledger.modeDisclosure?.sourceImplementedContracts+ledger.modeDisclosure?.remainingCatalogOnly,'mode counts inconsistent');
const seen=new Set();
for(const item of ledger.instruments||[]){
 assert(item.id&&!seen.has(item.id),'missing or duplicate family id '+item.id);
 seen.add(item.id);
 assert(item.production!=='VERIFIED' && item.nativeDevice!=='VERIFIED','unsupported unconditional proof claim '+item.id);
 for(const field of ['ui','engine','state']){
  const rel=item.source?.[field];
  assert(typeof rel==='string'&&rel.length>0,'missing '+field+' for '+item.id);
  if(typeof rel==='string')assert(fs.existsSync(path.join(root,rel)),'source path absent: '+item.id+' '+field+' '+rel);
 }
 const test=item.test?.path;
 assert(typeof test==='string'&&fs.existsSync(path.join(root,test)),'test path absent: '+item.id+' '+test);
 assert(item.test?.status==='REGISTERED_NOT_RUN','unearned test-pass claim '+item.id);
 assert(item.missingEvidence&&item.modelAuthority,'missing evidence/authority: '+item.id);
}
for(const rel of [ledger.familyContract,ledger.modeContract])assert(typeof rel==='string'&&fs.existsSync(path.join(root,rel)),'contract path absent '+rel);
if(errors.length){for(const error of errors)console.error('INTEGRATION AUDIT FAIL: '+error);process.exit(1)}
console.log('INTEGRATION AUDIT STRUCTURAL PASS: '+seen.size+' mapped instruments; path existence and conservative labels only. No runtime or deployment proof claimed.');
