export const R165_REVISION='R165';
export const R165_SCHEMA='OMEGA_DURABLE_RUNTIME_STORAGE_ADAPTER_R165';
export const R165_LAWS=Object.freeze([
 'ONE_EXISTING_OMEGA_RUNTIME_STORAGE_AUTHORITY',
 'CLOUDFLARE_DURABLE_OBJECT_CTX_STORAGE_IS_PRIMARY_RUNTIME_SHAPE',
 'LEGACY_TEST_STATE_STORAGE_REMAINS_COMPATIBLE',
 'NO_SECOND_DATABASE_OR_SHADOW_DURABLE_OBJECT',
 'R146_HASH_CHAIN_SEMANTICS_UNCHANGED',
 'R164_REFLEX_SWARM_LINKAGE_USES_THE_SAME_DURABLE_RUNTIME_STORAGE',
 'STORAGE_COMPATIBILITY_DOES_NOT_CREATE_EXECUTION_PROOF',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

function usable(storage){return Boolean(storage&&typeof storage.get==='function'&&typeof storage.put==='function')}

export function runtimeStorageR165(runtime){
 const ctxStorage=runtime?.ctx?.storage;
 if(usable(ctxStorage))return ctxStorage;
 const stateStorage=runtime&&typeof runtime.state==='object'?runtime.state?.storage:null;
 if(usable(stateStorage))return stateStorage;
 const direct=runtime?.storage;
 if(usable(direct))return direct;
 throw new Error('R165_DURABLE_STORAGE_UNAVAILABLE');
}

export function runtimeStorageShapeR165(runtime){
 const ctx=usable(runtime?.ctx?.storage),legacy=Boolean(runtime&&typeof runtime.state==='object'&&usable(runtime.state?.storage)),direct=usable(runtime?.storage);
 return{schema:'OMEGA_DURABLE_RUNTIME_STORAGE_SHAPE_R165',revision:R165_REVISION,ctxStorage:ctx,legacyStateStorage:legacy,directStorage:direct,selected:ctx?'CTX_STORAGE':legacy?'LEGACY_STATE_STORAGE':direct?'DIRECT_STORAGE':'UNAVAILABLE',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
}

export function manifestR165(){return{ok:true,schema:R165_SCHEMA,revision:R165_REVISION,laws:R165_LAWS,primaryShape:'runtime.ctx.storage',compatibilityShapes:['runtime.state.storage','runtime.storage'],consumers:['R146_DURABLE_OPERATION_EXECUTION','R161_REFLEX_MISSION_HANDOFF','R162_GOVERNED_REFLEX_EXECUTION','R164_REFLEX_AUTONOMIC_SWARM'],newStorageAuthority:false,newDurableObject:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R165 repairs the storage-shape seam between the real Cloudflare OmegaRuntime constructor (ctx.storage) and execution modules originally written against test-style state.storage. It changes storage access only; it does not change R146 lifecycle/proof semantics, authorize execution, create swarm truth, or admit CanonState.'}}
