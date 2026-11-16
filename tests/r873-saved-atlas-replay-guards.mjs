import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
const recover=src.slice(src.indexOf('const recoverSavedTrace='),src.indexOf('const downloadCsv='));
assert.ok(recover.startsWith('const recoverSavedTrace='),'saved trace recovery handler must exist');
assert.match(recover,/decodeArtifactsR862\(localStorage\.getItem\(OMEGA_ARTIFACT_STORAGE_R862\)\)\.find\(item=>item\.id===saved\.id\)/,'recovery must read the latest saved artifact');
assert.match(recover,/!current\|\|JSON\.stringify\(current\)!==JSON\.stringify\(saved\)/,'deleted or mutated records must refuse replay');
for(const key of ['payload','addressStart','addressEnd','engine','source']){
 assert.ok(recover.includes('result.artifact.'+(key==='payload'?'payload':'provenance.'+key)+'!==saved.'+(key==='payload'?'payload':'provenance.'+key)),key+' must be checked against replay');
}
assert.match(recover,/setLatestCsv\(\{csv:result\.csv,address,rows:result\.rowCount\}\)/,'verified CSV must be surfaced');
assert.ok(recover.indexOf('setLatestCsv(')>recover.indexOf('Saved SVG does not match'),'CSV must not be published before replay comparison');
assert.match(recover,/catch\(e\)\{setError\('Saved trace recovery rejected:/,'failures must be visible');
console.log('R873 saved Atlas replay guards: PASS (source-level regression only)');
