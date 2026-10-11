/** Historical donor: Vertical_12x12_Motion_Engine_Triangulated.xlsx,
 * Google Drive file 1DhT3onczcTyELV4JUnsJGGr_X-GYHnlp.
 * Bounded model rules R1-R6, not empirical physical dynamics. */
export const R537_DONOR='Vertical_12x12_Motion_Engine_Triangulated.xlsx' as const;
export type MotionPacketR537={face:number;tier:number;stability:number;adaptation:number;harmony:number;highRisk:boolean};
export type MotionStepR537={rule:'R1'|'R2'|'R3'|'R4'|'R5'|'R6'|'HOLD';before:MotionPacketR537;after:MotionPacketR537;description:string};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const center=(n:number)=>n>0?n-1:n<0?n+1:0;
export function motionStepR537(input:MotionPacketR537):MotionStepR537{
 const before={...input,face:clamp(Math.trunc(input.face),0,11),tier:clamp(Math.trunc(input.tier),-3,3)};
 if(![input.face,input.tier,input.stability,input.adaptation,input.harmony].every(Number.isFinite))throw new Error('NONFINITE_MOTION_INPUT');
 let after:MotionPacketR537={...before},rule:MotionStepR537['rule']='HOLD',description='No donor rule triggered';
 if(before.tier===0){rule='R5';after.highRisk=false;description='Center reset; risk cleared';}
 else if(before.harmony<50&&before.highRisk){rule='R3';after.tier=center(before.tier);after.face=(before.face+1)%12;description='High-risk diagonal neighbor; tier moves toward center';}
 else if(before.stability>75&&!before.highRisk){rule='R1';after.tier=before.tier+1;description='High stability; outward structural step';}
 else if(before.adaptation>75&&!before.highRisk){rule='R2';after.tier=before.tier-1;description='High adaptation; integrative step';}
 else if(before.harmony>=50&&before.harmony<=75){rule='R4';after.tier=center(before.tier);description='Mid-harmony deterministic centerward step; donor permits face drift';}
 if(after.tier>3||after.tier< -3){rule='R6';after.tier=clamp(after.tier,-3,3);description='Outer tier clamped to donor bounds';}
 return{rule,before,after,description};
}
export function motionSequenceR537(input:MotionPacketR537,steps:number){
 if(!Number.isInteger(steps)||steps<0||steps>144)throw new Error('INVALID_SEQUENCE_LENGTH');
 const result:MotionStepR537[]=[];let state=input;
 for(let i=0;i<steps;i++){const step=motionStepR537(state);result.push(step);state=step.after;}
 return result;
}
