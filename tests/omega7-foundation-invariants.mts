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

assert.equal(OMEGA7_CAPABILITIES.length,OMEGA_NAVIGATION.length,'OMEGA7 must inherit every canonical OMEGAv6 route');
assert.equal(OMEGA7_CAPABILITIES.length,44,'current inherited route census must remain 44 until canonical OMEGAv6 inventory changes');
assert.equal(new Set(OMEGA7_CAPABILITIES.map(x=>x.id)).size,OMEGA7_CAPABILITIES.length,'OMEGA7 capability ids must be unique');
assert.equal(new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute)).size,OMEGA7_CAPABILITIES.length,'OMEGA7 legacy route identities must be unique');
assert.deepEqual(new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute)),new Set(OMEGA_NAVIGATION.map(x=>x.name)),'OMEGA7 inheritance must exactly cover current OMEGAv6 navigation authority');
assert.equal(OMEGA7_INHERITANCE_CONTRACT.uniqueCapabilityIds,44);
assert.equal(OMEGA7_INHERITANCE_CONTRACT.uniqueLegacyRoutes,44);

for(const domain of OMEGA7_DOMAINS){
 assert.ok(omega7CapabilitiesForDomain(domain).length>0,`OMEGA7 human domain ${domain} must contain at least one capability`);
}
for(const cap of OMEGA7_CAPABILITIES){
 assert.ok(cap.label.length>0&&cap.description.length>0,`capability ${cap.id} requires human-facing presentation`);
 assert.equal(cap.compatibility,'OMEGAV6_BRIDGE');
 assert.ok(OMEGA7_CAPABILITY_BY_ROUTE.has(cap.legacyRoute),`missing compatibility route for ${cap.legacyRoute}`);
 assert.ok(['READY','DEGRADED','HELD','OFFLINE','FAILED'].includes(cap.availability),`invalid availability for ${cap.legacyRoute}`);
 assert.ok(cap.sourceBoundary.length>0,`source boundary missing for ${cap.legacyRoute}`);
}

assert.equal(searchOmega7Capabilities('weather')[0]?.legacyRoute,'Earth Now','human search should find Earth/weather without knowing legacy route vocabulary');
assert.ok(searchOmega7Capabilities('proof').some(x=>x.legacyRoute==='Evidence & Proof'),'human search should recover proof capability');
assert.ok(searchOmega7Capabilities('20736').some(x=>['Atlas','Atlas Calculator','Scale Compiler'].includes(x.legacyRoute)),'technical search must still expose deep atlas capabilities');

const app=fs.readFileSync('src/App.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const state=fs.readFileSync('src7/appState.tsx','utf8');
const boundary=fs.readFileSync('src7/Omega7Boundary.tsx','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');

assert.ok(app.includes("new URLSearchParams(window.location.search).get('omega7')==='1'"),'OMEGA7 must be opt-in while successor shell is proving');
assert.ok(app.includes("import Omega7Root from '../src7/Omega7Root'")&&app.includes('openLegacyFromOmega7'),'OMEGA7 must preserve an explicit compatibility route without adding a second inherited Suspense boundary');
assert.ok(root.includes("['HOME','WORK','EXPLORE','CREATE','DEVELOP','SYSTEM']")||root.includes('OMEGA7_DOMAINS'),'OMEGA7 must present bounded human domains rather than the raw 44-route universe');
assert.ok(root.includes('Standard')&&root.includes('Advanced')&&root.includes('Canon'),'OMEGA7 must support progressive disclosure without deleting technical depth');
assert.ok(root.includes('Ctrl K')&&root.includes('searchOmega7Capabilities'),'OMEGA7 must provide capability-wide command search');
assert.ok(root.includes('System status')&&root.includes('Availability and execution proof are separate'),'OMEGA7 must make runtime availability legible without overstating execution');
assert.ok(state.includes('OMEGA7_APP_STATE_SCHEMA')&&state.includes("commandOpen:boolean")&&state.includes("statusOpen:boolean"),'OMEGA7 requires one application state authority for global shell state');
assert.ok(boundary.includes('Your OMEGA state was not discarded.'),'OMEGA7 failures must be contained without implying state loss');
assert.ok(css.includes('@media(max-width:760px)')&&css.includes('grid-template-columns:repeat(6,1fr)'),'OMEGA7 must provide an intentional mobile navigation layout');
assert.ok(css.includes('z-index:60')&&css.includes('z-index:50')&&css.includes('z-index:40'),'OMEGA7 overlay layers must be explicitly bounded');
assert.ok(css.includes('.o7-main{')&&css.includes('overflow-y:auto')&&css.includes('overscroll-behavior:contain'),'OMEGA7 main workspace must own page scrolling');
assert.ok(css.includes('height:100dvh;overflow:hidden'),'OMEGA7 shell must contain document-level scroll drift');

assert.deepEqual([...OMEGA7_NATIVE_ROUTES],['Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'],'R439 native set must contain Earth plus the coherent traversal family');
assert.equal(isOmega7NativeRoute('Earth Now'),true);
assert.equal(isOmega7NativeRoute('Forecast'),false);
for(const route of ['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'])assert.equal(isOmega7NativeRoute(route),true,route+' must remain inside OMEGA7');
assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44,'inheritance ledger must still cover every OMEGAv6 capability');
assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute==='Earth Now')?.migration,'ADAPTED');
for(const route of ['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal'])assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute===route)?.migration,'ADAPTED',route+' inheritance row must be adapted, not retired');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false,'no legacy surface may retire before parity+rollback proof');

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const earthNative=fs.readFileSync('src7/workspaces/EarthWorkspaceR438.tsx','utf8');
const traversalNative=fs.readFileSync('src7/workspaces/TraversalWorkspaceR439.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));
assert.ok(root.includes('isOmega7NativeRoute')&&root.includes('Omega7NativeSurface'),'OMEGA7 root must keep native capabilities inside the OMEGA7 shell');
assert.ok(earthNative.includes('EarthObservatoryR8')&&earthNative.includes("localStorage.getItem('omega.v6.address')"),'native Earth must reuse the accepted Earth engine and current canonical address instead of forking them');
assert.ok(native.includes("lazy(()=>import('./workspaces/EarthWorkspaceR438'))"),'native Earth must lazy-load as a bounded vertical slice');
assert.ok(native.includes("lazy(()=>import('./workspaces/TraversalWorkspaceR439'))"),'traversal family must lazy-load through one bounded family workspace');
for(const token of ['MatterTraversalR36','TraversalR36','ExtremeTraversalUnionR60','initCorpusPack','corpusState','omega7-address-changed'])assert.ok(traversalNative.includes(token),'native traversal family missing '+token);
assert.ok(traversalNative.includes("localStorage.setItem('omega.v6.address'")&&traversalNative.includes("localStorage.getItem('omega.v6.address'"),'native traversal must preserve the accepted canonical address lineage rather than fork state');
assert.ok(root.includes("omega7-route-request")&&root.includes('if(!isOmega7NativeRoute(cap.legacyRoute))onOpenLegacyRoute'),'native cross-navigation must remain in OMEGA7 while bridged routes preserve rollback path');
assert.equal(lock.sourceMainSha,'c5a4759470335894e1b4b83b9eb862edefec7792');
assert.deepEqual(lock.nativeFamilies,['EARTH_WEATHER','MOTION_TRAVERSAL']);
assert.equal(lock.registeredRouteCount,44);
assert.equal(lock.physicalDimensionClaim,false);

const rejected=buildCanonicalResolutionR436({
 domain:'MOTION_TRAVERSAL',stateId:'omega7-r438-test',frame:'test',boundary:'test',sourceIdentity:'test',state:{},
 proofClass:'STRUCTURAL_ANALOGY',
 checks:[{id:'PHYS',kind:'PHYSICAL',passed:false,authority:'DERIVED_STANDARD',reason:'known constraint'}],
 truthBoundary:'test'
});
const human=presentR436ForHumans(rejected);
assert.equal(human.state,'REJECTED');
assert.equal(human.technical.branchStatus,'REJECTED_PHYSICAL');
assert.ok(human.technical.scars.length>0,'human translation must retain rejection scars');
assert.equal(human.canonicalMutation,false,'human translation may not mutate canonical state');

console.log('OMEGA7 R439 PASS · 44/44 inheritance · Earth + traversal native families · shared canonical address lineage · one shell · zero legacy retirement');
