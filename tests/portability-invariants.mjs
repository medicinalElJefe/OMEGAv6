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

console.log('portability invariants PASS');
