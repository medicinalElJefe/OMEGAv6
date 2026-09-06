import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R142 '+m);
const receipts=read('src/capabilityExecutionReceiptsR142.ts');
const field=read('src/OmegaCapabilityFieldR138.tsx');
const plugins=read('src/PluginRegistryR45.tsx');
const hybrid=read('src/HybridProofClosureR141.tsx');
const r140=read('src/unifiedOperationFabricR140.ts');
const r141=read('src/hybridProofClosureR141.js');

for(const law of ['DISCOVERED_IS_NOT_AUTHORIZED','AUTHORIZED_IS_NOT_AVAILABLE','AVAILABLE_IS_NOT_INVOKED','INVOKED_IS_NOT_RETURNED','RETURNED_IS_NOT_VERIFIED','REGISTERED_ROUTE_IS_NOT_EXECUTION_PROOF','REGISTERED_PLUGIN_IS_NOT_REMOTE_PROVIDER_PROOF','HYBRID_VERIFIED_REQUIRES_R141_EXACT_PAYLOAD_CLOSURE','OUTPUT_CANNOT_MUTATE_CANONSTATE_WITHOUT_R125_ADMISSION'])must(receipts.includes(law),'execution law missing '+law);
for(const state of ['DISCOVERED','AUTHORIZED','AVAILABLE','INVOKED','RETURNED','VERIFIED','UNAVAILABLE','FAILED','REJECTED','STALE'])must(receipts.includes(`'${state}'`),'lifecycle state missing '+state);
must(receipts.includes("action?.readiness==='ROUTE_READY'"),'route availability must derive from R140 readiness');
must(receipts.includes("action?.kind==='EXECUTE'"),'Hybrid/execute route must be treated separately');
must(receipts.includes("closure?.state==='VERIFIED_EXECUTION_RETURN'")&&receipts.includes('fingerprint?.verified===true')&&receipts.includes('digestMatch')&&receipts.includes('semanticMatch'),'Hybrid VERIFIED must require R141 exact-payload proof conditions');
must(receipts.includes("admissionAuthority:'R125'")&&receipts.includes('canonicalMutation:false'),'receipt fabric must preserve R125 admission and no mutation');
must(r140.includes("'HYBRID_EXECUTION_REQUIRES_CURRENT_DEVICE_PROOF'")&&r140.includes("action.kind==='EXECUTE'?'DEVICE_PROOF_REQUIRED':'ROUTE_READY'"),'R140 device proof boundary must remain intact');

for(const token of ["data-execution-lifecycle='R142'",'operationRouteReceiptR142','summarizeCapabilityReceiptsR142','ROUTE ≠ EXECUTION ≠ ADMISSION','route verified'])must(field.includes(token),'capability topology missing '+token);
must(field.includes('data-execution-state={n.executionState')&&field.includes('data-execution-state={action.executionState'),'spatial and detailed controls must expose lifecycle state');

for(const token of ['pluginManifestReceiptR142','summarizeCapabilityReceiptsR142',"a.download='OMEGA_PLUGIN_REGISTRY_R45.json'",'does not embed external ChatGPT connectors','enabled or configured never means executed or verified'])must(plugins.includes(token),'plugin execution truth/compatibility missing '+token);
must(plugins.includes("data-execution-receipts='R142'")&&plugins.includes('data-execution-state={receipt.state}'),'plugin registry must display lifecycle receipts');

for(const token of ['hybridClosureReceiptR142',"data-execution-lifecycle='R142'",'R141 remains the exact-payload Hybrid proof authority','RETURNED is not VERIFIED',"data-r142-state={executionReceipt?.state")must(hybrid.includes(token),'Hybrid closure UI missing '+token);
must(r141.includes('VERIFIED_EXECUTION_RETURN')&&r141.includes('FINGERPRINT_MISMATCH'),'R141 proof closure semantics must remain the source authority');

console.log('R142 PROOF-AWARE CAPABILITY LIFECYCLE PASS · route/plugin/Hybrid truth separated · R141 exact proof retained · R140 priority retained · R125 admission unchanged');
