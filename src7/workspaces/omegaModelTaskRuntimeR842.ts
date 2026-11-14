import type {Mandala20736Field} from '../../src/mandala20736Runtime';
import {motionDecisionR666,nodeIdR666} from './historicalObserverR666';
import {exportTraversalCsvR838} from './historicalTraversalExportR838';
import {addressToCoordinatesR841} from './historicalAddressBusR841';

/** Read-only, deterministic task dispatch over an already compiled source field.
 * These are model-derived results, not external execution, R142 receipts, or Canon admission.
 */
export type OmegaTaskR842=
 |{kind:'INSPECT_MODEL_STATE';address:number}
 |{kind:'TRACE_MODEL_SUCCESSORS';address:number;limit:number}
 |{kind:'EXPORT_MODEL_TRACE';route:readonly number[]};
export type OmegaTaskResultR842=
 |{kind:'INSPECT_MODEL_STATE';address:number;nodeId:string;coordinates:{d:number;p:number;r:number;l:number};next:number;metrics:{continuity:number;plasticity:number;contradiction:number;burden:number;scar:number;evidence:number};decision:'STAY'|'TURN'|'ESCALATE';ratio:number}
 |{kind:'TRACE_MODEL_SUCCESSORS';address:number;route:number[];termination:'CYCLE'|'LIMIT';csv:string}
 |{kind:'EXPORT_MODEL_TRACE';csv:string;rowCount:number};
export type OmegaTaskRecordR842={schema:'OMEGA_MODEL_TASK_R842';sequence:number;request:OmegaTaskR842;result:OmegaTaskResultR842;authority:'MODEL_DERIVED';source:'COMPILED_20736_FIELD'};
function validField(f:Mandala20736Field){if(f.count!==20736||f.routeNext.length!==20736)throw Error('Invalid compiled source field')}
function validAddress(n:number){addressToCoordinatesR841(n);return n}
export function executeModelTaskR842(f:Mandala20736Field,task:OmegaTaskR842):OmegaTaskResultR842{
 validField(f);
 if(task.kind==='INSPECT_MODEL_STATE'){
  const n=validAddress(task.address),c=addressToCoordinatesR841(n),next=validAddress(f.routeNext[n]);
  const metrics={continuity:f.C[n],plasticity:f.Phi[n],contradiction:f.q[n],burden:f.Lambda[n],scar:f.scar[n],evidence:f.evidence[n]};
  if(Object.values(metrics).some(x=>!Number.isFinite(x)))throw Error('Non-finite source metrics');
  const decision=motionDecisionR666({continuity:metrics.continuity,future_plasticity:metrics.plasticity,contradiction:metrics.contradiction,burden:metrics.burden});
  return {kind:task.kind,address:n,nodeId:nodeIdR666(c.d,c.p,c.r,c.l),coordinates:c,next,metrics,decision:decision.decision,ratio:decision.ratio};
 }
 if(task.kind==='TRACE_MODEL_SUCCESSORS'){
  let at=validAddress(task.address);
  if(!Number.isInteger(task.limit)||task.limit<1||task.limit>64)throw RangeError('Trace limit must be 1..64');
  const route:number[]=[],seen=new Set<number>();
  while(route.length<task.limit&&!seen.has(at)){
   seen.add(at);route.push(at);at=validAddress(f.routeNext[at]);
  }
  return {kind:task.kind,address:task.address,route,termination:seen.has(at)?'CYCLE':'LIMIT',csv:exportTraversalCsvR838(f,route)};
 }
 if(task.kind==='EXPORT_MODEL_TRACE'){
  return {kind:task.kind,csv:exportTraversalCsvR838(f,task.route),rowCount:task.route.length};
 }
 throw Error('Unknown task kind');
}
export function createModelTaskSessionR842(f:Mandala20736Field){
 const records:OmegaTaskRecordR842[]=[];
 return Object.freeze({
  execute(task:OmegaTaskR842){
   const result=executeModelTaskR842(f,task);
   const record:OmegaTaskRecordR842={schema:'OMEGA_MODEL_TASK_R842',sequence:records.length+1,request:task,result,authority:'MODEL_DERIVED',source:'COMPILED_20736_FIELD'};
   records.push(record);return record;
  },
  history(){return records.map(r=>({...r,request:{...r.request},result:{...r.result}})) as readonly OmegaTaskRecordR842[]}
 });
}
