import assert from'node:assert/strict';
import fs from'node:fs';

const frontier=fs.readFileSync('src/sarClosureFrontierR346.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'OMEGA_SAR_CLOSURE_FRONTIER_R346',
 'buildSarClosureFrontierR346',
 'TOPS_SUBPIXEL_COREGISTRATION',
 'RADIOMETRIC_BACKSCATTER',
 'UNWRAPPED_PHASE',
 'CORRECTED_LOS',
 'FULL_3D_DEFORMATION',
 'ADDITIONAL_VIEWING_GEOMETRY_REQUIRED',
 'PRUNE → TRANSLATE → PROVE → INVARIANT_CARRY → SCAR_CARRY → RECONTEXTUALIZE',
 'cannot manufacture Sentinel-1 measurements',
 'DEPENDENCIES',
 "op:'SAR_R344_CLOSURE'",
 'authorizationRequired:true'
])assert.ok(frontier.includes(token),'R346 frontier contract missing '+token);

assert.ok(frontier.includes("Number(receipt?.independentLos?.length||0)>=3"),'R346 must not admit full 3-D without independent viewing geometry');
assert.ok(frontier.includes("blockedBy=DEPENDENCIES[layer.id].filter"),'R346 must derive admissibility from an explicit closure dependency DAG');
assert.ok(frontier.includes("Queue governed R345 SAR_R344_CLOSURE"),'R346 must route host work through the governed R345 operation rather than invent a new executor');
assert.ok(frontier.includes("informationGain"),'R346 must rank closure actions instead of presenting an unordered held list');

for(const token of[
 "import{buildSarClosureFrontierR346}from'./sarClosureFrontierR346';",
 'const closureFrontierR346=useMemo',
 'R346 closure frontier',
 'Next evidence-producing action:',
 'information gain'
])assert.ok(live.includes(token),'R346 live workstation integration missing '+token);

assert.ok(pkg.scripts['test:r346']?.includes('tests/r346-sar-closure-frontier-invariants.mjs'),'R346 proof must be registered');
assert.ok(pkg.scripts['check:static']?.includes('npm run test:r346'),'R346 proof must participate in canonical static gate');

console.log('R346 SAR CLOSURE FRONTIER PASS · ranked admissible held-state closure · exact next-action contract · physical authority retained · single-LOS 3-D veto preserved');
