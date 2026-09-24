import{compileCanonicalTypedFieldR349,type TypedFieldR349}from'./wovenHardwareFieldR349';
import{initCorpusPack}from'../corpusRuntime';
import{evolveTemporalTimelineR350,proveTimelineReplayR350,seekTemporalStateR350,type TimelineR350}from'./temporalCheckpointReplayR350';
import{compilePacketMirrorR351,deterministicFrameReceiptR351,packetMirrorReceiptR351,type PacketMirrorR351}from'./gpuPacketMirrorR351';
import{cpuRenderStateReferenceR352}from'./gpuComputeRuntimeR352';
import{compileReleaseLineageR353,releaseLineageSha256R353,type CurrentRuntimeEvidenceR353,type ReleaseLineageR353}from'./releaseLineageR353';

export const R354_SCHEMA='OMEGA_PROOF_BOUND_SCENE_CONVERGENCE_R354' as const;
export const R354_REVISION='R354' as const;
export const R354_BOUNDARY='R354 composes already-established R349 field state, R350 deterministic replay, R351 packet/frame receipts, R352 derived render-state correspondence and R353 current release lineage into one read-only scene receipt. It creates no new CanonState, observation, physical-simulation truth, durable execution history, dispatch authority or production authority. R125/R141/R146/R147 and ci.yml remain authoritative in their existing domains.' as const;
export const R354_LAWS=[
 'ONE_SCENE_RECEIPT_BINDS_RELEASE_REPLAY_PACKET_RENDER_AND_OPTIONAL_GPU_RETURN',
 'TEMPORAL_FIELD_HASH_PRECEDES_RENDER_HASH_AND_MAY_NOT_BE_REPLACED_BY_SCREENSHOT_IDENTITY',
 'GPU_RETURN_MAY_STRENGTHEN_DEVICE_EXECUTION_EVIDENCE_BUT_MAY_NOT_MUTATE_CANONICAL_STATE',
 'CURRENT_RUNTIME_AUTHORITY_REQUIRES_R353_SOURCE_WORKER_PACKAGE_BINDING',
 'MODEL_HISTORY_AND_FORECAST_REMAIN_DISTINCT_FROM_OBSERVATION',
 'R354_SCENE_RECOMPOSITION_MAY_REUSE_ONE_PROVED_R350_TIMELINE_WITHOUT_REEVOLVING_THE_PARENT_FIELD',
 'NO_NEW_PHYSICAL_PRIMITIVE'
]as const;

export type SceneRelationR354='HISTORY'|'NOW'|'FORECAST';
export type SceneStateR354='CURRENT_RUNTIME_BOUND'|'MODEL_ONLY_HOLD';
export type SceneExecutionStateR354='CPU_REFERENCE_ONLY'|'GPU_BOUND';

export type ProofBoundSceneReceiptR354={
 schema:typeof R354_SCHEMA;revision:typeof R354_REVISION;
 state:SceneStateR354;executionState:SceneExecutionStateR354;
 tick:number;nowTick:number;relation:SceneRelationR354;
 currentReleaseSha:string|null;currentWorkerVersion:string|null;releaseLineageSha256:string;
 fieldHash:string;sourceCheckpointTick:number;replayedSteps:number;
 packetHash:string;edgeHash:string;ancestryHash:string;packetCount:number;edgeCount:number;
 renderStateInputHash:string;renderStateOutputHash:string;renderShaderHash:string;
 frameReceiptHash:string;frameLdrChecksum:string;frameHdrHash:string;
 gpu:null|{state:string;verified:boolean;cpuHashMatch:boolean;gpuOutputHash:string|null;compared:number;maxAbsError:number|null;tolerance:number|null;returnedWallMs:number|null};
 proof:{timelineDeterministic:boolean;checkpointIntegrity:boolean;packetExact:boolean;packetInputBound:boolean;currentRuntimeBound:boolean;gpuCorrespondenceBound:boolean;canonicalMutation:false;observedHistoryClaimed:false;physicalSimulationClaimed:false;durableHistoryClaimed:false};
 sceneDigest:string;boundary:typeof R354_BOUNDARY;
};

export type ProofBoundSceneBuildR354={
 scene:ProofBoundSceneReceiptR354;
 timeline:TimelineR350;
 replay:ReturnType<typeof seekTemporalStateR350>;
 mirror:PacketMirrorR351;
 lineage:ReleaseLineageR353;
};

const clampInt=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Math.floor(Number.isFinite(Number(n))?Number(n):a)));
const relation=(tick:number,now:number):SceneRelationR354=>tick<now?'HISTORY':tick===now?'NOW':'FORECAST';
function stable(value:any):string{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return'['+value.map(stable).join(',')+']';
 return'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
}
async function sha256(text:string){
 if(!globalThis.crypto?.subtle)throw new Error('R354 SHA-256 requires Web Crypto');
 const digest=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
 return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function digestable(scene:ProofBoundSceneReceiptR354){const{sceneDigest,...rest}=scene;return rest}
async function digestScene(scene:ProofBoundSceneReceiptR354){return sha256(stable(digestable(scene)))}

export async function compileProofBoundSceneFromTimelineR354({
 timeline,evidence={},targetTick=4,nowTick=4
}:{timeline:TimelineR350;evidence?:CurrentRuntimeEvidenceR353;targetTick?:number;nowTick?:number}):Promise<ProofBoundSceneBuildR354>{
 const stepCount=timeline.stepReceipts.length,now=clampInt(nowTick,0,stepCount),target=clampInt(targetTick,0,stepCount);
 const replay=seekTemporalStateR350(timeline,target),timelineProof=proveTimelineReplayR350(timeline);
 const mirror=compilePacketMirrorR351(replay.field),packet=packetMirrorReceiptR351(mirror),frame=deterministicFrameReceiptR351(replay.field,target),cpu=cpuRenderStateReferenceR352(mirror);
 const lineage=compileReleaseLineageR353(evidence),releaseLineageSha256=await releaseLineageSha256R353(lineage);
 const packetInputBound=cpu.inputHash===packet.packetHash,currentRuntimeBound=lineage.state==='CURRENT_BOUND'&&Boolean(lineage.currentSha&&lineage.currentWorkerVersion);
 const state:SceneStateR354=currentRuntimeBound&&timelineProof.deterministicReplay&&packet.exactCounts&&packetInputBound?'CURRENT_RUNTIME_BOUND':'MODEL_ONLY_HOLD';
 let scene:ProofBoundSceneReceiptR354={
  schema:R354_SCHEMA,revision:R354_REVISION,state,executionState:'CPU_REFERENCE_ONLY',
  tick:target,nowTick:now,relation:relation(target,now),
  currentReleaseSha:lineage.currentSha,currentWorkerVersion:lineage.currentWorkerVersion,releaseLineageSha256,
  fieldHash:replay.fieldHash,sourceCheckpointTick:replay.sourceCheckpointTick,replayedSteps:replay.replayedSteps,
  packetHash:packet.packetHash,edgeHash:packet.edgeHash,ancestryHash:packet.ancestryHash,packetCount:packet.packetCount,edgeCount:packet.edgeCount,
  renderStateInputHash:cpu.inputHash,renderStateOutputHash:cpu.outputHash,renderShaderHash:cpu.shaderHash,
  frameReceiptHash:frame.receiptHash,frameLdrChecksum:frame.frame.ldrChecksum,frameHdrHash:frame.frame.hdrHash,
  gpu:null,
  proof:{timelineDeterministic:timelineProof.deterministicReplay,checkpointIntegrity:timelineProof.checkpointIntegrity&&timelineProof.chainIntegrity,packetExact:packet.exactCounts,packetInputBound,currentRuntimeBound,gpuCorrespondenceBound:false,canonicalMutation:false,observedHistoryClaimed:false,physicalSimulationClaimed:false,durableHistoryClaimed:false},
  sceneDigest:'',boundary:R354_BOUNDARY
 };
 scene={...scene,sceneDigest:await digestScene(scene)};
 return{scene,timeline,replay,mirror,lineage};
}

export async function compileProofBoundSceneR354({
 sourceField,
 evidence={},
 steps=8,
 checkpointEvery=2,
 targetTick=4,
 nowTick=4,
 orientations=[1,-1,1,0],
 transportRate=.125
}:{
 sourceField?:TypedFieldR349;
 evidence?:CurrentRuntimeEvidenceR353;
 steps?:number;checkpointEvery?:number;targetTick?:number;nowTick?:number;orientations?:number[];transportRate?:number;
}={}):Promise<ProofBoundSceneBuildR354>{
 const stepCount=clampInt(steps,0,64),now=clampInt(nowTick,0,stepCount);
 if(!sourceField)await initCorpusPack();
 const source=sourceField||compileCanonicalTypedFieldR349(0);
 const timeline=evolveTemporalTimelineR350(source,{steps:stepCount,checkpointEvery,orientations,transportRate,nowTick:now});
 return compileProofBoundSceneFromTimelineR354({timeline,evidence,targetTick,nowTick:now});
}

export async function bindGpuCorrespondenceR354(scene:ProofBoundSceneReceiptR354,gpuResult:any):Promise<ProofBoundSceneReceiptR354>{
 const correspondence=gpuResult?.correspondence,cpuHashMatch=Boolean(gpuResult?.cpu?.outputHash&&gpuResult.cpu.outputHash===scene.renderStateOutputHash);
 const verified=Boolean(gpuResult?.state==='GPU_COMPUTE_VERIFIED'&&gpuResult?.deviceExecutionProved===true&&correspondence?.ok===true&&cpuHashMatch);
 const maxAbsError=Number.isFinite(Number(correspondence?.maxAbsError))?Number(correspondence.maxAbsError):null,tolerance=Number.isFinite(Number(correspondence?.tolerance))?Number(correspondence.tolerance):null,returnedWallMs=Number.isFinite(Number(gpuResult?.gpu?.returnedWallMs))?Number(gpuResult.gpu.returnedWallMs):null;
 let next:ProofBoundSceneReceiptR354={...scene,executionState:verified?'GPU_BOUND':'CPU_REFERENCE_ONLY',
  gpu:{state:String(gpuResult?.state||'GPU_NOT_RETURNED'),verified,cpuHashMatch,gpuOutputHash:typeof gpuResult?.gpu?.outputHash==='string'?gpuResult.gpu.outputHash:null,compared:Number.isFinite(Number(correspondence?.compared))?Number(correspondence.compared):0,maxAbsError,tolerance,returnedWallMs},
  proof:{...scene.proof,gpuCorrespondenceBound:verified},sceneDigest:''
 };
 next={...next,sceneDigest:await digestScene(next)};
 return next;
}
