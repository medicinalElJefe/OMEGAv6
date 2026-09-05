import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R104 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const integrity=read('src/SurfaceIntegrityR81.tsx');
const layerRegistry=read('src/surfaceLayerContractR104.ts');
const provenanceRegistry=read('src/surfaceProvenanceR94.ts');
const provenanceUi=read('src/SurfaceProvenanceR94.tsx');
const provenanceCss=read('src/surfaceProvenanceR94.css');
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
const routeBlocks=[...registry.matchAll(/routes:\[([^\]]*)\]/g)].map(x=>x[1]);
const registeredRoutes=routeBlocks.flatMap(block=>[...block.matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(surfaces.length>0&&new Set(surfaces).size===surfaces.length,'canonical application routes must remain unique and reachable');
must(new Set(registeredRoutes).size===registeredRoutes.length&&registeredRoutes.length===surfaces.length,'workstation mounts and dynamic experience registry must cover the same route inventory');
for(const route of surfaces)must(registeredRoutes.includes(route),'experience registry missing mounted route '+route);

// STATE + INTELLIGENCE + MEMORY + RELATION + COMPUTATION + ACTION + OBSERVATION + PROOF.
const layerSurfaces=[...layerRegistry.matchAll(/B\('([^']+)'/g)].map(x=>x[1]);
must(layerSurfaces.length===surfaces.length&&new Set(layerSurfaces).size===surfaces.length,'layer contract must contain exactly one binding for each registered surface');
for(const surface of surfaces)must(layerSurfaces.includes(surface),'layer contract missing '+surface);
for(const layer of ['STATE','INTELLIGENCE','MEMORY','RELATION','COMPUTATION','ACTION','OBSERVATION','PROOF'])must(layerRegistry.includes(`'${layer}'`),'architecture missing '+layer);
must(layerRegistry.includes('surfaceLayerAuditR104')&&layerRegistry.includes('missingBindings')&&layerRegistry.includes('orphanBindings')&&layerRegistry.includes('registeredRoutes:registered.length'),'layer registry must expose deterministic dynamic coverage audit');
must(!layerRegistry.includes('pass:names.length===44'),'layer architecture may not be frozen to the historical route count');
must(integrity.includes('surfaceLayerBindingR104(panel)')&&integrity.includes('data-layer-primary={layer.primary}')&&integrity.includes("data-layer-contract='R104/R107'"),'active routed wrapper must carry R104/R107 layer contract');
const legacyIntegrity=workstation.includes("<SurfaceIntegrityR81 panel={panel} record={record} onRecover={()=>go('System')}>{content}</SurfaceIntegrityR81>");
const r109Integrity=workstation.includes("<SurfaceIntegrityR81 panel={panel} record={record} onRecover={()=>go('System')}>")&&workstation.includes('<Suspense fallback={<SpecialistLoadingR109')&&workstation.includes('{content}</Suspense></SurfaceIntegrityR81>');
must(legacyIntegrity||r109Integrity,'all routed content must stay inside integrity wrapper; R109 Suspense may be nested inside but never outside it');

// Surface provenance and user-inspectable layer correctness, progressive rather than blocking.
const provenanceNames=[...provenanceRegistry.matchAll(/P\('([^']+)'/g)].map(x=>x[1]).filter(x=>surfaces.includes(x));
must(new Set(provenanceNames).size===surfaces.length,'R94 provenance must cover every routed surface');
must(provenanceRegistry.includes('representationalPrimary.length===0')&&provenanceRegistry.includes('missingProof.length===0'),'provenance audit must reject representational truth owners and missing proof');
must(provenanceUi.includes('surfaceLayerBindingR104(surface)')&&provenanceUi.includes("className='r104-layer-contract'"),'opened provenance must expose the actual R104 layer contract');
must(provenanceCss.includes('.r104-layer-contract')&&provenanceCss.includes(".r94-provenance:not([open])>summary{min-height:30px"),'layer/provenance audit must stay progressive and compact while closed');

// Readable, flat, reserved-space global navigation.
must(nav.includes('r100-professional-nav r104-readable-nav')&&nav.includes('r104-nav-panel'),'R104 readable navigator classes must be active');
must(nav.includes('OMEGA_ALL_ROUTES_R82.filter')&&nav.includes('rows.map(route=>')&&!nav.includes('rows.slice('),'all registered routes must remain one flat searchable list');
must(nav.includes('<em>{workspace.copy}</em>')&&nav.includes('<small>{currentWorkspace.copy}</small>'),'expanded navigator must explain destination and active instrument');
must(nav.includes("setExpanded(false);setQuery('')"),'destination selection must collapse back to slim rail');
must(!nav.includes('r88-navigator-backdrop')&&!nav.includes("document.body.style.overflow='hidden'"),'navigator must not regress to covering modal/body lock');
const i100=nav.indexOf("import './omegaSideNavigatorR100.css';"),i104=nav.indexOf("import './extremeLayerIntegrityR104.css';");
must(i100>=0&&i104>i100,'R104 CSS must load after R100');
must(!nav100.includes("@import './extremeLayerIntegrityR104.css'"),'R104 may not be loaded before R100');
must(css.includes('--r94-nav-panel:clamp(400px,31vw,448px)'),'desktop expanded navigator must be materially readable');
must(css.includes('--r94-nav-panel:min(64vw,340px)')&&css.includes('--r94-nav-panel:min(68vw,300px)'),'phone navigator must be readable while still using reserved space');
must(css.includes('.r104-route>span>b{font-size:12.5px!important')&&css.includes('.r104-route>span>em'),'route names and descriptions must have readable expanded styling');
must(navBase.includes("html[data-omega-nav-expanded='true'] :where(.omega-workstation-v2,.r71-home)")&&navBase.includes('margin-left:calc(var(--r94-nav-rail) + var(--r94-nav-panel))!important'),'expanded navigation must reserve width instead of covering app');

// Visual-stage ownership: supporting HUD/inspector chrome cannot cover primary instruments.
for(const token of ['.traversal-hud','.calculus-hud','.mt-hud','.mt-motion','.motion-readout','.visual-equation','.cfr37-operator-key','.mer82-badge'])must(css.includes(token),'no-occlusion coverage missing '+token);
must(css.includes('>:where(\n .traversal-hud')&&css.includes('display:none!important'),'known direct stage HUDs must be suppressed');
must(css.includes('>aside{display:none!important}'),'direct stage asides must not cover visual-first instruments');
for(const selector of ['.r99-stage','.r95-membrane-stage','.mt-stage','.visual-stage','.atlas-r36-stage','.earth-now-stage'])must(css.includes(selector),'stage containment missing '+selector);
must(css.includes('min-height:clamp(620px,72dvh,940px)')&&css.includes('min-height:72dvh!important'),'desktop/mobile stage must own meaningful viewport');
must(!membrane.includes("<aside>\n    <div><span>PREVIOUS"),'canonical membrane telemetry may not re-enter canvas stage');
must(membrane.includes("<details className='r98-membrane-data'>")&&membraneCss.includes('.r98-membrane-data-grid'),'canonical membrane data must stay reachable outside stage');
must(!membraneCss.includes('.r95-membrane-stage aside{'),'membrane CSS may not restore blocking overlay');

// Eight selectable design depictions must remain source-driven and actually distinct.
for(const mode of ['UNIFIED','SHELL','WATER','LIGHT','SCAR','RELATIVITY','FORECAST','PROOF']){
 must(stage.includes(`'${mode}'`),'active stage missing '+mode);
 must(stageMap.includes(`${mode}:`)||stageMap.includes(`case'${mode}'`)||stageMap.includes(`case '${mode}'`),'design registry missing '+mode);
}
for(const branch of ["if(mode==='SHELL'||mode==='UNIFIED')","if(mode==='WATER')","if(mode==='LIGHT')","if(mode==='RELATIVITY')","if(mode==='FORECAST')","if(mode==='SCAR')","if(mode==='PROOF')"])must(stage.includes(branch),'distinct visual branch missing '+branch);
must(stage.includes('compileSourceTraversal(address,routeDepth)')&&stage.includes('deriveWeaveStateR100')&&stage.includes('applyWovenContinuityR100'),'mode display must bind canonical route + Woven Continuity');
must(stage.includes('ATLAS_RESOLUTION_LEVELS_R101.forEach')&&stage.includes('weaveStatic.effectiveResolution'),'weave-derived representational resolution must remain active');
must(!stage.includes('Math.random'),'primary mode geometry may not use random/fake state');
must(studio.includes('r99-support-layer')&&studio.includes('r99-donor-layer')&&studio.includes('<CalculusTraversal '),'deep donor renderer/proof/motion layers must remain recoverable as progressive layers');

// Hybrid must remain canonical, bridge-aware, heartbeat-proven, and non-fictional.
must(hybrid.includes('/api/hybrid/agent-download?r94=1')&&hybrid.includes('/omega-hybrid-agent.py'),'Hybrid must retain validated canonical + compatibility download paths');
must(worker101.includes("path==='/api/hybrid/status'")&&worker101.includes('bridgeId(request)'),'Hybrid status must remain bridge-identity aware');
must(worker101.includes("state:online.length?'VERIFIED_DEVICE_ONLINE'")&&worker101.includes('nativeExecutionClaimed:online.length>0'),'native execution must require current authenticated heartbeat');
must(agent.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'")&&agent.includes('/api/hybrid/agent/heartbeat'),'PC agent must remain canonical and heartbeat-driven');

// Observation, memory, action and proof must remain semantically separate and connected.
must(earth.includes("'/api/earth/noaa/catalog'")&&earth.includes('/api/earth/evidence?lat=')&&earth.includes('evidenceHash'),'Earth must remain returned-evidence + hash bound');
must(projects.includes('syncProjectContinuityR97')||projects.includes('syncProjectContinuity'),'project continuity implementation must remain present');
must(operations.includes("schema:'OMEGA_OPERATION_EVENT_R86'")&&operations.includes('sha256:string')&&operations.includes("crypto.subtle.digest('SHA-256'")&&operations.includes('truthBoundary:'),'operation proof bus must remain hashed and truth-bounded');
must(operations.includes('PROOF_RECEIPT_EXPORTED')&&operations.includes('readOperationLedgerR86'),'proof receipt operation and bounded ledger must remain available');

// R102/R103 task-first federation must survive UI work.
must(worker102.includes("import r101,{OmegaRuntime as OmegaRuntimeR101} from './workerR101.js'")&&worker102.includes('planIntentR103'),'R102 worker must extend R101 and expose R103 planning');
must(router.includes("schema:'OMEGA_FEDERATION_INTENT_PLAN_R103'")&&router.includes('requiredNodes')&&router.includes('optionalNodes'),'R103 task router must retain required/optional capability planning');
must(federation.includes('CURRENT HANDOFF')&&federation.includes('NEXT USEFUL ACTION'),'task-first federation UI must remain explicit');

// Persist this as product law, not temporary CSS.
for(const rule of ['FULL_LAYER_FUNCTIONAL_CORRELATION','READABLE_NON_COVERING_NAVIGATION','MODE_VISUAL_FUNCTION_CORRELATION','NO_VISUAL_STAGE_OCCLUSION','NO_FAKE_CONTROL'])must(accepted.includes("id:'"+rule+"'"),'accepted contract missing '+rule);
must(accepted.includes("'R103 task-first capability router + truthful performance partition authority'")&&accepted.includes("'R104 eight-layer functional correlation + readable non-covering navigation authority'"),'R104 must preserve R103 and itself');
must(packageJson.scripts['test:r104']==='node tests/r104-extreme-layer-integrity-invariants.mjs','R104 script missing');
must(packageJson.scripts['check:static'].includes('npm run test:r104'),'R104 must run inside full static release check');
must(![layerRegistry,integrity,nav,css,stage,hybrid,worker101,worker102,router].join('\n').includes('@appdeploy/client'),'R104 must remain provider portable');

console.log(`R104/R109 EXTREME LAYER INTEGRITY PASS · ${surfaces.length} current registered destinations · 8-layer correlation · full provenance coverage · 8 distinct source-driven modes · R98 no-occlusion · readable reserved-space navigator · deferred content remains inside SurfaceIntegrity · Hybrid/Earth/project/operation/federation truth preserved`);
