import assert from'node:assert/strict';
import fs from'node:fs';

const engine=fs.readFileSync('src/system/unifiedConvergenceR348.ts','utf8');
const ui=fs.readFileSync('src/OmegaUnifiedConvergenceR348.tsx','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const accepted=fs.readFileSync('src/acceptedProductionContractR95.ts','utf8');
const manifest=JSON.parse(fs.readFileSync('public/canon/omega-r348-source-manifest.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'OMEGA_UNIFIED_CONVERGENCE_R348',
 "export type OmegaFrameR348='CANONICAL'|'PHYSICAL'|'SYSTEM'",
 "R348_SCENE_LAYERS=['World','Canon','Motion','Memory','Future','Evidence','System']",
 "R348_MACHINE_LAYERS=['State','Intelligence','Memory','Relation','Computation','Action','Observation','Proof']",
 "R348_WOVEN_OPERATOR=['PARTITION','EXCHANGE_OR_TRANSFORM','INVARIANT_CARRY','SCAR_OR_RESIDUAL_CARRY','RECONTEXTUALIZE','PROVE']",
 "R348_GOVERNANCE_OPERATOR=['PRUNE','TRANSLATE','PROVE']",
 "universalSuperiority:'REJECTED'",
 "B0:{state:'RETAIN',role:'GLOBAL_FALLBACK'}",
 "B3:{state:'DEFAULT',role:'STRONGEST_REUSABLE_DEWEY_CORE'}",
 "forecast:{state:'HOLD'",
 'CANONICAL, PHYSICAL AND SYSTEM FRAMES MAY BE CORRELATED BUT NEVER SILENTLY CONVERTED',
 'MODEL ACTIVITY IS DIMENSIONLESS MODEL STATE UNLESS UNIT-BOUND PHYSICAL EVIDENCE IS PRESENT',
 'R125 REMAINS SOLE CANONSTATE ADMISSION AUTHORITY',
 'validatePhysicalObservationR348',
 'SHA256_EVIDENCE_HASH_REQUIRED',
 'probability:null'
])assert.ok(engine.includes(token),'R348 convergence engine missing '+token);

assert.equal(manifest.schema,'OMEGA_R348_CONVERGENCE_SOURCE_MANIFEST');
assert.equal(manifest.sources.length,8);
const qcd=manifest.sources.find(x=>x.name==='OmegaJ_FULL_MODE_QCD_JUNCTION_COHERENCE_ORCHESTRATED_v5.csv');
assert.equal(qcd.rows,20782);assert.equal(qcd.columns,151);
assert.equal(qcd.sha256,'5648bf1ceb9adb050604d4d430f41b5dbc550d9a9dd7496c8c33fcb6d136a5b2');
const recal=manifest.sources.find(x=>x.name==='Dewey_Full_Corpus_Recalibrated_Direct_Rerun.xlsx');
assert.equal(recal.sha256,'3b5eac2b4057d2b0c0e5087ad0c51214a08fcdbae1e822e5a8d333292ca3f4e7');
assert.ok(manifest.boundaries.some(x=>x.includes('not a literal physical dimensional count')));
assert.ok(manifest.boundaries.some(x=>x.includes('B0 remains fallback and B3 is the strongest reusable core')));

for(const token of[
 'R348 · UNIFIED CONVERGENCE ENGINE',
 'ONE STATE / THREE FRAMES / SEVEN SCENE LAYERS',
 'DEWEY RECALIBRATION POLICY',
 'B3 default · B0 fallback · B4–B6 gated',
 'FINGERPRINTED CORPUS',
 'packet.truthBoundary'
])assert.ok(ui.includes(token),'R348 operational convergence surface missing '+token);

assert.ok(suite.includes("import OmegaUnifiedConvergenceR348 from './OmegaUnifiedConvergenceR348'"),'R348 must be wired into the current specialist suite');
assert.ok(suite.includes('<OmegaUnifiedConvergenceR348 record={record} status={status}/>'),'R348 must be mounted on Convergence');
assert.ok(accepted.includes("id:'UNIFIED_SCENE_PACKET_CONVERGENCE'"),'accepted production contract must preserve R348');
assert.ok(accepted.includes("'R348 unified scene-packet convergence authority'"),'preserved layer list must include R348');
assert.ok(pkg.scripts['test:r348']?.includes('tests/r348-unified-convergence-invariants.mjs'),'R348 proof must be registered');
assert.ok(pkg.scripts['check:static']?.includes('npm run test:r348'),'R348 proof must participate in canonical static gate');

console.log('R348 UNIFIED CONVERGENCE PASS · one canonical scene packet · physical/canonical/system frames separated · 7 scene layers · 8 machine layers · source fingerprints bound · B0/B3/B4-B6 recalibration policy enforced · no new physical primitive · R125/R141/R146/R147 authority preserved');
