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
