import fs from 'node:fs';
import assert from 'node:assert/strict';
await import('./r256-parallel-adaptive-development-invariants.mjs');

const surface=fs.readFileSync('src/HybridExperienceLedgerR255.tsx','utf8');
const link=fs.readFileSync('src/HybridLinkR32.tsx','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');

assert.ok(wrangler.includes('"main": "src/workerR116.js"'),'R255 must preserve the proven R116 production entrypoint');
assert.ok(!fs.existsSync('src/workerR255.js'),'R255 must not create a parallel Worker or Durable Object authority');
assert.ok(surface.includes("useHybridRuntimeSnapshotR238"),'R255 must consume the already-authenticated shared R238 snapshot');
assert.ok(surface.includes('selectedDeviceJobs')&&surface.includes('hybrid?.nativeExecutionClaimed===true'),'R255 must bind corpus observations and heartbeat truth to the selected authenticated host');
assert.ok(surface.includes("const STORE='omega:r255:hybridExperienceCorpus'"),'R255 must retain a bounded browser-local longitudinal corpus');
assert.ok(surface.includes('.slice(0,500)'),'R255 persistent corpus must remain bounded');
assert.ok(surface.includes('rawBridgeId:false')&&surface.includes('rawDeviceId:false')&&surface.includes('projectPath:false')&&surface.includes('stdout:false')&&surface.includes('rawFailureText:false'),'R255 sanitized export boundary missing');
assert.ok(surface.includes('readOnly:true,dispatch:false,mutation:false,promotion:false,productionDeploy:false,canonAdmission:false'),'R255 export must declare observation-only authority');
for(const forbidden of ["api.post<","api.put<","api.delete<","/api/hybrid/jobs","/api/missions","x-omega-bridge-secret"])assert.ok(!surface.includes(forbidden),`R255 local ledger acquired forbidden authority/polling primitive ${forbidden}`);
assert.ok(surface.includes('Export sanitized JSON'),'R255 must expose local sanitized corpus export');
assert.ok(surface.includes('Refresh shared R238 epoch'),'R255 manual refresh must reuse the existing R238 snapshot owner');
assert.ok(link.includes("import HybridExperienceLedgerR255 from './HybridExperienceLedgerR255'" )&&link.includes('<HybridExperienceLedgerR255/>'),'R255 ledger must be mounted on the real Hybrid surface');
assert.ok(link.includes('<HybridOutcomeClosureR254/>')&&link.indexOf('<HybridOutcomeClosureR254/>')<link.indexOf('<HybridExperienceLedgerR255/>'),'R255 must preserve and follow R254 outcome closure rather than replace it');
console.log('R255 Hybrid experience-ledger invariants: PASS · R116 preserved · shared authenticated R238 epoch reused · bounded local corpus · sanitized export · no new execution authority');
