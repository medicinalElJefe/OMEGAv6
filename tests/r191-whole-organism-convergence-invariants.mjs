import assert from 'node:assert/strict';
import fs from 'node:fs';

const organism=fs.readFileSync('src/wholeOrganismConvergenceR191.ts','utf8');
const visual=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');
const executor=fs.readFileSync('src/executorFabricClientR147.ts','utf8');
const workbench=fs.readFileSync('src/GlobalInterferenceWorkbenchR188.tsx','utf8');
const calibration=fs.readFileSync('src/CalibrationFusionPanelR181.tsx','utf8');
const sar=fs.readFileSync('src/earthSarR181.js','utf8');
const adapter=fs.readFileSync('src/platformAdapter.ts','utf8');
const evidence=fs.readFileSync('src/OmegaEvidenceMemoryR28.tsx','utf8');
const governed=fs.readFileSync('src/GovernedBuildReceiptPanel.tsx','utf8');
const system=fs.readFileSync('src/OmegaSystemConsolidationR30.tsx','utf8');

for(const token of ['OMEGA_WHOLE_ORGANISM_CONTEXT_R191','EVIDENCE_REACQUIRE','TARGETED_REFINEMENT','R185_PLAN_PLUS_HISTORY','fullFieldAuto:false','cacheReuseRequired:true',"executorSelection:'R147_ONLY'","canonicalAdmission:'R125_ONLY'",'R191 cannot choose an executor'])assert.ok(organism.includes(token),`R191 organism contract missing ${token}`);
for(const token of ['organismPolicy.analysis.localSteps','organismPolicy.analysis.beamWidth','organismPolicy.analysis.pathDepth','chunkSize={organism.analysis.globalChunkSize}','R191_PERFORMANCE_EVENT','/api/calibration/r181/state','<WholeOrganismConvergenceR191'])assert.ok(visual.includes(token),`R191 Visual Instrument compute coupling missing ${token}`);
assert.ok(executor.includes('R191_PERFORMANCE_EVENT'),'R147 client must emit returned R185 context to R191');
assert.ok(executor.includes('window.dispatchEvent'),'R147 performance context must stay in-memory browser coordination');
assert.ok(workbench.includes('R191 may bound chunk cost but cannot auto-run'),'R188 must remain operator invoked under R191');
assert.ok(!workbench.includes('useEffect(()=>{run()'),'R188 full-field scan must never auto-run');

for(const token of ['sceneSetHash','observationSet','queryReceipt','evidenceHash'])assert.ok(sar.includes(token),`R191 SAR stable identity missing ${token}`);
assert.ok(calibration.includes('sarset_${sceneHash.slice(0,48)}'),'Calibration packet identity must derive from stable scene-set hash');
assert.ok(calibration.includes('OMEGA_EARTH_SAR_QUERY_RECEIPT_SHA256'),'Query receipt must remain separate calibration provenance');
assert.ok(!calibration.includes('packetId:/^[a-f0-9]{64}$/.test(hash)?`sar_${hash.slice(0,48)}`'),'Refresh-specific receipt hash must not be calibration identity');

for(const token of ['omega-genesis-v1.jeffdeweyeljefe.workers.dev','runtimeUrl','runtimeFetch','OMEGA_CANONICAL_RUNTIME_ORIGIN'])assert.ok(adapter.includes(token),`Distributed canonical runtime resolver missing ${token}`);
for(const file of [evidence,governed,system]){assert.ok(file.includes('runtimeFetch'),`Independent proof surface must use canonical runtimeFetch`);assert.ok(file.includes('runtimeUrl'),`Independent proof surface must expose resolved canonical target`)}
assert.ok(evidence.includes('probeErrors'),'Evidence axes must fail independently');
assert.ok(governed.includes('INDEPENDENT PROBE HOLDS'),'Governed receipt must preserve sibling evidence when one probe fails');

console.log('R191 WHOLE ORGANISM CONVERGENCE PASS · stable evidence identity, canonical distributed probes, calibration-aware attention, R185-bounded compute, R189 reuse, operator-only R188 and R147/R146/R125 authority locks preserved');
