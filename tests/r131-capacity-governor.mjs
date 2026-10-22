import assert from 'node:assert/strict';
import {capacityManifestR131,planCapacityR131,R131_LAWS} from '../src/system/capacityGovernorR131.js';
const m=capacityManifestR131();assert.equal(m.hierarchy.cells,1728);assert.equal(m.hierarchy.lanes,20736);assert.ok(R131_LAWS.includes('FULL_BODY_REQUIRES_EXPLICIT_AUTHORIZATION'));
const normal=planCapacityR131({requestedCells:144,health:1,failureRate:0,burden:0,providerBudget:99});assert.equal(normal.admittedCells,144);assert.equal(normal.providerBudget,12);assert.equal(normal.canonicalMutation,false);
const blocked=planCapacityR131({requestedCells:1728,health:1});assert.equal(blocked.scopeCap,288);assert.equal(blocked.fullBodyAuthorized,false);
const full=planCapacityR131({requestedCells:1728,allowFullBody:true,health:1,latencyClass:'BATCH'});assert.equal(full.scopeCap,1728);assert.equal(full.fullBodyAuthorized,true);assert.equal(full.logicalLanes,20736);
const degraded=planCapacityR131({requestedCells:288,health:.5,failureRate:.5,burden:.8});assert.equal(degraded.pressure,'BACKPRESSURE');assert.ok(degraded.admittedCells<288);assert.ok(degraded.concurrency>=1);
assert.match(m.truthBoundary,/does not prove 1,728 independent cloud deployments/i);
console.log('R131 capacity governor: PASS');
