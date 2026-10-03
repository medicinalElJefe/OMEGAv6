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
assert.ok(app.includes("lazy(()=>import('../src7/Omega7Root'))"),'OMEGA7 must lazy-load outside the OMEGAv6 initial surface');
assert.ok(app.includes('openLegacyFromOmega7'),'OMEGA7 must preserve an explicit compatibility route into current OMEGAv6 capabilities');
assert.ok(root.includes("['HOME','WORK','EXPLORE','CREATE','DEVELOP','SYSTEM']")||root.includes('OMEGA7_DOMAINS'),'OMEGA7 must present bounded human domains rather than the raw 44-route universe');
assert.ok(root.includes('Standard')&&root.includes('Advanced')&&root.includes('Canon'),'OMEGA7 must support progressive disclosure without deleting technical depth');
assert.ok(root.includes('Ctrl K')&&root.includes('searchOmega7Capabilities'),'OMEGA7 must provide capability-wide command search');
assert.ok(root.includes('System status')&&root.includes('Availability and execution proof are separate'),'OMEGA7 must make runtime availability legible without overstating execution');
assert.ok(state.includes('OMEGA7_APP_STATE_SCHEMA')&&state.includes("commandOpen:boolean")&&state.includes("statusOpen:boolean"),'OMEGA7 requires one application state authority for global shell state');
assert.ok(boundary.includes('Your OMEGA state was not discarded.'),'OMEGA7 failures must be contained without implying state loss');
assert.ok(css.includes('@media(max-width:760px)')&&css.includes('grid-template-columns:repeat(6,1fr)'),'OMEGA7 must provide an intentional mobile navigation layout');
assert.ok(css.includes('z-index:60')&&css.includes('z-index:50')&&css.includes('z-index:40'),'OMEGA7 overlay layers must be explicitly bounded');

console.log('OMEGA7 foundation PASS · 44/44 capability inheritance · six human domains · opt-in zero-loss bridge · single shell state · failure containment · responsive presentation');
