import type {Mandala20736Field} from './mandala20736Runtime';

export type OrientationSign=-1|0|1;
export type OrientationFrameR182={
  schema:'OMEGA_ORIENTATION_FRAME_R182';
  source:number;
  target:number;
  sourceState:number;
  targetState:number;
  tangent:{x:number;y:number;z:number};
  turn:{x:number;y:number;z:number};
  sigma:OrientationSign;
  phaseDelta:number;
  motion:number;
  velocity:number;
  acceleration:number;
  observer:{yaw:number;pitch:number;zoom:number;authority:'OBSERVER_ONLY'};
  referenceAxis:{x:1;y:0;z:0;label:'+X FIELD REFERENCE'};
  labels:{forward:string;turn:string;orientation:string;phase:string;observer:string};
  boundary:string;
};

const TAU=Math.PI*2;
const sign=(x:number):OrientationSign=>Math.abs(x)<1e-8?0:x>0?1:-1;
const norm=(x:number,y:number,z:number)=>{const n=Math.hypot(x,y,z)||1;return{x:x/n,y:y/n,z:z/n}};
const wrapSigned=(x:number)=>{let v=((x+Math.PI)%TAU+TAU)%TAU-Math.PI;return Math.abs(v)<1e-12?0:v};

export function compileOrientationFrameR182(field:Mandala20736Field,address:number,yaw:number,pitch:number,zoom:number):OrientationFrameR182{
  const source=Math.max(0,Math.min(field.count-1,Math.floor(address))),target=field.routeNext[source]??source;
  const tangent=norm(field.x[target]-field.x[source],field.y[target]-field.y[source],field.z[target]-field.z[source]);
  const sigma=sign(field.velocity[source]);
  const phaseDelta=wrapSigned(field.phase[target]-field.phase[source]);
  const turn=norm(-tangent.y*(sigma||1),tangent.x*(sigma||1),phaseDelta*.12);
  const motion=Number(field.motion[source])||0,velocity=Number(field.velocity[source])||0,acceleration=Number(field.acceleration[source])||0;
  return{
    schema:'OMEGA_ORIENTATION_FRAME_R182',source,target,sourceState:source+1,targetState:target+1,tangent,turn,sigma,phaseDelta,motion,velocity,acceleration,
    observer:{yaw:Number.isFinite(yaw)?yaw:0,pitch:Number.isFinite(pitch)?pitch:0,zoom:Number.isFinite(zoom)?zoom:1,authority:'OBSERVER_ONLY'},
    referenceAxis:{x:1,y:0,z:0,label:'+X FIELD REFERENCE'},
    labels:{forward:`S${source+1} → S${target+1}`,turn:sigma<0?'SIGNED LEFT / INVERSE':sigma>0?'SIGNED RIGHT / OUTVERSE':'ZERO SIGN / UNORIENTED',orientation:`σ ${sigma>0?'+1':sigma<0?'-1':'0'}`,phase:`ΔΦ ${phaseDelta>=0?'+':''}${phaseDelta.toFixed(4)} rad`,observer:`yaw ${yaw.toFixed(2)} · pitch ${pitch.toFixed(2)} · zoom ${zoom.toFixed(2)}×`},
    boundary:'R182 orientation separates field motion from observer motion. Forward is the canonical route tangent. Turn is derived from tangent, signed velocity orientation and wrapped phase delta. Camera yaw/pitch/zoom are observer-only and never redefine source direction, CanonState, or physical truth.'
  };
}

export const ORIENTATION_FRAME_BOUNDARY_R182='Every animated or transformed view must preserve a visible source→target route direction, signed σ orientation, wrapped ΔΦ and an observer-only camera readout. No screen rotation may silently redefine forward.' as const;
