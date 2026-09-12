import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R286/R305 '+msg);

await import('./r155-navigation-information-architecture-invariants.mjs');
await import('./r203-interface-navigation-polish-invariants.mjs');
await import('./r257-adaptive-experience-shell-invariants.mjs');
await import('./r279-earth-truth-navigation-invariants.mjs');
await import('./r280-sar-truth-invariants.mjs');

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

must(index.includes('/src/r286InteractionIntegrity.css'),'compatibility layer must be loaded by the canonical HTML root');
must(compat.includes('presentation only')&&compat.includes('No route, execution, proof, Canon, evidence, or persistence authority'),'compatibility layer must remain presentation-only');
const n=Number((sarUi.match(/const N=(\d+)/)||[])[1]);
must(n===78,'SAR renderer must retain the canonical 78×78 field');
must(compat.includes('grid-template-columns:repeat(78,minmax(0,1fr))')&&compat.includes('grid-template-rows:repeat(78,minmax(0,1fr))'),'mobile compatibility grid must equal renderer geometry in both axes');
if(sarCss.includes('grid-template-columns:repeat(56,1fr)'))must(compat.includes('.sar-r280 .r280-canvas'),'legacy 56-column mobile rule must be superseded by a higher-specificity canonical-field selector');

const surfaceBlock=(workstation.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(m=>m[1]);
must(surfaces.length===44,'workstation must expose all 44 canonical surfaces');
must(new Set(surfaces).size===44,'canonical workstation surfaces must be unique');
must(workstation.includes('const go=(name:string)=>'),'canonical go() route path must remain wired');
must(workstation.includes("useEffect(()=>{localState.write('omega.v6.panel',panel)},[panel])"),'canonical panel identity must persist from the normalized active panel');
must(shell.includes("new CustomEvent('omega-r88-open-navigator'")&&side.includes("addEventListener('omega-r88-open-navigator'"),'All systems dispatcher and global navigator listener must remain paired');
must(adapter.includes('return raw === null ? fallback : JSON.parse(raw) as T'),'panel persistence adapter must decode stored route identity before normalization');

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
 "deviceScaleFactor:2,hasTouch:true,isMobile:true,reducedMotion:'reduce'",
 "matchMedia('(any-pointer: coarse)').matches",
 "matchMedia('(prefers-reduced-motion: reduce)').matches",
 '.r88-head-actions button,.r89-nav-mode button,.r94-rail-action,.r89-flat-route',
 'x.height<43.5||x.width<43.5',
 '.omega-workstation-v2 input:not([disabled])',
 '.omega-workstation-v2 textarea:not([disabled])',
 'undersizedTouchActions',
 'undersizedTouchForms',
 'coarse-pointer action controls below 44×44px',
 'coarse-pointer form controls below 44px high',
 'if(!snap.mainPresent||snap.left===null||snap.right===null||snap.left<-1||snap.right>snap.viewportWidth+1)',
 'active workstation escaped horizontal viewport containment',
 'R286/R305 ALL-SURFACE BROWSER PASS'
])must(browserProof.includes(token),`R305 real-browser interaction proof missing ${token}`);
must(browserProof.includes('expected.length!==44')&&browserProof.includes('for(const route of expected)'),'R305 must strengthen rather than reduce the inherited 44-route traversal');
must(browserProof.indexOf('await verifyR305InteractionEnvelope(page,name)')<browserProof.indexOf('for(const route of expected){'),'R305 initial navigator envelope must be proved before route activation');
must(browserProof.indexOf('if(!snap.mainPresent')>browserProof.indexOf('await clickRoute(page,route)'),'R305 workstation containment must be asserted after each canonical route is activated');
must(!browserProof.includes('page.route(')&&!browserProof.includes('Math.random'),'R305 interaction proof must exercise the real built UI without request mocking or random acceptance');

console.log('R286/R305 UI INTERACTION INTEGRITY PASS · 44 canonical surfaces + exact 78×78 mobile field geometry + shared menu event + normalized persisted panel identity + final root-scoped coarse-pointer/reduced-motion authority + R304 selector-specificity closure preserved + exhaustive real-browser interaction envelope bound.');
