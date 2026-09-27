import assert from'node:assert/strict';
import fs from'node:fs';

const ui=fs.readFileSync('src/OmegaPcwdReferenceBenchmarksR359.tsx','utf8');
const css=fs.readFileSync('src/pcwdReferenceBenchmarksR359.css','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'R359 · COMPETENT REFERENCES',
 'Evaluate competent reference suite',
 'MATCH',
 'TRADEOFF',
 'FAIL',
 'FIXED',
 'Numerical parity is not presented as novelty.',
])assert.ok(ui.includes(token),`R359 reference surface missing ${token}`);

assert.ok(suite.includes("import OmegaPcwdReferenceBenchmarksR359 from './OmegaPcwdReferenceBenchmarksR359';"));
assert.ok(suite.includes('<OmegaPcwdReferenceBenchmarksR359/>'));
assert.ok(suite.indexOf('<OmegaPcwdReferenceBenchmarksR359/>')>suite.indexOf('<OmegaPcwdBenchmarkLab/>'));

for(const token of['.r359-grid','.r359-summary','min-height:44px','@media(max-width:760px)'])assert.ok(css.includes(token),`R359 CSS missing ${token}`);
assert.ok(String(pkg.scripts?.['test:r359']||'').includes('r359-pcwd-reference-benchmarks.mts'));
assert.ok(String(pkg.scripts?.check||'').includes('npm run test:r359'));

console.log('R359 REFERENCE SURFACE PASS · competent-reference comparisons mounted after R358 · match/tradeoff/failure/fix remain visible · mobile 44px interaction floor retained');
