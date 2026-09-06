import type {OperationActionR140} from './unifiedOperationFabricR140';

export const R142_SCHEMA='OMEGA_CAPABILITY_EXECUTION_RECEIPT_R142';
export const R142_REVISION='R142';
export const R142_LAWS=Object.freeze([
 'DISCOVERED_IS_NOT_AUTHORIZED',
 'AUTHORIZED_IS_NOT_AVAILABLE',
 'AVAILABLE_IS_NOT_INVOKED',
 'INVOKED_IS_NOT_RETURNED',
 'RETURNED_IS_NOT_VERIFIED',
 'REGISTERED_ROUTE_IS_NOT_EXECUTION_PROOF',
 'REGISTERED_PLUGIN_IS_NOT_REMOTE_PROVIDER_PROOF',
 'HYBRID_VERIFIED_REQUIRES_R141_EXACT_PAYLOAD_CLOSURE',
 'OUTPUT_CANNOT_MUTATE_CANONSTATE_WITHOUT_R125_ADMISSION',
 'FAILED_REJECTED_OR_STALE_EXECUTION_REMAINS_VISIBLE'
]);

export type CapabilityExecutionStateR142='DISCOVERED'|'AUTHORIZED'|'AVAILABLE'|'INVOKED'|'RETURNED'|'VERIFIED'|'UNAVAILABLE'|'FAILED'|'REJECTED'|'STALE';
export type CapabilityDomainR142='AI'|'SAI'|'PLUGIN'|'HYBRID'|'BUILD'|'PROOF'|'LOCAL'|'OPTICAL'|'RCWA';
export type CapabilityExecutionReceiptR142={
 schema:typeof R142_SCHEMA;revision:typeof R142_REVISION;receiptId:string;capabilityId:string;domain:CapabilityDomainR142;route:string|null;intent:string|null;state:CapabilityExecutionStateR142;
 authorized:boolean;available:boolean;invoked:boolean;returned:boolean;verified:boolean;startedAt:string|null;finishedAt:string|null;latencyMs:number|null;requestHash:string|null;responseHash:string|null;source:string;failureReason:string|null;freshUntil:string|null;proofRef:string|null;
 canonicalMutation:false;admissionAuthority:'R125';lineage:string[];truthBoundary:string;
};

const text=(x:any)=>typeof x==='string'?x.trim():'';
const iso=(x:any)=>{const t=Date.parse(text(x));return Number.isFinite(t)?new Date(t).toISOString():null};
const bool=(x:any)=>x===true;

export function deriveCapabilityExecutionStateR142(x:any):CapabilityExecutionStateR142{
 if(text(x?.failureReason))return x?.rejected===true?'REJECTED':'FAILED';
 const freshUntil=iso(x?.freshUntil);if(freshUntil&&Date.parse(freshUntil)<Date.now())return 'STALE';
 if(bool(x?.verified))return 'VERIFIED';
 if(bool(x?.returned))return 'RETURNED';
 if(bool(x?.invoked))return 'INVOKED';
 if(bool(x?.available))return 'AVAILABLE';
 if(bool(x?.authorized))return 'AUTHORIZED';
 return text(x?.capabilityId)?'DISCOVERED':'UNAVAILABLE';
}

export function normalizeCapabilityExecutionReceiptR142(x:any):CapabilityExecutionReceiptR142{
 const state=deriveCapabilityExecutionStateR142(x),startedAt=iso(x?.startedAt),finishedAt=iso(x?.finishedAt),latencyMs=startedAt&&finishedAt?Math.max(0,Date.parse(finishedAt)-Date.parse(startedAt)):null;
 const capabilityId=text(x?.capabilityId)||'unknown-capability';
 const domain=(['AI','SAI','PLUGIN','HYBRID','BUILD','PROOF','LOCAL','OPTICAL','RCWA'].includes(x?.domain)?x.domain:'LOCAL') as CapabilityDomainR142;
 return {schema:R142_SCHEMA,revision:R142_REVISION,receiptId:text(x?.receiptId)||`${domain.toLowerCase()}:${capabilityId}:${startedAt||'unstarted'}`,capabilityId,domain,route:text(x?.route)||null,intent:text(x?.intent)||null,state,
  authorized:bool(x?.authorized),available:bool(x?.available),invoked:bool(x?.invoked),returned:bool(x?.returned),verified:bool(x?.verified),startedAt,finishedAt,latencyMs,
  requestHash:text(x?.requestHash)||null,responseHash:text(x?.responseHash)||null,source:text(x?.source)||'runtime-unbound',failureReason:text(x?.failureReason)||null,freshUntil:iso(x?.freshUntil),proofRef:text(x?.proofRef)||null,
  canonicalMutation:false,admissionAuthority:'R125',lineage:Array.isArray(x?.lineage)?x.lineage.map(String):[],truthBoundary:'Discovery, authorization, availability, invocation, return and verification are distinct facts. Route readiness, configuration, registry presence and UI selection are never execution or provider proof.'};
}

export function operationRouteReceiptR142(action:OperationActionR140){
 const route=text(action?.route)||'unknown-route',execute=action?.kind==='EXECUTE',routeReady=action?.readiness==='ROUTE_READY';
 return normalizeCapabilityExecutionReceiptR142({capabilityId:`route:${route}`,domain:execute?'HYBRID':action?.kind==='BUILD'?'BUILD':action?.kind==='PROVE'?'PROOF':action?.kind==='INTELLIGENCE'?'AI':'LOCAL',route,
  authorized:routeReady,available:routeReady,source:'R139_REGISTERED_ROUTE_R140_PRIORITY',lineage:['R139_UNIFIED_CAPABILITY_ENGINE','R140_UNIFIED_OPERATION_FABRIC','R142_EXECUTION_RECEIPT'],
  failureReason:null});
}

export function pluginManifestReceiptR142(plugin:{id:string;entry:string;enabled:boolean;source:string}){
 const remote=/^(https?:|provider:|remote:|chatgpt:)/i.test(plugin.entry||'');
 return normalizeCapabilityExecutionReceiptR142({capabilityId:plugin.id,domain:'PLUGIN',route:'Plugins',authorized:plugin.enabled===true,available:plugin.enabled===true&&!remote,source:`plugin-registry:${plugin.source}`,
  lineage:['R45_PLUGIN_REGISTRY','R139_UNIFIED_CAPABILITY_ENGINE','R142_EXECUTION_RECEIPT']});
}

export function hybridClosureReceiptR142(closure:any):CapabilityExecutionReceiptR142{
 const verified=closure?.state==='VERIFIED_EXECUTION_RETURN'&&closure?.fingerprint?.verified===true&&closure?.fingerprint?.digestMatch!==false&&closure?.fingerprint?.semanticMatch!==false;
 const failed=Boolean(closure&&closure?.state&&closure.state!=='VERIFIED_EXECUTION_RETURN');
 const returned=Boolean(closure?.jobId&&closure?.fingerprint);
 return normalizeCapabilityExecutionReceiptR142({receiptId:closure?.jobId?`hybrid:${closure.jobId}`:'hybrid:unselected',capabilityId:'hybrid-host-execution',domain:'HYBRID',route:'Hybrid Link',authorized:true,available:Boolean(closure),invoked:Boolean(closure?.jobId),returned,verified,
  responseHash:closure?.fingerprint?.supplied||closure?.fingerprint?.expected||null,proofRef:closure?.finalHeadSha256||null,source:'R141_EXACT_PAYLOAD_PROOF_CLOSURE',failureReason:failed&&!verified?String(closure?.state||'HYBRID_CLOSURE_HELD'):null,
  lineage:['R132_HYBRID_EXECUTION_PLANE','R141_EXACT_PAYLOAD_CLOSURE','R134_SCAR_CONTINUITY','R136_LIVING_WORLD_FRAME','R140_OPERATION_WORLD_BRIDGE','R142_EXECUTION_RECEIPT']});
}

export function summarizeCapabilityReceiptsR142(rows:CapabilityExecutionReceiptR142[]){
 const names:CapabilityExecutionStateR142[]=['DISCOVERED','AUTHORIZED','AVAILABLE','INVOKED','RETURNED','VERIFIED','UNAVAILABLE','FAILED','REJECTED','STALE'];
 const states=Object.fromEntries(names.map(s=>[s,rows.filter(r=>r.state===s).length]));
 return {schema:'OMEGA_CAPABILITY_EXECUTION_SUMMARY_R142',total:rows.length,states,verified:states.VERIFIED||0,active:(states.AVAILABLE||0)+(states.INVOKED||0)+(states.RETURNED||0),held:(states.FAILED||0)+(states.REJECTED||0)+(states.STALE||0),canonicalMutation:false,admissionAuthority:'R125' as const};
}
