import assert from 'node:assert/strict';
import {bindSourceSpatialEvidenceBundleR227} from '../src/world/sourceSpatialEvidenceBundleR227.js';
import {manifestR228,reconstructSourceSpatialGeometryR228} from '../src/world/sourceSpatialReconstructionR228.js';

const h=c=>String(c).repeat(64).slice(0,64);
const request={state:'SPATIAL_RECONSTRUCTION_EVIDENCE_REQUEST_READY',requestSha256:h('a'),r224ReceiptSha256:h('b'),r222GeometrySha256:h('c'),r219MeshSha256:h('d'),r218FieldSha256:h('e'),missionId:'mission-r228',projectId:'project-r228',profile:'BALANCED',lineage:{head:h('f')}};
const camera={sourceIdentity:'camera-r228',capturedOrAuthoritativeTime:'2026-09-08T17:00:00Z',imageWidthPx:640,imageHeightPx:480,intrinsics:{fx:100,fy:100,cx:0,cy:0},pose:{referenceFrame:'WGS84-ENU:R218',position:{x:1,y:2,z:3},orientation:{x:0,y:0,z:0,w:1}},provenance:'measured calibration record',uncertainty:{positionM:.1,angleDeg:.2},acquisitionMethod:'SENSOR_CAPTURE'};
const depth={sourceIdentity:'depth-r228',capturedOrAuthoritativeTime:'2026-09-08T17:00:01Z',referenceFrame:'WGS84-ENU:R218',samplesOrDepthMap:[{u:100,v:200,depth:2},{u:0,v:0,depth:1},{u:50,v:50,depth:1.5},{u:25,v:75,depth:1.25}],units:'m',provenance:'measured depth record',uncertainty:{depthM:.03},acquisitionMethod:'MEASURED',syntheticFill:false};

const bundle=await bindSourceSpatialEvidenceBundleR227({request,camera,depth});
assert.equal(bundle.state,'SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND');
const a=await reconstructSourceSpatialGeometryR228({bundle,camera,depth,maxPoints:2048});
assert.equal(a.state,'SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED');
assert.equal(a.sourceDerivedGeometry,true);
assert.equal(a.declaredCalibrationApplied,true);
assert.equal(a.spatialCalibrationProved,false);
assert.equal(a.independentCalibrationValidation,false);
assert.equal(a.numerical3DReconstructionExecuted,true);
assert.equal(a.renderedComputedRealityFrame,false);
assert.equal(a.computedPhotorealRealityProved,false);
assert.equal(a.solverValidityProved,false);
assert.equal(a.nativeExecutionClaimed,false);
assert.equal(a.pcOnlineClaimed,false);
assert.equal(a.federationClosureProved,false);
assert.equal(a.canonicalMutation,false);
assert.equal(a.requestedAuthority,'R122_EXISTING_COMPUTED_REALITY');
assert.equal(a.canonicalAdmissionAuthority,'R125');
assert.equal(a.referenceFrame,'WGS84-ENU:R218');
assert.equal(a.sourceSampleCount,4);
assert.equal(a.reconstructedPointCount,4);
assert.match(a.geometrySha256,/^[a-f0-9]{64}$/);
assert.match(a.receiptSha256,/^[a-f0-9]{64}$/);
assert.deepEqual({x:a.points[0].x,y:a.points[0].y,z:a.points[0].z},{x:3,y:6,z:5},'identity quaternion + declared translation must produce exact expected source-frame point');
const b=await reconstructSourceSpatialGeometryR228({bundle,camera,depth,maxPoints:2048});
assert.equal(b.geometrySha256,a.geometrySha256,'same bound evidence must produce deterministic geometry hash');
assert.equal(b.receiptSha256,a.receiptSha256,'same bound evidence must produce deterministic receipt hash');

const tamperedCamera=structuredClone(camera);tamperedCamera.intrinsics.fx=101;
const tampered=await reconstructSourceSpatialGeometryR228({bundle,camera:tamperedCamera,depth});
assert.equal(tampered.state,'HELD_FOR_NUMERIC_SOURCE_SPATIAL_PROOF');
assert.ok(tampered.missing.includes('R227_CAMERA_HASH_MISMATCH'),'changed camera parameters must fail exact R227 hash rebind');

const hashOnlyDepth={...depth,samplesOrDepthMap:{sha256:h('1'),sampleCount:2048}};
const hashOnlyBundle=await bindSourceSpatialEvidenceBundleR227({request,camera,depth:hashOnlyDepth});
assert.equal(hashOnlyBundle.state,'SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND','R227 may bind a source depth descriptor without claiming reconstruction');
const hashOnly=await reconstructSourceSpatialGeometryR228({bundle:hashOnlyBundle,camera,depth:hashOnlyDepth});
assert.equal(hashOnly.state,'HELD_FOR_NUMERIC_SOURCE_SPATIAL_PROOF');
assert.ok(hashOnly.missing.includes('depth.numericSamples'),'R228 must not reconstruct from a hash-only depth descriptor');

const badQCamera=structuredClone(camera);badQCamera.pose.orientation={x:0,y:0,z:0,w:2};
const badQBundle=await bindSourceSpatialEvidenceBundleR227({request,camera:badQCamera,depth});
assert.equal(badQBundle.state,'SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND','R227 only proves declared source evidence presence');
const badQ=await reconstructSourceSpatialGeometryR228({bundle:badQBundle,camera:badQCamera,depth});
assert.equal(badQ.state,'HELD_FOR_NUMERIC_SOURCE_SPATIAL_PROOF');
assert.ok(badQ.missing.includes('camera.pose.orientation.unitQuaternion'),'R228 must fail closed on an inadmissible declared quaternion');

const mismatchedGridDepth={...depth,samplesOrDepthMap:{width:320,height:240,values:Array(320*240).fill(1)}};
const mismatchedGridBundle=await bindSourceSpatialEvidenceBundleR227({request,camera,depth:mismatchedGridDepth});
assert.equal(mismatchedGridBundle.state,'SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND');
const mismatchedGrid=await reconstructSourceSpatialGeometryR228({bundle:mismatchedGridBundle,camera,depth:mismatchedGridDepth});
assert.equal(mismatchedGrid.state,'HELD_FOR_NUMERIC_SOURCE_SPATIAL_PROOF');
assert.ok(mismatchedGrid.missing.includes('depth.gridCameraResolutionMatch'),'R228 must not silently resample or reinterpret an unregistered depth-grid resolution');

const denseDepth={...depth,samplesOrDepthMap:Array.from({length:3000},(_,i)=>({u:i%600,v:Math.floor(i/600),depth:1+(i%7)/10}))};
const denseBundle=await bindSourceSpatialEvidenceBundleR227({request,camera,depth:denseDepth});
const bounded=await reconstructSourceSpatialGeometryR228({bundle:denseBundle,camera,depth:denseDepth,maxPoints:256});
assert.equal(bounded.state,'SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED');
assert.equal(bounded.sourceSampleCount,3000);
assert.equal(bounded.reconstructedPointCount,256);
assert.equal(bounded.downsampled,true);

const manifest=manifestR228();
assert.equal(manifest.revision,'R228');
assert.equal(manifest.authority['canonicalAdmission'],'R125');
assert.match(manifest.truthBoundary,/does not independently prove camera calibration/i);
assert.match(manifest.truthBoundary,/does not independently prove camera calibration[\s\S]*resample an unregistered depth grid/i);
console.log(`R228 SOURCE SPATIAL RECONSTRUCTION PASS · ${a.reconstructedPointCount} exact-bound points · geometry ${a.geometrySha256.slice(0,12)} · hash/tamper/quaternion/grid mismatch fail closed · bounded dense path ${bounded.reconstructedPointCount}/${bounded.sourceSampleCount}`);
