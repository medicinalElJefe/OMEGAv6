/** R666: historical B053 observer address and motion operations, ported to OMEGA7.
 * Source: omega/traversal/observer.py, B053 verified archive.
 * Model-space only. Does not claim physical coordinates.
 */
export type AddressR666={d:number;p:number;r:number;l:number;node_id:string};
export type MotionR666={continuity?:number;burden?:number;ledger?:number;contradiction?:number;scar?:number;future_plasticity?:number;future?:number;proof_strength?:number;evidence_weight?:number};
const clamp=(x:number,a:number,b:number)=>Number.isFinite(x)?Math.min(b,Math.max(a,x)):a;
const wrap12=(x:number)=>((Math.trunc(x)-1)%12+12)%12+1;
export function nodeIdR666(d:number,p:number,r:number,l:number){return 'node_'+String((((wrap12(d)-1)*12+(wrap12(p)-1))*12+(wrap12(r)-1))*12+wrap12(l)).padStart(6,'0')}
export function normalizeAddressR666(input:Partial<AddressR666>={}):AddressR666{const d=wrap12(input.d??1),p=wrap12(input.p??1),r=wrap12(input.r??1),l=wrap12(input.l??1);return{d,p,r,l,node_id:nodeIdR666(d,p,r,l)}}
export function reanchorR666(input:Partial<AddressR666>,delta:Partial<Record<'d'|'p'|'r'|'l',number>>){const a=normalizeAddressR666(input);return normalizeAddressR666({d:a.d+clamp(delta.d??0,-12,12),p:a.p+clamp(delta.p??0,-12,12),r:a.r+clamp(delta.r??0,-12,12),l:a.l+clamp(delta.l??0,-12,12)})}
export const SCALES_R666=['SUBATOMIC','ATOMIC','MOLECULAR','CELLULAR','ORGAN','HUMAN','LOCAL','CITY','EARTH','PLANETARY','STELLAR','COSMIC'] as const;
export function scaleBlendR666(scale:string){const i=SCALES_R666.indexOf(scale.toUpperCase() as typeof SCALES_R666[number]);return (i<0?8:i)/11}
export function motionDecisionR666(m:MotionR666){const C=clamp(m.continuity??.68,0,1),B=clamp(m.burden??m.ledger??.31,0,1),q=clamp(m.contradiction??.24,0,1),F=clamp(m.future_plasticity??m.future??.64,0,1);const ratio=C*Math.max(F,.05)/Math.max(q+B,1e-6);return{ratio,decision:ratio>=.92?'STAY' as const:ratio>=.46?'TURN' as const:'ESCALATE' as const,modelDerived:true as const}}
export type ObserverR666={address:AddressR666;mode:'FIRST_PERSON'|'FLY'|'SHELL_FOLLOW'|'HOST_FOLLOW'|'PROOF_FOLLOW'|'ORBIT';position:[number,number,number];velocity:[number,number,number];yaw:number;pitch:number;scale:string;revision:number};
export function defaultObserverR666():ObserverR666{return{address:normalizeAddressR666(),mode:'FIRST_PERSON',position:[0,1.65,5.8],velocity:[0,0,0],yaw:0,pitch:-.08,scale:'EARTH',revision:0}}
export function stepObserverR666(state:ObserverR666,input:{forward?:number;strafe?:number;vertical?:number;dt:number;speed?:number;yawDelta?:number;pitchDelta?:number;reanchor?:Partial<Record<'d'|'p'|'r'|'l',number>>}):ObserverR666{
 const dt=clamp(input.dt,0,.1),speed=clamp(input.speed??2.8,0,24),yaw=state.yaw+clamp(input.yawDelta??0,-1,1),pitch=clamp(state.pitch+(input.pitchDelta??0),-1.5358897418,1.5358897418);
 const f=clamp(input.forward??0,-1,1),s=clamp(input.strafe??0,-1,1),v=clamp(input.vertical??0,-1,1);
 const vx=(Math.sin(yaw)*f+Math.cos(yaw)*s)*speed, vz=(-Math.cos(yaw)*f+Math.sin(yaw)*s)*speed,vy=v*speed;
 const position:[number,number,number]=[state.position[0]+vx*dt,state.position[1]+vy*dt,state.position[2]+vz*dt];
 return{...state,yaw,pitch,velocity:[vx,vy,vz],position,address:input.reanchor?reanchorR666(state.address,input.reanchor):state.address,revision:state.revision+(input.reanchor?1:0)}
}
