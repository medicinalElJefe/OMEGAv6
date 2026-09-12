import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');
const must=(condition,message)=>{if(!condition)throw new Error(`R305 invariant failed: ${message}`)};

const authority=read('src/interactionAuthorityR305.css');
const loader=read('src/specialistLoaderR109.css');
const responsive=read('src/responsivePolishR88.css');
const navigator=read('src/omegaSideNavigatorR210.css');
const browser=read('tests/r286-all-surface-browser-e2e.mjs');
const workflow=read('.github/workflows/r241-archive-convergence.yml');

must(loader.startsWith("@import './interactionAuthorityR305.css';"),'final specialist stylesheet must load R305 interaction authority');
must(authority.includes("#root .omega-workstation-v2 :where(button,[role='button']){min-width:44px!important;min-height:44px!important"),'coarse-pointer action floor must be explicit and root scoped');
must(authority.includes("#root .omega-workstation-v2 :where(input,select,textarea){min-height:44px!important}"),'coarse-pointer form floor must be explicit and root scoped');
must(authority.includes('#root .r210-converged-nav .r89-nav-mode button{min-width:44px!important;min-height:44px!important'),'R304 navigator specificity repair must remain explicit in final authority');
must(!authority.includes(':where(.r88-head-actions button,.r89-nav-mode button,.r94-rail-action)'),'R305 must not regress R304 by zeroing navigator-mode specificity');
must(navigator.includes('.r210-converged-nav .r89-nav-mode button{min-width:44px!important;min-height:44px!important'),'canonical R304 navigator specificity repair must remain present');
must(responsive.includes(".omega-workstation-v2 :where(button,[role='button']){min-width:44px!important;min-height:44px!important}"),'responsive baseline must independently preserve 44px coarse-pointer actions');
must(browser.includes("reducedMotion:'reduce'"),'real mobile browser profile must emulate reduced motion');
must(browser.includes('undersizedTouchActions')&&browser.includes('undersizedTouchForms'),'browser proof must measure action and form touch geometry');
must(browser.includes('document.elementFromPoint')&&browser.includes('geometrically buried by another layer'),'browser proof must reject controls occluded by another layer');
must(browser.includes("if(unique.length!==44)"),'browser proof must preserve all 44 canonical routes');
must(browser.includes("route==='SAR Truth'"),'browser proof must preserve exact SAR geometry gate');
must(workflow.includes('timeout-minutes: 30'),'R241 proof job must remain globally bounded');
must(workflow.includes('run_browser tests/r286-all-surface-browser-e2e.mjs'),'all-surface browser proof must remain mandatory');
must((workflow.match(/run_browser tests\//g)||[]).length===9,'exact inherited nine-suite browser proof set must remain mandatory');
must(workflow.includes('/tmp/r305-browser-failure.txt'),'bounded browser failures must persist an exact R305 diagnostic');
must(workflow.includes('actions/upload-artifact@v4'),'failed browser proof must upload a diagnostic artifact');
must(!workflow.includes('continue-on-error'),'R305 proof must fail closed rather than weakening browser evidence');
must(!/^\s*push\s*:/m.test(workflow),'R241/R305 workflow must remain proof-only and must not acquire main-push deployment authority');

console.log('R305 NO-BURIED-FUNCTION INVARIANTS PASS · final interaction authority is late and specificity-safe · R304 navigator repair retained · 44px coarse-pointer actions/forms bound · reduced-motion + all-44-route + occlusion + SAR real-browser proof bound · nine-suite CI bounded/fail-closed with diagnostics · no deployment authority added.');
