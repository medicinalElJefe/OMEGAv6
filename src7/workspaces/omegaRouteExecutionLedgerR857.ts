import {OMEGA7_CAPABILITIES} from '../capabilityRegistry';
import {OMEGA_EXECUTOR_ROUTES_R846,resolveExecutorR846} from './omegaExecutorRegistryR846';

/** R857: conservative coverage census, not a claim that rendering or a route is execution proof. */
export type RouteExecutionRowR857={
 route:string;capabilityId:string;family:string;reality:string;availability:string;
 sourceBoundary:string;executorEngines:readonly string[];
 evidenceClass:'LOCAL_MODEL_BINDING_ONLY'|'EXTERNAL_OR_DEVICE_GATED'|'UNVERIFIED_ROUTE_EXECUTION';
 actualOutputProved:false;hostOutputProved:false;productionOutputProved:false;
};
export function routeExecutionLedgerR857():readonly RouteExecutionRowR857[]{
 return OMEGA7_CAPABILITIES.map(cap=>{
  const executorEngines=OMEGA_EXECUTOR_ROUTES_R846
   .filter(binding=>resolveExecutorR846(binding.engine,cap.legacyRoute).available)
   .map(binding=>binding.engine);
  const gated=cap.availability!=='READY'||['DEVICE_PROOF','PROVIDER_BOUND','EVIDENCE_BOUND'].includes(cap.sourceBoundary);
  return {
   route:cap.legacyRoute,capabilityId:cap.id,family:cap.family,
   reality:cap.reality,availability:cap.availability,sourceBoundary:cap.sourceBoundary,
   executorEngines,
   evidenceClass:executorEngines.length?'LOCAL_MODEL_BINDING_ONLY':gated?'EXTERNAL_OR_DEVICE_GATED':'UNVERIFIED_ROUTE_EXECUTION',
   actualOutputProved:false,hostOutputProved:false,productionOutputProved:false
  };
 });
}
export function routeExecutionSummaryR857(){
 const rows=routeExecutionLedgerR857();
 return {
  schema:'OMEGA_ROUTE_EXECUTION_CENSUS_R857' as const,
  totalRoutes:rows.length,
  localModelBound:rows.filter(r=>r.executorEngines.length>0).length,
  withoutLocalModelBinding:rows.filter(r=>!r.executorEngines.length).length,
  actualOutputProved:0,
  scope:'SOURCE_STATIC_CENSUS_ONLY' as const,
  rule:'NEVER_PROMOTE_ROUTE_RENDER_OR_BINDING_TO_EXECUTION_PROOF' as const
 };
}
export function routeExecutionCsvR857(){
 const rows=routeExecutionLedgerR857();
 const columns=['route','capabilityId','family','reality','availability','sourceBoundary','executorEngines','evidenceClass','actualOutputProved','hostOutputProved','productionOutputProved'] as const;
 const csv=(v:unknown)=>'"'+String(v).replace(/"/g,'""')+'"';
 return [columns.join(','),...rows.map(row=>columns.map(k=>csv(k==='executorEngines'?row[k].join('|'):row[k])).join(','))].join('\n');
}
