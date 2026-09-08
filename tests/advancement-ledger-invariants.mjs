import assert from 'node:assert/strict';
import fs from 'node:fs';

const ledger=JSON.parse(fs.readFileSync('public/omega-advancement-ledger.json','utf8'));
const docs=fs.readFileSync('docs/OMEGA_ADVANCEMENT_LEDGER.md','utf8');
const liveVerifier=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');
const must=(ok,msg)=>assert.ok(ok,msg);

assert.equal(ledger.schema,'OMEGA_ADVANCEMENT_LEDGER_V1');
assert.equal(ledger.revision,'R207.2');
assert.equal(ledger.releaseClean,false,'candidate ledger may not claim release-clean before production proof');
assert.equal(ledger.canonicalLedger,'https://github.com/medicinalElJefe/OMEGAv6/issues/435');
for(const key of ['coreHealth','hybridStatus','operationalSourceAuthority','buildReceipt'])must(/^https:\/\/omegav6\.jeffdeweyeljefe\.workers\.dev\//.test(ledger.proofLinks?.[key]||''),`missing canonical live proof link ${key}`);
for(const revision of ['R207','R207.1','R207.2'])must(ledger.entries.some(x=>x.revision===revision),`advancement ledger missing ${revision}`);
const r207=ledger.entries.find(x=>x.revision==='R207');
const r2071=ledger.entries.find(x=>x.revision==='R207.1');
const r2072=ledger.entries.find(x=>x.revision==='R207.2');
assert.equal(r207.releaseClean,false);
assert.equal(r2071.releaseClean,false);
assert.equal(r2072.releaseClean,false);
assert.equal(r207.mergeSha,'c5a66091f444c039dcbb9e0c5fa5334735fbde86');
assert.equal(r2071.mergeSha,'12b325980fc1f4cf0240143e9ea79cb837564adf');
assert.equal(r2071.workerVersion,'de3389b2-3c50-4438-8973-8d78bffeb38e');
assert.equal(r2071.immutableBaseSha256,'49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046');
for(const gate of ['R170_CURRENT_CONVERGENCE_PASS','R202_SOURCE_AUTHORITY_PASS','FULL_CLOUD_BRIDGE_PASS','PRODUCTION_DEPLOYMENT_PASS','LIVE_R202_BYTE_PROOF_PASS','LEDGER_FINAL_ENTRY'])must(r2072.requiredBeforeCompletion.includes(gate),`R207.2 completion gate missing ${gate}`);
for(const token of ['Every completed OMEGA advancement must publish','DEPLOYED` is not equivalent to `RELEASE_CLEAN','issue **#435**','omega-advancement-ledger.json','R125 admission'])must(docs.includes(token),`ledger policy missing ${token}`);
for(const boundary of ['CURRENT_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_NON_REVOKED_HEARTBEAT','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY','DERIVED_EVIDENCE_MAY_NOT_SELF_CONFIRM_INDEPENDENT_EMPIRICAL_EVIDENCE'])must(ledger.truthBoundaries.includes(boundary),`ledger truth boundary missing ${boundary}`);
for(const token of ['arrayBuffer()','Buffer.from(bodyBytes)','servedBaseBytes.equals(expectedBase)','servedWrapperBytes.equals(expectedWrapper)'])must(liveVerifier.includes(token),`R207.2 raw-byte live verifier missing ${token}`);

console.log('OMEGA ADVANCEMENT LEDGER PASS · issue #435 + repository policy + deployed JSON index · R207/R207.1 residuals visible · R207.2 cannot claim release-clean before all production gates and final ledger update');
