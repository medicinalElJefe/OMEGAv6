import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('tools/omega_v35_prepare_r956.py','utf8');
const hub=readFileSync('tools/omega_local_hub_r881.py','utf8');
const ui=readFileSync('src7/workspaces/OmegaLocalHubPanelR884.tsx','utf8');
const archive=readFileSync('src/DriveHistoricalRecoveryR936.tsx','utf8');
const tests=readFileSync('tests/test_omega_local_hub_r881.py','utf8');
const active=JSON.parse(readFileSync('audit/omega-active-full-build-ledger-r937.json','utf8'));
const v35=JSON.parse(readFileSync('audit/omega-v35-original-atlas-db-r954.json','utf8'));
for(const marker of [
 'OMEGA_V35_PART_18.zip','PSC_20736D_OMEGA_MASTER_ATLAS_UNDER_150MB.zip',
 'ORIGINAL_ARCHIVE_OR_SQLITE_INTEGRITY_HELD','R956_ORIGINAL_V35_WRAPPER_SHA256_HELD',
 'R956_NESTED_SHA256_HELD','R956_SQLITE_SHA256_HELD',
 'R956_ORIGINAL_V35_ATLAS_MANIFEST_HELD','R956_DESTINATION_ALREADY_EXISTS_HELD',
 'os.link(temp_db,destination)','conn.execute("PRAGMA quick_check")',
 'historicalRuntimeParityProven":False','canonicalWrites":0'
 ])assert.ok(source.includes(marker),'source-pinned staging invariant missing: '+marker);
assert.ok(source.includes(v35.sourceSqliteSha256),'R956 requires actual original V35 sqlite SHA');
assert.match(hub,/OPS = .*"HISTORICAL_V35_ATLAS_PREPARE"/);
assert.ok(!/READ_ONLY_REPLAY = .*"HISTORICAL_V35_ATLAS_PREPARE"/.test(hub),'new-file write must not be marked as a read-only replay');
assert.ok(hub.includes('return load_v35_atlas_prepare_r956().prepare_v35_atlas_r956(self.root,args,safe_under)'));
assert.ok(ui.includes("operation==='HISTORICAL_V35_ATLAS_PREPARE'"));
assert.ok(ui.includes('data-r956-source-ready'));
assert.ok(ui.includes("setOperation('HISTORICAL_V35_ATLAS_QUERY')"),'staged original data cannot launch actual reader');
assert.ok(ui.includes('No job has started.'),'archive selection cannot auto-execute');
assert.ok(archive.includes("onAuditRelease('V35-ATLAS')"),'original V35 source has no direct governed staging action');
assert.ok(tests.includes('test_r956_original_v35_safe_stage_and_indexed_query'),'real nested ZIP/SQL positive and refusal tests absent');
assert.ok(active.buildHistory.some(x=>x.revision==='R956'));
assert.ok(active.blockers.some(x=>x.id==='FAMILY_PARITY'&&x.state==='OPEN'));
assert.ok(active.blockers.some(x=>x.id==='NATIVE_PC'&&x.state==='OPEN'));
console.log('R956 original V35 Master Atlas safe staging source contract PASS — source-exact nested ZIP, SHA/CRC, read-only SQLite and no-overwrite acceptance gates.');
