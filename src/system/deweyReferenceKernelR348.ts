export const DEWEY_REFERENCE_KERNEL_R348='DEWEY_REFERENCE_KERNEL_R348';
export const DEWEY_REFERENCE_SOURCE_SHA256_R348='9c0701b81fcd5d83444c5e8b2da362c01bab3067d6efec9cfd9ea775db1349ae';
export const DEWEY_REFERENCE_EPS_R348=1e-12;
export const DEWEY_AUTHORITY_R348=Object.freeze({
 E:.448,R:.5816,M:.5028,D:.3975,L:.5985,K:.6492225,
 inverseCost:.004666176545362555,
 outverseCost:.00415373404865833,
 wovenCost:.005049096028629144,
 unifiedCost:.004742904612907536
});

export type DeweyStageR348='B0'|'B3'|'B4'|'B5'|'B6';
export type DeweyFitR348={anchor:number[];scale:number[];axes:number[][];fitReceipt?:string};
export type DeweyKernelPacketR348={
 vector:number[];
 fit:DeweyFitR348;
 requestedStage?:DeweyStageR348;
 validatedStages?:DeweyStageR348[];
 parentVector?:number[];
 parentReceipt?:string;
 provenance?:string[];
};

export type DeweyGeometryR348={
 z:number[];projected:number[];presence:number[];inverse:number[];outverse:number[];
 continuity:number;contradiction:number;burden:number;plasticity:number;score:number;
 symmetry:number;asymmetry:number;features:number[];
};

const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const mean=(a:number[])=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const dot=(a:number[],b:number[])=>a.reduce((s,x,i)=>s+x*b[i],0);
const norm=(a:number[])=>Math.sqrt(a.reduce((s,x)=>s+x*x,0));
const stdPopulation=(a:number[])=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)*(x-m))))};
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));

function validateFit(fit:DeweyFitR348,vector:number[]){
 const reasons:string[]=[];
 if(!Array.isArray(vector)||!vector.length||vector.some(x=>!finite(x)))reasons.push('FINITE_VECTOR_REQUIRED');
 if(!fit||!Array.isArray(fit.anchor)||fit.anchor.length!==vector.length||fit.anchor.some(x=>!finite(x)))reasons.push('ANCHOR_DIMENSION_REQUIRED');
 if(!fit||!Array.isArray(fit.scale)||fit.scale.length!==vector.length||fit.scale.some(x=>!finite(x)||x<=0))reasons.push('POSITIVE_SCALE_REQUIRED');
 if(!fit||!Array.isArray(fit.axes)||!fit.axes.length||fit.axes.some(row=>!Array.isArray(row)||row.length!==vector.length||row.some(x=>!finite(x))))reasons.push('AXES_DIMENSION_REQUIRED');
 return{valid:reasons.length===0,reasons};
}

export function compileB0StandardR348(vector:number[],fit:DeweyFitR348){
 const valid=validateFit(fit,vector);if(!valid.valid)throw new Error(valid.reasons.join('|'));
 return vector.map((x,i)=>(x-fit.anchor[i])/fit.scale[i]);
}

export function compileB3CanonicalStateR348(vector:number[],fit:DeweyFitR348):DeweyGeometryR348{
 const z=compileB0StandardR348(vector,fit);
 const projected=fit.axes.map(axis=>dot(z,axis));
 const presence=projected.map(x=>1/(1+Math.abs(x)));
 const inverse=projected.map(x=>Math.max(-x,0));
 const outverse=projected.map(x=>Math.max(x,0));
 const continuity=mean(presence);
 const contradiction=stdPopulation([...presence,...inverse,...outverse]);
 const burden=mean(projected.map(Math.abs));
 const plasticity=Math.exp(-clamp(burden,0,700));
 const score=(continuity*plasticity)/(1+contradiction+burden);
 const symmetry=1/(1+mean(inverse.map((x,i)=>Math.abs(x-outverse[i]))));
 const asymmetry=1-symmetry;
 return{z,projected,presence,inverse,outverse,continuity,contradiction,burden,plasticity,score,symmetry,asymmetry,
  features:[...projected,...presence,...inverse,...outverse,continuity,contradiction,burden,plasticity,score,symmetry,asymmetry]};
}

export function compileB4MotionR348(query:DeweyGeometryR348,parent:DeweyGeometryR348){
 if(query.projected.length!==parent.projected.length)throw new Error('PARENT_PROJECTED_DIMENSION_MISMATCH');
 const delta=parent.projected.map((x,i)=>x-query.projected[i]);
 const distance=norm(delta);
 const direction=distance>DEWEY_REFERENCE_EPS_R348?delta.map(x=>x/distance):delta.map(()=>0);
 const persistence=Math.exp(-clamp(distance,0,700));
 const energy=DEWEY_AUTHORITY_R348.E*mean(delta.map(x=>x*x));
 const resistance=DEWEY_AUTHORITY_R348.R*distance;
 const drive=DEWEY_AUTHORITY_R348.M*(energy+mean(direction.map(Math.abs)));
 const damping=DEWEY_AUTHORITY_R348.D/(1+distance);
 const memory=DEWEY_AUTHORITY_R348.L*persistence;
 const coupling=DEWEY_AUTHORITY_R348.K*mean(query.presence.map((x,i)=>x*parent.presence[i]));
 const response=(drive*coupling*(1+memory))/(1+resistance+damping);
 const relativity=(response*(1+query.continuity))/(1+Math.abs(resistance-damping));
 const inverseCost=distance*DEWEY_AUTHORITY_R348.inverseCost*(1+mean(query.inverse));
 const outverseCost=distance*DEWEY_AUTHORITY_R348.outverseCost*(1+mean(query.outverse));
 const wovenCost=distance*DEWEY_AUTHORITY_R348.wovenCost*(1+query.contradiction);
 const unifiedCost=(inverseCost+outverseCost+wovenCost)/3+DEWEY_AUTHORITY_R348.unifiedCost*query.burden;
 return{delta,direction,norm:distance,persistence,energy,resistance,drive,damping,memory,coupling,response,relativity,inverseCost,outverseCost,wovenCost,unifiedCost,
  features:[...delta,...direction,distance,persistence,energy,resistance,drive,damping,memory,coupling,response,relativity,inverseCost,outverseCost,wovenCost,unifiedCost]};
}

export function compileB5ParentR348(query:DeweyGeometryR348,motion:ReturnType<typeof compileB4MotionR348>){
 const parentDirection=motion.direction;
 const parentStrength=(motion.persistence*motion.coupling)/(1+motion.unifiedCost);
 const reciprocity=1/(1+Math.abs(motion.resistance-motion.drive));
 const scar=motion.unifiedCost/(1+motion.unifiedCost);
 const gateSupport=(parentStrength*reciprocity*query.continuity)/(1+query.contradiction+scar);
 return{parentDirection,parentStrength,reciprocity,scar,gateSupport,
  features:[...parentDirection,parentStrength,reciprocity,scar,gateSupport]};
}

export function compileB6GateR348(query:DeweyGeometryR348,motion:ReturnType<typeof compileB4MotionR348>,parent:ReturnType<typeof compileB5ParentR348>){
 const support=parent.gateSupport;
 const turnPressure=motion.unifiedCost+query.contradiction;
 const escalatePressure=query.burden+parent.scar;
 const stay=support>=turnPressure&&query.continuity>=.35?1:0;
 const escalate=escalatePressure>1&&support<.25?1:0;
 const turn=1-Math.max(stay,escalate);
 return{stay,turn,escalate,support,turnPressure,escalatePressure,
  decision:stay?'STAY':escalate?'ESCALATE':'TURN',
  features:[stay,turn,escalate,support,turnPressure,escalatePressure]};
}

export function compileGravityMotionAddressR348(query:DeweyGeometryR348,motion:ReturnType<typeof compileB4MotionR348>){
 const axes=[query.burden,motion.energy,motion.memory,motion.relativity];
 const bounded=axes.map(x=>x/(1+Math.abs(x)));
 const unit=bounded.map(x=>clamp((x+1)/2,0,1-DEWEY_REFERENCE_EPS_R348));
 const digits=unit.map(x=>Math.floor(x*12));
 const index0=digits[0]+12*digits[1]+144*digits[2]+1728*digits[3];
 const phase=digits.map(x=>x*(2*Math.PI/12));
 return{axes,bounded,digits,index0,index1:index0+1,phase,complement:digits.map(x=>(x+6)%12),forward:digits.map(x=>(x+1)%12),backward:digits.map(x=>(x+11)%12),
  truthBoundary:'Four-axis base-12 gravity-motion address from reference equations; motion.energy is normalized model activity, not joules or measured physical energy.'};
}

export function executeDeweyReferenceKernelR348(packet?:DeweyKernelPacketR348|null){
 if(!packet)return{state:'HELD',selectedStage:null,reason:'REFERENCE_PACKET_REQUIRED',sourceSha256:DEWEY_REFERENCE_SOURCE_SHA256_R348};
 const fitValidation=validateFit(packet.fit,packet.vector);
 if(!fitValidation.valid)return{state:'HELD',selectedStage:null,reason:fitValidation.reasons.join('|'),sourceSha256:DEWEY_REFERENCE_SOURCE_SHA256_R348};
 const requested=packet.requestedStage??'B3';
 const validated=new Set(packet.validatedStages??[]);
 let selected:DeweyStageR348=requested;
 let requestedHeld:DeweyStageR348|null=null;
 if((requested==='B4'||requested==='B5'||requested==='B6')&&(!validated.has(requested)||!packet.parentVector)){
  selected='B3';requestedHeld=requested;
 }
 const b0=compileB0StandardR348(packet.vector,packet.fit);
 if(selected==='B0')return{state:'COMPUTED',selectedStage:'B0' as const,requestedHeld,features:b0,sourceSha256:DEWEY_REFERENCE_SOURCE_SHA256_R348,truthClass:'DERIVED_MODEL'};
 const b3=compileB3CanonicalStateR348(packet.vector,packet.fit);
 if(selected==='B3')return{state:'COMPUTED',selectedStage:'B3' as const,requestedHeld,geometry:b3,features:b3.features,sourceSha256:DEWEY_REFERENCE_SOURCE_SHA256_R348,truthClass:'DERIVED_MODEL'};
 const parentVector=packet.parentVector!;
 const parentValidation=validateFit(packet.fit,parentVector);
 if(!parentValidation.valid)return{state:'HELD',selectedStage:'B3' as const,requestedHeld:requested,geometry:b3,reason:'ADMISSIBLE_PARENT_INVALID',sourceSha256:DEWEY_REFERENCE_SOURCE_SHA256_R348};
 const parentGeometry=compileB3CanonicalStateR348(parentVector,packet.fit);
 const motion=compileB4MotionR348(b3,parentGeometry);
 if(selected==='B4')return{state:'COMPUTED',selectedStage:'B4' as const,requestedHeld,geometry:b3,motion,features:[...b3.features,...motion.features],sourceSha256:DEWEY_REFERENCE_SOURCE_SHA256_R348,truthClass:'DERIVED_MODEL'};
 const parent=compileB5ParentR348(b3,motion);
 if(selected==='B5')return{state:'COMPUTED',selectedStage:'B5' as const,requestedHeld,geometry:b3,motion,parent,features:[...b3.features,...motion.features,...parent.features],sourceSha256:DEWEY_REFERENCE_SOURCE_SHA256_R348,truthClass:'DERIVED_MODEL'};
 const gate=compileB6GateR348(b3,motion,parent);
 const gravityMotionAddress=compileGravityMotionAddressR348(b3,motion);
 return{state:'COMPUTED',selectedStage:'B6' as const,requestedHeld,geometry:b3,motion,parent,gate,gravityMotionAddress,
  features:[...b3.features,...motion.features,...parent.features,...gate.features],
  sourceSha256:DEWEY_REFERENCE_SOURCE_SHA256_R348,truthClass:'DERIVED_MODEL',
  boundary:'B6 is executed only after explicit validation and an externally selected admissible parent. Gravity-motion address is diagnostic and does not promote B7 or physical dimensionality.'};
}
