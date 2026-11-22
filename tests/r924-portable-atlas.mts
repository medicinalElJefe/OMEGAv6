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
 assert.ok(restore.indexOf('setLocalTurnResult(null)')>=0 && restore.indexOf('setLocalTurnResult(null)')<restore.indexOf('readPortableAtlasR924'),'restore clears stale replay before verifying');
 const verified=restore.indexOf('const payload=await readPortableAtlasR924(JSON.parse(stored));');
 const displayed=restore.indexOf('setLocalTurnResult({trace:payload.trace',verified);
 assert.ok(verified>=0 && displayed>verified,'restore must verify before displaying a recovered trace');
 assert.match(restore,/new TextEncoder\(\)\.encode\(stored\)\.byteLength>131072/);
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

test('R929 failed verified-host JSON recovery cannot retain a stale trace',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf('const verifyExportedExecutionJson=');
 const end=ui.indexOf('const downloadLocalTurnCsv=',start);
 assert.ok(start>=0&&end>start,'verified-host recovery handler exists');
 const body=ui.slice(start,end);
 const validation=body.indexOf("if(file.size>131072)");
 const clear=body.indexOf('setLocalTurnResult(null)');
 const reset=body.indexOf('setSelectedExecutionStep(0)');
 const display=body.indexOf('setLocalTurnResult({trace,artifact:');
 assert.ok(clear>=0&&reset>=0&&validation>clear&&validation>reset,'clear prior trace and cursor before parsing');
 assert.ok(display>validation,'only display a validated trace');
});


test('R959 selecting a recorded transition inspects its compiled destination address',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf("aria-label='Recorded Atlas address transitions'");
 const end=ui.indexOf("aria-label='Selected Atlas transition coordinate deltas'",start);
 assert.ok(start>=0&&end>start,'recorded transition selector and coordinate display exist');
 const selector=ui.slice(start,end);
 assert.match(selector,/state\.address!==localTurnResult\.trace\[i\]\.address/,'only real changes are selectable');
 assert.match(selector,/setExecutionPlaying\(false\);setSelectedExecutionStep\(state\.step\);void inspectAtlas\(state\.address\)/,'transition selection pauses playback and inspects the compiled destination');
 const inspect=ui.slice(ui.indexOf('const inspectAtlas=async('),ui.indexOf('const exportCompleteAtlas='));
 assert.match(inspect,/inspectAtlasAddressR897\(field,address\)/,'inspection executes against the compiled model');
 assert.match(inspect,/setInspectedAddress\(address\);setInspectedValues\(values\)/,'inspection produces visible field values');
});

test('R960 Atlas inspection clears stale address and values before compiling another destination',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf('const inspectAtlas=async(');
 const end=ui.indexOf('const exportCompleteAtlas=',start);
 assert.ok(start>=0&&end>start,'Atlas inspector exists');
 const body=ui.slice(start,end);
 const clear=body.indexOf('setInspectedAddress(null);setInspectedValues([]);');
 const execute=body.indexOf('const field=await getMandala20736Field();');
 const display=body.indexOf('setInspectedAddress(address);setInspectedValues(values);');
 assert.ok(clear>=0&&execute>clear&&display>execute,'clear stale inspection before compilation; display only computed values');
 assert.match(body,/catch\(e\)\{setError\('Atlas inspection rejected:/,'failed compilation must surface an error');
});

test('R961 execution and recovery clear stale compiled inspection from a previous trace',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 for(const name of ['executeLocalTurns','recoverLocalTurns','importPortableAtlasR924','restoreOfflineAtlasR926']){
  const start=ui.indexOf('const '+name+'=async');
  assert.ok(start>=0,name+' exists');
  const body=ui.slice(start,start+900);
  const reset=body.indexOf('setLocalTurnResult(null);setSelectedExecutionStep(0);');
  assert.ok(reset>=0,name+' resets trace');
  assert.ok(body.indexOf('setInspectedAddress(null);setInspectedValues([]);',reset)>reset,name+' invalidates old computed values');
 }
});
