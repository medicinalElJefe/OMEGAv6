import assert from 'node:assert/strict';
import fs from 'node:fs';

const nav=fs.readFileSync('src/navigationRegistry.ts','utf8');
const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const backlog=fs.readFileSync('src/system/convergenceBacklogR388.js','utf8');

const quoted=list=>[...list.matchAll(/'([^']+)'/g)].map(m=>m[1]);
const navBlock=nav.slice(nav.indexOf('export const OMEGA_NAVIGATION=['),nav.indexOf('] as const satisfies readonly OmegaNavItem[];'));
const routeNames=[...navBlock.matchAll(/name:'([^']+)'/g)].map(m=>m[1]);
assert.equal(routeNames.length,new Set(routeNames).size,'R466 requires unique canonical route names');

const mapStart=nav.indexOf('export const OMEGA_MASTER_MENU_ROUTE_MAP_R289');
const mapEnd=nav.indexOf('};',mapStart);
const mapped=[...nav.slice(mapStart,mapEnd).matchAll(/'([^']+)':/g)].map(m=>m[1]);
assert.deepEqual([...mapped].sort(),[...routeNames].sort(),'R466 requires every canonical route to have exactly one recovered master-menu owner');

const setValues=name=>{
 const start=workstation.indexOf(name);
 assert.ok(start>=0,'missing '+name);
 const open=workstation.indexOf('[',start),close=workstation.indexOf(']',open);
 return quoted(workstation.slice(open,close+1));
};
const mounts=[
 ...setValues('const SPECIALIST_EXISTING=new Set<Panel>'),
 ...setValues('const SPECIALIST_SUITE=new Set<Panel>'),
 ...setValues('const DIRECT_WORKSTATION_SURFACES_R466=new Set<Panel>')
];
assert.equal(mounts.length,routeNames.length,'R466 workstation mount inventory must equal canonical route inventory');
assert.equal(new Set(mounts).size,mounts.length,'R466 requires exactly one workstation mount family per route');
assert.deepEqual([...mounts].sort(),[...routeNames].sort(),'R466 requires every registered control to be mounted and no hidden unreachable route');

for(const token of [
 'OMEGA_CONTROL_RECONCILIATION_R466',
 'duplicateRouteAuthorities',
 'hiddenUnreachableRoutes',
 'ONE_REGISTERED_ROUTE_IDENTITY_ONE_DECLARED_AUTHORITY_ONE_REACHABLE_MASTER_MENU_OWNER'
])assert.ok(nav.includes(token),'navigation reconciliation missing '+token);

for(const token of [
 'OMEGA_WORKSTATION_CONTROL_AUDIT_R466',
 'OMEGA_WORKSTATION_CONTROL_SUMMARY_R466',
 'mountedExactlyOnce',
 'omegaMasterMenuForRouteR289',
 'OMEGA_ALL_ROUTES_R82',
 'operationContractForRouteR143',
 'capabilityExecutionContract',
 'canonicalMutation:false',
 'RECOVER_EVERY_REGISTERED_CONTROL_WITH_EXACTLY_ONE_MOUNT_AND_NO_SHADOW_ROUTE_AUTHORITY'
])assert.ok(workstation.includes(token),'workstation reconciliation missing '+token);

assert.ok(nav.includes("name:'Forecast',hint:'Frozen-prior, bounded future-state corridors with uncertainty and no future leakage.',effect:'COMPUTE',authority:'DERIVED'"),'Forecast must remain derived future projection authority');
assert.ok(!nav.includes("name:'Forecast',hint:'Frozen-prior, bounded future-state corridors with uncertainty and no future leakage.',effect:'COMPUTE',authority:'CANONICAL'"),'R466 must reject canonical-authority inflation of Forecast');

for(const token of ["'B-03':Object.freeze","revision:'R466'","minFiles:2","OMEGA_CONTROL_RECONCILIATION_R466","OMEGA_WORKSTATION_CONTROL_AUDIT_R466"])assert.ok(backlog.includes(token),'B-03 acceptance contract missing '+token);

console.log('R466 CONTROL RECONCILIATION PASS · all canonical controls map to exactly one master-menu owner and exactly one workstation mount · zero duplicate route authority · zero hidden unreachable route · Forecast remains DERIVED');
