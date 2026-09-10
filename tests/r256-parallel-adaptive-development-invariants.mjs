import fs from 'node:fs';
import assert from 'node:assert/strict';

const surface=fs.readFileSync('src/HybridParallelDevelopmentR256.tsx','utf8');
const link=fs.readFileSync('src/HybridLinkR32.tsx','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');

assert.ok(wrangler.includes('"main": "src/workerR116.js"'),'R256 must preserve the proven R116 production entrypoint');
assert.ok(surface.includes("const STORE='omega:r255:hybridExperienceCorpus'"),'R256 must reuse the R255 sanitized corpus instead of creating a second telemetry authority');
assert.ok(surface.includes("window.setInterval(sync,5000)")&&surface.includes("window.addEventListener('storage',sync)"),'R256 must observe local corpus evolution while Hybrid continues operating');
assert.ok(surface.includes("x.count>=12?'HIGH':x.count>=5?'MEDIUM':'LOW'"),'R256 confidence must be sample-size bounded');
assert.ok(surface.includes("x.count>=5&&x.successRate<.8"),'R256 may recommend holds only from repeated returned evidence, not one-off failures');
assert.ok(surface.includes('repeated failure fingerprint')&&surface.includes('p95'),'R256 must convert recurrence and latency into explicit development guidance');
for(const forbidden of ['api.post<','api.put<','api.delete<','fetch(','/api/hybrid/jobs','APPLY_PATCH','WRITE_TEXT','merge_pull_request','productionDeploy:true','canonAdmission:true'])assert.ok(!surface.includes(forbidden),`R256 acquired forbidden execution or mutation primitive ${forbidden}`);
assert.ok(link.includes("import HybridParallelDevelopmentR256 from './HybridParallelDevelopmentR256'")&&link.includes('<HybridParallelDevelopmentR256/>'),'R256 must be mounted on the actual Hybrid surface');
assert.ok(link.indexOf('<HybridExperienceLedgerR255/>')<link.indexOf('<HybridParallelDevelopmentR256/>'),'R256 must consume development evidence after R255 rather than replace the corpus owner');
console.log('R256 parallel adaptive development invariants: PASS · simultaneous use/observe/calibrate/develop · R255 corpus reused · confidence bounded · no new execution, mutation, promotion or Canon authority');
