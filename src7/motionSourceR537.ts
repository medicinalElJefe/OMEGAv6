/** Historical donor: Vertical_12x12_Motion_Engine_Triangulated.xlsx,
 * Google Drive file 1DhT3onczcTyELV4JUnsJGGr_X-GYHnlp.
 * Bounded model rules R1-R6, not empirical physical dynamics. */
export const R537_DONOR='Vertical_12x12_Motion_Engine_Triangulated.xlsx' as const;
export type MotionPacketR537={face:number;tier:number;stability:number;adaptation:number;harmony:number;highRisk:boolean};
export type MotionStepR537={rule:'R1'|'R2'|'R3'|'R4'|'R5'|'R6'|'HOLD';before:MotionPacketR537;after:MotionPacketR537;description:string};
export const R537_STORAGE_KEY='omega7.r537.motion.v1' as const;
export const DEFAULT_MOTION_R537:MotionPacketR537={face:0,tier:1,stability:70,adaptation:40,harmony:70,highRisk:false};
export type MotionSnapshotR537={version:1;packet:MotionPacketR537;steps:number;truthClass:'BOUNDED_SOURCE_RECONSTRUCTION';canonicalMutation:false};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const isPercent=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
export function validateMotionPacketR537(value:unknown):MotionPacketR537{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('INVALID_MOTION_PACKET');
 const x=value as Record<string,unknown>;
 if(!Number.isInteger(x.face)||!(Number(x.face)>=0&&Number(x.face)<=11)||
    !Number.isInteger(x.tier)||!(Number(x.tier)>=-3&&Number(x.tier)<=3)||
    !isPercent(x.stability)||!isPercent(x.adaptation)||!isPercent(x.harmony)||typeof x.highRisk!=='boolean')
  throw new Error('INVALID_MOTION_PACKET');
 return{face:x.face as number,tier:x.tier as number,stability:x.stability,adaptation:x.adaptation,harmony:x.harmony,highRisk:x.highRisk};
}
const center=(n:number)=>n>0?n-1:n<0?n+1:0;
export function motionStepR537(input:MotionPacketR537):MotionStepR537{
 const before=validateMotionPacketR537(input);
 let after:MotionPacketR537={...before},rule:MotionStepR537['rule']='HOLD',description='No donor rule triggered';
 if(before.tier===0){rule='R5';after.highRisk=false;description='Center reset; risk cleared';}
 else if(before.harmony<50&&before.highRisk){rule='R3';after.tier=center(before.tier);after.face=(before.face+1)%12;description='High-risk diagonal neighbor; tier moves toward center';}
 else if(before.stability>75&&!before.highRisk){rule='R1';after.tier=before.tier+1;description='High stability; positive tier step';}
 else if(before.adaptation>75&&!before.highRisk){rule='R2';after.tier=before.tier-1;description='High adaptation; negative tier step';}
 else if(before.harmony>=50&&before.harmony<=75){rule='R4';after.tier=center(before.tier);description='Mid-harmony deterministic centerward step; donor permits face drift';}
 if(after.tier>3||after.tier< -3){rule='R6';after.tier=clamp(after.tier,-3,3);description='Outer tier clamped to donor bounds';}
 return{rule,before,after,description};
}
export function motionSequenceR537(input:MotionPacketR537,steps:number){
 if(!Number.isInteger(steps)||steps<1||steps>48)throw new Error('INVALID_SEQUENCE_LENGTH');
 const result:MotionStepR537[]=[];let state=validateMotionPacketR537(input);
 for(let i=0;i<steps;i++){const step=motionStepR537(state);result.push(step);state=step.after;}
 return result;
}

export function exportMotionSnapshotR537(packet:MotionPacketR537,steps:number):string{
 if(!Number.isInteger(steps)||steps<1||steps>48)throw new Error('INVALID_SEQUENCE_LENGTH');
 const snapshot:MotionSnapshotR537={version:1,packet:validateMotionPacketR537(packet),steps,truthClass:'BOUNDED_SOURCE_RECONSTRUCTION',canonicalMutation:false};
 return JSON.stringify(snapshot);
}
export function importMotionSnapshotR537(raw:string):MotionSnapshotR537{
 if(typeof raw!=='string'||raw.length>8192)throw new Error('SNAPSHOT_SIZE_REFUSED');
 let value:unknown;
 try{value=JSON.parse(raw);}catch{throw new Error('INVALID_SNAPSHOT_JSON');}
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('INVALID_SNAPSHOT_SCHEMA');
 const x=value as Record<string,unknown>;
 if(x.version!==1||x.truthClass!=='BOUNDED_SOURCE_RECONSTRUCTION'||x.canonicalMutation!==false||
    !Number.isInteger(x.steps)||Number(x.steps)<1||Number(x.steps)>48)throw new Error('INVALID_SNAPSHOT_SCHEMA');
 return{version:1,packet:validateMotionPacketR537(x.packet),steps:x.steps as number,truthClass:'BOUNDED_SOURCE_RECONSTRUCTION',canonicalMutation:false};
}

/** Return detection is a property of the declared finite state machine, not observed temporal recurrence. */
export function motionTraceR537(input:MotionPacketR537,steps:number){
 const sequence=motionSequenceR537(input,steps);
 const states=[validateMotionPacketR537(input),...sequence.map(s=>s.after)];
 const seen=new Map<string,number>();
 let cycleStart:number|null=null,cyclePeriod:number|null=null;
 for(let i=0;i<states.length;i++){
  const key=JSON.stringify(states[i]),previous=seen.get(key);
  if(previous!==undefined){cycleStart=previous;cyclePeriod=i-previous;break;}
  seen.set(key,i);
 }
 return{sequence,terminal:states[states.length-1],cycleStart,cyclePeriod,truthClass:'BOUNDED_SOURCE_RECONSTRUCTION' as const,canonicalMutation:false as const};
}
