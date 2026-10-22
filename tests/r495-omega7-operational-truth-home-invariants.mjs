import assert from 'node:assert/strict';
import fs from 'node:fs';

const component=fs.readFileSync('src7/OperationalTruthR495.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');
const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const endpoint of ['/api/core-health','/api/release-evidence','/omega-build-receipt.json','/api/hybrid/status'])assert.ok(component.includes(endpoint),`R495 missing first-hand source ${endpoint}`);
assert.ok(component.includes('Promise.allSettled'),'R495 sources must fail independently instead of blanking sibling truth');
assert.ok(component.includes("cache:'no-store'")&&component.includes("'cache-control':'no-cache'"),'R495 must bypass stale runtime evidence');
assert.ok(component.includes("refreshPolicy:'MOUNT_FOCUS_VISIBILITY_MANUAL_NO_BACKGROUND_INTERVAL'"),'R495 refresh law missing');
assert.ok(!component.includes('setInterval('),'R495 must not add another background polling loop');
assert.ok(component.includes("window.addEventListener('focus'")&&component.includes("document.addEventListener('visibilitychange'"),'R495 must recover current truth on focus/visibility');
assert.ok(component.includes('nativeExecutionClaimed===true'),'R495 device online state must require returned native execution proof');
assert.ok(component.includes('canonicalMutation:false'),'R495 observation surface must remain read-only');
assert.ok(component.includes("dispatch({type:'HEALTH',key:'cloud'")&&component.includes("dispatch({type:'HEALTH',key:'device'"),'R495 must replace OMEGA7 cloud/device UNKNOWN placeholders with returned truth');
assert.ok(component.includes("data-r495-operational-truth='true'")&&component.includes("data-r495-state={state.toLowerCase()}"),'R495 visible/terminal browser contract missing');

assert.ok(root.includes("import OperationalTruthR495 from './OperationalTruthR495'"),'OMEGA7 root must import R495');
assert.ok(root.includes("state.domain==='HOME'&&<OperationalTruthR495 depth={state.depth} onNavigate={open}/>"),'R495 must be visible on canonical OMEGA7 Home');
assert.ok(css.includes('.o7-operational-truth{')&&css.includes('.o7-operational-grid{'),'R495 responsive presentation missing');

assert.ok(live.includes('.o7-operational-truth[data-r495-operational-truth="true"]'),'R489 exact-production browser proof must exercise R495');
assert.ok(live.includes("['ready','partial'].includes(operationalState||'')"),'R495 live proof must require a bounded terminal state without converting source holds into fabricated readiness');
assert.equal(pkg.scripts['test:r495'],'node tests/r495-omega7-operational-truth-home-invariants.mjs','R495 npm script missing');
assert.ok(pkg.scripts.check.includes('npm run test:r494 && npm run test:r495'),'R495 must remain release-blocking after R494');

console.log('R495 OMEGA7 OPERATIONAL TRUTH PASS · canonical Home shows first-hand core/source/Worker/device state · exact lineage mismatch remains visible · provider/device holds do not erase sibling truth · focus/manual refresh without a duplicate poller · read-only Canon boundary · exact-production browser acceptance inherited');
