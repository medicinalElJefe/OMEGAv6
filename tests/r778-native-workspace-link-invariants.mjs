import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {R778_NATIVE_WORKSPACE_LINK_SCHEMA,nativeWorkspaceHrefR778,readNativeWorkspaceRouteR778} from '../src7/nativeWorkspaceLinksR778.js';
assert.equal(R778_NATIVE_WORKSPACE_LINK_SCHEMA,'OMEGA7_NATIVE_WORKSPACE_LINK_R778');
const nativeRegistry=readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const openNative=nativeRegistry.indexOf('export const OMEGA7_NATIVE_ROUTES=Object.freeze([');
const closeNative=nativeRegistry.indexOf('] as const satisfies readonly OmegaRouteName[])',openNative);
assert.ok(openNative>=0&&closeNative>openNative,'R778 must use the actual declared native route registry');
const registered=[...nativeRegistry.slice(openNative,closeNative).matchAll(/'([^']+)'/g)].map(m=>m[1]);
assert.equal(registered.length,44,'R778 must conserve all 44 native OMEGA7 routes');
assert.equal(new Set(registered).size,44,'R778 registry must not duplicate routes');
for(const route of registered){
 const link=nativeWorkspaceHrefR778(route,registered);
 assert.equal(readNativeWorkspaceRouteR778(link,registered),route);
 const params=new URLSearchParams(link);
 assert.deepEqual([...params.keys()],['omega7','omega7route']);
 assert.equal(params.has('address'),false);
}
for(const input of ['?omega7route=Atlas','?omega7=0&omega7route=Atlas','?omega7=1&omega7route=Unknown','?omega7=1&omega7route=Atlas&omega7route=Memory','?omega7=1&omega7=0&omega7route=Atlas','?omega7=1&omega7route=%00'])assert.equal(readNativeWorkspaceRouteR778(input,registered),null);
assert.throws(()=>nativeWorkspaceHrefR778('Unknown',registered),/unregistered/);
assert.throws(()=>nativeWorkspaceHrefR778('',registered),/unregistered/);
const root=readFileSync('src7/Omega7Root.tsx','utf8'),browser=readFileSync('tests/r519-visual-navigation-browser-e2e.mjs','utf8'),css=readFileSync('src7/omega7.css','utf8'),pkg=JSON.parse(readFileSync('package.json','utf8'));
for(const token of ['readNativeWorkspaceRouteR778(window.location.search,OMEGA7_NATIVE_ROUTES)','dispatch({type:\'DOMAIN\',domain:cap.domain})','dispatch({type:\'SELECT_ROUTE\',route:cap.legacyRoute})','data-r778-native-link','nativeWorkspaceHrefR778(state.selectedRoute,OMEGA7_NATIVE_ROUTES)'])assert.ok(root.includes(token),'R778 route integration missing '+token);
assert.ok(browser.includes("R778 '+label+' native Atlas link reopened")&&browser.includes('await page.reload('),'R778 desktop/mobile actual browser round trip missing');
assert.ok(css.includes('.o7-native-toolbar [data-r778-native-link]')&&css.includes('min-height:44px'),'R778 direct link mobile touch contract missing');
assert.equal(pkg.scripts['test:r778'],'node tests/r778-native-workspace-link-invariants.mjs');
assert.ok(pkg.scripts['check:static'].includes('npm run test:r778'));
console.log('R778 NATIVE WORKSPACE LINK PASS · 44 registered native route round trips · no untrusted URL route · shareable Atlas link and reload in desktop/mobile browser · Canon address excluded');
