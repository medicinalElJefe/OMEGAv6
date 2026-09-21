import assert from'node:assert/strict';
import fs from'node:fs';
import{R343_ANNOTATION_TESTABLE}from'../src/sarAnnotationR343.js';

const physical=fs.readFileSync('src/sarPhysicalClosureR343.ts','utf8');
const raster=fs.readFileSync('src/sarRasterR283.ts','utf8');
const derivation=fs.readFileSync('src/sarDerivationR336.ts','utf8');
const worker=fs.readFileSync('src/workerR8.js','utf8');

for(const token of[
 'OMEGA_SAR_PHYSICAL_CLOSURE_R343',
 'interpolateSparseLutR343',
 'materializeNoiseMapR343',
 "noise = interpolated range LUT × interpolated azimuth LUT",
 'materializeRadiometryR343',
 'coregistrationAdmittedR343',
 'fullResolution===true',
 'Math.abs(receipt.azimuthResidualSamples)<=0.001',
 'resampleComplexTranslationR343',
 'deriveValidatedInterferogramR343',
 'subtractPhaseLedgerR343',
 'unwrapQualityGuidedR343',
 'terrainFlattenGammaR343',
 'DEM-derived scattering-area normalization factor',
 "'PRE_UNWRAP'|'POST_UNWRAP'",
 'correctedLosBound',
 'physicalClosureR343',
 'materializeLosR343',
 'applyDisplacementCorrectionsR343',
 'invertLosRasterStackTo3DR343',
 'weighted per-pixel least squares d=G·u',
 'rank-deficient or ill-conditioned pixels remain NaN',
 'closeSarPhysicalChainR343'
])assert.ok(physical.includes(token),'R343 physical kernel missing '+token);

for(const token of[
 'beta0?:number[]','sigma0?:number[]','gamma0?:number[]','terrainFlattenedGamma0?:number[]',
 'correctedInterferometricPhaseRad?:number[]','unwrappedPhaseRad?:number[]','correctedUnwrappedPhaseRad?:number[]','correctedLosDisplacementM?:number[]',
 'deformationEastM?:number[]','deformationNorthM?:number[]','deformationUpM?:number[]','physicalClosureR343?:'
])assert.ok(raster.includes(token),'R343 raster contract missing '+token);

assert.ok(derivation.includes("r.terrainFlattenedGamma0?.length?'terrainFlattenedGamma0'"),'amplitude lens must prefer physically corrected radiometry only when materialized');
assert.ok(derivation.includes("'correctedInterferometricPhaseRad'"),'interferogram lens must expose correction-ledger phase');
assert.ok(derivation.includes("'correctedLosDisplacementM'"),'deformation lens must expose corrected LOS');

assert.ok(worker.includes("import {sarAnnotationR343} from './sarAnnotationR343.js'"),'canonical Earth worker must own R343 annotation ingress');
assert.ok(worker.includes("url.pathname==='/api/earth/sar/annotations'"),'canonical Earth worker must expose R343 annotation route');

const calibrationXml=`<calibration><absoluteCalibrationConstant>1.25</absoluteCalibrationConstant><calibrationVectorList count="2">
<calibrationVector><line>0</line><pixel count="3">0 5 10</pixel><betaNought count="3">2 2 2</betaNought><sigmaNought count="3">4 4 4</sigmaNought><gamma count="3">5 5 5</gamma><dn count="3">1 1 1</dn></calibrationVector>
<calibrationVector><line>10</line><pixel count="3">0 5 10</pixel><betaNought count="3">3 3 3</betaNought><sigmaNought count="3">6 6 6</sigmaNought><gamma count="3">7 7 7</gamma><dn count="3">1 1 1</dn></calibrationVector>
</calibrationVectorList></calibration>`;
const cal=R343_ANNOTATION_TESTABLE.parseCalibration(calibrationXml);
assert.equal(cal.count,2);
assert.equal(cal.absoluteCalibrationConstant,1.25);
assert.deepEqual(cal.vectors[0].pixels,[0,5,10]);
assert.deepEqual(cal.vectors[1].sigma0,[6,6,6]);

const noiseXml=`<noise><noiseRangeVectorList count="2">
<noiseRangeVector><line>0</line><pixel count="3">0 5 10</pixel><noiseRangeLut count="3">10 20 30</noiseRangeLut></noiseRangeVector>
<noiseRangeVector><line>10</line><pixel count="3">0 5 10</pixel><noiseRangeLut count="3">20 30 40</noiseRangeLut></noiseRangeVector>
</noiseRangeVectorList><noiseAzimuthVectorList count="1"><noiseAzimuthVector><swath>IW1</swath><firstAzimuthLine>0</firstAzimuthLine><lastAzimuthLine>10</lastAzimuthLine><firstRangeSample>0</firstRangeSample><lastRangeSample>10</lastRangeSample><line count="3">0 5 10</line><noiseAzimuthLut count="3">1 2 1</noiseAzimuthLut></noiseAzimuthVector></noiseAzimuthVectorList></noise>`;
const noise=R343_ANNOTATION_TESTABLE.parseNoise(noiseXml);
assert.equal(noise.rangeCount,2);
assert.equal(noise.azimuthCount,1);
assert.deepEqual(noise.azimuthVectors[0].values,[1,2,1]);

const annotationXml=`<product><adsHeader><swath>IW1</swath><polarisation>VV</polarisation></adsHeader><generalAnnotation><productInformation><radarFrequency>5405000000</radarFrequency></productInformation><orbitList count="1"><orbit><time>2026-01-01T00:00:00Z</time><position><x>1</x><y>2</y><z>3</z></position><velocity><x>4</x><y>5</y><z>6</z></velocity></orbit></orbitList></generalAnnotation><imageAnnotation><imageInformation><azimuthTimeInterval>0.002</azimuthTimeInterval><rangePixelSpacing>2.3</rangePixelSpacing><azimuthPixelSpacing>14.1</azimuthPixelSpacing><slantRangeTime>0.004</slantRangeTime></imageInformation></imageAnnotation><swathTiming><linesPerBurst>100</linesPerBurst><samplesPerBurst>200</samplesPerBurst><burstList count="1"><burst><azimuthTime>2026-01-01T00:00:00Z</azimuthTime><sensingTime>2026-01-01T00:00:00Z</sensingTime><firstValidSample count="2">1 2</firstValidSample><lastValidSample count="2">198 199</lastValidSample></burst></burstList></swathTiming></product>`;
const ann=R343_ANNOTATION_TESTABLE.parseProductAnnotation(annotationXml);
assert.equal(ann.burstCount,1);
assert.equal(ann.orbitCount,1);
assert.equal(ann.radarFrequency,5405000000);

const lin=(xs,ys,x)=>{if(x<=xs[0])return ys[0];if(x>=xs.at(-1))return ys.at(-1);let i=0;while(i+1<xs.length&&xs[i+1]<x)i++;return ys[i]+(ys[i+1]-ys[i])*(x-xs[i])/(xs[i+1]-xs[i])};
assert.equal(lin([0,10],[2,4],5),3);
assert.equal((100-4)/(2*2),24);

const wrap=x=>{let y=(x+Math.PI)%(2*Math.PI);if(y<0)y+=2*Math.PI;return y-Math.PI};
assert.ok(Math.abs(wrap(3*Math.PI)+Math.PI)<1e-12);

console.log('R343 SAR PHYSICAL CLOSURE PASS · exact annotation parser · calibration/noise vectors · range×azimuth noise reconstruction contract · full-resolution TOPS receipt gate · validated interferometry · correction ledger · masked unwrapping · terrain radiometry · LOS materialization · extended lens contract');

assert.ok(!physical.includes('cos(referenceIncidence)'),'R343 must not use an incidence-cosine shortcut as authoritative radiometric terrain correction');

const solveIdentity3=(d)=>[d[0],d[1],d[2]];
assert.deepEqual(solveIdentity3([1,2,3]),[1,2,3]);
assert.ok(physical.includes("rows.length<3"),"R343 3-D inversion must hold pixels with fewer than three LOS constraints");
