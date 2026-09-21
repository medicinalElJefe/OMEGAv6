import assert from'node:assert/strict';
import fs from'node:fs';

const frontier=fs.readFileSync('src/sarClosureFrontierR346.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const hybrid=fs.readFileSync('src/SarHybridClosureR345.tsx','utf8');
const css=fs.readFileSync('src/sarHybridR345.css','utf8');
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
 "PHYSICALLY_VALID_INTERFEROMETRIC_PHASE:['TOPS_SUBPIXEL_COREGISTRATION','COMPLEX_CROSS_PRODUCT']",
 "FULL_3D_DEFORMATION:['CORRECTED_LOS']",
 "op:'SAR_R344_CLOSURE'",
 "['CALIBRATE','COREGISTER','VALIDATE_PHASE','TERRAIN','UNWRAP','LOS','CORRECT','ADD_GEOMETRY']",
 'authorizationRequired:true',
 'SPEC_RULES',
 "RADIOMETRIC_BACKSCATTER:'at least one of beta0Path / sigma0Path / gamma0Path with annotation provenance'",
 "CORRECTED_LOS:'correctedLosPath + at least one of atmospherePath / etadPath / otherCorrectionPath'",
 'SPEC_FIELDS',
 "PHYSICALLY_VALID_INTERFEROMETRIC_PHASE:['interferogramPath','coherencePath']",
 "UNWRAPPED_PHASE:['demPath','correctedInterferogramPath','geometricPhaseProofPath','unwrapPath','unwrapMaskPath','unwrapProofPath']",
 "FULL_3D_DEFORMATION:['independentLosJsonPath','deformationEastPath','deformationNorthPath','deformationUpPath','deformationProofPath']"
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
 'information gain',
 "item.sarSpecFields.join(', ')",
 'item.sarSpecRule',
 "item.blockedBy.join(', ')"
])assert.ok(live.includes(token),'R346 live workstation integration missing '+token);

assert.ok(pkg.scripts['test:r346']?.includes('tests/r346-sar-closure-frontier-invariants.mjs'),'R346 proof must be registered');
assert.ok(pkg.scripts['check:static']?.includes('npm run test:r346'),'R346 proof must participate in canonical static gate');

console.log('R346 SAR CLOSURE FRONTIER PASS · ranked admissible held-state closure · exact next-action contract · physical authority retained · single-LOS 3-D veto preserved');

for(const token of['recommendedFields?:string[]','recommendedLayer?:string|null','const recommended=new Set(recommendedFields)','r346-frontier-hint','r346-recommended'])assert.ok(hybrid.includes(token),'R346 host guidance integration missing '+token);
assert.ok(live.includes('recommendedFields={closureFrontierR346.next?.sarSpecFields||[]}')&&live.includes('recommendedLayer={closureFrontierR346.next?.layer||null}'),'R346 frontier must feed exact next fields into governed R345 control');
assert.ok(css.includes('.r346-recommended')&&css.includes('R346 NEXT'),'R346 recommended host inputs must be visibly identified');

for(const token of['beta0Path:string','sigma0Path:string','gamma0Path:string','terrainGamma0Path:string','otherCorrectionPath:string','independentLosJsonPath:string','deformationEastPath:string','deformationNorthPath:string','deformationUpPath:string','deformationProofPath:string','beta0Path:form.beta0Path||undefined','independentLosJsonPath:form.independentLosJsonPath||undefined'])assert.ok(hybrid.includes(token),'R346 must expose the complete governed R344 host evidence surface: '+token);

for(const token of['LOS wavelength (m)','recommended.has(\'wavelengthM\')','recommended.has(\'losSign\')','recommended.has(\'signConvention\')',"className={recommended.has(String(key))?'r346-recommended':''}"])assert.ok(hybrid.includes(token),'R346 recommended evidence input is not operator-visible: '+token);
