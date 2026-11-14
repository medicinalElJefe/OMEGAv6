import type {Mandala20736Field} from '../../src/mandala20736Runtime';
import {executeModelTaskR842,type OmegaTaskR842,type OmegaTaskResultR842} from './omegaModelTaskRuntimeR842';
import {defaultObserverR666,stepObserverR666,type ObserverR666} from './historicalObserverR666';
/** R845: explicit two-engine, read-only local computational dispatch.
 * Observer motion is an independent recovered engine; no device, Canon, or host authority.
 */
export type OmegaComputeRequestR845=
 |{engine:'MODEL_FIELD';task:OmegaTaskR842}
 |{engine:'OBSERVER_MOTION';task:{kind:'STEP_OBSERVER';observer:ObserverR666;input:Parameters<typeof stepObserverR666>[1]}};
export type OmegaComputeResultR845=
 |{engine:'MODEL_FIELD';result:OmegaTaskResultR842;authority:'MODEL_DERIVED'}
 |{engine:'OBSERVER_MOTION';result:ObserverR666;authority:'LOCAL_SIMULATION'};
export const OMEGA_COMPUTE_ENGINES_R845=Object.freeze([
 {id:'MODEL_FIELD',source:'COMPILED_20736_FIELD',authority:'MODEL_DERIVED'},
 {id:'OBSERVER_MOTION',source:'RECOVERED_R666_OBSERVER',authority:'LOCAL_SIMULATION'}
] as const);
function validObserver(o:ObserverR666){
 if(!o||!o.address||![o.address.d,o.address.p,o.address.r,o.address.l].every(n=>Number.isInteger(n)&&n>=1&&n<=12))throw Error('Invalid observer coordinates');
 if(!Array.isArray(o.position)||o.position.length!==3||!o.position.every(Number.isFinite))throw Error('Invalid observer position');
 if(!Array.isArray(o.velocity)||o.velocity.length!==3||!o.velocity.every(Number.isFinite))throw Error('Invalid observer velocity');
 if(!Number.isFinite(o.yaw)||!Number.isFinite(o.pitch)||!Number.isSafeInteger(o.revision)||o.revision<0)throw Error('Invalid observer state');
 if(!['FIRST_PERSON','FLY','SHELL_FOLLOW','HOST_FOLLOW','PROOF_FOLLOW','ORBIT'].includes(o.mode))throw Error('Invalid observer mode');
}
export function executeComputeR845(field:Mandala20736Field,request:OmegaComputeRequestR845):OmegaComputeResultR845{
 if(request.engine==='MODEL_FIELD')return {engine:'MODEL_FIELD',result:executeModelTaskR842(field,request.task),authority:'MODEL_DERIVED'};
 if(request.engine==='OBSERVER_MOTION'){
  if(request.task.kind!=='STEP_OBSERVER')throw Error('Unsupported observer task');
  const o=request.task.observer,input=request.task.input;
  validObserver(o);
  if(!input||!Number.isFinite(input.dt)||input.dt<0||input.dt>.1)throw RangeError('Observer dt must be 0..0.1');
  for(const key of ['forward','strafe','vertical','speed','yawDelta','pitchDelta'] as const){
   const n=input[key];if(n!==undefined&&!Number.isFinite(n))throw Error('Non-finite observer input');
  }
  const result=stepObserverR666({...o,address:{...o.address},position:[...o.position],velocity:[...o.velocity]},input);
  return {engine:'OBSERVER_MOTION',result,authority:'LOCAL_SIMULATION'};
 }
 throw Error('Unregistered compute engine');
}
export function defaultComputeObserverR845(){return defaultObserverR666()}
