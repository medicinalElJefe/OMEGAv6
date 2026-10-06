import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 OMEGA7_CAPABILITIES,
 OMEGA7_CAPABILITY_BY_ROUTE,
 OMEGA7_DOMAINS,
 OMEGA7_INHERITANCE_CONTRACT,
 omega7CapabilitiesForDomain,
 searchOmega7Capabilities
} from '../src7/capabilityRegistry.ts';
import {OMEGA_NAVIGATION} from '../src/navigationRegistry.ts';
import {buildCanonicalResolutionR436} from '../src/system/canonicalDomainResolutionR436.ts';
import {OMEGA7_NATIVE_ROUTES,isOmega7NativeRoute} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';
import {presentR436ForHumans} from '../src7/resolutionPresentationR438.ts';

assert.equal(OMEGA7_CAPABILITIES.length,44);
assert.equal(OMEGA7_CAPABILITIES.length,OMEGA_NAVIGATION.length);
assert.equal(new Set(OMEGA7_CAPABILITIES.map(x=>x.id)).size,44);
assert.deepEqual(new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute)),new Set(OMEGA_NAVIGATION.map(x=>x.name)));
assert.equal(OMEGA7_INHERITANCE_CONTRACT.uniqueCapabilityIds,44);
assert.equal(OMEGA7_INHERITANCE_CONTRACT.uniqueLegacyRoutes,44);
for(const domain of OMEGA7_DOMAINS)assert.ok(omega7CapabilitiesForDomain(domain).length>0);
for(const cap of OMEGA7_CAPABILITIES){
 assert.equal(cap.compatibility,'OMEGAV6_BRIDGE');
 assert.ok(OMEGA7_CAPABILITY_BY_ROUTE.has(cap.legacyRoute));
 assert.ok(cap.label&&cap.description&&cap.sourceBoundary);
}
assert.equal(searchOmega7Capabilities('weather')[0]?.legacyRoute,'Earth Now');
assert.ok(searchOmega7Capabilities('proof').some(x=>x.legacyRoute==='Evidence & Proof'));
assert.ok(searchOmega7Capabilities('20736').some(x=>['Atlas','Atlas Calculator','Scale Compiler'].includes(x.legacyRoute)));

const app=fs.readFileSync('src/App.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const state=fs.readFileSync('src7/appState.tsx','utf8');
const boundary=fs.readFileSync('src7/Omega7Boundary.tsx','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');
const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const earth=fs.readFileSync('src7/workspaces/EarthWorkspaceR438.tsx','utf8');
const command=fs.readFileSync('src7/workspaces/CommandWorkspaceR439.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

for(const token of ["params.get('omega6')==='1'","explicit==='1'","window.localStorage.getItem('omega7.enabled')!=='false'","catch{return true}"])assert.ok(app.includes(token),`R489 canonical-default contract missing ${token}`);
assert.ok(root.includes('OMEGA7_DOMAINS')&&root.includes('Standard')&&root.includes('Advanced')&&root.includes('Canon'));
assert.ok(root.includes('isOmega7NativeRoute')&&root.includes('Omega7NativeSurface'));
assert.ok(state.includes('OMEGA7_APP_STATE_SCHEMA'));
assert.ok(boundary.includes('Your OMEGA state was not discarded.'));
assert.ok(css.includes('height:100dvh;overflow:hidden'));
assert.ok(css.includes('.o7-main{')&&css.includes('overflow-y:auto')&&css.includes('overscroll-behavior:contain'));
assert.ok(css.includes('@media(max-width:760px)')&&css.includes('grid-template-columns:repeat(6,1fr)'));

assert.ok(OMEGA7_NATIVE_ROUTES.includes('Command Center')&&OMEGA7_NATIVE_ROUTES.includes('Earth Now'),'R439 native Command + Earth inheritance must remain preserved in all successors');
assert.equal(isOmega7NativeRoute('Command Center'),true);
assert.equal(isOmega7NativeRoute('Earth Now'),true);
assert.ok(OMEGA7_NATIVE_ROUTES.includes('Command Center')&&OMEGA7_NATIVE_ROUTES.includes('Earth Now'),'R439 routes must remain native in successors');
assert.ok(native.includes("lazy(()=>import('./workspaces/CommandWorkspaceR439'))"));
assert.ok(native.includes("lazy(()=>import('./workspaces/EarthWorkspaceR438'))"));
assert.ok(earth.includes('EarthObservatoryR8')&&earth.includes("localStorage.getItem('omega.v6.address')"));
assert.ok(command.includes('OmegaCommandDeck'));
assert.ok(command.indexOf("'/api/route-preview'")<command.indexOf("'/api/chat'"));
assert.ok(command.includes("await api.post<any>('/api/route-preview',{text,context})"));
assert.ok(command.includes("await api.post<any>('/api/chat',{text,context})"));
assert.ok(command.includes("depth==='STANDARD'")&&command.includes('Why this result?'));
assert.ok(command.includes('doNotInventMissingEvidence:true')&&command.includes('canonicalMutation:false'));

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute==='Command Center')?.migration,'ADAPTED');
assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute==='Earth Now')?.migration,'ADAPTED');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false);

assert.match(lock.sourceMainSha,/^[a-f0-9]{40}$/);
assert.ok(lock.nativeRoutes.includes('Command Center')&&lock.nativeRoutes.includes('Earth Now'));
assert.equal(lock.registeredRouteCount,44);
assert.equal(lock.physicalDimensionClaim,false);

const rejected=buildCanonicalResolutionR436({
 domain:'MOTION_TRAVERSAL',stateId:'omega7-r439-test',frame:'test',boundary:'test',sourceIdentity:'test',state:{},
 proofClass:'STRUCTURAL_ANALOGY',
 checks:[{id:'PHYS',kind:'PHYSICAL',passed:false,authority:'DERIVED_STANDARD',reason:'known constraint'}],
 truthBoundary:'test'
});
const human=presentR436ForHumans(rejected);
assert.equal(human.state,'REJECTED');
assert.equal(human.technical.branchStatus,'REJECTED_PHYSICAL');
assert.ok(human.technical.scars.length>0);
assert.equal(human.canonicalMutation,false);

console.log('OMEGA7 R439 CONTRACT PASS · Ask OMEGA + Earth remain inherited in successor native set · route-before-generation preserved · zero legacy retirement');
