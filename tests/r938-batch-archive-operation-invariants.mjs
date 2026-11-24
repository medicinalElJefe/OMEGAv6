import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('tools/omega_local_hub_r881.py','utf8');
const ui=readFileSync('src7/workspaces/OmegaLocalHubPanelR884.tsx','utf8');
const tests=readFileSync('tests/test_omega_local_hub_r881.py','utf8');
const ledger=JSON.parse(readFileSync('audit/omega-active-full-build-ledger-r937.json','utf8'));
for(const marker of [
  'def audit_historical_release_set_r938(root: Path, args: dict)',
  'if operation=="HISTORICAL_RELEASE_SET_AUDIT"',
  'return audit_historical_release_set_r938(self.root,args)',
  'R938_RELEASE_PART_SIZE_MISMATCH_HELD',
  'R938_RELEASE_PART_SHA256_MISMATCH_HELD',
  'historicalRuntimeParityProven":False',
  'canonicalWrites":0'
])assert.ok(source.includes(marker),'R938 local execution contract missing: '+marker);
assert.match(source,/OPS = .*"HISTORICAL_RELEASE_SET_AUDIT"/,'R938 not a registered durable job');
for(const marker of ["'HISTORICAL_RELEASE_SET_AUDIT'","args.release=releaseId","value={releaseId}","source.includes('..')"])
 assert.ok(ui.includes(marker),'R938 interface missing '+marker);
assert.ok(tests.includes('test_r938_full_release_source_set_batch_hash_and_fail_closed'),'R938 positive and refusal tests absent');
assert.equal(ledger.workstreams.find(w=>w.id==='W08').evidenceState,'HELD','archive status must remain held without bytes');
assert.ok(ledger.blockers.some(b=>b.id==='ZIP_BYTES'&&b.state==='OPEN'),'pending historical ZIP recovery silently removed');
const recovery=readFileSync('src/DriveHistoricalRecoveryR936.tsx','utf8');
const archiveSurface=readFileSync('src/ArchiveGovernanceControl.tsx','utf8');
const workspace=readFileSync('src7/workspaces/SystemEvidenceWorkspaceR445.tsx','utf8');
assert.ok(recovery.includes('data-r941-select-release={g.id}'),'recovery source selection is not actionable');
assert.ok(archiveSurface.includes('onAuditRelease={operators?onAuditRelease:undefined}'),'governed archive operator callback not wired');
assert.ok(workspace.includes('onAuditRelease={setAuditRelease}'),'historical source UI and local executor not integrated');
assert.ok(workspace.includes('requestedRelease={auditRelease}'),'selected release not passed to local worker interface');
assert.ok(ui.includes("setOperation('HISTORICAL_RELEASE_SET_AUDIT')"),'local audit form does not become actionable');
assert.ok(ui.includes('No job has started.'),'selection must never auto-execute');
console.log('R938 source registration PASS · durable read-only batch SHA audit · 156-part provenance contract not promoted to runtime authority');
