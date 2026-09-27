import assert from'node:assert/strict';
import fs from'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const ci=read('.github/workflows/ci.yml');
const staged=read('scripts/staged-cloudflare-release.sh');
const live=read('scripts/verify_live_execution_control_r199.mjs');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const field=read('src/OmegaFieldMotionConvergenceR28.tsx');
const r313=read('tests/r313-full-control-interaction-browser-e2e.mjs');

const phaseScripts=['test:r359','test:r360','test:r361','test:r362','test:r363','test:r364','test:r365','test:r366','test:r367','test:r370','test:r371'];
for(const script of phaseScripts){
  assert.ok(pkg.scripts?.[script],`R373 missing inherited phase script ${script}`);
  assert.ok(String(pkg.scripts.check||'').includes(`npm run ${script}`),`R373 canonical check does not execute ${script}`);
}

for(const file of[
 'src/system/proofCarryingWovenDynamics.ts',
 'src/system/unifiedProofTransportKernel.ts',
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
])assert.ok(fs.existsSync(file),`R373 current main lost PCWD file ${file}`);

const r359=read('tests/r359-pcwd-reference-benchmarks.mts');
for(const token of[
 'KALMAN_PROCESS_NOISE_LEGACY',
 'KALMAN_PROCESS_NOISE_R359',
 'HAAR_WAVELET_ROUND_TRIP',
 'EVENT_SOURCING_PATH_HISTORY',
 'HASH_CHAIN_INTEGRITY',
 'PROBABILISTIC_BRANCH_RETENTION',
 'LORENZ63_RK4_REFERENCE',
 'QUBIT_UNITARY_REFERENCE',
 'ARNOLD_CAT_MAP_REVERSIBILITY',
])assert.ok(r359.includes(token),`R373 benchmark ledger lost ${token}`);

const semantic=read('src/system/pcwdSemanticProfiles.ts');
assert.ok(semantic.includes('DOMAIN_SEMANTICS_DIFFER'),'R373 semantic-profile mismatch must remain fail-closed');
assert.ok(semantic.includes('verifyDomainSemanticsProfileV1'),'R373 semantic-profile digest verification missing');
assert.ok(semantic.includes('verifyCrossDomainInvariantProjectionV1'),'R373 structural projection digest verification missing');

const bridge=read('src/system/pcwdInterDomainBridge.ts');
for(const token of['SEMANTIC_NON_TRANSFER','AUTHORITY_NON_TRANSFER','UNMODELED_LOSS','semanticEquivalenceClaimed:false','physicalLawClaimed:false'])
  assert.ok(bridge.includes(token),`R373 bridge truth boundary lost ${token}`);

const compose=read('src/system/pcwdBridgeComposition.ts');
assert.ok(compose.includes('lossLedgerMonotone'),'R373 composed bridge loss monotonicity missing');
assert.ok(compose.includes("crossDomainErrorAdditionPerformed:false"),'R373 must not numerically add unlike cross-domain errors');
assert.ok(compose.includes("SOURCE_DOMAIN_END_TO_END_MEASUREMENT"),'R373 source-domain end-to-end recovery rule missing');

const path=read('src/system/pcwdBridgePathComparison.ts');
assert.ok(path.includes('semanticScarRetained'),'R373 path-specific semantic scar missing');
assert.ok(path.includes('physicalHolonomyClaimed:false'),'R373 physical-holonomy truth boundary regressed');

assert.ok(workstation.includes("useLayoutEffect(()=>{commitRouteLifecycleR356(panel)},[panel])"),'R373 route COMMITTED publication regressed');
assert.ok(workstation.includes('routeDeferred=specialistLoadersForPanelR109(next).length>0'),'R373 deferred specialist route classification missing');
assert.ok(workstation.includes('if(routeDeferred)setPanel(next);else startTransition(()=>setPanel(next))'),'R373 urgent deferred route shell commit missing');

const fieldButtons=(field.match(/<button /g)||[]).length;
const typedFieldButtons=(field.match(/<button type='button'/g)||[]).length;
assert.equal(typedFieldButtons,fieldButtons,'R373 every R28 Field control must be an explicit non-submit button');
assert.ok(r313.includes('noWaitAfter:true'),'R373 R313 safe-control actuation must not block on phantom navigation');
assert.ok(r313.includes('__r313MainFrameNavigations'),'R373 R313 must independently fail on actual main-frame navigation');

assert.ok(ci.includes('ref: ${{ github.sha }}'),'R373 production checkout must remain exact-SHA pinned');
assert.ok(ci.includes('fetch-depth: 0'),'R373 production checkout must retain merge ancestry');
assert.ok(ci.includes('Verify exact deployment checkout'),'R373 exact deployment checkout gate missing');
assert.ok(ci.includes('Promoted main commit must be an exact two-parent merge commit'),'R373 two-parent promoted-lineage gate missing');
assert.ok(ci.includes('OMEGA_PROMOTED_SHA=$GITHUB_SHA'),'R373 promoted runtime identity must bind exact merge SHA');
assert.ok(live.includes("process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA"),'R373 live proof must prefer explicit promoted SHA');
assert.ok(staged.includes('assert_current_main_owner'),'R373 staged release must retain current-main ownership guard');
assert.ok(staged.includes('release_owns_current_deployment'),'R373 rollback must retain deployment-ownership guard');

console.log('R373 CURRENT-MAIN REVALIDATION STATIC PASS · PCWD R359-R364 preserved · R365-R371 deployment/ancestry continuity preserved · route interaction fixes preserved · semantic/loss/authority boundaries preserved');
