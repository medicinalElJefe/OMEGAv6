import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R143 '+msg);
const registry=read('src/omegaExperienceRegistryR82.ts');
const chain=read('src/authoritativeOperationChainR143.ts');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const field=read('src/OmegaCapabilityFieldR138.tsx');
const r142=read('src/capabilityExecutionReceiptsR142.ts');
const routes=[...registry.matchAll(/routes:\[([^\]]*)\]/g)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));

must(routes.length>0,'must retain a non-empty registered route inventory');
must(new Set(routes).size===routes.length,'registered route inventory must remain unique');
must(chain.includes("export const R143_SCHEMA='OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143'"),'operation-chain schema missing');
for(const law of ['ONE_REGISTERED_ROUTE_ONE_OPERATION_CONTRACT','UI_CONTROL_REQUIRES_REGISTERED_ROUTE','REGISTERED_ROUTE_REQUIRES_CAPABILITY_ID','CAPABILITY_ID_REQUIRES_EXECUTION_DOMAIN','ROUTE_READINESS_IS_NOT_INVOCATION','UI_SELECTION_IS_NOT_EXECUTION_PROOF','R142_RECEIPTS_REMAIN_EXECUTION_TRUTH_AUTHORITY','R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY','NO_ORPHAN_ROUTE_NO_SHADOW_CAPABILITY_NO_SILENT_DEAD_CONTROL'])must(chain.includes(law),`law missing: ${law}`);
must(chain.includes('OMEGA_ALL_ROUTES_R82.map(buildRouteOperationContractR143)'),'every registered route must dynamically receive an R143 contract');
must(chain.includes('operationContractForRouteR143'),'single route lookup authority missing');
must(chain.includes("receiptAuthority:'R142'"),'R142 must remain execution-receipt authority');
must(chain.includes("admissionAuthority:'R125'"),'R125 must remain canonical admission authority');
must(chain.includes('orphanRoutes')&&chain.includes('duplicateRouteIds')&&chain.includes('duplicateCapabilityIds')&&chain.includes('incomplete'),'R143 audit must expose orphan/duplicate/incomplete residual classes');
must(!chain.includes('historicalR82Baseline:44'),'R143 operation authority must not freeze historical route count into architecture');

must(nav.includes("from './authoritativeOperationChainR143'"),'global navigator must consume R143 contracts');
for(const attr of ['data-operation-chain','data-operation-chain-pass','data-route-id','data-capability-id','data-execution-domain','data-execution-state'])must(nav.includes(attr),`navigator missing ${attr}`);
must(nav.includes('operationContractForRouteR143(route)'),'navigator rows must resolve through the authoritative route contract');
must(nav.includes('navigation never claims execution proof or R125 admission'),'navigator truth boundary missing');

must(field.includes("from './authoritativeOperationChainR143'"),'capability field must consume R143 contracts');
for(const attr of ['data-ui-operation-chain','data-operation-chain-pass','data-route-id','data-capability-id','data-execution-domain','data-execution-state'])must(field.includes(attr),`capability field missing ${attr}`);
must(field.includes('operationContractForRouteR143(x.route)'),'ranked capability actions must resolve through R143');
must(field.includes('PROJECTION ≠ ADMISSION · ROUTE ≠ EXECUTION'),'R139/R142 admission and execution boundary must remain visible');

for(const law of ['DISCOVERED_IS_NOT_AUTHORIZED','AVAILABLE_IS_NOT_INVOKED','RETURNED_IS_NOT_VERIFIED','REGISTERED_ROUTE_IS_NOT_EXECUTION_PROOF','OUTPUT_CANNOT_MUTATE_CANONSTATE_WITHOUT_R125_ADMISSION'])must(r142.includes(law),`R142 lifecycle boundary regressed: ${law}`);

console.log(JSON.stringify({schema:'OMEGA_R143_AUTHORITATIVE_UI_OPERATION_CHAIN_INVARIANTS',status:'PASS',registeredRoutes:routes.length,uniqueRoutes:new Set(routes).size,checks:'route-id → capability-id → execution-domain → R142 receipt authority with R125 admission preserved'},null,2));
