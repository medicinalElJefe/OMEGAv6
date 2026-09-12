import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R286/R307 '+msg);

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

must(index.includes('/src/r286InteractionIntegrity.css'),'compatibility layer must be loaded by the canonical HTML root');
must(compat.includes('presentation only')&&compat.includes('No route, execution, proof, Canon, evidence, or persistence authority'),'compatibility layer must remain presentation-only');
const n=Number((sarUi.match(/const N=(\d+)/)||[])[1]);
must(n===78,'SAR renderer must retain the canonical 78×78 field');
must(compat.includes('grid-template-columns:repeat(78,minmax(0,1fr))')&&compat.includes('grid-template-rows:repeat(78,minmax(0,1fr))'),'mobile compatibility grid must equal renderer geometry in both axes');
if(sarCss.includes('grid-template-columns:repeat(56,1fr)'))must(compat.includes('.sar-r280 .r280-canvas'),'legacy 56-column mobile rule must be superseded by a higher-specificity canonical-field selector');

// R307 closes restored mouse-first specialist geometry at the canonical final presentation layer.
must(compat.includes('@media (any-pointer:coarse)'),'touch closure must be scoped to coarse-pointer interaction');
must(compat.includes('#root .omega-workstation-v2 button:not([disabled])')&&compat.includes("#root .omega-workstation-v2 [role='button']"),'coarse-pointer action floor must cover native and semantic workstation actions');
must(compat.includes('min-width:44px!important')&&compat.includes('min-height:44px!important'),'coarse-pointer action controls must retain a deterministic 44×44 floor with enough cascade authority to beat restored compact rules');
must(compat.includes('#root .omega-workstation-v2 input:not([disabled])')&&compat.includes('#root .omega-workstation-v2 select:not([disabled])')&&compat.includes('#root .omega-workstation-v2 textarea:not([disabled])'),'coarse-pointer form floor must cover enabled inputs, selects and textareas');
must(compat.includes('touch-action:manipulation'),'coarse-pointer actions must retain direct manipulation semantics');

const surfaceBlock=(workstation.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(m=>m[1]);
must(surfaces.length===44,'workstation must expose all 44 canonical surfaces');
must(new Set(surfaces).size===44,'canonical workstation surfaces must be unique');
must(workstation.includes('const go=(name:string)=>'),'canonical go() route path must remain wired');
must(workstation.includes("useEffect(()=>{localState.write('omega.v6.panel',panel)},[panel])"),'canonical panel identity must persist from the normalized active panel');
must(shell.includes("new CustomEvent('omega-r88-open-navigator'")&&side.includes("addEventListener('omega-r88-open-navigator'"),'All systems dispatcher and global navigator listener must remain paired');
must(adapter.includes('return raw === null ? fallback : JSON.parse(raw) as T'),'panel persistence adapter must decode stored route identity before normalization');

console.log('R286/R307 UI INTERACTION INTEGRITY PASS · modern navigation hierarchy + 44 canonical surfaces + shared menu event + normalized persisted panel identity + exact 78×78 mobile field geometry + universal coarse-pointer 44×44 action/form floor preserved.');
