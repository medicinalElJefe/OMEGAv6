import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R104 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const integrity=read('src/SurfaceIntegrityR81.tsx');
const layers=read('src/surfaceLayerContractR104.ts');
const provenance=read('src/surfaceProvenanceR94.ts');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const navBase=read('src/omegaSideNavigatorR88.css');
const nav100=read('src/omegaSideNavigatorR100.css');
const css=read('src/extremeLayerIntegrityR104.css');
const stage=read('src/TraversalModeStageR100.tsx');
const stageMap=read('src/traversalModeDesignR99.ts');
const studio=read('src/OmegaTraversalStudio.tsx');
const membrane=read('src/CanonicalMembraneR95.tsx');
const membraneCss=read('src/canonicalMembraneR95.css');
const accepted=read('src/acceptedProductionContractR95.ts');
const hybrid=read('src/HybridLinkR32.tsx');
const worker101=read('src/workerR101.js');
const agent=read('public/omega-hybrid-agent.py');
const earth=read('src/EarthObservatoryR8.tsx');
const federation=read('src/FederationRunR97.tsx');
const worker102=read('src/workerR102.js');
const router=read('src/federation/federationIntentRouterR103.js');
const projects=read('src/omegaProjectContinuityR87.ts');
const operations=read('src/omegaOperationBusR86.ts');
const packageJson=JSON.parse(read('package.json'));

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'44 canonical application routes must remain unique and reachable');

// Eight-layer architecture: every route must be explicitly bound and every architectural layer used.
const layerSurfaceNames=[...layers.matchAll(/B\('([^']+)'/g)].map(x=>x[1]);
must(layerSurfaceNames.length===44&&new Set(layerSurfaceNames).size===44,'eight-layer contract must contain exactly 44 unique routed surfaces');
for(const surface of surfaces)must(layerSurfaceNames.includes(surface),'layer contract missing surface '+surface);
for(const layer of ['STATE','INTELLIGENCE','MEMORY','RELATION','COMPUTATION','ACTION','OBSERVATION','PROOF'])must(layers.includes(`'${layer}'`),'architectural layer missing '+layer);
must(layers.includes('surfaceLayerAuditR104')&&layers.includes('pass:names.length===44'),'layer registry must expose a deterministic audit');
must(integrity.includes("surfaceLayerBindingR104(panel)")&&integrity.includes("data-layer-primary={layer.primary}")&&integrity.includes("data-layer-bindings={layer.layers.join(' ')}")&&integrity.includes("data-layer-contract='R104'"),'every active surface must receive its R104 layer contract');
must(workstation.includes("<SurfaceIntegrityR81 panel={panel} record={record} onRecover={()=>go('System')}>{content}</SurfaceIntegrityR81>"),'all active routed content must remain inside the integrity wrapper');

// Provenance and truth ownership must remain complete and aligned with the 44 routes.
const provenanceNames=[...provenance.matchAll(/P\('([^']+)'/g)].map(x=>x[1]).filter(x=>surfaces.includes(x));
must(new Set(provenanceNames).size===44,'R94 provenance must still cover all 44 routed surfaces');
must(provenance.includes("representationalPrimary.length===0")&&provenance.includes("missingProof.length===0"),'provenance audit must still reject representational truth owners and missing proof boundaries');

// Navigation: readable expanded panel, preserved 44-route flat list, and non-covering layout reservation.
must(nav.includes("r100-professional-nav r104-readable-nav")&&nav.includes('r104-nav-panel'),'R104 readable navigator classes must be active');
must(nav.includes('OMEGA_ALL_ROUTES_R82.filter')&&nav.includes('rows.map(route=>'),'all 44 routes must remain flat/searchable, not hidden behind workspace compartments');
must(nav.includes('<em>{workspace.copy}</em>')&&nav.includes('<small>{currentWorkspace.copy}</small>'),'expanded navigation must explain routes and the active instrument instead of showing tiny labels only');
must(nav.includes("setExpanded(false);setQuery('')"),'destination selection must collapse navigation back to the slim rail');
must(!nav.includes('r88-navigator-backdrop')&&!nav.includes("document.body.style.overflow='hidden'"),'global navigation may not regress to a covering modal/body lock');
const i100=nav.indexOf("import './omegaSideNavigatorR100.css';"),i104=nav.indexOf("import './extremeLayerIntegrityR104.css';");
must(i100>=0&&i104>i100,'R104 containment/readability CSS must load after R100');
must(!nav100.includes("@import './extremeLayerIntegrityR104.css'"),'R104 must not load before R100 through CSS @import');
must(css.includes('--r94-nav-panel:clamp(400px,31vw,448px)'),'desktop expanded navigator must be materially readable');
must(css.includes('--r94-nav-panel:min(64vw,340px)')&&css.includes('--r94-nav-panel:min(68vw,300px)'),'mobile expanded navigator must remain readable without becoming full-screen');
must(css.includes('.r104-route>span>b{font-size:12.5px!important')&&css.includes('.r104-route>span>em'),'expanded route name and explanatory copy must be readable');
must(navBase.includes("html[data-omega-nav-expanded='true'] :where(.omega-workstation-v2,.r71-home)")&&navBase.includes('margin-left:calc(var(--r94-nav-rail) + var(--r94-nav-panel))!important'),'expanded navigation must reserve application width instead of covering it');

// Visual stage occlusion: known passive HUD/inspector layers are forbidden inside active visual stages.
for(const token of ['.traversal-hud','.calculus-hud','.mt-hud','.mt-motion','.motion-readout','.visual-equation','.cfr37-operator-key','.mer82-badge'])must(css.includes(token),'R104 no-occlusion selector missing '+token);
must(css.includes('>:where(\n .traversal-hud')&&css.includes('display:none!important'),'known direct stage HUDs must be suppressed inside visual-first stages');
must(css.includes(">aside{display:none!important}"),'direct stage asides must not cover visual-first instruments');
for(const selector of ['.r99-stage','.r95-membrane-stage','.mt-stage','.visual-stage','.atlas-r36-stage','.earth-now-stage'])must(css.includes(selector),'primary stage containment missing '+selector);
must(css.includes('min-height:clamp(620px,72dvh,940px)')&&css.includes('min-height:72dvh!important'),'desktop/mobile high-detail stage ownership must remain explicit');

// Canonical membrane R98 no-occlusion behavior remains intact.
must(!membrane.includes("<aside>\n    <div><span>PREVIOUS"),'canonical membrane telemetry may not re-enter the canvas stage');
must(membrane.includes("<details className='r98-membrane-data'>")&&membraneCss.includes('.r98-membrane-data-grid'),'canonical membrane data must remain reachable as progressive disclosure');
must(!membraneCss.includes('.r95-membrane-stage aside{'),'membrane CSS may not restore a blocking overlay');

// Mode/function correlation: eight modes must have declared mappings and visibly distinct source-driven branches.
for(const mode of ['UNIFIED','SHELL','WATER','LIGHT','SCAR','RELATIVITY','FORECAST','PROOF']){
 must(stage.includes(`'${mode}'`),'active traversal stage missing mode '+mode);
 must(stageMap.includes(`${mode}:`)||stageMap.includes(`case'${mode}'`)||stageMap.includes(`case '${mode}'`),'mode design registry missing '+mode);
}
for(const branch of ["if(mode==='SHELL'||mode==='UNIFIED')","if(mode==='WATER')","if(mode==='LIGHT')","if(mode==='RELATIVITY')","if(mode==='FORECAST')","if(mode==='SCAR')","if(mode==='PROOF')"])must(stage.includes(branch),'distinct source-driven visual branch missing '+branch);
must(stage.includes('compileSourceTraversal(address,routeDepth)')&&stage.includes('deriveWeaveStateR100')&&stage.includes('applyWovenContinuityR100'),'mode display must remain tied to canonical route + Woven Continuity computation');
must(stage.includes('ATLAS_RESOLUTION_LEVELS_R101.forEach')&&stage.includes('weaveStatic.effectiveResolution'),'weave-derived resolution depiction must remain active');
must(!stage.includes('Math.random'),'primary mode geometry may not use random/fake state');
must(studio.includes("r99-support-layer")&&studio.includes("r99-donor-layer")&&studio.includes('<CalculusTraversal '),'deep historical renderer/proof/motion layers must remain reachable but progressive');

// Hybrid: repaired canonical transport and current authenticated heartbeat boundary must remain intact.
must(hybrid.includes('/api/hybrid/agent-download?r94=1')&&hybrid.includes('/omega-hybrid-agent.py'),'Hybrid must retain validated canonical and direct compatibility download paths');
must(worker101.includes("path==='/api/hybrid/status'")&&worker101.includes('bridgeId(request)'),'Hybrid status must remain bridge-identity aware');
must(worker101.includes("state:online.length?'VERIFIED_DEVICE_ONLINE'")&&worker101.includes('nativeExecutionClaimed:online.length>0'),'native execution must require current authenticated heartbeat proof');
must(agent.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'")&&agent.includes('/api/hybrid/agent/heartbeat'),'PC agent must remain canonical and heartbeat-driven');

// Earth observation, workflow/project continuity and operation proof must remain separate and functional.
must(earth.includes("'/api/earth/noaa/catalog'")&&earth.includes('/api/earth/evidence?lat=')&&earth.includes('evidenceHash'),'Earth must remain bound to returned evidence + evidence hash');
must(projects.includes('syncProjectContinuityR97')||projects.includes('syncProjectContinuity'),'project continuity implementation must remain present');
must(operations.includes('emitOperationR86')&&operations.includes('receipt'),'operation proof bus must remain receipt-bearing');

// Federation/task-first R102/R103 lineage must not be lost by design work.
must(worker102.includes("import r101,{OmegaRuntime as OmegaRuntimeR101} from './workerR101.js'")&&worker102.includes('planIntentR103'),'R102 Worker must still extend R101 and expose R103 intent planning');
must(router.includes("schema:'OMEGA_FEDERATION_INTENT_PLAN_R103'")&&router.includes('requiredNodes')&&router.includes('optionalNodes'),'R103 task router must retain required/optional capability planning');
must(federation.includes('CURRENT HANDOFF')&&federation.includes('NEXT USEFUL ACTION'),'task-first federation UI must remain operationally explicit');

// Persistent product governance: R103 and R104 become protected history, not temporary styling.
for(const rule of ['FULL_LAYER_FUNCTIONAL_CORRELATION','READABLE_NON_COVERING_NAVIGATION','MODE_VISUAL_FUNCTION_CORRELATION','NO_VISUAL_STAGE_OCCLUSION','NO_FAKE_CONTROL'])must(accepted.includes("id:'"+rule+"'"),'accepted production contract missing '+rule);
must(accepted.includes("'R103 task-first capability router + truthful performance partition authority'")&&accepted.includes("'R104 eight-layer functional correlation + readable non-covering navigation authority'"),'R104 must explicitly preserve R103 and itself');

must(packageJson.scripts['test:r104']==='node tests/r104-extreme-layer-integrity-invariants.mjs','R104 script missing');
must(packageJson.scripts['check:static'].includes('npm run test:r104'),'R104 gate must be part of the full static release check');
must(![layers,integrity,nav,css,stage,hybrid,worker101,worker102,router].join('\n').includes('@appdeploy/client'),'R104 must remain provider portable');

console.log('R104 EXTREME LAYER INTEGRITY PASS · 44 routes · 8-layer correlation · 44 provenance contracts · mode/function accuracy · R98 no-occlusion · readable reserved-space navigator · Hybrid/Earth/federation/project/proof continuity preserved');
