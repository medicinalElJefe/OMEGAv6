import fs from 'node:fs';
import assert from 'node:assert/strict';

const worker=fs.readFileSync('src/workerR253.js','utf8');
const surface=fs.readFileSync('src/HybridExperienceLedgerR253.tsx','utf8');
const action=fs.readFileSync('src/HybridActionRuntimeR247.tsx','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');

assert.ok(wrangler.includes('"main": "src/workerR253.js"'),'R253 must be the deployed successor entrypoint');
assert.ok(worker.includes("from './workerR116.js'"),'R253 must inherit the established R116 execution spine');
assert.ok(worker.includes('export class OmegaRuntime extends OmegaRuntimeR116'),'R253 must preserve the existing durable runtime class lineage');
assert.ok(worker.includes("path==='/api/hybrid/experience-ledger'&&request.method==='GET'"),'R253 must expose a GET-only experience ledger endpoint');
assert.ok(worker.includes("x-omega-bridge-id")&&worker.includes("x-omega-bridge-secret"),'R253 export must require current bridge authentication material');
for(const token of ['rawBridgeId:false','rawDeviceId:false','projectPath:false','localPath:false','stdout:false','logs:false','rawFailureText:false','outputPaths:false'])assert.ok(worker.includes(token),`R253 sanitation contract missing ${token}`);
for(const forbidden of ["request.method==='POST'","request.method==='PUT'","request.method==='DELETE'",'/api/hybrid/jobs\',{',"'/api/missions',{",'CanonState admission:true'])assert.ok(!worker.includes(forbidden),`R253 ledger acquired forbidden execution primitive ${forbidden}`);
assert.ok(worker.includes('readOnly:true,dispatch:false,mutation:false,promotion:false,productionDeploy:false,canonAdmission:false'),'R253 authority declaration must remain observation-only');
assert.ok(surface.includes("api.get<Ledger>('/api/hybrid/experience-ledger?limit=250')"),'R253 UI must consume the authenticated ledger endpoint');
assert.ok(surface.includes('Export sanitized JSON'),'R253 UI must expose a local sanitized export action');
assert.ok(action.includes("import HybridExperienceLedgerR253 from './HybridExperienceLedgerR253'" )&&action.includes('<HybridExperienceLedgerR253/>'),'R253 ledger must be mounted on the real Hybrid action surface');
console.log('R253 Hybrid experience-ledger invariants: PASS');
