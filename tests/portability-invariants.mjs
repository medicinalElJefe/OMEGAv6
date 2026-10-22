import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const vite = read('vite.config.ts');
const pkg = read('package.json');
const adapter = read('src/platformAdapter.ts');
const orchestrator = read('src/PromptOrchestrator.tsx');

for (const [name, source] of [
  ['vite.config.ts', vite],
  ['package.json', pkg],
  ['src/platformAdapter.ts', adapter],
  ['src/PromptOrchestrator.tsx', orchestrator]
]) {
  assert.doesNotMatch(source, /@appdeploy\/client|appdeploy\.ai/i, `${name} reintroduced an AppDeploy runtime contract`);
}

assert.match(adapter, /fetch\(/, 'portable platform adapter must use standard fetch');
assert.match(adapter, /localStorage/, 'portable browser persistence must remain available');
assert.doesNotMatch(pkg, /@appdeploy\/client/i, 'package dependencies must not include AppDeploy client');
assert.match(orchestrator,/const readableMissionSummary=/,'Command Center must normalize mission summaries before React rendering');
assert.match(orchestrator,/summary\.resultFingerprint/,'returned mission receipt fingerprints must remain visible when summary is structured data');
assert.match(orchestrator,/<p>\{readableMissionSummary\(mission\.summary,mission\.objective\)\}<\/p>/,'mission surface must never render an arbitrary summary object directly');
assert.doesNotMatch(orchestrator,/<p>\{mission\.summary\|\|mission\.objective\}<\/p>/,'raw object-valued mission summary render would reintroduce React error #31');
assert.match(orchestrator,/const displayScalar=/,'R381 must normalize object-valued SAI\/Hybrid status payloads before JSX rendering');
assert.match(orchestrator,/displayScalar\(job\.returnPacket\?\.evaluation\?\.status/,'R381 must not render structured training evaluation status objects as React children');
assert.match(orchestrator,/displayScalar\(job\.returnPacket\?\.promotion\?\.status/,'R381 must not render structured training promotion status objects as React children');
assert.match(orchestrator,/displayScalar\(x\.status,'UNKNOWN'\)/,'R381 must normalize structured step status payloads before JSX rendering');

console.log('R308 portability invariants PASS · portable transport retained · structured mission receipts render safely');