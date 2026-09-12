import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R239/R305 '+msg)};
const nav=read('src/OmegaSideNavigatorR88.tsx');
const home=read('src/OmegaHomeR71.tsx');
const css=read('src/omegaSideNavigatorR239.css');
const registry=read('src/omegaExperienceRegistryR82.ts');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const layerIntegrity=read('tests/r104-extreme-layer-integrity-invariants.mjs');
const browser=read('tests/r239-user-navigation-browser-e2e.mjs');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(routes.length>0&&routes.length===surfaces.length&&new Set(routes).size===routes.length&&new Set(surfaces).size===surfaces.length,'must preserve one non-empty unique current route universe across R82 and workstation authority');
for(const route of routes)must(surfaces.includes(route),`R239 registry route missing from workstation ${route}`);
for(const route of surfaces)must(routes.includes(route),`R239 workstation route missing from registry ${route}`);
for(const workspace of ["id:'COMMAND',label:'Command'","id:'EXPLORE',label:'Explore'","id:'INTELLIGENCE',label:'Intelligence'","id:'EVIDENCE',label:'Evidence'","id:'BUILD',label:'Build'","id:'SYSTEM',label:'System'"])must(registry.includes(workspace),'workspace registry missing '+workspace);

for(const token of [
 "R239_USER_NAV_REVISION='R239'",
 "go('Command Center')",
 "go('Hybrid Link')",
 "go('Earth Now')",
 "go('Evidence & Proof')",
 "title='All tools'",
 "title='System map'",
 "placeholder='Search tools, surfaces, or workflows'",
 'TIER_COPY',
 'r239-route-group',
 'showTechnical',
 "aria-pressed={showTechnical}",
 "aria-hidden={!expanded} inert={!expanded}",
 "data-route-id={chain.routeId}",
 "data-capability-id={chain.capabilityId}",
 "data-execution-domain={chain.executionDomain}",
 "data-execution-state={chain.state}",
 "YOU ARE HERE",
 'rows.map(route=>',
 'OMEGA_WORKSPACES_R82.map(workspace=>',
 'workspaceFilter===workspace.id',
 'workspace.routes.length'
])must(nav.includes(token),'global navigator missing '+token);
for(const specialized of ["go('Extreme Traversal')","go('Matter Traversal')"])must(!nav.includes(specialized),'specialized Explore route must not consume permanent universal rail space: '+specialized);
must(!nav.includes('rows.slice('),'all filtered registered routes must remain reachable');
must(!nav.includes('/api/')&&!nav.includes('fetch('),'navigation must remain backend-independent and non-mutating');
for(const tier of ['PRIMARY','SUPPORT','EXPERT'])must(nav.includes(tier),'priority tier missing '+tier);

for(const token of [
 'routeIdentities=await routeRows.evaluateAll',
 "row.dataset.routeId||''",
 'expectedTotalCount',
 'new Set(routeIds).size!==routeIdentities.length',
 'row.dataset.routeId===id',
 "row.getAttribute('data-route-id')",
 "row.locator(':scope > span > b')",
 'route identity/presentation binding drifted',
 'no historical route-count ceiling'
])must(browser.includes(token),'browser proof must bind exhaustive current-route activation to machine-semantic R143 identity without a historical count ceiling: '+token);
must(!browser.includes("const row=exactLabel.locator('..')"),'browser proof must not infer route identity from presentation DOM parent depth');
must(!browser.includes('/^ALL\\s+44$/')&&!browser.includes('count()!==44')&&!browser.includes('size!==44'),'R239 browser proof must not freeze the current route universe to a historical cardinality');

for(const token of [
 "data-navigation-revision='R239'",
 "aria-label='All tools'",
 '<Search/>All tools',
 '<Blocks/>System map',
 'START HERE',
 '>NOW</button>',
 '>ANALYZE</button>',
 'ALWAYS AVAILABLE',
 "['Command','Command Center',Command]",
 "['Hybrid','Hybrid Link',Link2]",
 "['Earth','Earth Now',Earth]",
 "['Proof','Evidence & Proof',ShieldCheck]",
 'activeWorkspace.routes.map',
 'primaryRoutesForWorkspaceR132(domain)'
])must(home.includes(token),'Home user hierarchy missing '+token);
must(!/aria-label='All \d+ applications'/.test(home),'visible All tools language and accessible All tools language must not be coupled to a route-count snapshot');
const quick=home.match(/const QUICK=\[(.*?)\] as const;/s)?.[1]||'';
must(!quick.includes('SAI Lab')&&!quick.includes('Visual Instrument'),'universal quick actions must not duplicate workspace-specific specialist tools');
must(home.includes("type SurfaceDepth='FOCUS'|'DEEP'"),'focus/deep density contract must remain available');
must(layerIntegrity.includes("nav.includes('<span>YOU ARE HERE</span>')")&&layerIntegrity.includes("workspace.copy"),'R104 inherited layer integrity must prove current-location and destination explanation structurally instead of frozen prose');

for(const token of [
 ".r239-home[data-r132-depth='FOCUS'] .r96-context-card>div{display:none}",
 ".r239-home[data-r132-depth='FOCUS'] .r96-quick-card>div",
 '.r239-user-nav .r239-route-group',
 "@media(max-width:900px)",
 "@media(max-width:560px)"
])must(css.includes(token),'R239 responsive presentation law missing '+token);

console.log(`R239.1/R305 USER NAVIGATION CONVERGENCE PASS · Home→workspace→start-here→all-tools hierarchy · universal rail Command/Hybrid/Earth/Proof · full ${routes.length}-route current registry exactly aligned with workstation · primary/support/expert grouped · technical metadata opt-in · R143 machine route identity structurally bound independently of presentation markup · visible/accessible naming aligned · collapsed navigator immediately inert while R94 exit visibility transition completes · R104 semantic location/destination explanation bound · focus/deep density preserved · no historical route-count ceiling · no new execution or Canon authority`);
