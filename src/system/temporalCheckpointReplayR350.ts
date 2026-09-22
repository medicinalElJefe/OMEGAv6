import{evolveHardwareFieldR349,R349_RESOLUTION,R349_SCHEMA,type TypedFieldR349}from'./wovenHardwareFieldR349';

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

function hashBytes(bytes:Uint8Array){
 let h1=2166136261>>>0,h2=2246822519>>>0;
 for(let i=0;i<bytes.length;i++){const b=bytes[i];h1=Math.imul(h1^b,16777619)>>>0;h2=Math.imul((h2+b+((i&255)<<1))>>>0,3266489917)>>>0;h2=(h2^(h2>>>13))>>>0}
 return h1.toString(16).padStart(8,'0')+h2.toString(16).padStart(8,'0');
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
