import assert from 'node:assert/strict';
import fs from 'node:fs';

const visual=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');
const cache=fs.readFileSync('src/analysisCacheR189.ts','utf8');
const workbench=fs.readFileSync('src/GlobalInterferenceWorkbenchR188.tsx','utf8');
const globalAtlas=fs.readFileSync('src/globalInterferenceAtlasR188.ts','utf8');
const temporal=fs.readFileSync('src/execution/temporalRelativityPerformanceR185.js','utf8');
const ingress=fs.readFileSync('src/world/verifiedReturnWorldIngressR186.ts','utf8');
const apiTransport=fs.readFileSync('src/canonicalApiTransportR183.ts','utf8');

assert.ok(visual.includes("import {createAnalysisCacheR189} from './analysisCacheR189'"),'R190 must import the one shared analysis cache authority');
assert.ok(visual.includes("import GlobalInterferenceWorkbenchR188 from './GlobalInterferenceWorkbenchR188'"),'R188 workbench must be live in the Visual Instrument');
assert.equal((visual.match(/createAnalysisCacheR189\(field\)/g)||[]).length,1,'Visual Instrument must instantiate exactly one R189 cache per loaded field');
for(const token of [
 'resolveInterferenceR184(field,address,12,.004,analysisCache)',
 'reconstructMultipathR185(field,address,12,8,analysisCache)',
 'compileDifferentialRelativityR186(field,address,analysisCache)',
 'compileChainedFormulaCalibrationR187(field,address,analysisCache)',
 '<GlobalInterferenceWorkbenchR188 field={field} cache={analysisCache} onSelectAddress={onCommit}/>'
])assert.ok(visual.includes(token),`R190 shared analysis integration missing: ${token}`);

for(const token of ['stateCache=new Map','neighborCache=new Map','stateHits','stateMisses','cachedStates','cachedNeighborhoods','memoization authority only'])assert.ok(cache.includes(token),`R189 cache invariant missing: ${token}`);
assert.ok(cache.includes("import {INTERFERENCE_CALIBRATION_R184} from './interferenceResolutionR184'"),'R189 must use the exact R184 residual calibration');
assert.ok(cache.includes('cannot change any score, route, evidence, CanonState, or execution authority'),'R189 must remain a memoization-only authority');

assert.ok(workbench.includes("const run=async()=>"),'R188 full-field scan must be explicit operator work, not render-time work');
assert.ok(workbench.includes('AbortController'),'R188 scan must be cancellable');
assert.ok(workbench.includes("Compile full field"),'R188 operator control missing');
assert.ok(workbench.includes('does not replace or override the promoted R185 execution scheduler'),'R188 must remain subordinate to R185 execution performance authority');
assert.ok(!workbench.includes("useEffect(()=>{run()"),'R188 must never auto-run the 20,736 scan');
assert.ok(!workbench.includes('temporalRelativityPerformanceR185'),'Browser analysis must not import the durable execution scheduler directly');
for(const token of ['setTimeout(resolve,0)','field.count','cache=sharedCache||createAnalysisCacheR189(field)','quantiles','hotspots','basins','clusters'])assert.ok(globalAtlas.includes(token),`R188 bounded global analysis invariant missing: ${token}`);

for(const token of ['PREDICT_CARRY_CORRECT_REALLOCATE','workingSetResolution','targetTemporalHz','R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY','R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(temporal.includes(token),`Promoted R185 performance authority missing: ${token}`);
for(const token of ['PROOF_REFRESHED','verified','R146','canonicalMutation:false'])assert.ok(ingress.includes(token),`Promoted R186 verified-return world ingress missing: ${token}`);
for(const token of ['OMEGA_CANONICAL_ORIGIN','/api/'])assert.ok(apiTransport.includes(token),`Promoted canonical API routing missing: ${token}`);

for(const retained of ['PC-LINEAGE DEPTH CAMERA','OmegaMotionSkinMapR35','OrientationFrameR182View','VisualAtlasR183','InterferenceResolutionR184','MultipathReconstructionR185','DifferentialRelativityR186','ChainedFormulaCalibrationR187','Admitted next','Previous','Yaw','Pitch'])assert.ok(visual.includes(retained),`R190 degraded inherited Visual Instrument capability: ${retained}`);

console.log('R188-R190 GLOBAL ANALYSIS CONVERGENCE PASS · one shared R189 cache powers local/deep/differential/chained/global analysis while promoted R185 execution performance, R186 verified-return ingress, canonical API authority and inherited visual controls remain preserved');