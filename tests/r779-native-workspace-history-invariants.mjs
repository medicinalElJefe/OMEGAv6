import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {R779_NATIVE_WORKSPACE_HISTORY_SCHEMA,nativeHistoryHrefR779,nativeHistorySelectionR779} from '../src7/nativeWorkspaceHistoryR779.js';
const registry=readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const begin=registry.indexOf('export const OMEGA7_NATIVE_ROUTES=Object.freeze([');
const end=registry.indexOf('] as const satisfies readonly OmegaRouteName[])',begin);
assert.ok(begin>=0&&end>begin);
const registered=[...registry.slice(begin,end).matchAll(/'([^']+)'/g)].map(x=>x[1]);
assert.equal(registered.length,44);
assert.equal(nativeHistoryHrefR779(null,registered),'?omega7=1');
assert.deepEqual(nativeHistorySelectionR779('?omega7=1',registered),{managed:true,route:null});
assert.deepEqual(nativeHistorySelectionR779('?omega7=1&cache=none',registered),{managed:true,route:null});
for(const route of registered){
 const href=nativeHistoryHrefR779(route,registered);
 assert.deepEqual(nativeHistorySelectionR779(href,registered),{managed:true,route});
 assert.equal(new URLSearchParams(href).has('address'),false);
 assert.equal(new URLSearchParams(href).has('canon'),false);
}
for(const bad of ['?omega7=0&omega7route=Atlas','?omega7=1&omega7=1&omega7route=Atlas','?omega7route=Atlas'])assert.deepEqual(nativeHistorySelectionR779(bad,registered),{managed:false,route:null});
for(const bad of ['?omega7=1&omega7route=unregistered','?omega7=1&omega7route=Atlas&omega7route=Memory','?omega7=1&omega7route=%00'])assert.deepEqual(nativeHistorySelectionR779(bad,registered),{managed:true,route:null});
assert.throws(()=>nativeHistoryHrefR779('not-an-instrument',registered),/unregistered/);
assert.equal(R779_NATIVE_WORKSPACE_HISTORY_SCHEMA,'OMEGA7_NATIVE_WORKSPACE_HISTORY_R779');
const root=readFileSync('src7/Omega7Root.tsx','utf8');
const browser=readFileSync('tests/r519-visual-navigation-browser-e2e.mjs','utf8');
const pkg=JSON.parse(readFileSync('package.json','utf8'));
for(const token of ["window.addEventListener('popstate',restore)","window.removeEventListener('popstate',restore)","window.history.pushState({omega7Route:cap.legacyRoute}","window.history.pushState({omega7Route:null}","const backToDomain=()=>","const switchDomain=(domain:Omega7Domain)=>","readNativeWorkspaceRouteR778(window.location.search,OMEGA7_NATIVE_ROUTES)"])assert.ok(root.includes(token),'R779 history integration absent '+token);
for(const token of ["R779 '+label+' source-route URL","page.goBack(","page.goForward(","page.reload(","Back to domain retained stale instrument URL"])assert.ok(browser.includes(token),'R779 live browser execution absent '+token);
assert.equal(pkg.scripts['test:r779'],'node tests/r779-native-workspace-history-invariants.mjs');
assert.ok(pkg.scripts['check:static'].includes('npm run test:r779'),'R779 release check must be blocking');
console.log('R779 NATIVE WORKSPACE HISTORY PASS · 44 registered route links, browser history sync/invalid refusal, live desktop/mobile reload/back/forward proof wired, no private state in URL');

 // R986: execute both initial restore and browser event semantics against
 // the registered source effect. Keep the original R779 assertions intact.
const effectStart=root.indexOf('  const restore=(event?:PopStateEvent)=>{');
const effectEnd=root.indexOf(' },[dispatch]);',effectStart);
assert.ok(effectStart>=0&&effectEnd>effectStart,'R986 history callback missing');
const effectSource=root.slice(effectStart,effectEnd).replace('(event?:PopStateEvent)','(event)');
const calls=[],listeners=new Map();
const fakeWindow={location:{search:'?omega7=1&omega7route=Atlas'},addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{assert.equal(listeners.get(name),fn);listeners.delete(name)}};
const capabilities=registered.map(legacyRoute=>({legacyRoute,domain:'TEST_DOMAIN'}));
const cleanup=new Function('window','nativeHistorySelectionR779','readNativeWorkspaceRouteR778','OMEGA7_NATIVE_ROUTES','OMEGA7_CAPABILITIES','isOmega7NativeRoute','dispatch','clearRecoveredExecution',effectSource)(fakeWindow,nativeHistorySelectionR779,(query,routes)=>nativeHistorySelectionR779(query,routes).route,registered,capabilities,route=>registered.includes(route),event=>calls.push(event),()=>calls.push('CLEAR_FOCUS'));
assert.deepEqual(calls,[{type:'DOMAIN',domain:'TEST_DOMAIN'},{type:'SELECT_ROUTE',route:'Atlas'}],'initial restore must not clear a valid saved focus');
calls.length=0;fakeWindow.location.search='?omega7=1&omega7route=Memory';listeners.get('popstate')({type:'popstate'});
assert.deepEqual(calls,['CLEAR_FOCUS',{type:'DOMAIN',domain:'TEST_DOMAIN'},{type:'SELECT_ROUTE',route:'Memory'}],'popstate must invalidate stale focus before selecting route');
calls.length=0;fakeWindow.location.search='?omega7=1';listeners.get('popstate')({type:'popstate'});
assert.deepEqual(calls,['CLEAR_FOCUS',{type:'SELECT_ROUTE',route:null}]);
cleanup();assert.equal(listeners.size,0);
console.log('R986 HISTORY CALLBACK PASS · initial restore retained · popstate clears stale focus before routing · same callback unregistered');
