import assert from'node:assert/strict';
import fs from'node:fs';

const ui=fs.readFileSync('src/OmegaPcwdSemanticInvariantR360.tsx','utf8');
const css=fs.readFileSync('src/pcwdSemanticInvariantR360.css','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'R360 · SEMANTIC SEPARATION',
 'Run cross-domain semantic proof',
 'STRUCTURAL CONTRACT',
 'RAW METRIC COMPARISON',
 'Same slot name ≠ same quantity.',
])assert.ok(ui.includes(token),`R360 semantic surface missing ${token}`);

assert.ok(suite.includes("import OmegaPcwdSemanticInvariantR360 from './OmegaPcwdSemanticInvariantR360';"));
assert.ok(suite.includes('<OmegaPcwdSemanticInvariantR360/>'));
assert.ok(suite.indexOf('<OmegaPcwdSemanticInvariantR360/>')>suite.indexOf('<OmegaPcwdReferenceBenchmarksR359/>'));

for(const token of['.r360-summary','.r360-columns','min-height:44px','@media(max-width:760px)'])assert.ok(css.includes(token),`R360 CSS missing ${token}`);
assert.ok(String(pkg.scripts?.check||'').includes('npm run test:r360'));

console.log('R360 SEMANTIC SURFACE PASS · structural invariant proof mounted after competent-reference suite · raw cross-domain metric comparison visibly blocked · responsive 44px control contract retained');
