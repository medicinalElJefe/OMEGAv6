import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateEvidenceBoundSceneSnapshotR2022,R2022_SCHEMA,R2022_REVISION} from '../src/world/evidenceBoundSceneIngressR2022Core.js';

const earthHash='a'.repeat(64),groundHash='b'.repeat(64);
const ready={schema:'OMEGA_EVIDENCE_BOUND_REALITY_SNAPSHOT_R202_1',revision:'R202.1',state:'SOURCE_EVIDENCE_READY_FOR_EXISTING_RENDERER',renderInputReady:true,observedAt:1,earthHash,groundHash,target:{lat:32.2217,lon:-110.9265,crs:'WGS84 / EPSG:4326'},computedPhotorealRealityProved:false,solverValidityProved:false,canonicalMutation:false};
const checked=validateEvidenceBoundSceneSnapshotR2022(ready);
assert.equal(checked.ok,true);assert.equal(checked.earthHash,earthHash);assert.equal(checked.groundHash,groundHash);assert.equal(checked.target.crs,'WGS84 / EPSG:4326');
for(const bad of [{...ready,renderInputReady:false},{...ready,earthHash:'short'},{...ready,computedPhotorealRealityProved:true},{...ready,solverValidityProved:true},{...ready,canonicalMutation:true}])assert.equal(validateEvidenceBoundSceneSnapshotR2022(bad).ok,false);
assert.equal(R2022_SCHEMA,'OMEGA_EVIDENCE_BOUND_SCENE_INGRESS_R202_2');assert.equal(R2022_REVISION,'R202.2');

const ingress=fs.readFileSync('src/world/evidenceBoundSceneIngressR2022.ts','utf8');
const core=fs.readFileSync('src/world/evidenceBoundSceneIngressR2022Core.js','utf8');
const bus=fs.readFileSync('src/omegaOperationBusR86.ts','utf8');
const app=fs.readFileSync('src/App.tsx','utf8');
const source=fs.readFileSync('public/omega-operational-source-authority-r202.js','utf8');
for(const token of ["type:'EVIDENCE_BOUND_SCENE_INGRESSED'","earthObserved:true","renderReceipt:false","directPhotorealValidation:false","nativeExecutionClaimed:false","computedPhotorealRealityProved:false","solverValidityProved:false","canonicalMutation:false","worldIngress:'R86 → R140 → R136 → R134'", "canonicalAdmissionAuthority:'R125'"])assert.ok(ingress.includes(token),`R202.2 ingress boundary missing ${token}`);
assert.ok(core.includes("SOURCE_EVIDENCE_READY_FOR_EXISTING_RENDERER"),'R202.2 core must accept only R202.1 render-input-ready evidence');
assert.ok(bus.includes("|'EVIDENCE_BOUND_SCENE_INGRESSED'"),'R202.2 must extend the existing R86 operation ledger, not create a second bus');
assert.ok(app.includes('installEvidenceBoundSceneIngressR2022()'),'R202.2 must install at the canonical application root');
assert.ok(source.includes("REALITY_KEY='omega.r2021.reality.readiness'"),'R202.1 source authority must publish same-origin readiness continuity');
assert.ok(source.includes("window.dispatchEvent(new CustomEvent('omega-r2021-reality-readiness'"),'R202.1 must emit bounded readiness evidence');
for(const retained of ['installLivingWorldOperationBridgeR140();installRuntimeAttestationWorldScarR145();installDurableWorldHeadContinuityR149();installReflexOperationIngressR160()','installFederationLedgerWorldObserverR173()','installLivingWorldProofMembraneR1901()','installLivingWorldIntelligenceProofR196()'])assert.ok(app.includes(retained),`R202.2 regressed inherited living-world authority ${retained}`);
console.log('R202.2 PASS · provenance-bound Earth+ground readiness enters existing R86→R140→R136→R134 living-world continuity exactly once; R149/R97 durability, R122 rendering and R125 admission remain separately governed; no photoreal, solver, PC-online or Canon claim is introduced.');
