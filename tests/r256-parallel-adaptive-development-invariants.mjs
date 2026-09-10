import fs from 'node:fs';
import assert from 'node:assert/strict';

const surface=fs.readFileSync('src/HybridParallelDevelopmentR256.tsx','utf8');
const ledger=fs.readFileSync('src/HybridExperienceLedgerR255.tsx','utf8');
const link=fs.readFileSync('src/HybridLinkR32.tsx','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');

assert.ok(wrangler.includes('"main": "src/workerR116.js"'),'R256 must preserve the proven R116 production entrypoint');
assert.ok(surface.includes("const STORE='omega:r255:hybridExperienceCorpus'"),'R256 must reuse the R255 sanitized corpus instead of creating a second telemetry authority');
assert.ok(surface.includes("const CORPUS_EVENT='omega:r255:corpus-updated'")&&ledger.includes("new CustomEvent(CORPUS_EVENT"),'R255/R256 must have a same-tab event bridge for immediate simultaneous learning');
assert.ok(surface.includes("window.setInterval(tick,5000)")&&surface.includes("window.addEventListener('storage',sync)")&&surface.includes("document.addEventListener('visibilitychange',tick)"),'R256 must retain bounded cross-tab polling and visibility-aware observation while Hybrid continues operating');
assert.ok(surface.includes('MAX_CORPUS_AGE_MS=30*24*60*60_000')&&surface.includes('MAX_RUNS=500'),'R256 calibration input must remain bounded by age and corpus size');
assert.ok(surface.includes("x.count>=12?'HIGH':x.count>=5?'MEDIUM':'LOW'"),'R256 confidence must be sample-size bounded');
assert.ok(surface.includes('wilsonLower')&&surface.includes("x.count>=5&&x.wilsonLower<.7"),'R256 escalation holds must use conservative repeated-sample confidence rather than raw point estimates');
assert.ok(surface.includes('repeated failure fingerprint')&&surface.includes('long-tail latency detected')&&surface.includes('p95'),'R256 must convert recurrence and latency into explicit development guidance');
assert.ok(surface.includes("data-r256-corpus-fresh")&&surface.includes("corpus signal not current"),'R256 must expose corpus freshness rather than implying live learning from stale local data');
for(const forbidden of ['api.post<','api.put<','api.delete<','fetch(','/api/hybrid/jobs','APPLY_PATCH','WRITE_TEXT','merge_pull_request','productionDeploy:true','canonAdmission:true'])assert.ok(!surface.includes(forbidden),`R256 acquired forbidden execution or mutation primitive ${forbidden}`);
assert.ok(link.includes("import HybridParallelDevelopmentR256 from './HybridParallelDevelopmentR256'")&&link.includes('<HybridParallelDevelopmentR256/>'),'R256 must be mounted on the actual Hybrid surface');
assert.ok(link.indexOf('<HybridExperienceLedgerR255/>')<link.indexOf('<HybridParallelDevelopmentR256/>'),'R256 must consume development evidence after R255 rather than replace the corpus owner');
assert.ok(link.includes('12→144→1,728→20,736→248,832')&&link.includes('not literal physical dimensions'),'R256 must preserve the inherited atlas/address-resolution truth boundary');
console.log('R256 parallel adaptive development invariants: PASS · simultaneous use/observe/calibrate/develop · same-tab + cross-tab corpus signaling · stale-data exclusion · Wilson confidence hardening · R255 corpus reused · no new execution, mutation, promotion or Canon authority');
