import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {makePortableAtlasR924,readPortableAtlasR924} from '../src7/workspaces/omegaPortableAtlasR924.ts';
if(!globalThis.crypto)Object.defineProperty(globalThis,'crypto',{value:webcrypto});
const trace=[{step:0,address:0,coordinates:[1,1,1,1]},{step:1,address:1728,coordinates:[2,1,1,1]}];
test('R924 exports a self-contained model-only trace and restores without host fetch',async()=>{
 const exported=await makePortableAtlasR924(trace);
 assert.equal(exported.authority,'MODEL_DERIVED_UNATTESTED');
 assert.deepEqual((await readPortableAtlasR924(JSON.parse(JSON.stringify(exported)))).trace,trace);
});
test('R924 refuses tampering, address mismatch, extra metadata and malformed steps',async()=>{
 const exported=await makePortableAtlasR924(trace);
 await assert.rejects(readPortableAtlasR924({...exported,trace:[...trace.slice(0,1),{...trace[1],address:1729}]}),/step invalid/);
 await assert.rejects(readPortableAtlasR924({...exported,trace:[trace[0]]}),/SHA-256 mismatch/);
 await assert.rejects(readPortableAtlasR924({...exported,provider:'live'}),/metadata/);
 await assert.rejects(makePortableAtlasR924([{step:0,address:0,coordinates:[1,1,1,1],verified:true}]),/step invalid/);
});

test('R925 offline replay cannot be mislabeled as verified local-host R922 export',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf('const downloadLocalTurnJson=');
 const end=ui.indexOf('const downloadPortableAtlasR924=',start);
 assert.ok(start>=0&&end>start,'Atlas export handlers exist');
 const legacy=ui.slice(start,ui.indexOf('const downloadLocalTurnCsv=',start)>0?ui.indexOf('const downloadLocalTurnCsv=',start):end);
 assert.match(legacy,/artifact\.id==='offline-model-derived'/);
 assert.match(legacy,/Use Portable Atlas JSON export/);
 assert.match(legacy,/provenance:'verified-local-executor-artifact'/);
 assert.ok(legacy.indexOf("artifact.id==='offline-model-derived'")<legacy.indexOf("provenance:'verified-local-executor-artifact'"),'refusal precedes verified-host claim');
});


test('R926 browser persistence uses portable integrity verification before replay',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const save=ui.slice(ui.indexOf('const saveOfflineAtlasR926='),ui.indexOf('const restoreOfflineAtlasR926='));
 const restore=ui.slice(ui.indexOf('const restoreOfflineAtlasR926='),ui.indexOf('const verifyExportedExecutionJson='));
 assert.match(save,/makePortableAtlasR924\(localTurnResult\.trace\)/);
 assert.match(save,/localStorage\.setItem\('omega\.portable\.atlas\.r926'/);
 assert.match(restore,/readPortableAtlasR924\(JSON\.parse\(stored\)\)/);
 assert.ok(restore.indexOf('readPortableAtlasR924')<restore.indexOf('setLocalTurnResult'),'restore must verify before displaying');
 assert.match(restore,/stored\.length>131072/);
 assert.match(restore,/offline-model-derived/);
 assert.match(ui,/Save offline trace in this browser/);
 assert.match(ui,/Restore saved offline trace/);
});


test('R927 rejected offline recovery cannot leave an older trace visible',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 for(const [handler,next] of [['const importPortableAtlasR924=','const saveOfflineAtlasR926='],['const restoreOfflineAtlasR926=','const verifyExportedExecutionJson=']]){
  const start=ui.indexOf(handler),end=ui.indexOf(next,start);
  assert.ok(start>=0&&end>start,'recovery handler exists');
  const body=ui.slice(start,end);
  assert.ok(body.indexOf('setLocalTurnResult(null)')>=0,'clear prior replay before import');
  assert.ok(body.indexOf('setLocalTurnResult(null)')<body.indexOf('readPortableAtlasR924('),'clear prior replay before integrity validation');
  assert.ok(body.indexOf('setSelectedExecutionStep(0)')<body.indexOf('readPortableAtlasR924('),'reset cursor before integrity validation');
 }
});
