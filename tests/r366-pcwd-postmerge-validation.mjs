import assert from'node:assert/strict';
import fs from'node:fs';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const phase of ['r359','r360','r361','r362','r363','r364','r365']){
  assert.ok(pkg.scripts?.[`test:${phase}`],`R366 missing test:${phase}`);
  assert.ok(String(pkg.scripts.check||'').includes(`npm run test:${phase}`),`R366 canonical check must retain test:${phase}`);
}

const required=[
 'src/system/proofCarryingWovenDynamics.ts',
 'src/system/unifiedProofTransportKernel.ts',
 'src/system/pcwdReferenceBenchmarkSuite.ts',
 'src/system/pcwdSemanticProfiles.ts',
 'src/system/pcwdInterDomainBridge.ts',
 'src/system/pcwdBridgeComposition.ts',
 'src/system/pcwdBridgePathComparison.ts',
 'tests/r359-pcwd-reference-benchmarks.mts',
 'tests/r360-pcwd-semantic-profiles.mts',
 'tests/r361-pcwd-interdomain-bridge.mts',
 'tests/r362-pcwd-bridge-composition.mts',
 'tests/r363-pcwd-path-equivalence.mts',
 'tests/r364-pcwd-full-stack-validation.mjs',
 'tests/r365-exact-deploy-sha-invariants.mjs',
];
for(const file of required)assert.ok(fs.existsSync(file),`R366 missing promoted PCWD/deploy artifact ${file}`);

const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
assert.ok(workstation.includes("useLayoutEffect(()=>{commitRouteLifecycleR356(panel)},[panel])"),'R366 lost synchronous route receipt publication');
assert.ok(workstation.includes('routeDeferred=specialistLoadersForPanelR109(next).length>0'),'R366 lost deferred-route shell classification');
assert.ok(workstation.includes('if(routeDeferred)setPanel(next);else startTransition(()=>setPanel(next))'),'R366 lost urgent deferred-route shell commit');

const field=fs.readFileSync('src/OmegaFieldMotionConvergenceR28.tsx','utf8');
assert.ok(field.includes("data-r313-nav-target='Data Motion'"),'R366 lost explicit Data Motion internal-route target');
assert.ok(field.includes("data-r313-nav-target='Convergence'"),'R366 lost explicit Convergence internal-route target');
assert.equal((field.match(/<button /g)||[]).length,(field.match(/<button type='button'/g)||[]).length,'R366 every R28 native button must remain non-submit');

const interaction=fs.readFileSync('tests/r313-full-control-interaction-browser-e2e.mjs','utf8');
for(const token of[
 'noWaitAfter:true',
 'data-r313-nav-target',
 '__r313MainFrameNavigations',
 'internal route control failed to commit',
 'internal route control caused document navigation',
])assert.ok(interaction.includes(token),`R366 interaction proof lost ${token}`);

const benchmark=fs.readFileSync('src/system/pcwdReferenceBenchmarkSuite.ts','utf8');
for(const id of[
 'HAAR_WAVELET_ROUND_TRIP',
 'LINEAR_COVARIANCE_REFERENCE',
 'KALMAN_PROCESS_NOISE_LEGACY',
 'KALMAN_PROCESS_NOISE_R359',
 'EVENT_SOURCING_PATH_HISTORY',
 'HASH_CHAIN_INTEGRITY',
 'PROBABILISTIC_BRANCH_RETENTION',
 'LORENZ63_RK4_REFERENCE',
 'QUBIT_UNITARY_REFERENCE',
 'ARNOLD_CAT_MAP_REVERSIBILITY',
])assert.ok(benchmark.includes(id),`R366 benchmark ledger lost ${id}`);

const semantic=fs.readFileSync('src/system/pcwdSemanticProfiles.ts','utf8');
assert.ok(semantic.includes('DOMAIN_SEMANTICS_DIFFER'));
assert.ok(semantic.includes('verifyDomainSemanticsProfileV1'));
assert.ok(semantic.includes('verifyCrossDomainInvariantProjectionV1'));

const bridge=fs.readFileSync('src/system/pcwdInterDomainBridge.ts','utf8');
for(const token of['SEMANTIC_NON_TRANSFER','AUTHORITY_NON_TRANSFER','UNMODELED_LOSS','semanticEquivalenceClaimed:false'])assert.ok(bridge.includes(token),`R366 bridge truth boundary lost ${token}`);

const compose=fs.readFileSync('src/system/pcwdBridgeComposition.ts','utf8');
assert.ok(compose.includes("errorAggregation:'SOURCE_DOMAIN_END_TO_END_MEASUREMENT'"));
assert.ok(compose.includes('crossDomainErrorAdditionPerformed:false'));
assert.ok(compose.includes('lossLedgerMonotone'));

const path=fs.readFileSync('src/system/pcwdBridgePathComparison.ts','utf8');
assert.ok(path.includes('semanticScarRetained'));
assert.ok(path.includes('physicalHolonomyClaimed:false'));

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
assert.ok(ci.includes("ref: ${{ github.sha }}"),'R366 lost exact deployment checkout pin');
assert.ok(ci.includes('Verify exact deployment checkout'),'R366 lost exact deployment checkout proof');

const staged=fs.readFileSync('scripts/verify_staged_release.mjs','utf8');
const federation=fs.readFileSync('scripts/verify_federation_live_r1681.mjs','utf8');
assert.ok(staged.includes("OMEGA_STAGED_READ_ONLY:'1'"),'R366 staged proof must carry read-only boundary into R168.1');
assert.ok(federation.includes('R199 release-evidence/runtime-attestation proof deferred until promoted live'),'R366 must retain promoted-live-only R199 asset-binding boundary');

console.log('R366 POST-MERGE PCWD VALIDATION PASS · promoted R359–R365 stack present · benchmark failure+repair ledger retained · semantic separation retained · bridge/loss/path truth boundaries retained · R313 route interaction repairs retained · exact deploy SHA and staged/promoted R199 boundary retained');
