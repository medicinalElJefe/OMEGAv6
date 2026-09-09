import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R239 '+msg)};
const nav=read('src/OmegaSideNavigatorR88.tsx');
const home=read('src/OmegaHomeR71.tsx');
const css=read('src/omegaSideNavigatorR239.css');
const registry=read('src/omegaExperienceRegistryR82.ts');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(routes.length===44&&new Set(routes).size===44,'must preserve all 44 unique registered destinations');
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
must(!home.includes("aria-label='All 44 applications'"),'visible All Tools label and accessible name must not diverge');
const quick=home.match(/const QUICK=\[(.*?)\] as const;/s)?.[1]||'';
must(!quick.includes('SAI Lab')&&!quick.includes('Visual Instrument'),'universal quick actions must not duplicate workspace-specific specialist tools');
must(home.includes("type SurfaceDepth='FOCUS'|'DEEP'"),'focus/deep density contract must remain available');

for(const token of [
 ".r239-home[data-r132-depth='FOCUS'] .r96-context-card>div{display:none}",
 ".r239-home[data-r132-depth='FOCUS'] .r96-quick-card>div",
 '.r239-user-nav .r239-route-group',
 "@media(max-width:900px)",
 "@media(max-width:560px)"
])must(css.includes(token),'R239 responsive presentation law missing '+token);

console.log('R239 USER NAVIGATION CONVERGENCE PASS · Home→workspace→start-here→all-tools hierarchy · universal rail Command/Hybrid/Earth/Proof · full 44-route registry retained · primary/support/expert grouped · technical metadata opt-in · aligned All Tools accessibility · focus/deep density preserved · no new execution or Canon authority');
