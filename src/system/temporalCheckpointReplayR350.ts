import{evolveHardwareFieldR349,R349_RESOLUTION,R349_SCHEMA,type TypedFieldR349}from'./wovenHardwareFieldR349';
import{compileMultiAxisRelativityR193}from'../execution/multiAxisRelativityCompilerR193.js';

export const R350_SCHEMA='OMEGA_TEMPORAL_CHECKPOINT_REPLAY_R350' as const;
export const R350_REVISION='R350' as const;
export const R350_LAWS=[
 'INTEGER_TICK_IS_THE_CANONICAL_MODEL_TIME_ADDRESS_FOR_REPLAY',
 'CHECKPOINT_HASH_BINDS_COMPLETE_TYPED_FIELD_STATE_NOT_RENDERED_APPEARANCE',
 'NEAREST_PRIOR_CHECKPOINT_PLUS_DECLARED_STEP_RECEIPTS_MUST_RECONSTRUCT_TARGET_STATE',
 'SCAR_HISTORY_LINEAGE_IS_HASH_CHAINED_AND_NEVER_ERASED_BY_SEEK',
 'HISTORY_NOW_FORECAST_ARE_EPISTEMICALLY_SEPARATED',
 'MODEL_REPLAY_HISTORY_IS_NOT_OBSERVED_HISTORY',
 'MODEL_FORECAST_IS_NOT_OBSERVATION',
 'R185_R193_TEMPORAL_AND_MULTI_AXIS_PLANS_ARE_SCHEDULING_INPUTS_NOT_TRUTH_UPGRADES',
 'R141_REMAINS_EXACT_RETURN_PROOF_AUTHORITY',
 'R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY',
]as const;
export const R350_BOUNDARY='R350 deterministically checkpoints, seeks and replays R349 software/model field state. It does not create observed history, physical time, device execution proof, durable execution history or CanonState admission. R185/R193 may supply scheduling/refinement metadata; R141 remains exact-return proof authority; R146 remains durable history authority; R125 remains sole CanonState admission authority.';

export type TemporalBudgetR350={
 source:'R185_R193_DECLARED_PLAN'|'STATIC_MODEL_PLAN';
 targetHz:number;
 workingSetResolution:number;
 addressScale:number;
 proofDepth:string;
 referenceFrame:string;
};
export type StepReceiptR350={
 tick:number;
 orientation:-1|0|1;
 transportRate:number;
 fieldHash:string;
 invariantResidual:number;
 scarDelta:number;
};
export type CheckpointReceiptR350={
 schema:typeof R350_SCHEMA;
 revision:typeof R350_REVISION;
 tick:number;
 fieldHash:string;
 previousLineageHash:string;
 lineageHash:string;
 stepReceiptHash:string;
 epistemicState:'MODEL_INITIAL'|'MODEL_REPLAY_HISTORY'|'MODEL_NOW'|'MODEL_PROJECTED_FORECAST';
 authority:{exactReturn:'R141';durableHistory:'R146';canonAdmission:'R125';temporalScheduling:'R185';multiAxisRefinement:'R193'};
 canonicalMutation:false;
 durableHistoryClaimed:false;
 observedHistoryClaimed:false;
 physicalTimeClaimed:false;
 boundary:string;
};
export type TemporalCheckpointR350={tick:number;field:TypedFieldR349;receipt:CheckpointReceiptR350};
export type TimelineR350={
 schema:typeof R350_SCHEMA;revision:typeof R350_REVISION;
 initialFieldHash:string;finalFieldHash:string;
 budget:TemporalBudgetR350;
 stepReceipts:StepReceiptR350[];
 checkpoints:TemporalCheckpointR350[];
 finalField:TypedFieldR349;
 proof:{checkpointCount:number;fullAddressCoverage:boolean;deterministicModelReplay:boolean;durableHistoryClaimed:false;canonAdmissionClaimed:false};
 boundary:string;
};

const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Number.isFinite(Number(n))?Number(n):a));
const sig=(n:number):-1|0|1=>n<0?-1:n>0?1:0;
const channels=['continuity','plasticity','burden','contradiction','scar','evidence','invariant','motion','support']as const;

function rotr(x:number,n:number){return(x>>>n)|(x<<(32-n))}
function hashBytes(bytes:Uint8Array){
 const K=new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
 const bitLen=bytes.length*8,total=((bytes.length+9+63)>>6)<<6,padded=new Uint8Array(total);padded.set(bytes);padded[bytes.length]=0x80;
 const dv=new DataView(padded.buffer);dv.setUint32(total-4,bitLen>>>0,false);dv.setUint32(total-8,Math.floor(bitLen/0x100000000),false);
 let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
 const w=new Uint32Array(64);
 for(let off=0;off<total;off+=64){
  for(let i=0;i<16;i++)w[i]=dv.getUint32(off+i*4,false);
  for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2],s0=rotr(a,7)^rotr(a,18)^(a>>>3),s1=rotr(b,17)^rotr(b,19)^(b>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0}
  let a=h0,b=h1,cc=h2,d=h3,e=h4,ff=h5,g=h6,h=h7;
  for(let i=0;i<64;i++){const S1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&ff)^((~e)&g),t1=(h+S1+ch+K[i]+w[i])>>>0,S0=rotr(a,2)^rotr(a,13)^rotr(a,22),maj=(a&b)^(a&cc)^(b&cc),t2=(S0+maj)>>>0;h=g;g=ff;ff=e;e=(d+t1)>>>0;d=cc;cc=b;b=a;a=(t1+t2)>>>0}
  h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+cc)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;h5=(h5+ff)>>>0;h6=(h6+g)>>>0;h7=(h7+h)>>>0;
 }
 return[h0,h1,h2,h3,h4,h5,h6,h7].map(x=>x.toString(16).padStart(8,'0')).join('');
}
function hashText(text:string){return hashBytes(new TextEncoder().encode(text))}
function floatBytes(a:Float32Array){const out=new Uint8Array(a.length*4),view=new DataView(out.buffer);for(let i=0;i<a.length;i++)view.setFloat32(i*4,a[i],true);return out}
function uint16Bytes(a:Uint16Array){const out=new Uint8Array(a.length*2),view=new DataView(out.buffer);for(let i=0;i<a.length;i++)view.setUint16(i*2,a[i],true);return out}
function concat(parts:Uint8Array[]){const total=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(total);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out}

export function cloneTypedFieldR350(field:TypedFieldR349):TypedFieldR349{
 if(field?.schema!==R349_SCHEMA||field.resolution!==R349_RESOLUTION)throw new Error('R350 requires canonical R349 typed field');
 return{schema:R349_SCHEMA,resolution:R349_RESOLUTION,
  continuity:field.continuity.slice(),plasticity:field.plasticity.slice(),burden:field.burden.slice(),contradiction:field.contradiction.slice(),scar:field.scar.slice(),evidence:field.evidence.slice(),invariant:field.invariant.slice(),motion:field.motion.slice(),support:field.support.slice(),orientation:field.orientation.slice(),knownMask:field.knownMask.slice()};
}
export function fieldHashR350(field:TypedFieldR349){
 if(field?.schema!==R349_SCHEMA||field.resolution!==R349_RESOLUTION)throw new Error('R350 hash requires canonical R349 typed field');
 const parts=channels.map(k=>floatBytes(field[k]));
 parts.push(new Uint8Array(field.orientation.buffer.slice(field.orientation.byteOffset,field.orientation.byteOffset+field.orientation.byteLength)));
 parts.push(uint16Bytes(field.knownMask));
 return hashBytes(concat(parts));
}
export function compileTemporalBudgetR350(input:Partial<TemporalBudgetR350>={}):TemporalBudgetR350{
 const scale=[12,144,1728,20736,248832].includes(Number(input.addressScale))?Number(input.addressScale):20736;
 const working=[12,144,1728,20736,248832].includes(Number(input.workingSetResolution))?Number(input.workingSetResolution):20736;
 return{source:input.source==='R185_R193_DECLARED_PLAN'?'R185_R193_DECLARED_PLAN':'STATIC_MODEL_PLAN',targetHz:clamp(Number(input.targetHz)||12,1,60),workingSetResolution:working,addressScale:scale,proofDepth:String(input.proofDepth||'MODEL_REPLAY_RECEIPT'),referenceFrame:String(input.referenceFrame||'PRESERVE_DECLARED_FRAME')};
}
export function compileTemporalBudgetFromR193R350({run={},hint={},currentPressure=0,predictedPressure=0,input={},history={}}:{run?:any;hint?:any;currentPressure?:number;predictedPressure?:number;input?:any;history?:any}={}){
 const plan=compileMultiAxisRelativityR193({run,hint,currentPressure,predictedPressure,input,history});
 return{plan,budget:compileTemporalBudgetR350({source:'R185_R193_DECLARED_PLAN',targetHz:plan.axes.time.targetHz,workingSetResolution:plan.axes.compute.logicalLanes,addressScale:plan.axes.address.targetResolution,proofDepth:plan.axes.proof.required,referenceFrame:plan.axes.frame.policy})};
}
function stepHash(r:StepReceiptR350){return hashText(JSON.stringify(r))}
function checkpointLineage(previousLineageHash:string,tick:number,fieldHash:string,stepReceiptHash:string){return hashText([previousLineageHash,tick,fieldHash,stepReceiptHash].join('|'))}
function epistemic(tick:number,nowTick:number):CheckpointReceiptR350['epistemicState']{return tick===0?'MODEL_INITIAL':tick<nowTick?'MODEL_REPLAY_HISTORY':tick===nowTick?'MODEL_NOW':'MODEL_PROJECTED_FORECAST'}

function makeCheckpoint(field:TypedFieldR349,tick:number,previousLineageHash:string,stepReceiptHash:string,nowTick:number):TemporalCheckpointR350{
 const copy=cloneTypedFieldR350(field),fieldHash=fieldHashR350(copy),lineageHash=checkpointLineage(previousLineageHash,tick,fieldHash,stepReceiptHash);
 return{tick,field:copy,receipt:{schema:R350_SCHEMA,revision:R350_REVISION,tick,fieldHash,previousLineageHash,lineageHash,stepReceiptHash,epistemicState:epistemic(tick,nowTick),authority:{exactReturn:'R141',durableHistory:'R146',canonAdmission:'R125',temporalScheduling:'R185',multiAxisRefinement:'R193'},canonicalMutation:false,durableHistoryClaimed:false,observedHistoryClaimed:false,physicalTimeClaimed:false,boundary:R350_BOUNDARY}};
}
function normalizeOrientations(values:number[]|undefined){const raw=Array.isArray(values)&&values.length?values:[1,-1,1,0];return raw.map(sig)}
export function evolveTemporalTimelineR350(source:TypedFieldR349,{steps=8,checkpointEvery=2,orientations,transportRate=.125,nowTick,budget}:{steps?:number;checkpointEvery?:number;orientations?:number[];transportRate?:number;nowTick?:number;budget?:Partial<TemporalBudgetR350>}={}):TimelineR350{
 const count=Math.max(0,Math.min(256,Math.floor(Number(steps)))),every=Math.max(1,Math.min(64,Math.floor(Number(checkpointEvery)))),schedule=normalizeOrientations(orientations),rate=clamp(Number(transportRate)||0,0,.5),now=Math.max(0,Math.min(count,Math.floor(Number.isFinite(Number(nowTick))?Number(nowTick):count)));
 let field=cloneTypedFieldR350(source),previousLineageHash='R350-GENESIS',lastStepHash=hashText('R350-INITIAL'),initialFieldHash=fieldHashR350(field);
 const receipts:StepReceiptR350[]=[],checkpoints:TemporalCheckpointR350[]=[];
 const initial=makeCheckpoint(field,0,previousLineageHash,lastStepHash,now);checkpoints.push(initial);previousLineageHash=initial.receipt.lineageHash;
 for(let tick=1;tick<=count;tick++){
  const orientation=schedule[(tick-1)%schedule.length],e=evolveHardwareFieldR349(field,{orientation,transportRate:rate});field=e.field;
  const receipt:StepReceiptR350={tick,orientation,transportRate:rate,fieldHash:fieldHashR350(field),invariantResidual:e.invariantResidual,scarDelta:e.scarDelta};receipts.push(receipt);lastStepHash=stepHash(receipt);
  if(tick%every===0||tick===count){const cp=makeCheckpoint(field,tick,previousLineageHash,lastStepHash,now);checkpoints.push(cp);previousLineageHash=cp.receipt.lineageHash}
 }
 return{schema:R350_SCHEMA,revision:R350_REVISION,initialFieldHash,finalFieldHash:fieldHashR350(field),budget:compileTemporalBudgetR350(budget),stepReceipts:receipts,checkpoints,finalField:cloneTypedFieldR350(field),proof:{checkpointCount:checkpoints.length,fullAddressCoverage:field.resolution===R349_RESOLUTION,deterministicModelReplay:true,durableHistoryClaimed:false,canonAdmissionClaimed:false},boundary:R350_BOUNDARY};
}
export function validateCheckpointR350(checkpoint:TemporalCheckpointR350){
 const actual=fieldHashR350(checkpoint.field),hashMatches=actual===checkpoint.receipt.fieldHash,lineage=checkpointLineage(checkpoint.receipt.previousLineageHash,checkpoint.tick,checkpoint.receipt.fieldHash,checkpoint.receipt.stepReceiptHash);
 return{ok:hashMatches&&lineage===checkpoint.receipt.lineageHash,hashMatches,lineageMatches:lineage===checkpoint.receipt.lineageHash,actualFieldHash:actual,storedFieldHash:checkpoint.receipt.fieldHash};
}
export function replayFromCheckpointR350(checkpoint:TemporalCheckpointR350,receipts:StepReceiptR350[],targetTick:number){
 const valid=validateCheckpointR350(checkpoint);if(!valid.ok)throw new Error('R350 checkpoint integrity failure');
 const target=Math.floor(Number(targetTick));if(target<checkpoint.tick)throw new Error('R350 replay target precedes checkpoint');
 let field=cloneTypedFieldR350(checkpoint.field);
 for(let tick=checkpoint.tick+1;tick<=target;tick++){
  const receipt=receipts.find(r=>r.tick===tick);if(!receipt)throw new Error(`R350 missing declared step receipt for tick ${tick}`);
  const e=evolveHardwareFieldR349(field,{orientation:receipt.orientation,transportRate:receipt.transportRate});field=e.field;
  const hash=fieldHashR350(field);if(hash!==receipt.fieldHash)throw new Error(`R350 deterministic replay divergence at tick ${tick}: expected ${receipt.fieldHash}, got ${hash}`);
 }
 return{tick:target,field,fieldHash:fieldHashR350(field),sourceCheckpointTick:checkpoint.tick,replayedSteps:Math.max(0,target-checkpoint.tick),deterministicReplay:true,canonicalMutation:false,durableHistoryClaimed:false};
}
export function seekTemporalStateR350(timeline:TimelineR350,targetTick:number){
 const target=Math.max(0,Math.min(timeline.stepReceipts.length,Math.floor(Number(targetTick)))),candidates=timeline.checkpoints.filter(c=>c.tick<=target),checkpoint=candidates[candidates.length-1];if(!checkpoint)throw new Error('R350 no prior checkpoint');
 return replayFromCheckpointR350(checkpoint,timeline.stepReceipts,target);
}
export function proveTimelineReplayR350(timeline:TimelineR350){
 const finalTick=timeline.stepReceipts.length,seek=seekTemporalStateR350(timeline,finalTick),checkpointIntegrity=timeline.checkpoints.every(c=>validateCheckpointR350(c).ok),finalHashMatch=seek.fieldHash===timeline.finalFieldHash;
 const chainIntegrity=timeline.checkpoints.every((c,i)=>i===0||c.receipt.previousLineageHash===timeline.checkpoints[i-1].receipt.lineageHash);
 return{schema:'OMEGA_TEMPORAL_REPLAY_PROOF_R350' as const,finalTick,checkpointIntegrity,chainIntegrity,finalHashMatch,deterministicReplay:checkpointIntegrity&&chainIntegrity&&finalHashMatch,sourceCheckpointTick:seek.sourceCheckpointTick,replayedSteps:seek.replayedSteps,observedHistoryClaimed:false,durableHistoryClaimed:false,canonAdmissionClaimed:false,boundary:R350_BOUNDARY};
}
export function timelineFramesR350(timeline:TimelineR350,nowTick:number){
 const now=Math.max(0,Math.min(timeline.stepReceipts.length,Math.floor(Number(nowTick))));
 return timeline.checkpoints.map(c=>({...c.receipt,epistemicState:epistemic(c.tick,now),relation:c.tick<now?'HISTORY':c.tick===now?'NOW':'FORECAST',observationState:c.tick>now?'MODEL_PROJECTED_NOT_OBSERVED':'MODEL_REPLAY_NOT_OBSERVED'}));
}
