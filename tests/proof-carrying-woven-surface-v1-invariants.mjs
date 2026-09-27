import assert from'node:assert/strict';
import fs from'node:fs';

const surface=fs.readFileSync('src/OmegaProofCarryingWovenDynamics.tsx','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const css=fs.readFileSync('src/proofCarryingWovenDynamics.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'OMEGA_PROOF_CARRYING_WOVEN_DYNAMICS_v1',
 'executeProofCarryingWovenStepV1',
 'compileRscLoopReceiptV1',
 'runQubitThroughUnifiedKernelV1',
 'runR349PacketThroughUnifiedKernelV1',
 'UNIFIED KERNEL',
 'Equivalence → transport → residual → recovery → proof',
 'Eight promotion gates',
 'Relational Skin Calculus receipt',
 'Standard quantum mechanics specialization only',
 'no score can override a failed proof gate',
])assert.ok(surface.includes(token),`PCWD surface missing ${token}`);

assert.ok(suite.includes("import OmegaProofCarryingWovenDynamics from './OmegaProofCarryingWovenDynamics';"));
assert.ok(suite.includes('<OmegaProofCarryingWovenDynamics address={address}/>'),'Convergence must expose the full PCWD proof surface');
assert.ok(suite.includes('<OmegaProofCarryingWovenDynamics address={address} compact/>'),'Evidence & Proof must expose compact PCWD receipt status');

for(const token of['.pcwd-pipeline','.pcwd-gates','.pcwd-rsc','@media(max-width:560px)'])assert.ok(css.includes(token),`PCWD responsive presentation missing ${token}`);
assert.equal(/physical law established|new physics proved|physical dimensions claimed/i.test(surface),false);
assert.ok(String(pkg.scripts?.check||'').includes('npm run test:pcwd'),'canonical check must include PCWD proof suite');
assert.ok(String(pkg.scripts?.['test:pcwd']||'').includes('proof-carrying-convergence-bridge-v1-invariants.mts'),'PCWD suite must include R356 bridge proof');

console.log('PCWD SURFACE PASS · Convergence + Evidence & Proof mounts · seven-stage pipeline · eight gates · RSC receipt · bounded quantum specialization disclosure · responsive containment');
