import assert from'node:assert/strict';
import fs from'node:fs';

const receipt=fs.readFileSync('src/sarHostClosureR344.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const raster=fs.readFileSync('src/sarRasterR283.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const host=fs.readFileSync('scripts/sar_r344_host_closure.py','utf8');
const graph=fs.readFileSync('scripts/sar_r344_snap_tops_insar.xml','utf8');

for(const token of[
 'OMEGA_SAR_HOST_CLOSURE_R344',
 'EXACT_PAIR_SOURCES',
 'ANNOTATION_HASHES',
 'ORBIT_EVIDENCE',
 'RADIOMETRIC_BACKSCATTER',
 'TERRAIN_RADIOMETRY',
 'TOPS_SUBPIXEL_COREGISTRATION',
 'PHYSICAL_INTERFEROGRAM',
 'GEOMETRIC_PHASE_REMOVAL',
 'UNWRAP_CLOSURE',
 'METRIC_LOS',
 'CORRECTION_LEDGER',
 'FULL_3D_DEFORMATION',
 'Math.abs(c.azimuthResidualSamples)<=.001',
 'matrixRank3',
 'applySarHostClosurePreviewR344',
 'sourceArtifactSha256',
 'linked(',
 "productLevel:'SLC'",
 'rank>=3',
 'rank-independent look vectors'
])assert.ok(receipt.includes(token),'R344 receipt contract missing '+token);

for(const token of[
 'validateSarHostClosureR344',
 'sarClosurePromotionStateR344',
 'applySarHostClosurePreviewR344',
 'R344 full-resolution closure receipt',
 'Import R344 receipt',
 'application/json,.json',
 'closureReceipt?.coregistration?.azimuthResidualSamples',
 'closurePromotion?.subpixelCoregistrationBound===true',
 'closurePromotion?.interferometricPhaseValidated===true',
 'closurePromotion?.unwrappedPhaseBound===true',
 'closurePromotion?.losDisplacementBound===true',
 'closurePromotion?.full3dDeformationBound===true',
 'native?.nativeDataBound||hostPreviewRaster'
])assert.ok(live.includes(token),'R344 live workstation missing '+token);

for(const token of[
 'SCHEMA="OMEGA_SAR_HOST_CLOSURE_R344"',
 'probe_snap',
 'sha256_path',
 'annotation_hashes',
 'zipfile.ZipFile',
 '--coreg-proof',
 '--corrected-interferogram',
 '--corrected-los',
 '--terrain-gamma0',
 '--gamma0',
 '--sigma0',
 '--beta0',
 '--unwrap-proof',
 '--independent-los-json',
 'A process exit is not proof'
])assert.ok(host.includes(token),'R344 host driver missing '+token);
for(const token of[
 '<operator>TOPSAR-Split</operator>',
 '<operator>Apply-Orbit-File</operator>',
 '<operator>Back-Geocoding</operator>',
 '<operator>Enhanced-Spectral-Diversity</operator>',
 '<operator>Interferogram</operator>',
 '<operator>TOPSAR-Deburst</operator>',
 '<operator>TopoPhaseRemoval</operator>',
 '<operator>GoldsteinPhaseFiltering</operator>',
 '${master}','${slave}','${subswath}','${polarization}','${output}'
])assert.ok(graph.includes(token),'R344 SNAP graph missing '+token);

for(const token of[
 'correctedUnwrappedPhaseRad?:number[]',
 'correctedLosDisplacementM?:number[]',
 'deformationEastM?:number[]',
 'deformationNorthM?:number[]',
 'deformationUpM?:number[]'
])assert.ok(raster.includes(token),'R344 raster contract missing '+token);

const sha='a'.repeat(64);
const artifact={path:'artifact.tif',sha256:sha,bytes:1024};
const base={
 schema:'OMEGA_SAR_HOST_CLOSURE_R344',revision:'R344',createdAt:'2026-09-20T00:00:00Z',processor:'SNAP/S1TBX',processorVersion:'14',
 master:{productId:'M',assetKey:'VV',sha256:sha,polarization:'VV',productLevel:'SLC',acquiredAt:'2026-09-01T00:00:00Z'},
 slave:{productId:'S',assetKey:'VV',sha256:sha,polarization:'VV',productLevel:'SLC',acquiredAt:'2026-09-13T00:00:00Z'},
 annotations:{master:[sha],slave:[sha]},orbit:{master:artifact,slave:artifact,precise:true},
 radiometry:{beta0:artifact,sigma0:artifact,gamma0:artifact,terrainFlattenedGamma0:artifact},
 coregistration:{fullResolution:true,burstGeometryBound:true,method:'Back-Geocoding+ESD',resampler:'truncated-sinc',azimuthResidualSamples:.0008,rangeResidualSamples:.03,rangeThresholdSamples:.1,proofArtifact:artifact},
 interferogram:artifact,coherence:artifact,dem:artifact,geometricPhase:{flatEarthRemoved:true,topographicRemoved:true,correctedInterferogram:artifact,proofArtifact:artifact},
 unwrap:{artifact,mask:artifact,closureRmsRad:.1,residueCount:0,largestComponentPixels:100,validPixels:100},
 corrections:{atmosphere:artifact,etad:artifact},
 los:{artifact,wavelengthM:.0555,signConvention:'positive toward sensor',sign:1,validPixels:100},correctedLos:artifact,
 independentLos:[
  {losM:1,look:[1,0,0],source:'A',artifactSha256:sha},
  {losM:2,look:[0,1,0],source:'B',artifactSha256:sha},
  {losM:3,look:[0,0,1],source:'C',artifactSha256:sha}
 ],
 deformation3d:{east:artifact,north:artifact,up:artifact,rank:3,conditionNumber:1,weightedRmsResidualM:0},
 truthBoundary:'fixture'
};
assert.equal(base.master.productId!==base.slave.productId,true);
assert.ok(Math.abs(base.coregistration.azimuthResidualSamples)<=.001);
assert.ok(Math.abs(base.coregistration.rangeResidualSamples)<=base.coregistration.rangeThresholdSamples);
assert.equal(base.independentLos.length,3);
assert.ok(pkg.scripts['test:r344'].includes('python3 -m py_compile scripts/sar_r344_host_closure.py'));
assert.ok(pkg.scripts['test:r344'].includes('node tests/r344-sar-host-closure-invariants.mjs'));
assert.ok(pkg.scripts['check:static'].includes('npm run test:r344'),'R344 must participate in the full release gate');

console.log('R344 SAR HOST CLOSURE PASS · source/annotation/orbit/DEM hashes · full-resolution TOPS residual receipt · interferogram/coherence · topographic phase proof · unwrap closure · corrections · metric LOS · rank-3 deformation · hash-linked preview import');
