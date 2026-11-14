import type {Mandala20736Field} from '../../src/mandala20736Runtime';
import {dispatchCapabilityComputeR846,type ExecutorAdmissionR846} from './omegaExecutorRegistryR846';
import type {OmegaTaskResultR842} from './omegaModelTaskRuntimeR842';
/** R847: one bounded, deterministic result handoff across existing model executors.
 * Each step is re-admitted against its capability route. No privileged side effects.
 */
export type ModelPipelineR847={startAddress:number;limit:number;route:'Atlas'|'Convergence'|'Traversal'};
export type ModelPipelineResultR847={
 schema:'OMEGA_MODEL_PIPELINE_R847';authority:'MODEL_DERIVED';
 admission:ExecutorAdmissionR846;
 inspect:Extract<OmegaTaskResultR842,{kind:'INSPECT_MODEL_STATE'}>;
 trace:Extract<OmegaTaskResultR842,{kind:'TRACE_MODEL_SUCCESSORS'}>;
 export:{csv:string;rowCount:number};
};
function modelResult(result:ReturnType<typeof dispatchCapabilityComputeR846>['output']):OmegaTaskResultR842{
 if(result.engine!=='MODEL_FIELD')throw Error('Unexpected non-model result');
 return result.result;
}
export function executeModelPipelineR847(field:Mandala20736Field,request:ModelPipelineR847):ModelPipelineResultR847{
 if(!Number.isInteger(request.startAddress)||request.startAddress<0||request.startAddress>=20736)throw RangeError('Invalid pipeline address');
 if(!Number.isInteger(request.limit)||request.limit<1||request.limit>64)throw RangeError('Invalid pipeline limit');
 const inspectDispatch=dispatchCapabilityComputeR846(field,request.route,{engine:'MODEL_FIELD',task:{kind:'INSPECT_MODEL_STATE',address:request.startAddress}});
 const inspect=modelResult(inspectDispatch.output);
 if(inspect.kind!=='INSPECT_MODEL_STATE')throw Error('Inspect handoff failed');
 const trace=modelResult(dispatchCapabilityComputeR846(field,request.route,{engine:'MODEL_FIELD',task:{kind:'TRACE_MODEL_SUCCESSORS',address:inspect.address,limit:request.limit}}).output);
 if(trace.kind!=='TRACE_MODEL_SUCCESSORS'||trace.route[0]!==inspect.address)throw Error('Trace handoff failed');
 const exported=modelResult(dispatchCapabilityComputeR846(field,request.route,{engine:'MODEL_FIELD',task:{kind:'EXPORT_MODEL_TRACE',route:trace.route}}).output);
 if(exported.kind!=='EXPORT_MODEL_TRACE'||exported.rowCount!==trace.route.length||exported.csv!==trace.csv)throw Error('Export handoff failed');
 return {schema:'OMEGA_MODEL_PIPELINE_R847',authority:'MODEL_DERIVED',admission:inspectDispatch.admission,inspect,trace,export:{csv:exported.csv,rowCount:exported.rowCount}};
}
