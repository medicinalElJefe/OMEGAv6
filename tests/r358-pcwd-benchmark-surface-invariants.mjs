import assert from'node:assert/strict';
import fs from'node:fs';

const lab=fs.readFileSync('src/OmegaPcwdBenchmarkLab.tsx','utf8');
const css=fs.readFileSync('src/pcwdBenchmarkLab.css','utf8');
const convergence=fs.readFileSync('src/OmegaConvergenceSurfaceR416.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'R358 · FALSIFICATION LAB',
 'Run 10-case benchmark suite',
 'MEASURED COSTS',
 'MEASURED LIMITS',
 'FALSIFICATION GOVERNOR',
 'No benchmark result is promoted into a novelty or scientific-validity claim.',
])assert.ok(lab.includes(token),`R358 benchmark lab missing ${token}`);

assert.ok(lab.includes("runPcwdBenchmarkSuiteV1"));
assert.ok(lab.includes("governPcwdBenchmarkSuiteV1"));
assert.ok(convergence.includes("import OmegaPcwdBenchmarkLab from './OmegaPcwdBenchmarkLab';"));
assert.ok(convergence.includes('<OmegaPcwdBenchmarkLab/>'));
assert.ok(convergence.indexOf('<OmegaPcwdBenchmarkLab/>')>convergence.indexOf('<OmegaProofCarryingWovenDynamics address={address}/>'));

for(const token of['.r358-grid','.r358-score','@media(max-width:760px)'])assert.ok(css.includes(token),`R358 responsive benchmark CSS missing ${token}`);

assert.ok(String(pkg.scripts?.['test:r358']||'').includes('r358-pcwd-benchmark-suite.mts'));
assert.ok(String(pkg.scripts?.['test:r358']||'').includes('r358-pcwd-benchmark-governor.mts'));
assert.ok(String(pkg.scripts?.check||'').includes('npm run test:r358'));

console.log('R358 BENCHMARK SURFACE PASS · explicit manual 10-case falsification run · costs/limits remain visible · no novelty authority · canonical check binding present');
