import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,`R228 Living World ${msg}`);
const core=read('src/world/sourceSpatialReconstructionR228.js');
const ui=read('src/SourceSpatialReconstructionR228.tsx');
const intake=read('src/SourceSpatialEvidenceIntakeR227.tsx');

for(const token of ['SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED','HELD_FOR_NUMERIC_SOURCE_SPATIAL_PROOF','R227_CAMERA_HASH_MISMATCH','R227_DEPTH_HASH_MISMATCH','depth.numericSamples','depth.gridCameraResolutionMatch','camera.pose.orientation.unitQuaternion','2048','R122_EXISTING_COMPUTED_REALITY','canonicalAdmissionAuthority:\'R125\''])must(core.includes(token),`core missing ${token}`);
for(const token of ['declaredCalibrationApplied:true','spatialCalibrationProved:false','independentCalibrationValidation:false','sourceDerivedGeometry:true','numerical3DReconstructionExecuted:true','renderedComputedRealityFrame:false','computedPhotorealRealityProved:false','empiricalPixelReconstruction:false','solverValidityProved:false','nativeExecutionClaimed:false','pcOnlineClaimed:false','federationClosureProved:false','canonicalMutation:false','newNativeRenderer:false','newExecutor:false','newPersistenceAuthority:false','newFederationAuthority:false','newCanonAuthority:false'])must(core.includes(token),`truth boundary missing ${token}`);
for(const forbidden of ['fetch(','XMLHttpRequest','WebSocket','navigator.gpu',"method:'POST'",'method:"POST"',"method:'PUT'",'method:"PUT"',"method:'PATCH'",'method:"PATCH"',"method:'DELETE'",'method:"DELETE"'])must(!core.includes(forbidden),`core must remain local/bounded and not contain ${forbidden}`);
must(core.includes('(s.u-cx)/fx*z')&&core.includes('(s.v-cy)/fy*z'),'must use declared pinhole intrinsics for back-projection');
must(core.includes('rotateVector(local,q)'),'must apply the declared camera orientation');
must(core.includes('geometrySha256=await sha256(geometryCore)'),'must bind exact derived geometry cryptographically');
must(core.includes('does not independently prove camera calibration')&&core.includes('does not independently prove camera calibration, infer missing depth, resample an unregistered depth grid'),'boundary must distinguish applying declared calibration from proving it');

must(intake.includes("import SourceSpatialReconstructionR228 from './SourceSpatialReconstructionR228'"),'R227 intake must mount R228 after exact source evidence binding');
must(intake.includes('<SourceSpatialReconstructionR228')&&intake.includes('cameraEvidenceText={cameraText}')&&intake.includes('depthEvidenceText={depthText}'),'R227 must hand the exact operator-entered evidence to R228 for hash re-verification');

for(const token of ['SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED','emitOperationR86','recordProjectOperationR87','exact R227 hashes rechecked','numeric depth only','declared intrinsics + pose applied','R122 frame not claimed','R125 Canon only','Photoreal unproven','not photoreal imagery'])must(ui.includes(token),`UI missing ${token}`);
for(const forbidden of ['fetch(','/api/',"method:'POST'",'method:"POST"',"method:'PUT'",'method:"PUT"',"method:'PATCH'",'method:"PATCH"',"method:'DELETE'",'method:"DELETE"'])must(!ui.includes(forbidden),`UI must not introduce remote execution/mutation path ${forbidden}`);
for(const falseClaim of ['spatialCalibrationProved:true','computedPhotorealRealityProved:true','solverValidityProved:true','nativeExecutionClaimed:true','pcOnlineClaimed:true','federationClosureProved:true','canonicalMutation:true'])must(!ui.includes(falseClaim),`UI must not claim ${falseClaim}`);

console.log('R228 LIVING WORLD SOURCE SPATIAL RECONSTRUCTION PASS · R227 exact-evidence handoff · bounded browser-local geometry · R86/R87 continuity · diagnostic-only projection · R122/R125 and no-overclaim boundaries preserved');
