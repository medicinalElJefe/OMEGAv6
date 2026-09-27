import assert from'node:assert/strict';
import fs from'node:fs';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const phase of['r359','r360','r361','r362','r363','r364','r373']){
  const script=`test:${phase}`;
  assert.ok(pkg.scripts?.[script],`R374 missing ${script}`);
  assert.ok(String(pkg.scripts.check||'').includes(`npm run ${script}`),`R374 canonical check must include ${script}`);
}

const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
assert.ok(workstation.includes("useLayoutEffect(()=>{commitRouteLifecycleR356(panel)},[panel])"),'R374 route COMMITTED publication regression');
assert.ok(workstation.includes('routeDeferred=specialistLoadersForPanelR109(next).length>0'),'R374 deferred specialist classification regression');
assert.ok(workstation.includes('if(routeDeferred)setPanel(next);else startTransition(()=>setPanel(next))'),'R374 deferred shell urgency regression');

const field=fs.readFileSync('src/OmegaFieldMotionConvergenceR28.tsx','utf8');
const allButtons=(field.match(/<button /g)||[]).length;
const typedButtons=(field.match(/<button type='button'/g)||[]).length;
assert.equal(typedButtons,allButtons,'R374 every R28 native button must remain explicit type=button');

const r313=fs.readFileSync('tests/r313-full-control-interaction-browser-e2e.mjs','utf8');
assert.ok(r313.includes('noWaitAfter:true'),'R374 R313 must not couple safe-control click completion to Playwright navigation waiting');
assert.ok(r313.includes('__r313MainFrameNavigations'),'R374 R313 must independently fail on real main-frame document navigation');

const refBench=fs.readFileSync('tests/r359-pcwd-reference-benchmarks.mts','utf8');
for(const token of['KALMAN_PROCESS_NOISE_LEGACY','KALMAN_PROCESS_NOISE_R359','HAAR_WAVELET_ROUND_TRIP']){
  assert.ok(refBench.includes(token),`R374 benchmark truth boundary missing ${token}`);
}

const semantic=fs.readFileSync('src/system/pcwdSemanticProfiles.ts','utf8');
assert.ok(semantic.includes('DOMAIN_SEMANTICS_DIFFER'),'R374 semantic separation weakened');

const bridge=fs.readFileSync('src/system/pcwdInterDomainBridge.ts','utf8');
for(const token of['SEMANTIC_NON_TRANSFER','AUTHORITY_NON_TRANSFER','UNMODELED_LOSS']){
  assert.ok(bridge.includes(token),`R374 typed bridge loss boundary missing ${token}`);
}

const compose=fs.readFileSync('src/system/pcwdBridgeComposition.ts','utf8');
assert.ok(compose.includes('crossDomainErrorAdditionPerformed:false'),'R374 must not numerically add unlike cross-domain error units');
assert.ok(compose.includes('lossLedgerMonotone'),'R374 loss monotonicity missing');

const paths=fs.readFileSync('src/system/pcwdBridgePathComparison.ts','utf8');
assert.ok(paths.includes('physicalHolonomyClaimed:false'),'R374 physical-holonomy truth boundary weakened');
assert.ok(paths.includes('semanticScarRetained'),'R374 semantic scar proof missing');

console.log('R374 CURRENT-MAIN CONFIRMATION PASS · R359–R364 + R373 retained · interaction repairs retained · benchmark FAIL/FIX truth preserved · semantic/authority/loss boundaries retained · no physical-holonomy promotion');
