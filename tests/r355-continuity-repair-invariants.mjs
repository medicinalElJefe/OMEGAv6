import assert from'node:assert/strict';
import fs from'node:fs';

const core=fs.readFileSync('src/system/proofBoundTemporalTraversalR355.ts','utf8');
const scene=fs.readFileSync('src/system/proofBoundSceneR354.ts','utf8');
const surface=fs.readFileSync('src/OmegaProofBoundTemporalTraversalR355.tsx','utf8');
const worker=fs.readFileSync('src/system/proofBoundTemporalTraversalWorkerR355.ts','utf8');
const transition=fs.readFileSync('src/system/routeTransitionContinuityR355.ts','utf8');
const instructions=fs.readFileSync('src/OmegaSystemConsolidationR30.tsx','utf8');
const css=fs.readFileSync('src/omegaSystemConsolidationR30.css','utf8');
const r313=fs.readFileSync('tests/r313-full-control-interaction-browser-e2e.mjs','utf8');

for(const token of[
 'ONE_PARENT_FIELD_ONE_R350_TIMELINE_MANY_TICK_RECEIPTS',
 'evolveTemporalTimelineR350',
 'compileProofBoundSceneFromTimelineR354',
 'singleTimelineReused:true'
])assert.ok(core.includes(token),`R355 continuity repair missing ${token}`);

assert.equal((core.match(/evolveTemporalTimelineR350\(/g)||[]).length,1,'R355 must evolve exactly one parent timeline per traversal compile');
assert.ok(scene.includes('R354_SCENE_RECOMPOSITION_MAY_REUSE_ONE_PROVED_R350_TIMELINE_WITHOUT_REEVOLVING_THE_PARENT_FIELD'),'R354 must explicitly permit receipt recomposition from one proved timeline');
assert.ok(scene.includes('export async function compileProofBoundSceneFromTimelineR354'),'R354 reusable scene-from-timeline compiler missing');

for(const token of[
 "new Worker(new URL('./system/proofBoundTemporalTraversalWorkerR355.ts'",
 "data-r355-execution='WORKER_ISOLATED'",
 "data-r355-ready={data?'RETURNED':error?'HOLD':'DEFERRED'}"
])assert.ok(surface.includes(token),`R355 surface missing worker isolation contract ${token}`);
assert.ok(!surface.includes('compileProofBoundTemporalTraversalR355('),'R355 React surface may not execute the full traversal compiler on the UI thread');
assert.ok(worker.includes('compileProofBoundTemporalTraversalR355')&&worker.includes("type:'COMPILE_R355_TRAVERSAL'"),'R355 worker must own traversal compilation');

for(const token of[
 'PARTITION → EXACT-IDENTITY TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/COMMIT',
 'EXACT_ROUTE_IDENTITY_PRECEDES_NAVIGATION',
 'ONE_TARGET_ROUTE_ONE_CAPABILITY_ONE_OPERATION_CONTRACT',
 'UNRESOLVED_OR_DUPLICATE_ROUTE_IS_ESCALATED_NOT_GUESSED',
 'operationContractForRouteR143',
 'normalizeRouteIdentityR242',
 'canonicalMutation:false'
])assert.ok(transition.includes(token),`R355 route-transition calculus missing ${token}`);

for(const token of[
 "compileRouteTransitionR355('Instructions',x.name)",
 'data-r355-transition={transition.schema}',
 'data-route-target={transition.target}',
 'data-route-decision={transition.decision}',
 'aria-label={`Instructions route · ${x.name}`}'
])assert.ok(instructions.includes(token),`Instructions route map missing continuity binding ${token}`);
assert.ok(css.includes(".r30-instruction-list button[data-r355-transition]")&&css.includes('contain:layout paint')&&css.includes('transition:none!important'),'R355 route controls must have stable bounded geometry');

for(const token of[
 'async function waitForSurfaceReady',
 'async function waitForStableControl',
 'await waitForSurfaceReady(page,name)',
 'await waitForStableControl(page,item.id)',
 'control geometry did not reach two-frame continuity'
])assert.ok(r313.includes(token),`R313 continuity proof missing ${token}`);

console.log('R355 CONTINUITY REPAIR PASS · one parent timeline · worker-isolated traversal calculus · exact route/capability/operation transition receipts · stable Instructions geometry · R313 waits for mounted/stable continuity rather than racing data-panel state');

assert.ok(!instructions.includes('aria-label={`Open ${x.name}`}'),'Instructions route controls must not shadow persistent global navigator accessible names');
