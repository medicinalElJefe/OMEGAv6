import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R91 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const css=read('src/operationalSurfaceRefinementR91.css');
const r90=read('src/surfaceHierarchyR90.css');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const workspace=read('src/OmegaWorkspaceCockpitR18.tsx');
const governance=read('src/OmegaGovernanceProjectMediaR29.tsx');
const system=read('src/OmegaSystemConsolidationR30.tsx');
const command=read('src/OmegaCommandDeck.tsx');
const evidence=read('src/OmegaEvidenceMemoryR28.tsx');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical surface universe must remain 44/44');
must(workstation.includes("import './operationalSurfaceRefinementR91.css';"),'R91 stylesheet must be mounted');
must(workstation.indexOf('operationalSurfaceRefinementR91.css')>workstation.indexOf('surfaceHierarchyR90.css'),'R91 presentation authority must load after R90');
must(nav.includes("className='r89-flat-scroll'")&&nav.includes('rows.map(route=>'),'flat global navigator must remain intact');

for(const panel of ['Command Center','Workspace','Cockpit','Projects','Governance','Assets','Render Queue','Canon Evolution','Instructions','Settings','System','Consolidation','Memory','Create','Development'])
 must(css.includes("data-panel='"+panel+"'"),'missing operational refinement for '+panel);

must(css.includes(".command-visual{\n  min-height:48dvh!important")||css.includes(".command-visual{\n  min-height:48dvh!important"),'Command Center mobile field must remain primary');
must(css.includes(".command-proof-strip{\n  display:flex!important"),'Command proof must remain visible and compact, not deleted');
must(css.includes(".r18-workspace-actions{\n  display:flex!important"),'Workspace continuation routes must remain directly reachable');
must(css.includes(".r18-cockpit-columns{\n  display:flex!important"),'Cockpit proof/capability columns must stay reachable without a vertical wall');
must(css.includes(".r29-gates{\n  display:flex!important"),'Governance gates must remain fully visible and swipeable');
must(css.includes(".r29-render-preview{\n  min-height:58dvh!important"),'Render Queue preview must retain dominant visual space');
must(css.includes(".r30-setting-grid,")&&css.includes(".r30-system-checks{\n  display:flex!important"),'Settings/System mobile cards must remain directly reachable');
must(css.includes(".create-paths{\n  display:flex!important"),'Create route choices must remain directly reachable on phone');

must(!css.includes('.special-boundary{display:none')&&!css.includes('.command-proof-strip{display:none')&&!css.includes('.r29-gates{display:none'),'R91 may not hide proof/truth structures');
must(css.includes(".special-boundary,.earth-proof,.sai-footer,.sbm21-expression-boundary")&&css.includes('visibility:visible!important'),'R91 must explicitly preserve truth-boundary visibility');
must(command.includes('Forecast, hosted execution, device proof and external observations remain separately labeled'),'Command truth separation must remain');
must(workspace.includes('A clickable control is never treated as proof of capability'),'Cockpit capability/proof separation must remain');
must(governance.includes('It cannot create missing Drive, native-device, or external evidence authority'),'Governance evidence authority boundary must remain');
must(system.includes('They do not change canon, provider credentials, deployment state, or native host configuration'),'Settings mutation boundary must remain');
must(evidence.includes('Missing Drive, native-device, provider, or external authority remains HOLD'),'Evidence HOLD boundary must remain');
must(r90.includes('presentation-only hierarchy'),'R90 integrity layer must remain mounted beneath R91');
must(!css.includes('@appdeploy/client'),'R91 must remain provider portable');
console.log('R91 OPERATIONAL SURFACE REFINEMENT PASS · 44 routes · operational hierarchy aligned · proof and truth boundaries preserved');
