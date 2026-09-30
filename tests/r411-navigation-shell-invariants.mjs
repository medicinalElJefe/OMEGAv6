import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const legacyCss=read('src/omegaSideNavigatorR88.css');
const css=read('src/omegaNavigationShellR411.css');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const home=read('src/OmegaHomeR71.tsx');
const registry=read('src/navigationRegistry.ts');

const surfaceBlock=registry.slice(registry.indexOf('export const OMEGA_NAVIGATION=['),registry.indexOf('export const OMEGA_NAV_GROUPS'));
const routes=[...surfaceBlock.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);

assert.equal(routes.length,44,'R411 must preserve the canonical 44-route inventory');
assert.equal(new Set(routes).size,44,'R411 route inventory must remain unique');
assert.ok(nav.includes("R411_NAVIGATION_SHELL_REVISION='R411'"),'R411 shell revision missing');
assert.ok(nav.includes('r411-navigation-shell'),'R411 shell class missing');
assert.ok(nav.includes('data-navigation-shell-revision={R411_NAVIGATION_SHELL_REVISION}'),'R411 shell receipt missing');
assert.ok(!legacyCss.includes('R411 · CANONICAL NAVIGATION SHELL REBUILD'),'legacy R88 stylesheet must not also own final R411 geometry');
assert.ok(workstation.includes("import './omegaNavigationShellR411.css';")&&workstation.indexOf("omegaNavigationShellR411.css")>workstation.indexOf("workstationPresentationR356.css"),'Workstation must load R411 after its presentation authority');
assert.ok(home.includes("import './omegaNavigationShellR411.css';")&&home.indexOf("omegaNavigationShellR411.css")>home.indexOf("wholeSystemExperienceR132.css"),'Home must load R411 after its presentation authority');
assert.ok(nav.includes('rows.map(route=>')&&!nav.includes('rows.slice('),'R411 must preserve complete direct route reachability');
assert.ok(!nav.includes("document.body.style.overflow='hidden'"),'R411 must not lock application scrolling');
assert.ok(nav.includes('useLayoutEffect')&&nav.includes('useId'),'R411 remount state must use synchronous per-instance ownership');
assert.ok(nav.includes('dataset.omegaNavOwner=navOwnerId'),'R411 navigator must claim shared layout state with a stable owner id');
assert.ok(nav.includes('data-navigation-owner={navOwnerId}'),'R411 canonical shell must expose the same owner used by shared layout state');
assert.ok(nav.includes("if(root.dataset.omegaNavOwner!==navOwnerId)return"),'unmounting navigator must not erase a newer remounted navigator state');

assert.ok(css.includes('R411 · CANONICAL NAVIGATION SHELL REBUILD'),'R411 canonical shell declaration missing');
assert.ok(css.includes('.r411-navigation-shell .r94-nav-panel.r88-navigator'),'R411 must own the expanded browser geometry');
assert.ok(css.includes('transition:opacity .16s ease!important;')&&!css.includes('transition:opacity .16s ease,visibility .16s ease!important;'),'R411 expanded shell must expose visibility immediately; only opacity may animate');
assert.ok(css.includes('background:#02080b!important'),'mobile browser must be opaque rather than showing live content through the menu');
assert.ok(css.includes('R411.1 · PHONE COMMAND DOCK'),'R411 phone command-dock authority missing');
assert.ok(css.includes('grid-template-columns:repeat(7,minmax(0,1fr))!important'),'mobile command dock must expose seven bounded global actions');
assert.ok(css.includes(".r411-navigation-shell .r94-rail-action[title='All tools']{display:none!important}"),'mobile command dock must not duplicate the menu launcher');
assert.ok(css.includes('width:100vw!important;max-width:100vw!important;min-width:0!important'),'mobile browser must own full viewport width above the dock');
assert.ok(css.includes('bottom:var(--r411-mobile-dock)!important'),'mobile browser must reserve the command dock rather than cover it');
assert.ok(css.includes("html[data-omega-nav-present='true'] .r257-shell")&&css.includes("html[data-omega-nav-expanded='true'] .r257-shell")&&css.includes('margin-left:0!important;width:100%!important;max-width:100%!important'),'mobile bottom-dock mode must release the headless R257 shell from inherited side-rail reservation');
assert.ok(nav.includes("showTechnical&&<div className='r333-filter-row r411-master-row'>"),'Simple view must structurally omit recovered master-menu density until explicit Technical opt-in');
assert.ok(nav.includes("className='r333-filter-row r411-workspace-row'"),'ALL + six workspace controls must remain structurally mounted in Simple and Technical views');
assert.ok(!css.includes("[data-technical='false'] .r333-filter-row:first-child"),'R411 must not hide navigation rows by positional CSS');
assert.ok(css.includes('.r411-navigation-shell .r289-master-menu-filter')&&css.includes('overflow-x:auto!important')&&css.includes('flex-wrap:nowrap!important'),'Technical view must expose recovered master menus in one contained horizontal strip');
assert.ok(css.includes('.r411-navigation-shell .r105-workspace-filter button')&&css.includes('min-height:40px!important'),'workspace filter must retain the 40px desktop target floor before the 44px coarse-pointer override');
assert.ok(css.includes("[data-technical='false'] .r111-output-ribbon{display:none!important}"),'simple navigation must not let route-contract diagnostics dominate the menu');
assert.ok(css.includes("html:has(.earth-r372-stage-expanded) .r411-navigation-shell")&&css.includes("html:has(.earth-r372-stage-expanded) .workstation-topbar"),'fullscreen Earth must suppress global/workstation chrome');
assert.ok(css.includes('z-index:2147483647!important;pointer-events:auto!important'),'fullscreen Earth exit control must retain top interaction authority');
assert.ok(css.includes("@media(min-width:901px)")&&css.includes('margin-left:calc(var(--r411-rail) + var(--r411-panel))!important'),'desktop expanded navigation must reserve a real layout column');
assert.ok(css.includes('.r89-flat-scroll')&&css.includes('flex:1 1 auto!important')&&css.includes('overflow:auto!important'),'R411 route list must be the single flexible scroll owner');

console.log('R411.10 NAVIGATION SHELL PASS · one final shell stylesheet after Home/Workstation presentation · single-owner synchronous remount state · desktop reserved column · phone bottom command dock + opaque full-width menu sheet · compact directly reachable master-menu strip · fullscreen chrome suppression · 44 routes preserved');
