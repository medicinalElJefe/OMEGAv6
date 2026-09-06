export const R141_SCHEMA='OMEGA_CAPABILITY_EXECUTION_RECEIPT_R141';
export const R141_REVISION='R141.1';
export const R141_LAWS=Object.freeze([
 'DISCOVERED_IS_NOT_AUTHORIZED','AUTHORIZED_IS_NOT_AVAILABLE','AVAILABLE_IS_NOT_INVOKED','INVOKED_IS_NOT_RETURNED','RETURNED_IS_NOT_VERIFIED','REGISTERED_PLUGIN_IS_NOT_REMOTE_PROVIDER_PROOF','OUTPUT_CANNOT_MUTATE_CANONSTATE_WITHOUT_ADMISSION','FAILED_OR_STALE_EXECUTION_REMAINS_VISIBLE'
]);
export type CapabilityExecutionStateR141='DISCOVERED'|'AUTHORIZED'|'AVAILABLE'|'INVOKED'|'RETURNED'|'VERIFIED'|'UNAVAILABLE'|'FAILED'|'REJECTED'|'STALE';
export type CapabilityDomainR141='AI'|'SAI'|'PLUGIN'|'HYBRID'|'BUILD'|'PROOF'|'LOCAL';
export type CapabilityExecutionReceiptR141={schema:typeof R141_SCHEMA;revision:typeof R141_REVISION;receiptId:string;capabilityId:string;domain:CapabilityDomainR141;route:string|null;intent:string|null;state:CapabilityExecutionStateR141;authorized:boolean;available:boolean;invoked:boolean;returned:boolean;verified:boolean;startedAt:string|null;finishedAt:string|null;latencyMs:number|null;requestHash:string|null;responseHash:string|null;source:string;failureReason:string|null;freshUntil:string|null;proofRef:string|null;canonicalMutation:false;admissionAuthority:'R125';lineage:string[];truthBoundary:string};
const text=(x:any)=>typeof x==='string'?x.trim():'';
const iso=(x:any)=>{const t=Date.parse(text(x));return Number.isFinite(t)?new Date(t).toISOString():null};
export function deriveCapabilityExecutionStateR141(x:any):CapabilityExecutionStateR141{
 if(text(x?.failureReason))return 'FAILED';
 const freshUntil=iso(x?.freshUntil);if(freshUntil&&Date.parse(freshUntil)<Date.now())return 'STALE';
 if(x?.verified===true)return 'VERIFIED';if(x?.returned===true)return 'RETURNED';if(x?.invoked===true)return 'INVOKED';if(x?.available===true)return 'AVAILABLE';if(x?.authorized===true)return 'AUTHORIZED';return text(x?.capabilityId)?'DISCOVERED':'UNAVAILABLE';
}
export function normalizeCapabilityExecutionReceiptR141(x:any):CapabilityExecutionReceiptR141{
 const state=deriveCapabilityExecutionStateR141(x),startedAt=iso(x?.startedAt),finishedAt=iso(x?.finishedAt),latencyMs=startedAt&&finishedAt?Math.max(0,Date.parse(finishedAt)-Date.parse(startedAt)):null;
 const capabilityId=text(x?.capabilityId)||'unknown-capability',domain=(['AI','SAI','PLUGIN','HYBRID','BUILD','PROOF','LOCAL'].includes(x?.domain)?x.domain:'LOCAL') as CapabilityDomainR141;
 return{schema:R141_SCHEMA,revision:R141_REVISION,receiptId:text(x?.receiptId)||`${domain.toLowerCase()}:${capabilityId}:${startedAt||'unstarted'}`,capabilityId,domain,route:text(x?.route)||null,intent:text(x?.intent)||null,state,authorized:x?.authorized===true,available:x?.available===true,invoked:x?.invoked===true,returned:x?.returned===true,verified:x?.verified===true,startedAt,finishedAt,latencyMs,requestHash:text(x?.requestHash)||null,responseHash:text(x?.responseHash)||null,source:text(x?.source)||'runtime-unbound',failureReason:text(x?.failureReason)||null,freshUntil:iso(x?.freshUntil),proofRef:text(x?.proofRef)||null,canonicalMutation:false,admissionAuthority:'R125',lineage:Array.isArray(x?.lineage)?x.lineage.map(String):[],truthBoundary:'Discovery, authorization, availability, invocation, return and verification are distinct facts. Configuration or registry presence alone is never provider execution proof.'};
}
export function pluginManifestReceiptR141(plugin:{id:string;entry:string;enabled:boolean;source:string}){
 const remote=/^(https?:|provider:|remote:|chatgpt:)/i.test(plugin.entry||'');
 return normalizeCapabilityExecutionReceiptR141({capabilityId:plugin.id,domain:'PLUGIN',route:'Plugins',authorized:plugin.enabled===true,available:plugin.enabled===true&&!remote,source:`plugin-registry:${plugin.source}`,lineage:['R45_PLUGIN_REGISTRY','R139_UNIFIED_CAPABILITY_ENGINE','R141_EXECUTION_RECEIPT']});
}
export function summarizeCapabilityReceiptsR141(rows:CapabilityExecutionReceiptR141[]){const states=Object.fromEntries(['DISCOVERED','AUTHORIZED','AVAILABLE','INVOKED','RETURNED','VERIFIED','UNAVAILABLE','FAILED','REJECTED','STALE'].map(s=>[s,rows.filter(r=>r.state===s).length]));return{schema:'OMEGA_CAPABILITY_EXECUTION_SUMMARY_R141',total:rows.length,states,verified:states.VERIFIED||0,failed:(states.FAILED||0)+(states.REJECTED||0)+(states.STALE||0),canonicalMutation:false,admissionAuthority:'R125'}}
