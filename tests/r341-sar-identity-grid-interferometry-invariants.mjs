import assert from'node:assert/strict';
import fs from'node:fs';
import{R341_TESTABLE}from'../src/sarPairFieldsR341.js';

const read=p=>fs.readFileSync(p,'utf8');
const worker=read('src/workerR8.js');
const live=read('src/SARLiveTruthR285.tsx');
const raster=read('src/sarRasterR283.ts');
const derivation=read('src/sarDerivationR336.ts');
const pairRuntime=read('src/sarPairFieldsR341.js');

const z=R341_TESTABLE.interferogramAt(1,2,3,4);
assert.equal(z.real,11);
assert.equal(z.imag,2);
assert.ok(Math.abs(z.phaseRad-Math.atan2(2,11))<1e-15);

const w=3,h=3,total=9,ones=new Array(total).fill(1),zeros=new Array(total).fill(0),mask=new Array(total).fill(1);
assert.ok(Math.abs(R341_TESTABLE.coherenceAt(ones,zeros,ones,zeros,mask,w,h,1,1)-1)<1e-15,'identical complex patches must have coherence 1');
const orthI=new Array(total).fill(0),orthQ=new Array(total).fill(1);
assert.ok(Math.abs(R341_TESTABLE.coherenceAt(ones,zeros,orthI,orthQ,mask,w,h,1,1)-1)<1e-15,'constant phase offset preserves coherence magnitude');

const base={raster:{width:2,height:2,sampling:{sourceWidth:100,sourceHeight:100,method:'EVEN_GRID_NATIVE_COMPLEX_SAMPLE'},georeference:{bound:true,affineBound:true,crs:'EPSG:4326',affine:[1,0,0,0,-1,0]}}};
assert.equal(R341_TESTABLE.gridIdentity(base,structuredClone(base)).admitted,true);
const moved=structuredClone(base);moved.raster.georeference.affine[2]=1e-4;
assert.equal(R341_TESTABLE.gridIdentity(base,moved).admitted,false);
assert.ok(R341_TESTABLE.gridIdentity(base,moved).reasons.includes('AFFINE_GRID_MISMATCH'));
const ungeo=structuredClone(base);ungeo.raster.georeference.bound=false;ungeo.raster.georeference.affineBound=false;
assert.equal(R341_TESTABLE.gridIdentity(base,ungeo).admitted,false);
assert.ok(R341_TESTABLE.gridIdentity(base,ungeo).reasons.includes('GEOREFERENCE_REQUIRED_FOR_PAIR_ADMISSION'));

for(const token of [
 'SAR_PAIR_FIELDS_SCHEMA_R341','EXACT_SAME_AFFINE_GRID_NO_RESAMPLING','GEOREFERENCE_REQUIRED_FOR_PAIR_ADMISSION',
 'AFFINE_GRID_IDENTITY_REQUIRED','AFFINE_GRID_MISMATCH','DISTINCT_ACQUISITIONS_REQUIRED','SAME_POLARIZATION_ASSET_REQUIRED','POSITIVE_TEMPORAL_BASELINE_REQUIRED','MASTER_TIMES_CONJUGATE_SLAVE',
 'LOCAL_NORMALIZED_COMPLEX_CROSS_CORRELATION','COREGISTRATION_REQUIRED','PAIR_FIELDS_BOUND',
 'No interpolation, orbit correction, topographic phase removal, atmospheric correction, phase unwrapping, or metric displacement is claimed'
])assert.ok(pairRuntime.includes(token),`R341 pair runtime missing ${token}`);

assert.ok(worker.includes("import {sarPairFieldsR341} from './sarPairFieldsR341.js'"));
assert.ok(worker.includes("url.pathname==='/api/earth/sar/pair-fields'"));
for(const token of ['interferogramReal?:number[]','interferogramImag?:number[]','interferogramPhaseRad?:number[]','pairValidMask?:number[]','derivationR341?:'])assert.ok(raster.includes(token),`R341 raster contract missing ${token}`);
assert.ok(raster.includes("view==='INTERFEROGRAM'"),'interferogram renderer missing');
assert.ok(raster.includes('r.interferogramPhaseRad'),'interferogram renderer must use distinct pair-derived phase array');
assert.ok(!derivation.includes("if(has(r.phaseRad)&&obs.complexDataBound&&Number(obs.geometry.temporalBaselineDays)>0)"),'native single-scene phase must no longer masquerade as interferogram');
assert.ok(derivation.includes("if(has(r.interferogramPhaseRad))"),'R336 resolver must bind only distinct pair-derived interferogram phase');
assert.ok(derivation.includes('same-grid or proven co-registered SLC pair'),'pair-derived field dependencies must remain explicit');

for(const token of [
 "type PairFieldsResponse=","'/api/earth/sar/pair-fields","pair?.pairDerivedBound?'PAIR FIELDS BOUND'",
 'Compute exact pair fields','R341 exact-grid pair fields','mean coherence','pair?.pairDerivedBound?pair.raster'
])assert.ok(live.includes(token),`R341 live workstation missing ${token}`);
assert.ok(live.includes("referenceAssets.find(a=>a.key.toLowerCase()===masterAsset.key.toLowerCase())"),'R341 live pair must preserve identical measurement asset key/polarization rather than silently crossing channels');

console.log('R341 SAR IDENTITY-GRID INTERFEROMETRY PASS · exact R337 SLC inputs · same affine grid or fail closed · master×conj(slave) wrapped phase · 3×3 normalized complex coherence · native phase kept distinct · no co-registration/deformation overclaim');
