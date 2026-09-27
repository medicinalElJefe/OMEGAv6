import assert from'node:assert/strict';
import fs from'node:fs';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const required=[
 ['test:r359','tests/r359-pcwd-reference-benchmarks.mts'],
 ['test:r360','tests/r360-pcwd-semantic-profiles.mts'],
 ['test:r361','tests/r361-pcwd-interdomain-bridge.mts'],
 ['test:r362','tests/r362-pcwd-bridge-composition.mts'],
 ['test:r363','tests/r363-pcwd-path-equivalence.mts'],
];
for(const[script,file]of required){
 assert.ok(pkg.scripts?.[script],`R364 missing ${script}`);
 assert.ok(fs.existsSync(file),`R364 missing ${file}`);
 assert.ok(String(pkg.scripts.check||'').includes(`npm run ${script}`),`R364 canonical check does not execute ${script}`);
}

for(const file of[
 'src/system/proofCarryingWovenDynamics.ts',
 'src/system/unifiedProofTransportKernel.ts',
 'src/system/pcwdSemanticProfiles.ts',
 'src/system/pcwdInterDomainBridge.ts',
 'src/system/pcwdBridgeComposition.ts',
 'src/system/pcwdBridgePathComparison.ts',
]) assert.ok(fs.existsSync(file),`R364 missing PCWD layer ${file}`);

const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
assert.ok(workstation.includes("useLayoutEffect(()=>{commitRouteLifecycleR356(panel)},[panel])"),'R364 must retain synchronous route COMMITTED publication');
assert.ok(workstation.includes('routeDeferred=specialistLoadersForPanelR109(next).length>0'),'R364 must classify deferred specialist routes before navigation scheduling');
assert.ok(workstation.includes('if(routeDeferred)setPanel(next);else startTransition(()=>setPanel(next))'),'R364 must commit deferred route shell urgently');

const r359=fs.readFileSync('tests/r359-pcwd-reference-benchmarks.mts','utf8');
for(const id of[
 'HAAR_WAVELET_ROUND_TRIP',
 'KALMAN_PROCESS_NOISE_LEGACY',
 'KALMAN_PROCESS_NOISE_R359',
 'EVENT_SOURCING_PATH_HISTORY',
 'HASH_CHAIN_INTEGRITY',
 'PROBABILISTIC_BRANCH_RETENTION',
 'LORENZ63_RK4_REFERENCE',
 'QUBIT_UNITARY_REFERENCE',
 'ARNOLD_CAT_MAP_REVERSIBILITY',
])assert.ok(r359.includes(id),`R364 benchmark ledger missing ${id}`);

const semantic=fs.readFileSync('src/system/pcwdSemanticProfiles.ts','utf8');
assert.ok(semantic.includes('DOMAIN_SEMANTICS_DIFFER'),'R364 semantic separation must remain fail-closed');
assert.ok(semantic.includes('verifyCrossDomainInvariantProjectionV1'),'R364 projection integrity verifier missing');

const bridge=fs.readFileSync('src/system/pcwdInterDomainBridge.ts','utf8');
for(const token of['SEMANTIC_NON_TRANSFER','AUTHORITY_NON_TRANSFER','UNMODELED_LOSS'])assert.ok(bridge.includes(token),`R364 bridge loss law missing ${token}`);

const compose=fs.readFileSync('src/system/pcwdBridgeComposition.ts','utf8');
assert.ok(compose.includes("crossDomainErrorAdditionPerformed:false"),'R364 must not add unlike cross-domain error units');
assert.ok(compose.includes('lossLedgerMonotone'),'R364 composition must preserve loss monotonicity');

const path=fs.readFileSync('src/system/pcwdBridgePathComparison.ts','utf8');
assert.ok(path.includes('physicalHolonomyClaimed:false'),'R364 must keep physical-holonomy claim disabled');
assert.ok(path.includes('semanticScarRetained'),'R364 path comparison must preserve semantic scar');

console.log('R364 FULL PCWD STACK STATIC PASS · R359 competent references + R360 semantic profiles + R361 typed bridges + R362 composition + R363 path comparison · route lifecycle fixes retained · no cross-domain error-unit collapse · no physical-holonomy promotion');
