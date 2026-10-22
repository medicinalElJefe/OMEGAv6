import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_NATIVE_ROUTES,isOmega7NativeRoute} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const traversal=fs.readFileSync('src7/workspaces/TraversalWorkspaceR440.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

for(const route of ['Command Center','Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'])assert.ok(OMEGA7_NATIVE_ROUTES.includes(route as any),route+' must remain in the native successor set');
for(const route of ['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'])assert.equal(isOmega7NativeRoute(route),true,route+' must remain native in R440');
assert.ok(['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'].every(route=>isOmega7NativeRoute(route)),'R440 traversal family must remain native in successors');
assert.ok(native.includes("lazy(()=>import('./workspaces/TraversalWorkspaceR440'))"),'traversal family must lazy-load as one bounded family slice');
for(const token of ['MatterTraversalR36','TraversalR36','ExtremeTraversalUnionR60','initCorpusPack','corpusState','decodeAddress'])assert.ok(traversal.includes(token),'native traversal workspace missing accepted engine/runtime token '+token);
assert.ok(traversal.includes("localStorage.getItem('omega.v6.address'")&&traversal.includes("localStorage.setItem('omega.v6.address'"),'R440 must preserve the accepted canonical address lineage');
assert.ok(traversal.includes("window.dispatchEvent(new CustomEvent('omega7-address-changed'"),'native traversal address changes must remain observable without a second state store');
assert.ok(traversal.includes('onNavigate={onNavigate}'),'accepted capability navigation must stay routed through OMEGA7 shell authority');

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
for(const route of ['Command Center','Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'])assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute===route)?.migration,'ADAPTED',route+' must be adapted rather than retired');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false,'no legacy capability may retire before parity+rollback proof');

assert.match(lock.sourceMainSha,/^[a-f0-9]{40}$/,'successor lock must retain an exact source SHA');
for(const family of ['COMMAND_RUNTIME','EARTH_WEATHER','MOTION_TRAVERSAL'])assert.ok(lock.nativeFamilies.includes(family),family+' must remain inherited by every successor');
assert.equal(lock.registeredRouteCount,44);
assert.equal(lock.physicalDimensionClaim,false);

console.log('OMEGA7 R440 CONTRACT PASS · Ask + Earth + motion/traversal remain native in successor · shared address lineage · zero legacy retirement');
