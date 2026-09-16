import assert from 'node:assert/strict';
import {
 R316_SCHEMA,R316_REVISION,R316_ATLAS_RESOLUTIONS,R316_WOVEN_OPERATOR,R316_AUTHORITY,R316_TRUTH_BOUNDARY,
 assertAtlasResolutionR316,normalizeStokesR316,makeOpticalFieldSampleR316,applyFabricationTransformR316,
 opticalCandidateIdentityR316,routeOpticalSolverR316,evaluateOpticalPromotionR316,
 makeCapabilityLeaseR316,authorizeLeaseActionR316,childLeaseR316,buildProofReceiptR316,transitionMissionR316,
 makeExecutionEnvironmentR316,authorizeObservedInstructionR316,ciTrustRiskR316,buildExperimentEpisodeR316,
 buildScenePacketR316,buildSpectralObservationR316,buildAcquisitionReceiptR316,scoreHardwareTargetR316,compileResearchAdvancementR316
} from '../src/system/researchAdvancementR316.ts';
import {
 R316_EXTENSION_SCHEMA,makeAgentAdapterR316,makeFederationNodeR316,routeFederatedTaskR316,makeSolverSkillR316,
 makeInterventionRecordR316,applyTileTransformR316,defineFormalInvariantR316,compileResearchExtensionsR316
} from '../src/system/researchExtensionsR316.ts';

assert.equal(R316_SCHEMA,'OMEGA_RESEARCH_ADVANCEMENT_R316');
assert.equal(R316_REVISION,'R316');
assert.deepEqual([...R316_ATLAS_RESOLUTIONS],[12,144,1728,20736,248832]);
assert.deepEqual([...R316_WOVEN_OPERATOR],['PARTITION','EXCHANGE_TRANSFORM','INVARIANT_CARRY','SCAR_HISTORY_CARRY','RECONTEXTUALIZE_REPARTITION','PROVE']);
assert.equal(R316_AUTHORITY.canonAdmission,'R125');
assert.equal(R316_AUTHORITY.dispatch,'R147');
assert.equal(R316_AUTHORITY.durableHistory,'R146');
assert.equal(R316_AUTHORITY.hybridReturnProof,'R141');
assert.equal(R316_AUTHORITY.sourcePromotion,'R240');
assert.match(R316_TRUTH_BOUNDARY,/does not fabricate/i);
assert.equal(assertAtlasResolutionR316(20736),20736);
assert.throws(()=>assertAtlasResolutionR316(20735),/representational levels/);

const stokes=normalizeStokesR316([2,2,2,2]);
assert.equal(stokes[0],2);
assert.ok(Math.sqrt(stokes[1]**2+stokes[2]**2+stokes[3]**2)<=1.0000001);
const field=makeOpticalFieldSampleR316({x:0,y:0,wavelengthNm:550,intensity:1,phaseRad:.5,thetaRad:.1,psiRad:.2,polarization:[1,.4,.2,.1],timeS:1,frame:'LAB'});
assert.equal(field.sourceAuthority,'MODEL');
assert.equal(field.wavelengthNm,550);

const ideal={geometryId:'g1',featureNm:120,etchDepthNm:400,offsetXNm:0,offsetYNm:0,rotationDeg:0,layerGapNm:80,material:'SiN',boundary:'periodic'};
const fabricated=applyFabricationTransformR316(ideal,{criticalDimensionNm:-8,etchDepthNm:12,overlayXNm:4,roughnessRmsNm:1.5});
assert.equal(fabricated.fabricated.featureNm,112);
assert.equal(fabricated.fabricated.etchDepthNm,412);
assert.equal(fabricated.fabricated.offsetXNm,4);
assert.equal(fabricated.fabricationProved,false);
assert.notEqual(fabricated.identity,'');

const idA=opticalCandidateIdentityR316({geometry:ideal,relation:{rotationDeg:0},material:{n:2},boundary:{type:'periodic'}});
const idB=opticalCandidateIdentityR316({geometry:ideal,relation:{rotationDeg:15},material:{n:2},boundary:{type:'periodic'}});
assert.notEqual(idA,idB,'relative orientation must change candidate identity');
assert.equal(routeOpticalSolverR316({periodic:true,proofGate:'STAY',mode188Stability:1.2,contradiction:.05}).route,'RCWA');
assert.equal(routeOpticalSolverR316({periodic:true,finiteArray:true,proofGate:'STAY',mode188Stability:1.2,contradiction:.05}).route,'FDTD');
assert.equal(routeOpticalSolverR316({periodic:true,timeVarying:true,proofGate:'STAY',mode188Stability:1.2,contradiction:.05}).route,'FDTD');
assert.equal(routeOpticalSolverR316({periodic:true,proofGate:'TURN',mode188Stability:1.2,contradiction:.05}).route,'HOLD_MISSING_EVIDENCE');
assert.equal(routeOpticalSolverR316({periodic:true,proofGate:'STAY',mode188Stability:1.0,contradiction:.05}).route,'HOLD_MISSING_EVIDENCE');

const promoted=evaluateOpticalPromotionR316({fast:{efficiency:.90,phaseRad:1},rcwa:{efficiency:.88,phaseRad:1.04,converged:true,energyResidual:.01},fabricationRobustness:.92});
assert.equal(promoted.state,'PROMOTE_MODEL');
assert.equal(promoted.physicalValidation,false);
assert.equal(promoted.measurementRequired,true);
assert.equal(evaluateOpticalPromotionR316({fast:{efficiency:.90,phaseRad:1},rcwa:{efficiency:.70,phaseRad:1.8,converged:true,energyResidual:.01},fabricationRobustness:.92}).state,'HOLD');

const lease=makeCapabilityLeaseR316({leaseId:'lease-1',agentId:'local-agent',scope:['READ','RCWA'],issuedAt:'2026-09-15T00:00:00Z',expiresAt:'2026-09-16T00:00:00Z',nonce:'n1',signer:'OMEGA_CONTROL',revocationEpoch:2});
assert.equal(lease.heartbeatExtendsAuthority,false);
assert.equal(authorizeLeaseActionR316(lease,{action:'RCWA',now:'2026-09-15T12:00:00Z',currentRevocationEpoch:2,signatureValid:true}).authorized,true);
assert.equal(authorizeLeaseActionR316(lease,{action:'FDTD',now:'2026-09-15T12:00:00Z',currentRevocationEpoch:2,signatureValid:true}).authorized,false);
assert.equal(authorizeLeaseActionR316(lease,{action:'RCWA',now:'2026-09-17T00:00:00Z',currentRevocationEpoch:2,signatureValid:true}).authorized,false);
assert.equal(childLeaseR316(lease,{leaseId:'child',agentId:'sub',scope:['READ'],issuedAt:'2026-09-15T01:00:00Z',expiresAt:'2026-09-15T10:00:00Z',nonce:'n2',signer:'OMEGA_CONTROL',revocationEpoch:2}).parentLease,lease.leaseHash);
assert.throws(()=>childLeaseR316(lease,{leaseId:'bad-child',agentId:'sub',scope:['FDTD'],issuedAt:'2026-09-15T01:00:00Z',expiresAt:'2026-09-15T10:00:00Z',nonce:'n3',signer:'OMEGA_CONTROL',revocationEpoch:2}),/exceeds parent/);

const proof=buildProofReceiptR316({agentId:'local-agent',sessionId:'s1',taskId:'t1',capability:'RCWA',inputHash:'in',outputHash:'out',policyHash:'policy',beforeStateHash:'b',afterStateHash:'a',timestamp:'2026-09-15T12:00:00Z',environment:'LOCAL_PC',observer:'OMEGA_CONTROL',status:'VERIFIED'});
assert.equal(proof.canonAdmission,false);
assert.equal(proof.dimensions.measurement,false);
assert.match(proof.receiptHash,/^r316-/);
assert.deepEqual(transitionMissionR316('QUEUED','CLAIMED'),{from:'QUEUED',to:'CLAIMED',appendOnly:true});
assert.throws(()=>transitionMissionR316('QUEUED','COMMITTED'),/illegal mission transition/);
const environment=makeExecutionEnvironmentR316({environmentId:'env1',nodeId:'pc1',capabilities:['RCWA'],authorityScope:['READ'],workspaceRef:'workspace://1',sessionId:'s1',stateHash:'state'});
assert.equal(environment.canonicalStateOwner,false);
assert.equal(authorizeObservedInstructionR316({userIntent:true,capabilityGrant:true,policyCheck:true,provenanceCheck:true,instructionSource:'PIXELS'}).authorized,false);
assert.equal(authorizeObservedInstructionR316({userIntent:true,capabilityGrant:true,policyCheck:true,provenanceCheck:true,instructionSource:'USER'}).authorized,true);
assert.equal(ciTrustRiskR316({untrustedInput:true,privilegedExecution:true,secretReachability:true}).block,true);
assert.equal(ciTrustRiskR316({untrustedInput:true,privilegedExecution:false,secretReachability:true}).block,false);

const episode=buildExperimentEpisodeR316({hypothesis:'phase error decreases with corrected geometry',parameters:{featureNm:120},prediction:{phase:1,efficiency:.9},measurement:{phase:1.1,efficiency:.87},uncertainty:{phase:.02}});
assert.equal(episode.empirical,true);
assert.ok(Math.abs((episode.residual.phase??0)-.1)<1e-12);
assert.ok(Math.abs((episode.residual.efficiency??0)+.03)<1e-12);
const scene=buildScenePacketR316({packetId:'scene-1',observationHash:'obs-hash',coordinateFrame:'WGS84',timestamp:'2026-09-15T12:00:00Z',confidence:.9,sourceReceipts:['receipt-1'],derivedProducts:['render-1']});
assert.equal(scene.canonicalObservationImmutable,true);
assert.equal(scene.renderIsCanonical,false);
assert.match(scene.packetHash,/^r316-/);
const spectral=buildSpectralObservationR316({packetId:'obs-1',atlasResolution:1728,address:'12/4/3',capturedAt:'2026-09-15T00:00:00Z',instrument:'TEST-SPECTROMETER',sourceUri:'urn:omega:test',calibrationId:'cal-1',uncertainty:.02,bands:[{wavelengthNm:680,value:.44,unit:'radiance'}],frame:'WGS84'});
assert.equal(spectral.derived,false);
assert.deepEqual(spectral.renderProducts,[]);
assert.match(spectral.provenanceHash,/^r316-/);
const receipt=buildAcquisitionReceiptR316({uri:'https://example.invalid/source',requestedAt:'2026-09-15T00:00:00Z',requester:'OMEGA_RESEARCH',purpose:'RESEARCH_INTAKE',responseHash:'sha256:test',policy:'PUBLIC_SOURCE'});
assert.equal(receipt.authority,'PROVENANCE_ONLY');
assert.equal(receipt.canonAdmission,false);
assert.match(receipt.receiptHash,/^r316-/);

const unavailable=scoreHardwareTargetR316({id:'cloud',latencyMs:1,energyJ:1,cost:1,bandwidthGbps:100,risk:.1,available:false,capabilities:['RCWA']},['RCWA']);
assert.equal(unavailable.eligible,false);
const eligible=scoreHardwareTargetR316({id:'local',latencyMs:5,energyJ:2,cost:0,bandwidthGbps:40,risk:.05,available:true,capabilities:['RCWA','FDTD']},['RCWA']);
assert.equal(eligible.eligible,true);
assert.ok(Number.isFinite(eligible.score));

assert.equal(R316_EXTENSION_SCHEMA,'OMEGA_RESEARCH_EXTENSIONS_R316');
const adapter=makeAgentAdapterR316({adapterId:'adapter-1',agentIdentity:'agent-A',provider:'provider-A',protocol:'MCP',capabilities:['RESEARCH','RCWA'],permissionCeiling:['READ'],executionEnvironment:'LOCAL_PC',receiptSupport:true});
assert.equal(adapter.providerOwnsCanon,false);
assert.equal(adapter.providerOwnsDispatch,false);
assert.match(adapter.adapterHash,/^r316-/);
const pc=makeFederationNodeR316({nodeId:'pc',kind:'PC',capabilities:['RCWA'],latencyMs:5,queueDepth:1,authorityScope:['READ'],heartbeatAt:'2026-09-15T12:00:00Z',proofState:'VERIFIED',available:true});
const cloud=makeFederationNodeR316({nodeId:'cloud',kind:'CLOUD',capabilities:['RCWA'],latencyMs:30,queueDepth:0,authorityScope:['READ'],heartbeatAt:'2026-09-15T12:00:00Z',proofState:'VERIFIED',available:true});
assert.equal(routeFederatedTaskR316([cloud,pc],{requiredCapabilities:['RCWA'],requiredAuthority:['READ']}).selected?.nodeId,'pc');
assert.equal(pc.logicalFederationNotHardwareFusion,true);
const skill=makeSolverSkillR316({skillId:'skill-1',geometryFamily:'periodic-post',wavelengthDomainNm:[450,900],parameterSchema:['pitch','height'],solverBackend:'grcwa',solverVersion:'0.1.2',meshPolicy:'harmonic-sweep',convergencePolicy:'energy+phase',knownFailureModes:['high-coupling'],validationDistribution:'held-out geometry families',evidenceReceipts:['receipt-1'],revision:1});
assert.equal(skill.modelMemoryIsNotEvidence,true);
assert.match(skill.skillHash,/^r316-/);
const intervention=makeInterventionRecordR316({failureId:'failure-1',hypothesis:'cache key collision',intervention:'salt key with revision',preStateHash:'a',postStateHash:'b',metricBefore:.2,metricAfter:.9,repeatCount:5,successfulRepeats:5});
assert.equal(intervention.diagnosisPromoted,true);
assert.equal(intervention.causalCandidate,true);
const tile=applyTileTransformR316({tileId:'tile-1',localXNm:100,localYNm:0,rotationDeg:90,globalOriginXNm:1000,globalOriginYNm:2000,overlayErrorXNm:5});
assert.ok(Math.abs(tile.globalXNm-1005)<1e-9);
assert.ok(Math.abs(tile.globalYNm-2100)<1e-9);
assert.equal(tile.fabricationMeasurementClaimed,false);
const invariant=defineFormalInvariantR316({id:'inv-1',subject:'Hybrid receipt',condition:'returned hash equals expected task hash',failureDisposition:'HOLD',authorityOwner:'R141'});
assert.equal(invariant.descriptiveOnlyUntilExecutableProof,true);
const extensions=compileResearchExtensionsR316();
assert.equal(Object.values(extensions.capabilities).filter(Boolean).length,6);
assert.match(extensions.truthBoundary,/do not claim/i);

const compiled=compileResearchAdvancementR316({atlasResolution:20736,orientation:1,hardwareTargets:[{id:'local',latencyMs:5,energyJ:2,cost:0,bandwidthGbps:40,risk:.05,available:true,capabilities:['RCWA']}],requiredCapabilities:['RCWA']});
assert.equal(compiled.schema,R316_SCHEMA);
assert.equal(compiled.physicalDimensionsClaimed,false);
assert.equal(compiled.orientation,1);
assert.equal(compiled.hardware[0].eligible,true);
assert.equal(Object.values(compiled.capabilities).filter(Boolean).length,17);
assert.equal(compiled.authority.dispatch,'R147');
assert.equal(compiled.authority.canonAdmission,'R125');

console.log('R316 research advancement invariants PASS · agent authority leases, provider-neutral adapters, logical federation, typed receipts, mission state, execution skins, visual trust boundary, CI trust graph, solver skills, intervention repair, fabrication/tile transforms, polarization/field state, rigorous solver gates, experiment residuals, immutable scenes/spectra, provenance and hardware topology · no empirical or Canon overclaim');