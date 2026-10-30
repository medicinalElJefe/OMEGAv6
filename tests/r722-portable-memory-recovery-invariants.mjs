import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digestMemoryR722,verifyMemoryRowsR722,exportMemoryBundleR722,
 verifyMemoryBundleR722,mergeMemoryBundleR722,MEMORY_SCHEMA_R722} from '../src/portableMemoryRecoveryR722.mjs';

async function row(id,address,note){
 const core={address,stateId:address+1,note,metrics:{continuity:0.42,plasticity:0.13},
  decision:'STAY',routeNext:address+1,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
 return {id,at:1793347200000,...core,sha256:await digestMemoryR722(JSON.stringify(core))};
}
const first=await row('r722-snapshot-0001',42,'One continuity observation');
const second=await row('r722-snapshot-0002',43,'A second state');
const original=[first,second];
assert.deepEqual(await verifyMemoryRowsR722(original),{count:2,truthClass:'VERIFIED_BROWSER_LOCAL_DIGEST_ONLY'});
const bundle=await exportMemoryBundleR722(original);
assert.equal(bundle.schema,MEMORY_SCHEMA_R722);
assert.deepEqual((await verifyMemoryBundleR722(JSON.stringify(bundle))).rows,original);
const portable=JSON.stringify(bundle);
assert.deepEqual(await mergeMemoryBundleR722([],portable),{rows:original,added:2,existing:0,truthClass:'BROWSER_LOCAL_PORTABLE_RECOVERY_ONLY'});
assert.deepEqual(await mergeMemoryBundleR722([first],portable),{rows:original,added:1,existing:1,truthClass:'BROWSER_LOCAL_PORTABLE_RECOVERY_ONLY'});
assert.deepEqual(original,[first,second],'recovery cannot mutate source snapshots');
const altered=structuredClone(bundle);altered.rows[0].note='forged note';
await assert.rejects(verifyMemoryBundleR722(JSON.stringify(altered)),/digest mismatch/);
const envelope=structuredClone(bundle);envelope.rows[0].at+=1;
await assert.rejects(verifyMemoryBundleR722(JSON.stringify(envelope)),/envelope digest mismatch/);
const badAuthority=structuredClone(first);badAuthority.authority='CANON_STATE';
await assert.rejects(verifyMemoryRowsR722([badAuthority]),/authority refused/);
const badAddress=structuredClone(first);badAddress.address=20736;
await assert.rejects(verifyMemoryRowsR722([badAddress]),/authority refused/);
await assert.rejects(verifyMemoryRowsR722([first,first]),/duplicate/);
await assert.rejects(verifyMemoryBundleR722('{"schema":"FAKE"}'),/schema refused/);
await assert.rejects(verifyMemoryBundleR722('x'.repeat(524289)),/size refused/);
const collision=await row(first.id,44,'different valid note');
await assert.rejects(mergeMemoryBundleR722([collision],portable),/conflicting memory identity/);
const many=Array.from({length:257},(_,i)=>({...first,id:'many-'+i}));
await assert.rejects(verifyMemoryRowsR722(many),/bounded memory row count/);
const ui=readFileSync(new URL('../src7/workspaces/MemoryRecoveryR722.tsx',import.meta.url),'utf8');
const host=readFileSync(new URL('../src7/workspaces/WorkCreateWorkspaceR443.tsx',import.meta.url),'utf8');
const memory=readFileSync(new URL('../src/OmegaEvidenceMemoryR28.tsx',import.meta.url),'utf8');
const browser=readFileSync(new URL('./r707-woven-topology-browser-e2e.mjs',import.meta.url),'utf8');
for(const token of ['data-r722-verify','data-r722-export','data-r722-import','data-r722-import-json',
 'data-r722-export-json','data-r722-file','data-r722-boundary'])
 assert.ok(ui.includes(token),'R722 UI missing '+token);
assert.ok(host.includes('<MemoryRecoveryR722/>'),'R722 not mounted on native Memory route');
assert.ok(memory.includes('omega-r722-memory-updated'),'R28 snapshots do not refresh after verified import');
assert.ok(memory.includes('verifyMemoryRowsR722([x])')&&memory.includes('data-r722-replay-error'),'R28 replay bypasses source digest verification');
assert.ok(memory.includes('verifyMemoryRowsR722(persisted)')&&memory.includes('MEMORY_LIMIT_R722')&&
 memory.includes('localState.write(key,next)')&&memory.includes('capture refused'),
 'R28 capture must refuse corrupt or over-capacity persisted memory before writing');
assert.ok(memory.includes('deletion refused')&&memory.includes('reload before deletion'),
 'R28 deletion must refuse corrupt or changed local memory');
assert.ok(browser.includes('R28 capture overwrote corrupted local memory'),
 'R722 desktop/mobile browser proof must reject destructive capture');
assert.ok(browser.includes('data-r722-memory-recovery'),'R722 desktop/mobile production browser proof not wired');
console.log('R722 portable R28 memory export, independent digests, non-destructive merge, tamper refusals and OMEGA 7 wiring PASS');
