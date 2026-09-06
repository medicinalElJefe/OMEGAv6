import fs from 'node:fs';
import assert from 'node:assert/strict';

const runtime=fs.readFileSync(new URL('../src/livingOmegaRuntimeR123.ts',import.meta.url),'utf8');
const manifest=JSON.parse(fs.readFileSync(new URL('../public/r123-living-runtime.json',import.meta.url),'utf8'));
const surface=fs.readFileSync(new URL('../public/r123-living-omega.html',import.meta.url),'utf8');
const r122=JSON.parse(fs.readFileSync(new URL('../public/omega-r122-computed-reality-manifest.json',import.meta.url),'utf8'));

assert.match(runtime,/ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS/);
assert.match(runtime,/NO_GENERATED_SCENE_FALLBACK_FOR_COMPUTED_REALITY/);
assert.match(runtime,/SELF_BUILD_IS_GOVERNED_PROPOSE_TEST_COMPARE_ADMIT_WITH_ROLLBACK/);
assert.match(runtime,/missionPlan/);
assert.match(runtime,/renderBudget/);
assert.match(runtime,/progressiveDisclosure/);
assert.match(runtime,/admitBuildCandidate/);

assert.equal(manifest.worldModel.addressTopology,'12x12x12x12 = 20,736 canonical addresses');
assert.equal(manifest.computedReality.noGeneratedSceneFallback,true);
assert.equal(manifest.computedReality.everyVisiblePrimitiveRequiresSourceTrace,true);
assert.equal(manifest.selfBuild.silentSelfModification,false);
assert.equal(manifest.selfBuild.neverFlattenStrongCurrentLayers,true);
assert.deepEqual(manifest.missionRoute,['PROPOSE','SCREEN','EXECUTE','VERIFY','RENDER','ADMIT']);
assert.deepEqual(manifest.experience.progressiveDisclosure,[12,144,1728,20736]);

assert.match(surface,/one canonical world · many lawful projections/);
assert.match(surface,/DEVICE PROOF REQUIRED/);
assert.match(surface,/generated substitute|noGeneratedSceneFallback/i);
assert.match(surface,/PROPOSE/);
assert.match(surface,/ADMIT/);
assert.match(surface,/PERFORMANCE RELATIVITY/);
assert.match(surface,/TRUTH BOUNDARY/);

assert.ok(Array.isArray(r122.computedRealityPipeline));
assert.equal(r122.computedRealityPipeline.length,21);
console.log('R123 living total-experience invariants: PASS');
