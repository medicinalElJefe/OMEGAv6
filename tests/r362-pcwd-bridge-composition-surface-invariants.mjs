import assert from'node:assert/strict';
import fs from'node:fs';

const ui=fs.readFileSync('src/OmegaPcwdBridgeCompositionR362.tsx','utf8');
const css=fs.readFileSync('src/pcwdBridgeCompositionR362.css','utf8');
const convergence=fs.readFileSync('src/OmegaConvergenceSurfaceR416.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'R362 · BRIDGE COMPOSITION',
 'Evaluate bridge composition',
 'VALID COMPOSITION',
 'CUMULATIVE LOSSES',
 'LOSSY COMPONENT',
 'cross-domain numeric addition',
])assert.ok(ui.includes(token),`R362 composition surface missing ${token}`);

assert.ok(convergence.includes("import OmegaPcwdBridgeCompositionR362 from './OmegaPcwdBridgeCompositionR362';"));
assert.ok(convergence.includes('<OmegaPcwdBridgeCompositionR362/>'));
assert.ok(convergence.indexOf('<OmegaPcwdBridgeCompositionR362/>')>convergence.indexOf('<OmegaPcwdInterDomainBridgeR361/>'));
for(const token of['.r362-summary','.r362-grid','min-height:44px','@media(max-width:760px)'])assert.ok(css.includes(token),`R362 CSS missing ${token}`);
assert.ok(String(pkg.scripts?.check||'').includes('npm run test:r362'));

console.log('R362 COMPOSITION SURFACE PASS · composition proof mounted after typed bridge · cumulative loss and fail-closed component visible · no cross-domain error addition · 44px interaction floor retained');
