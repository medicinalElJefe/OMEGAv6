import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R286/R305 '+msg);

await import('./r155-navigation-information-architecture-invariants.mjs');
await import('./r203-interface-navigation-polish-invariants.mjs');
await import('./r257-adaptive-experience-shell-invariants.mjs');
await import('./r279-earth-truth-navigation-invariants.mjs');
await import('./r280-sar-truth-invariants.mjs');

const app=read('src/App.tsx');
const index=read('index.html');
const compat=read('src/r286InteractionIntegrity.css');
const sarUi=read('src/SARTruthInstrumentR280.tsx');
const sarCss=read('src/sarTruthR280.css');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const shell=read('src/OmegaExperienceShellR257.tsx');
const side=read('src/OmegaSideNavigatorR88.tsx');
const adapter=read('src/platformAdapter.ts');
const browserProof=read('tests/r286-all-surface-browser-e2e.mjs');
const responsive=read('src/responsivePolishR88.css');
const navCss=read('src/omegaSideNavigatorR210.css');
const specialistCss=read('src/specialistLoaderR109.css');
const interactionAuthority=read('src/interactionAuthorityR305.css');
const reachability=read('src/capabilityReachabilityR305.ts');
const inventory=read('src/OmegaSystemInventoryR83.tsx');

must(index.includes('/src/r286InteractionIntegrity.css'),'compatibility layer must be loaded by the canonical HTML root');
must(compat.includes('presentation only')&&compat.includes('No route, execution, proof, Canon, evidence, or persistence authority'),'compatibility layer must remain presentation-only');
const n=Number((sarUi.match(/const N=(\d+)/)||[])[1]);
must(n===78,'SAR renderer must retain the canonical 78×78 field');
must(compat.includes('grid-template-columns:repeat(78,minmax(0,1fr))')&&compat.includes('grid-template-rows:repeat(78,minmax(0,1fr))'),'mobile compatibility grid must equal renderer geometry in both axes');
if(sarCss.includes('grid-template-columns:repeat(56,1fr)'))must(compat.includes('.sar-r280 .r280-canvas'),'legacy 56-column mobile rule must be superseded by a higher-specificity canonical-field selector');

const surfaceBlock=(workstation.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(m=>m[1]);
must(surfaces.length>0,'current workstation source must expose a non-empty canonical surface inventory');
must(new Set(surfaces).size===surfaces.length,'canonical workstation surfaces must be unique');
must(workstation.includes('const go=(name:string)=>'),'canonical go() route path must remain wired');
must(workstation.includes("useEffect(()=>{localState.write('omega.v6.panel',panel)},[panel])"),'canonical panel identity must persist from the normalized active panel');
must(shell.includes("new CustomEvent('omega-r88-open-navigator'")&&side.includes("addEventListener('omega-r88-open-navigator'"),'All systems dispatcher and global navigator listener must remain paired');
must(adapter.includes('return raw === null ? fallback : JSON.parse(raw) as T'),'panel persistence adapter must decode stored route identity before normalization');

must(app.includes("<div className='r305-global-world-bands'><LivingWorldPulseR174")&&app.includes('<LivingSceneEvidenceBandR2023 onNavigate={navigate}/><MissionWorldContinuityR206 onNavigate={navigate}/><LivingTerrainSurfaceR225/></div>'),'R305 must group all four root-level living-world surfaces into one navigation-reservation membrane without changing their truth/execution authority');
must(navCss.includes('.r210-converged-nav{z-index:900!important;isolation:isolate}'),'persistent navigator must own an explicit interaction layer above root living-world presentation bands');
must(navCss.includes("html[data-omega-nav-present='true'] .r305-global-world-bands")&&navCss.includes("html[data-omega-nav-expanded='true'] .r305-global-world-bands"),'root living-world membrane must reserve the same persistent/expanded navigation geometry as the active product shell');
must(navCss.includes("@media(max-width:900px)")&&navCss.includes("Mobile uses a deliberate drawer above the reserved rail"),'mobile must preserve its drawer contract rather than collapsing the global world membrane to the desktop panel remainder');

must(navCss.includes('.r210-converged-nav .r94-nav-panel{')&&navCss.includes('display:flex!important')&&navCss.includes('flex-direction:column!important'),'expanded navigator must use one structural vertical flow rather than the obsolete fixed five-row grid while later controls are present');
must(navCss.includes('.r210-converged-nav .r94-nav-panel>:not(.r89-flat-scroll):not(.r88-software-layer){flex:0 0 auto}'),'navigator headers/filters/status/footer must remain outside the scroll allocation');
must(navCss.includes('.r210-converged-nav .r89-flat-scroll,.r210-converged-nav .r88-software-layer{flex:1 1 0!important;min-height:0!important}'),'route/software body must own the remaining scrollable navigator height');
const footerRule=(navCss.match(/\.r210-converged-nav \.r88-navigator-foot\{([^}]*)\}/)||[])[1]||'';
must(footerRule.includes('position:relative!important')&&footerRule.includes('flex:0 0 auto')&&footerRule.includes('z-index:1'),'navigator footer must remain in normal structural flow below the flexible route body');
must(!footerRule.includes('pointer-events:none'),'navigator collision repair must not hide footer overlap by disabling hit testing');
must(!navCss.includes('.r210-converged-nav .r105-context-note{pointer-events:none'),'noninteractive context copy must not be used as a transparent visual mask over live navigator controls');

must(specialistCss.startsWith("@import './interactionAuthorityR305.css';"),'R305 final interaction authority must load from the last static specialist stylesheet position');
must(interactionAuthority.includes('final presentation-only touch/reduced-motion contract')&&interactionAuthority.includes('owns no route, execution, proof, evidence, persistence, deployment, state, or Canon authority'),'R305 late interaction layer must remain presentation-only');
for(const token of [
 "#root .omega-workstation-v2 :where(button,[role='button']){min-width:44px!important;min-height:44px!important",
 '#root .omega-workstation-v2 :where(input,select,textarea){min-height:44px!important}',
 '#root .r210-converged-nav .r89-nav-mode button{min-width:44px!important;min-height:44px!important',
 '#root .r210-converged-nav .r89-flat-route{min-height:54px!important',
 '@media(prefers-reduced-motion:reduce)',
 'transition:none!important;animation:none!important;scroll-behavior:auto!important'
])must(interactionAuthority.includes(token),`R305 late interaction authority missing ${token}`);
must(!interactionAuthority.includes(':where(.r88-head-actions button,.r89-nav-mode button'),'R305 must not regress the R304 navigator-mode selector into zero-specificity :where(...) grouping');
must(navCss.includes('.r210-converged-nav .r89-nav-mode button{min-width:44px!important;min-height:44px!important}'),'R304 direct-selector navigator specificity closure must remain in the source navigation layer');
must(responsive.includes("@media(any-pointer:coarse)")&&responsive.includes(":where(button,[role='button']){min-width:44px!important;min-height:44px!important}")&&responsive.includes(":where(input,select,textarea){min-height:44px!important}"),'R305 shared responsive layer must retain the baseline coarse-pointer action/form contract');

for(const token of [
 "rule:'NO_LAYER_MAY_BURY_A_REGISTERED_FUNCTION'",
 'OMEGA_ALL_ROUTES_R82','missingInNavigation','orphanNavigation','duplicateNavigation','unreachableLedgerRows','OMEGA_NAVIGATION_CONTRACT_R289.orphanRoutes','layerAudit.missingBindings','modeRoutePresent','systemMapPresent','evidenceRoutePresent',
 'Registered, visible or routable does not mean executing, connected, empirically evidenced, deployed, promoted or Canon-admitted','Route count remains telemetry rather than an architectural ceiling'
])must(reachability.includes(token),`R305 cross-ledger reachability fabric missing ${token}`);
must(!reachability.includes('routeCount===44')&&!reachability.includes('routes.length===44'),'R305 reachability fabric must not turn the current route count into an architectural ceiling');
must(inventory.includes("data-reachability-revision='R305'")&&inventory.includes("data-reachability-pass={R305_CAPABILITY_REACHABILITY.pass?'true':'false'}")&&inventory.includes('data-reachability-residual-count={R305_CAPABILITY_REACHABILITY.residualCount}'),'System map must expose the read-only R305 reachability result to browser proof');

for(const token of [
 "deviceScaleFactor:2,hasTouch:true,isMobile:true,reducedMotion:'reduce'","matchMedia('(any-pointer: coarse)').matches","matchMedia('(prefers-reduced-motion: reduce)').matches",'.r88-head-actions button,.r89-nav-mode button,.r94-rail-action,.r89-flat-route','buriedTargets','R305 expanded navigator controls are geometrically buried by another layer','x.height<43.5||x.width<43.5','.workstation-main input:not([disabled])','.workstation-main textarea:not([disabled])','undersizedTouchActions','undersizedTouchForms','coarse-pointer action controls below 44×44px','coarse-pointer form controls below 44px high',"document.documentElement.dataset.omegaNavExpanded!=='true'",'document.elementFromPoint','snap.buried.length','visible interactive controls are geometrically buried by another layer','if(!snap.mainPresent||snap.left===null||snap.right===null||snap.left<-1||snap.right>snap.viewportWidth+1)','active workstation escaped horizontal viewport containment','verifyReachabilityFabric','.r83-inventory[data-reachability-revision="R305"]',"state.pass!=='true'||state.residuals!==0",'R305 no-burial reachability audit not clean','R286/R305 ALL-SURFACE BROWSER PASS'
])must(browserProof.includes(token),`R305 real-browser interaction/reachability proof missing ${token}`);

must(browserProof.includes('expected.length===0||new Set(expected).size!==expected.length'),'browser proof must reject empty/duplicate current route inventories without hard-coding a historical route ceiling');
must(browserProof.includes('allRoutes!==expected.length')&&browserProof.includes('unique.length!==expected.length')&&browserProof.includes('for(const route of expected)'),'browser proof must traverse the complete source-derived current route inventory');
must(!browserProof.includes('expected.length!==44')&&!browserProof.includes('unique.length!==44'),'R305 browser traversal must not freeze future product growth to 44 routes');
must(browserProof.indexOf('await verifyR305InteractionEnvelope(page,name)')<browserProof.indexOf('for(const route of expected){'),'R305 expanded navigator geometry/occlusion envelope must be proved before route activation');
must(browserProof.indexOf('await verifyReachabilityFabric(page,name)')<browserProof.indexOf('for(const route of expected){'),'R305 cross-ledger reachability must be proved before exhaustive route activation');
must(browserProof.indexOf('if(!snap.mainPresent')>browserProof.indexOf('await clickRoute(page,route)'),'R305 workstation containment must be asserted after each canonical route is activated');
must(browserProof.indexOf('if(snap.buried.length)')>browserProof.indexOf('await clickRoute(page,route)'),'R305 active-workspace layer-occlusion rejection must execute after each canonical route is activated');
must(browserProof.includes("await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded!=='true'"),'R305 must wait for canonical destination-selection collapse before active-workspace occlusion proof');
must(!browserProof.includes("document.querySelectorAll('.omega-workstation-v2 input:not([disabled])")&&!browserProof.includes("document.querySelectorAll('.omega-workstation-v2 button:not([disabled])"),'R305 active-workspace occlusion/size proof must not conflate intentionally layered expanded navigator controls with destination controls');
must((browserProof.match(/await verifyR305InteractionEnvelope\(page,name\)/g)||[]).length>=3,'R305 navigator occlusion must be re-proved on initial open and final close/reopen sequence');
must(!browserProof.includes('page.route(')&&!browserProof.includes('Math.random'),'R305 interaction proof must exercise the real built UI without request mocking or random acceptance');
must(!/document\.querySelector(?:All)?\([^\n)]*:visible/.test(browserProof),'native DOM selector APIs must never receive Playwright-only :visible pseudo-selectors');
must(browserProof.includes("page.locator('.r89-flat-route:visible').first().waitFor({state:'visible',timeout:10000})"),'R305 All tools reachability restoration must use Playwright visibility semantics in the Playwright selector domain');

console.log(`R286/R305 UI INTERACTION INTEGRITY PASS · current ${surfaces.length}-surface source inventory is non-empty and unique · exact 78×78 mobile SAR field geometry · global living-world reservation membrane · structural navigator flex flow without hit-test masking · R304 selector-specificity closure preserved · cross-ledger NO_LAYER_MAY_BURY_A_REGISTERED_FUNCTION audit bound · browser route traversal source-derived rather than historically capped · expanded navigator and active-workspace center-point occlusion proof · touch/reduced-motion proof bound · Playwright-only selector syntax excluded from native DOM querySelector APIs.`);
