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

for(const token of ["params.get('omega6')==='1'","explicit==='1'","window.localStorage.getItem('omega7.enabled')!=='false'","catch{return true}"])assert.ok(app.includes(token),'OMEGA7 canonical-default/rollback contract missing '+token);
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

assert.deepEqual([...OMEGA7_NATIVE_ROUTES],['Earth Now'],'R438 first native slice must be Earth only');
assert.equal(isOmega7NativeRoute('Earth Now'),true);
assert.equal(isOmega7NativeRoute('Forecast'),false);
assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44,'inheritance ledger must still cover every OMEGAv6 capability');
assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute==='Earth Now')?.migration,'ADAPTED');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false,'no legacy surface may retire before parity+rollback proof');

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const earthNative=fs.readFileSync('src7/workspaces/EarthWorkspaceR438.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));
assert.ok(root.includes('isOmega7NativeRoute')&&root.includes('Omega7NativeSurface'),'OMEGA7 root must keep native capabilities inside the OMEGA7 shell');
assert.ok(earthNative.includes('EarthObservatoryR8')&&earthNative.includes("localStorage.getItem('omega.v6.address')"),'native Earth must reuse the accepted Earth engine and current canonical address instead of forking them');
assert.ok(native.includes("lazy(()=>import('./workspaces/EarthWorkspaceR438'))"),'native Earth must lazy-load as a bounded vertical slice');
assert.equal(lock.sourceMainSha,'a680d69e004141ad750a1efbdeb6e2954930713f');
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

console.log('OMEGA7 R438 PASS · 44/44 inheritance · six human domains · native Earth vertical slice · one scroll owner · R436 human translation · zero legacy retirement');
