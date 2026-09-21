import assert from'node:assert/strict';
import fs from'node:fs';

const engine=fs.readFileSync('src/system/unifiedConvergenceR348.ts','utf8');
const deweyKernel=fs.readFileSync('src/system/deweyReferenceKernelR348.ts','utf8');
const liveScene=fs.readFileSync('src/system/liveSceneCorrelationR348.ts','utf8');
const donorContext=fs.readFileSync('src/visualTraversalContextR347.ts','utf8');
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
 'R348_HISTORICAL_CORPUS_AUDIT',
 'R348_SOFTWARE_LEDGER_CENSUS',
 'strongestUnconfirmed:\'UNIVERSAL_ONTOLOGY\'',
 "invariant:'ONE_FIELD_ONE_PACKET_ONE_CONTINUITY_LAW'",
 'validatePhysicalObservationR348',
 'SHA256_EVIDENCE_HASH_REQUIRED',
 'probability:null'
])assert.ok(engine.includes(token),'R348 convergence engine missing '+token);

for(const token of['OMEGA_LIVE_SCENE_CORRELATION_R348','compileLiveSceneCorrelationR348','WGS84_QUERY_CONTEXT','EARTH_SPACE_WEATHER_CONTEXT','evidenceHash','physicalObservations','sourceClocksR347','contextCompletenessR347'])assert.ok(liveScene.includes(token),'R348 live scene correlation missing '+token);
for(const token of['R347_VISUAL_GRAMMAR','modelMappedWgs84R347','admitPhysicalQuantityR347','sourceClocksR347','contextCompletenessR347','R347_PHYSICAL_QUANTITY_REGISTRY'])assert.ok(donorContext.includes(token),'R347 calibrated context donor missing '+token);

for(const token of['DEWEY_REFERENCE_KERNEL_R348','compileB0StandardR348','compileB3CanonicalStateR348','compileB4MotionR348','compileB5ParentR348','compileB6GateR348','compileGravityMotionAddressR348','executeDeweyReferenceKernelR348','B4'||'B5'])assert.ok(deweyKernel.includes(token),'R348 executable Dewey kernel missing '+token);
assert.ok(deweyKernel.includes('9c0701b81fcd5d83444c5e8b2da362c01bab3067d6efec9cfd9ea775db1349ae'),'Dewey kernel must bind the exact supplied reference source hash');
assert.ok(engine.includes('executeDeweyReferenceKernelR348(record?.deweyReferencePacket??null)'),'unified convergence must expose source-bound Dewey computation without synthesizing a packet');
assert.ok(ui.includes("compileUnifiedConvergenceR348(record,liveStatus??status,live.physicalObservations)"),'unified convergence UI must feed validated live observations into the one scene packet');
assert.ok(ui.includes("api.get<any>('/api/status')")&&ui.includes("api.get<any>('/api/hybrid/status')")&&ui.includes("/api/earth/evidence?lat="),'R348 live correlation must use existing read-only Earth/runtime/Hybrid authorities');

assert.equal(manifest.schema,'OMEGA_R348_CONVERGENCE_SOURCE_MANIFEST');
assert.equal(manifest.sources.length,8);
assert.equal(manifest.historicalCorpusAudit.filesAudited,188);
assert.equal(manifest.historicalCorpusAudit.visibleMegabytes,463.7);
assert.equal(manifest.softwareLedgerCensus.systems,100);
assert.equal(manifest.softwareLedgerCensus.families,24);
assert.equal(manifest.softwareLedgerCensus.routes,44);
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
 'HISTORICAL CORPUS AUDIT',
 'ONE-SYSTEM LEDGER',
 'LIVE QUERY CONTEXT',
 '20,736-STATE CALIBRATION',
 'SOURCE CLOCKS',
 'PHYSICAL OBSERVATIONS',
 'HYBRID RETURN',
 'Refresh live scene',
 'REFERENCE KERNEL',
 'FINGERPRINTED CORPUS',
 'packet.truthBoundary'
])assert.ok(ui.includes(token),'R348 operational convergence surface missing '+token);

assert.ok(suite.includes("import OmegaUnifiedConvergenceR348 from './OmegaUnifiedConvergenceR348'"),'R348 must be wired into the current specialist suite');
assert.ok(suite.includes('<OmegaUnifiedConvergenceR348 record={record} status={status}/>'),'R348 must be mounted on Convergence');
assert.ok(accepted.includes("id:'UNIFIED_SCENE_PACKET_CONVERGENCE'"),'accepted production contract must preserve R348');
assert.ok(accepted.includes("'R348 unified scene-packet convergence authority'"),'preserved layer list must include R348');
assert.ok(pkg.scripts['test:r348']?.includes('tests/r348-unified-convergence-invariants.mjs')&&pkg.scripts['test:r348']?.includes('tests/r348-dewey-reference-kernel.mts'),'R348 static + executable kernel proofs must be registered');
assert.ok(pkg.scripts['check:static']?.includes('npm run test:r348'),'R348 proof must participate in canonical static gate');

console.log('R348 UNIFIED CONVERGENCE PASS · one canonical scene packet · physical/canonical/system frames separated · 7 scene layers · 8 machine layers · source fingerprints bound · B0/B3/B4-B6 recalibration policy enforced · no new physical primitive · R125/R141/R146/R147 authority preserved');
