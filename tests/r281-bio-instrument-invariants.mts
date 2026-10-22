import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initCorpusPack,corpusState} from '../src/corpusRuntime.ts';
import {
  BIO_CONTEXT_LAYERS_R281,BIO_DOMAINS_R281,BIO_SCALE_LEVELS_R281,
  calibrateBioInstrumentSampleR281,compileBioInstrumentFrameR281,parseBioInstrumentTextR281
} from '../src/bioInstrumentRuntimeR281.ts';
import {compileBioAllModesFabricR281} from '../src/bioAllModesFabricR281.ts';

await initCorpusPack();
const record=corpusState(11498);
const now=Date.parse('2026-09-10T12:00:00Z');

assert.equal(BIO_DOMAINS_R281.length,12);
assert.deepEqual([...BIO_DOMAINS_R281],[
  'Nervous_System','Cardiovascular','Respiratory','Digestive','Endocrine','Immune_Inflammatory',
  'Musculoskeletal','Renal_Fluid','Sleep_Circadian','Cognitive_Attention','Emotional_Social','Environmental_Load'
]);
assert.equal(BIO_CONTEXT_LAYERS_R281.length,12);
assert.deepEqual([...BIO_CONTEXT_LAYERS_R281],[
  'Cell','Tissue','Organ','System','Body','Behavior','Attention','Emotion','Relationship','Work_Environment','City_Planet','Future_Pattern'
]);
assert.deepEqual([...BIO_SCALE_LEVELS_R281],['ORGANISM','ORGAN','TISSUE','CELL','ORGANELLE','MOLECULE','ATOM']);

const empty=compileBioInstrumentFrameR281(record,[],now);
assert.equal(empty.readiness,'NO_INSTRUMENT_DATA');
assert.equal(empty.clinicalAuthority,'VALIDATION_REQUIRED');
assert.equal(empty.patientIdentityRequired,false);
assert.equal(empty.measurement.supplied,0);
assert.equal(empty.allModes.count,62);
assert.ok(empty.allModes.overlays.every(x=>x.measurementAuthority===0),'no canon mode may have measurement authority');
assert.equal(empty.atlas.materializedAddressSpace,20736);
assert.equal(empty.atlas.projectedAddressSpace,61917364224);
assert.match(empty.truthBoundary,/not a declaration of medical-device clearance/i);

const completeModes=compileBioAllModesFabricR281(record);
assert.equal(completeModes.total,241,'all-modes fabric must include 179 source + 62 canon channels');
assert.equal(completeModes.sourceCatalogCount,179);
assert.equal(completeModes.canonAuthorityCount,62);
assert.equal(completeModes.channels.filter(x=>x.family==='SOURCE_CATALOG').length,179);
assert.equal(completeModes.channels.filter(x=>x.family==='CANON_AUTHORITY').length,62);
assert.ok(completeModes.channels.every(x=>x.measurementAuthority===0),'all 241 analytical channels must have zero measurement authority');
assert.ok(completeModes.channels.some(x=>x.family==='SOURCE_CATALOG'&&x.realization==='SOURCE_CATALOG_AFFINITY'));
assert.ok(completeModes.channels.some(x=>x.family==='CANON_AUTHORITY'&&(x.realization==='GATED'||x.realization==='CHARTED')),'unproven/gated canon channels must remain visible');
assert.match(completeModes.truthBoundary,/241 total/i);
assert.match(completeModes.truthBoundary,/not exact execution/i);

const sample={
  id:'BP-1',domain:2,layer:5,variable:'systolic_pressure',rawValue:121,unit:'mmHg',observedAt:'2026-09-10T11:59:00Z',sourceFormat:'DEVICE_PACKET' as const,source:'bench fixture',
  device:{id:'DEVICE-TEST',manufacturer:'fixture',model:'R281'},
  calibration:{calibratedAt:'2026-08-10T00:00:00Z',dueAt:'2027-08-10T00:00:00Z',traceability:'TRACE-001',standard:'DECLARED_REFERENCE_STANDARD',gain:1.01,offset:-.5,gainUncertainty:.001,offsetUncertainty:.02},
  uncertainty:{instrument:.4,calibration:.1,repeatability:.2,resolution:.1,coverageFactor:2},
  limits:{min:40,max:260},verified:true,maxAgeMs:10*60*1000
};
const calibrated=calibrateBioInstrumentSampleR281(sample,now);
assert.equal(calibrated.quality,'INSTRUMENT_READY');
assert.equal(calibrated.calibrationState,'CURRENT');
assert.equal(calibrated.rawValue,121,'raw observation must be immutable');
assert.ok(Math.abs(calibrated.correctedValue-(1.01*121-.5))<1e-12);
const expectedU=Math.sqrt((1.01*.4)**2+.1**2+.2**2+(.1/Math.sqrt(12))**2+(121*.001)**2+.02**2);
assert.ok(Math.abs(calibrated.standardUncertainty-expectedU)<1e-12,'quadrature uncertainty propagation regressed');
assert.ok(Math.abs(calibrated.expandedUncertainty-2*expectedU)<1e-12);

const frame=compileBioInstrumentFrameR281(record,[sample],now);
assert.equal(frame.readiness,'INSTRUMENT_FRAME_READY');
assert.equal(frame.measurement.instrumentReady,1);
assert.equal(frame.measurement.samples[0].rawValue,121);
assert.notEqual(frame.model.metrics.continuity,121,'model channel must remain separate from observed value');
assert.equal(frame.atlas.domains[1].instrumentReady,1);
assert.equal(frame.atlas.layers[4].instrumentReady,1);
assert.ok(frame.allModes.overlays.some(x=>x.realization==='CHARTED'||x.realization==='GATED'),'unproven/gated modes remain visible rather than silently promoted');
assert.ok(frame.allModes.overlays.every(x=>x.measurementAuthority===0));

const expired=calibrateBioInstrumentSampleR281({...sample,id:'expired',calibration:{...sample.calibration,dueAt:'2026-01-01T00:00:00Z'}},now);
assert.equal(expired.calibrationState,'EXPIRED');
assert.equal(expired.quality,'REJECTED');
assert.ok(expired.errors.includes('CALIBRATION_EXPIRED'));

const invalid=calibrateBioInstrumentSampleR281({...sample,id:'invalid',unit:'',verified:false},now);
assert.equal(invalid.quality,'REJECTED');
assert.ok(invalid.errors.includes('MISSING_UNIT'));
assert.ok(invalid.errors.includes('UNVERIFIED_SOURCE'));

const jsonRows=parseBioInstrumentTextR281(JSON.stringify([sample]),'fixture.json');
assert.equal(jsonRows.length,1);
assert.equal(jsonRows[0].rawValue,121);
assert.equal(jsonRows[0].device.id,'DEVICE-TEST');

const csv=`id,domain,layer,variable,rawValue,unit,observedAt,source,deviceId,calibratedAt,dueAt,traceability,calibrationStandard,gain,offset,instrumentUncertainty,calibrationUncertainty,repeatabilityUncertainty,resolution,coverageFactor,verified\nCSV-1,3,4,oxygen_signal,98.2,percent,2026-09-10T11:59:00Z,fixture,DEV-CSV,2026-08-01T00:00:00Z,2027-08-01T00:00:00Z,TRACE-CSV,REF,1,0,.1,.05,.1,.1,2,true`;
const csvRows=parseBioInstrumentTextR281(csv,'fixture.csv');
assert.equal(csvRows.length,1);
assert.equal(csvRows[0].domain,3);
assert.equal(csvRows[0].layer,4);
assert.equal(csvRows[0].verified,true);
assert.equal(csvRows[0].unit,'percent');

const bio=fs.readFileSync('src/BiologicalTraversalR46.tsx','utf8');
const surface=fs.readFileSync('src/BioInstrumentSurfaceR281.tsx','utf8');
const allModeSurface=fs.readFileSync('src/BioAllModesFabricR281.tsx','utf8');
for(const token of ['ORGANISM','ORGAN','TISSUE','CELL','ORGANELLE','MOLECULE','ATOM','Representational biological-scale traversal only','241 analytical channels'])assert.ok(bio.includes(token)||allModeSurface.includes(token),`R281 biological contract missing ${token}`);
for(const token of ['INSTRUMENT READY','ALL 62 MODES','LOCAL INSTRUMENT PACKET INGEST','MEASUREMENT / MODEL SEPARATION','measurement authority'])assert.ok(surface.includes(token),`R281 visual instrument contract missing ${token}`);
for(const token of ['241 analytical channels','179 source catalog + 62 canon/calculus authorities','measurement authority','AFFINITY ≠ EXECUTION'])assert.ok(allModeSurface.includes(token),`R281 complete mode fabric missing ${token}`);
assert.ok(surface.includes('BIO_CONTEXT_LAYERS_R281')&&surface.includes('BIO_DOMAINS_R281'),'full domain/layer rendering missing');
assert.ok(!surface.toLowerCase().includes('medical grade'),'surface may not self-label as medical grade before validation');
assert.ok(!allModeSurface.toLowerCase().includes('medical grade'),'all-mode surface may not self-label as medical grade before validation');

console.log('R281 PASS · calibrated measurement frame + uncertainty propagation + 12×12 Heavy Bio visualization + all 241 zero-authority analytical channels (179 source + 62 canon)');
