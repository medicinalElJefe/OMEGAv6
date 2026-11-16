import assert from 'node:assert/strict';
import {test} from 'node:test';
import {OMEGA7_CAPABILITIES} from '../src7/capabilityRegistry.ts';
import {routeExecutionLedgerR857,routeExecutionSummaryR857,routeExecutionCsvR857} from '../src7/workspaces/omegaRouteExecutionLedgerR857.ts';

test('every inherited route has exactly one conservative ledger row',()=>{
 const rows=routeExecutionLedgerR857();
 assert.equal(rows.length,44);
 assert.equal(rows.length,OMEGA7_CAPABILITIES.length);
 assert.equal(new Set(rows.map(x=>x.route)).size,44);
 assert.deepEqual(rows.map(x=>x.route),OMEGA7_CAPABILITIES.map(x=>x.legacyRoute));
 assert.ok(rows.every(x=>x.actualOutputProved===false&&x.hostOutputProved===false&&x.productionOutputProved===false));
});
test('six local bindings are not promoted to 44 route execution claims',()=>{
 const rows=routeExecutionLedgerR857(),summary=routeExecutionSummaryR857();
 assert.equal(summary.totalRoutes,44);
 assert.equal(summary.localModelBound,6);
 assert.equal(summary.withoutLocalModelBinding,38);
 assert.equal(summary.actualOutputProved,0);
 assert.equal(rows.find(x=>x.route==='Hybrid Link')?.executorEngines.length,0);
 assert.equal(rows.find(x=>x.route==='Atlas')?.evidenceClass,'LOCAL_MODEL_BINDING_ONLY');
 assert.equal(rows.find(x=>x.route==='Hybrid Link')?.evidenceClass,'EXTERNAL_OR_DEVICE_GATED');
});
test('portable census CSV retains all route rows without declaring proof',()=>{
 const csv=routeExecutionCsvR857();
 assert.equal(csv.split('\n').length,45);
 assert.match(csv,/Hybrid Link/);
 assert.match(csv,/LOCAL_MODEL_BINDING_ONLY/);
 assert.match(csv,/actualOutputProved/);
});
