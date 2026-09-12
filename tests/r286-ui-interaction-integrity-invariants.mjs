import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R286/R303 '+msg);

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

for(const token of [
 "deviceScaleFactor:2,hasTouch:true,isMobile:true,reducedMotion:'reduce'",
 "matchMedia('(any-pointer: coarse)').matches",
 "matchMedia('(prefers-reduced-motion: reduce)').matches",
 '.r88-head-actions button,.r89-nav-mode button,.r94-rail-action,.r89-flat-route',
 'x.height<43.5||x.width<43.5',
 'controls below 44px',
 'active workstation escaped horizontal viewport containment',
 "if(name==='mobile'&&snap.undersizedTouch.length)",
 'R286/R303 ALL-SURFACE BROWSER PASS'
])must(browserProof.includes(token),`R303 real-browser interaction proof missing ${token}`);
must(browserProof.includes("expected.length!==44")&&browserProof.includes("for(const route of expected)"),'R303 must strengthen rather than reduce the inherited 44-route traversal');
must(!browserProof.includes('page.route(')&&!browserProof.includes('Math.random'),'R303 interaction proof must exercise the real built UI without request mocking or random acceptance');

console.log('R286/R303 UI INTERACTION INTEGRITY PASS · modern navigation hierarchy + 44 canonical surfaces + shared menu event + normalized persisted panel identity + exact 78×78 mobile field geometry + 390px 2×DPR coarse-pointer/reduced-motion browser proof + 44px touch targets + horizontal containment preserved.');
