export const R168_STORAGE_REVISION='R168';
export const R168_STORAGE_SCHEMA='OMEGA_RUNTIME_STORAGE_COMPATIBILITY_R168';
export const R168_STORAGE_LAWS=Object.freeze([
 'ONE_EXISTING_OMEGA_RUNTIME_STORAGE_AUTHORITY',
 'CLOUDFLARE_DURABLE_OBJECT_CTX_STORAGE_IS_PRIMARY_RUNTIME_SHAPE',
 'LEGACY_TEST_STATE_STORAGE_IS_COMPATIBILITY_ONLY',
 'NO_SECOND_DATABASE_OR_SHADOW_DURABLE_OBJECT',
 'R146_HASH_CHAIN_SEMANTICS_UNCHANGED',
 'R164_REFLEX_SWARM_LINKAGE_USES_THE_SAME_DURABLE_RUNTIME_STORAGE',
 'STORAGE_COMPATIBILITY_DOES_NOT_CREATE_EXECUTION_PROOF',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);
const usable=s=>Boolean(s&&typeof s.get==='function'&&typeof s.put==='function');
export function runtimeStorageR168(runtime){
 if(usable(runtime?.ctx?.storage))return runtime.ctx.storage;
 if(usable(runtime?.state?.storage))return runtime.state.storage;
 if(usable(runtime?.storage))return runtime.storage;
 throw new Error('R168_DURABLE_STORAGE_UNAVAILABLE');
}
export function runtimeStorageShapeR168(runtime){
 const ctx=usable(runtime?.ctx?.storage),legacy=usable(runtime?.state?.storage),direct=usable(runtime?.storage);
 return{schema:R168_STORAGE_SCHEMA,revision:R168_STORAGE_REVISION,ctxStorage:ctx,legacyStateStorage:legacy,directStorage:direct,selected:ctx?'CTX_STORAGE':legacy?'LEGACY_STATE_STORAGE':direct?'DIRECT_STORAGE':'UNAVAILABLE',newStorageAuthority:false,newDurableObject:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
}
export function manifestRuntimeStorageR168(){return{ok:true,schema:R168_STORAGE_SCHEMA,revision:R168_STORAGE_REVISION,primaryShape:'runtime.ctx.storage',compatibilityShapes:['runtime.state.storage','runtime.storage'],consumers:['R146 durable execution history','R161/R162 reflex execution chain','R164 reflex→autonomic linkage'],newStorageAuthority:false,newDurableObject:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R168 closes the storage-shape seam between the real Cloudflare OmegaRuntime constructor and modules originally tested against state.storage. It changes storage access only; it does not alter lifecycle, authorization, proof, external execution or CanonState semantics.'}}
