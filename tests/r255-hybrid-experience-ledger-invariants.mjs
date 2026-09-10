import fs from 'node:fs';
import assert from 'node:assert/strict';

const worker=fs.readFileSync('src/workerR255.js','utf8');
const surface=fs.readFileSync('src/HybridExperienceLedgerR255.tsx','utf8');
const link=fs.readFileSync('src/HybridLinkR32.tsx','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');

assert.ok(wrangler.includes('"main": "src/workerR255.js"'),'R255 must be the deployed successor entrypoint');
assert.ok(worker.includes("from './workerR116.js'"),'R255 must inherit the established R116 execution spine');
assert.ok(worker.includes('export class OmegaRuntime extends OmegaRuntimeR116'),'R255 must preserve the existing durable runtime class lineage');
assert.ok(worker.includes("path==='/api/hybrid/experience-ledger'&&request.method==='GET'"),'R255 must expose a GET-only experience ledger endpoint');
assert.ok(worker.includes("x-omega-bridge-id")&&worker.includes("x-omega-bridge-secret"),'R255 export must require current bridge authentication material');
for(const token of ['rawBridgeId:false','rawDeviceId:false','projectPath:false','localPath:false','stdout:false','logs:false','rawFailureText:false','outputPaths:false'])assert.ok(worker.includes(token),`R255 sanitation contract missing ${token}`);
for(const forbidden of ["request.method==='POST'","request.method==='PUT'","request.method==='DELETE'","'/api/hybrid/jobs'","'/api/missions',{",'canonAdmission:true'])assert.ok(!worker.includes(forbidden),`R255 ledger acquired forbidden execution primitive ${forbidden}`);
assert.ok(worker.includes('readOnly:true,dispatch:false,mutation:false,promotion:false,productionDeploy:false,canonAdmission:false'),'R255 authority declaration must remain observation-only');
assert.ok(surface.includes("api.get<Ledger>('/api/hybrid/experience-ledger?limit=250')"),'R255 UI must consume the authenticated ledger endpoint');
assert.ok(surface.includes('Export sanitized JSON'),'R255 UI must expose a local sanitized export action');
assert.ok(link.includes("import HybridExperienceLedgerR255 from './HybridExperienceLedgerR255'" )&&link.includes('<HybridExperienceLedgerR255/>'),'R255 ledger must be mounted on the real Hybrid surface');
assert.ok(link.includes('<HybridOutcomeClosureR254/>')&&link.indexOf('<HybridOutcomeClosureR254/>')<link.indexOf('<HybridExperienceLedgerR255/>'),'R255 must preserve and follow R254 outcome closure rather than replace it');
console.log('R255 Hybrid experience-ledger invariants: PASS');
