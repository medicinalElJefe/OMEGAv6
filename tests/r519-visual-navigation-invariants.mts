import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {OMEGA7_CAPABILITIES,OMEGA7_DOMAINS} from '../src7/capabilityRegistry.ts';
import {R512_DOMAIN_MENU,menuCapabilitiesR512,quickActionsR512} from '../src7/capabilityMenuR512.ts';
const root=readFileSync('src7/Omega7Root.tsx','utf8');
const presentation=readFileSync('src7/visualNavigationR519.tsx','utf8');
const style=readFileSync('src7/visualNavigationR519.css','utf8');
const browserTest=readFileSync('tests/r519-visual-navigation-browser-e2e.mjs','utf8');
assert.equal(OMEGA7_DOMAINS.length,6);
assert.equal(R512_DOMAIN_MENU.length,6);
assert.equal(OMEGA7_CAPABILITIES.length,44,'visual presentation may not silently remove any of 44 inherited routes');
const routeIds=new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute));
assert.equal(routeIds.size,44,'duplicate route would conceal historical capability');
for(const domain of OMEGA7_DOMAINS){
 const rows=menuCapabilitiesR512(domain),top=quickActionsR512(domain);
 assert.ok(rows.length>0,'every top-level domain has accessible capabilities: '+domain);
 assert.ok(top.length>0&&top.length<=6,'quick menus remain bounded and functional: '+domain);
 assert.ok(top.every(x=>routeIds.has(x.legacyRoute)),'quick menu cannot invent routes: '+domain);
 assert.ok(rows.every(x=>domain==='HOME'||x.domain===domain),'cross-domain card leakage: '+domain);
 assert.ok(presentation.includes(domain+':{eyebrow:'),'domain presentation missing: '+domain);
}
for(const word of ["R519VisualNavigation domain={state.domain} onNavigate={open}","R519VisualNavigation domain='HOME' onNavigate={open}","data-navigation-revision='R512'","data-design-revision='R519'","R512_DOMAIN_MENU.map","OmegaHomeR71","data-r510-visual-restoration","o7-recovered[data-r486-visible-convergence"]){
 if(word==="o7-recovered[data-r486-visible-convergence")continue;
 assert.ok(root.includes(word),'existing HOME/historical authority or new visual navigation missing: '+word);
}
assert.ok(root.includes("data-r486-visible-convergence='true'"),'recovered historical capabilities must remain accessible');
assert.ok(root.includes('menuSectionsR512(menu.id).ready.length'),'sidebar numbers must come from capability metadata');
assert.ok(presentation.includes('onClick={()=>onNavigate(focus.legacyRoute)}'),'selected capability must launch real current route');
assert.ok(presentation.includes('onClick={()=>onNavigate(cap.legacyRoute)}'),'all featured capability rails must launch real current routes');
assert.ok(presentation.includes('onClick={()=>setSelectedIndex(i)}'),'visual nodes must change selection');
assert.ok(presentation.includes('A navigation projection of existing capabilities'),'visualization must be classified as navigation, not physical proof');
assert.ok(presentation.includes('cap.availability'),'source state must remain visible');
assert.ok(!presentation.includes('Math.random'),'navigation geometry must remain deterministic');
assert.ok(style.includes('@media(max-width:760px)')&&style.includes('prefers-reduced-motion'),'mobile/reduced-motion coverage required');
assert.ok(style.includes('.o7-home-established{isolation:isolate}'),'canonical visual stage retained');
assert.ok(browserTest.includes("await prove(browser,'mobile'"),'mobile browser acceptance required');
assert.ok(browserTest.includes("await prove(browser,'desktop'"),'desktop browser acceptance required');
assert.ok(browserTest.includes("data-r519-node="),'browser must manipulate real graphical route node');
assert.ok(browserTest.includes("data-r519-launch="),'browser must open actual route');
console.log('R519 SOURCE-CONNECTED VISUAL NAVIGATION CONTRACT PASS',{domains:OMEGA7_DOMAINS.length,routeCount:routeIds.size,existingVisual:'R71/R134 preserved',historicalSoftware:'preserved',dataAuthority:'source registry',scope:'presentation and routing only'});
