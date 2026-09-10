import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const link=read('src/HybridLinkR32.tsx');
const progressive=read('src/HybridProgressiveMountR263.tsx');
const progressiveCss=read('src/hybridProgressiveMountR263.css');
const linkCss=read('src/hybridLinkR112.css');
const adaptive=read('src/HybridParallelDevelopmentR262.tsx');
const wrangler=read('wrangler.jsonc');

assert.ok(wrangler.includes('"main": "src/workerR116.js"'),'R263 must preserve proven R116 production entrypoint');
assert.ok(link.includes("import {lazy,Suspense,useState} from 'react'"),'R263 Hybrid surface must use React code splitting');
assert.ok(link.includes("import HybridProgressiveMountR263 from './HybridProgressiveMountR263'"),'R263 progressive mount boundary must be wired into Hybrid');
for(const path of ['./HybridHostEffectsR212','./HybridCommandDeckR237','./HybridProofClosureR141','./MissionLineageReviewR209','./HybridMissionControlR8']){
 assert.ok(link.includes(`lazy(()=>import('${path}'))`),`R263 must dynamically import ${path}`);
 assert.ok(!link.includes(`import ${path.split('/').pop()} from '${path}'`),`R263 must not retain eager import ${path}`);
}
for(const eager of ["import SovereignConnectionR117 from './SovereignConnectionR117'","import HybridHostIntelligenceR238 from './HybridHostIntelligenceR238'","import HybridResourceGovernorR239 from './HybridResourceGovernorR239'","import HybridActionRuntimeR247 from './HybridActionRuntimeR247'","import HybridOutcomeClosureR254 from './HybridOutcomeClosureR254'","import HybridExperienceLedgerR255 from './HybridExperienceLedgerR255'","import HybridParallelDevelopmentR262 from './HybridParallelDevelopmentR262'"])assert.ok(link.includes(eager),`R263 hot-path capability missing ${eager}`);
assert.ok(link.indexOf('<HybridHostIntelligenceR238/>')<link.indexOf('<HybridResourceGovernorR239/>')&&link.indexOf('<HybridResourceGovernorR239/>')<link.indexOf('<HybridActionRuntimeR247/>'),'R263 must preserve host-proof → resource-governor → action order');
assert.ok(link.includes("label='ADVANCED HYBRID EXECUTION + PROOF'")&&link.includes("label='MISSION LINEAGE REVIEW'"),'R263 long-tail groups must be explicitly bounded');
assert.ok(link.includes('deepOpen&&<Suspense')&&link.includes('<HybridMissionControlR8 status={status} record={record}/>'),'R263 retained R8 donor surface must remain explicit-demand only');

assert.ok(progressive.includes("rootMargin='900px 0px'")&&progressive.includes("threshold:0.01"),'R263 near-viewport demand window missing');
assert.ok(progressive.includes("typeof IntersectionObserver==='undefined'")&&progressive.includes('setReady(true)'),'R263 deterministic compatibility fallback missing');
assert.ok(progressive.includes("authority:'PRESENTATION_AND_MODULE_BYTES_ONLY'")&&progressive.includes('does not poll a backend'),'R263 presentation-only authority boundary missing');
for(const forbidden of ['fetch(','api.post<','api.put<','api.delete<','/api/hybrid/jobs','APPLY_PATCH','WRITE_TEXT','merge_pull_request'])assert.ok(!progressive.includes(forbidden),`R263 progressive boundary acquired forbidden primitive ${forbidden}`);
assert.ok(progressiveCss.includes('contain:layout paint style')&&progressiveCss.includes('contain-intrinsic-size'),'R263 progressive containment missing');
assert.ok(linkCss.includes('@supports(content-visibility:auto)')&&linkCss.includes('content-visibility:auto')&&linkCss.includes('contain-intrinsic-size:auto 520px'),'R263 offscreen rendering containment missing');

assert.ok(adaptive.includes("import {startTransition,useEffect,useMemo,useState} from 'react'")&&adaptive.includes('startTransition(()=>setCorpus(read()))'),'R263 must schedule R262 corpus reconciliation outside urgent interaction');
assert.ok(adaptive.includes('const WATCHDOG_MS=30_000')&&adaptive.includes('window.setInterval(tick,WATCHDOG_MS)'),'R263 event-first observer must use slow bounded fallback watchdog');
assert.ok(adaptive.includes("window.addEventListener('storage',sync)")&&adaptive.includes('window.addEventListener(CORPUS_EVENT,sync)'),'R263 must preserve same-tab/cross-tab event-first synchronization');
assert.ok(!fs.existsSync('src/workerR263.js'),'R263 must not create another Worker or Durable Object authority');

console.log('R263 HYBRID HYPERPERFORMANCE PASS · hot path preserved · long-tail modules route-split · near-viewport progressive mount · content-visibility containment · event-first R262 observer · 30s visible watchdog · no new execution/mutation/promotion/production/Canon authority');
