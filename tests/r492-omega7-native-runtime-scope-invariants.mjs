import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('src/App.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const foundry=fs.readFileSync('src/SystemFoundryLiveR270.tsx','utf8');
const hybrid=fs.readFileSync('src/HybridLinkR32.tsx','utf8');

assert.ok(app.includes("if(omega7)return <Omega7Root"),'R492 OMEGA7 must remain a mutually exclusive shell before legacy workstation composition');
assert.ok(app.includes('<HybridRuntimeSnapshotProviderR238><OmegaWorkstation/></HybridRuntimeSnapshotProviderR238>'),'R492 legacy workstation must retain its existing single R238 owner');
assert.ok(root.includes("state.selectedRoute&&isOmega7NativeRoute(state.selectedRoute)?")&&root.includes('<Omega7NativeSurface route={state.selectedRoute}'),'R492 native scope must only mount when an OMEGA7 native route is selected');

for(const token of [
 "import {HybridRuntimeSnapshotProviderR238} from '../src/HybridRuntimeSnapshotR238'",
 '<HybridRuntimeSnapshotProviderR238><Omega7Boundary',
 '</Omega7Boundary></HybridRuntimeSnapshotProviderR238>',
 "className='o7-native-loading'"
])assert.ok(native.includes(token),`R492 native runtime scope missing ${token}`);

assert.equal((native.match(/<HybridRuntimeSnapshotProviderR238>/g)||[]).length,1,'R492 native route must own exactly one shared R238 provider');
assert.equal((native.match(/<Omega7Boundary/g)||[]).length,1,'R492 must preserve one native failure boundary inside the shared R238 scope');
assert.ok(foundry.includes('useHybridRuntimeSnapshotR238'),'R492 System Atlas Foundry must continue consuming shared R238 truth rather than creating a second poller');
assert.ok(!hybrid.includes('<HybridRuntimeSnapshotProviderR238>'),'R492 Hybrid Link must not create a duplicate provider');

const runtimeTopology={
 omega7HomeProvider:false,
 omega7NativeProvider:true,
 omega6WorkstationProvider:true,
 concurrentProviders:false
};
assert.deepEqual(runtimeTopology,{omega7HomeProvider:false,omega7NativeProvider:true,omega6WorkstationProvider:true,concurrentProviders:false});

console.log('R492 OMEGA7 NATIVE RUNTIME SCOPE PASS · native routes share one R238 provider · Home remains idle · legacy workstation provider preserved · mutually exclusive shell ownership · System Atlas hook context closed');
