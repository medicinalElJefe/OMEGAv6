import {structuralHashR316} from './researchAdvancementR316';

export const R316_EXTENSION_SCHEMA='OMEGA_RESEARCH_EXTENSIONS_R316' as const;
export const R316_AGENT_PROTOCOLS=Object.freeze(['ACP','MCP','NATIVE_API','LOCAL_PROCESS','CLOUD_SANDBOX'] as const);

const need=(value:unknown,name:string)=>{const s=String(value??'').trim();if(!s)throw new Error(`${name} required`);return s;};
const finite=(value:number,name:string)=>{if(!Number.isFinite(value))throw new Error(`${name} must be finite`);return value;};

export function makeAgentAdapterR316(input:{adapterId:string;agentIdentity:string;provider:string;protocol:'ACP'|'MCP'|'NATIVE_API'|'LOCAL_PROCESS'|'CLOUD_SANDBOX';capabilities:string[];permissionCeiling:string[];executionEnvironment:string;receiptSupport:boolean}){
 const body={schema:'OMEGA_AGENT_ADAPTER_R316',adapterId:need(input.adapterId,'adapterId'),agentIdentity:need(input.agentIdentity,'agentIdentity'),provider:need(input.provider,'provider'),protocol:input.protocol,capabilities:[...new Set(input.capabilities)].sort(),permissionCeiling:[...new Set(input.permissionCeiling)].sort(),executionEnvironment:need(input.executionEnvironment,'executionEnvironment'),receiptSupport:!!input.receiptSupport,providerOwnsCanon:false,providerOwnsDispatch:false};
 return{...body,adapterHash:structuralHashR316(body)};
}

export function makeFederationNodeR316(input:{nodeId:string;kind:'PC'|'CLOUD'|'MOBILE'|'AUX';capabilities:string[];latencyMs:number;queueDepth:number;authorityScope:string[];heartbeatAt?:string|null;proofState:'VERIFIED'|'UNVERIFIED'|'STALE';available:boolean}){
 return{schema:'OMEGA_FEDERATION_NODE_R316',nodeId:need(input.nodeId,'nodeId'),kind:input.kind,capabilities:[...new Set(input.capabilities)].sort(),latencyMs:finite(input.latencyMs,'latencyMs'),queueDepth:finite(input.queueDepth,'queueDepth'),authorityScope:[...new Set(input.authorityScope)].sort(),heartbeatAt:input.heartbeatAt??null,proofState:input.proofState,available:!!input.available,logicalFederationNotHardwareFusion:true};
}

export function routeFederatedTaskR316(nodes:ReturnType<typeof makeFederationNodeR316>[],task:{requiredCapabilities:string[];requiredAuthority:string[]},weights={latency:1,queue:1,proofPenalty:1000}){
 const ranked=nodes.map(node=>{
  const capabilities=task.requiredCapabilities.every(x=>node.capabilities.includes(x));
  const authority=task.requiredAuthority.every(x=>node.authorityScope.includes(x)||node.authorityScope.includes('*'));
  const eligible=node.available&&capabilities&&authority&&node.proofState==='VERIFIED';
  const score=eligible?weights.latency*node.latencyMs+weights.queue*node.queueDepth+(node.proofState==='VERIFIED'?0:weights.proofPenalty):Infinity;
  return{node,eligible,score};
 }).sort((a,b)=>a.score-b.score);
 return{selected:ranked.find(x=>x.eligible)?.node??null,ranked,noSilentSuccess:true};
}

export function makeSolverSkillR316(input:{skillId:string;geometryFamily:string;wavelengthDomainNm:[number,number];parameterSchema:string[];solverBackend:string;solverVersion:string;meshPolicy:string;convergencePolicy:string;knownFailureModes:string[];validationDistribution:string;evidenceReceipts:string[];revision:number}){
 const body={schema:'OMEGA_SOLVER_SKILL_R316',skillId:need(input.skillId,'skillId'),geometryFamily:need(input.geometryFamily,'geometryFamily'),wavelengthDomainNm:[finite(input.wavelengthDomainNm[0],'wavelengthMin'),finite(input.wavelengthDomainNm[1],'wavelengthMax')] as [number,number],parameterSchema:[...input.parameterSchema],solverBackend:need(input.solverBackend,'solverBackend'),solverVersion:need(input.solverVersion,'solverVersion'),meshPolicy:need(input.meshPolicy,'meshPolicy'),convergencePolicy:need(input.convergencePolicy,'convergencePolicy'),knownFailureModes:[...input.knownFailureModes],validationDistribution:need(input.validationDistribution,'validationDistribution'),evidenceReceipts:[...input.evidenceReceipts],revision:finite(input.revision,'revision'),modelMemoryIsNotEvidence:true};
 return{...body,skillHash:structuralHashR316(body)};
}

export function makeInterventionRecordR316(input:{failureId:string;hypothesis:string;intervention:string;preStateHash:string;postStateHash:string;metricBefore:number;metricAfter:number;repeatCount:number;successfulRepeats:number}){
 const delta=finite(input.metricAfter,'metricAfter')-finite(input.metricBefore,'metricBefore');
 const repeatability=input.repeatCount>0?input.successfulRepeats/input.repeatCount:0;
 const causalCandidate=input.repeatCount>=2&&repeatability>=.8&&Math.abs(delta)>0;
 const body={schema:'OMEGA_INTERVENTION_REPAIR_R316',failureId:need(input.failureId,'failureId'),hypothesis:need(input.hypothesis,'hypothesis'),intervention:need(input.intervention,'intervention'),preStateHash:need(input.preStateHash,'preStateHash'),postStateHash:need(input.postStateHash,'postStateHash'),metricBefore:input.metricBefore,metricAfter:input.metricAfter,delta,repeatCount:input.repeatCount,successfulRepeats:input.successfulRepeats,repeatability,causalCandidate,diagnosisPromoted:causalCandidate};
 return{...body,recordHash:structuralHashR316(body)};
}

export function applyTileTransformR316(input:{tileId:string;localXNm:number;localYNm:number;rotationDeg:number;globalOriginXNm:number;globalOriginYNm:number;overlayErrorXNm?:number;overlayErrorYNm?:number;rotationErrorDeg?:number}){
 const theta=(input.rotationDeg+(input.rotationErrorDeg??0))*Math.PI/180;
 const x=input.localXNm*Math.cos(theta)-input.localYNm*Math.sin(theta)+input.globalOriginXNm+(input.overlayErrorXNm??0);
 const y=input.localXNm*Math.sin(theta)+input.localYNm*Math.cos(theta)+input.globalOriginYNm+(input.overlayErrorYNm??0);
 return{schema:'OMEGA_OPTICAL_TILE_TRANSFORM_R316',tileId:need(input.tileId,'tileId'),globalXNm:x,globalYNm:y,effectiveRotationDeg:input.rotationDeg+(input.rotationErrorDeg??0),stitchScar:{overlayErrorXNm:input.overlayErrorXNm??0,overlayErrorYNm:input.overlayErrorYNm??0,rotationErrorDeg:input.rotationErrorDeg??0},fabricationMeasurementClaimed:false};
}

export function defineFormalInvariantR316(input:{id:string;subject:string;condition:string;failureDisposition:'HOLD'|'REQUEUE'|'REVOKE'|'FAIL';authorityOwner:string}){
 const body={schema:'OMEGA_FORMAL_INVARIANT_R316',id:need(input.id,'id'),subject:need(input.subject,'subject'),condition:need(input.condition,'condition'),failureDisposition:input.failureDisposition,authorityOwner:need(input.authorityOwner,'authorityOwner'),descriptiveOnlyUntilExecutableProof:true};
 return{...body,invariantHash:structuralHashR316(body)};
}

export function compileResearchExtensionsR316(){return{schema:R316_EXTENSION_SCHEMA,capabilities:{providerNeutralAgents:true,logicalFederationRouter:true,persistentSolverSkills:true,interventionDrivenRepair:true,opticalTileStitching:true,formalInvariantRegistry:true},truthBoundary:'R316 extensions define bounded software contracts and deterministic transforms; they do not claim external agent execution, physical fabrication, solver accuracy or formal verification unless separate evidence exists.'};}
