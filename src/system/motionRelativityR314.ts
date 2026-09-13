import type {R314FrameRef,R314SynchronousPacket,R314Uncertainty} from './synchronousPacketR314';
import {convertUnitR314,unitR314} from './synchronousPacketR314';

export const R314_MOTION_RELATIVITY_SCHEMA='OMEGA_MOTION_RELATIVITY_R314' as const;
export type R314Vec3={x:number;y:number;z:number};
export type R314Mat3=[number,number,number,number,number,number,number,number,number];
export type R314RigidTransform={fromFrameId:string;toFrameId:string;rotation:R314Mat3;translation:R314Vec3;revision:string;proofIds:string[]};
export type R314MotionEstimate={
 schema:typeof R314_MOTION_RELATIVITY_SCHEMA;
 frameId:string;
 fromPacketId:string;
 toPacketId:string;
 dtSeconds:number;
 displacementMeters:R314Vec3;
 velocityMetersPerSecond:R314Vec3;
 speedMetersPerSecond:number;
 uncertainty:R314Uncertainty;
 canonicalAdmission:false;
};

const EPS=1e-9;
const finiteVec=(v:R314Vec3)=>Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z);
const add=(a:R314Vec3,b:R314Vec3):R314Vec3=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const sub=(a:R314Vec3,b:R314Vec3):R314Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
const scale=(a:R314Vec3,k:number):R314Vec3=>({x:a.x*k,y:a.y*k,z:a.z*k});
const norm=(a:R314Vec3)=>Math.hypot(a.x,a.y,a.z);
const mulMatVec=(m:R314Mat3,v:R314Vec3):R314Vec3=>({x:m[0]*v.x+m[1]*v.y+m[2]*v.z,y:m[3]*v.x+m[4]*v.y+m[5]*v.z,z:m[6]*v.x+m[7]*v.y+m[8]*v.z});
const transpose=(m:R314Mat3):R314Mat3=>[m[0],m[3],m[6],m[1],m[4],m[7],m[2],m[5],m[8]];
const mulMat=(a:R314Mat3,b:R314Mat3):R314Mat3=>[
 a[0]*b[0]+a[1]*b[3]+a[2]*b[6],a[0]*b[1]+a[1]*b[4]+a[2]*b[7],a[0]*b[2]+a[1]*b[5]+a[2]*b[8],
 a[3]*b[0]+a[4]*b[3]+a[5]*b[6],a[3]*b[1]+a[4]*b[4]+a[5]*b[7],a[3]*b[2]+a[4]*b[5]+a[5]*b[8],
 a[6]*b[0]+a[7]*b[3]+a[8]*b[6],a[6]*b[1]+a[7]*b[4]+a[8]*b[7],a[6]*b[2]+a[7]*b[5]+a[8]*b[8],
];
const det=(m:R314Mat3)=>m[0]*(m[4]*m[8]-m[5]*m[7])-m[1]*(m[3]*m[8]-m[5]*m[6])+m[2]*(m[3]*m[7]-m[4]*m[6]);
const nearly=(a:number,b:number,tol=1e-7)=>Math.abs(a-b)<=tol;

export const R314_IDENTITY_ROTATION:R314Mat3=[1,0,0,0,1,0,0,0,1];

export function validateRigidTransformR314(t:R314RigidTransform){
 const issues:string[]=[];
 if(!t.fromFrameId||!t.toFrameId)issues.push('FRAME_ID_MISSING');
 if(t.fromFrameId===t.toFrameId)issues.push('SELF_TRANSFORM');
 if(t.rotation.length!==9||t.rotation.some(x=>!Number.isFinite(x)))issues.push('ROTATION_INVALID');
 if(!finiteVec(t.translation))issues.push('TRANSLATION_INVALID');
 const rt=mulMat(transpose(t.rotation),t.rotation);
 for(let i=0;i<9;i++)if(!nearly(rt[i],R314_IDENTITY_ROTATION[i],1e-6)){issues.push('ROTATION_NOT_ORTHONORMAL');break}
 const determinant=det(t.rotation);
 if(!nearly(Math.abs(determinant),1,1e-6))issues.push('ROTATION_DETERMINANT_INVALID');
 return{valid:issues.length===0,issues,orientation:determinant<0?-1:1 as -1|1};
}

export function inverseRigidTransformR314(t:R314RigidTransform):R314RigidTransform{
 const checked=validateRigidTransformR314(t);if(!checked.valid)throw new Error(`R314 invalid rigid transform: ${checked.issues.join(',')}`);
 const r=transpose(t.rotation);return{fromFrameId:t.toFrameId,toFrameId:t.fromFrameId,rotation:r,translation:scale(mulMatVec(r,t.translation),-1),revision:t.revision,proofIds:[...t.proofIds]};
}

export function composeRigidTransformsR314(a:R314RigidTransform,b:R314RigidTransform):R314RigidTransform{
 if(a.toFrameId!==b.fromFrameId)throw new Error(`R314 transform chain mismatch ${a.toFrameId} != ${b.fromFrameId}`);
 const out:R314RigidTransform={fromFrameId:a.fromFrameId,toFrameId:b.toFrameId,rotation:mulMat(b.rotation,a.rotation),translation:add(mulMatVec(b.rotation,a.translation),b.translation),revision:`${a.revision}+${b.revision}`,proofIds:[...new Set([...a.proofIds,...b.proofIds])]};
 const checked=validateRigidTransformR314(out);if(!checked.valid)throw new Error(`R314 composed transform invalid: ${checked.issues.join(',')}`);return out;
}

export function applyRigidTransformR314(t:R314RigidTransform,p:R314Vec3):R314Vec3{
 const checked=validateRigidTransformR314(t);if(!checked.valid)throw new Error(`R314 invalid rigid transform: ${checked.issues.join(',')}`);if(!finiteVec(p))throw new Error('R314 point must be finite');return add(mulMatVec(t.rotation,p),t.translation);
}

export class R314FrameGraph{
 private frames=new Map<string,R314FrameRef>();
 private edges=new Map<string,R314RigidTransform[]>();
 registerFrame(frame:R314FrameRef){if(this.frames.has(frame.id))throw new Error(`R314 duplicate frame ${frame.id}`);this.frames.set(frame.id,frame);return this}
 registerTransform(t:R314RigidTransform){
  const checked=validateRigidTransformR314(t);if(!checked.valid)throw new Error(`R314 invalid transform: ${checked.issues.join(',')}`);
  if(!this.frames.has(t.fromFrameId)||!this.frames.has(t.toFrameId))throw new Error('R314 transform frames must be registered first');
  const pair=[t,inverseRigidTransformR314(t)];
  for(const edge of pair){const rows=this.edges.get(edge.fromFrameId)||[];rows.push(edge);this.edges.set(edge.fromFrameId,rows)}
  return this;
 }
 resolve(fromFrameId:string,toFrameId:string):R314RigidTransform{
  if(fromFrameId===toFrameId)return{fromFrameId,toFrameId,rotation:[...R314_IDENTITY_ROTATION] as R314Mat3,translation:{x:0,y:0,z:0},revision:'IDENTITY',proofIds:[]};
  if(!this.frames.has(fromFrameId)||!this.frames.has(toFrameId))throw new Error('R314 unknown frame');
  const queue:[string,R314RigidTransform|null][]=[[fromFrameId,null]],seen=new Set([fromFrameId]);
  while(queue.length){const [id,chain]=queue.shift()!;for(const edge of this.edges.get(id)||[]){if(seen.has(edge.toFrameId))continue;const next=chain?composeRigidTransformsR314(chain,edge):edge;if(edge.toFrameId===toFrameId)return next;seen.add(edge.toFrameId);queue.push([edge.toFrameId,next])}}
  throw new Error(`R314 no transform path ${fromFrameId} -> ${toFrameId}`);
 }
 transformPoint(point:R314Vec3,fromFrameId:string,toFrameId:string){return applyRigidTransformR314(this.resolve(fromFrameId,toFrameId),point)}
}

function packetPositionMeters(packet:R314SynchronousPacket<R314Vec3>):R314Vec3{
 if(packet.unit.dimension!=='LENGTH')throw new Error('R314 motion packet must use a length unit');
 if(!finiteVec(packet.payload))throw new Error('R314 motion packet payload must be finite Vec3');
 const m=unitR314('m');return{x:convertUnitR314(packet.payload.x,packet.unit,m),y:convertUnitR314(packet.payload.y,packet.unit,m),z:convertUnitR314(packet.payload.z,packet.unit,m)};
}

function absoluteUncertaintyMeters(packet:R314SynchronousPacket<R314Vec3>){
 const u=packet.uncertainty;if(u.kind==='NONE')return 0;
 if(u.kind==='ABSOLUTE'&&u.value!==null&&u.unit){return Math.abs(convertUnitR314(u.value,unitR314(u.unit),unitR314('m')))}
 if(u.kind==='INTERVAL'&&u.lower!==null&&u.upper!==null&&u.unit){const width=Math.abs(u.upper-u.lower)/2;return Math.abs(convertUnitR314(width,unitR314(u.unit),unitR314('m')))}
 return null;
}

export function estimateMotionR314(a:R314SynchronousPacket<R314Vec3>,b:R314SynchronousPacket<R314Vec3>,graph:R314FrameGraph,targetFrameId=a.frame.id):R314MotionEstimate{
 const ta=Date.parse(a.clocks.eventTime),tb=Date.parse(b.clocks.eventTime);const dt=(tb-ta)/1000;
 if(!Number.isFinite(dt)||dt<=EPS)throw new Error('R314 motion requires positive event-time separation');
 const pa=graph.transformPoint(packetPositionMeters(a),a.frame.id,targetFrameId),pb=graph.transformPoint(packetPositionMeters(b),b.frame.id,targetFrameId);
 const displacement=sub(pb,pa),velocity=scale(displacement,1/dt),ua=absoluteUncertaintyMeters(a),ub=absoluteUncertaintyMeters(b);
 const uncertainty=ua===null||ub===null?{kind:'CUSTOM' as const,value:null,lower:null,upper:null,unit:'m/s',method:'input uncertainty could not be converted to absolute length'}:{kind:'ABSOLUTE' as const,value:Math.hypot(ua,ub)/dt,lower:null,upper:null,unit:'m/s',method:'RSS endpoint absolute-position uncertainty / Δt'};
 return{schema:R314_MOTION_RELATIVITY_SCHEMA,frameId:targetFrameId,fromPacketId:a.packetId,toPacketId:b.packetId,dtSeconds:dt,displacementMeters:displacement,velocityMetersPerSecond:velocity,speedMetersPerSecond:norm(velocity),uncertainty,canonicalAdmission:false};
}

export function observerProjectionR314(point:R314Vec3,canonicalFrameId:string,observerFrameId:string,graph:R314FrameGraph){return{canonicalPoint:{...point},observerPoint:graph.transformPoint(point,canonicalFrameId,observerFrameId),canonicalStateChanged:false as const,projectionOnly:true as const}}

export const R314_MOTION_RELATIVITY_BOUNDARY='Frame transforms and finite-difference motion are software operators over declared packet coordinates/times. They do not create telemetry, validate physical models, or turn atlas resolution levels into physical dimensions.' as const;
