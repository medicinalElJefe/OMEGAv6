import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src7/workspaces/SharedArtifactLibraryR864.tsx',import.meta.url),'utf8');
const recovery=src.slice(src.indexOf('const recoverSavedTrace='),src.indexOf('const downloadCsv='));
const removal=src.slice(src.indexOf('const removeSaved='),src.indexOf('const exportAll='));
assert.match(src,/rows:number;savedId\?:string/,'CSV state must retain optional saved-artifact identity');
assert.match(recovery,/setLatestCsv\(\{csv:result\.csv,address,rows:result\.rowCount,savedId:saved\.id,savedSnapshot:JSON\.stringify\(saved\)\}\)/,'replay must attach saved identity and exact persisted snapshot');
assert.match(removal,/setLatestCsv\(previous=>previous\?\.savedId===id\?null:previous\)/,'deletion must invalidate matching recovered CSV');
assert.ok(removal.indexOf('setLatestCsv(previous')>removal.indexOf('localStorage.setItem('),'do not invalidate CSV before successful deletion persistence');
assert.match(src,/setLatestCsv\(\{csv:result\.csv,address,rows:result\.rowCount\}\)/,'fresh computation must not be tied to deleted artifact');
console.log('R874 saved trace deletion invalidation: PASS (source-level regression)');

const download=src.slice(src.indexOf('const downloadCsv='),src.indexOf('const removeSaved='));
assert.match(download,/latestCsv\.savedId/,'download must identify replay-backed CSV');
assert.match(download,/JSON\.stringify\(current\)!==latestCsv\.savedSnapshot/,'download must reject altered persisted artifact');
assert.match(download,/setLatestCsv\(null\)/,'stale recovered CSV must be invalidated');
assert.ok(download.indexOf('JSON.stringify(current)')<download.indexOf('URL.createObjectURL'),'persistence check must precede download');
