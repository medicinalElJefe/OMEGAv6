import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createModelArtifactR862,exportArtifactBundleR863,importArtifactBundleR863} from '../src7/workspaces/omegaArtifactSpineR862.ts';
const shell=fs.readFileSync('src7/workspaces/WorkCreateWorkspaceR443.tsx','utf8');
const lib=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
test('R864 Projects and Assets share a single validated artifact library',()=>{
 assert.match(shell,/route==='Projects'\|\|route==='Assets'/);
 assert.match(shell,/<SharedArtifactLibraryR864 onNavigate=\{onNavigate\}/);
 assert.match(lib,/OMEGA_ARTIFACT_STORAGE_R862/);
 assert.match(lib,/decodeArtifactsR862/);
 assert.match(lib,/importArtifactBundleR863/);
 assert.match(lib,/exportArtifactBundleR863/);
});
test('R864 portable results remain model-derived after transfer',()=>{
 const a=createModelArtifactR862('<svg xmlns="http://www.w3.org/2000/svg"></svg>',[0,1],new Date('2026-11-15T00:00:00.000Z'),'atlas-shared-01');
 assert.equal(importArtifactBundleR863(exportArtifactBundleR863([a]),[])[0].provenance.authority,'MODEL_DERIVED');
});

test('R867 same-tab artifact writes notify all active workspaces',()=>{
 const atlas=fs.readFileSync('src7/workspaces/HistoricalConvergenceWorkbenchR667.tsx','utf8');
 const library=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 const spine=fs.readFileSync('src7/workspaces/omegaArtifactSpineR862.ts','utf8');
 assert.match(spine,/window\.dispatchEvent\(new Event\(OMEGA_ARTIFACT_CHANGED_R867\)\)/);
 assert.match(atlas,/setSavedArtifactsR862\(next\);notifyArtifactChangeR867\(\)/);
 assert.match(library,/window\.addEventListener\(OMEGA_ARTIFACT_CHANGED_R867,refresh\)/);
 assert.match(library,/window\.removeEventListener\(OMEGA_ARTIFACT_CHANGED_R867,refresh\)/);
 assert.match(library,/setItems\(next\);notifyArtifactChangeR867\(\)/);
});

test('R868 removing one saved artifact persists the filtered library and synchronizes workspaces',()=>{
 assert.match(lib,/const removeSaved=\(id:string\)=>/);
 assert.match(lib,/latest\.filter\(item=>item\.id!==id\)/);
 assert.match(lib,/localStorage\.setItem\(OMEGA_ARTIFACT_STORAGE_R862,JSON\.stringify\(next\)\)/);
 assert.match(lib,/setItems\(next\);notifyArtifactChangeR867\(\)/);
 assert.match(lib,/onClick=\{\(\)=>removeSaved\(a\.id\)\}/);
});

test('R869 async import reads the current persisted library after file decoding, not a stale render snapshot',()=>{
 assert.match(lib,/const raw=await file\.text\(\);const latest=decodeArtifactsR862\(localStorage\.getItem\(OMEGA_ARTIFACT_STORAGE_R862\)\);const next=importArtifactBundleR863\(raw,latest\)/);
 assert.doesNotMatch(lib,/importArtifactBundleR863\(await file\.text\(\),items\)/);
});

test('R870 export reads persisted artifacts at click time, not a stale component snapshot',()=>{
 assert.match(lib,/const exportAll=\(\)=>\{try\{const latest=decodeArtifactsR862\(localStorage\.getItem\(OMEGA_ARTIFACT_STORAGE_R862\)\);const json=exportArtifactBundleR863\(latest\)/);
 assert.doesNotMatch(lib,/exportArtifactBundleR863\(items\)/);
});

test('R871 computed trace has visible bounded on-screen preview and retains full CSV download',()=>{
 assert.match(lib,/aria-label='Computed Atlas trace preview'/);
 assert.match(lib,/aria-label='Selected computed Atlas trace row'/);
 assert.match(lib,/latestCsv\.csv\.split\(\/\\r\?\\n\/\)\[traceRow\]/);
 assert.match(lib,/Download computed trace CSV/);
 assert.match(lib,/new Blob\(\[latestCsv\.csv\]/);
});

test('R877 user-selected traversal length is bounded before execution and controls the real model executor',()=>{
 assert.match(lib,/id='r877-atlas-length' type='number' min=\{2\} max=\{64\}/);
 assert.match(lib,/setAtlasLength\(e\.currentTarget\.value\)/);
 assert.match(lib,/atlasLength\.trim\(\)===''\|\|!Number\.isInteger\(length\)\|\|length<2\|\|length>64/);
 assert.match(lib,/executeAtlasArtifactR865\(field,address,length\)/);
 assert.doesNotMatch(lib,/executeAtlasArtifactR865\(field,address,32\)/);
});


test('R885 overlapping Atlas compute/replay are refused synchronously before React state updates',()=>{
 const source=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 assert.match(source,/const executionLease=useRef\(false\)/);
 for(const handler of ['computeAndSave','recoverSavedTrace']){
  const start=source.indexOf('const '+handler+'=async');
  assert.ok(start>=0,handler+' exists');
  const body=source.slice(start,source.indexOf('};',start)+2);
  assert.match(body,/if\(executionLease\.current\)return;\s*executionLease\.current=true;setRunning\(true\)/);
  assert.match(body,/finally\{executionLease\.current=false;setRunning\(false\)\}/);
 }
});


test('R886 computed Atlas CSV supports bounded interactive row inspection across the full trace',()=>{
 assert.match(lib,/const \[traceRow,setTraceRow\]=useState\(1\)/);
 assert.match(lib,/id='r886-trace-row' type='number' min=\{1\} max=\{latestCsv\.rows\}/);
 assert.match(lib,/Number\.isInteger\(value\)&&value>=1&&value<=latestCsv\.rows/);
 assert.match(lib,/setTraceRow\(1\);setLatestCsv\(/);
 assert.match(lib,/aria-label='Selected computed Atlas trace row'/);
 assert.match(lib,/Download computed trace CSV/);
});

test('R888 Atlas SVG persistence uses bounded local-host POST and verified readback, retaining browser artifacts on failure',()=>{
 assert.match(lib,/const persistToLocalHost=async\(saved:OmegaArtifactR862\)/);
 assert.match(lib,/if\(executionLease\.current\)return/);
 assert.match(lib,/new TextEncoder\(\)\.encode\(saved\.payload\)\.length>32768/);
 assert.match(lib,/fetch\('\/__omega_local\/artifacts',\{method:'POST'/);
 assert.match(lib,/fetch\('\/__omega_local\/artifacts\/'\+encodeURIComponent\(receipt\.id\)\)/);
 assert.match(lib,/record\.content!==saved\.payload\|\|record\.contentSha256!==receipt\.contentSha256/);
 assert.match(lib,/Browser artifact remains available/);
 assert.match(lib,/finally\{executionLease\.current=false;setRunning\(false\)\}/);
 assert.match(lib,/Persist SVG to local host/);
});

test('R889 saved host SVG can be recovered by receipt UUID with independent SHA-256 validation and bounded preview',()=>{
 assert.match(lib,/const recoverHostArtifact=async\(selectedId\?:string\)=>/);
 assert.match(lib,/fetch\('\/__omega_local\/artifacts\/'\+encodeURIComponent\(id\)\)/);
 assert.match(lib,/record\.id!==id\|\|record\.kind!=='atlas_svg'/);
 assert.match(lib,/crypto\.subtle\.digest\('SHA-256',new TextEncoder\(\)\.encode\(record\.content\)\)/);
 assert.match(lib,/hash!==record\.contentSha256/);
 assert.match(lib,/setRecoveredHostSvg\(\{id,content:record\.content\}\)/);
 assert.match(lib,/aria-label='Recovered verified host SVG'/);
 assert.match(lib,/Download recovered host SVG/);
 assert.match(lib,/finally\{executionLease\.current=false;setRunning\(false\)\}/);
});

test('R890 persistence receipt must independently match SHA-256 of the actual submitted SVG',()=>{
 assert.match(lib,/const localSha256=Array\.from\(new Uint8Array\(await crypto\.subtle\.digest\('SHA-256',new TextEncoder\(\)\.encode\(saved\.payload\)\)\)\)/);
 assert.match(lib,/if\(localSha256!==receipt\.contentSha256\)throw Error\('Host persistence receipt does not match independently hashed SVG'\)/);
});

test('R892 saved host SVGs are recoverable in one click and persistence refreshes the discoverable index',()=>{
 assert.match(lib,/const discoverHostArtifacts=async\(\)=>/);
 assert.match(lib,/fetch\('\/__omega_local\/artifacts'\)/);
 assert.match(lib,/setHostIndex\(items\)/);
 assert.match(lib,/void discoverHostArtifacts\(\);setHostPersistence/);
 assert.match(lib,/onClick=\{\(\)=>\{setHostArtifactId\(item\.id\);void recoverHostArtifact\(item\.id\)\}\}/);
 assert.match(lib,/const id=\(selectedId\?\?hostArtifactId\)\.trim\(\)\.toLowerCase\(\)/);
});
