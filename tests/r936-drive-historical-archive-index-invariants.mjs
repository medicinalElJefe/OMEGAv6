import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const index=JSON.parse(readFileSync('audit/omega-drive-historical-archive-source-index-r936.json','utf8'));
assert.equal(index.schema,'OMEGA_DRIVE_HISTORICAL_ARCHIVE_SOURCE_INDEX_R936');
assert.match(index.collectionBoundary,/NOT_EXHAUSTIVE/);
assert.match(index.evidenceBoundary,/NOT_INDEPENDENT/);
const expectations={B043:29,B045:30,B053:30,'B053-R7':30,V32:17,V35:20};
assert.equal(index.groups.length,Object.keys(expectations).length);
const ids=new Set(),names=new Set();
for(const g of index.groups){
 assert.equal(g.expectedParts,expectations[g.id],'unexpected release: '+g.id);
 assert.equal(g.parts.length,g.expectedParts,'missing indexed Drive file '+g.id);
 assert.match(g.sourceState,/NOT_BYTE_VERIFIED/,'unearned current-byte claim '+g.id);
 assert.ok(/^https:\/\/drive\.google\.com\/drive\/folders\/[\w-]+$/.test(g.folderUrl),'invalid folder source URL '+g.id);
 for(const [i,p] of g.parts.entries()){
  assert.equal(p.index,i+1,'gap or duplicate part '+g.id);
  assert.match(p.filename,/\.zip$/);
  assert.match(p.driveId,/^[a-zA-Z0-9_-]+$/);
  assert.ok(Number.isSafeInteger(p.bytes)&&p.bytes>1000,'missing reported byte size '+g.id);
  assert.ok(!ids.has(p.driveId),'duplicate Drive file identity');
  assert.ok(!names.has(p.filename),'duplicate part filename');
  ids.add(p.driveId);names.add(p.filename);
 }
}
const reconstructed=index.groups.find(g=>g.id==='B043');
assert.match(reconstructed.reportedEvidence.masterSha256,/^[a-f0-9]{64}$/);
assert.match(reconstructed.reportedEvidence.evidenceState,/HISTORICAL_REPORT_NOT_CURRENT/);
const v35=index.groups.find(g=>g.id==='V35');
assert.match(v35.reportedEvidence.evidenceState,/NOT_CURRENT_BYTE_ACCEPTANCE/);
for(const p of index.companionZipArchives){
 assert.match(p.filename,/\.zip$/);
 assert.ok(!ids.has(p.driveId),'companion source overlaps split archive');
 ids.add(p.driveId);
 assert.match(p.sourceState,/NOT_BYTE_VERIFIED/);
}
assert.equal(index.counts.expectedParts,156);
assert.equal(index.counts.discoveredParts,156);
assert.equal(index.counts.companionZipArchives,18);
assert.equal(index.companionZipArchives.length,18);
const ui=readFileSync('src/DriveHistoricalRecoveryR936.tsx','utf8');
const archive=readFileSync('src/ArchiveGovernanceControl.tsx','utf8');
for(const marker of ['data-r936-drive-recovery','data-r936-release','index.groups','index.companionZipArchives','Export verified-source inventory metadata','HISTORICAL_ZIP_AUDIT'])
 assert.ok(ui.includes(marker),'recovery source UI missing '+marker);
assert.ok(archive.includes('<DriveHistoricalRecoveryR936 onAuditRelease={operators?onAuditRelease:undefined}/>'),'recovery inventory and selected-release callback not available in Archive Operators');
console.log('R936 PASS: six split archives, 156 contiguous source-listed parts, 18 companion ZIPs, Drive identities and conservative source boundary.');
