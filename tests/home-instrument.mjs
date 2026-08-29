import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const home=read('src/OmegaHome.tsx'),css=read('src/omegaHomeLive.css');
assert.match(home,/initCorpusPack/);assert.match(home,/corpusState/);assert.match(home,/unifiedFromRecord/);assert.match(home,/normalizedMotionRelativity/);assert.match(home,/\/api\/route-preview/);assert.match(home,/\/api\/chat/);assert.match(home,/Matter Traversal/);assert.match(home,/Relativity/);assert.match(home,/Earth Now/);assert.match(home,/Forecast/);assert.match(home,/SAI Lab/);assert.match(home,/Visual Instrument/);assert.match(home,/Evidence & Proof/);assert.match(home,/Build Out/);assert.match(home,/System Atlas/);assert.match(home,/Control Matrix/);assert.match(home,/20,736 FIELD/);assert.match(home,/179 MODES/);assert.match(css,/--oh-c/);assert.match(css,/--oh-p/);assert.match(css,/--oh-q/);assert.match(css,/--oh-l/);assert.match(css,/--oh-m/);assert.match(css,/--oh-water/);assert.match(css,/oh-state-angle/);assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/@media\(max-width:430px\)/);
console.log('home instrument PASS');
