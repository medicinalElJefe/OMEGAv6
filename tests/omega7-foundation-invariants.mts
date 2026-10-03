import assert from 'node:assert/strict';
import fs from 'node:fs';

import {OMEGA_NAVIGATION} from '../src/navigationRegistry.ts';
import {buildCanonicalResolutionR436} from '../src/system/canonicalDomainResolutionR436.ts';
import {
  OMEGA7_CAPABILITIES,
  OMEGA7_CAPABILITY_BY_ID,
  OMEGA7_PRIMARY_DOMAINS,
  capabilitiesForDomain
} from '../src7/kernel/capabilityRegistry.ts';
import {OMEGA7_INHERITANCE_MATRIX,mayRetireLegacySurface} from '../src7/kernel/inheritance.ts';
import {initialOmega7State,omega7Reducer} from '../src7/kernel/appState.ts';
import {OMEGA7_FAILURE_RULES,preserveLastGood} from '../src7/kernel/health.ts';
import {humanizeR436Resolution} from '../src7/adapters/r436HumanAdapter.ts';
import {bridgeLegacyCapability} from '../src7/adapters/legacyCapabilityBridge.ts';

assert.equal(OMEGA_NAVIGATION.length,44,'OMEGAv6 frozen route authority changed unexpectedly');
assert.equal(OMEGA7_CAPABILITIES.length,OMEGA_NAVIGATION.length,'OMEGA7 must inherit every registered OMEGAv6 route');
assert.deepEqual(new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute)),new Set(OMEGA_NAVIGATION.map(x=>x.name)),'OMEGA7 inheritance set must exactly match OMEGAv6 route authority');
assert.equal(new Set(OMEGA7_CAPABILITIES.map(x=>x.id)).size,44,'OMEGA7 capability ids must be unique');
assert.equal(OMEGA7_PRIMARY_DOMAINS.length,6,'OMEGA7 human navigation must remain six primary domains');
assert.equal(OMEGA7_PRIMARY_DOMAINS.map(x=>x.id).join(','),'HOME,WORK,EXPLORE,CREATE,DEVELOP,SYSTEM');

for(const cap of OMEGA7_CAPABILITIES){
 assert.equal(OMEGA7_CAPABILITY_BY_ID.get(cap.id)?.legacyRoute,cap.legacyRoute);
 assert.equal(cap.inheritanceRequired,true,'inherited capability cannot silently opt out');
 assert.ok(cap.description.length>20,'human description must be meaningful');
}
assert.equal(OMEGA7_INHERITANCE_MATRIX.length,44);
assert.equal(OMEGA7_INHERITANCE_MATRIX.some(mayRetireLegacySurface),false,'no OMEGAv6 surface may retire before OMEGA7 parity proof');
assert.ok(capabilitiesForDomain('EXPLORE').some(x=>x.legacyRoute==='Earth Now'));
assert.ok(capabilitiesForDomain('DEVELOP').some(x=>x.legacyRoute==='Hybrid Link'));
assert.ok(capabilitiesForDomain('SYSTEM').some(x=>x.legacyRoute==='Governance'));

const opened=omega7Reducer(initialOmega7State,{type:'OPEN_CAPABILITY',capabilityId:'omega7.route.10',legacyRoute:'Earth Now'});
assert.equal(opened.activeLegacyRoute,'Earth Now');
assert.equal(opened.canonicalMutation,false);
const advanced=omega7Reducer(opened,{type:'SET_PRESENTATION',presentation:'CANON'});
assert.equal(advanced.presentation,'CANON');
assert.equal(advanced.activeLegacyRoute,'Earth Now','presentation depth must not change capability identity');

const lastGood={value:42};
assert.equal(preserveLastGood(lastGood,null,'FAILED'),lastGood,'failure must preserve last good state');
assert.equal(preserveLastGood(lastGood,{value:43},'READY')?.value,43);
for(const rule of ['CAPABILITY_FAILURE_MUST_NOT_CRASH_SHELL','NO_INFINITE_SPINNER','NO_SILENT_CONTROL_FAILURE'])assert.ok(OMEGA7_FAILURE_RULES.includes(rule));

const bridge=bridgeLegacyCapability('Earth Now','READY');
assert.equal(bridge.canMount,true);
assert.equal(bridge.canonicalMutation,false);
assert.equal(bridgeLegacyCapability('NOT_A_ROUTE','READY').canMount,false);

const rejected=buildCanonicalResolutionR436({
 domain:'MOTION_TRAVERSAL',
 stateId:'o7-test',
 frame:'test',
 boundary:'test',
 sourceIdentity:'test',
 state:{},
 proofClass:'STRUCTURAL_ANALOGY',
 checks:[{id:'P',kind:'PHYSICAL',passed:false,authority:'DERIVED_STANDARD',reason:'known constraint'}],
 truthBoundary:'test'
});
const human=humanizeR436Resolution(rejected);
assert.equal(human.state,'REJECTED');
assert.equal(human.technical.branchStatus,'REJECTED_PHYSICAL');
assert.ok(human.technical.scars.length>0);
assert.equal(rejected.canonicalMutation,false);

const shell=fs.readFileSync('src7/experience/Omega7Shell.tsx','utf8');
const boundary=fs.readFileSync('src7/experience/Omega7CapabilityBoundary.tsx','utf8');
const css=fs.readFileSync('src7/experience/omega7.css','utf8');
assert.ok(shell.includes('OMEGA7_PRIMARY_DOMAINS')&&shell.includes('renderLegacySurface(active.legacyRoute)'),'OMEGA7 shell must present inherited capabilities through one adapter mount');
assert.ok(boundary.includes('getDerivedStateFromError')&&boundary.includes('could not finish loading'),'capability failures must be isolated');
assert.ok(css.includes('.o7-main{')&&css.includes('overflow-y:auto'),'one main page scroll owner is required');
assert.ok(css.includes('@media(max-width:760px)'),'mobile layout must be first-class');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'reduced motion must be respected');
assert.ok(css.includes('--o7-z-content:0')&&css.includes('--o7-z-modal:50'),'z-index must use bounded design tokens');
assert.ok(!/z-index:\s*999/i.test(css),'arbitrary extreme z-index is forbidden');

console.log('OMEGA7 FOUNDATION PASS · 44/44 inherited capabilities · six human domains · one shell/state authority · failure containment · R436 human adapter · no legacy retirement without parity proof');
