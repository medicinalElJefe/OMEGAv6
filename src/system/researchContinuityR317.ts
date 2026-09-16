export const R317_RESEARCH_CONTINUITY_SCHEMA='OMEGA_RESEARCH_CONTINUITY_R317' as const;
export const R317_RESEARCH_CONTINUITY_REVISION='R317' as const;

const finite=(value:number)=>Number.isFinite(value);
const canonical=(value:unknown):string=>{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;
 const record=value as Record<string,unknown>;
 return`{${Object.keys(record).sort().map(key=>`${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
};
const fnv=(value:unknown)=>{
 const source=canonical(value);let hash=0x811c9dc5;
 for(let i=0;i<source.length;i++){hash^=source.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0}
 return hash.toString(16).padStart(8,'0');
};

export type R317AgentTransport='ACP'|'MCP'|'NATIVE_API'|'LOCAL_PROCESS';
export type R317ExecutionEnvironmentType='LOCAL_PC'|'CLOUD_SANDBOX'|'MOBILE_OBSERVER';
export type R317ExecutionEnvironment={
 environmentId:string;type:R317ExecutionEnvironmentType;nodeId:string;capabilities:string[];
 authorityScopes:string[];workspaceRef:string|null;credentialRefs:string[];sessionId:string|null;
 stateHash:string;heartbeatAt:string|null;receiptChain:string[];
};
export type R317OmegaAgentAdapter={
 adapterId:string;provider:string;transports:R317AgentTransport[];capabilities:string[];
 authorityScopes:string[];executionEnvironmentIds:string[];canonicalAdmission:false;
};
export function canDispatchAgentR317(adapter:R317OmegaAgentAdapter,environment:R317ExecutionEnvironment,requiredCapability:string,requiredScope:string){
 const heartbeatFresh=environment.heartbeatAt===null||Number.isFinite(Date.parse(environment.heartbeatAt));
 return Boolean(
  adapter.capabilities.includes(requiredCapability)&&adapter.authorityScopes.includes(requiredScope)&&
  adapter.executionEnvironmentIds.includes(environment.environmentId)&&environment.capabilities.includes(requiredCapability)&&
  environment.authorityScopes.includes(requiredScope)&&heartbeatFresh
 );
}
export function childAuthorityIsBoundedR317(parentScopes:string[],childScopes:string[]){return childScopes.every(scope=>parentScopes.includes(scope))}

export type R317MissionState='QUEUED'|'CLAIMED'|'STARTED'|'HEARTBEATING'|'RETURNED'|'VERIFIED'|'COMMITTED'|'REQUEUED'|'FAILED';
const MISSION_TRANSITIONS:Record<R317MissionState,readonly R317MissionState[]>={
 QUEUED:['CLAIMED','FAILED'],CLAIMED:['STARTED','REQUEUED','FAILED'],STARTED:['HEARTBEATING','RETURNED','REQUEUED','FAILED'],
 HEARTBEATING:['HEARTBEATING','RETURNED','REQUEUED','FAILED'],RETURNED:['VERIFIED','FAILED'],VERIFIED:['COMMITTED','FAILED'],
 COMMITTED:[],REQUEUED:['CLAIMED','FAILED'],FAILED:[],
};
export function missionIdempotencyKeyR317(input:{missionId:string;revision:string;inputHash:string}){return`r317-mission-${fnv(input)}`}
export function canTransitionMissionR317(from:R317MissionState,to:R317MissionState){return MISSION_TRANSITIONS[from].includes(to)}

export type R317SolverSkill={
 skillId:string;revision:string;geometryFamily:string;wavelengthMinNm:number;wavelengthMaxNm:number;
 solverBackend:'RCWA'|'FDTD'|'FEM'|'SURROGATE';meshPolicy:string;convergencePolicy:string;
 knownFailureModes:string[];validationDistribution:{samples:number;heldOutFamilies:string[];p95Error:number|null};
 evidenceReceiptIds:string[];canonicalAdmission:false;
};
export function validateSolverSkillR317(skill:R317SolverSkill){
 return Boolean(skill.skillId.trim()&&skill.revision.trim()&&skill.geometryFamily.trim()&&skill.wavelengthMinNm>0&&skill.wavelengthMaxNm>=skill.wavelengthMinNm&&skill.validationDistribution.samples>=0&&skill.evidenceReceiptIds.length>0);
}

export type R317InterventionEpisode={
 episodeId:string;hypothesis:string;intervention:string;metric:string;before:number[];after:number[];
 expectedDirection:'INCREASE'|'DECREASE';evidenceReceiptIds:string[];canonicalAdmission:false;
};
const mean=(values:number[])=>values.reduce((sum,value)=>sum+value,0)/Math.max(1,values.length);
export function evaluateInterventionR317(episode:R317InterventionEpisode){
 if(episode.before.length<2||episode.after.length<2||episode.before.some(value=>!finite(value))||episode.after.some(value=>!finite(value)))return{repeatable:false,effect:null,supportsHypothesis:false};
 const effect=mean(episode.after)-mean(episode.before);
 const directionOk=episode.expectedDirection==='INCREASE'?effect>0:effect<0;
 return{repeatable:true,effect,supportsHypothesis:directionOk&&episode.evidenceReceiptIds.length>0};
}

export type R317ObservedVisualInput={sourceId:string;artifactHash:string;observedText:string[];trust:'UNTRUSTED_EXTERNAL'|'TRUSTED_LOCAL_ARTIFACT'};
export type R317ExplicitAuthorityGrant={grantId:string;scope:string;actorId:string;expiresAt:string;signatureRef:string};
export function visualObservationCanExpandAuthorityR317(_input:R317ObservedVisualInput){return false as const}
export function grantIsUsableR317(grant:R317ExplicitAuthorityGrant,requiredScope:string,nowMs=Date.now()){
 return Boolean(grant.grantId.trim()&&grant.signatureRef.trim()&&grant.scope===requiredScope&&Number.isFinite(Date.parse(grant.expiresAt))&&Date.parse(grant.expiresAt)>nowMs);
}

export type R317ScenePacket={
 packetId:string;parentId:string|null;observationHash:string;coordinateFrame:string;eventTime:string;confidence:number;
 geometryDeltaHash:string|null;materialDeltaHash:string|null;lightingDeltaHash:string|null;
 sourceReceiptIds:string[];derivedProductHashes:string[];canonicalObservation:true;
};
export function validateScenePacketR317(packet:R317ScenePacket){
 return Boolean(packet.packetId.trim()&&packet.observationHash.trim()&&packet.coordinateFrame.trim()&&Number.isFinite(Date.parse(packet.eventTime))&&packet.confidence>=0&&packet.confidence<=1&&packet.sourceReceiptIds.length>0&&packet.canonicalObservation===true);
}
export function createDerivedRenderRefR317(packet:R317ScenePacket,rendererRevision:string,artifactHash:string){
 if(!validateScenePacketR317(packet)||!rendererRevision.trim()||!artifactHash.trim())throw new Error('R317 derived render requires a valid canonical scene packet and artifact identity');
 return{sourcePacketId:packet.packetId,sourceObservationHash:packet.observationHash,rendererRevision,artifactHash,canonicalObservation:false as const};
}

export type R317CiTrustEdge={
 event:string;untrustedInput:boolean;executesUntrustedContent:boolean;tokenWriteScope:boolean;secretReachability:boolean;deployAuthority:boolean;
};
export function classifyCiTrustR317(edge:R317CiTrustEdge){
 const privileged=edge.tokenWriteScope||edge.secretReachability||edge.deployAuthority;
 const block=edge.untrustedInput&&edge.executesUntrustedContent&&privileged;
 return{block,risk:block?'CRITICAL':edge.untrustedInput&&edge.executesUntrustedContent?'ELEVATED':'BOUNDED',privileged};
}

export type R317SymmetrySample={values:number[];orientation:-1|0|1};
export function symmetryResidualR317(source:R317SymmetrySample,transformed:R317SymmetrySample){
 if(source.values.length!==transformed.values.length||source.values.some(value=>!finite(value))||transformed.values.some(value=>!finite(value)))throw new Error('R317 symmetry comparison requires equal finite coordinate vectors');
 const residual=Math.sqrt(source.values.reduce((sum,value,index)=>sum+(value-transformed.values[index])**2,0));
 return{residual,structureInvariant:residual<=1e-9,orientationChanged:source.orientation!==transformed.orientation};
}

export type R317OpticalTile={tileId:string;dxNm:number;dyNm:number;rotationDeg:number;overlayErrorXNm:number;overlayErrorYNm:number};
export function assembleOpticalTilesR317(tiles:R317OpticalTile[]){
 if(new Set(tiles.map(tile=>tile.tileId)).size!==tiles.length)throw new Error('R317 optical tile ids must be unique');
 if(tiles.some(tile=>[tile.dxNm,tile.dyNm,tile.rotationDeg,tile.overlayErrorXNm,tile.overlayErrorYNm].some(value=>!finite(value))))throw new Error('R317 optical tile transform values must be finite');
 return tiles.map(tile=>({...tile,effectiveXNm:tile.dxNm+tile.overlayErrorXNm,effectiveYNm:tile.dyNm+tile.overlayErrorYNm}));
}

export type R317OpticalObservation={
 observationId:string;emittedAt:string|null;receivedAt:string;wavelengthNm:number;intensity:number;
 thetaRad:number;phiRad:number;detectorId:string;calibrationId:string;frameId:string;sourceReceiptId:string;
};
export function validateOpticalObservationR317(observation:R317OpticalObservation){
 return Boolean(observation.observationId.trim()&&Number.isFinite(Date.parse(observation.receivedAt))&&(observation.emittedAt===null||Number.isFinite(Date.parse(observation.emittedAt)))&&observation.wavelengthNm>0&&finite(observation.intensity)&&observation.intensity>=0&&finite(observation.thetaRad)&&finite(observation.phiRad)&&observation.detectorId.trim()&&observation.calibrationId.trim()&&observation.frameId.trim()&&observation.sourceReceiptId.trim());
}

export type R317WorldSession={
 sessionId:string;stateHash:string;parentStateHash:string|null;checkpointHashes:string[];sourceReceiptIds:string[];
 executionEnvironmentId:string;createdAt:string;updatedAt:string;canonicalAdmission:false;
};
export function validateWorldSessionR317(session:R317WorldSession){
 return Boolean(session.sessionId.trim()&&session.stateHash.trim()&&session.executionEnvironmentId.trim()&&Number.isFinite(Date.parse(session.createdAt))&&Number.isFinite(Date.parse(session.updatedAt))&&Date.parse(session.updatedAt)>=Date.parse(session.createdAt)&&session.sourceReceiptIds.length>0);
}

export type R317ResearchContinuityDelta={id:string;title:string;implementation:string;proof:string;state:'INTEGRATED'|'INHERITED_AUTHORITY'};
export const R317_RESEARCH_CONTINUITY_DELTAS:readonly R317ResearchContinuityDelta[]=[
 {id:'R317-D01',title:'Provider-neutral agent and execution-skin contract',implementation:'Agent capability/transport is separated from LOCAL_PC, CLOUD_SANDBOX and MOBILE_OBSERVER execution environments and from authority.',proof:'Dispatch requires capability + adapter scope + environment scope; capability alone never authorizes action.',state:'INTEGRATED'},
 {id:'R317-D02',title:'Durable mission idempotency and transition law',implementation:'Mission identity hashes mission/revision/input and state changes follow an explicit queued-to-committed transition graph.',proof:'Duplicate identity is stable and terminal states cannot transition back into execution.',state:'INTEGRATED'},
 {id:'R317-D03',title:'Persistent SolverSkill evidence registry',implementation:'Validated solver workflows carry geometry family, wavelength domain, backend, mesh/convergence policy, failure modes and validation evidence.',proof:'A skill without evidence receipts is not valid.',state:'INTEGRATED'},
 {id:'R317-D04',title:'Intervention-driven repair evidence',implementation:'Repair hypotheses record controlled before/after trials and direction rather than promoting explanations from logs alone.',proof:'At least two finite before/after observations plus returned evidence are required for causal support.',state:'INTEGRATED'},
 {id:'R317-D05',title:'Visual-input authority firewall',implementation:'Observed pixels/text are evidence only and cannot expand tool or mutation authority.',proof:'Visual observation returns false for authority expansion; only separate explicit signed grants can satisfy scope.',state:'INTEGRATED'},
 {id:'R317-D06',title:'Canonical scene packet versus derived render',implementation:'Scene observations retain hash/frame/time/confidence/source receipts while rendered products are non-canonical derivatives.',proof:'Derived render references bind back to a valid canonical observation packet.',state:'INTEGRATED'},
 {id:'R317-D07',title:'CI trust-graph classifier',implementation:'Workflow edges classify untrusted input, untrusted execution, token/secret reachability and deploy authority.',proof:'Untrusted executable content with any privileged reach is CRITICAL and blocked.',state:'INTEGRATED'},
 {id:'R317-D08',title:'Operator-relative symmetry and orientation',implementation:'Symmetry is measured as residual under a declared transform while orientation is carried separately.',proof:'Orientation reversal may occur with invariant structural coordinates and is not hard-coded to a numeric label.',state:'INTEGRATED'},
 {id:'R317-D09',title:'Tile/stitch optical assembly state',implementation:'Large optical structures preserve per-tile translation, rotation and overlay error before full validation.',proof:'Effective tile coordinates include measured/simulated overlay terms and duplicate tile identities reject.',state:'INTEGRATED'},
 {id:'R317-D10',title:'Calibrated optical observation packet',implementation:'Optical observations bind time, wavelength, intensity, direction, detector, calibration, frame and source receipt.',proof:'Uncalibrated or frame-less light values are invalid.',state:'INTEGRATED'},
 {id:'R317-D11',title:'Session-owned persistent world state',implementation:'Long-lived scene/world state binds checkpoint lineage, source receipts and execution environment independently of prompt text.',proof:'Session state must have temporal order, source evidence and a stable execution environment identity.',state:'INTEGRATED'},
 {id:'R317-D12',title:'R243/R244 lease and heartbeat authority retained',implementation:'Existing bounded RUNNING leases, authenticated renewal, stale reconciliation and terminal replay fences remain the execution authority rather than being shadowed here.',proof:'R317 adds no second lease/dispatch implementation.',state:'INHERITED_AUTHORITY'},
 {id:'R317-D13',title:'R314 residual-gain repair authority retained',implementation:'Existing exact-base allowlist, bounded retry, measurable residual reduction and no-direct-production laws remain the repair promotion authority.',proof:'R317 intervention evidence may inform R314 but cannot bypass its admission gates.',state:'INHERITED_AUTHORITY'},
] as const;

export function buildResearchContinuityR317(){
 return{
  schema:R317_RESEARCH_CONTINUITY_SCHEMA,
  revision:R317_RESEARCH_CONTINUITY_REVISION,
  deltas:R317_RESEARCH_CONTINUITY_DELTAS,
  laws:[
   'CAPABILITY_IS_NOT_AUTHORITY',
   'OBSERVATION_IS_NOT_AUTHORIZATION',
   'DERIVED_RENDER_IS_NOT_CANONICAL_OBSERVATION',
   'SOLVER_SKILL_REQUIRES_EVIDENCE',
   'MISSION_IDENTITY_IS_STABLE_ACROSS_RETRY',
   'CHILD_AUTHORITY_IS_SUBSET_OF_PARENT',
   'R243_R244_OWN_LEASE_AND_HEARTBEAT_EXECUTION_AUTHORITY',
   'R314_OWNS_AUTONOMOUS_REPAIR_PROMOTION_AUTHORITY',
  ] as const,
  truthBoundary:'R317 closes previously named research-contract gaps without inventing ACP/MCP provider connections, solver evidence, device evidence, or new execution/deployment/Canon authority. Protocol adapters become operational only when separately implemented and returned by their existing authorities.',
 };
}
