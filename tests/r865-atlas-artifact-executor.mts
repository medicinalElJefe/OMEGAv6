import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {executeAtlasArtifactR865} from '../src7/workspaces/omegaAtlasArtifactExecutorR865.ts';
import {getMandala20736Field} from '../src/mandala20736Runtime.ts';
test('R865 executes a real Atlas model route into a validated SVG artifact',async()=>{
 const field=await getMandala20736Field();
 const output=executeAtlasArtifactR865(field,11498,12);
 assert.equal(output.artifact.provenance.authority,'MODEL_DERIVED');
 assert.ok(output.rowCount>=2&&output.rowCount<=12,'Cycle-aware trace length must be within the requested maximum');
 assert.equal(output.artifact.provenance.stateCount,output.rowCount);
 assert.match(output.artifact.payload,/<polyline points=/);
 assert.match(output.csv,/\n/);
 assert.equal(output.csv.trim().split('\n').length,output.rowCount+1);
});
test('R865 rejects invalid model addresses and wires execution into Projects and Assets',async()=>{
 const field=await getMandala20736Field();
 assert.throws(()=>executeAtlasArtifactR865(field,-1,12),/Invalid pipeline address/);
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 assert.match(ui,/executeAtlasArtifactR865/);
 assert.match(ui,/Compute and save Atlas SVG here/);
 assert.match(ui,/appendArtifactR862/);
 assert.match(ui,/setLatestCsv\(\{csv:result\.csv,address,rows:result\.rowCount\}\)/);
 assert.match(ui,/Download computed trace CSV/);
 assert.match(ui,/new Blob\(\[latestCsv\.csv\]/);
 assert.match(ui,/id='r865-atlas-address'/);
 assert.match(ui,/value=\{atlasAddress\}/);
 assert.match(ui,/parseAtlasAddressInputR916\(atlasAddress\)/);
 assert.match(ui,/address>=20736/);
});

test('R918 live local Atlas response refuses inconsistent coordinates and initial address before artifact acceptance',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 assert.match(ui,/result\.trace\.some\(\(x,i\)=>/);
 assert.match(ui,/x\.address!==1728\*\(x\.coordinates\[0\]-1\)\+144\*\(x\.coordinates\[1\]-1\)\+12\*\(x\.coordinates\[2\]-1\)\+x\.coordinates\[3\]-1/);
 assert.match(ui,/i===0&&x\.address!==address/);
});

test('R930 host recovery clears stale replay and stops playback before reading artifact',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const recovery=ui.split('const recoverLocalTurns=async(id:string)=>{')[1]?.split('const executionMetrics=')[0];
 assert.ok(recovery,'host recovery handler exists');
 const reset=recovery.indexOf("setExecutionStatus('');setExecutionPlaying(false);setLocalTurnResult(null);setSelectedExecutionStep(0)");
 const read=recovery.indexOf("fetch('/__omega_local/artifacts/'");
 const accept=recovery.indexOf('setLocalTurnResult({trace:data.trace');
 assert.ok(reset>=0&&read>reset&&accept>read,'reset must precede host read and verified display');
});

test('R931 new execution and offline/host imports clear previous success status before validation',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 for(const [start,end] of [
  ['const executeLocalTurns=async()=>{','const recoverLocalTurns=async(id:string)=>{'],
  ['const importPortableAtlasR924=async(file:File)=>{','const saveOfflineAtlasR926=async()=>{'],
  ['const restoreOfflineAtlasR926=async()=>{','const verifyExportedExecutionJson=async(file:File)=>{'],
  ['const verifyExportedExecutionJson=async(file:File)=>{','const executionMetrics=']
 ]){
  const begin=ui.indexOf(start);
  assert.ok(begin>=0,'handler exists: '+start);
  const segment=ui.slice(begin,ui.indexOf(end,begin)>begin?ui.indexOf(end,begin):begin+6000);
  const clear=segment.indexOf("setExecutionStatus('')");
  const validate=segment.indexOf('try{');
  assert.ok(clear>=0&&clear<validate,'stale success must be cleared before validation: '+start);
 }
});

test('R933 offline Atlas chart and CSV exports preserve explicit model-derived provenance',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const csv=ui.split('const downloadLocalTurnCsv=()=>{')[1]?.split('const computeAndSave=')[0];
 assert.ok(csv,'CSV download handler exists');
 assert.match(csv,/offline-model-derived-origin-unverified/);
 assert.match(csv,/step,address,d,p,r,l,provenance,origin_verified/);
 assert.match(csv,/offline\?'false':'true'/);
 assert.match(csv,/offline-model-derived-/);
 const svg=ui.split('const downloadLocalTurnSvg=()=>{')[1]?.split('const downloadLocalTurnJson=')[0];
 assert.ok(svg,'SVG download handler exists');
 assert.match(svg,/offline-model-derived-/);
 assert.match(ui,/Download offline model-derived CSV/);
 assert.match(ui,/Download offline model-derived chart SVG/);
 assert.match(ui,/Offline model-derived trace · /);
});

test('R934 live executor requires artifact identity and type before accepting SHA readback',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const segment=ui.split('const executeLocalTurns=async()=>{')[1]?.split('const recoverLocalTurns=async(id:string)=>{')[0];
 assert.ok(segment,'local executor exists');
 assert.match(segment,/typeof result\.artifact\?\.id!=='string'/);
 assert.match(segment,/\^\[a-f0-9-\]\{36\}\$/);
 assert.match(segment,/saved\.id!==result\.artifact\.id/);
 assert.match(segment,/saved\.kind!=='atlas_execution'/);
 const identity=segment.indexOf("saved.id!==result.artifact.id");
 const hash=segment.indexOf("crypto.subtle.digest('SHA-256',new TextEncoder().encode(saved.content))");
 const accept=segment.indexOf('setLocalTurnResult(result)');
 assert.ok(identity>=0&&hash>identity&&accept>hash,'identity and content digest must precede display');
});

test('R935 local executor verifies bounded artifact schema before displaying trace',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const segment=ui.split('const executeLocalTurns=async()=>{')[1]?.split('const recoverLocalTurns=async(id:string)=>{')[0];
 assert.ok(segment,'local executor handler exists');
 const bound=segment.indexOf('saved.content.length>131072');
 const schema=segment.indexOf("artifactPayload.schema!=='OMEGA_LOCAL_ATLAS_EXECUTION_R910_V1'");
 const digest=segment.indexOf('digest!==result.artifact.contentSha256');
 const display=segment.indexOf('setLocalTurnResult(result)');
 assert.ok(bound>=0&&schema>bound&&digest>schema&&display>digest,'bounded schema and digest validation precede visible result');
});

test('R936 browser-local Atlas trace can be cleared without deleting host artifacts',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const segment=ui.split('const clearSavedOfflineAtlasR936=()=>{')[1]?.split('const restoreOfflineAtlasR926=async()=>{')[0];
 assert.ok(segment,'clear handler exists');
 assert.match(segment,/localStorage\.removeItem\('omega\.portable\.atlas\.r926'\)/);
 assert.doesNotMatch(segment,/fetch\(|removeSaved\(|deleteArtifact/);
 assert.match(ui,/onClick=\{clearSavedOfflineAtlasR936\}>Clear saved offline trace from this browser/);
});

test('R937 browser-local Atlas save verifies exact storage readback and portable integrity before success',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const segment=ui.split('const saveOfflineAtlasR926=async()=>{')[1]?.split('const clearSavedOfflineAtlasR936=()=>{')[0];
 assert.ok(segment,'browser save handler exists');
 const write=segment.indexOf("localStorage.setItem('omega.portable.atlas.r926',serialized)");
 const read=segment.indexOf("localStorage.getItem('omega.portable.atlas.r926')");
 const match=segment.indexOf('persisted!==serialized');
 const verify=segment.indexOf('await readPortableAtlasR924(JSON.parse(persisted))');
 const success=segment.indexOf("setExecutionStatus('Saved and readback-verified ");
 assert.ok(write>=0&&read>write&&match>read&&verify>match&&success>verify,'persistent readback and integrity validation must precede success');
 assert.match(segment,/serialized.length>131072/);
 assert.match(segment,/recovered.trace.length!==payload.trace.length/);
});

test('R938 browser Atlas persistence uses byte limits and verifies deletion before success',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const save=ui.split('const saveOfflineAtlasR926=async()=>{')[1]?.split('const clearSavedOfflineAtlasR936=()=>{')[0];
 const clear=ui.split('const clearSavedOfflineAtlasR936=()=>{')[1]?.split('const restoreOfflineAtlasR926=async()=>{')[0];
 const restore=ui.split('const restoreOfflineAtlasR926=async()=>{')[1]?.split('const verifyExportedExecutionJson=async')[0];
 assert.ok(save&&clear&&restore,'save, clear and restore handlers must exist');
 assert.match(save,/new TextEncoder\(\)\.encode\(serialized\)\.byteLength>131072/);
 assert.match(restore,/new TextEncoder\(\)\.encode\(stored\)\.byteLength>131072/);
 const remove=clear.indexOf("localStorage.removeItem('omega.portable.atlas.r926')");
 const verify=clear.indexOf("localStorage.getItem('omega.portable.atlas.r926')!==null");
 const success=clear.indexOf("setExecutionStatus('Saved browser-local Atlas trace cleared.");
 assert.ok(remove>=0&&verify>remove&&success>verify,'clear success requires storage absence readback');
 assert.doesNotMatch(clear,/fetch\(|deleteArtifact|removeSaved\(/);
});
