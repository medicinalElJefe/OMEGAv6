import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const surface=read('src/HybridParallelDevelopmentR262.tsx');
const ledger=read('src/HybridExperienceLedgerR255.tsx');
const link=read('src/HybridLinkR32.tsx');
const wrangler=read('wrangler.jsonc');

assert.ok(wrangler.includes('"main": "src/workerR116.js"'),'R262 must preserve proven R116 production entrypoint');
assert.ok(surface.includes("const STORE='omega:r255:hybridExperienceCorpus'"),'R262 must reuse R255 sanitized corpus');
assert.ok(surface.includes("const CORPUS_EVENT='omega:r255:corpus-updated'")&&ledger.includes("new CustomEvent(CORPUS_EVENT"),'R255/R262 same-tab event bridge missing');
assert.ok(surface.includes("window.setInterval(tick,5000)")&&surface.includes("window.addEventListener('storage',sync)")&&surface.includes("document.addEventListener('visibilitychange',tick)"),'R262 bounded/visibility-aware observation missing');
assert.ok(surface.includes('MAX_CORPUS_AGE_MS=30*24*60*60_000')&&surface.includes('MAX_RUNS=500'),'R262 corpus age/size bounds missing');
assert.ok(surface.includes("x.count>=12?'HIGH':x.count>=5?'MEDIUM':'LOW'"),'R262 sample confidence boundary missing');
assert.ok(surface.includes('wilsonLower')&&surface.includes("x.count>=5&&x.wilsonLower<.7"),'R262 conservative Wilson confidence hold missing');
assert.ok(surface.includes('repeated failure fingerprint')&&surface.includes('long-tail latency detected')&&surface.includes('p95'),'R262 recurrence/latency development guidance missing');
assert.ok(surface.includes('data-r262-corpus-fresh')&&surface.includes('corpus signal not current'),'R262 stale-corpus truth marker missing');
for(const forbidden of ['api.post<','api.put<','api.delete<','fetch(','/api/hybrid/jobs','APPLY_PATCH','WRITE_TEXT','merge_pull_request','productionDeploy:true','canonAdmission:true'])assert.ok(!surface.includes(forbidden),`R262 acquired forbidden authority ${forbidden}`);
assert.ok(link.includes("import HybridParallelDevelopmentR262 from './HybridParallelDevelopmentR262'")&&link.includes('<HybridParallelDevelopmentR262/>'),'R262 not mounted on Hybrid surface');
assert.ok(link.indexOf('<HybridExperienceLedgerR255/>')<link.indexOf('<HybridParallelDevelopmentR262/>'),'R262 must follow R255 corpus owner');
assert.ok(link.includes('12→144→1,728→20,736→248,832')&&link.includes('not literal physical dimensions'),'R262 regressed atlas/address truth boundary');
for(const token of ['R256 private SAI doorway','R257 adaptive experience shell','R261 external-AI interoperability','R261.1 browser polish'])assert.ok(link.includes(token)||surface.includes(token),`R262 must preserve current canonical lineage label ${token}`);
assert.ok(!fs.existsSync('src/workerR262.js'),'R262 must not create another Worker or Durable Object authority');
console.log('R262 PARALLEL ADAPTIVE DEVELOPMENT PASS · current R261.1 lineage preserved · simultaneous use/observe/calibrate/develop · same-tab + cross-tab corpus signaling · stale-data exclusion · Wilson confidence hardening · no new execution/mutation/promotion/production/Canon authority');
