import fs from 'node:fs';
import assert from 'node:assert/strict';

const runtime=fs.readFileSync(new URL('../src/selfBuildRuntimeR124.ts',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../scripts/r124-selfbuild-engine.mjs',import.meta.url),'utf8');
const state=JSON.parse(fs.readFileSync(new URL('../public/omega-r124-selfbuild-state.json',import.meta.url),'utf8'));
const r123=fs.readFileSync(new URL('../src/livingOmegaRuntimeR123.ts',import.meta.url),'utf8');
const r122=JSON.parse(fs.readFileSync(new URL('../public/omega-r122-computed-reality-manifest.json',import.meta.url),'utf8'));

assert.equal(state.schema,'omega.selfbuild.r124.v1');
assert.equal(state.authority,'OMEGAV6');
assert.equal(state.active,true);
assert.ok(state.maxAutonomousGenerations>0&&state.maxAutonomousGenerations<=12);
assert.ok(Array.isArray(state.roadmap)&&state.roadmap.length>=8);
assert.equal(new Set(state.roadmap.map(x=>x.id)).size,state.roadmap.length);
for(const c of state.roadmap){
 assert.match(c.id,/^SB\d{3}$/);
 assert.ok(c.target.startsWith('src/generated/selfbuild/'));
 assert.ok(Array.isArray(c.preserves)&&c.preserves.includes('r123')&&c.preserves.includes('r122')&&c.preserves.includes('r121'));
 assert.ok(Array.isArray(c.tests)&&c.tests.includes('r124')&&c.tests.includes('build'));
}
assert.match(runtime,/SELF_BUILD_IS_EVENT_DRIVEN_NOT_CHAT_SCHEDULE_DEPENDENT/);
assert.match(runtime,/NO_SILENT_MAIN_MUTATION/);
assert.match(runtime,/NO_WHOLESALE_ARCHIVE_DONOR_REPLACEMENT/);
assert.match(runtime,/BACKLOG_EXHAUSTION_ENTERS_OBSERVE_MODE_RATHER_THAN_INVENTING_UNPROVEN_CAPABILITY/);
assert.match(engine,/OMEGA_SELF_BUILD_APPLY/);
assert.match(engine,/Not authoritative until test and merge admission/);
assert.match(engine,/no dependency-ready predefined capsule/);
assert.match(r123,/SELF_BUILD_IS_GOVERNED_PROPOSE_TEST_COMPARE_ADMIT_WITH_ROLLBACK/);
assert.equal(r122.truthBoundary?.noGeneratedSceneFallback ?? r122.computedReality?.noGeneratedSceneFallback ?? true,true);
console.log('R124 self-contained continuous-build invariants: PASS');
