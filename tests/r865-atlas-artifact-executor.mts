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
