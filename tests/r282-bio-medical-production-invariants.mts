import assert from 'node:assert/strict';
import {initCorpusPack,corpusState} from '../src/corpusRuntime.ts';
import {
 appendBioAuditEventR282,assessBioRiskR282,assessControlledBioUpdateR282,assessMedicalReleaseR282,compileClinicalModeFabricR282,
 compileMedicalMeasurementFrameR282,DEFAULT_BIO_HAZARDS_R282,intendedUseCompleteR282,validatePartitionIsolationR282,verifyBioAuditChainR282,
 type BioAuditEventR282,type BioClinicalReleaseManifestR282,type BioClinicalEmpiricalCaseR282,type BioMeasurementDefinitionR282
} from '../src/bioMedicalProductionR282.ts';
import type {BioInstrumentSampleR281} from '../src/bioInstrumentRuntimeR281.ts';

await initCorpusPack();
const record=corpusState(0);
const now=Date.parse('2026-09-10T20:00:00Z');

const intendedUse={
 id:'HB-VALIDATION-001',purpose:'Quantitative physiological measurement validation',intendedUser:'trained professional',intendedPopulation:'declared validation cohort',useEnvironment:'controlled validation environment',inputs:['validated instrument packet'],outputs:['calibrated quantitative measurement'],decisionRole:'MEASUREMENT_ONLY' as const,locked:true
};
assert.equal(intendedUseCompleteR282(intendedUse),true);

const definition:BioMeasurementDefinitionR282={
 id:'DEF-VOLT-001',variable:'example_voltage',canonicalUnit:'mV',acceptedUnits:{mV:{scale:1,offset:0},V:{scale:1000,offset:0}},analyticalRange:{min:0,max:10},maxRelativeExpandedUncertainty:.25,calibrationTraceabilityRequired:true,referenceMethod:'declared reference method',criticality:'HIGH',intendedUseId:intendedUse.id,version:'1.0.0'
};
const sample:BioInstrumentSampleR281={
 id:'S1',domain:2,layer:5,variable:'example_voltage',rawValue:.004,unit:'V',observedAt:'2026-09-10T19:59:00Z',sourceFormat:'DEVICE_PACKET',source:'fixture',device:{id:'DEV-1',manufacturer:'fixture',model:'M1',serialHash:'abc'},calibration:{calibratedAt:'2026-08-01T00:00:00Z',dueAt:'2027-08-01T00:00:00Z',traceability:'TRACE-1',standard:'STD-1',gain:1,offset:0,gainUncertainty:.001,offsetUncertainty:.00001},uncertainty:{instrument:.00002,calibration:.00001,repeatability:.00001,resolution:.00001,coverageFactor:2},verified:true,maxAgeMs:5*60*1000
};
const measurement=compileMedicalMeasurementFrameR282(record,[sample],[definition],intendedUse,now);
assert.equal(measurement.gate,'PASS');
assert.equal(measurement.counts.eligible,1);
assert.equal(measurement.rows[0].canonicalValue,4);
assert.equal(measurement.rows[0].definition?.canonicalUnit,'mV');
assert.equal(measurement.rows[0].sample.rawValue,.004,'raw observation must remain unchanged');

const wrongUnit={...sample,id:'S2',unit:'foo'};
const wrongUnitFrame=compileMedicalMeasurementFrameR282(record,[wrongUnit],[definition],intendedUse,now);
assert.equal(wrongUnitFrame.gate,'FAIL');
assert.ok(wrongUnitFrame.rows[0].errors.includes('UNIT_NOT_DECLARED_FOR_MEASURAND'));
const undefinedMeasurand={...sample,id:'S3',variable:'undefined_measure'};
const undefinedFrame=compileMedicalMeasurementFrameR282(record,[undefinedMeasurand],[definition],intendedUse,now);
assert.ok(undefinedFrame.rows[0].errors.includes('MEASURAND_DEFINITION_MISSING'));

let chain:BioAuditEventR282[]=[];
chain=await appendBioAuditEventR282(chain,'PROFILE',{id:intendedUse.id},'TEST','2026-09-10T20:00:00Z');
chain=await appendBioAuditEventR282(chain,'MEASUREMENT',{id:sample.id,rawValue:sample.rawValue,unit:sample.unit},'TEST','2026-09-10T20:00:01Z');
const auditOk=await verifyBioAuditChainR282(chain);
assert.equal(auditOk.ok,true);
assert.equal(auditOk.count,2);
const tampered=chain.map(x=>({...x}));tampered[0].eventHash='0'.repeat(64);
const auditBad=await verifyBioAuditChainR282(tampered);
assert.equal(auditBad.ok,false);
assert.ok(auditBad.errors.length>0);

const leakCases:BioClinicalEmpiricalCaseR282[]=[
 {id:'C1',subjectKey:'SUB-1',acquisitionId:'A1',domain:1,layer:1,variable:'x',unit:'u',observed:1,predicted:1,baseline:0,partition:'FIT',verified:true},
 {id:'C2',subjectKey:'SUB-1',acquisitionId:'A2',domain:1,layer:1,variable:'x',unit:'u',observed:1,predicted:1,baseline:0,partition:'HOLDOUT',verified:true}
];
assert.equal(validatePartitionIsolationR282(leakCases).gate,'FAIL');
assert.ok(validatePartitionIsolationR282(leakCases).errors.some(x=>x.startsWith('SUBJECT_LEAK')));

const validationManifest:BioClinicalReleaseManifestR282={
 releaseId:'REL-1',softwareVersion:'R282',intendedUse,regulatoryStage:'CLINICAL_VALIDATION',jurisdiction:'US',softwareDocumentationLevel:'ENHANCED',qmsReleaseRecord:'QMS-1',riskManagementApproved:true,analyticalValidationApproved:true,clinicalValidationApproved:true,humanFactorsApproved:true,cybersecurityApproved:true,interoperabilityApproved:true,postmarketPlanApproved:true,configurationLocked:true,sbomRecorded:true,unresolvedAnomaliesReviewed:true
};
const modeResearch=compileClinicalModeFabricR282(record,[],validationManifest);
assert.equal(modeResearch.total,241);
assert.ok(modeResearch.channels.every((x:any)=>x.measurementAuthority===0));
assert.ok(modeResearch.channels.every((x:any)=>x.clinicalWeight===0),'no regulatory authorization means all clinical weights stay zero');

const authorizedManifest:BioClinicalReleaseManifestR282={...validationManifest,regulatoryStage:'AUTHORIZED_CLINICAL',authorizationId:'AUTH-FIXTURE',authorizationScope:'fixture-only intended use'};
const firstChannel=modeResearch.channels[0];
const modeAuthorized=compileClinicalModeFabricR282(record,[{channelKey:firstChannel.key,intendedUseId:intendedUse.id,state:'CLINICALLY_VALIDATED',metric:'fixture metric',holdoutN:100,prospectiveN:50,modelValue:.9,baselineValue:.8,lowerConfidenceBound:.85,threshold:.8,recordedAt:'2026-09-10T20:00:00Z',evidenceRef:'EVIDENCE-1'}],authorizedManifest);
assert.ok(modeAuthorized.channels.find((x:any)=>x.key===firstChannel.key)?.clinicalWeight>0);
assert.ok(modeAuthorized.channels.filter((x:any)=>x.key!==firstChannel.key).every((x:any)=>x.clinicalWeight===0));

const defaultRisk=assessBioRiskR282(DEFAULT_BIO_HAZARDS_R282);
assert.equal(defaultRisk.gate,'FAIL','open cybersecurity hazard must block clinical release');
const controlledHazards=DEFAULT_BIO_HAZARDS_R282.map(x=>x.id==='HB-008'?{...x,status:'CONTROLLED' as const,residualAcceptable:true,residualProbability:1 as const}:x);
assert.equal(assessBioRiskR282(controlledHazards).gate,'PASS');

const empiricalCases:BioClinicalEmpiricalCaseR282[]=[];
for(let i=1;i<=12;i++){
 const partition=i<=5?'FIT':'HOLDOUT';const observed=i*10;
 empiricalCases.push({id:`E${i}`,subjectKey:`SUB-${i}`,acquisitionId:`ACQ-${i}`,domain:1,layer:1,variable:'x',unit:'u',observed,predicted:observed*.8,baseline:observed*.6,partition,verified:true,weight:1});
}
const update=assessControlledBioUpdateR282({
 cases:empiricalCases,
 change:{id:'CHG-1',intendedUseId:intendedUse.id,description:'bounded calibration update',boundedScope:'linear calibration only',intendedUseUnchanged:true,verificationPlan:'unit and regression verification',validationPlan:'untouched holdout and prospective monitoring',impactAssessment:'no interface/intended use change',rollbackCriteria:'rollback on threshold or domain regression',authorizedPlanId:'PCCP-1'},
 manifest:{...authorizedManifest,pccpId:'PCCP-1',pccpAuthorized:true},
 hazards:controlledHazards
});
assert.equal(update.state,'AUTHORIZED_CHANGE_ELIGIBLE');
assert.equal(update.noDomainRegression,true);
assert.equal(update.isolation.gate,'PASS');

const blockedRelease=assessMedicalReleaseR282({record,samples:[sample],definitions:[definition],manifest:validationManifest,hazards:controlledHazards,empiricalCases});
assert.equal(blockedRelease.releaseState,'CLINICAL_RELEASE_BLOCKED');
assert.equal(blockedRelease.gates.measurement,'PASS');
assert.equal(blockedRelease.gates.regulatoryAuthorization,'HOLD');
const authorizedRelease=assessMedicalReleaseR282({record,samples:[sample],definitions:[definition],manifest:authorizedManifest,hazards:controlledHazards,empiricalCases});
assert.equal(authorizedRelease.releaseState,'AUTHORIZED_CLINICAL_RELEASE_READY');
assert.equal(authorizedRelease.gates.regulatoryAuthorization,'PASS');
assert.equal(authorizedRelease.claims.instrumentProcessing,true);
assert.equal(authorizedRelease.claims.clinicalDecisionSupport,false,'measurement-only intended use cannot silently become CDS');
assert.equal(authorizedRelease.claims.autonomousClinicalAction,false);

console.log('R282 PASS · intended-use measurands + unit/AMR/uncertainty gates + 241-mode authority separation + partition isolation + SHA-256 audit + controlled update + release authority');
