import {OMEGA7_CAPABILITY_BY_ROUTE,type Omega7Capability} from '../capabilityRegistry';
import {OMEGA_COMPUTE_ENGINES_R845,type OmegaComputeRequestR845,type OmegaComputeResultR845,executeComputeR845} from './omegaComputeRouterR845';
import type {Mandala20736Field} from '../../src/mandala20736Runtime';
/** R846 maps real local executors to existing route authority without implying all 44 routes execute. */
export const OMEGA_EXECUTOR_ROUTES_R846=Object.freeze([
 {engine:'MODEL_FIELD',routes:['Atlas','Convergence','Traversal']},
 {engine:'OBSERVER_MOTION',routes:['Immersive Traversal','Matter Traversal','Extreme Traversal']}
] as const);
export type ExecutorAdmissionR846={engine:string;route:string;available:boolean;capabilityId:string|null;reason:string};
export function resolveExecutorR846(engine:string,route:string):ExecutorAdmissionR846{
 const definition=OMEGA_EXECUTOR_ROUTES_R846.find(x=>x.engine===engine);
 const cap=OMEGA7_CAPABILITY_BY_ROUTE.get(route as Omega7Capability['legacyRoute']);
 if(!definition||!definition.routes.some(x=>x===route))return {engine,route,available:false,capabilityId:cap?.id??null,reason:'NO_EXECUTOR_ROUTE_BINDING'};
 if(!cap)return {engine,route,available:false,capabilityId:null,reason:'UNKNOWN_CAPABILITY'};
 if(cap.availability==='OFFLINE'||cap.availability==='FAILED')return {engine,route,available:false,capabilityId:cap.id,reason:'CAPABILITY_NOT_AVAILABLE'};
 return {engine,route,available:true,capabilityId:cap.id,reason:'LOCAL_MODEL_EXECUTOR_ONLY'};
}
export function dispatchCapabilityComputeR846(field:Mandala20736Field,route:string,request:OmegaComputeRequestR845):{admission:ExecutorAdmissionR846;output:OmegaComputeResultR845}{
 const admission=resolveExecutorR846(request.engine,route);
 if(!admission.available)throw Error('Execution held: '+admission.reason);
 return {admission,output:executeComputeR845(field,request)};
}
export const OMEGA_EXECUTOR_COVERAGE_R846=Object.freeze({
 engines:OMEGA_COMPUTE_ENGINES_R845.length,
 boundRoutes:OMEGA_EXECUTOR_ROUTES_R846.flatMap(x=>x.routes).length,
 scope:'LOCAL_MODEL_ONLY',
 rule:'ROUTE_BINDING_IS_NOT_DEVICE_EXECUTION_OR_CANON_ADMISSION'
});
