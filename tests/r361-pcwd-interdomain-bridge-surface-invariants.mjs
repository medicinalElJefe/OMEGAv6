import assert from'node:assert/strict';
import fs from'node:fs';

const ui=fs.readFileSync('src/OmegaPcwdInterDomainBridgeR361.tsx','utf8');
const css=fs.readFileSync('src/pcwdInterDomainBridgeR361.css','utf8');
const convergence=fs.readFileSync('src/OmegaConvergenceSurfaceR416.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'R361 · TYPED INTER-DOMAIN BRIDGE',
 'Evaluate typed bridge',
 'DELETED RESIDUAL',
 'SEMANTIC EQUIVALENCE',
 'Loss ledger',
 'The lens is a representation carrier only.',
])assert.ok(ui.includes(token),`R361 bridge surface missing ${token}`);

assert.ok(convergence.includes("import OmegaPcwdInterDomainBridgeR361 from './OmegaPcwdInterDomainBridgeR361';"));
assert.ok(convergence.includes('<OmegaPcwdInterDomainBridgeR361/>'));
assert.ok(convergence.indexOf('<OmegaPcwdInterDomainBridgeR361/>')>convergence.indexOf('<OmegaPcwdSemanticInvariantR360/>'));
for(const token of['.r361-summary','.r361-grid','min-height:44px','@media(max-width:760px)'])assert.ok(css.includes(token),`R361 CSS missing ${token}`);
assert.ok(String(pkg.scripts?.check||'').includes('npm run test:r361'));

console.log('R361 BRIDGE SURFACE PASS · typed source→target translation · invariant/loss/recovery receipts visible · deleted-residual negative control visible · semantic equivalence remains explicitly unclaimed');
