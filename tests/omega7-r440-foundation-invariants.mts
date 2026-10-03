import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_NATIVE_ROUTES,isOmega7NativeRoute} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const traversal=fs.readFileSync('src7/workspaces/TraversalWorkspaceR440.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

assert.deepEqual([...OMEGA7_NATIVE_ROUTES],['Command Center','Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal']);
for(const route of ['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'])assert.equal(isOmega7NativeRoute(route),true,route+' must remain native in R440');
assert.equal(isOmega7NativeRoute('Forecast'),false,'R440 must not silently promote unrelated families');
assert.ok(native.includes("lazy(()=>import('./workspaces/TraversalWorkspaceR440'))"),'traversal family must lazy-load as one bounded family slice');
for(const token of ['MatterTraversalR36','TraversalR36','ExtremeTraversalUnionR60','initCorpusPack','corpusState','decodeAddress'])assert.ok(traversal.includes(token),'native traversal workspace missing accepted engine/runtime token '+token);
assert.ok(traversal.includes("localStorage.getItem('omega.v6.address'")&&traversal.includes("localStorage.setItem('omega.v6.address'"),'R440 must preserve the accepted canonical address lineage');
assert.ok(traversal.includes("window.dispatchEvent(new CustomEvent('omega7-address-changed'"),'native traversal address changes must remain observable without a second state store');
assert.ok(traversal.includes('onNavigate={onNavigate}'),'accepted capability navigation must stay routed through OMEGA7 shell authority');

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
for(const route of ['Command Center','Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'])assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute===route)?.migration,'ADAPTED',route+' must be adapted rather than retired');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false,'no legacy capability may retire before parity+rollback proof');

assert.equal(lock.sourceMainSha,'5cd83e9e9237ca6b2ef88dc2f19588192c1ceb68');
assert.equal(lock.sourceMilestone,'R439');
assert.deepEqual(lock.nativeFamilies,['COMMAND_RUNTIME','EARTH_WEATHER','MOTION_TRAVERSAL']);
assert.equal(lock.registeredRouteCount,44);
assert.equal(lock.physicalDimensionClaim,false);

console.log('OMEGA7 R440 PASS · Ask + Earth + motion/traversal native · shared canonical address lineage · 44/44 inheritance · zero legacy retirement');
