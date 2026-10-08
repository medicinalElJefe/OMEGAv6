import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_CAPABILITIES,OMEGA7_DOMAINS,OMEGA7_START_MENU_R512} from '../src7/capabilityRegistry.ts';
import {R486_VISIBLE_CAPABILITIES} from '../src7/visibleCapabilityConvergenceR486.ts';
import {recoveredBindingR512,actionLabelR512,R512_RECOVERED_RUNTIME_LAWS} from '../src7/recoveredSoftwareRuntimeR512.ts';

const routes=new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute));
assert.deepEqual(OMEGA7_DOMAINS,['HOME','WORK','EXPLORE','CREATE','DEVELOP','SYSTEM']);
assert.equal(OMEGA7_START_MENU_R512.HOME.length,0);
for(const domain of ['WORK','EXPLORE','CREATE','DEVELOP','SYSTEM']){
 const groups=OMEGA7_START_MENU_R512[domain];
 assert.ok(groups.length>0,domain+' must expose a Start here menu');
 for(const group of groups){
  assert.ok(group.label&&group.copy&&group.routes.length>0,domain+' menu group malformed');
  for(const route of group.routes)assert.ok(routes.has(route),domain+' menu references unknown route '+route);
 }
}
assert.equal(new Set(OMEGA7_START_MENU_R512.EXPLORE.flatMap(x=>x.routes)).size,OMEGA7_START_MENU_R512.EXPLORE.flatMap(x=>x.routes).length,'Explore Start here routes must not duplicate');

for(const visible of R486_VISIBLE_CAPABILITIES){
 const binding=recoveredBindingR512(visible.id);
 assert.ok(binding,'visible recovered lineage has no R512 runtime binding '+visible.id);
 assert.equal(binding.route,visible.route);
 assert.equal(binding.operation,visible.operation);
 assert.ok(['Run current executor','Open working adapter','Open required evidence gate'].includes(actionLabelR512(binding.state)));
}
for(const law of [
 'HISTORICAL_SOFTWARE_LAUNCHES_CURRENT_EXECUTOR_NOT_SHADOW_BINARY',
 'R473_TYPED_EXECUTION_INTENT_IS_EMITTED_BEFORE_ROUTE_HANDOFF',
 'TRUTH_GATED_SOFTWARE_OPENS_THE_REAL_CURRENT_GATE_WITHOUT_FALSE_EXECUTION_CLAIM',
 'R142_REMAINS_EXECUTION_RECEIPT_AUTHORITY',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY',
])assert.ok(R512_RECOVERED_RUNTIME_LAWS.includes(law),law);

const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
for(const token of [
 'omega7StartMenuForDomainR512',
 "DEVELOP:'Build'",
 "data-r512-menu='TASK_FIRST'",
 'launchRecoveredSoftwareR512',
 'data-r512-executor={x.id}',
 'actionLabelR512(x.state)',
 'RECOVERED SOFTWARE ACTIVE',
])assert.ok(root.includes(token),'Omega7 R512 integration missing '+token);
assert.ok(!root.includes('<button onClick={()=>open(x.route)}>Open {x.route}</button>'),'recovered software must not remain route-only UI');

const css=fs.readFileSync('src7/omega7.css','utf8');
for(const token of ['R512 · TASK-FIRST MENU + RECOVERED EXECUTOR CONVERGENCE','.o7-start-menu','.o7-recovered-operation','button[data-r512-executor]'])assert.ok(css.includes(token),'R512 CSS missing '+token);

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
assert.ok(ci.includes('r512-menu-runtime-browser-e2e.mjs'),'R512 browser proof must be wired into CI and deployment');

console.log('R512 MENU + RECOVERED SOFTWARE SOURCE PASS · task-first menu hierarchy · all recovered lineages bind to current executors · route-only fake execution removed');
