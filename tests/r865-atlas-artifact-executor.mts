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
 const bound=segment.indexOf('new TextEncoder().encode(saved.content).byteLength>131072');
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
 assert.match(segment,/new TextEncoder\(\)\.encode\(serialized\)\.byteLength>131072/);
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


test('R940 bounds local artifact readbacks in UTF-8 bytes before accepting recovered content',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const execution=ui.split('const executeLocalTurns=async()=>{')[1]?.split('const recoverLocalTurns=async(id:string)=>{')[0];
 const recovery=ui.split('const recoverLocalTurns=async(id:string)=>{')[1]?.split('const executionMetrics=')[0];
 const exported=ui.split('const verifyExportedExecutionJson=async(file:File)=>{')[1]?.split('const downloadLocalTurnCsv=')[0];
 assert.ok(execution&&recovery&&exported,'all three local readback handlers must exist');
 for(const [name,handler] of [['execute',execution],['recover',recovery],['verify export',exported]]){
  const bound=handler.indexOf('new TextEncoder().encode(saved.content).byteLength>131072');
  const accept=handler.lastIndexOf('setLocalTurnResult(');
  assert.ok(bound>=0&&accept>bound,name+' must check UTF-8 byte length before accepting artifact');
 }
 assert.doesNotMatch(execution,/saved\.content\.length>131072/);
});


test('R942 selected Atlas playback state can seed the next real local execution',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const start=ui.indexOf("aria-label='Use selected Atlas trace address as next start'");
 assert.ok(start>0,'replay-to-executor action is visible');
 const button=ui.slice(start-500,start+140);
 assert.match(button,/localTurnResult\.trace\[Math\.min\(selectedExecutionStep,localTurnResult\.trace\.length-1\)\]/);
 assert.match(button,/setAtlasAddress\(String\(step\.address\)\)/);
 assert.match(button,/setExecutionPlaying\(false\)/);
 assert.match(button,/disabled=\{running\}/);
 const executor=ui.split('const executeLocalTurns=async()=>{')[1]?.split('const recoverLocalTurns=async(id:string)=>{')[0];
 assert.ok(executor&&executor.includes('parseAtlasAddressInputR916(atlasAddress)'),'new execution consumes the selected Atlas start address');
});


test('R943 selected Atlas step exports inspectable model-state JSON with provenance',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const segment=ui.split('const downloadSelectedAtlasStepR943=()=>{')[1]?.split('const downloadLocalTurnJson=()=>{')[0];
 assert.ok(segment,'selected step exporter exists');
 assert.match(segment,/OMEGA_ATLAS_SELECTED_STEP_R943_V1/);
 assert.match(segment,/selectedExecutionStep/);
 assert.match(segment,/sourceTraceSha256:localTurnResult\.artifact\.contentSha256/);
 assert.match(segment,/offline-model-derived-origin-unverified/);
 assert.match(segment,/originVerified:!offline/);
 assert.match(segment,/coordinates:\{D:selected\.coordinates\[0\]/);
 assert.match(segment,/physicalMeasurement:false,canonAdmission:false/);
 assert.match(ui,/onClick=\{downloadSelectedAtlasStepR943\}>Download selected step JSON/);
});

test('R944 selected-step download is valid JSON with a real newline terminator',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const segment=ui.split('const downloadSelectedAtlasStepR943=()=>{')[1]?.split('const downloadLocalTurnJson=()=>{')[0];
 assert.ok(segment,'selected-step exporter must exist');
 assert.ok(segment.includes("JSON.stringify(payload,null,2)+'\\n'"),'export must append a real newline escape');
 assert.ok(!segment.includes("JSON.stringify(payload,null,2)+'\\\\n'"),'literal backslash-n would invalidate downloaded JSON');
 const example={schema:'OMEGA_ATLAS_SELECTED_STEP_R943_V1',step:1,address:11498};
 const serialized=JSON.stringify(example,null,2)+'\n';
 assert.deepEqual(JSON.parse(serialized),example);
 assert.equal(serialized.charCodeAt(serialized.length-1),10);
});

test('R945 trace address lookup advances to next recorded visit without inventing execution',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 assert.match(ui,/Find recorded address/);
 assert.match(ui,/Find next visit/);
 assert.match(ui,/traceFindAddress\.trim\(\)/);
 assert.match(ui,/Number\.isSafeInteger\(address\)/);
 assert.match(ui,/address>20735/);
 assert.match(ui,/localTurnResult\.trace\.filter\(x=>x\.address===address\)/);
 assert.match(ui,/matches\.find\(x=>x\.step>selectedExecutionStep\)\?\?matches\[0\]/);
 assert.match(ui,/setExecutionPlaying\(false\);setSelectedExecutionStep\(next\.step\)/);
 assert.match(ui,/is not recorded in this/);
 const trace=[{step:0,address:3},{step:1,address:5},{step:2,address:3}];
 const next=(address:number,current:number)=>{const matches=trace.filter(x=>x.address===address);return (matches.find(x=>x.step>current)??matches[0])?.step};
 assert.equal(next(3,0),2);
 assert.equal(next(3,2),0);
 assert.equal(next(5,0),1);
 assert.equal(next(8,0),undefined);
});

test('R946 Atlas visit index exports actual distinct recorded visits with provenance',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const segment=ui.split('const downloadAtlasVisitIndexR946=()=>{')[1]?.split('const downloadSelectedAtlasStepR943=()=>{')[0];
 assert.ok(segment,'visit index export handler exists');
 assert.match(ui,/onClick=\{downloadAtlasVisitIndexR946\}>Download address visit index CSV/);
 assert.match(segment,/for\(const state of localTurnResult\.trace\)/);
 assert.match(segment,/prior\.count\+\+/);
 assert.match(segment,/prior\.last=state\.step/);
 assert.match(segment,/sort\(\(a,b\)=>a\[0\]-b\[0\]\)/);
 assert.match(segment,/source_trace_sha256,provenance/);
 assert.match(segment,/offline-model-derived-origin-unverified/);
 assert.match(segment,/verified-local-executor-artifact/);
 assert.ok(segment.includes(String.raw`lines.join('\r\n')`),'CSV uses real CRLF escapes');
 const trace=[{step:0,address:12},{step:1,address:7},{step:2,address:12},{step:3,address:7},{step:4,address:12}];
 const visits=new Map<number,{count:number;first:number;last:number}>();
 for(const state of trace){const prior=visits.get(state.address);if(prior){prior.count++;prior.last=state.step}else visits.set(state.address,{count:1,first:state.step,last:state.step})}
 assert.deepEqual(Array.from(visits.entries()).sort((a,b)=>a[0]-b[0]),[[7,{count:2,first:1,last:3}],[12,{count:3,first:0,last:4}]]);
});

test('R947 Atlas playback can navigate backward through actual address visits with wraparound',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const start=ui.indexOf('Find next visit</button>');
 const end=ui.indexOf('Find previous visit</button>',start);
 assert.ok(start>=0&&end>start,'previous-visit button follows next-visit control');
 const segment=ui.slice(start,end);
 assert.match(segment,/traceFindAddress\.trim\(\)/);
 assert.match(segment,/Number\.isSafeInteger\(address\)/);
 assert.match(segment,/address>20735/);
 assert.match(segment,/localTurnResult\.trace\.filter\(x=>x\.address===address\)/);
 assert.match(segment,/matches\.filter\(x=>x\.step<selectedExecutionStep\)\.at\(-1\)\?\?matches\[matches\.length-1\]/);
 assert.match(segment,/setExecutionPlaying\(false\);setSelectedExecutionStep\(previous\.step\)/);
 assert.match(segment,/is not recorded in this/);
 const trace=[{step:0,address:3},{step:1,address:5},{step:2,address:3},{step:3,address:3}];
 const previous=(address:number,current:number)=>{const matches=trace.filter(x=>x.address===address);return (matches.filter(x=>x.step<current).at(-1)??matches[matches.length-1])?.step};
 assert.equal(previous(3,3),2);
 assert.equal(previous(3,2),0);
 assert.equal(previous(3,0),3);
 assert.equal(previous(5,0),1);
 assert.equal(previous(8,0),undefined);
});

test('R948 playback jumps to next actual address transition and refuses an absent transition',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const start=ui.indexOf('Find previous visit</button>');
 const end=ui.indexOf('Next address change</button>',start);
 assert.ok(start>=0&&end>start,'transition navigation is available alongside address visit search');
 const segment=ui.slice(start,end);
 assert.match(segment,/localTurnResult\.trace\.find\(x=>x\.step>selectedExecutionStep&&x\.address!==current\)/);
 assert.match(segment,/setExecutionPlaying\(false\)/);
 assert.match(segment,/setSelectedExecutionStep\(changed\.step\)/);
 assert.match(segment,/No later address change/);
 const trace=[{step:0,address:7},{step:1,address:7},{step:2,address:9},{step:3,address:9},{step:4,address:7}];
 const nextChange=(step:number)=>trace.find(x=>x.step>step&&x.address!==trace[step].address)?.step;
 assert.equal(nextChange(0),2);
 assert.equal(nextChange(1),2);
 assert.equal(nextChange(2),4);
 assert.equal(nextChange(3),4);
 assert.equal(nextChange(4),undefined);
});

test('R949 previous address change skips repeated states and refuses nonexistent earlier changes',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const button=ui.split('}}>Next address change</button>')[1]?.split('}}>Previous address change</button>')[0];
 assert.ok(button,'previous distinct-address navigation is visible');
 assert.match(button,/previousIndex=selectedExecutionStep-1/);
 assert.match(button,/while\(previousIndex>=0&&localTurnResult\.trace\[previousIndex\]\.address===current\)previousIndex--/);
 assert.match(button,/previousIndex<0/);
 assert.match(button,/setExecutionPlaying\(false\)/);
 assert.match(button,/setSelectedExecutionStep\(previousIndex\)/);
 const prior=(addresses:number[],at:number)=>{const current=addresses[at];let index=at-1;while(index>=0&&addresses[index]===current)index--;return index};
 assert.equal(prior([10,10,12,12,14],4),3);
 assert.equal(prior([10,10,12,12,14],3),1);
 assert.equal(prior([10,10,12,12,14],1),-1);
 assert.equal(prior([10,12,10],2),1);
});

test('R950 exports only actual address transitions as parseable provenance-bearing CSV',()=>{
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const start=ui.indexOf('const downloadAtlasTransitionsR950=()=>');
 const end=ui.indexOf('const downloadSelectedAtlasStepR943=()=>',start);
 assert.ok(start>=0&&end>start,'transition export handler exists');
 const handler=ui.slice(start,end);
 assert.match(handler,/current\.address!==previous\.address/);
 assert.match(handler,/source_trace_sha256,provenance/);
 assert.match(handler,/offline-model-derived-origin-unverified/);
 assert.match(handler,/verified-local-executor-artifact/);
 assert.ok(handler.includes(String.raw`lines.join('\r\n')+'\r\n'`),'CSV uses real CRLF escapes, not literal backslash sequences');
 assert.match(ui,/onClick={downloadAtlasTransitionsR950}>Download address transitions CSV/);
 const trace=[{step:0,address:10},{step:1,address:10},{step:2,address:11},{step:3,address:11},{step:4,address:10}];
 const rows=trace.slice(1).flatMap((state,i)=>state.address===trace[i].address?[]:[[trace[i].step,state.step,trace[i].address,state.address].join(',')]);
 assert.deepEqual(rows,['1,2,10,11','3,4,11,10']);
 assert.equal(rows.join('\r\n').split('\r\n').length,2);
});
