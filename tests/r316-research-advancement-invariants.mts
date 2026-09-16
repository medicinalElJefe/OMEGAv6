import assert from 'node:assert/strict';
import {
 R316_ATLAS_RESOLUTIONS,
 R316_OPTICAL_PROMOTION_SEQUENCE,
 R316_RESEARCH_DELTAS,
 acquisitionReceiptDigestR316,
 applyFabricationTransformR316,
 applyMuellerR316,
 buildResearchAdvancementR316,
 createAcquisitionReceiptR316,
 evaluateFabricationToleranceR316,
 experimentResidualR316,
 opticalCandidateIdentityR316,
 scheduleHardwareR316,
 validateOpticalFieldSampleR316,
 validateSpectralObservationR316,
 type R316AcquisitionReceipt,
 type R316MuellerMatrix,
 type R316OpticalFieldSample,
 type R316SpectralObservation,
} from '../src/system/researchAdvancementR316';

const process={cdBiasNm:2,etchDepthErrorNm:-3,overlayXNm:1,overlayYNm:-1,roughnessRmsNm:.5,sidewallAngleDeg:88};
const fabricated=applyFabricationTransformR316({pitch_nm:500,width_nm:200,length_nm:220,height_nm:600},process);
assert.equal(fabricated.geometry.width_nm,202);
assert.equal(fabricated.geometry.length_nm,222);
assert.equal(fabricated.geometry.height_nm,597);
assert.equal(fabricated.processScar.length,5);

const tolerance=evaluateFabricationToleranceR316({width_nm:200},[
 {...process,cdBiasNm:-2},{...process,cdBiasNm:0},{...process,cdBiasNm:2},
],sample=>Number(sample.geometry.width_nm));
assert.equal(tolerance.count,3);
assert.equal(tolerance.mean,200);
assert.equal(tolerance.min,198);
assert.equal(tolerance.max,202);

const field:R316OpticalFieldSample={x:0,y:0,wavelengthNm:550,intensity:1,phaseRad:Math.PI/2,direction:{thetaRad:.1,phiRad:.2},polarization:{kind:'STOKES',s0:1,s1:.5,s2:.25,s3:.25},time:'2026-09-15T20:00:00.000Z',frameId:'OMEGA_CANONICAL'};
assert.equal(validateOpticalFieldSampleR316(field),true);
assert.equal(validateOpticalFieldSampleR316({...field,polarization:{kind:'STOKES',s0:1,s1:2,s2:0,s3:0}}),false,'non-physical Stokes state must be rejected');
const identityMueller:R316MuellerMatrix=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
assert.deepEqual(applyMuellerR316({kind:'STOKES',s0:1,s1:.5,s2:.25,s3:.25},identityMueller),{kind:'STOKES',s0:1,s1:.5,s2:.25,s3:.25});
assert.throws(()=>applyMuellerR316({kind:'STOKES',s0:1,s1:.5,s2:.25,s3:.25},[[1,0,0,0],[3,0,0,0],[0,0,0,0],[0,0,0,0]]),/non-physical/);

const baseIdentity={geometry:{pitch_nm:500,width_nm:200},relation:{dxNm:0,dyNm:0,dzNm:0,thetaDeg:0,sigma:1 as const,phaseRad:0},material:{name:'Si',n:3.5},boundary:{periodic:true}};
const idA=opticalCandidateIdentityR316(baseIdentity);
const idB=opticalCandidateIdentityR316({...baseIdentity,relation:{...baseIdentity.relation,thetaDeg:2}});
assert.notEqual(idA,idB,'relative orientation must participate in optical candidate identity');
assert.equal(idA,opticalCandidateIdentityR316({...baseIdentity,geometry:{width_nm:200,pitch_nm:500}}),'candidate hash must be key-order stable');

const residual=experimentResidualR316({phase:90,efficiency:.8},{phase:92,efficiency:.75});
assert.equal(residual.residual.phase,2);
assert.ok(Math.abs(residual.residual.efficiency+.05)<1e-12);
assert.ok(residual.l2>2);

const observation:R316SpectralObservation={observationId:'obs-1',sourceId:'esa-flex',instrument:'fixture',eventTime:'2026-09-15T20:00:00.000Z',receiveTime:'2026-09-15T20:00:02.000Z',frameId:'WGS84',atlasResolution:20736,wavelengthsNm:[500,501,502],values:[.1,.2,.3],calibrationId:'cal-1',uncertaintyId:'unc-1',provenanceReceiptId:'receipt-1',derived:false};
assert.equal(validateSpectralObservationR316(observation),true);
assert.equal(validateSpectralObservationR316({...observation,values:[.1,.2]}),false,'spectral coordinate/value cardinality mismatch must reject');
assert.deepEqual(R316_ATLAS_RESOLUTIONS,[12,144,1728,20736,248832]);

const receiptInput:Omit<R316AcquisitionReceipt,'schema'|'receiptId'|'canonicalAdmission'>={uri:'https://example.test/source',requestedAt:'2026-09-15T20:00:00.000Z',requester:'omega-research',purpose:'research intake',authorityId:'lease-1',responseHash:'sha256:abc',policyHash:'sha256:policy',parentReceiptId:null,transformedArtifactHash:null};
const receipt=createAcquisitionReceiptR316(receiptInput);
assert.equal(receipt.canonicalAdmission,false);
assert.equal(receipt.receiptId,acquisitionReceiptDigestR316({...receiptInput,schema:'OMEGA_ACQUISITION_RECEIPT_R316',canonicalAdmission:false}));

const choice=scheduleHardwareR316([
 {nodeId:'offline-fast',online:false,authorityScopes:['solve'],capabilities:['RCWA'],latencyMs:1,energyJPerTask:1,estimatedCost:0,bandwidthGbps:100,risk:0,interconnect:'OPTICAL'},
 {nodeId:'unauthorized',online:true,authorityScopes:['render'],capabilities:['RCWA'],latencyMs:1,energyJPerTask:1,estimatedCost:0,bandwidthGbps:100,risk:0,interconnect:'NVLINK'},
 {nodeId:'local',online:true,authorityScopes:['solve'],capabilities:['RCWA'],latencyMs:8,energyJPerTask:4,estimatedCost:.1,bandwidthGbps:32,risk:.05,interconnect:'PCIE'},
 {nodeId:'cloud',online:true,authorityScopes:['solve'],capabilities:['RCWA'],latencyMs:35,energyJPerTask:2,estimatedCost:.2,bandwidthGbps:100,risk:.1,interconnect:'CLOUD'},
 ],'RCWA','solve',{latency:1,energy:1,cost:1,bandwidth:1,risk:10});
assert.equal(choice?.node.nodeId,'local','scheduler must select only eligible authorized online nodes under declared weights');

assert.deepEqual(R316_OPTICAL_PROMOTION_SEQUENCE,['PROPOSE','FAST_SCREEN','RCWA','FDTD','FABRICATION_TOLERANCE','VALIDATED']);
assert.equal(R316_RESEARCH_DELTAS.length,10);
assert.equal(R316_RESEARCH_DELTAS.filter(delta=>delta.state==='INTEGRATED').length,8);
assert.equal(R316_RESEARCH_DELTAS.filter(delta=>delta.state==='EVIDENCE_GATED').length,1);
assert.equal(R316_RESEARCH_DELTAS.filter(delta=>delta.state==='PROVIDER_GATED').length,1);
const advancement=buildResearchAdvancementR316();
assert.match(advancement.truthBoundary,/does not assert fabrication/i);
assert.match(advancement.truthBoundary,/external-provider/i);
assert.deepEqual(advancement.wovenContinuity,['PARTITION','EXCHANGE_TRANSFORM','INVARIANT_CARRY','SCAR_HISTORY_CARRY','RE_CONTEXTUALIZE_REPARTITION']);

console.log('R316 RESEARCH ADVANCEMENT PASS · fabrication ensemble · Mueller/Jones/Stokes field state · relation identity · experiment residuals · spectral truth · acquisition receipts · hardware scheduler · provider/evidence gates');
