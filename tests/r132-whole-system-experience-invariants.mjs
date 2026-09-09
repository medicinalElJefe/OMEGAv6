import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R132/R239/R242 '+msg)};
const org=read('src/experienceOrganizationR132.ts');
const home=read('src/OmegaHomeR71.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const lemma=read('src/navigationLemmaCalculusR242.js');
const css=read('src/wholeSystemExperienceR132.css');
const userCss=read('src/omegaSideNavigatorR239.css');
const registry=read('src/omegaExperienceRegistryR82.ts');

for(const token of ["'PRIMARY'|'SUPPORT'|'EXPERT'","'OPERATE'|'VISUALIZE'|'REASON'|'PROVE'|'BUILD'|'SYSTEM'","'VISUAL_FIRST'|'SPLIT_WORKBENCH'|'WORKFLOW'|'DATA_DENSE'|'CONTROL_SURFACE'",'ONE_PERSISTENT_RAIL_ONE_COMPLETE_ROUTE_REGISTRY','RESERVED_COLUMNS_NO_COVERING_PANELS','VISUAL_FIRST_SINGLE_COLUMN_CONTROLS_MOVE_BELOW_FIELD','RETURNED_EXECUTION_EVIDENCE_AND_REPRESENTATION_NEVER_AUTO_PROMOTE_TO_CANON'])must(org.includes(token),'organization authority missing '+token);
must(org.includes('OMEGA_ALL_ROUTES_R82.map')&&org.includes('missing.length===0')&&org.includes('workspacePrimary.every(x=>x.count>0)'),'organization authority must dynamically cover the complete canonical route registry and require a primary lane in every workspace');
must(!org.includes('.slice('),'organization authority may not hide routes through arbitrary slicing');

must(home.includes("data-r132-depth={depth}")&&home.includes("type SurfaceDepth='FOCUS'|'DEEP'"),'Home must expose persistent focus/deep density without creating a second product shell');
must(home.includes("className='r132-primary-strip'")&&home.includes('primaryRoutesForWorkspaceR132(domain)')&&home.includes('START HERE'),'each Home workspace must surface its primary instruments directly with user-facing start-here language');
must(home.includes("className='r132-inspector-tabs'")&&home.includes("'STATE'|'OPERATORS'|'TOOLS'")&&home.includes('>NOW</button>')&&home.includes('>ANALYZE</button>'),'focused inspector must separate packet, analysis and tool concerns using user-facing labels');
must(home.includes("aria-label='All tools'")&&home.includes('onClick={()=>openApplications()}')&&home.includes('activeWorkspace.routes.map')&&nav.includes('OMEGA_ALL_ROUTES_R82')&&nav.includes('rows.map(route=>')&&!nav.includes('rows.slice('),'historical route reachability must remain complete through the shared All Tools browser while focus-mode presentation becomes simpler');
must(home.includes("<Search/>All tools")&&home.includes('<Blocks/>System map')&&home.includes('ALWAYS AVAILABLE'),'Home must use plain-language global navigation labels');
must(home.includes('OMEGA_FIELD_PROJECTIONS_R82.map')&&home.includes('projection={lens.projection}')&&home.includes('view={lens.view}'),'projection controls must still bind real canonical geometry/data views');

must(nav.includes('organizationForRouteR132')&&nav.includes('compileNavigationLemmaR242')&&nav.includes('TIER_COPY')&&nav.includes('firstOfTier=!navigationLemma.searching'),'navigator must preserve R132 presentation priority through the R242 lemma transform rather than bypassing organization');
must(lemma.includes("const TIER_RANK=Object.freeze({PRIMARY:0,SUPPORT:1,EXPERT:2})")&&lemma.includes('TIER_THEN_SOURCE_INDEX'),'R242 lemma must conserve PRIMARY→SUPPORT→EXPERT presentation order');
must(nav.includes("placeholder='Search tools, surfaces, or workflows'")&&nav.includes('OMEGA_ALL_ROUTES_R82.indexOf(route)+1'),'search and canonical inventory identity must survive organization');
must(nav.includes("data-tier={org.tier}")&&nav.includes('r239-route-group')&&nav.includes('TIER_COPY'),'route rows must visibly group PRIMARY, SUPPORT and EXPERT instead of remaining an undifferentiated flat list');
must(nav.includes('R239_USER_NAV_REVISION')&&nav.includes("aria-label='Open Hybrid Link'")&&nav.includes("aria-label='Open Earth Now'")&&nav.includes("aria-label='Browse all registered OMEGA tools'"),'persistent rail must prioritize universal operator destinations');
must(nav.includes('showTechnical')&&nav.includes("aria-pressed={showTechnical}")&&nav.includes("showTechnical?`${chain.executionDomain}/${chain.state}"),'execution metadata must be opt-in instead of dominating ordinary navigation');
must(!nav.includes('.slice('),'navigator may not bury registered applications through arbitrary result slicing');

must(css.includes(".r132-home[data-r132-depth='FOCUS']")&&css.includes(".r132-home[data-r132-depth='DEEP']"),'focus/deep presentation laws missing');
must(css.includes('@media(max-width:980px)')&&css.includes('@media(max-width:720px)'),'R132 must have explicit tablet/mobile organization laws');
must(css.includes('.r132-home .r96-inspector{order:2}')&&css.includes('.r132-home .r96-command-dock{grid-template-columns:1fr}'),'mobile must place controls below the visual field and remove desktop column pressure');
must(!css.match(/\.r132-inspector[^\n]*position:fixed/),'inspector may not become a covering fixed overlay');
must(userCss.includes(".r239-home[data-r132-depth='FOCUS'] .r96-context-card>div{display:none}")&&userCss.includes(".r239-home[data-r132-depth='FOCUS'] .r96-quick-card>div"),'R239 focus mode must remove duplicate route-list density while retaining universal quick actions');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(routes.length===44&&new Set(routes).size===44,'presentation pass must not lose or duplicate the established 44-route registry');
console.log('R132/R239/R242 WHOLE-SYSTEM EXPERIENCE PASS · one visual-first instrument · workspace/start-here/all-tools hierarchy · primary/support/expert grouping conserved through lemma calculus · focus/deep density · complete 44-route reachability · user-first labels · technical detail on demand');
