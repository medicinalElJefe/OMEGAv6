import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const legacyCss=read('src/omegaSideNavigatorR88.css');
const css=read('src/omegaNavigationShellR411.css');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const home=read('src/OmegaHomeR71.tsx');
const registry=read('src/navigationRegistry.ts');
const rootCss=read('src/index.css');

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
assert.ok(css.includes('R411.11 · MOBILE USABLE VIEWPORT OWNERSHIP'),'R411 mobile usable-viewport authority missing');
assert.ok(css.includes('height:calc(100dvh - var(--r411-mobile-dock))!important')&&css.includes('grid-template-rows:auto minmax(0,1fr)!important'),'mobile workstation must end its layout viewport above the fixed command dock');
assert.ok(css.includes('overflow-y:auto!important')&&css.includes('overscroll-behavior-y:contain!important')&&css.includes('scroll-padding-bottom:20px!important'),'mobile workstation/home must expose a bounded vertical scroll owner that can move controls clear of the dock');
assert.ok(css.includes("html:has(.earth-r372-stage-expanded) .omega-workstation-v2{")&&css.includes('height:100dvh!important'),'fullscreen Earth must recover the complete viewport after mobile dock exclusion');
assert.ok(css.includes("html[data-omega-nav-present='true'] .r257-shell")&&css.includes("html[data-omega-nav-expanded='true'] .r257-shell")&&css.includes('margin-left:0!important;width:100%!important;max-width:100%!important'),'mobile bottom-dock mode must release the headless R257 shell from inherited side-rail reservation');
assert.ok(nav.includes("<div className='r333-filter-row r411-master-row'>"),'Recovered master-menu navigation must remain structurally visible in Simple and Technical views');
assert.ok(!nav.includes("showTechnical&&<div className='r333-filter-row r411-master-row'>"),'Simple view must never hide recovered master-menu navigation behind Technical opt-in');
assert.ok(nav.includes("className='r333-filter-row r411-workspace-row'"),'ALL + six workspace controls must remain structurally mounted in Simple and Technical views');
assert.ok(!css.includes("[data-technical='false'] .r333-filter-row:first-child"),'R411 must not hide navigation rows by positional CSS');
assert.ok(css.includes('.r411-navigation-shell .r289-master-menu-filter')&&css.includes('overflow-x:auto!important')&&css.includes('flex-wrap:nowrap!important'),'Recovered master menus must remain usable in one contained horizontal strip in both Simple and Technical views');
assert.ok(css.includes('.r411-navigation-shell .r105-workspace-filter button')&&css.includes('min-height:40px!important'),'workspace filter must retain the 40px desktop target floor before the 44px coarse-pointer override');
assert.ok(css.includes("[data-technical='false'] .r111-output-ribbon{display:none!important}"),'simple navigation must not let route-contract diagnostics dominate the menu');
assert.ok(css.includes("html:has(.earth-r372-stage-expanded) .r411-navigation-shell")&&css.includes("html:has(.earth-r372-stage-expanded) .workstation-topbar"),'fullscreen Earth must suppress global/workstation chrome');
assert.ok(css.includes('z-index:2147483647!important;pointer-events:auto!important'),'fullscreen Earth exit control must retain top interaction authority');
assert.ok(css.includes("@media(min-width:901px)")&&css.includes('margin-left:calc(var(--r411-rail) + var(--r411-panel))!important'),'desktop expanded navigation must reserve a real layout column');
assert.ok(css.includes('.r89-flat-scroll')&&css.includes('flex:1 1 auto!important')&&css.includes('overflow:auto!important'),'R411 route list must be the single flexible scroll owner');
assert.ok(rootCss.includes('R411.12: legacy studio structural layout is explicitly scoped to .studio'),'R411 legacy studio containment receipt missing');
for(const token of ['.studio>aside{grid-row:3;grid-column:1;','.studio>main{grid-row:3;grid-column:2;','.studio>footer{grid-column:1/-1;','.studio>main{grid-row:4;grid-column:1;','.studio>footer{grid-row:5;'])
 assert.ok(rootCss.includes(token),`R411 legacy studio structural selector must remain scoped: ${token}`);
assert.ok(!/(^|[}\s])aside\{/.test(rootCss)&&!/(^|[}\s])main\{/.test(rootCss)&&!/(^|[}\s])footer\{/.test(rootCss),'legacy studio structural element selectors must not leak grid/sticky ownership into current OMEGA');
assert.ok(css.includes('R411.14 · HEADLESS PRODUCT VIEWPORT OWNERSHIP'),'R411 headless dock-safe viewport authority missing');
assert.ok(css.includes(".r257-shell-headless .r317-product-root")&&css.includes('grid-template-rows:auto minmax(0,1fr)!important'),'headless product root must allocate diagnostics plus remaining workspace inside the dock-safe viewport');
assert.ok(css.includes(".r317-product-root>:is(.omega-workstation-v2,.r71-home)")&&css.includes('height:100%!important'),'Home/Workstation must consume the remaining headless product row instead of sizing from the raw viewport');
assert.ok(css.includes(".r317-product-root>.r318-system-diagnostics")&&css.includes('max-height:40dvh!important')&&css.includes('overflow:auto!important'),'explicitly opened diagnostics must remain bounded inside the headless viewport');
assert.ok(css.includes("html:has(.earth-r372-stage-expanded) .r257-shell-headless")&&css.includes("html:has(.earth-r372-stage-expanded) .r257-shell-headless .r318-system-diagnostics"),'fullscreen Earth must recover the full viewport and suppress headless diagnostics chrome');
assert.ok(css.includes('R427 · GLOBAL WORKSTATION SCROLL OWNERSHIP'),'R427 global route scroll ownership law missing');
assert.ok(css.includes(".r257-shell-headless .r317-product-root>.omega-workstation-v2[data-panel]")&&css.includes("grid-template-rows:auto minmax(0,1fr)!important"),'R427 routed workstation must be bounded by canonical product structure rather than transient nav state');
assert.ok(css.includes(".r257-shell-headless .r317-product-root>.omega-workstation-v2[data-panel]>.workstation-main")&&css.includes('overflow-y:auto!important'),'R427 workstation-main must own routed vertical scrolling with structural specificity above route-local presentation rules');
assert.ok(css.includes(".r257-shell-headless{")&&css.includes('height:100dvh!important')&&css.includes(".r257-shell-headless>.r257-stage"),'R427 desktop headless shell must provide a finite viewport chain');
assert.ok(css.includes("@media(max-width:900px)")&&css.includes("height:calc(100dvh - var(--r411-mobile-dock))!important"),'R427 mobile headless shell must terminate above the fixed command dock');
assert.ok(css.includes('R427 · RETIRE DUPLICATE LEGACY WORKSTATION CHROME')&&css.includes('.omega-workstation-v2>:is(.r27-desktop-frame,.r27-mobile-head,.r27-mobile-bottom,.r27-mobile-drawer)'),'R427 must keep R27 compatibility state mounted but retire its duplicate fixed navigation chrome under R411');

assert.ok(css.includes("html[data-omega-nav-present='true'] .r257-shell-headless")&&css.includes('height:100dvh!important'),'desktop/headless canonical product shell must own the viewport rather than expand with route content');
assert.ok(css.includes("html[data-omega-nav-present='true'] .omega-workstation-v2 .workstation-main")&&css.includes('overflow-y:auto!important'),'every routed workstation surface must share workstation-main as the canonical vertical scroll owner');
assert.ok(css.includes('scrollbar-gutter:stable!important')&&css.includes('overscroll-behavior-y:contain!important'),'canonical route scrolling must remain stable and bounded');
assert.ok(css.includes("html[data-omega-nav-present='true'] .r71-home")&&css.includes('overflow-y:auto!important'),'Home must remain independently scrollable under the same bounded product-shell law');
assert.ok(css.includes("html:has(.earth-r372-stage-expanded) .omega-workstation-v2 .workstation-main")&&css.includes('overflow:visible!important'),'fullscreen Earth must remain explicitly exempt from routed workstation scrolling');

console.log('R411/R427 NAVIGATION SHELL PASS · one final shell stylesheet after Home/Workstation presentation · canonical product viewport ownership · workstation-main vertical scrolling across all routed surfaces · desktop reserved column · phone bottom command dock + opaque full-width menu sheet · fullscreen Earth exemption · 44 routes preserved');
