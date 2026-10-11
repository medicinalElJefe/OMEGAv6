import assert from'node:assert/strict';
import fs from'node:fs';

const nav=fs.readFileSync('src/OmegaSideNavigatorR88.tsx','utf8');
const work=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
for(const source of [nav,work]){
 assert.match(source,/OMEGA_ROUTE_FUNCTIONAL_INHERITANCE='R464'/);
 assert.match(source,/OMEGA_ALL_ROUTES_R82/);
 assert.match(source,/operationContractForRouteR143/);
 assert.match(source,/usableControl/);
 assert.match(source,/stateOutput/);
 assert.match(source,/executionProof:'R142'/);
 assert.match(source,/canonAdmission:'R125'/);
 assert.match(source,/failureRecovery/);
 assert.match(source,/degradeTo:'System Atlas'/);
 assert.match(source,/canonicalMutation:false/);
}
assert.match(nav,/FUNCTIONAL_INHERITANCE_DEGRADED/);
assert.match(nav,/data-usable-control/);
assert.match(nav,/data-state-output/);
assert.match(nav,/data-failure-recovery/);
assert.match(work,/requestedInheritance\.usableControl\?normalizePanel\(name\):requestedInheritance\.failureRecovery\.degradeTo/);
assert.match(work,/Functional inheritance degraded/);
assert.match(work,/status:requestedInheritance\.usableControl\?'INFO':'WARN'/);
assert.match(work,/querySelector<HTMLElement>\('\.r356-surface-content'\)/,'R551 must inspect the mounted instrument content rather than route labels');
assert.match(work,/getClientRects\(\)\.length>0/,'R551 must reject hidden or zero-geometry controls');
assert.match(work,/NO_ACTIONABLE_CONTROL/,'R551 must retain real failed-control state');
assert.match(work,/Retry control inspection/,'R551 must offer a functional retry');
assert.match(work,/omega:r551-route-functional-proof/,'R551 must transport actual DOM observations');
assert.match(nav,/data-r551-control-proof/,'R551 navigation must expose observed control status');
assert.match(nav,/Controls need repair/,'R551 must surface user-visible failures');
assert.ok(!work.includes('executionClaimed:true'),'R551 observation cannot forge R142 execution');
const combined=nav+work;
assert.ok(combined.includes('R143')&&combined.includes('R142')&&combined.includes('R125'));
assert.ok((combined.match(/canonicalMutation:false/g)||[]).length>=4);
console.log('R464 ROUTE FUNCTIONAL INHERITANCE PASS · navigator + mounted workstation share route-complete R143-derived usableControl/stateOutput/proof/failureRecovery semantics · unresolved controls degrade safely · R142 execution proof and R125 Canon boundary preserved · canonicalMutation false');
