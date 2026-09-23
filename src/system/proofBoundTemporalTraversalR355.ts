import{compileProofBoundSceneR354,type ProofBoundSceneReceiptR354}from'./proofBoundSceneR354';
import{type TypedFieldR349}from'./wovenHardwareFieldR349';
import{type CurrentRuntimeEvidenceR353}from'./releaseLineageR353';

export const R355_SCHEMA='OMEGA_PROOF_BOUND_TEMPORAL_SCENE_TRAVERSAL_R355' as const;
export const R355_REVISION='R355' as const;
export const R355_BOUNDARY='R355 indexes and digest-chains R354 proof-bound model scenes across integer R350 model-time addresses. It adds no observation, physical-time, CanonState, durable execution-history, dispatch or production authority. R125/R141/R146/R147 and ci.yml remain authoritative; HISTORY/NOW/FORECAST remain model relations, not observational claims.' as const;
export const R355_LAWS=[
 'EVERY_TRAVERSAL_NODE_IS_AN_R354_SCENE_RECEIPT',
 'TRAVERSAL_ORDER_IS_INTEGER_MODEL_TIME_ORDER',
 'EACH_LINK_BINDS_PREVIOUS_LINK_TICK_AND_SCENE_DIGEST',
 'RELEASE_LINEAGE_MUST_REMAIN_IDENTICAL_ACROSS_ONE_TRAVERSAL',
 'HISTORY_NOW_FORECAST_RELATIONS_MUST_REMAIN_EXPLICIT',
 'MODEL_HISTORY_IS_NOT_OBSERVED_HISTORY',
 'MODEL_FORECAST_IS_NOT_OBSERVATION',
 'NO_NEW_PHYSICAL_PRIMITIVE'
]as const;

export type TemporalSceneNodeR355={tick:number;relation:ProofBoundSceneReceiptR354['relation'];sceneDigest:string;fieldHash:string;frameReceiptHash:string;state:ProofBoundSceneReceiptR354['state'];releaseLineageSha256:string;previousLinkDigest:string;linkDigest:string};
export type ProofBoundTemporalTraversalR355={
 schema:typeof R355_SCHEMA;revision:typeof R355_REVISION;steps:number;nowTick:number;
 nodes:TemporalSceneNodeR355[];scenes:ProofBoundSceneReceiptR354[];
 proof:{ordered:boolean;sceneDigestsUnique:boolean;lineageStable:boolean;linkIntegrity:boolean;allTimelineDeterministic:boolean;allPacketExact:boolean;canonicalMutation:false;observedHistoryClaimed:false;physicalTimeClaimed:false;durableHistoryClaimed:false};
 traversalDigest:string;boundary:typeof R355_BOUNDARY;
};

const clampInt=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Math.floor(Number.isFinite(Number(n))?Number(n):a)));
async function sha256(text:string){if(!globalThis.crypto?.subtle)throw new Error('R355 SHA-256 requires Web Crypto');const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}

export async function compileProofBoundTemporalTraversalR355({
 sourceField,evidence={},steps=8,checkpointEvery=2,nowTick=4,orientations=[1,-1,1,0],transportRate=.125
}:{sourceField?:TypedFieldR349;evidence?:CurrentRuntimeEvidenceR353;steps?:number;checkpointEvery?:number;nowTick?:number;orientations?:number[];transportRate?:number}={}):Promise<ProofBoundTemporalTraversalR355>{
 const count=clampInt(steps,0,32),now=clampInt(nowTick,0,count),scenes:ProofBoundSceneReceiptR354[]=[];
 for(let tick=0;tick<=count;tick++){
  const build=await compileProofBoundSceneR354({sourceField,evidence,steps:count,checkpointEvery,targetTick:tick,nowTick:now,orientations,transportRate});
  scenes.push(build.scene);
 }
 let previous='R355-GENESIS';const nodes:TemporalSceneNodeR355[]=[];
 for(const scene of scenes){
  const linkDigest=await sha256([previous,scene.tick,scene.sceneDigest].join('|'));
  nodes.push({tick:scene.tick,relation:scene.relation,sceneDigest:scene.sceneDigest,fieldHash:scene.fieldHash,frameReceiptHash:scene.frameReceiptHash,state:scene.state,releaseLineageSha256:scene.releaseLineageSha256,previousLinkDigest:previous,linkDigest});
  previous=linkDigest;
 }
 const ordered=nodes.every((n,i)=>n.tick===i),sceneDigestsUnique=new Set(nodes.map(n=>n.sceneDigest)).size===nodes.length,lineageStable=new Set(nodes.map(n=>n.releaseLineageSha256)).size<=1;
 let prior='R355-GENESIS',linkIntegrity=true;for(const n of nodes){const expected=await sha256([prior,n.tick,n.sceneDigest].join('|'));if(expected!==n.linkDigest||n.previousLinkDigest!==prior)linkIntegrity=false;prior=n.linkDigest}
 return{schema:R355_SCHEMA,revision:R355_REVISION,steps:count,nowTick:now,nodes,scenes,
  proof:{ordered,sceneDigestsUnique,lineageStable,linkIntegrity,allTimelineDeterministic:scenes.every(s=>s.proof.timelineDeterministic),allPacketExact:scenes.every(s=>s.proof.packetExact&&s.proof.packetInputBound),canonicalMutation:false,observedHistoryClaimed:false,physicalTimeClaimed:false,durableHistoryClaimed:false},
  traversalDigest:previous,boundary:R355_BOUNDARY};
}

export function selectTemporalSceneR355(traversal:ProofBoundTemporalTraversalR355,tick:number){
 const target=clampInt(tick,0,traversal.steps),scene=traversal.scenes.find(s=>s.tick===target),node=traversal.nodes.find(n=>n.tick===target);
 if(!scene||!node)throw new Error('R355 missing temporal scene node');
 return{scene,node};
}
