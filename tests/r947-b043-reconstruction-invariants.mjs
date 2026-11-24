import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('tools/omega_b043_reconstruct_r947.py','utf8');
const hub=readFileSync('tools/omega_local_hub_r881.py','utf8');
const ui=readFileSync('src7/workspaces/OmegaLocalHubPanelR884.tsx','utf8');
const tests=readFileSync('tests/test_omega_local_hub_r881.py','utf8');
const ledger=JSON.parse(readFileSync('audit/omega-active-full-build-ledger-r937.json','utf8'));
const manifest=JSON.parse(readFileSync('audit/omega-drive-historical-archive-source-index-r936.json','utf8'));
const b043=manifest.groups.find(x=>x.id==='B043');
assert.equal(b043.expectedParts,29);
assert.equal(b043.parts.length,29);
assert.equal(b043.reportedEvidence.masterSha256,'76092ac1396ab5224dde6f77401ce7c76819c10a749c102950045de9bad6e4e7');
for(const token of ['OMEGA_B043_FULL_SYSTEM.zip','PART_COUNT = 29','MASTER_SHA256 = "76092ac1396ab5224dde6f77401ce7c76819c10a749c102950045de9bad6e4e7"',
'_assemble_parts_r947','(Path(args["archive_folder"])/part["part"]).as_posix()','R947_MASTER_SOURCE_AUTHORITY_HELD','R947_ORIGINAL_PART_SHA256_MISMATCH_HELD',
'R947_ORIGINAL_CHUNK_SHA256_MISMATCH_HELD','R947_MASTER_SHA256_OR_LENGTH_MISMATCH_HELD',
'os.link(temp_path,destination)','sourceExactByteReconstruction":True','donorCodeExecuted":False'])
 assert.ok(source.includes(token),'R947 source conservation or refusal lost: '+token);
assert.match(hub,/OPS = .*"HISTORICAL_B043_RECONSTRUCT"/);
assert.ok(hub.includes('return load_b043_reconstruction_r947().reconstruct_b043_r947(self.root,args,safe_under)'));
assert.ok(!hub.match(/READ_ONLY_REPLAY = .*"HISTORICAL_B043_RECONSTRUCT"/),'write operation must not be read-only replayable');
assert.ok(ui.includes("operation==='HISTORICAL_B043_RECONSTRUCT'"));
assert.ok(ui.includes('No overwrites, extraction of donor code'));
assert.ok(tests.includes('test_r947_original_b043_stream_assembler_no_overwrite_and_refusal'));
assert.ok(ledger.blockers.some(b=>b.id==='HISTORY'&&b.state==='OPEN'),'runtime parity unproved, history blocker must remain');
assert.ok(ledger.blockers.some(b=>b.id==='ZIP_BYTES'&&b.state==='OPEN'),'all source bytes still not verified');
console.log('R947 B043 EXACT STREAM RECONSTRUCTION: source-pin and no-overwrite contract present, with Python bounded positive and refusal tests.');
