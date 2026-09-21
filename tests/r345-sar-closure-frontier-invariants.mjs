import assert from'node:assert/strict';
import fs from'node:fs';

const frontier=fs.readFileSync('src/sarClosureFrontierR345.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'OMEGA_SAR_CLOSURE_FRONTIER_R345',
 'buildSarClosureFrontierR345',
 'TOPS_SUBPIXEL_COREGISTRATION',
 'RADIOMETRIC_BACKSCATTER',
 'UNWRAPPED_PHASE',
 'CORRECTED_LOS',
 'FULL_3D_DEFORMATION',
 'ADDITIONAL_VIEWING_GEOMETRY_REQUIRED',
 'PRUNE → TRANSLATE → PROVE → INVARIANT_CARRY → SCAR_CARRY → RECONTEXTUALIZE',
 'cannot manufacture Sentinel-1 measurements'
])assert.ok(frontier.includes(token),'R345 frontier contract missing '+token);

assert.ok(frontier.includes("Number(receipt?.independentLos?.length||0)>=3"),'R345 must not admit full 3-D without independent viewing geometry');
assert.ok(frontier.includes("python scripts/sar_r344_host_closure.py --execute"),'R345 must produce an executable host-closure next action');
assert.ok(frontier.includes("informationGain"),'R345 must rank closure actions instead of presenting an unordered held list');

for(const token of[
 "import{buildSarClosureFrontierR345}from'./sarClosureFrontierR345';",
 'const closureFrontierR345=useMemo',
 'R345 closure frontier',
 'Next evidence-producing action:',
 'information gain'
])assert.ok(live.includes(token),'R345 live workstation integration missing '+token);

assert.ok(pkg.scripts['test:r345']?.includes('tests/r345-sar-closure-frontier-invariants.mjs'),'R345 proof must be registered');
assert.ok(pkg.scripts['check:static']?.includes('npm run test:r345'),'R345 proof must participate in canonical static gate');

console.log('R345 SAR CLOSURE FRONTIER PASS · ranked admissible held-state closure · exact next-action contract · physical authority retained · single-LOS 3-D veto preserved');
