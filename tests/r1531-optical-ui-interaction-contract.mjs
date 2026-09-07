import assert from 'node:assert/strict';
import {OPTICAL_UI_R152} from '../services/opticalUiR152.js';

const html=OPTICAL_UI_R152;
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'duplicate DOM ids are forbidden');
const idSet=new Set(ids);
const refs=[...html.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]);
for(const ref of new Set(refs))assert.ok(idSet.has(ref),`script references missing id ${ref}`);

const navViews=[...html.matchAll(/data-view="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(navViews,['field','atlas','candidate','queue','proof','system']);
for(const view of navViews)assert.ok(idSet.has(`view-${view}`),`navigation target missing for ${view}`);

for(const id of ['pauseField','resetField','nextPage','railToggle','inspectorToggle','refreshAtlas','wavelength','offset','screenCandidate','prepareTier2','checkSolver','copyQueue','fieldCanvas','atlasGrid','candidateControls','candidateLog','queueLog','machineLog'])assert.ok(idSet.has(id),`required interactive control missing: ${id}`);
for(const token of ["addEventListener('click'","addEventListener('pointerdown'","addEventListener('pointermove'","addEventListener('wheel'","addEventListener('change'","showView('queue')","navigator.clipboard","requestAnimationFrame(draw)","@media(max-width:820px)","@media(max-width:520px)"])assert.ok(html.includes(token),`interaction/runtime token missing: ${token}`);

assert.ok(html.includes("fetch(CANONICAL_ORIGIN+'/api/federation/rcwa/status'"),'solver status must resolve against canonical authority');
assert.ok(html.includes("PREPARED_NOT_SOLVED"),'queue truth must remain explicit');
assert.ok(html.includes('not measured optical intensity'),'visual semantics must remain bounded');
assert.ok(!html.includes('position:fixed;inset:0'),'navigation must not regress to a full-screen covering overlay');

console.log(`R153.1 OPTICAL UI INTERACTION CONTRACT PASS · ${ids.length} unique ids · ${navViews.length} wired workspaces · desktop/mobile controls preserved`);
