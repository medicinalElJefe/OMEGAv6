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
