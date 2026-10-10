import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {OMEGA7_CAPABILITIES,OMEGA7_DOMAINS} from '../src7/capabilityRegistry.ts';
import {R486_VISIBLE_CAPABILITIES} from '../src7/visibleCapabilityConvergenceR486.ts';
import {RECOVERED_SYSTEM_EXECUTION_R512} from '../src/recoveredSoftwareExecutionR512.ts';
import {MASTER_MENU_OPTIONS_R83,MASTER_CAPABILITIES_R83,routeForMenuOptionR83,routeForCapabilityR83} from '../src/softwareMasterLedgerR83.ts';
import {R512_DOMAIN_MENU} from '../src7/capabilityMenuR512.ts';
const root=readFileSync('src7/Omega7Root.tsx','utf8');
const library=readFileSync('src7/capabilityLibraryR520.tsx','utf8');
const css=readFileSync('src7/capabilityLibraryR520.css','utf8');
const shellCss=readFileSync('src7/omega7.css','utf8');
const browser=readFileSync('tests/r520-complete-function-library-browser-e2e.mjs','utf8');
assert.equal(R512_DOMAIN_MENU.length,OMEGA7_DOMAINS.length,'six canonical top-level areas retained');
assert.equal(OMEGA7_CAPABILITIES.length,44,'44 current tools cannot be reduced');
assert.equal(R486_VISIBLE_CAPABILITIES.length,72,'72 source lineages cannot be hidden');
assert.equal(RECOVERED_SYSTEM_EXECUTION_R512.length,100,'100 historical records cannot be collapsed into names-only search');
assert.equal(MASTER_MENU_OPTIONS_R83.length,36,'36 original menu option definitions require a distinct truthful collection');
assert.equal(MASTER_CAPABILITIES_R83.length,18,'18 historical capability contracts must remain discoverable');
assert.equal(new Set(MASTER_MENU_OPTIONS_R83.map(x=>x.optionId)).size,36);
assert.equal(new Set(MASTER_CAPABILITIES_R83.map(x=>x.id)).size,18);
assert.equal(new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute)).size,44);
assert.equal(new Set(R486_VISIBLE_CAPABILITIES.map(x=>x.id)).size,72);
assert.equal(new Set(RECOVERED_SYSTEM_EXECUTION_R512.map(x=>x.systemId)).size,100);
const routeSet=new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute));
assert.ok(R486_VISIBLE_CAPABILITIES.every(x=>routeSet.has(x.route)),'recovered functions must have a currently named route');
assert.ok(RECOVERED_SYSTEM_EXECUTION_R512.every(x=>routeSet.has(x.route)),'historical systems must map to declared successor or inspection route');
assert.ok(MASTER_MENU_OPTIONS_R83.every(x=>routeSet.has(routeForMenuOptionR83(x))),'menu option inspection route cannot invent current executor');
assert.ok(MASTER_CAPABILITIES_R83.every(x=>routeSet.has(routeForCapabilityR83(x))),'contract inspection route cannot invent current executor');
for(const [needle,meaning] of [
 ['OMEGA7_CAPABILITIES.filter','source-registry route enumeration'],
 ['R486_VISIBLE_CAPABILITIES.filter','full recovered capability enumeration'],
 ['RECOVERED_SYSTEM_EXECUTION_R512.filter','full historical inventory enumeration'],
 ['MASTER_MENU_OPTIONS_R83.filter','historic menu option inventory'],
 ['MASTER_CAPABILITIES_R83.filter','historic capability contract inventory'],
 ['data-r520-option={x.optionId}','individual menu option provenance'],
 ['data-r520-contract={x.id}','individual historical contract provenance'],
 ['Inspect associated workspace','a mapped workspace is explicitly not an operation executor'],
 ["do not prove those functions execute",'missing implementation truth remains visible'],
 ['data-r520-route={x.legacyRoute}','route-specific open surface'],
 ['data-r520-recovered={x.id}','source identity of recovered capability'],
 ['data-r520-historical={x.systemId}','source identity of historical software'],
 ['onRoute(x.legacyRoute)','actual current route invocation'],
 ['onRecovered(x)','current recovered successor/capsule invocation'],
 ['onHistorical(x)','historical successor/inspection invocation'],
 ["x.state==='ARCHIVE_ONLY'?'Inspect lineage'","archive donors may not masquerade as runnable"],
 ["x.state==='RESTORATION_REQUIRED'?'Inspect restoration'","restoration debt not runnable"],
 ["x.state==='TRUTH_GATED'?'Open evidence gate'","recovered proof boundary retained"],
 ["Inventories overlap","no invented 216 independent executors"]]){
 assert.ok(library.includes(needle),'R520 library missing '+meaning);
}
assert.ok(root.includes('data-r520-full-library=\'open\''),'top-level global function access must always be present');
assert.ok(root.includes('libraryOpen&&<Suspense'),'historical inventory should not inflate default home payload');
assert.ok(root.includes('onRoute={open} onRecovered={launchRecovered} onHistorical={launchRecoveredSystem}'),'execution mapping must use previous source-bound executor functions');
assert.ok(root.includes("data-r510-visual-restoration='CURRENT_R71_CANONICAL_HOME'"),'visual home not replaceable by function list');
assert.ok(root.includes("data-r486-visible-convergence='true'"),'older recovered fabric preserved');
assert.ok(css.includes('@media(max-width:760px)'),'mobile inventory use required');
assert.ok(shellCss.includes('.o7-topbar .o7-r520-toggle{flex:0 0 44px'),'mobile All Functions must have a bounded hitbox, not intercept Home');
assert.ok(shellCss.includes('.o7-topbar .o7-r520-toggle strong{display:none}'),'mobile header must use accessible icon-size control');
assert.ok(browser.includes('assertHeaderHitboxes(page,label'),'browser must test real mobile hit testing and home click');
assert.ok(browser.includes("width:320,height:700"),'narrow phone hitbox proof cannot be omitted');
assert.ok(browser.includes('after lazy function library loaded'),'drawer CSS cannot later reintroduce header overlap');
assert.ok(browser.includes("await check(browser,'desktop'")&&browser.includes("await check(browser,'mobile'"),'real dual viewport browser proof required');
console.log('R520 COMPLETE FUNCTION INVENTORY PASS · 44 current routes · 72 recovered lineages · 100 historical records · 6 canonical areas · donor/gate boundaries explicit');
