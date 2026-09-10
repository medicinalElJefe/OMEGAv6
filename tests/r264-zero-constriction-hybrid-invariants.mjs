import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const link=read('src/HybridLinkR32.tsx');
const linkCss=read('src/hybridLinkR112.css');
const adaptive=read('src/HybridParallelDevelopmentR262.tsx');
const shell=read('src/InstrumentOSShellR62.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const navCss=read('src/omegaSideNavigatorR88.css');
const registry=read('src/omegaExperienceRegistryR82.ts');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const wrangler=read('wrangler.jsonc');

assert.ok(wrangler.includes('"main": "src/workerR116.js"'),'R264 must preserve proven R116 production entrypoint');
assert.ok(link.includes("data-r264-operational-surfaces='FULL'")&&link.includes("data-r264-responsive='DESKTOP_MOBILE'")&&link.includes("data-r264-hybrid-bytes='EAGER'"),'R264 full-surface/desktop-mobile/eager truth markers missing');

const ordinary=[
 ["HybridMissionControlR8","./HybridMissionControlR8"],
 ["HybridWovenContinuityR238","./HybridWovenContinuityR238"],
 ["HybridExecutionMotionR243","./HybridExecutionMotionR243"],
 ["HybridHostIntelligenceR238","./HybridHostIntelligenceR238"],
 ["HybridResourceGovernorR239","./HybridResourceGovernorR239"],
 ["HybridActionRuntimeR247","./HybridActionRuntimeR247"],
 ["HybridOutcomeClosureR254","./HybridOutcomeClosureR254"],
 ["HybridExperienceLedgerR255","./HybridExperienceLedgerR255"],
 ["HybridParallelDevelopmentR262","./HybridParallelDevelopmentR262"],
 ["HybridHostEffectsR212","./HybridHostEffectsR212"],
 ["HybridCommandDeckR237","./HybridCommandDeckR237"],
 ["HybridProofClosureR141","./HybridProofClosureR141"],
 ["MissionLineageReviewR209","./MissionLineageReviewR209"]
];
for(const [name,path] of ordinary){
 assert.ok(link.includes(`import ${name} from '${path}'`),`R264 must keep Hybrid capability eager/available: ${name}`);
 assert.ok(!link.includes(`lazy(()=>import('${path}'))`),`R264 may not lazy-load Hybrid capability: ${name}`);
}
for(const name of ordinary.filter(([n])=>n!=='HybridMissionControlR8').map(([n])=>n))assert.ok(link.includes(`<${name}/>`),`R264 must keep ordinary Hybrid surface mounted: ${name}`);
const ordered=['<HybridWovenContinuityR238/>','<HybridExecutionMotionR243/>','<HybridHostIntelligenceR238/>','<HybridResourceGovernorR239/>','<HybridActionRuntimeR247/>','<HybridOutcomeClosureR254/>','<HybridExperienceLedgerR255/>','<HybridParallelDevelopmentR262/>','<HybridHostEffectsR212/>','<HybridCommandDeckR237/>','<HybridProofClosureR141/>','<MissionLineageReviewR209/>'];
for(let i=1;i<ordered.length;i++)assert.ok(link.indexOf(ordered[i-1])<link.indexOf(ordered[i]),`R264 changed established operational surface order around ${ordered[i]}`);
assert.match(link,/\{deepOpen&&<HybridMissionControlR8 status=\{status\} record=\{record\}\/>\}/,'R264 R8 mission/federation donor must remain loaded and explicit-demand reachable');
assert.ok(!link.includes('Suspense')&&!link.includes('lazy('),'R264 must not introduce Hybrid lazy/Suspense capability gating');
assert.ok(!link.includes('HybridProgressiveMountR263')&&!fs.existsSync('src/HybridProgressiveMountR263.tsx')&&!fs.existsSync('src/hybridProgressiveMountR263.css'),'R264 progressive/viewport gating must be absent');

assert.ok(linkCss.includes('.r112-hybrid-link{display:grid;gap:15px;min-width:0;max-width:100%;overflow-x:hidden}'),'R264 Hybrid root containment missing');
assert.ok(linkCss.includes('@media(max-width:760px)')&&linkCss.includes('grid-template-columns:minmax(0,1fr)'),'R264 mobile one-column containment missing');
assert.ok(linkCss.includes('overflow-x:auto')&&linkCss.includes('-webkit-overflow-scrolling:touch'),'R264 mobile wide-data access must scroll rather than clip');
assert.ok(!linkCss.includes('content-visibility:auto')&&!linkCss.includes('contain-intrinsic-size'),'R264 may not hide Hybrid layers through content-visibility optimization');

assert.ok(adaptive.includes("import {startTransition,useEffect,useMemo,useState} from 'react'")&&adaptive.includes('startTransition(()=>setCorpus(read()))'),'R264 must schedule R262 corpus reconciliation outside urgent interaction');
assert.ok(adaptive.includes('const WATCHDOG_MS=30_000')&&adaptive.includes('window.setInterval(tick,WATCHDOG_MS)'),'R264 event-first observer must use slow bounded fallback watchdog');
assert.ok(adaptive.includes("window.addEventListener('storage',sync)")&&adaptive.includes('window.addEventListener(CORPUS_EVENT,sync)'),'R264 must preserve same-tab/cross-tab event-first synchronization');

assert.ok(shell.includes("document.documentElement.dataset.omegaFrame=frame"),'R264 must preserve AUTO/DESKTOP/MOBILE frame authority');
assert.ok(nav.includes('OMEGA_ALL_ROUTES_R82')&&!nav.includes('rows.slice('),'R264 must preserve all global routes without truncation');
assert.ok(navCss.includes("@media(max-width:900px)")&&navCss.includes('--r94-nav-panel:min(42vw,220px)'),'R264 must preserve mobile non-covering global navigation');
const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
assert.ok(routes.length>0&&surfaces.length===routes.length&&new Set(surfaces).size===surfaces.length,'R264 must preserve complete unique application surface inventory');
for(const route of routes)assert.ok(surfaces.includes(route),`R264 workstation missing registered route ${route}`);
assert.ok(!fs.existsSync('src/workerR264.js'),'R264 must not create another Worker or Durable Object authority');

console.log(`R264 ZERO-CONSTRICTION HYBRID PASS · ${surfaces.length} routes preserved · every Hybrid capability byte eager · all ordinary operational/proof surfaces continuously mounted · R8 donor loaded and disclosure-reachable · desktop/mobile frame authority preserved · mobile overflow/reflow hardened · event-first R262 observer · no new execution/mutation/promotion/production/Canon authority`);
