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


test('R962 any recorded Atlas step can execute compiled-field inspection, including unchanged addresses',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf("aria-label='Inspect selected recorded Atlas state'");
 const end=ui.indexOf("aria-label='Recorded Atlas address transitions'",start);
 assert.ok(start>=0&&end>start,'selected-step inspection is available independently of address transitions');
 const control=ui.slice(start,end);
 assert.match(control,/disabled={running\|\|!localTurnResult\.trace\[selectedExecutionStep\]}/);
 assert.match(control,/setExecutionPlaying\(false\);void inspectAtlas\(localTurnResult\.trace\[selectedExecutionStep\]\.address\)/);
 assert.ok(!control.includes('setSelectedExecutionStep('),'inspection does not alter the recorded replay position');
});

test('R963 offline Atlas cannot offer a verified-host JSON download control',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf("onClick={downloadLocalTurnJson}");
 assert.ok(start>0,'verified execution JSON control exists');
 const control=ui.slice(ui.lastIndexOf('<button',start),ui.indexOf('</button>',start)+9);
 assert.match(control,/disabled=\{running\|\|localTurnResult\.artifact\.id==='offline-model-derived'\}/);
 assert.match(control,/Verified execution JSON unavailable \(offline\)/);
 assert.match(control,/use Portable Atlas JSON export/);
 const handler=ui.slice(ui.indexOf('const downloadLocalTurnJson='),ui.indexOf('const downloadPortableAtlasR924='));
 assert.match(handler,/if\(localTurnResult\.artifact\.id==='offline-model-derived'\)/,'handler retains fail-closed defense');
});

test('R964 selected Atlas inspection produces downloadable computed fields with model-only provenance',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf('const downloadInspectedAtlasJsonR964=');
 const end=ui.indexOf('const exportCompleteAtlas=',start);
 assert.ok(start>=0&&end>start,'inspection export handler exists');
 const body=ui.slice(start,end);
 assert.match(body,/inspectedAddress===null\|\|inspectedValues\.length===0/);
 assert.match(body,/schema:'OMEGA_ATLAS_INSPECTED_FIELDS_R964_V1'/);
 assert.match(body,/provenance:'BROWSER_LOCAL_COMPUTED',modelOnly:true,address:inspectedAddress,fields:inspectedValues/);
 assert.match(body,/JSON\.stringify\(payload,null,2\)/);
 assert.match(body,/link\.click\(\)/);
 const control=ui.slice(ui.indexOf("aria-label='Download inspected Atlas fields JSON'")-25);
 assert.match(control,/disabled=\{running\|\|inspectedAddress===null\|\|inspectedValues\.length===0\|\|\(localTurnResult!==null&&localTurnResult\.trace\[selectedExecutionStep\]\?\.address!==inspectedAddress\)\}/,'JSON export must refuse stale inspection for another selected replay address');
 assert.match(control,/onClick=\{downloadInspectedAtlasJsonR964\}/);
});


test('R973 recorded traversal visibly distinguishes unique addresses, changes, and revisits from full coverage',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf("aria-label='Recorded Atlas traversal summary'");
 assert.ok(start>=0,'recorded traversal summary is rendered in the Atlas replay');
 const summary=ui.slice(start,start+850);
 assert.match(summary,/new Set\(localTurnResult\.trace\.map\(state=>state\.address\)\)\.size/,'distinct addresses use actual trace values');
 assert.match(summary,/state\.address!==localTurnResult\.trace\[i\]\.address/,'address changes compare consecutive states');
 assert.match(summary,/localTurnResult\.trace\.length-new Set/,'revisits count repeated visits');
 assert.match(summary,/not proof of full 20,736-state coverage/,'model trace does not claim full atlas coverage');
});


test('R974 traversal summary exposes bounded coverage percentage and real trace endpoints',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf("aria-label='Recorded Atlas traversal summary'");
 const summary=ui.slice(start,start+1150);
 assert.ok(start>=0);
 assert.match(summary,/100\*new Set\(localTurnResult\.trace\.map\(state=>state\.address\)\)\.size\/20736/);
 assert.match(summary,/\.toFixed\(3\)/);
 assert.match(summary,/localTurnResult\.trace\[0\]\?\.address/);
 assert.match(summary,/localTurnResult\.trace\[localTurnResult\.trace\.length-1\]\?\.address/);
 assert.match(summary,/not proof of full 20,736-state coverage/);
});


test('R975 recorded replay can jump to first repeated address without retaining stale inspection',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
 const start=ui.indexOf("aria-label='Jump to first repeated Atlas address'");
 assert.ok(start>=0,'revisit navigation exists');
 const control=ui.slice(ui.lastIndexOf('<button',start),ui.indexOf('</button>',start)+9);
 assert.match(control,/disabled=\{running\|\|!localTurnResult\.trace\.some/);
 assert.match(control,/trace\.slice\(0,i\)\.some\(previous=>previous\.address===state\.address\)/);
 assert.match(control,/findIndex\(/);
 assert.match(control,/if\(index<0\)return/);
 assert.match(control,/setExecutionPlaying\(false\);setSelectedExecutionStep\(index\);setInspectedAddress\(null\);setInspectedValues\(\[\]\)/);
});
