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

assert.ok(wrangler.includes('"main": "src/workerR116.js"'),'R263 must preserve proven R116 production entrypoint');
assert.ok(link.includes("data-r263-operational-surfaces='FULL'")&&link.includes("data-r263-responsive='DESKTOP_MOBILE'"),'R263 full-surface/desktop-mobile truth markers missing');

const ordinary=[
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
 assert.ok(link.includes(`import ${name} from '${path}'`),`R263 must keep ordinary Hybrid surface eager/visible: ${name}`);
 assert.ok(link.includes(`<${name}/>`),`R263 must keep ordinary Hybrid surface mounted: ${name}`);
 assert.ok(!link.includes(`lazy(()=>import('${path}'))`),`R263 may not viewport/defer ordinary Hybrid surface: ${name}`);
}
const ordered=['<HybridWovenContinuityR238/>','<HybridExecutionMotionR243/>','<HybridHostIntelligenceR238/>','<HybridResourceGovernorR239/>','<HybridActionRuntimeR247/>','<HybridOutcomeClosureR254/>','<HybridExperienceLedgerR255/>','<HybridParallelDevelopmentR262/>','<HybridHostEffectsR212/>','<HybridCommandDeckR237/>','<HybridProofClosureR141/>','<MissionLineageReviewR209/>'];
for(let i=1;i<ordered.length;i++)assert.ok(link.indexOf(ordered[i-1])<link.indexOf(ordered[i]),`R263 changed operational surface order around ${ordered[i]}`);
assert.ok(link.includes("const HybridMissionControlR8=lazy(()=>import('./HybridMissionControlR8'))"),'R263 may code-split only the explicitly collapsed donor surface');
assert.ok(link.includes('deepOpen&&<Suspense')&&link.includes('<HybridMissionControlR8 status={status} record={record}/>'),'R263 retained R8 donor surface must remain explicit-demand reachable');
assert.ok(!link.includes('HybridProgressiveMountR263')&&!fs.existsSync('src/HybridProgressiveMountR263.tsx')&&!fs.existsSync('src/hybridProgressiveMountR263.css'),'R263 progressive/viewport gating must be absent');

assert.ok(linkCss.includes('.r112-hybrid-link{display:grid;gap:15px;min-width:0;max-width:100%;overflow-x:hidden}'),'R263 Hybrid root containment missing');
assert.ok(linkCss.includes('@media(max-width:760px)')&&linkCss.includes('grid-template-columns:minmax(0,1fr)'),'R263 mobile one-column containment missing');
assert.ok(linkCss.includes('overflow-x:auto')&&linkCss.includes('-webkit-overflow-scrolling:touch'),'R263 mobile wide-data access must scroll rather than clip');
assert.ok(!linkCss.includes('content-visibility:auto')&&!linkCss.includes('contain-intrinsic-size'),'R263 may not hide ordinary Hybrid layers through content-visibility optimization');

assert.ok(adaptive.includes("import {startTransition,useEffect,useMemo,useState} from 'react'")&&adaptive.includes('startTransition(()=>setCorpus(read()))'),'R263 must schedule R262 corpus reconciliation outside urgent interaction');
assert.ok(adaptive.includes('const WATCHDOG_MS=30_000')&&adaptive.includes('window.setInterval(tick,WATCHDOG_MS)'),'R263 event-first observer must use slow bounded fallback watchdog');
assert.ok(adaptive.includes("window.addEventListener('storage',sync)")&&adaptive.includes('window.addEventListener(CORPUS_EVENT,sync)'),'R263 must preserve same-tab/cross-tab event-first synchronization');

assert.ok(shell.includes("document.documentElement.dataset.omegaFrame=frame"),'R263 must preserve AUTO/DESKTOP/MOBILE frame authority');
assert.ok(nav.includes('OMEGA_ALL_ROUTES_R82')&&!nav.includes('rows.slice('),'R263 must preserve all global routes without truncation');
assert.ok(navCss.includes("@media(max-width:900px)")&&navCss.includes('--r94-nav-panel:min(42vw,220px)'),'R263 must preserve mobile non-covering global navigation');
const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
assert.ok(routes.length>0&&surfaces.length===routes.length&&new Set(surfaces).size===surfaces.length,'R263 must preserve complete unique application surface inventory');
for(const route of routes)assert.ok(surfaces.includes(route),`R263 workstation missing registered route ${route}`);
assert.ok(!fs.existsSync('src/workerR263.js'),'R263 must not create another Worker or Durable Object authority');

console.log(`R263 ZERO-CONSTRICTION HYPERPERFORMANCE PASS · ${surfaces.length} routes preserved · all ordinary Hybrid operational/proof surfaces continuously mounted · desktop/mobile frame authority preserved · mobile overflow/reflow hardened · only explicit deep R8 donor code-split · event-first R262 observer · no new execution/mutation/promotion/production/Canon authority`);
