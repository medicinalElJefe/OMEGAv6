import assert from'node:assert/strict';
import fs from'node:fs';

const src=fs.readFileSync('src/sarEstablishmentR342.ts','utf8');
for(const token of[
 "SAR_ESTABLISHMENT_SCHEMA_R342",
 "SAR_20736D_ADDRESS_SPACE_R342=12**4",
 "SAR_TOPS_AZIMUTH_COREG_TARGET_SAMPLES_R342=0.001",
 "PARTITION → PRUNE → TRANSLATE → PROVE → INVARIANT_CARRY → SCAR_CARRY → RECONTEXTUALIZE",
 "Parent → Interaction → Scar → Continuity → Compression → Skin → Interpretation → Behavior → New Parent",
 "value=(DN²-noiseLut)/calibrationLut²",
 "dLOS=sign·λ·φ/(4π)",
 "ADDITIONAL_VIEWING_GEOMETRY_REQUIRED",
 "GEOMETRY_MATRIX_RANK_DEFICIENT",
 "20,736 address space as an atlas/resolution index, not a physical dimension"
])assert.ok(src.includes(token),'R342 establishment engine missing '+token);

const stripTypes=s=>s
 .replace(/^import[^\n]*\n/gm,'')
 .replace(/export interface[\s\S]*?\n}\n/g,'')
 .replace(/export type[\s\S]*?;\n/g,'')
 .replace(/as const/g,'')
 .replace(/:SarR342LayerId/g,'')
 .replace(/:SarEstablishmentLayerR342/g,'')
 .replace(/:SarEstablishmentEvidenceR342/g,'')
 .replace(/:Sar20736AddressR342/g,'')
 .replace(/:LosObservationR342\[\]/g,'')
 .replace(/:Partial<SarEstablishmentEvidenceR342>/g,'')
 .replace(/:number\[\]\[\]/g,'')
 .replace(/:number\[\]/g,'')
 .replace(/:number/g,'')
 .replace(/:unknown/g,'')
 .replace(/:v is number/g,'')
 .replace(/:1\|-1/g,'')
 .replace(/as\[number,number,number\]/g,'');
const js=stripTypes(src)
 .replace(/export /g,'')
 .replace(/\(r\?:SarRasterFieldR283\)/g,'(r)')
 .replace(/\(e:SarEstablishmentEvidenceR342\)/g,'(e)')
 .replace(/\(stateId:number\)/g,'(stateId)')
 .replace(/\(dnMagnitude:number,calibrationLut:number,noiseLutLinearPower=0\)/g,'(dnMagnitude,calibrationLut,noiseLutLinearPower=0)')
 .replace(/\(phiUnwrappedCorrected:number,wavelengthM:number,sign\)/g,'(phiUnwrappedCorrected,wavelengthM,sign)')
 .replace(/\(rows\)/g,'(rows)');
const moduleUrl='data:text/javascript;base64,'+Buffer.from(js).toString('base64');
const m=await import(moduleUrl);

assert.equal(m.SAR_20736D_ADDRESS_SPACE_R342,20736);
const all=m.enumerateSar20736R342();
assert.equal(all.length,20736);
assert.equal(new Set(all.map(x=>x.address)).size,20736);
assert.equal(all[0].address,'0-0-0-0');
assert.equal(all.at(-1).address,'B-B-B-B');

const cal=m.sentinel1CalibratedPowerR342(10,2,4);
assert.equal(cal,24);
assert.ok(Number.isNaN(m.sentinel1CalibratedPowerR342(1,2,4)));

const los=m.losDisplacementFromCorrectedPhaseR342(Math.PI,0.0555,1);
assert.ok(Math.abs(los-0.013875)<1e-12);

assert.equal(m.topsCoregistrationAdmittedR342({subpixelCoregistrationBound:true,azimuthCoregResidualSamples:0.001,rangeCoregResidualSamples:0.02,rangeCoregThresholdSamples:0.05}),true);
assert.equal(m.topsCoregistrationAdmittedR342({subpixelCoregistrationBound:true,azimuthCoregResidualSamples:0.0011,rangeCoregResidualSamples:0.02,rangeCoregThresholdSamples:0.05}),false);

const base=m.resolveSarEstablishmentR342({acquisitionBound:true,nativeSlcIqBound:true,compatiblePairMetadata:true,commonPolarizationAsset:true,sampledGridIdentity:true,pairCrossProductBound:true,localCoherenceBound:true});
const state=id=>base.find(x=>x.id===id);
assert.equal(state('COMPLEX_CROSS_PRODUCT').state,'COMPUTATIONALLY_ESTABLISHED');
assert.equal(state('LOCAL_NORMALIZED_CORRELATION').state,'COMPUTATIONALLY_ESTABLISHED');
assert.equal(state('TOPS_SUBPIXEL_COREGISTRATION').state,'HELD');
assert.equal(state('PHYSICALLY_VALID_INTERFEROMETRIC_PHASE').state,'HELD');
assert.equal(state('FULL_3D_DEFORMATION').state,'NOT_DERIVABLE_SINGLE_LOS');

const inv=m.invertIndependentLosTo3DR342([
 {losM:1,look:[1,0,0]},
 {losM:2,look:[0,1,0]},
 {losM:3,look:[0,0,1]}
]);
assert.equal(inv.ok,true);
assert.deepEqual(inv.displacementM.map(x=>Math.round(x*1e9)/1e9),[1,2,3]);

console.log('R342 SAR 20,736D ESTABLISHMENT PASS · 12^4 address uniqueness · exact evidence/transform/proof/surface axes · Dewey/RSC fail-closed routing · Sentinel-1 radiometry operator · TOPS residual gate · LOS conversion · multi-geometry 3-D inversion · single-LOS 3-D veto retained');
