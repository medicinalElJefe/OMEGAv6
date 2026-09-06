import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R132 '+msg)};
const org=read('src/experienceOrganizationR132.ts');
const home=read('src/OmegaHomeR71.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const css=read('src/wholeSystemExperienceR132.css');
const registry=read('src/omegaExperienceRegistryR82.ts');

for(const token of ["'PRIMARY'|'SUPPORT'|'EXPERT'","'OPERATE'|'VISUALIZE'|'REASON'|'PROVE'|'BUILD'|'SYSTEM'","'VISUAL_FIRST'|'SPLIT_WORKBENCH'|'WORKFLOW'|'DATA_DENSE'|'CONTROL_SURFACE'",'ONE_PERSISTENT_RAIL_ONE_COMPLETE_ROUTE_REGISTRY','RESERVED_COLUMNS_NO_COVERING_PANELS','VISUAL_FIRST_SINGLE_COLUMN_CONTROLS_MOVE_BELOW_FIELD','RETURNED_EXECUTION_EVIDENCE_AND_REPRESENTATION_NEVER_AUTO_PROMOTE_TO_CANON'])must(org.includes(token),'organization authority missing '+token);
must(org.includes('OMEGA_ALL_ROUTES_R82.map')&&org.includes('missing.length===0')&&org.includes('workspacePrimary.every(x=>x.count>0)'),'R132 must dynamically cover the complete canonical route registry and require a primary lane in every workspace');
must(!org.includes('.slice('),'organization authority may not hide routes through arbitrary slicing');

must(home.includes("data-r132-depth={depth}")&&home.includes("type SurfaceDepth='FOCUS'|'DEEP'"),'Home must expose persistent focus/deep density without creating a second product shell');
must(home.includes("className='r132-primary-strip'")&&home.includes('primaryRoutesForWorkspaceR132(domain)'),'each Home workspace must surface its primary instruments directly');
must(home.includes("className='r132-inspector-tabs'")&&home.includes("'STATE'|'OPERATORS'|'TOOLS'"),'focused inspector must separate packet, operator and tool concerns');
must(home.includes('All 44 applications')&&home.includes('activeWorkspace.routes.map'),'historical route reachability must remain complete while organization improves');
must(home.includes('OMEGA_FIELD_PROJECTIONS_R82.map')&&home.includes('projection={lens.projection}')&&home.includes('view={lens.view}'),'projection controls must still bind real canonical geometry/data views');

must(nav.includes('organizationForRouteR132')&&nav.includes('organizedRoutesR132(filtered)'),'navigator must order the complete registry by presentation priority');
must(nav.includes("placeholder='Search registered OMEGA destinations'")&&nav.includes('OMEGA_ALL_ROUTES_R82.indexOf(route)+1'),'search and canonical inventory identity must survive organization');
must(nav.includes("data-tier={org.tier}")&&nav.includes('org.layout.replaceAll'),'route rows must expose tier and layout meaning instead of equal-weight labels');
must(nav.includes('Persistent rail')&&nav.includes('active application remains visible'),'non-covering rail and active-route continuity must remain explicit');
must(!nav.includes('.slice('),'navigator may not bury registered applications through arbitrary result slicing');

must(css.includes(".r132-home[data-r132-depth='FOCUS']")&&css.includes(".r132-home[data-r132-depth='DEEP']"),'focus/deep presentation laws missing');
must(css.includes('@media(max-width:980px)')&&css.includes('@media(max-width:720px)'),'R132 must have explicit tablet/mobile organization laws');
must(css.includes('.r132-home .r96-inspector{order:2}')&&css.includes('.r132-home .r96-command-dock{grid-template-columns:1fr}'),'mobile must place controls below the visual field and remove desktop column pressure');
must(!css.match(/\.r132-inspector[^\n]*position:fixed/),'inspector may not become a covering fixed overlay');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(routes.length===44&&new Set(routes).size===44,'R132 presentation pass must not lose or duplicate the established 44-route registry');
console.log('R132 WHOLE-SYSTEM EXPERIENCE PASS · one visual-first instrument · primary/support/expert priority · focus/deep density · complete 44-route reachability · non-covering responsive controls');
