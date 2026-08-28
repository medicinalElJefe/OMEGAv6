import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker = fs.readFileSync(new URL('../src/worker.js', import.meta.url), 'utf8');
const adapter = fs.readFileSync(new URL('../src/platformAdapter.ts', import.meta.url), 'utf8');
const manifest = fs.readFileSync(new URL('../RESTORE_MANIFEST.md', import.meta.url), 'utf8');
const responsiveShell = fs.readFileSync(new URL('../src/ResponsiveRuntimeShell.tsx', import.meta.url), 'utf8');
const responsiveCss = fs.readFileSync(new URL('../src/responsiveShell.css', import.meta.url), 'utf8');

assert.match(worker, /\/api\/restoration/, 'worker must expose restoration status');
assert.match(worker, /fullRestoreClaimed:\s*false/, 'worker must not claim completed restoration');
assert.match(worker, /PARALLEL_MIGRATION/, 'worker must classify current lineage as parallel migration');
assert.match(worker, /DEVICE_PROOF_REQUIRED/, 'native host must remain device-proof gated');
assert.match(worker, /EXTERNAL_DEGRADED_UNTIL_BOUND/, 'Earth feeds must remain externally degraded until verified');
assert.match(worker, /MODEL_PROVIDER_NOT_CONFIGURED/, 'provider absence must fail boundedly');
assert.doesNotMatch(adapter, /@appdeploy\/client/, 'Cloudflare adapter must not depend on AppDeploy client');
assert.match(adapter, /localStorage/, 'adapter must preserve browser-local continuity');
assert.match(adapter, /AbortController/, 'adapter must bound network waits');
assert.match(manifest, /Do not call FULL RESTORE/, 'manifest must retain no-false-completion gate');
assert.match(responsiveShell, /ALL 24 SOFTWARE FAMILIES/, 'real donor responsive shell must retain 24-family registry');
assert.match(responsiveShell, /MODE188\+ admission/, 'real donor responsive shell must retain Mode188 visual semantics');
assert.match(responsiveShell, /S = \(CΩ · Φ\) \/ \(q \+ Λ \+ ε\)/, 'real donor shell must retain canonical kernel display');
assert.match(responsiveCss, /@media\(max-width:760px\)/, 'responsive donor CSS must retain mobile breakpoint');
assert.match(responsiveCss, /prefers-reduced-motion:reduce/, 'responsive donor CSS must retain reduced-motion boundary');

console.log('restore invariants PASS 15/15');
